import { serverSupabaseServiceRole } from '#supabase/server';
import { requestSchema } from '~/lib/forms/requestSchema';
import { sendInquiryNotification } from '~/server/utils/email';

// POST /api/inquiries
// Reçoit le payload du tronc /request, valide via zod, persiste en Supabase
// service-role, log un email stub. Aucune RLS contournee : l'insert public est
// fait uniquement par le service-role cote serveur (RLS bloque l'anon).

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid request payload',
      data: { issues: parsed.error.issues },
    });
  }

  // Honeypot : si rempli, on accepte silencieusement sans persister.
  if (parsed.data.honeypot) {
    return { ok: true, id: null };
  }

  const config = useRuntimeConfig();
  const supabase = serverSupabaseServiceRole(event);

  // On denormalise un sous-ensemble pour filtrage rapide en /admin/inquiries.
  const row = {
    name: `${parsed.data.contact.firstName} ${parsed.data.contact.lastName}`.trim(),
    email: parsed.data.contact.email,
    service: parsed.data.service,
    destination: parsed.data.destination ?? null,
    status: 'new',
    payload: parsed.data,
  };

  const { data, error } = await supabase
    .from('inquiries')
    .insert(row)
    .select('id')
    .single();

  if (error) {
    console.error('[inquiries] Supabase insert failed:', error);
    throw createError({ statusCode: 500, statusMessage: 'Could not save the request.' });
  }

  // Notification email equipe via Resend. Isole en try/catch : si Resend
  // est down ou mal configure, l'insert Supabase reste valide (la donnee
  // est sauvee, l'equipe peut consulter /admin/inquiries).
  try {
    await sendInquiryNotification(
      {
        id: data.id,
        service: parsed.data.service,
        destination: parsed.data.destination ?? null,
        contact: {
          firstName: parsed.data.contact.firstName,
          lastName: parsed.data.contact.lastName,
          email: parsed.data.contact.email,
          phone: parsed.data.contact.phone,
        },
        notes: parsed.data.contact.message || (parsed.data as any).notes,
        scenarioId: (parsed.data as any).scenarioId,
        payload: parsed.data,
      },
      {
        apiKey: (config as any).resendApiKey || '',
        from: (config as any).misanaInquiriesFrom || '',
        to: config.misanaInquiriesTo || '',
        siteUrl: (config.public as any).siteUrl || 'https://misana-group.com',
      },
    );
    console.info(`[inquiries] notification sent for ${data.id}`);
  } catch (e) {
    console.error(`[inquiries] notification failed for ${data.id}:`, e);
  }

  return { ok: true, id: data.id };
});

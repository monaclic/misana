import { serverSupabaseServiceRole } from '#supabase/server';
import { requestSchema } from '~/lib/forms/requestSchema';

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

  // Email stub V1. V2 : Resend templates par service.
  if (config.misanaInquiriesTo) {
    console.info(
      `[inquiries] new inquiry ${data.id} → notify ${config.misanaInquiriesTo} (service=${parsed.data.service}, destination=${parsed.data.destination ?? 'n/a'})`,
    );
  } else {
    console.info(`[inquiries] new inquiry ${data.id} (no notify recipient configured)`);
  }

  return { ok: true, id: data.id };
});

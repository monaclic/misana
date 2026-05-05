import { requestSchema } from '~/lib/forms/requestSchema';
import { sendInquiryNotification } from '~/server/utils/email';

// POST /api/inquiries
// Reçoit le payload du tronc /request, valide via zod, envoie un email
// a l'equipe via Resend. V1 sans persistance : la boite mail equipe
// (NUXT_MISANA_INQUIRIES_TO) est la source de verite.

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

  // Honeypot : on accepte silencieusement sans envoyer.
  if (parsed.data.honeypot) {
    return { ok: true, id: null };
  }

  const id = (globalThis as any).crypto?.randomUUID?.() ?? null;
  const config = useRuntimeConfig();

  try {
    await sendInquiryNotification(
      {
        id,
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
  } catch (e: any) {
    console.error('[inquiries] Resend send failed:', e);
    throw createError({
      statusCode: 502,
      statusMessage: 'Could not send the request. Please retry or write us directly.',
    });
  }

  return { ok: true, id };
});

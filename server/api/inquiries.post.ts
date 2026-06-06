import { requestSchema } from '~/lib/forms/requestSchema';
import { sendInquiryNotification, sendClientAcknowledgement } from '~/server/utils/email';
import { rateLimit } from '~/server/utils/rateLimit';

// POST /api/inquiries
// Reçoit le payload du tronc /request, valide via zod, envoie un email
// a l'equipe via Resend. V1 sans persistance : la boite mail equipe
// (NUXT_MISANA_INQUIRIES_TO) est la source de verite.

function fakeId() {
  return (globalThis as any).crypto?.randomUUID?.() ?? null;
}

export default defineEventHandler(async (event) => {
  // Rate limit : 5 req / min / IP. Anti-spam.
  rateLimit(event, { windowMs: 60_000, maxRequests: 5 });

  const body = await readBody(event);

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    // Ne pas exposer les issues zod (info disclosure).
    // On loggue cote serveur pour debug.
    console.warn('[inquiries] zod validation failed');
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid request payload',
    });
  }

  // Honeypot : on accepte silencieusement avec un faux UUID pour ne
  // pas signaler au bot que la requete a ete bloquee.
  if (parsed.data.honeypot) {
    return { ok: true, id: fakeId() };
  }

  const id = fakeId();
  const config = useRuntimeConfig();

  const inquiry = {
    id,
    service: parsed.data.service,
    destination: parsed.data.destination ?? null,
    contact: {
      firstName: parsed.data.contact.firstName,
      lastName: parsed.data.contact.lastName,
      email: parsed.data.contact.email,
      phone: parsed.data.contact.phone,
      phoneCode: parsed.data.contact.phoneCode,
      preferredChannel: parsed.data.contact.preferredChannel,
      replyLang: parsed.data.contact.replyLang,
    },
    notes: parsed.data.contact.message || (parsed.data as any).notes,
    scenarioId: (parsed.data as any).scenarioId,
    payload: parsed.data,
  };
  const emailOpts = {
    apiKey: (config as any).resendApiKey || '',
    from: (config as any).misanaInquiriesFrom || '',
    to: config.misanaInquiriesTo || '',
    siteUrl: (config.public as any).siteUrl || 'https://misana-group.com',
  };

  try {
    await sendInquiryNotification(inquiry, emailOpts);
  } catch (e: any) {
    // Ne logger que le message, jamais l'objet complet (peut contenir headers/keys).
    console.error('[inquiries] Resend send failed:', e?.message || 'unknown error');
    throw createError({
      statusCode: 502,
      statusMessage: 'Could not send the request. Please retry or write us directly.',
    });
  }

  // Accuse de reception au client (best-effort, n'echoue jamais la demande).
  await sendClientAcknowledgement(inquiry, emailOpts);

  return { ok: true, id };
});

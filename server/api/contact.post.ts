import { z } from 'zod';
import { sendInquiryNotification, sendClientAcknowledgement } from '~/server/utils/email';
import { rateLimit } from '~/server/utils/rateLimit';

// POST /api/contact
// Form contact light : validation zod + envoi email a l'equipe via Resend.
// V1 sans persistance : la boite mail equipe (NUXT_MISANA_INQUIRIES_TO) est
// la source de verite. Pas de Supabase, pas d'admin dashboard pour V1.

function fakeId() {
  return (globalThis as any).crypto?.randomUUID?.() ?? null;
}

const contactSchema = z.object({
  subject: z.enum([
    'request',
    'chauffeur',
    'cars',
    'yacht',
    'helicopter',
    'access',
    'partners',
    'careers',
    'feedback',
    'press',
    'other',
  ]),
  message: z.string().min(10).max(4000),
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  email: z.string().email(),
  phone: z.string().min(4).max(40).optional().or(z.literal('')),
  consent: z.literal(true),
  locale: z.enum(['fr', 'en']).optional(),
  honeypot: z.string().optional(),
});

export default defineEventHandler(async (event) => {
  // Rate limit : 5 req / min / IP. Anti-spam.
  rateLimit(event, { windowMs: 60_000, maxRequests: 5 });

  const body = await readBody(event);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    console.warn('[contact] zod validation failed');
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid contact payload',
    });
  }

  // Honeypot : reponse identique avec faux UUID pour ne pas signaler au
  // bot que la requete a ete bloquee.
  if (parsed.data.honeypot) {
    return { ok: true, id: fakeId() };
  }

  const id = fakeId();
  const config = useRuntimeConfig();

  const inquiry = {
    id,
    service: `contact:${parsed.data.subject}`,
    contact: {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      email: parsed.data.email,
      phone: parsed.data.phone || undefined,
      // replyLang sert a choisir la langue de l'accuse de reception client.
      replyLang: parsed.data.locale,
    },
    notes: parsed.data.message,
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
    console.error('[contact] Resend send failed:', e?.message || 'unknown error');
    throw createError({
      statusCode: 502,
      statusMessage: 'Could not send the message. Please retry or write us directly.',
    });
  }

  // Accuse de reception au client (best-effort, n'echoue jamais la demande).
  await sendClientAcknowledgement(inquiry, emailOpts);

  return { ok: true, id };
});

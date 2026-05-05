import { z } from 'zod';
import { sendInquiryNotification } from '~/server/utils/email';

// POST /api/contact
// Form contact light : validation zod + envoi email a l'equipe via Resend.
// V1 sans persistance : la boite mail equipe (NUXT_MISANA_INQUIRIES_TO) est
// la source de verite. Pas de Supabase, pas d'admin dashboard pour V1.

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
  honeypot: z.string().optional(),
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid contact payload',
      data: { issues: parsed.error.issues },
    });
  }

  // Honeypot : silently accept without sending.
  if (parsed.data.honeypot) {
    return { ok: true, id: null };
  }

  const id = (globalThis as any).crypto?.randomUUID?.() ?? null;
  const config = useRuntimeConfig();

  try {
    await sendInquiryNotification(
      {
        id,
        service: `contact:${parsed.data.subject}`,
        contact: {
          firstName: parsed.data.firstName,
          lastName: parsed.data.lastName,
          email: parsed.data.email,
          phone: parsed.data.phone || undefined,
        },
        notes: parsed.data.message,
      },
      {
        apiKey: (config as any).resendApiKey || '',
        from: (config as any).misanaInquiriesFrom || '',
        to: config.misanaInquiriesTo || '',
        siteUrl: (config.public as any).siteUrl || 'https://misana-group.com',
      },
    );
  } catch (e: any) {
    console.error('[contact] Resend send failed:', e);
    throw createError({
      statusCode: 502,
      statusMessage: 'Could not send the message. Please retry or write us directly.',
    });
  }

  return { ok: true, id };
});

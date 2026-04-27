import { serverSupabaseServiceRole } from '#supabase/server';
import { z } from 'zod';

// POST /api/contact
// Light contact form (page /contact). Reuses the inquiries table with a 'contact'
// service and a free-form subject + message. Validation via a small zod schema,
// honeypot bot trap, anti double-submit on the client.

const contactSchema = z.object({
  subject: z.enum(['request', 'press', 'partners', 'careers', 'other']),
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

  // Honeypot : silently accept without persisting.
  if (parsed.data.honeypot) {
    return { ok: true, id: null };
  }

  const supabase = serverSupabaseServiceRole(event);

  const row = {
    name: `${parsed.data.firstName} ${parsed.data.lastName}`.trim(),
    email: parsed.data.email,
    service: 'contact',
    destination: null,
    status: 'new',
    payload: {
      contact: {
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        email: parsed.data.email,
        phone: parsed.data.phone || '',
      },
      subject: parsed.data.subject,
      message: parsed.data.message,
    },
  };

  const { data, error } = await supabase
    .from('inquiries')
    .insert(row)
    .select('id')
    .single();

  if (error) {
    console.error('[contact] Supabase insert failed:', error);
    throw createError({ statusCode: 500, statusMessage: 'Could not save the message.' });
  }

  return { ok: true, id: data?.id ?? null };
});

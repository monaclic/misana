import { Resend } from 'resend';
import { rateLimit } from '~/server/utils/rateLimit';
import { renderAbandonEmail } from '~/server/utils/abandonEmail';

// POST /api/abandon-request
// Recoit le beacon d'abandon du tronc /request (plugin abandon-capture.client).
// Si aucun moyen de recontact (ni email ni telephone), on n'envoie rien.
// Sinon : un email a l'equipe, meme provider et memes env vars que
// /api/inquiries (Resend, resendApiKey / misanaInquiriesFrom / misanaInquiriesTo).
//
// Le rendu de l'email (HTML + texte, en clair) vit dans server/utils/abandonEmail.ts.
// Aucune persistance, aucune deduplication : si la personne soumet ensuite,
// l'equipe recoit aussi l'email de demande normale, on gere a la main.

export default defineEventHandler(async (event) => {
  // Rate limit : 5 req / min / IP. Anti-spam (l'endpoint envoie un email).
  rateLimit(event, { windowMs: 60_000, maxRequests: 5 });

  const body = await readBody(event).catch(() => ({} as any));

  const { email, phone, subject, html, text } = renderAbandonEmail({
    payload: body?.payload,
    draft: body?.draft,
    url: body?.url,
  });

  // Ni email ni telephone -> on n'envoie rien.
  if (!email && !phone) {
    return { ok: true, sent: false };
  }

  const config = useRuntimeConfig();
  const apiKey = (config as any).resendApiKey || '';
  const from = (config as any).misanaInquiriesFrom || '';
  const to = config.misanaInquiriesTo || '';
  if (!apiKey || !from || !to) {
    console.warn('[abandon] Resend non configure (apiKey/from/to). Email ignore.');
    return { ok: true, sent: false };
  }

  try {
    const client = new Resend(apiKey);
    const replyTo = email || undefined;
    const { error } = await client.emails.send({
      from,
      to,
      subject,
      html,
      text,
      ...(replyTo ? { replyTo } : {}),
    } as any);
    if (error) {
      console.error('[abandon] Resend send failed:', (error as any)?.message || error);
      return { ok: false, sent: false };
    }
  } catch (e: any) {
    console.error('[abandon] Resend send threw:', e?.message || 'unknown error');
    return { ok: false, sent: false };
  }

  return { ok: true, sent: true };
});

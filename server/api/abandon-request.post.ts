import { Resend } from 'resend';
import { rateLimit } from '~/server/utils/rateLimit';

// POST /api/abandon-request
// Recoit le beacon d'abandon du tronc /request (plugin abandon-capture.client).
// Si aucun moyen de recontact (ni email ni telephone), on n'envoie rien.
// Sinon : un email a l'equipe, meme provider et memes env vars que
// /api/inquiries (Resend, resendApiKey / misanaInquiriesFrom / misanaInquiriesTo),
// avec tout ce que la personne a rempli, en clair (HTML + texte).
//
// Aucune persistance, aucune deduplication : si la personne soumet ensuite,
// l'equipe recoit aussi l'email de demande normale, on gere a la main.

function esc(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Aplati un objet en lignes label/valeur lisibles, recursivement.
// Ignore valeurs vides, honeypot, et tableaux vides.
function flatten(
  obj: any,
  prefix = '',
  out: { label: string; value: string }[] = [],
): { label: string; value: string }[] {
  if (!obj || typeof obj !== 'object') return out;
  for (const [k, v] of Object.entries(obj)) {
    if (k === 'honeypot') continue;
    if (v === undefined || v === null || v === '') continue;
    const label = prefix ? `${prefix} · ${k}` : k;
    if (Array.isArray(v)) {
      if (v.length) {
        out.push({
          label,
          value: v.map((x) => (x && typeof x === 'object' ? JSON.stringify(x) : String(x))).join(', '),
        });
      }
    } else if (typeof v === 'object') {
      flatten(v, label, out);
    } else if (typeof v !== 'function') {
      out.push({ label, value: String(v) });
    }
  }
  return out;
}

function section(title: string, rows: [string, unknown][]): string {
  const kept = rows.filter(([, v]) => v !== undefined && v !== null && v !== '');
  if (!kept.length) return '';
  const trs = kept
    .map(
      ([l, v]) =>
        `<tr><td style="padding:4px 16px 4px 0;font-size:13px;color:#6b6b66;white-space:nowrap;vertical-align:top">${esc(l)}</td><td style="padding:4px 0;font-size:14px;color:#0b0b0b">${esc(v)}</td></tr>`,
    )
    .join('');
  return `
    <p style="margin:20px 0 8px;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#9a9a92">${esc(title)}</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%">${trs}</table>`;
}

export default defineEventHandler(async (event) => {
  // Rate limit : 5 req / min / IP. Anti-spam (l'endpoint envoie un email).
  rateLimit(event, { windowMs: 60_000, maxRequests: 5 });

  const body = await readBody(event).catch(() => ({} as any));
  const payload = body?.payload && typeof body.payload === 'object' ? body.payload : {};
  const draft = body?.draft && typeof body.draft === 'object' ? body.draft : {};
  const url = typeof body?.url === 'string' ? body.url : payload.sourceUrl || '';

  // Contact : le snapshot page fait foi, le draft sessionStorage complete.
  const contact = { ...draft, ...(payload.contact || {}) };
  const email = contact.email || '';
  const phone = contact.phone || '';

  // Definition of done : ni email ni telephone -> on n'envoie rien.
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

  const name = [contact.firstName, contact.lastName].filter(Boolean).join(' ');
  const phoneFull = [contact.phoneCode, contact.phone].filter(Boolean).join(' ');
  const message = contact.message || '';

  // Itineraire complet : on aplati l'objet service du payload (ex payload.chauffeur).
  const service = payload.service || '';
  const itineraryObj = service && payload[service] && typeof payload[service] === 'object' ? payload[service] : null;
  const itineraryRows = itineraryObj ? flatten(itineraryObj) : [];

  const subject = '⚠️ Contact non soumis — Misana Group';

  const contactHtml = section('Coordonnées', [
    ['Nom', name],
    ['Email', email],
    ['Téléphone', phoneFull],
    ['Canal préféré', contact.preferredChannel],
    ['Langue de réponse', contact.replyLang],
  ]);

  const demandeHtml = section(
    'Demande',
    [['Service', service] as [string, unknown]].concat(
      itineraryRows.map((r) => [r.label, r.value] as [string, unknown]),
    ),
  );

  const datesHtml = section('Dates / personnes (saisie)', [
    ['Date', draft.date],
    ['Date fin', draft.dateEnd],
    ['Heure', draft.time],
    ['Personnes', draft.pax],
  ]);

  const messageHtml = message
    ? `<p style="margin:20px 0 8px;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#9a9a92">Message</p>
       <p style="margin:0;font-size:14px;line-height:1.6;color:#0b0b0b;white-space:pre-wrap">${esc(message).replace(/\n/g, '<br>')}</p>`
    : '';

  const urlHtml = url
    ? `<p style="margin:24px 0 0;font-size:12px;color:#9a9a92;word-break:break-all">Contexte : <a href="${esc(url)}" style="color:#0b0b0b">${esc(url)}</a></p>`
    : '';

  const html = `<!doctype html>
<html lang="fr">
<head><meta charset="utf-8"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:#f5f4f1;font-family:-apple-system,BlinkMacSystemFont,'Inter','Helvetica Neue',Helvetica,Arial,sans-serif;color:#0b0b0b">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f4f1">
    <tr><td align="center" style="padding:40px 16px">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #e8e6e1">
        <tr><td style="padding:32px 32px 24px;border-bottom:1px solid #e8e6e1">
          <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:#b00020">Misana · Contact non soumis</p>
          <h1 style="margin:0;font-family:'Times New Roman',Times,serif;font-weight:400;font-size:30px;line-height:1.15;color:#0b0b0b">${esc(name) || 'Sans nom'}</h1>
        </td></tr>
        <tr><td style="padding:8px 32px 32px">
          ${contactHtml}
          ${demandeHtml}
          ${datesHtml}
          ${messageHtml}
          ${urlHtml}
        </td></tr>
        <tr><td style="padding:18px 32px;border-top:1px solid #e8e6e1;background:#fafaf7">
          <p style="margin:0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#9a9a92">Misana · Côte d'Azur · Demande abandonnée</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const textRows = [
    `Nom : ${name || '-'}`,
    email ? `Email : ${email}` : '',
    phoneFull ? `Téléphone : ${phoneFull}` : '',
    contact.preferredChannel ? `Canal préféré : ${contact.preferredChannel}` : '',
    contact.replyLang ? `Langue de réponse : ${contact.replyLang}` : '',
    '',
    service ? `Service : ${service}` : '',
    ...itineraryRows.map((r) => `${r.label} : ${r.value}`),
    '',
    draft.date ? `Date : ${draft.date}` : '',
    draft.dateEnd ? `Date fin : ${draft.dateEnd}` : '',
    draft.time ? `Heure : ${draft.time}` : '',
    draft.pax ? `Personnes : ${draft.pax}` : '',
    message ? `\nMessage :\n${message}` : '',
    url ? `\nContexte : ${url}` : '',
  ].filter((l) => l !== '');
  const text = ['Contact non soumis — Misana Group', '', ...textRows].join('\n');

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

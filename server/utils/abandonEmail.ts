// Rendu de l'email "Contact non soumis" (abandon du tronc /request).
// Pur : aucune dependance Nuxt ni Resend, testable en isolation.
// Miroir leger de server/utils/email.ts (email de demande normale).

type AbandonInput = { payload?: any; draft?: any; url?: string };

function esc(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Aplati un objet en lignes label/valeur lisibles, recursivement.
// - tableaux de scalaires (ex stops) -> joints par virgule
// - tableaux d'objets (ex access.items) -> recursion sur chaque element
//   (JAMAIS de JSON brut dans l'email)
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
      const scalars = v.filter((x) => x === null || typeof x !== 'object');
      const objects = v.filter((x) => x && typeof x === 'object');
      if (scalars.length) {
        out.push({ label, value: scalars.map((x) => String(x)).join(', ') });
      }
      objects.forEach((x, i) => flatten(x, objects.length > 1 ? `${label} #${i + 1}` : label, out));
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

export function renderAbandonEmail({ payload, draft, url }: AbandonInput): {
  email: string;
  phone: string;
  subject: string;
  html: string;
  text: string;
} {
  const p = payload && typeof payload === 'object' ? payload : {};
  const d = draft && typeof draft === 'object' ? draft : {};
  const ctxUrl = typeof url === 'string' && url ? url : p.sourceUrl || '';

  // Contact : le snapshot page fait foi, le draft sessionStorage complete.
  const contact = { ...d, ...(p.contact || {}) };
  const email = contact.email || '';
  const phone = contact.phone || '';

  const name = [contact.firstName, contact.lastName].filter(Boolean).join(' ');
  const phoneFull = [contact.phoneCode, contact.phone].filter(Boolean).join(' ');
  const message = contact.message || '';

  // Itineraire complet : on aplati l'objet service du payload (ex payload.chauffeur,
  // payload.access). Recursion sur access.items pour ne jamais sortir de JSON brut.
  const service = p.service || '';
  const itineraryObj = service && p[service] && typeof p[service] === 'object' ? p[service] : null;
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
    ['Date', d.date],
    ['Date fin', d.dateEnd],
    ['Heure', d.time],
    ['Personnes', d.pax],
  ]);

  const messageHtml = message
    ? `<p style="margin:20px 0 8px;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#9a9a92">Message</p>
       <p style="margin:0;font-size:14px;line-height:1.6;color:#0b0b0b;white-space:pre-wrap">${esc(message).replace(/\n/g, '<br>')}</p>`
    : '';

  const urlHtml = ctxUrl
    ? `<p style="margin:24px 0 0;font-size:12px;color:#9a9a92;word-break:break-all">Contexte : <a href="${esc(ctxUrl)}" style="color:#0b0b0b">${esc(ctxUrl)}</a></p>`
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
    d.date ? `Date : ${d.date}` : '',
    d.dateEnd ? `Date fin : ${d.dateEnd}` : '',
    d.time ? `Heure : ${d.time}` : '',
    d.pax ? `Personnes : ${d.pax}` : '',
    message ? `\nMessage :\n${message}` : '',
    ctxUrl ? `\nContexte : ${ctxUrl}` : '',
  ].filter((l) => l !== '');
  const text = ['Contact non soumis — Misana Group', '', ...textRows].join('\n');

  return { email, phone, subject, html, text };
}

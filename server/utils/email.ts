// Email helper Resend. V1 sandbox : seul l'email equipe est envoye (le
// domaine misana-group.com n'est pas encore verifie chez Resend, donc on
// part avec onboarding@resend.dev et on n'ecrit qu'a l'adresse equipe
// inquiries-to). Les emails de confirmation user seront actives quand
// le DNS du domaine sera valide cote Resend.
import { Resend } from 'resend';

type InquiryPayload = {
  id: string | null;
  service: string;
  destination?: string | null;
  contact: { firstName: string; lastName: string; email: string; phone?: string };
  notes?: string;
  scenarioId?: string;
  payload?: Record<string, unknown>;
};

function escapeHtml(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderRow(label: string, value: unknown): string {
  if (value === undefined || value === null || value === '') return '';
  let display = '';
  if (typeof value === 'object') {
    display = `<pre style="margin:0;white-space:pre-wrap;font-family:ui-monospace,Menlo,Monaco,monospace;font-size:12px;color:#0b0b0b;background:#f5f4f1;padding:8px 10px;border-radius:2px">${escapeHtml(JSON.stringify(value, null, 2))}</pre>`;
  } else {
    display = `<span style="color:#0b0b0b">${escapeHtml(value)}</span>`;
  }
  return `
    <tr>
      <td style="padding:6px 16px 6px 0;color:#6b6b66;font-size:13px;letter-spacing:0.05em;text-transform:uppercase;vertical-align:top;white-space:nowrap">${escapeHtml(label)}</td>
      <td style="padding:6px 0;font-size:14px;line-height:1.5">${display}</td>
    </tr>`;
}

function renderTeamEmail(p: InquiryPayload, siteUrl: string): { subject: string; html: string; text: string } {
  const name = `${p.contact.firstName} ${p.contact.lastName}`.trim();
  const subject = `Nouvelle demande ${p.service}${name ? ` · ${name}` : ''}`;
  const adminLink = p.id ? `${siteUrl}/admin/inquiries/${p.id}` : `${siteUrl}/admin/inquiries`;
  const html = `<!doctype html>
<html lang="fr">
<head><meta charset="utf-8"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Inter',Helvetica,Arial,sans-serif;color:#0b0b0b">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff">
    <tr><td align="center" style="padding:32px 16px">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%">
        <tr><td style="border-bottom:1px solid #e8e6e1;padding-bottom:18px">
          <p style="margin:0;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:#6b6b66">Misana · Nouvelle demande</p>
          <h1 style="margin:8px 0 0;font-family:'Times New Roman',Times,serif;font-size:28px;font-weight:400;line-height:1.15;color:#0b0b0b">${escapeHtml(name) || 'Demande sans nom'}</h1>
          ${p.contact.email ? `<p style="margin:6px 0 0;font-size:14px;color:#0b0b0b"><a href="mailto:${escapeHtml(p.contact.email)}" style="color:#0b0b0b;text-decoration:underline">${escapeHtml(p.contact.email)}</a>${p.contact.phone ? ` · <a href="tel:${escapeHtml(p.contact.phone)}" style="color:#0b0b0b;text-decoration:underline">${escapeHtml(p.contact.phone)}</a>` : ''}</p>` : ''}
        </td></tr>
        <tr><td style="padding-top:18px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${renderRow('Service', p.service)}
            ${p.scenarioId ? renderRow('Scenario', p.scenarioId) : ''}
            ${p.destination ? renderRow('Destination', p.destination) : ''}
            ${p.notes ? renderRow('Message', p.notes) : ''}
            ${p.payload ? renderRow('Payload', p.payload) : ''}
          </table>
        </td></tr>
        <tr><td style="padding-top:24px">
          <a href="${escapeHtml(adminLink)}" style="display:inline-block;background:#0b0b0b;color:#ffffff;text-decoration:none;font-size:12px;letter-spacing:0.15em;text-transform:uppercase;padding:12px 18px">Voir dans l'admin</a>
        </td></tr>
        <tr><td style="padding-top:24px;border-top:1px solid #e8e6e1;margin-top:24px">
          <p style="margin:18px 0 0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#6b6b66">Misana · Cote d'Azur</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
  const text = [
    `Nouvelle demande Misana`,
    `Nom : ${name || '-'}`,
    `Email : ${p.contact.email || '-'}`,
    p.contact.phone ? `Telephone : ${p.contact.phone}` : '',
    `Service : ${p.service}`,
    p.scenarioId ? `Scenario : ${p.scenarioId}` : '',
    p.destination ? `Destination : ${p.destination}` : '',
    p.notes ? `Message : ${p.notes}` : '',
    '',
    `Admin : ${adminLink}`,
  ].filter(Boolean).join('\n');
  return { subject, html, text };
}

let cachedClient: Resend | null = null;
function getClient(apiKey: string): Resend {
  if (!cachedClient) cachedClient = new Resend(apiKey);
  return cachedClient;
}

export async function sendInquiryNotification(p: InquiryPayload, opts: {
  apiKey: string;
  from: string;
  to: string;
  siteUrl: string;
}): Promise<void> {
  if (!opts.apiKey || !opts.to || !opts.from) {
    console.warn('[email] Resend not configured (apiKey/from/to missing). Skipping notification.');
    return;
  }
  const client = getClient(opts.apiKey);
  const { subject, html, text } = renderTeamEmail(p, opts.siteUrl || 'https://misana-group.com');
  const replyTo = p.contact.email || undefined;
  const { error } = await client.emails.send({
    from: opts.from,
    to: opts.to,
    subject,
    html,
    text,
    ...(replyTo ? { reply_to: replyTo } : {}),
  } as any);
  if (error) {
    console.error('[email] Resend send failed:', error);
    throw error;
  }
}

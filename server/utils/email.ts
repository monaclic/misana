// Email helper Resend. V1 : un seul email envoye a l'equipe par submit.
// Le template extrait les champs utiles du payload selon le service et
// les affiche en sections lisibles. Aucun JSON brut.
import { Resend } from 'resend';
import { VEHICLES, HELICOPTERS } from '~/lib/fleet';

type InquiryPayload = {
  id: string | null;
  service: string;
  destination?: string | null;
  contact: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    phoneCode?: string;
    preferredChannel?: 'email' | 'phone' | 'whatsapp';
  };
  notes?: string;
  scenarioId?: string;
  payload?: Record<string, any>;
};

// Lookup VEHICLES/HELICOPTERS pour afficher le nom complet plutot que
// l'ID brut (ex 'v-class' -> 'Mercedes V-Class · Seven seats').
function vehicleLabel(id?: string): string {
  if (!id) return '';
  const v = VEHICLES.find((x) => x.id === id);
  return v ? `${v.name} · ${v.sub}` : id;
}
function helicopterLabel(id?: string): string {
  if (!id) return '';
  const h = HELICOPTERS.find((x) => x.id === id);
  return h ? `${h.name} · ${h.engine}` : id;
}

// Format prix EUR pour l'email. Source : payload.{chauffeur,helicopter}.priceEstimate
// (calcule cote client par le scenario depuis la matrice CHAUFFEUR_ROUTES ou
// priceForVehicleByKm). Null si pas d'estimation possible -> on n'affiche rien.
function fmtEur(n?: number | null): string {
  if (typeof n !== 'number' || n <= 0) return '';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}

function escapeHtml(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeNl(s: unknown): string {
  return escapeHtml(s).replace(/\n/g, '<br>');
}

// ===== Helpers de formatage des sous-payloads par service =====

function fmtDate(s?: string): string {
  if (!s) return '';
  const d = s.length >= 10 ? s.slice(0, 10) : s;
  // YYYY-MM-DD -> DD/MM/YYYY
  const m = d.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : d;
}

function fmtTime(s?: string): string {
  if (!s) return '';
  return s.slice(0, 5);
}

function fmtPax(p?: { adults?: number; children?: number; babies?: number; pets?: number }): string {
  if (!p) return '';
  const parts: string[] = [];
  if (p.adults) parts.push(`${p.adults} adulte${p.adults > 1 ? 's' : ''}`);
  if (p.children) parts.push(`${p.children} enfant${p.children > 1 ? 's' : ''}`);
  if (p.babies) parts.push(`${p.babies} bébé${p.babies > 1 ? 's' : ''}`);
  if (p.pets) parts.push(`${p.pets} animal${p.pets > 1 ? 'aux' : ''}`);
  return parts.join(' · ');
}

function fmtLuggage(l?: { cabin?: number; hold?: number; special?: number }): string {
  if (!l) return '';
  const parts: string[] = [];
  if (l.cabin) parts.push(`${l.cabin} cabine`);
  if (l.hold) parts.push(`${l.hold} soute`);
  if (l.special) parts.push(`${l.special} spécial${l.special > 1 ? 'aux' : ''}`);
  return parts.join(' · ');
}

function fmtChildSeats(c?: { infant?: number; child?: number; booster?: number }): string {
  if (!c) return '';
  const parts: string[] = [];
  if (c.infant) parts.push(`${c.infant} bébé (0-1 an)`);
  if (c.child) parts.push(`${c.child} enfant (1-4 ans)`);
  if (c.booster) parts.push(`${c.booster} rehausseur (4-10 ans)`);
  return parts.join(' · ');
}

const CHAUFFEUR_MODE_LABEL: Record<string, string> = {
  transfer: 'Transfert (point à point)',
  disposal: 'Mise à disposition',
};

const CONTACT_SUBJECT_LABEL: Record<string, string> = {
  request: 'Prévoir un séjour',
  chauffeur: 'Chauffeur',
  cars: 'Voitures',
  yacht: 'Yacht',
  helicopter: 'Hélicoptère',
  access: 'Access (tables, palaces, plage)',
  partners: 'Partenaires sur la côte',
  careers: 'Carrières',
  feedback: 'Partager un retour',
  press: 'Presse et éditorial',
  other: 'Autre demande',
};

const HELI_LABELS: Record<string, string> = {
  NCE: 'Nice', MCM: 'Monaco',
  CEQ: 'Cannes (Mandelieu)', CNQ: 'Cannes (Quai du Large)',
  LTT: 'Saint-Tropez (La Mole)', STG: 'Saint-Tropez (Grimaud)',
};

const SERVICE_LABEL: Record<string, string> = {
  chauffeur: 'Chauffeur',
  cars: 'Voitures',
  yacht: 'Yacht',
  helicopter: 'Hélicoptère',
  access: 'Access',
  multi: 'Multi-services',
};

type Row = { label: string; value: string };
function r(label: string, value: any): Row | null {
  if (value === undefined || value === null || value === '') return null;
  if (Array.isArray(value) && value.length === 0) return null;
  return { label, value: String(value) };
}

// Convertit un slug en label lisible. Ex 'ferrari-296' -> 'Ferrari 296'.
function slugToLabel(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

type ProductLink = { label: string; href: string; kind: string };

// Construit le lien vers la fiche produit Misana selon le service.
// Chemins canoniques production (alignes sur defineI18nRoute des pages
// reelles, pas sur lib/serviceRoutes.ts qui pointe vers les doublons).
// i18n strategy = 'prefix' : toute URL doit etre prefixee /fr ou /en.
// On utilise FR par defaut (equipe francophone).
function buildProductLink(service: string, payload: Record<string, any>, siteUrl: string): ProductLink | null {
  const base = siteUrl.replace(/\/$/, '');
  // Locale du formulaire (passe depuis pages/request/index.vue). Fallback FR.
  const lang: 'fr' | 'en' = payload.locale === 'en' ? 'en' : 'fr';
  // Segments canoniques par locale, source : defineI18nRoute de chaque page.
  const PATHS = {
    cars: { fr: 'location-voiture', en: 'car-rental' },
    yacht: { fr: 'location-yacht', en: 'yacht-charter' },
    access: { fr: 'reservations', en: 'reservations' },
    helicopter: { fr: 'transfert-helicoptere', en: 'helicopter-transfer' },
  } as const;
  if (service === 'cars' && payload.cars?.rentalCarId) {
    const slug = payload.cars.rentalCarId;
    return { kind: 'Voiture', label: slugToLabel(slug), href: `${base}/${lang}/${PATHS.cars[lang]}/${slug}` };
  }
  if (service === 'yacht' && payload.yacht?.yachtId) {
    const slug = payload.yacht.yachtId;
    return { kind: 'Yacht', label: slugToLabel(slug), href: `${base}/${lang}/${PATHS.yacht[lang]}/${slug}` };
  }
  if (service === 'access' && payload.access?.items?.[0]?.establishment) {
    const slug = payload.access.items[0].establishment;
    return { kind: 'Établissement', label: slugToLabel(slug), href: `${base}/${lang}/${PATHS.access[lang]}/${slug}` };
  }
  if (service === 'helicopter' && payload.helicopter?.helicopterId) {
    // Pas de fiche dediee V1, on renvoie vers le hub helico.
    return { kind: 'Hélicoptère', label: slugToLabel(payload.helicopter.helicopterId), href: `${base}/${lang}/${PATHS.helicopter[lang]}` };
  }
  return null;
}

function buildRows(p: InquiryPayload, siteUrl: string): { service: string; rows: Row[]; details?: string; product?: ProductLink | null } {
  const payload = p.payload || {};
  const service = p.service || '';
  const rows: Row[] = [];
  const product = buildProductLink(service, payload, siteUrl);

  // Form contact light : "contact:<subject>"
  if (service.startsWith('contact:')) {
    const subject = service.slice('contact:'.length);
    const subjectLabel = CONTACT_SUBJECT_LABEL[subject] || subject;
    return {
      service: `Contact · ${subjectLabel}`,
      rows: [],
      details: p.notes,
    };
  }

  // Tronc /request : on lit le payload typé selon le service.
  if (service === 'chauffeur' && payload.chauffeur) {
    const c = payload.chauffeur;
    const modeLabel = c.mode ? CHAUFFEUR_MODE_LABEL[c.mode] || c.mode : '';
    // Stops : un cote chauffeur peut avoir plusieurs etapes (max 5).
    // Affiches en bullet list pour rester lisible meme avec 4-5 stops.
    const fmtStops = (arr?: string[]) => {
      const list = (arr || []).filter(Boolean);
      return list.length ? list.map((s, i) => `${i + 1}. ${s}`).join('\n') : '';
    };
    // Retour : si hasReturn, bloc structure complet (trajet, stops, date,
    // heure, pax). Le retour peut differer de l'aller (second pickup,
    // dropoff different, groupe scinde).
    const returnRows = c.hasReturn ? [
      r('Retour · Trajet', c.returnPickup && c.returnDropoff
        ? `${c.returnPickup} → ${c.returnDropoff}`
        : c.returnPickup || c.returnDropoff),
      r('Retour · Étapes', fmtStops(c.returnStops)),
      r('Retour · Date', fmtDate(c.returnDate)),
      r('Retour · Heure', fmtTime(c.returnTime)),
      r('Retour · Passagers', c.returnPax),
    ] : [];
    rows.push(
      ...[
        r('Mode', modeLabel),
        r('Trajet', c.pickup && c.dropoff ? `${c.pickup} → ${c.dropoff}` : c.pickup || c.dropoff),
        r('Étapes', fmtStops(c.stops)),
        r('Ville', c.city),
        r('Date', fmtDate(c.date)),
        r('Heure', fmtTime(c.time)),
        r('Passagers', fmtPax(c.passengers)),
        r('Bagages', fmtLuggage(c.luggage)),
        r('Sièges enfant', fmtChildSeats(c.childSeats)),
        r('Durée', c.durationHours ? `${c.durationHours}h` : ''),
        r('Véhicule souhaité', vehicleLabel(c.vehicleId)),
        r('Tarif estimé', fmtEur(c.priceEstimate)),
        r('Distance estimée', c.distanceKm ? `${c.distanceKm} km` : ''),
        r('Vol', c.flight),
        r('Train', c.train),
        r('Panneau d\'accueil', c.welcomeSign),
        ...returnRows,
      ].filter((x): x is Row => x !== null),
    );
    return { service: SERVICE_LABEL.chauffeur, rows, details: c.notes, product };
  }

  if (service === 'cars' && payload.cars) {
    const c = payload.cars;
    rows.push(
      ...[
        r('Véhicule', c.rentalCarId),
        r('Type', c.type),
        r('Marque', c.brand),
        r('Lieu de prise en charge', c.pickup),
        r('Du', fmtDate(c.startDate)),
        r('Au', fmtDate(c.endDate)),
        r('Âge conducteur', c.driverAge),
        r('Permis (pays)', c.licenceCountry),
      ].filter((x): x is Row => x !== null),
    );
    return { service: SERVICE_LABEL.cars, rows, details: c.notes, product };
  }

  if (service === 'yacht' && payload.yacht) {
    const y = payload.yacht;
    rows.push(
      ...[
        r('Yacht', y.yachtId),
        r('Port', y.port),
        r('Du', fmtDate(y.startDate)),
        r('Au', fmtDate(y.endDate)),
        r('Invités', y.guests),
        r('Durée', y.duration),
        r('Taille', y.size),
      ].filter((x): x is Row => x !== null),
    );
    return { service: SERVICE_LABEL.yacht, rows, details: y.notes, product };
  }

  if (service === 'helicopter' && payload.helicopter) {
    const h = payload.helicopter;
    const dep = h.departure ? (HELI_LABELS[h.departure] || h.departure) : '';
    const dest = h.destination ? (HELI_LABELS[h.destination] || h.destination) : '';
    rows.push(
      ...[
        r('Trajet', dep && dest ? `${dep} → ${dest}` : dep || dest),
        r('Date', fmtDate(h.date)),
        r('Heure', fmtTime(h.time)),
        r('Passagers', fmtPax(h.passengers)),
        r('Bagages', fmtLuggage(h.luggage)),
        r('Appareil souhaité', helicopterLabel(h.helicopterId)),
        r('Tarif estimé', fmtEur(h.priceEstimate)),
        r('Retour', h.hasReturn ? `${fmtDate(h.returnDate)} ${fmtTime(h.returnTime)}`.trim() : ''),
      ].filter((x): x is Row => x !== null),
    );
    return { service: SERVICE_LABEL.helicopter, rows, details: h.notes, product };
  }

  if (service === 'access' && payload.access) {
    const a = payload.access;
    const items = Array.isArray(a.items) ? a.items : [];
    items.forEach((it: any, idx: number) => {
      const lbl = items.length > 1 ? `Adresse ${idx + 1}` : 'Adresse';
      const mealLabel = it.meal === 'lunch' ? 'Déjeuner' : it.meal === 'dinner' ? 'Dîner' : '';
      rows.push(
        ...[
          r(`${lbl} · établissement`, it.establishment),
          r(`${lbl} · ville`, it.city),
          r(`${lbl} · catégorie`, it.category),
          r(`${lbl} · date`, fmtDate(it.date)),
          r(`${lbl} · heure`, fmtTime(it.time)),
          r(`${lbl} · repas`, mealLabel),
          r(`${lbl} · invités`, it.guests),
          r(`${lbl} · occasion`, it.occasion && it.occasion !== 'none' ? it.occasion : ''),
        ].filter((x): x is Row => x !== null),
      );
    });
    return { service: SERVICE_LABEL.access, rows, details: a.notes, product };
  }

  // Fallback générique : on affiche le service + les notes seulement.
  return { service: SERVICE_LABEL[service] || service, rows: [], details: p.notes, product };
}

// ===== Template HTML =====

function row(label: string, value: string, isHtml = false): string {
  const cellValue = isHtml ? value : escapeNl(value);
  return `
    <tr>
      <td style="padding:8px 16px 8px 0;color:#6b6b66;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;vertical-align:top;white-space:nowrap;width:160px">${escapeHtml(label)}</td>
      <td style="padding:8px 0;font-size:14px;line-height:1.5;color:#0b0b0b">${cellValue}</td>
    </tr>`;
}

function renderTeamEmail(p: InquiryPayload, siteUrl: string): { subject: string; html: string; text: string } {
  const name = `${p.contact.firstName} ${p.contact.lastName}`.trim();
  const { service, rows, details, product } = buildRows(p, siteUrl);
  const subject = `Nouvelle demande · ${service}${product ? ` · ${product.label}` : ''}${name ? ` · ${name}` : ''}`;

  const channelLabel: Record<string, string> = {
    email: 'Email',
    phone: 'Téléphone',
    whatsapp: 'WhatsApp',
  };
  const channelStr = p.contact.preferredChannel ? channelLabel[p.contact.preferredChannel] : '';

  // Telephone : on concatene l'indicatif au numero. ContactBlock stocke
  // phoneCode (ex "+33") et phone (ex "6 12 34 56 78") separement.
  // Sans concatenation, l'equipe recevait juste "6 12 34 56 78" et
  // appelait un numero invalide.
  const phoneFull = p.contact.phone
    ? `${(p.contact.phoneCode || '').trim()} ${p.contact.phone.trim()}`.trim()
    : '';
  // Numero E.164-like pour le href tel: (sans espaces ni separateurs).
  const phoneHref = phoneFull.replace(/[^\d+]/g, '');

  const contactHtml = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px">
      ${row('Nom', name || '-')}
      ${p.contact.email ? row('Email', `<a href="mailto:${escapeHtml(p.contact.email)}" style="color:#0b0b0b;text-decoration:underline">${escapeHtml(p.contact.email)}</a>`, true) : ''}
      ${phoneFull ? row('Téléphone', `<a href="tel:${escapeHtml(phoneHref)}" style="color:#0b0b0b;text-decoration:underline">${escapeHtml(phoneFull)}</a>`, true) : ''}
      ${channelStr ? row('Canal préféré', channelStr) : ''}
      ${row('Service', service)}
    </table>`;

  const productHtml = product
    ? `
    <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#6b6b66">Fiche produit</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 12px;border:1px solid #e8e6e1">
      <tr><td style="padding:14px 16px">
        <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#6b6b66">${escapeHtml(product.kind)}</p>
        <p style="margin:0 0 4px;font-family:'Times New Roman',Times,serif;font-size:20px;line-height:1.2;color:#0b0b0b">${escapeHtml(product.label)}</p>
        <a href="${escapeHtml(product.href)}" style="color:#0b0b0b;font-size:13px;text-decoration:underline;word-break:break-all">${escapeHtml(product.href)}</a>
      </td></tr>
    </table>
    <p style="margin:0 0 24px">
      <a href="${escapeHtml(product.href)}" style="display:inline-block;background:#0b0b0b;color:#ffffff;text-decoration:none;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;padding:10px 16px">Voir la fiche</a>
    </p>`
    : '';

  const detailsHtml = rows.length
    ? `
    <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#6b6b66">Demande</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px">
      ${rows.map((x) => row(x.label, x.value)).join('')}
    </table>`
    : '';

  const messageHtml = details
    ? `
    <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#6b6b66">Message</p>
    <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#0b0b0b;white-space:pre-wrap">${escapeNl(details)}</p>`
    : '';

  const refHtml = p.id
    ? `<p style="margin:24px 0 0;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#9a9a92;font-family:ui-monospace,Menlo,monospace">Réf · ${escapeHtml(p.id)}</p>`
    : '';

  const html = `<!doctype html>
<html lang="fr">
<head><meta charset="utf-8"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:#f5f4f1;font-family:-apple-system,BlinkMacSystemFont,'Inter','Helvetica Neue',Helvetica,Arial,sans-serif;color:#0b0b0b">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f4f1">
    <tr><td align="center" style="padding:40px 16px">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #e8e6e1">
        <tr><td style="padding:32px 32px 24px;border-bottom:1px solid #e8e6e1">
          <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:#6b6b66">Misana · Nouvelle demande</p>
          <h1 style="margin:0;font-family:'Times New Roman',Times,serif;font-weight:400;font-size:30px;line-height:1.15;color:#0b0b0b">${escapeHtml(name) || 'Sans nom'}</h1>
        </td></tr>
        <tr><td style="padding:24px 32px 32px">
          ${contactHtml}
          ${productHtml}
          ${detailsHtml}
          ${messageHtml}
          ${refHtml}
        </td></tr>
        <tr><td style="padding:18px 32px;border-top:1px solid #e8e6e1;background:#fafaf7">
          <p style="margin:0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#9a9a92">Misana · Côte d'Azur</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  // Version texte (fallback clients sans HTML).
  const txtRows = rows.map((x) => `${x.label} : ${x.value.replace(/<[^>]+>/g, '')}`).join('\n');
  const text = [
    `Nouvelle demande Misana`,
    `Service : ${service}`,
    product ? `${product.kind} : ${product.label}\nLien : ${product.href}` : '',
    '',
    `Nom : ${name || '-'}`,
    p.contact.email ? `Email : ${p.contact.email}` : '',
    phoneFull ? `Téléphone : ${phoneFull}` : '',
    channelStr ? `Canal préféré : ${channelStr}` : '',
    '',
    txtRows,
    details ? `\nMessage :\n${details}` : '',
    p.id ? `\nRéf : ${p.id}` : '',
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

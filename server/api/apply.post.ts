// POST /api/apply
// Réception d'une candidature multipart (CV PDF + champs texte).
// Sécurité :
//  - Rate limit par IP hashée SHA-256 (3 req / heure)
//  - Honeypot silencieux
//  - Validation Zod stricte côté server
//  - Validation MIME + taille du PDF côté server
//  - Sanitisation cover letter (texte brut uniquement)
//  - Upload CV dans Supabase Storage bucket privé "careers"
//  - Insert dans public.applications via service role (bypasse RLS)
//  - Zéro email, zéro exposition de données à des tiers
import { serverSupabaseServiceRole } from '#supabase/server';
import { z } from 'zod';

const PDF_MIME   = 'application/pdf';
const MAX_BYTES  = 3 * 1024 * 1024;       // 3 Mo
const RATE_WINDOW = 60 * 60 * 1000;       // 1 heure en ms
const RATE_MAX    = 3;

// ================================================================
// Rate limit in-memory par IP hashée (SHA-256).
// Même caveats Vercel serverless que rateLimit.ts : best-effort.
// ================================================================
const applyBuckets = new Map<string, number[]>();

async function hashIp(ip: string): Promise<string> {
  const buf  = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function getClientIp(event: import('h3').H3Event): string {
  const xff  = getHeader(event, 'x-forwarded-for');
  if (xff) return xff.split(',')[0]?.trim() || 'unknown';
  const real = getHeader(event, 'x-real-ip');
  if (real) return real;
  return (event as any).node?.req?.socket?.remoteAddress || 'unknown';
}

// ================================================================
// Sanitisation cover letter : texte brut uniquement.
// Strip HTML, balises Markdown, et caractères de contrôle.
// ================================================================
function sanitizePlainText(s: string): string {
  return s
    .replace(/<[^>]*>/g, '')                           // strip HTML
    .replace(/[*_~`#\[\]\\]/g, '')                     // strip markdown
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // strip control chars
    .trim();
}

// ================================================================
// Zod schema — validation server des champs texte.
// ================================================================
const applySchema = z.object({
  jobSlug:     z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  jobTitle:    z.string().min(1).max(200),
  firstName:   z.string().min(1).max(80),
  lastName:    z.string().min(1).max(80),
  email:       z.string().email(),
  phone:       z.string().max(40).optional().transform((v) => v || undefined),
  // z.union : "" est accepté comme literal puis transformé en undefined.
  // Une valeur non-vide doit être une URL linkedin.com valide.
  linkedin: z.union([
    z.literal(''),
    z.string().url().refine(
      (v) => /^https?:\/\/(www\.)?linkedin\.com\//.test(v),
      { message: 'linkedin must be a linkedin.com URL' },
    ),
  ]).optional().transform((v) => v || undefined),
  coverLetter: z.string().min(100).max(3000),
  locale:      z.enum(['en', 'fr']),
  honeypot:    z.string().optional(),
});

// ================================================================
// Utilitaire : extrait un champ texte du multipart parsé.
// ================================================================
type MultipartField = { name?: string; data: Buffer; filename?: string; type?: string };

function textField(parts: MultipartField[], name: string): string {
  return parts.find((p) => p.name === name && !p.filename)?.data.toString('utf-8').trim() ?? '';
}

// ================================================================
// Handler
// ================================================================
export default defineEventHandler(async (event) => {
  // --- Rate limit par IP hashée ---
  const rawIp   = getClientIp(event);
  const ipHash  = await hashIp(rawIp);
  const now     = Date.now();
  const cutoff  = now - RATE_WINDOW;
  const history = (applyBuckets.get(ipHash) ?? []).filter((t) => t > cutoff);

  if (history.length >= RATE_MAX) {
    throw createError({ statusCode: 429, statusMessage: 'Too many applications. Please wait before trying again.' });
  }
  history.push(now);
  applyBuckets.set(ipHash, history);

  // Cleanup occasionnel
  if (applyBuckets.size > 500) {
    for (const [k, ts] of applyBuckets) {
      if (ts.every((t) => t < cutoff)) applyBuckets.delete(k);
    }
  }

  // --- Parse multipart ---
  const parts = await readMultipartFormData(event);
  if (!parts || parts.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid form data.' });
  }

  // Honeypot : champ caché rempli = bot → réponse silencieuse ok
  const honeypot = textField(parts, 'honeypot');
  if (honeypot) return { ok: true };

  // --- Extraction champs texte ---
  const raw = {
    jobSlug:     textField(parts, 'jobSlug'),
    jobTitle:    textField(parts, 'jobTitle'),
    firstName:   textField(parts, 'firstName'),
    lastName:    textField(parts, 'lastName'),
    email:       textField(parts, 'email'),
    phone:       textField(parts, 'phone'),
    linkedin:    textField(parts, 'linkedin'),
    coverLetter: textField(parts, 'coverLetter'),
    locale:      textField(parts, 'locale'),
    honeypot:    '',
  };

  // --- Validation Zod ---
  const parsed = applySchema.safeParse(raw);
  if (!parsed.success) {
    console.warn('[apply] zod validation failed:', parsed.error.flatten().fieldErrors);
    throw createError({ statusCode: 400, statusMessage: 'Invalid application data.' });
  }

  const data = parsed.data;

  // Sanitisation cover letter
  const cleanCoverLetter = sanitizePlainText(data.coverLetter);
  if (cleanCoverLetter.length < 100) {
    throw createError({ statusCode: 400, statusMessage: 'Cover letter too short after sanitisation.' });
  }

  // --- Validation fichier CV ---
  const cvPart = parts.find((p) => p.name === 'cv' && p.filename);
  if (!cvPart) {
    throw createError({ statusCode: 400, statusMessage: 'CV file is required.' });
  }

  // MIME : vérifie le champ déclaré ET la signature magic bytes (PDF = %PDF)
  const declaredMime = cvPart.type ?? '';
  const magic        = cvPart.data.slice(0, 4).toString('ascii');
  if (declaredMime !== PDF_MIME || magic !== '%PDF') {
    throw createError({ statusCode: 400, statusMessage: 'Only PDF files are accepted.' });
  }
  if (cvPart.data.length > MAX_BYTES) {
    throw createError({ statusCode: 400, statusMessage: 'CV file exceeds the 3 MB limit.' });
  }

  // Client service role via @nuxtjs/supabase (server-only, bypasse RLS).
  // Utilise SUPABASE_URL + SUPABASE_SERVICE_KEY depuis l'env — jamais exposé côté client.
  const supabase = serverSupabaseServiceRole(event);

  // --- Upload CV dans bucket privé "careers" ---
  const ext      = (cvPart.filename ?? 'cv.pdf').split('.').pop()?.toLowerCase() === 'pdf' ? 'pdf' : 'pdf';
  const timestamp = Date.now();
  const cvPath   = `${data.jobSlug}/${timestamp}-${ipHash.slice(0, 8)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('careers')
    .upload(cvPath, cvPart.data, {
      contentType: PDF_MIME,
      upsert: false,
    });

  if (uploadError) {
    console.error('[apply] Storage upload failed:', uploadError.message);
    throw createError({ statusCode: 502, statusMessage: 'Could not store the CV. Please retry.' });
  }

  // --- Insert dans public.applications ---
  const { error: insertError } = await supabase.from('applications').insert({
    job_slug:     data.jobSlug,
    job_title:    data.jobTitle,
    first_name:   data.firstName,
    last_name:    data.lastName,
    email:        data.email,
    phone:        data.phone ?? null,
    linkedin:     data.linkedin ?? null,
    cv_path:      cvPath,            // path Storage uniquement, jamais URL publique
    cover_letter: cleanCoverLetter,  // texte brut sanitisé
    locale:       data.locale,
    ip_hash:      ipHash,
  });

  if (insertError) {
    console.error('[apply] DB insert failed:', insertError.message);
    // Nettoyage du fichier uploadé si l'insert échoue
    await supabase.storage.from('careers').remove([cvPath]).catch(() => {});
    throw createError({ statusCode: 502, statusMessage: 'Could not save the application. Please retry.' });
  }

  return { ok: true };
});

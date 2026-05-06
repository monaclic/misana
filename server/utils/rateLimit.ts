// Rate limiter in-memory simple pour les endpoints publics.
// Limites : 5 requetes / minute par IP.
//
// Limitation Vercel serverless : le state est perdu quand le container est
// recycle. C'est un best-effort qui marche tant que les requetes spammees
// arrivent sur la meme instance chaude. Pour une protection robuste il
// faudrait Vercel KV ou Redis (V2).
//
// Pour l'IP, on lit en priorite x-forwarded-for (Vercel/Cloudflare) puis
// fallback sur req.socket.remoteAddress.
import type { H3Event } from 'h3';

type RateLimitOpts = {
  windowMs?: number;     // fenetre temporelle (ms)
  maxRequests?: number;  // requetes max dans la fenetre
};

const buckets = new Map<string, number[]>();

function getClientIp(event: H3Event): string {
  const xff = getHeader(event, 'x-forwarded-for');
  if (xff) return xff.split(',')[0]?.trim() || 'unknown';
  const real = getHeader(event, 'x-real-ip');
  if (real) return real;
  return event.node.req.socket?.remoteAddress || 'unknown';
}

// Lance throw createError 429 si la limite est atteinte.
// Sinon enregistre la requete et retourne.
export function rateLimit(event: H3Event, opts: RateLimitOpts = {}) {
  const windowMs = opts.windowMs ?? 60_000;
  const maxRequests = opts.maxRequests ?? 5;
  const ip = getClientIp(event);
  const route = event.node.req.url?.split('?')[0] || 'unknown';
  const key = `${ip}:${route}`;
  const now = Date.now();
  const cutoff = now - windowMs;

  const timestamps = buckets.get(key) || [];
  const recent = timestamps.filter((t) => t > cutoff);

  if (recent.length >= maxRequests) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too many requests. Please slow down.',
    });
  }

  recent.push(now);
  buckets.set(key, recent);

  // Cleanup occasionnel pour eviter une fuite memoire si beaucoup d'IPs.
  if (buckets.size > 1000) {
    for (const [k, ts] of buckets) {
      if (ts.every((t) => t < cutoff)) buckets.delete(k);
    }
  }
}

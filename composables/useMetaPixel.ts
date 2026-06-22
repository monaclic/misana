// Wrapper safe autour de window.fbq (Meta Pixel).
// No-op en SSR ou tant que le stub fbq n'existe pas. Le typage global de
// window.fbq est declare dans plugins/meta-pixel.client.ts.
export function trackPixel(event: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  if (typeof window.fbq !== 'function') return;
  window.fbq('track', event, params);
}

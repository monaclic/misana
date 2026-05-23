// DIAG TEMPORAIRE : expose dans un header HTTP l URL HTTP que le serveur
// recoit, depuis 3 sources differentes. Permet de tracer la cause racine
// du bug query-string-vide en SSR Vercel.
// A SUPPRIMER une fois le bug diagnostique.
import { getRequestURL } from 'h3';

export default defineEventHandler((event) => {
  try {
    const rawUrl = event.node.req.url || 'NONE';
    const rawHost = event.node.req.headers.host || 'NONE';
    let h3Url = 'NONE';
    let h3Search = 'NONE';
    try {
      const u = getRequestURL(event);
      h3Url = u.href;
      h3Search = u.search;
    } catch (e: any) {
      h3Url = `ERR:${e?.message || 'unknown'}`;
    }
    setResponseHeader(event, 'X-Diag-Raw-Url', rawUrl);
    setResponseHeader(event, 'X-Diag-Raw-Host', rawHost);
    setResponseHeader(event, 'X-Diag-H3-Url', h3Url);
    setResponseHeader(event, 'X-Diag-H3-Search', h3Search);
  } catch {}
});

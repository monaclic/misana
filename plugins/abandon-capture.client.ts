// Capture d'abandon du tronc /request. Plugin client-only, LECTURE SEULE.
// Quand l'onglet passe en arriere-plan (visibilitychange -> hidden), si la
// personne a saisi un email ou un telephone sans soumettre, on envoie un
// beacon a /api/abandon-request avec ce qu'elle a rempli.
//
// "Non soumis" est garanti par le sessionStorage : le draft est ecrit a
// chaque frappe par ContactBlock et EFFACE par clearDraft() au submit reussi.
// Draft present avec email/phone => rempli mais pas soumis. C'est notre gate.
//
// L'itineraire complet vient du snapshot expose (lecture seule) par
// pages/request/index.vue dans useState('request-abandon-payload').
//
// Aucune UI, aucune ecriture (ni sessionStorage, ni store, ni form).

const DRAFT_KEY = 'misana:request:draft';

export default defineNuxtPlugin(() => {
  if (typeof window === 'undefined') return;

  // Un seul envoi par session de page, quoi qu'il arrive.
  let abandonSent = false;

  // Snapshot itineraire + contact expose par la page (meme cle useState).
  const payloadState = useState<Record<string, any> | null>('request-abandon-payload', () => null);

  function readDraft(): Record<string, any> {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }

  function onVisibilityChange() {
    if (abandonSent) return;
    if (document.visibilityState !== 'hidden') return;

    const draft = readDraft();
    // Source de verite "non soumis" : le draft sessionStorage, efface au submit.
    if (!draft.email && !draft.phone) return;

    const body = JSON.stringify({
      payload: payloadState.value || null,
      draft,
      url: window.location.href,
    });

    try {
      const blob = new Blob([body], { type: 'application/json' });
      navigator.sendBeacon('/api/abandon-request', blob);
    } catch {
      // sendBeacon indisponible -> on abandonne silencieusement.
    }
    // Un seul envoi par session, meme si le beacon n'a pas pu etre mis en file.
    abandonSent = true;
  }

  document.addEventListener('visibilitychange', onVisibilityChange);
});

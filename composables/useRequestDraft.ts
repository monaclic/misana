// Persistance des saisies de /request entre navigations (fiche <-> form).
// sessionStorage uniquement (pas localStorage) : on ne garde pas entre
// sessions navigateur. Vide a submit reussi.
//
// Cle de stockage : 'misana:request:draft'.
// Schema persiste : champs contact + message libre + dates + pax.
// Pas de target (vehicle/yacht/etc) car le target vient de la query.

const STORAGE_KEY = 'misana:request:draft';

export type RequestDraft = {
  // Contact
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  phoneCode?: string;
  whatsapp?: boolean;
  replyLang?: 'fr' | 'en';
  message?: string;
  // Dates communes
  date?: string;
  dateEnd?: string;
  time?: string;
  pax?: number;
  // Consentement
  rgpdAccepted?: boolean;
};

function isBrowser() {
  return typeof window !== 'undefined' && typeof sessionStorage !== 'undefined';
}

export function loadDraft(): RequestDraft {
  if (!isBrowser()) return {};
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') return parsed as RequestDraft;
    return {};
  } catch {
    return {};
  }
}

export function saveDraft(patch: Partial<RequestDraft>) {
  if (!isBrowser()) return;
  try {
    const current = loadDraft();
    const merged = { ...current, ...patch };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch {
    // sessionStorage indisponible (private mode etc) -> on ignore
  }
}

export function clearDraft() {
  if (!isBrowser()) return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {}
}

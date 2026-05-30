<script setup lang="ts">
// Bloc contact partage entre tous les scenarios /request.
// Champs : prenom, nom, email, telephone (indicatif + numero), canal
// prefere (email/phone/whatsapp), langue de reponse, message libre,
// RGPD obligatoire. Newsletter optionnelle.
//
// Le composant emet 'update:modelValue' a chaque modification.
// Persiste dans sessionStorage via useRequestDraft.
import { saveDraft, loadDraft, type RequestDraft } from '~/composables/useRequestDraft';
import PhoneCodeSelect from '~/components/forms/PhoneCodeSelect.vue';
import { PHONE_CODES } from '~/lib/phoneCodes';

// Set des indicatifs valides pour le longest-match au parse "+XX..."
// (ex "+44 7700..." -> on extrait "+44"). Construit une fois au module.
const VALID_PHONE_CODES = new Set(PHONE_CODES.map((p) => p.code));

// Parse un numero qui commence par "+" : extrait l'indicatif (longest
// match jusqu'a 5 chars) et le reste. Sinon retourne raw tel quel.
// Pas de default +33 : on veut forcer un choix conscient pour eviter
// les numeros envoyes avec un mauvais indicatif (cas client etranger
// qui tape juste son numero local sans changer le default).
function parsePhoneWithCode(raw: string): { code?: string; rest: string } {
  const trimmed = raw.trim();
  if (!trimmed.startsWith('+')) return { rest: raw };
  for (let len = 5; len >= 2; len--) {
    const candidate = trimmed.slice(0, len);
    if (VALID_PHONE_CODES.has(candidate)) {
      return { code: candidate, rest: trimmed.slice(len).trimStart() };
    }
  }
  return { rest: raw };
}

export type PreferredChannel = 'email' | 'phone' | 'whatsapp';

export type ContactValue = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  phoneCode?: string;
  preferredChannel: PreferredChannel;
  whatsappConfirmed?: boolean;
  replyLang: 'fr' | 'en';
  message?: string;
  newsletter: boolean;
  rgpdAccepted: boolean;
};

const props = defineProps<{
  modelValue: ContactValue;
  // Si true, telephone obligatoire (transferts chauffeur, helico).
  phoneRequired?: boolean;
  // Si true, masque le champ message libre (utile pour scenarios
  // qui ont deja une zone "Precisions" dans leur form).
  hideMessage?: boolean;
}>();

const emit = defineEmits<{ (e: 'update:modelValue', v: ContactValue): void }>();

const { t, locale } = useI18n();

// Telephone requis aussi quand l'utilisateur a choisi phone ou whatsapp
// comme canal prefere (evident).
const phoneIsRequired = computed(() =>
  !!props.phoneRequired ||
  props.modelValue.preferredChannel === 'phone' ||
  props.modelValue.preferredChannel === 'whatsapp',
);

onMounted(() => {
  const draft = loadDraft();
  const next: ContactValue = {
    ...props.modelValue,
    firstName: props.modelValue.firstName || draft.firstName || '',
    lastName: props.modelValue.lastName || draft.lastName || '',
    email: props.modelValue.email || draft.email || '',
    phone: props.modelValue.phone || draft.phone,
    // Pas de default '+33' : on force la personne a choisir un indicatif
    // (sinon un client etranger garde +33 par defaut et le numero est
    // injoignable). draft.phoneCode est conserve s'il vient d'une session
    // precedente ou de l'auto-parse "+XX...".
    phoneCode: props.modelValue.phoneCode || draft.phoneCode,
    preferredChannel: props.modelValue.preferredChannel || (draft as any).preferredChannel || 'email',
    replyLang: props.modelValue.replyLang || draft.replyLang || (locale.value as 'fr' | 'en'),
    message: props.modelValue.message || draft.message,
    rgpdAccepted: props.modelValue.rgpdAccepted || !!draft.rgpdAccepted,
  };
  emit('update:modelValue', next);
});

// Handler dedie au champ numero : si l'utilisateur tape ou colle un
// numero commencant par "+" (ex "+44 7700..."), on extrait l'indicatif
// et on l'applique au PhoneCodeSelect. Cas typique : la personne copie
// son numero international complet depuis son carnet d'adresses.
function onPhoneInput(rawValue: string) {
  const parsed = parsePhoneWithCode(rawValue);
  if (parsed.code) {
    update({ phoneCode: parsed.code, phone: parsed.rest });
  } else {
    update({ phone: rawValue });
  }
}

// Indicatif manquant alors qu'un numero est saisi : on bloque le submit
// et on affiche un message en rouge sous le champ. Pas de message si
// les 2 champs sont vides (phone optionnel selon le scenario).
const phoneCodeMissing = computed(() =>
  !!props.modelValue.phone && !props.modelValue.phoneCode,
);

function update(patch: Partial<ContactValue>) {
  const next = { ...props.modelValue, ...patch };
  emit('update:modelValue', next);
  const draftPatch: Partial<RequestDraft> & { preferredChannel?: PreferredChannel } = {
    firstName: next.firstName,
    lastName: next.lastName,
    email: next.email,
    phone: next.phone,
    phoneCode: next.phoneCode,
    replyLang: next.replyLang,
    message: next.message,
    rgpdAccepted: next.rgpdAccepted,
    preferredChannel: next.preferredChannel,
  };
  saveDraft(draftPatch as Partial<RequestDraft>);
}
</script>

<template>
  <fieldset class="contact-block">
    <legend class="contact-block-legend">{{ t('request.contact.title') }}</legend>

    <div class="contact-row">
      <label class="contact-field">
        <span class="contact-label">{{ t('request.contact.firstName') }} <span class="req">*</span></span>
        <input
          type="text"
          autocomplete="given-name"
          :value="modelValue.firstName"
          required
          @input="update({ firstName: ($event.target as HTMLInputElement).value })"
        />
      </label>
      <label class="contact-field">
        <span class="contact-label">{{ t('request.contact.lastName') }} <span class="req">*</span></span>
        <input
          type="text"
          autocomplete="family-name"
          :value="modelValue.lastName"
          required
          @input="update({ lastName: ($event.target as HTMLInputElement).value })"
        />
      </label>
    </div>

    <label class="contact-field">
      <span class="contact-label">{{ t('request.contact.email') }} <span class="req">*</span></span>
      <input
        type="email"
        autocomplete="email"
        :value="modelValue.email"
        required
        @input="update({ email: ($event.target as HTMLInputElement).value })"
      />
    </label>

    <!-- Telephone : indicatif (PhoneCodeSelect) + numero, alignes -->
    <div class="contact-field">
      <span class="contact-label">
        {{ t('request.contact.phone') }}
        <span v-if="phoneIsRequired" class="req">*</span>
        <span v-else class="optional">({{ t('request.contact.optional') }})</span>
      </span>
      <div class="phone-group">
        <PhoneCodeSelect
          :model-value="modelValue.phoneCode"
          @update:model-value="update({ phoneCode: $event })"
        />
        <input
          type="tel"
          autocomplete="tel-national"
          class="phone-input"
          :value="modelValue.phone"
          :required="phoneIsRequired"
          :placeholder="t('request.contact.phonePlaceholder')"
          @input="onPhoneInput(($event.target as HTMLInputElement).value)"
        />
      </div>
      <p v-if="phoneCodeMissing" class="phone-error">{{ t('request.contact.phoneCodeRequired') }}</p>
    </div>

    <!-- Canal de contact prefere -->
    <!-- div + role="radiogroup" plutot que fieldset/legend : <legend>
         decoupe systematiquement la border-top du <fieldset> derriere
         lui, ce qui creait une "ligne chelou" qui traversait le label.
         Le role="radiogroup" + aria-labelledby preserve l'accessibilite. -->
    <div class="channel-fieldset" role="radiogroup" aria-labelledby="channel-label">
      <p id="channel-label" class="contact-label channel-label">{{ t('request.contact.preferredChannel') }}</p>
      <div class="channel-row">
        <label class="channel-option">
          <input
            type="radio"
            value="email"
            :checked="modelValue.preferredChannel === 'email'"
            @change="update({ preferredChannel: 'email' })"
          />
          <span>{{ t('request.contact.channelEmail') }}</span>
        </label>
        <label class="channel-option">
          <input
            type="radio"
            value="phone"
            :checked="modelValue.preferredChannel === 'phone'"
            @change="update({ preferredChannel: 'phone' })"
          />
          <span>{{ t('request.contact.channelPhone') }}</span>
        </label>
        <label class="channel-option">
          <input
            type="radio"
            value="whatsapp"
            :checked="modelValue.preferredChannel === 'whatsapp'"
            @change="update({ preferredChannel: 'whatsapp' })"
          />
          <span>{{ t('request.contact.channelWhatsapp') }}</span>
        </label>
      </div>
      <!-- Confirmation WhatsApp : visible uniquement si canal=whatsapp -->
      <label v-if="modelValue.preferredChannel === 'whatsapp'" class="contact-checkbox whatsapp-confirm">
        <input
          type="checkbox"
          :checked="modelValue.whatsappConfirmed"
          required
          @change="update({ whatsappConfirmed: ($event.target as HTMLInputElement).checked })"
        />
        <span class="contact-checkbox-text">{{ t('request.contact.whatsappConfirm') }}</span>
      </label>
    </div>

    <label class="contact-field">
      <span class="contact-label">{{ t('request.contact.replyLang') }}</span>
      <select
        :value="modelValue.replyLang"
        @change="update({ replyLang: ($event.target as HTMLSelectElement).value as 'fr' | 'en' })"
      >
        <option value="fr">Français</option>
        <option value="en">English</option>
      </select>
    </label>

    <label v-if="!hideMessage" class="contact-field">
      <span class="contact-label">{{ t('request.contact.message') }}</span>
      <textarea
        rows="4"
        :value="modelValue.message"
        :placeholder="t('request.contact.messagePlaceholder')"
        @input="update({ message: ($event.target as HTMLTextAreaElement).value })"
      ></textarea>
    </label>

    <div class="rgpd-row">
      <label class="contact-checkbox">
        <input
          type="checkbox"
          :checked="modelValue.rgpdAccepted"
          required
          @change="update({ rgpdAccepted: ($event.target as HTMLInputElement).checked })"
        />
        <span class="contact-checkbox-text">
          {{ t('request.contact.rgpd') }}
          <br />
          {{ t('request.contact.rgpdLine2') }}
          <NuxtLink :to="`/${locale}/legal/privacy`" class="contact-link rgpd-link-inline">
            {{ t('request.contact.rgpdLink') }}
          </NuxtLink>
        </span>
      </label>
      <slot name="submit" />
    </div>

    <label class="contact-checkbox">
      <input
        type="checkbox"
        :checked="modelValue.newsletter"
        @change="update({ newsletter: ($event.target as HTMLInputElement).checked })"
      />
      <span class="contact-checkbox-text">{{ t('request.contact.newsletter') }}</span>
    </label>
  </fieldset>
</template>

<style scoped>
.contact-block {
  border: 0;
  padding: 0;
  margin: 0 0 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.rgpd-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.25rem;
  flex-wrap: wrap;
}
.rgpd-row > label { flex: 1 1 auto; min-width: 0; }
.rgpd-row > :deep(button) { flex-shrink: 0; }
.contact-block-legend {
  font-family: var(--font-display);
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  color: var(--color-misana-ink);
}

.contact-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}
@media (min-width: 640px) {
  .contact-row { grid-template-columns: 1fr 1fr; }
}

.contact-field { display: flex; flex-direction: column; gap: 0.4rem; }
.contact-label {
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-misana-ink);
}
.contact-label .req { color: var(--color-misana-ink); }
.contact-label .optional {
  color: var(--color-misana-muted);
  text-transform: none;
  letter-spacing: normal;
  font-size: 0.7rem;
  margin-left: 0.3rem;
}

.contact-field > input,
.contact-field > select,
.contact-field > textarea {
  width: 100%;
  padding: 0.7rem 0.85rem;
  border: 1px solid var(--color-misana-line);
  background: var(--color-misana-paper);
  color: var(--color-misana-ink);
  font-size: 0.95rem;
  font-family: inherit;
  border-radius: 2px;
}
.contact-field > input:focus,
.contact-field > select:focus,
.contact-field > textarea:focus {
  outline: none;
  border-color: var(--color-misana-ink);
}
.contact-field > textarea { resize: vertical; min-height: 100px; }

/* Phone group : indicatif + numero, alignes en une seule "boite"
   visuelle. Le PhoneCodeSelect est sur-style (deep) pour matcher
   le style box des autres inputs. */
.phone-group {
  position: relative;
  display: grid;
  grid-template-columns: 5.5rem 1fr;
  gap: 0;
  align-items: stretch;
  border: 1px solid var(--color-misana-line);
  border-radius: 2px;
  background: var(--color-misana-paper);
}
.phone-group:focus-within {
  border-color: var(--color-misana-ink);
}
.phone-group :deep(button) {
  width: 100% !important;
  height: 100%;
  padding: 0.7rem 0.85rem !important;
  border: 0 !important;
  border-right: 1px solid var(--color-misana-line) !important;
  background: transparent;
  color: var(--color-misana-ink);
  font-size: 0.95rem;
  text-align: center;
  border-radius: 0 !important;
}
.phone-group :deep(button:hover),
.phone-group :deep(button:focus) {
  outline: none;
  background: var(--color-misana-stone);
}
.phone-input {
  padding: 0.7rem 0.85rem;
  border: 0;
  background: transparent;
  color: var(--color-misana-ink);
  font-size: 0.95rem;
  font-family: inherit;
  outline: none;
}
.phone-error {
  margin: 0.5rem 0 0;
  font-size: 0.82rem;
  line-height: 1.4;
  color: #b00020;
}

.whatsapp-confirm {
  margin-top: 0.6rem;
  padding: 0.7rem 0.85rem;
  background: var(--color-misana-stone);
  border-radius: 2px;
}

.channel-fieldset {
  /* Separation visuelle du bloc canal vs les champs contact info au
     dessus (prenom, nom, email, telephone). Marge top + filet pour
     marquer "Maintenant comment vous contacter ?". Padding bottom +
     margin bottom pour aerer du champ suivant (replyLang). */
  border-top: 1px solid var(--color-misana-line);
  padding: 1.5rem 0 1rem;
  margin: 0.75rem 0 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}
.channel-label {
  margin: 0 0 0.2rem;
}
.channel-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem 0.7rem;
  margin-top: 0.15rem;
}
.channel-option {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.55rem 0.9rem;
  border: 1px solid var(--color-misana-line);
  border-radius: 999px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: border-color 0.2s ease, background 0.2s ease;
}
.channel-option input[type="radio"] {
  accent-color: var(--color-misana-ink);
  margin: 0;
}
.channel-option:has(input:checked) {
  border-color: var(--color-misana-ink);
  background: var(--color-misana-stone);
}

.contact-checkbox {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  cursor: pointer;
}
.contact-checkbox input[type="checkbox"] {
  margin-top: 0.2rem;
  flex-shrink: 0;
  accent-color: var(--color-misana-ink);
}
.contact-checkbox-text {
  font-size: 0.85rem;
  color: var(--color-misana-muted);
  line-height: 1.4;
}
.contact-link {
  color: var(--color-misana-ink);
  border-bottom: 1px solid var(--color-misana-ink);
  text-decoration: none;
}
.rgpd-link-inline {
  font-size: 0.78rem;
  margin-left: 0.35rem;
  white-space: nowrap;
}
</style>

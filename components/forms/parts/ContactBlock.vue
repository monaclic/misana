<script setup lang="ts">
// Bloc contact partage entre tous les scenarios /request.
// Champs : prenom, nom, email, telephone (avec code pays), langue de
// reponse, message libre, RGPD obligatoire. Newsletter optionnelle.
//
// Le composant emet 'update:modelValue' a chaque modification.
// Persiste les valeurs dans sessionStorage via useRequestDraft pour
// que l'utilisateur ne ressaisisse pas s'il navigue back vers une fiche.
import { saveDraft, loadDraft, type RequestDraft } from '~/composables/useRequestDraft';

const props = defineProps<{
  modelValue: ContactValue;
  // Si true, telephone obligatoire (transferts chauffeur, helico).
  phoneRequired?: boolean;
}>();

const emit = defineEmits<{ (e: 'update:modelValue', v: ContactValue): void }>();

export type ContactValue = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  phoneCode?: string;
  whatsapp: boolean;
  replyLang: 'fr' | 'en';
  message?: string;
  newsletter: boolean;
  rgpdAccepted: boolean;
};

const { t, locale } = useI18n();

// Hydrate avec le draft sessionStorage au mount.
onMounted(() => {
  const draft = loadDraft();
  const next: ContactValue = {
    ...props.modelValue,
    firstName: props.modelValue.firstName || draft.firstName || '',
    lastName: props.modelValue.lastName || draft.lastName || '',
    email: props.modelValue.email || draft.email || '',
    phone: props.modelValue.phone || draft.phone,
    phoneCode: props.modelValue.phoneCode || draft.phoneCode,
    whatsapp: props.modelValue.whatsapp || !!draft.whatsapp,
    replyLang: props.modelValue.replyLang || draft.replyLang || (locale.value as 'fr' | 'en'),
    message: props.modelValue.message || draft.message,
    rgpdAccepted: props.modelValue.rgpdAccepted || !!draft.rgpdAccepted,
  };
  emit('update:modelValue', next);
});

// Quand l'utilisateur modifie un champ, on sauve dans sessionStorage.
function update(patch: Partial<ContactValue>) {
  const next = { ...props.modelValue, ...patch };
  emit('update:modelValue', next);
  const draftPatch: Partial<RequestDraft> = {
    firstName: next.firstName,
    lastName: next.lastName,
    email: next.email,
    phone: next.phone,
    phoneCode: next.phoneCode,
    whatsapp: next.whatsapp,
    replyLang: next.replyLang,
    message: next.message,
    rgpdAccepted: next.rgpdAccepted,
  };
  saveDraft(draftPatch);
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
          @input="update({ firstName: ($event.target as HTMLInputElement).value })"
          required
        />
      </label>
      <label class="contact-field">
        <span class="contact-label">{{ t('request.contact.lastName') }} <span class="req">*</span></span>
        <input
          type="text"
          autocomplete="family-name"
          :value="modelValue.lastName"
          @input="update({ lastName: ($event.target as HTMLInputElement).value })"
          required
        />
      </label>
    </div>

    <label class="contact-field">
      <span class="contact-label">{{ t('request.contact.email') }} <span class="req">*</span></span>
      <input
        type="email"
        autocomplete="email"
        :value="modelValue.email"
        @input="update({ email: ($event.target as HTMLInputElement).value })"
        required
      />
    </label>

    <label class="contact-field">
      <span class="contact-label">
        {{ t('request.contact.phone') }}
        <span v-if="phoneRequired" class="req">*</span>
        <span v-else class="optional">({{ t('request.contact.optional') }})</span>
      </span>
      <input
        type="tel"
        autocomplete="tel"
        :value="modelValue.phone"
        @input="update({ phone: ($event.target as HTMLInputElement).value })"
        :required="phoneRequired"
        :placeholder="t('request.contact.phonePlaceholder')"
      />
    </label>

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

    <label class="contact-field">
      <span class="contact-label">{{ t('request.contact.message') }}</span>
      <textarea
        rows="4"
        :value="modelValue.message"
        @input="update({ message: ($event.target as HTMLTextAreaElement).value })"
        :placeholder="t('request.contact.messagePlaceholder')"
      ></textarea>
    </label>

    <label class="contact-checkbox">
      <input
        type="checkbox"
        :checked="modelValue.rgpdAccepted"
        @change="update({ rgpdAccepted: ($event.target as HTMLInputElement).checked })"
        required
      />
      <span class="contact-checkbox-text">
        {{ t('request.contact.rgpd') }}
        <NuxtLink :to="`/${locale}/legal/privacy`" class="contact-link">
          {{ t('request.contact.rgpdLink') }}
        </NuxtLink>
      </span>
    </label>

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

.contact-field input,
.contact-field select,
.contact-field textarea {
  width: 100%;
  padding: 0.7rem 0.85rem;
  border: 1px solid var(--color-misana-line);
  background: var(--color-misana-paper);
  color: var(--color-misana-ink);
  font-size: 0.95rem;
  font-family: inherit;
  border-radius: 2px;
}
.contact-field input:focus,
.contact-field select:focus,
.contact-field textarea:focus {
  outline: none;
  border-color: var(--color-misana-ink);
}
.contact-field textarea { resize: vertical; min-height: 100px; }

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
</style>

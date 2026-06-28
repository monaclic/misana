<script setup lang="ts">
import { useForm, useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';

const props = defineProps<{
  jobSlug: string;
  jobTitle: string;
}>();

const { locale } = useI18n();
const isFr = computed(() => locale.value === 'fr');

// ============================================================
// Zod schema — validation client. Le server re-valide tout.
// ============================================================
const schema = toTypedSchema(
  z.object({
    firstName:   z.string().min(1).max(80),
    lastName:    z.string().min(1).max(80),
    email:       z.string().email(),
    phone:       z.string().max(40).optional().or(z.literal('')),
    linkedin:    z.string().url().optional().or(z.literal('')),
    coverLetter: z.string().min(100).max(3000),
    consent:     z.literal(true, {
      errorMap: () => ({ message: isFr.value ? 'Requis' : 'Required' }),
    }),
    honeypot: z.string().optional(),
  }),
);

const { handleSubmit, errors, resetForm } = useForm({ validationSchema: schema });

const { value: firstName }   = useField<string>('firstName');
const { value: lastName }    = useField<string>('lastName');
const { value: email }       = useField<string>('email');
const { value: phone }       = useField<string>('phone');
const { value: linkedin }    = useField<string>('linkedin');
const { value: coverLetter } = useField<string>('coverLetter');
const { value: consent }     = useField<boolean>('consent');
const { value: honeypot }    = useField<string>('honeypot');

// ============================================================
// CV file handling
// ============================================================
const cvFile   = ref<File | null>(null);
const cvError  = ref('');

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const file  = input.files?.[0] ?? null;
  cvError.value = '';

  if (!file) { cvFile.value = null; return; }

  if (file.type !== 'application/pdf') {
    cvError.value = isFr.value ? 'Format PDF requis.' : 'PDF format required.';
    cvFile.value  = null;
    input.value   = '';
    return;
  }
  if (file.size > 3 * 1024 * 1024) {
    cvError.value = isFr.value ? 'Fichier trop lourd (max 3 Mo).' : 'File too large (max 3 MB).';
    cvFile.value  = null;
    input.value   = '';
    return;
  }
  cvFile.value = file;
}

// ============================================================
// Submit state
// ============================================================
const status = ref<'idle' | 'sending' | 'success' | 'error'>('idle');
const serverError = ref('');

const onSubmit = handleSubmit(async (values) => {
  if (!cvFile.value) {
    cvError.value = isFr.value ? 'Le CV est requis.' : 'CV is required.';
    return;
  }

  status.value = 'sending';
  serverError.value = '';

  const fd = new FormData();
  fd.append('jobSlug',     props.jobSlug);
  fd.append('jobTitle',    props.jobTitle);
  fd.append('firstName',   values.firstName);
  fd.append('lastName',    values.lastName);
  fd.append('email',       values.email);
  fd.append('phone',       values.phone ?? '');
  fd.append('linkedin',    values.linkedin ?? '');
  fd.append('coverLetter', values.coverLetter);
  fd.append('locale',      locale.value);
  fd.append('honeypot',    values.honeypot ?? '');
  fd.append('cv',          cvFile.value, cvFile.value.name);

  try {
    await $fetch('/api/apply', { method: 'POST', body: fd });
    status.value = 'success';
    resetForm();
    cvFile.value = null;
  } catch (err: any) {
    status.value    = 'error';
    serverError.value = err?.data?.statusMessage
      ?? (isFr.value ? 'Une erreur est survenue. Veuillez réessayer.' : 'Something went wrong. Please try again.');
  }
});

const coverLetterCount = computed(() => (coverLetter.value ?? '').length);
</script>

<template>
  <!-- Success state -->
  <div v-if="status === 'success'" class="apply-success" role="alert">
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="apply-success-icon">
      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.4" />
      <path d="M8 12.5l2.5 2.5 5-5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
    <div>
      <p class="apply-success-title">
        {{ isFr ? 'Candidature reçue.' : 'Application received.' }}
      </p>
      <p class="apply-success-body">
        {{ isFr
          ? 'Nous avons bien reçu votre dossier. Nous revenons vers vous si votre profil correspond.'
          : 'We have received your application. We will be in touch if your profile is a match.' }}
      </p>
    </div>
  </div>

  <!-- Form -->
  <form v-else class="apply-form" novalidate @submit.prevent="onSubmit">
    <p class="apply-form-title">
      {{ isFr ? 'Déposer votre candidature' : 'Submit your application' }}
    </p>

    <!-- Honeypot — caché, bot trap -->
    <input
      v-model="honeypot"
      type="text"
      name="website"
      tabindex="-1"
      autocomplete="off"
      aria-hidden="true"
      class="apply-honeypot"
    />

    <!-- Row : first + last name -->
    <div class="apply-row">
      <div class="apply-field">
        <label class="apply-label" for="af-first">
          {{ isFr ? 'Prénom' : 'First name' }} <span aria-hidden="true">*</span>
        </label>
        <input
          id="af-first"
          v-model="firstName"
          type="text"
          autocomplete="given-name"
          class="apply-input"
          :class="{ 'apply-input-error': errors.firstName }"
        />
        <p v-if="errors.firstName" class="apply-error" role="alert">
          {{ isFr ? 'Prénom requis.' : 'First name required.' }}
        </p>
      </div>

      <div class="apply-field">
        <label class="apply-label" for="af-last">
          {{ isFr ? 'Nom' : 'Last name' }} <span aria-hidden="true">*</span>
        </label>
        <input
          id="af-last"
          v-model="lastName"
          type="text"
          autocomplete="family-name"
          class="apply-input"
          :class="{ 'apply-input-error': errors.lastName }"
        />
        <p v-if="errors.lastName" class="apply-error" role="alert">
          {{ isFr ? 'Nom requis.' : 'Last name required.' }}
        </p>
      </div>
    </div>

    <!-- Email -->
    <div class="apply-field">
      <label class="apply-label" for="af-email">
        Email <span aria-hidden="true">*</span>
      </label>
      <input
        id="af-email"
        v-model="email"
        type="email"
        autocomplete="email"
        class="apply-input"
        :class="{ 'apply-input-error': errors.email }"
      />
      <p v-if="errors.email" class="apply-error" role="alert">
        {{ isFr ? 'Adresse email valide requise.' : 'A valid email address is required.' }}
      </p>
    </div>

    <!-- Phone (optional) -->
    <div class="apply-field">
      <label class="apply-label" for="af-phone">
        {{ isFr ? 'Téléphone' : 'Phone' }}
        <span class="apply-label-opt">{{ isFr ? '(optionnel)' : '(optional)' }}</span>
      </label>
      <input
        id="af-phone"
        v-model="phone"
        type="tel"
        autocomplete="tel"
        class="apply-input"
      />
    </div>

    <!-- LinkedIn (optional) -->
    <div class="apply-field">
      <label class="apply-label" for="af-linkedin">
        LinkedIn
        <span class="apply-label-opt">{{ isFr ? '(optionnel)' : '(optional)' }}</span>
      </label>
      <input
        id="af-linkedin"
        v-model="linkedin"
        type="url"
        placeholder="https://linkedin.com/in/…"
        class="apply-input"
        :class="{ 'apply-input-error': errors.linkedin }"
      />
      <p v-if="errors.linkedin" class="apply-error" role="alert">
        {{ isFr ? 'URL valide requise (https://…).' : 'Valid URL required (https://…).' }}
      </p>
    </div>

    <!-- CV upload -->
    <div class="apply-field">
      <label class="apply-label" for="af-cv">
        CV <span aria-hidden="true">*</span>
        <span class="apply-label-opt">PDF · max 3 Mo</span>
      </label>
      <div class="apply-file-wrap">
        <label for="af-cv" class="apply-file-btn">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="apply-file-icon">
            <path d="M12 15V3M12 3L8 7M12 3L16 7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M3 17v2a2 2 0 002 2h14a2 2 0 002-2v-2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
          </svg>
          <span>{{ cvFile ? cvFile.name : (isFr ? 'Choisir un fichier' : 'Choose file') }}</span>
        </label>
        <input
          id="af-cv"
          type="file"
          accept="application/pdf,.pdf"
          class="apply-file-input"
          @change="onFileChange"
        />
      </div>
      <p v-if="cvError" class="apply-error" role="alert">{{ cvError }}</p>
    </div>

    <!-- Cover letter -->
    <div class="apply-field">
      <label class="apply-label" for="af-cover">
        {{ isFr ? 'Lettre de motivation' : 'Cover letter' }} <span aria-hidden="true">*</span>
      </label>
      <textarea
        id="af-cover"
        v-model="coverLetter"
        rows="8"
        class="apply-textarea"
        :class="{ 'apply-input-error': errors.coverLetter }"
        :placeholder="isFr
          ? 'Présentez-vous et expliquez pourquoi vous souhaitez rejoindre Misana…'
          : 'Introduce yourself and explain why you want to join Misana…'"
      />
      <p class="apply-char-count" :class="{ 'apply-char-min': coverLetterCount < 100 }">
        {{ coverLetterCount }} / 3000
        <span v-if="coverLetterCount < 100" class="ml-2 opacity-70">
          ({{ isFr ? `min. 100 car.` : `min. 100 chars` }})
        </span>
      </p>
      <p v-if="errors.coverLetter" class="apply-error" role="alert">
        {{ isFr ? 'Minimum 100 caractères requis.' : 'At least 100 characters required.' }}
      </p>
    </div>

    <!-- Consent -->
    <div class="apply-consent-wrap">
      <label class="apply-consent">
        <input v-model="consent" type="checkbox" class="apply-checkbox" />
        <span class="apply-consent-text">
          {{ isFr
            ? "J'accepte que Misana conserve ces informations pour traiter ma candidature. Données hébergées dans l'UE, jamais transmises à des tiers."
            : "I agree that Misana stores the information above to process my application. Data held in the EU, never shared." }}
        </span>
      </label>
      <p v-if="errors.consent" class="apply-error" role="alert">
        {{ isFr ? 'Veuillez cocher la case pour continuer.' : 'Please agree to continue.' }}
      </p>
    </div>

    <!-- Server error -->
    <p v-if="status === 'error'" class="apply-error apply-error-server" role="alert">
      {{ serverError }}
    </p>

    <!-- Submit -->
    <button type="submit" class="apply-submit" :disabled="status === 'sending'">
      <span>{{ status === 'sending'
        ? (isFr ? 'Envoi en cours…' : 'Sending…')
        : (isFr ? 'Envoyer ma candidature' : 'Send my application') }}</span>
      <svg v-if="status !== 'sending'" viewBox="0 0 24 24" fill="none" aria-hidden="true" class="apply-submit-arrow">
        <path d="M7 12H17" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
        <path d="M13.5 8.5L17 12L13.5 15.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>
  </form>
</template>

<style scoped>
/* Success */
.apply-success {
  display: flex;
  align-items: flex-start;
  gap: 1.25rem;
  padding: 2rem;
  border: 1px solid var(--color-misana-line);
  border-radius: 4px;
  background: var(--color-misana-stone);
}
.apply-success-icon {
  width: 2rem;
  height: 2rem;
  flex-shrink: 0;
  color: var(--color-misana-ink);
  margin-top: 0.1rem;
}
.apply-success-title {
  font-family: var(--font-display);
  font-size: 1.2rem;
  margin: 0 0 0.4rem;
}
.apply-success-body {
  font-size: 0.9rem;
  color: var(--color-misana-muted);
  line-height: 1.6;
  margin: 0;
}

/* Form */
.apply-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.apply-form-title {
  font-size: 0.68rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--color-misana-muted);
  margin: 0;
}

/* Honeypot : visuellement absent, accessible aux bots */
.apply-honeypot {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
}

.apply-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
@media (max-width: 640px) {
  .apply-row { grid-template-columns: 1fr; }
}

.apply-field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.apply-label {
  font-size: 0.65rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-misana-muted);
}
.apply-label-opt {
  margin-left: 0.4rem;
  opacity: 0.6;
  font-size: 0.62rem;
  letter-spacing: 0.1em;
}

.apply-input,
.apply-textarea {
  width: 100%;
  background: var(--color-misana-stone);
  border: 1px solid var(--color-misana-line);
  border-radius: 3px;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  font-family: inherit;
  color: var(--color-misana-ink);
  transition: border-color 0.25s ease;
  outline: none;
  -webkit-appearance: none;
}
.apply-input:focus,
.apply-textarea:focus { border-color: var(--color-misana-ink); }
.apply-input-error { border-color: #c0392b !important; }
.apply-textarea { resize: vertical; min-height: 160px; line-height: 1.6; }

.apply-char-count {
  font-size: 0.65rem;
  letter-spacing: 0.1em;
  color: var(--color-misana-muted);
  text-align: right;
  margin: 0;
}
.apply-char-min { color: #c0392b; }

/* File input */
.apply-file-wrap { position: relative; }
.apply-file-input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
  width: 100%;
  height: 100%;
}
.apply-file-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.75rem 1rem;
  background: var(--color-misana-stone);
  border: 1px solid var(--color-misana-line);
  border-radius: 3px;
  font-size: 0.88rem;
  color: var(--color-misana-muted);
  cursor: pointer;
  transition: border-color 0.25s ease;
  width: 100%;
}
.apply-file-btn:hover { border-color: var(--color-misana-ink); }
.apply-file-icon { width: 1.1rem; height: 1.1rem; flex-shrink: 0; }

.apply-error {
  font-size: 0.72rem;
  color: #c0392b;
  margin: 0;
}
.apply-error-server {
  padding: 0.75rem 1rem;
  background: #fdf2f2;
  border: 1px solid #f5c6c6;
  border-radius: 3px;
}

/* Consent */
.apply-consent-wrap { display: flex; flex-direction: column; gap: 0.4rem; }
.apply-consent {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  cursor: pointer;
}
.apply-checkbox {
  flex-shrink: 0;
  margin-top: 0.15rem;
  width: 1rem;
  height: 1rem;
  accent-color: var(--color-misana-ink);
  cursor: pointer;
}
.apply-consent-text {
  font-size: 0.8rem;
  line-height: 1.55;
  color: var(--color-misana-muted);
}

/* Submit */
.apply-submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.85rem;
  align-self: flex-start;
  padding: 0.9rem 2rem;
  background: var(--color-misana-ink);
  color: var(--color-misana-paper);
  font-size: 0.8rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  border: 0;
  border-radius: 999px;
  cursor: pointer;
  font-family: inherit;
  transition: opacity 0.25s ease;
}
.apply-submit:hover:not(:disabled) { opacity: 0.85; }
.apply-submit:disabled { opacity: 0.5; cursor: not-allowed; }
.apply-submit-arrow { width: 1.1rem; height: 1.1rem; }

@media (max-width: 640px) {
  .apply-submit { width: 100%; }
}

@media (prefers-reduced-motion: reduce) {
  .apply-input, .apply-textarea, .apply-file-btn, .apply-submit { transition: none !important; }
}
</style>

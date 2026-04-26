<script setup lang="ts">
import { useRequestStore } from '~/stores/request';
import { REPLY_LANGS } from '~/types/request';

const store = useRequestStore();
const { locale, t } = useI18n();
const c = store.contact;
const b = store.billing;

// Defaut : FR pour locale fr (+33), US/CA pour locale en (+1).
if (!c.phoneCode) {
  c.phoneCode = locale.value === 'fr' ? '+33' : '+1';
}
</script>

<template>
  <section class="space-y-8">
    <div>
      <h2 class="font-display text-3xl mb-2">{{ t('request.step.contact') }}</h2>
      <p class="text-misana-muted text-sm">{{ t('request.contactIntro') }}</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label class="block text-xs uppercase tracking-wide text-misana-muted mb-1" for="c-first">
          {{ t('request.contact.firstName') }} *
        </label>
        <input
          id="c-first"
          v-model="c.firstName"
          type="text"
          required
          class="w-full border-b border-misana-line py-2 bg-transparent focus:border-misana-ink outline-none"
          :placeholder="t('request.contact.firstNameHint')"
        />
      </div>
      <div>
        <label class="block text-xs uppercase tracking-wide text-misana-muted mb-1" for="c-last">
          {{ t('request.contact.lastName') }} *
        </label>
        <input
          id="c-last"
          v-model="c.lastName"
          type="text"
          required
          class="w-full border-b border-misana-line py-2 bg-transparent focus:border-misana-ink outline-none"
          :placeholder="t('request.contact.lastNameHint')"
        />
      </div>
      <div>
        <label class="block text-xs uppercase tracking-wide text-misana-muted mb-1" for="c-email">
          {{ t('request.contact.email') }} *
        </label>
        <input
          id="c-email"
          v-model="c.email"
          type="email"
          required
          class="w-full border-b border-misana-line py-2 bg-transparent focus:border-misana-ink outline-none"
          :placeholder="t('request.contact.emailHint')"
        />
      </div>
      <div>
        <label class="block text-xs uppercase tracking-wide text-misana-muted mb-1" for="c-phone">
          {{ t('request.contact.phone') }}
        </label>
        <div class="flex items-end gap-2">
          <PhoneCodeSelect v-model="c.phoneCode" />
          <input
            id="c-phone"
            v-model="c.phone"
            type="tel"
            class="flex-1 border-b border-misana-line py-2 bg-transparent focus:border-misana-ink outline-none"
            :placeholder="t('request.contact.phoneHint')"
          />
        </div>
      </div>
    </div>

    <label class="inline-flex items-center gap-2 text-sm">
      <input v-model="c.whatsapp" type="checkbox" class="accent-misana-ink" />
      {{ t('request.contact.whatsappSame') }}
    </label>

    <div>
      <label class="block text-xs uppercase tracking-wide text-misana-muted mb-2" for="c-reply-lang">
        {{ t('request.contact.lang') }}
      </label>
      <div class="flex gap-2">
        <button
          v-for="lng in REPLY_LANGS"
          :key="lng"
          type="button"
          class="text-sm px-4 py-2 transition border"
          :class="
            store.replyLang === lng
              ? 'border-misana-ink bg-misana-ink text-misana-paper'
              : 'border-misana-line hover:border-misana-ink'
          "
          @click="store.replyLang = lng"
        >
          {{ t(`request.replyLang.${lng}`) }}
        </button>
      </div>
    </div>

    <div class="border-t border-misana-line pt-6 space-y-4">
      <label class="inline-flex items-center gap-2 text-sm">
        <input v-model="c.isOther" type="checkbox" class="accent-misana-ink" />
        {{ t('request.contact.bookingForOther') }}
      </label>
      <div v-if="c.isOther" class="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-6">
        <div>
          <label class="block text-xs uppercase tracking-wide text-misana-muted mb-1">
            {{ t('request.contact.guestFirstName') }}
          </label>
          <input
            v-model="c.guestFirstName"
            type="text"
            class="w-full border-b border-misana-line py-2 bg-transparent focus:border-misana-ink outline-none"
          />
        </div>
        <div>
          <label class="block text-xs uppercase tracking-wide text-misana-muted mb-1">
            {{ t('request.contact.guestLastName') }}
          </label>
          <input
            v-model="c.guestLastName"
            type="text"
            class="w-full border-b border-misana-line py-2 bg-transparent focus:border-misana-ink outline-none"
          />
        </div>
        <div class="sm:col-span-2">
          <label class="block text-xs uppercase tracking-wide text-misana-muted mb-1">
            {{ t('request.contact.guestPhone') }}
          </label>
          <input
            v-model="c.guestPhone"
            type="tel"
            class="w-full border-b border-misana-line py-2 bg-transparent focus:border-misana-ink outline-none"
          />
        </div>
      </div>
    </div>

    <div class="border-t border-misana-line pt-6 space-y-4">
      <label class="inline-flex items-center gap-2 text-sm">
        <input v-model="b.enabled" type="checkbox" class="accent-misana-ink" />
        {{ t('request.billing.toggle') }}
      </label>
      <div v-if="b.enabled" class="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-6">
        <div>
          <label class="block text-xs uppercase tracking-wide text-misana-muted mb-1">
            {{ t('request.billing.company') }}
          </label>
          <input v-model="b.company" type="text" class="w-full border-b border-misana-line py-2 bg-transparent focus:border-misana-ink outline-none" />
        </div>
        <div>
          <label class="block text-xs uppercase tracking-wide text-misana-muted mb-1">
            {{ t('request.billing.vat') }}
          </label>
          <input v-model="b.vat" type="text" class="w-full border-b border-misana-line py-2 bg-transparent focus:border-misana-ink outline-none" />
        </div>
        <div class="sm:col-span-2">
          <label class="block text-xs uppercase tracking-wide text-misana-muted mb-1">
            {{ t('request.billing.address') }}
          </label>
          <input v-model="b.address" type="text" class="w-full border-b border-misana-line py-2 bg-transparent focus:border-misana-ink outline-none" />
        </div>
        <div>
          <label class="block text-xs uppercase tracking-wide text-misana-muted mb-1">
            {{ t('request.billing.city') }}
          </label>
          <input v-model="b.city" type="text" class="w-full border-b border-misana-line py-2 bg-transparent focus:border-misana-ink outline-none" />
        </div>
        <div>
          <label class="block text-xs uppercase tracking-wide text-misana-muted mb-1">
            {{ t('request.billing.zip') }}
          </label>
          <input v-model="b.zip" type="text" class="w-full border-b border-misana-line py-2 bg-transparent focus:border-misana-ink outline-none" />
        </div>
        <div>
          <label class="block text-xs uppercase tracking-wide text-misana-muted mb-1">
            {{ t('request.billing.country') }}
          </label>
          <input v-model="b.country" type="text" class="w-full border-b border-misana-line py-2 bg-transparent focus:border-misana-ink outline-none" />
        </div>
        <div>
          <label class="block text-xs uppercase tracking-wide text-misana-muted mb-1">
            {{ t('request.billing.email') }}
          </label>
          <input v-model="b.email" type="email" class="w-full border-b border-misana-line py-2 bg-transparent focus:border-misana-ink outline-none" />
        </div>
      </div>
    </div>

    <div>
      <label class="block text-xs uppercase tracking-wide text-misana-muted mb-1" for="c-msg">
        {{ t('request.contact.message') }}
      </label>
      <textarea
        id="c-msg"
        v-model="c.message"
        rows="4"
        class="w-full border border-misana-line p-3 bg-transparent focus:border-misana-ink outline-none"
        :placeholder="t('request.contact.messageHint')"
      ></textarea>
    </div>
  </section>
</template>

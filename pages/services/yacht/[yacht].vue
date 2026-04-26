<script setup lang="ts">
// Fiche produit yacht. 4 fiches V1 generees dynamiquement depuis lib/yachts.ts.
// Form embedded preset yacht + yachtId.
import { YACHTS, findYachtById } from '~/lib/yachts';

definePageMeta({ layout: 'default' });

const route = useRoute();
const { locale, t } = useI18n();
const localePath = useLocalePath();
const slug = computed(() => String(route.params.yacht));

const y = computed(() => findYachtById(slug.value));
if (!y.value) {
  throw createError({ statusCode: 404, statusMessage: 'Yacht not found', fatal: true });
}

const yacht = y.value;

useSeoMeta({
  title: () => `${yacht.name} — ${yacht.fullName}`,
  description: () =>
    locale.value === 'fr'
      ? `Charter ${yacht.fullName}. ${yacht.lengthM} metres, ${yacht.guests} personnes, ${yacht.cabins} cabines, ${yacht.crew} equipage. A partir de ${yacht.pricePerWeekFrom} EUR par semaine.`
      : `Charter ${yacht.fullName}. ${yacht.lengthM} metres, ${yacht.guests} guests, ${yacht.cabins} cabins, ${yacht.crew} crew. From ${yacht.pricePerWeekFrom} EUR per week.`,
});

const presetData = computed(() => ({
  yacht: { yachtId: yacht.id, size: yacht.size },
}));

const idx = ref(0);
const total = computed(() => yacht.images.length);
function prev() { idx.value = (idx.value - 1 + total.value) % total.value; }
function next() { idx.value = (idx.value + 1) % total.value; }

function fmtPrice(p: number | null): string {
  if (p === null) return t('yacht.onRequest');
  return new Intl.NumberFormat(locale.value === 'fr' ? 'fr-FR' : 'en-GB', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(p);
}

const sameSize = computed(() =>
  YACHTS.filter((x) => x.size === yacht.size && x.id !== yacht.id).slice(0, 3),
);
</script>

<template>
  <main class="min-h-screen">
    <section class="border-b border-misana-line">
      <div class="max-w-7xl mx-auto px-6 py-12 grid lg:grid-cols-12 gap-8">
        <div class="lg:col-span-7">
          <div class="aspect-[4/3] relative overflow-hidden bg-misana-stone group">
            <img
              v-for="(src, i) in yacht.images"
              :key="src"
              :src="src"
              :alt="`${yacht.name} (${i + 1}/${total})`"
              loading="lazy"
              class="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
              :class="i === idx ? 'opacity-100' : 'opacity-0'"
            />
            <button
              v-if="total > 1"
              type="button"
              aria-label="Previous"
              class="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 inline-flex items-center justify-center bg-misana-paper/80 hover:bg-misana-paper text-misana-ink opacity-0 group-hover:opacity-100 transition"
              @click="prev"
            >‹</button>
            <button
              v-if="total > 1"
              type="button"
              aria-label="Next"
              class="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 inline-flex items-center justify-center bg-misana-paper/80 hover:bg-misana-paper text-misana-ink opacity-0 group-hover:opacity-100 transition"
              @click="next"
            >›</button>
            <div v-if="total > 1" class="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              <button
                v-for="(_, i) in yacht.images"
                :key="i"
                type="button"
                class="w-2 h-2 rounded-full transition"
                :class="i === idx ? 'bg-misana-paper' : 'bg-misana-paper/50 hover:bg-misana-paper/80'"
                @click="idx = i"
              ></button>
            </div>
          </div>
        </div>

        <div class="lg:col-span-5 flex flex-col">
          <p class="text-xs uppercase tracking-widest text-misana-muted mb-3">
            {{ yacht.builder }} · {{ yacht.year }}
          </p>
          <h1 class="font-display text-3xl sm:text-4xl mb-1">{{ yacht.name }}</h1>
          <p class="text-misana-muted mb-6">{{ yacht.fullName }}</p>

          <dl class="grid grid-cols-2 gap-4 mb-10">
            <div class="border border-misana-line p-4">
              <dt class="text-[10px] uppercase tracking-widest text-misana-muted">{{ t('yacht.length') }}</dt>
              <dd class="font-display text-2xl mt-1">{{ yacht.lengthM }} <span class="text-sm">m</span></dd>
            </div>
            <div class="border border-misana-line p-4">
              <dt class="text-[10px] uppercase tracking-widest text-misana-muted">{{ t('yacht.guests') }}</dt>
              <dd class="font-display text-2xl mt-1">{{ yacht.guests }}</dd>
            </div>
            <div class="border border-misana-line p-4">
              <dt class="text-[10px] uppercase tracking-widest text-misana-muted">{{ t('yacht.cabins') }}</dt>
              <dd class="font-display text-2xl mt-1">{{ yacht.cabins }}</dd>
            </div>
            <div class="border border-misana-line p-4">
              <dt class="text-[10px] uppercase tracking-widest text-misana-muted">{{ t('yacht.crew') }}</dt>
              <dd class="font-display text-2xl mt-1">{{ yacht.crew }}</dd>
            </div>
            <div class="border border-misana-line p-4">
              <dt class="text-[10px] uppercase tracking-widest text-misana-muted">{{ t('yacht.cruisingSpeed') }}</dt>
              <dd class="font-display text-xl mt-1">{{ yacht.cruisingKnots }} <span class="text-sm">kn</span></dd>
            </div>
            <div class="border border-misana-line p-4">
              <dt class="text-[10px] uppercase tracking-widest text-misana-muted">{{ t('yacht.bracket') }}</dt>
              <dd class="font-display text-xl mt-1">{{ yacht.size }}</dd>
            </div>
          </dl>

          <div class="border border-misana-line p-5 mb-8">
            <p class="text-xs uppercase tracking-widest text-misana-muted mb-4">{{ t('yacht.charterRates') }}</p>
            <dl class="space-y-2 text-sm">
              <div v-if="yacht.pricePerDay" class="flex justify-between">
                <dt class="text-misana-muted">{{ t('yacht.dailyRate') }}</dt>
                <dd class="font-medium">{{ fmtPrice(yacht.pricePerDay) }} / {{ t('yacht.day') }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-misana-muted">{{ t('yacht.weekly') }}</dt>
                <dd class="font-medium">
                  {{ t('yacht.from') }} {{ fmtPrice(yacht.pricePerWeekFrom) }}
                  <span v-if="yacht.pricePerWeekTo">to {{ fmtPrice(yacht.pricePerWeekTo) }}</span>
                </dd>
              </div>
            </dl>
            <p class="text-xs text-misana-muted mt-4 italic">{{ t('yacht.priceFootnote') }}</p>
          </div>

          <a href="#request-form" class="border border-misana-ink px-6 py-3 text-sm tracking-wide hover:bg-misana-ink hover:text-misana-paper transition text-center">
            {{ t('yacht.charterCta') }} →
          </a>
        </div>
      </div>
    </section>

    <section id="request-form" class="border-b border-misana-line">
      <div class="max-w-3xl mx-auto px-6 py-16">
        <p class="text-xs uppercase tracking-widest text-misana-muted mb-3">{{ t('yacht.formKicker') }}</p>
        <h2 class="font-display text-3xl mb-8">{{ t('yacht.formTitle', { name: yacht.name }) }}</h2>
        <RequestForm
          :preset-service="'yacht'"
          :preset-data="presetData"
          :lock-service="true"
          :embedded="true"
        />
      </div>
    </section>

    <section v-if="sameSize.length" class="max-w-7xl mx-auto px-6 py-16">
      <h2 class="font-display text-2xl mb-8">{{ t('yacht.relatedSection') }}</h2>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <NuxtLink
          v-for="other in sameSize"
          :key="other.id"
          :to="localePath(`/services/yacht/${other.id}`)"
          class="group ring-1 ring-misana-line hover:ring-misana-ink transition overflow-hidden bg-misana-paper"
        >
          <div class="aspect-[4/3] relative overflow-hidden bg-misana-stone">
            <img :src="other.hero" :alt="other.fullName" loading="lazy" class="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-[1.02]" />
          </div>
          <div class="p-4">
            <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-1">
              {{ other.builder }} · {{ other.lengthM }} m
            </p>
            <p class="text-sm font-medium">{{ other.name }}</p>
            <p class="text-xs text-misana-muted mt-1">
              {{ t('yacht.from') }} {{ fmtPrice(other.pricePerWeekFrom) }} / {{ t('yacht.week') }}
            </p>
          </div>
        </NuxtLink>
      </div>
    </section>
  </main>
</template>

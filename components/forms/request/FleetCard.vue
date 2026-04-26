<script setup lang="ts">
// Card visuelle reutilisable. Hero image quand image fournie, fallback typo
// sur fond stone sinon. Voix Misana sobre, pas de prix, badges discrets.

defineProps<{
  selected?: boolean;
  title: string;
  sub?: string;
  meta?: { icon: 'pax' | 'luggage' | 'speed'; text: string }[];
  features?: string;
  badge?: 'popular' | 'flagship';
  badgeLabel?: string;
  image?: string;
}>();
defineEmits<{ (e: 'select'): void }>();
</script>

<template>
  <button
    type="button"
    class="group relative text-left transition overflow-hidden flex flex-col bg-misana-paper"
    :class="
      selected
        ? 'ring-1 ring-misana-ink'
        : 'ring-1 ring-misana-line hover:ring-misana-ink'
    "
    @click="$emit('select')"
  >
    <div class="aspect-[4/3] relative overflow-hidden">
      <img
        v-if="image"
        :src="image"
        :alt="title"
        loading="lazy"
        class="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-[1.02]"
      />
      <div
        v-else
        class="absolute inset-0 bg-misana-stone flex items-center justify-center px-6"
      >
        <span class="font-display text-xl text-misana-ink/70 text-center leading-tight">
          {{ title }}
        </span>
      </div>

      <span
        v-if="badge"
        class="absolute top-3 left-3 text-[10px] uppercase tracking-widest px-2 py-1 bg-misana-paper text-misana-ink"
      >
        {{ badgeLabel }}
      </span>
      <span
        v-if="selected"
        class="absolute top-3 right-3 w-6 h-6 inline-flex items-center justify-center text-xs bg-misana-ink text-misana-paper rounded-full"
        aria-hidden="true"
      >
        ✓
      </span>
    </div>

    <div class="p-4">
      <p class="text-sm font-medium leading-tight">{{ title }}</p>
      <p v-if="sub" class="text-xs text-misana-muted mt-0.5">{{ sub }}</p>

      <ul v-if="meta && meta.length" class="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-misana-muted">
        <li v-for="(m, i) in meta" :key="i" class="inline-flex items-center gap-1.5">
          <span aria-hidden="true">
            <svg v-if="m.icon === 'pax'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="7" r="4" />
              <path d="M4 21c0-4.5 3.5-8 8-8s8 3.5 8 8" />
            </svg>
            <svg v-else-if="m.icon === 'luggage'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="5" y="7" width="14" height="13" rx="1.5" />
              <path d="M9 7V4h6v3M9 12v6M15 12v6" />
            </svg>
            <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
          </span>
          {{ m.text }}
        </li>
      </ul>
    </div>
  </button>
</template>

<script setup lang="ts">
// Breadcrumb component reutilisable. Genere aussi BreadcrumbList JSON-LD.
import type { ConcreteComponent } from 'vue';

type Crumb = { label: string; to?: string };
const props = defineProps<{ items: Crumb[] }>();

const config = useRuntimeConfig();
const localePath = useLocalePath();
const route = useRoute();
const siteUrl = computed(() => (config.public as any).siteUrl || 'https://misana.com');

const ldjson = computed(() => {
  const items = props.items.map((c, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: c.label,
    item: c.to ? `${siteUrl.value}${localePath(c.to)}` : `${siteUrl.value}${route.path}`,
  }));
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  });
});

useHead({
  script: [{ type: 'application/ld+json', innerHTML: ldjson.value }],
});
</script>

<template>
  <nav aria-label="Breadcrumb" class="text-xs text-misana-muted mb-4">
    <ol class="flex flex-wrap items-center gap-2">
      <li v-for="(c, i) in items" :key="i" class="flex items-center gap-2">
        <NuxtLink v-if="c.to" :to="localePath(c.to)" class="hover:text-misana-ink transition">
          {{ c.label }}
        </NuxtLink>
        <span v-else class="text-misana-ink">{{ c.label }}</span>
        <span v-if="i < items.length - 1" aria-hidden="true">·</span>
      </li>
    </ol>
  </nav>
</template>

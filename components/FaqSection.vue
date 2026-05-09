<script setup lang="ts">
// Section FAQ partagee, semantique pure (details/summary), zero JS.
// Affiche un schema.org FAQPage en JSON-LD pour SEO + AEO (Perplexity,
// ChatGPT search, Google AI Overviews).
//
// Le toggle visuel + -> x est en CSS pur via [open] sur details.

type FaqItem = { question: string; answer: string };

const props = defineProps<{
  id?: string;
  title: string;
  items: FaqItem[];
}>();

// Schema.org FAQPage. acceptedAnswer.text = plain text (les reponses sont
// deja en plain text, pas de HTML a stripper).
const ldjson = computed(() => JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: props.items.map((it) => ({
    '@type': 'Question',
    name: it.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: it.answer,
    },
  })),
}));

useHead({
  script: [{ type: 'application/ld+json', innerHTML: ldjson.value }],
});

const headingId = computed(() => `faq-title-${props.id || 'main'}`);
</script>

<template>
  <section
    class="faq-section bg-misana-ink text-misana-paper"
    :aria-labelledby="headingId"
  >
    <div class="max-w-[1200px] mx-auto px-6 sm:px-12 py-16 sm:py-24">
      <h2
        :id="headingId"
        class="font-display text-3xl sm:text-4xl lg:text-5xl leading-[1.05] mb-10 sm:mb-14"
      >
        {{ title }}
      </h2>

      <ul class="faq-list">
        <li v-for="(it, i) in items" :key="i" class="faq-item">
          <details class="faq-details">
            <summary class="faq-summary">
              <span class="faq-question">{{ it.question }}</span>
              <span class="faq-toggle" aria-hidden="true"></span>
            </summary>
            <p class="faq-answer">{{ it.answer }}</p>
          </details>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.faq-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.faq-item {
  border-top: 1px solid rgba(255, 255, 255, 0.15);
}
.faq-item:last-child {
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
}

.faq-details {
  padding: 0;
}

.faq-summary {
  list-style: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 1.5rem 0;
  user-select: none;
  transition: color 0.2s ease;
}
.faq-summary::-webkit-details-marker {
  display: none;
}
.faq-summary::marker {
  display: none;
  content: '';
}
.faq-summary:hover {
  color: rgba(255, 255, 255, 0.7);
}

.faq-question {
  font-family: var(--font-display);
  font-size: 1.125rem;
  line-height: 1.35;
  flex: 1;
  min-width: 0;
}
@media (min-width: 640px) {
  .faq-question { font-size: 1.35rem; }
}

.faq-toggle {
  position: relative;
  flex-shrink: 0;
  width: 1.1rem;
  height: 1.1rem;
}
.faq-toggle::before,
.faq-toggle::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  height: 1.5px;
  background: currentColor;
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.faq-toggle::after {
  transform: rotate(90deg);
}
.faq-details[open] .faq-toggle::before {
  transform: rotate(45deg);
}
.faq-details[open] .faq-toggle::after {
  transform: rotate(-45deg);
}

.faq-answer {
  margin: 0;
  padding: 0 0 1.5rem;
  font-size: 0.95rem;
  line-height: 1.65;
  color: rgba(255, 255, 255, 0.7);
  max-width: 70ch;
}
@media (min-width: 640px) {
  .faq-answer { font-size: 1rem; }
}
</style>

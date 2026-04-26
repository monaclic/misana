<script setup lang="ts">
// Listing cars par categorie (sport, supercar, suv, sedan, convertible). Step 3 SEO.
import { RENTAL_CARS, RENTAL_CATEGORIES, type RentalCarCategory } from '~/lib/rentalCars';

definePageMeta({ layout: 'default' });

const route = useRoute();
const { locale, t } = useI18n();
const localePath = useLocalePath();

const VALID_CATEGORIES: RentalCarCategory[] = ['sport', 'supercar', 'suv', 'sedan', 'convertible'];
const category = computed(() => String(route.params.category) as RentalCarCategory);

if (!VALID_CATEGORIES.includes(category.value)) {
  throw createError({ statusCode: 404, statusMessage: 'Category not found', fatal: true });
}

const cat = computed(() => RENTAL_CATEGORIES.find((c) => c.id === category.value)!);

const CATEGORY_LEAD: Record<RentalCarCategory, { en: string; fr: string }> = {
  supercar: {
    en: 'Ferrari, Lamborghini, McLaren. The cars that close any debate. Carbon trim, eight hundred horsepower, three hundred kilometres an hour.',
    fr: 'Ferrari, Lamborghini, McLaren. Les voitures qui closent tout débat. Finitions carbone, huit cents chevaux, trois cents kilomètres heure.',
  },
  sport: {
    en: 'Performance saloons and grand tourers. Audi RS, Mercedes AMG, Porsche, Aston Martin. The week along the coast at six hundred horsepower.',
    fr: 'Berlines de performance et grands tourismes. Audi RS, Mercedes AMG, Porsche, Aston Martin. La semaine sur la côte à six cents chevaux.',
  },
  suv: {
    en: 'The terrain SUV when the coast climbs. Range Rover, Cayenne, Bentayga, Cullinan, Urus, G63. Six seats, the right ground clearance for the Cap-Ferrat road.',
    fr: 'Le SUV terrain quand la côte grimpe. Range Rover, Cayenne, Bentayga, Cullinan, Urus, G63. Six places, la bonne garde au sol pour la route du Cap-Ferrat.',
  },
  sedan: {
    en: 'The sedan when discretion matters. Maybach, Mercedes Class E, Bentley Mulsanne. Twelve cylinders, the silence at speed, the right car for a long week.',
    fr: 'La berline quand la discrétion compte. Maybach, Mercedes Classe E, Bentley Mulsanne. Douze cylindres, le silence à vitesse, la bonne voiture pour une longue semaine.',
  },
  convertible: {
    en: 'Cabriolets and roadsters for the coast in summer. SL 63, Continental GTC, Roma Spider, Dawn. The wind on the Croisette, the sun on the Cap.',
    fr: 'Cabriolets et roadsters pour la côte en été. SL 63, Continental GTC, Roma Spider, Dawn. Le vent sur la Croisette, le soleil sur le Cap.',
  },
};

useSeoMeta({
  title: () => locale.value === 'fr'
    ? `${cat.value.labelFr} à louer sur la Côte d'Azur`
    : `${cat.value.label} rental on the French Riviera`,
  description: () => locale.value === 'fr' ? CATEGORY_LEAD[category.value].fr : CATEGORY_LEAD[category.value].en,
});

const matched = computed(() => RENTAL_CARS.filter((c) => c.category === category.value));

function fmtPrice(p: number): string {
  return new Intl.NumberFormat(locale.value === 'fr' ? 'fr-FR' : 'en-GB', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(p);
}
</script>

<template>
  <main class="min-h-screen">
    <section class="bg-misana-stone border-b border-misana-line">
      <div class="max-w-5xl mx-auto px-6 py-16 sm:py-24">
        <p class="text-xs uppercase tracking-widest text-misana-muted mb-4">
          <NuxtLink :to="localePath('/services/cars')" class="hover:text-misana-ink">{{ t('cars.kicker') }}</NuxtLink>
          <span class="mx-2">·</span>
          {{ locale === 'fr' ? cat.labelFr : cat.label }}
        </p>
        <h1 class="font-display text-4xl sm:text-5xl mb-4">
          {{ locale === 'fr' ? `${cat.labelFr} à louer sur la Côte d'Azur` : `${cat.label} rental on the French Riviera` }}
        </h1>
        <p class="text-misana-muted text-lg max-w-2xl">{{ locale === 'fr' ? CATEGORY_LEAD[category].fr : CATEGORY_LEAD[category].en }}</p>
      </div>
    </section>

    <section class="max-w-7xl mx-auto px-6 py-12">
      <p class="text-xs text-misana-muted mb-8">{{ matched.length }} {{ $t('cars.results', matched.length) }}</p>

      <div v-if="matched.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <NuxtLink
          v-for="car in matched"
          :key="car.id"
          :to="localePath(`/services/cars/${car.id}`)"
          class="group ring-1 ring-misana-line hover:ring-misana-ink transition overflow-hidden bg-misana-paper flex flex-col"
        >
          <div class="aspect-[4/3] relative overflow-hidden bg-misana-stone">
            <img :src="car.hero" :alt="car.fullName" loading="lazy" class="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-[1.02]" />
            <span v-if="car.badge" class="absolute top-3 left-3 text-[10px] uppercase tracking-widest px-2 py-1 bg-misana-paper text-misana-ink">{{ t(`request.fleet.badge.${car.badge}`) }}</span>
          </div>
          <div class="p-5 flex-1 flex flex-col">
            <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-1">{{ car.brand }}</p>
            <p class="text-sm font-medium leading-tight">{{ car.model }}</p>
            <p class="text-xs text-misana-muted mt-1">{{ locale === 'fr' ? car.descFr : car.desc }}</p>
            <div class="flex items-baseline justify-between mt-4 text-xs text-misana-muted">
              <span>{{ car.pax }} {{ t('request.fleet.pax') }} · {{ car.hp }} hp</span>
              <span class="text-misana-ink whitespace-nowrap">
                <span class="text-misana-muted">{{ t('request.cars.perDay') }} </span>
                {{ fmtPrice(car.prices.oneToThreeDays) }}
              </span>
            </div>
          </div>
        </NuxtLink>
      </div>
    </section>
  </main>
</template>

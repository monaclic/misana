<script setup lang="ts">
// Fiche helicoptere SEO + conversion-first. Inspiration Wheely/Blade :
// visuel riche, trust signals prominents, mix booking + storytelling.
// URL : /en/helicopter-transfer/[route] + /fr/transfert-helicoptere/[route].
// Persona cible : arrivee SEO froide, ne connait pas Misana, doit convertir.
import { TRANSFERS, CITIES } from '~/lib/constants';
import { HELICOPTERS, VEHICLES } from '~/lib/fleet';
import { routePrice } from '~/lib/heliRoutes';
import {
  getTransferDetail,
  getHeroImage,
  getLongContent,
  formatPriceFrom,
} from '~/lib/transferDetails';

definePageMeta({ layout: 'default' });
defineI18nRoute({
  paths: {
    en: '/helicopter-transfer/[route]',
    fr: '/transfert-helicoptere/[route]',
  },
});

const ALLOWED_SLUGS = new Set([
  'nice-monaco',
  'nice-cannes',
  'nice-saint-tropez',
  'monaco-saint-tropez',
]);

// Slug -> codes IATA heliports pour la matrice prix par aeronef.
const SLUG_TO_IATA: Record<string, [string, string]> = {
  'nice-monaco': ['NCE', 'MCM'],
  'nice-cannes': ['NCE', 'CEQ'],
  'nice-saint-tropez': ['NCE', 'LTT'],
  'monaco-saint-tropez': ['MCM', 'LTT'],
};

// Comparaison routiere par slug (hardcoded V1).
const ROAD_COMPARISON: Record<string, { offPeakMin: number; peakNoteFr: string; peakNoteEn: string }> = {
  'nice-monaco': { offPeakMin: 60, peakNoteFr: 'Jusqu\'a 90+ min pendant le Grand Prix', peakNoteEn: '90+ min during the Grand Prix' },
  'nice-cannes': { offPeakMin: 30, peakNoteFr: 'Plus d\'une heure pendant le Festival', peakNoteEn: 'Over an hour during the Festival' },
  'nice-saint-tropez': { offPeakMin: 120, peakNoteFr: 'Jusqu\'a 180 min en juillet-aout', peakNoteEn: 'Up to 180 min in July-August' },
  'monaco-saint-tropez': { offPeakMin: 100, peakNoteFr: 'Jusqu\'a 180 min en saison', peakNoteEn: 'Up to 180 min in peak season' },
};

// Timeline narrative du voyage, route par route. 4 etapes visuelles.
type Step = { time: string; title: { fr: string; en: string }; desc: { fr: string; en: string }; image: string };
const FLIGHT_TIMELINE: Record<string, Step[]> = {
  'nice-monaco': [
    {
      time: '00:00',
      title: { fr: 'Mercedes V-Class', en: 'Mercedes V-Class' },
      desc: { fr: 'Le chauffeur vient vous chercher a Nice ou a l\'aeroport. Bagages charges.', en: 'Your chauffeur collects you in Nice or at the airport. Luggage loaded.' },
      image: 'https://www.leaderlimousines.com/cdn/shop/files/V_Class_png_side_817c9155-c0c4-470e-8000-1c14c7279a03.png?v=1729808886&width=1500',
    },
    {
      time: '+15 min',
      title: { fr: 'Heliport de Nice', en: 'Nice heliport' },
      desc: { fr: 'Briefing securite, embarquement. Sept minutes plus tard, vous etes a Monaco.', en: 'Safety briefing, boarding. Seven minutes later, you are in Monaco.' },
      image: 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?w=1200&q=85',
    },
    {
      time: '+22 min',
      title: { fr: 'Au-dessus de la baie', en: 'Above the bay' },
      desc: { fr: 'Villefranche, le Cap-Ferrat, Beaulieu : la cote sous vos pieds.', en: 'Villefranche, Cap-Ferrat, Beaulieu: the coast beneath you.' },
      image: 'https://images.unsplash.com/photo-1605641532883-7ec48ed6800c?w=1200&q=85',
    },
    {
      time: '+30 min',
      title: { fr: 'Touchdown Fontvieille', en: 'Touchdown Fontvieille' },
      desc: { fr: 'Atterrissage en plein coeur de Monaco. V-Class vous attend pour votre adresse.', en: 'Landing in the heart of Monaco. V-Class waiting for your address.' },
      image: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=1200&q=85',
    },
  ],
  'nice-cannes': [
    {
      time: '00:00',
      title: { fr: 'Mercedes V-Class', en: 'Mercedes V-Class' },
      desc: { fr: 'Pickup a votre hotel ou a l\'aeroport. Direction l\'heliport sur le port.', en: 'Pickup at your hotel or the airport. On the way to the harbour heliport.' },
      image: 'https://www.leaderlimousines.com/cdn/shop/files/V_Class_png_side_817c9155-c0c4-470e-8000-1c14c7279a03.png?v=1729808886&width=1500',
    },
    {
      time: '+15 min',
      title: { fr: 'Heliport de Nice', en: 'Nice heliport' },
      desc: { fr: 'Briefing, decollage. Cap a l\'ouest, le long de la cote.', en: 'Briefing, take-off. Westward along the coastline.' },
      image: 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?w=1200&q=85',
    },
    {
      time: '+25 min',
      title: { fr: 'Cap d\'Antibes, Lerins', en: 'Cap d\'Antibes, Lerins islands' },
      desc: { fr: 'Le Cap, les iles de Lerins, la baie de Cannes en approche.', en: 'The Cap, the Lerins islands, Cannes bay on approach.' },
      image: 'https://images.unsplash.com/photo-1543874768-2df4cdc1ddc8?w=1200&q=85',
    },
    {
      time: '+30 min',
      title: { fr: 'Quai du Large ou Mandelieu', en: 'Quai du Large or Mandelieu' },
      desc: { fr: 'Atterrissage au choix. V-Class pour la Croisette ou l\'arriere-pays.', en: 'Landing at your chosen heliport. V-Class for the Croisette or inland.' },
      image: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=1200&q=85',
    },
  ],
  'nice-saint-tropez': [
    {
      time: '00:00',
      title: { fr: 'Mercedes V-Class', en: 'Mercedes V-Class' },
      desc: { fr: 'Pickup en V-Class. Direction l\'heliport de Nice.', en: 'V-Class pickup. On the way to Nice heliport.' },
      image: 'https://www.leaderlimousines.com/cdn/shop/files/V_Class_png_side_817c9155-c0c4-470e-8000-1c14c7279a03.png?v=1729808886&width=1500',
    },
    {
      time: '+15 min',
      title: { fr: 'Heliport de Nice', en: 'Nice heliport' },
      desc: { fr: 'Briefing securite, decollage. Vingt minutes au-dessus de la cote.', en: 'Safety briefing, take-off. Twenty minutes above the coast.' },
      image: 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?w=1200&q=85',
    },
    {
      time: '+30 min',
      title: { fr: 'Cannes, Saint-Raphael', en: 'Cannes, Saint-Raphael' },
      desc: { fr: 'Le golfe de la Napoule, l\'Esterel, l\'arc de Saint-Raphael.', en: 'The Napoule gulf, the Esterel, the Saint-Raphael arc.' },
      image: 'https://images.unsplash.com/photo-1583373834259-46cc92173cb7?w=1200&q=85',
    },
    {
      time: '+45 min',
      title: { fr: 'Touchdown La Mole', en: 'Touchdown La Mole' },
      desc: { fr: 'Atterrissage. V-Class pour Saint-Tropez, Pampelonne ou Ramatuelle.', en: 'Landing. V-Class to Saint-Tropez, Pampelonne or Ramatuelle.' },
      image: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=1200&q=85',
    },
  ],
  'monaco-saint-tropez': [
    {
      time: '00:00',
      title: { fr: 'Mercedes V-Class', en: 'Mercedes V-Class' },
      desc: { fr: 'Pickup en V-Class a Monaco. Direction Fontvieille.', en: 'V-Class pickup in Monaco. On the way to Fontvieille.' },
      image: 'https://www.leaderlimousines.com/cdn/shop/files/V_Class_png_side_817c9155-c0c4-470e-8000-1c14c7279a03.png?v=1729808886&width=1500',
    },
    {
      time: '+10 min',
      title: { fr: 'Heliport Fontvieille', en: 'Fontvieille heliport' },
      desc: { fr: 'Briefing, decollage. Vingt-deux minutes le long de la cote.', en: 'Briefing, take-off. Twenty-two minutes along the coast.' },
      image: 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?w=1200&q=85',
    },
    {
      time: '+25 min',
      title: { fr: 'Cap-Ferrat, Antibes, Lerins', en: 'Cap-Ferrat, Antibes, Lerins' },
      desc: { fr: 'Soixante-cinq kilometres de cote, sans embouteillage.', en: 'Sixty-five kilometres of coastline, no congestion.' },
      image: 'https://images.unsplash.com/photo-1583373834259-46cc92173cb7?w=1200&q=85',
    },
    {
      time: '+40 min',
      title: { fr: 'Touchdown La Mole', en: 'Touchdown La Mole' },
      desc: { fr: 'Atterrissage. V-Class pour votre adresse a Saint-Tropez.', en: 'Landing. V-Class to your address in Saint-Tropez.' },
      image: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=1200&q=85',
    },
  ],
};

const route = useRoute();
const config = useRuntimeConfig();
const { locale } = useI18n();
const localePath = useLocalePath();

const slug = computed(() => String(route.params.route));

if (!ALLOWED_SLUGS.has(slug.value)) {
  throw createError({ statusCode: 404, statusMessage: 'Route not found', fatal: true });
}

const transferEntry = TRANSFERS.find((tr) => tr.slug === slug.value);
if (!transferEntry || (transferEntry.mode !== 'helicopter' && transferEntry.mode !== 'both')) {
  throw createError({ statusCode: 404, statusMessage: 'Route not found', fatal: true });
}

const fromCity = computed(() => CITIES.find((c) => c.slug === transferEntry.from));
const toCity = computed(() => CITIES.find((c) => c.slug === transferEntry.to));
const lng = computed<'fr' | 'en'>(() => (locale.value === 'fr' ? 'fr' : 'en'));

const fromName = computed(() => (fromCity.value ? fromCity.value[lng.value] : ''));
const toName = computed(() => (toCity.value ? toCity.value[lng.value] : ''));

const fromNameDual = computed(() => ({ fr: fromCity.value?.fr ?? '', en: fromCity.value?.en ?? '' }));
const toNameDual = computed(() => ({ fr: toCity.value?.fr ?? '', en: toCity.value?.en ?? '' }));

const detail = computed(() => getTransferDetail('helicopter', slug.value, transferEntry.from, transferEntry.to));
const heroImage = computed(() => getHeroImage('helicopter', slug.value));
const duration = computed(() => detail.value.durationHelicopter ?? 0);

const longContent = computed(() => getLongContent(
  'helicopter',
  slug.value,
  fromNameDual.value,
  toNameDual.value,
  duration.value,
  detail.value.distanceKm,
  detail.value.priceFrom,
));

const aircraftPrices = computed(() => {
  const [fromIata, toIata] = SLUG_TO_IATA[slug.value] ?? ['NCE', 'MCM'];
  return HELICOPTERS.map((h) => {
    const price = routePrice(fromIata, toIata, h.id);
    return {
      id: h.id,
      name: h.name,
      engine: locale.value === 'fr' ? h.engineFr : h.engine,
      pax: h.pax,
      price: typeof price === 'number' ? price : null,
      image: h.image,
    };
  }).filter((h): h is { id: string; name: string; engine: string; pax: number; price: number; image: string } =>
    h.price !== null,
  );
});

// Vehicules sol disponibles pour aller-retour heliport (V-Class default, autres en option).
const groundVehicles = computed(() => VEHICLES.slice(0, 4)); // E-Class, V-Class, S-Class, Range Rover

const roadCmp = computed(() => ROAD_COMPARISON[slug.value]);
const flightTimeline = computed(() => FLIGHT_TIMELINE[slug.value] ?? []);

const seoTitle = computed(() => {
  const prefix = locale.value === 'fr' ? 'Transfert Helicoptere' : 'Helicopter Transfer';
  const sep = locale.value === 'fr' ? ' a ' : ' to ';
  const from = locale.value === 'fr' ? 'A partir de' : 'From';
  return `${prefix} ${fromName.value}${sep}${toName.value} · ${duration.value} min · ${from} ${formatPriceFrom(detail.value.priceFrom, lng.value)} | Misana`;
});

const seoDescription = computed(() => {
  if (locale.value === 'fr') {
    return `Vol helicoptere prive ${fromName.value} ${toName.value} en ${duration.value} minutes. A partir de ${formatPriceFrom(detail.value.priceFrom, 'fr')}. Mercedes V-Class incluse. Reponse sous 2h.`;
  }
  return `Private helicopter transfer ${fromName.value} to ${toName.value} in ${duration.value} minutes. From ${formatPriceFrom(detail.value.priceFrom, 'en')}. Mercedes V-Class included. Reply within 2h.`;
});

const siteUrl = (config.public.siteUrl as string) || 'https://misana-group.com';
const canonicalUrl = computed(() => (
  locale.value === 'fr'
    ? `${siteUrl}/fr/transfert-helicoptere/${slug.value}`
    : `${siteUrl}/en/helicopter-transfer/${slug.value}`
));
const altEnUrl = computed(() => `${siteUrl}/en/helicopter-transfer/${slug.value}`);
const altFrUrl = computed(() => `${siteUrl}/fr/transfert-helicoptere/${slug.value}`);

useSeoMeta({
  title: () => seoTitle.value,
  description: () => seoDescription.value,
  ogTitle: () => seoTitle.value,
  ogDescription: () => seoDescription.value,
  ogImage: () => heroImage.value,
  ogUrl: () => canonicalUrl.value,
  twitterImage: () => heroImage.value,
  robots: 'index,follow',
});

useHead({
  link: [
    { rel: 'canonical', href: canonicalUrl.value },
    { rel: 'alternate', hreflang: 'en', href: altEnUrl.value },
    { rel: 'alternate', hreflang: 'fr', href: altFrUrl.value },
    { rel: 'alternate', hreflang: 'x-default', href: altEnUrl.value },
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: `Helicopter transfer ${fromName.value} to ${toName.value}`,
        provider: { '@type': 'Organization', name: 'Misana', url: siteUrl },
        serviceType: 'Helicopter transfer',
        areaServed: [fromName.value, toName.value],
        description: seoDescription.value,
        offers: {
          '@type': 'Offer',
          price: detail.value.priceFrom,
          priceCurrency: 'EUR',
          priceValidUntil: '2026-12-31',
          availability: 'https://schema.org/InStock',
          url: canonicalUrl.value,
        },
      }),
    },
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Misana', item: siteUrl },
          {
            '@type': 'ListItem',
            position: 2,
            name: locale.value === 'fr' ? 'Helicoptere' : 'Helicopter',
            item: `${siteUrl}${localePath({ name: 'helicopter' })}`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: `${fromName.value} → ${toName.value}`,
            item: canonicalUrl.value,
          },
        ],
      }),
    },
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'TouristTrip',
        name: seoTitle.value,
        description: seoDescription.value,
        provider: { '@type': 'Organization', name: 'Misana' },
        itinerary: {
          '@type': 'ItemList',
          itemListElement: [
            { '@type': 'Place', name: fromName.value },
            { '@type': 'Place', name: toName.value },
          ],
        },
      }),
    },
    ...(longContent.value.faq?.length
      ? [{
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: longContent.value.faq.map((f) => ({
              '@type': 'Question',
              name: f.q[lng.value],
              acceptedAnswer: { '@type': 'Answer', text: f.a[lng.value] },
            })),
          }),
        }]
      : []),
  ],
});

const related = computed(() => (
  Array.from(ALLOWED_SLUGS)
    .filter((s) => s !== slug.value)
    .map((s) => {
      const tr = TRANSFERS.find((t) => t.slug === s)!;
      const det = getTransferDetail('helicopter', s, tr.from, tr.to);
      return { slug: s, tr, det };
    })
));

const trustBadges = computed(() => ([
  {
    title: locale.value === 'fr' ? 'Pilotes certifies' : 'Certified pilots',
    desc: locale.value === 'fr' ? 'Operateurs licencies' : 'Licensed operators',
  },
  {
    title: locale.value === 'fr' ? 'V-Class incluse' : 'V-Class included',
    desc: locale.value === 'fr' ? 'Aux deux bouts du vol' : 'Door-to-door both ends',
  },
  {
    title: locale.value === 'fr' ? 'Rebooking meteo' : 'Free weather rebooking',
    desc: locale.value === 'fr' ? 'Bascule chauffeur gratuite' : 'Auto-switch to chauffeur',
  },
  {
    title: locale.value === 'fr' ? 'Reponse 2h' : 'Reply within 2h',
    desc: locale.value === 'fr' ? '7j/7, equipe a Nice' : '7 days a week, team in Nice',
  },
]));

const howSteps = computed(() => ([
  {
    n: '01',
    title: locale.value === 'fr' ? 'Demandez un devis' : 'Request a quote',
    desc: locale.value === 'fr' ? 'Trente secondes pour preciser date, passagers, bagages.' : 'Thirty seconds to set date, passengers, luggage.',
  },
  {
    n: '02',
    title: locale.value === 'fr' ? 'Confirmation sous 2h' : 'Confirmed within 2h',
    desc: locale.value === 'fr' ? 'Aeronef, prix final, pilote, heliport coordonnes par notre equipe.' : 'Aircraft, final price, pilot, heliport coordinated by our team.',
  },
  {
    n: '03',
    title: locale.value === 'fr' ? 'Vol porte-a-porte' : 'Door-to-door flight',
    desc: locale.value === 'fr' ? 'V-Class au pickup, vol, V-Class a l\'arrivee. Vous ne portez rien.' : 'V-Class at pickup, flight, V-Class at arrival. You carry nothing.',
  },
]));

const requestCta = computed(() => localePath({
  path: '/request',
  query: { service: 'helicopter', from: transferEntry.from, to: transferEntry.to },
}));

const headerTransparent = useState<boolean>('header-transparent', () => true);
const heroRef = ref<HTMLElement | null>(null);
let heroObserver: IntersectionObserver | null = null;

onMounted(() => {
  if (heroRef.value) {
    heroObserver = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          headerTransparent.value = e.isIntersecting && e.intersectionRatio > 0;
        }
      },
      { threshold: [0, 0.01] },
    );
    heroObserver.observe(heroRef.value);
  }
});

onBeforeUnmount(() => {
  headerTransparent.value = false;
  heroObserver?.disconnect();
  heroObserver = null;
});
</script>

<template>
  <main class="bg-misana-paper text-misana-ink pb-24 lg:pb-0">
    <!-- ==================================================
         01. HERO immersif + trust badge + dual CTA
         ================================================== -->
    <section
      ref="heroRef"
      class="relative h-[68vh] sm:h-[72vh] min-h-[480px] overflow-hidden -mt-16 lg:-mt-24 bg-misana-ink"
    >
      <img
        :src="heroImage"
        :alt="`${fromName} → ${toName} by helicopter`"
        class="absolute inset-0 w-full h-full object-cover opacity-80"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-misana-ink via-misana-ink/60 to-misana-ink/20"></div>

      <div class="relative h-full max-w-[1400px] mx-auto px-5 sm:px-8 flex flex-col justify-end pb-10 sm:pb-16 text-misana-paper">
        <!-- Trust badge top -->
        <div class="inline-flex items-center gap-2 self-start text-[11px] uppercase tracking-[0.2em] opacity-85 mb-5 px-3 py-1.5 border border-misana-paper/30 rounded-full backdrop-blur-sm">
          <span class="w-1.5 h-1.5 rounded-full bg-misana-paper"></span>
          {{ locale === 'fr' ? 'Aviation privee Cote d\'Azur' : 'French Riviera private aviation' }}
        </div>

        <h1 class="text-3xl sm:text-5xl lg:text-6xl font-semibold leading-[1.05] tracking-tight mb-3 max-w-3xl">
          {{ locale === 'fr' ? 'Transfert helicoptere' : 'Helicopter transfer' }}<br />
          {{ fromName }} <span class="opacity-70">→</span> {{ toName }}
        </h1>

        <p class="text-lg sm:text-xl opacity-85 mb-7 max-w-2xl leading-snug">
          <span class="font-semibold tabular-nums">{{ duration }} min</span> {{ locale === 'fr' ? 'par les airs' : 'by air' }}.
          {{ locale === 'fr' ? 'A partir de' : 'From' }} <span class="font-semibold tabular-nums">{{ formatPriceFrom(detail.priceFrom, lng) }}</span>.
        </p>

        <div class="flex flex-wrap items-center gap-3">
          <NuxtLink
            :to="requestCta"
            class="inline-flex items-center gap-2.5 bg-misana-paper text-misana-ink px-6 sm:px-8 py-3.5 rounded-full text-sm font-semibold hover:opacity-90 transition group"
          >
            <span>{{ locale === 'fr' ? 'Devis sous 2h' : 'Get quote in 2h' }}</span>
            <span class="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">→</span>
          </NuxtLink>
          <a
            href="#pricing"
            class="inline-flex items-center gap-2 text-sm text-misana-paper/85 hover:text-misana-paper transition px-4 py-3.5"
          >
            <span>{{ locale === 'fr' ? 'Voir les aeronefs et tarifs' : 'See aircraft & pricing' }}</span>
            <span aria-hidden="true">↓</span>
          </a>
        </div>
      </div>
    </section>

    <!-- ==================================================
         02. TRUST STRIP (4 reassurances)
         ================================================== -->
    <section class="border-b border-misana-line bg-misana-paper">
      <div class="max-w-[1400px] mx-auto px-5 sm:px-8 py-6 sm:py-8">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-5">
          <div v-for="(b, i) in trustBadges" :key="i" class="flex gap-2.5">
            <span class="flex-shrink-0 w-5 h-5 mt-0.5 rounded-full bg-misana-ink/5 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" class="w-3 h-3" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M5 13L9 17L19 7" />
              </svg>
            </span>
            <div class="leading-tight">
              <p class="text-sm font-semibold mb-0.5">{{ b.title }}</p>
              <p class="text-xs text-misana-muted">{{ b.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================================================
         03. BOOKING widget + MAP (grid 7/5)
         ================================================== -->
    <section>
      <div class="max-w-[1400px] mx-auto px-5 sm:px-8 pt-10 sm:pt-14 grid lg:grid-cols-12 gap-6 lg:gap-8 lg:items-start">
        <div class="lg:col-span-7">
          <TransferMap
            :from="transferEntry.from"
            :to="transferEntry.to"
            mode="helicopter"
            :from-name="fromName"
            :to-name="toName"
          />
        </div>
        <aside class="lg:col-span-5 lg:sticky lg:top-20">
          <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-3 lg:mt-1">
            {{ locale === 'fr' ? 'Reservez votre vol' : 'Book your flight' }}
          </p>
          <TransferReservationWidget
            :slug="slug"
            mode="helicopter"
            :from-city="transferEntry.from"
            :to-city="transferEntry.to"
            :from-name="fromName"
            :to-name="toName"
            :price-from="detail.priceFrom"
            :pax-min="detail.paxMin"
            :pax-max="detail.paxMax"
            :bidirectional="true"
            variant="inline"
          />
        </aside>
      </div>
    </section>

    <!-- ==================================================
         04. HELI vs ROAD
         ================================================== -->
    <section v-if="roadCmp" class="border-t border-misana-line mt-12 sm:mt-16">
      <div class="max-w-[1400px] mx-auto px-5 sm:px-8 py-10 sm:py-14">
        <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-5">
          {{ locale === 'fr' ? 'Helicoptere vs route' : 'Helicopter vs road' }}
        </p>
        <div class="grid grid-cols-2 gap-3 sm:gap-5">
          <div class="border-2 border-misana-ink rounded-md p-5 sm:p-7 bg-misana-paper">
            <p class="text-[10px] uppercase tracking-[0.2em] text-misana-muted mb-2">
              {{ locale === 'fr' ? 'En helicoptere' : 'By helicopter' }}
            </p>
            <p class="text-4xl sm:text-6xl font-semibold tabular-nums leading-none mb-2">
              {{ duration }} <span class="text-base sm:text-xl font-medium text-misana-muted">min</span>
            </p>
            <p class="text-xs sm:text-sm text-misana-muted leading-snug">
              {{ locale === 'fr' ? 'Porte-a-porte ~' : 'Door-to-door ~' }}{{ duration + 25 }} min
            </p>
          </div>
          <div class="border border-misana-line rounded-md p-5 sm:p-7">
            <p class="text-[10px] uppercase tracking-[0.2em] text-misana-muted mb-2">
              {{ locale === 'fr' ? 'Par la route' : 'By road' }}
            </p>
            <p class="text-4xl sm:text-6xl font-semibold tabular-nums leading-none mb-2 text-misana-muted">
              {{ roadCmp.offPeakMin }} <span class="text-base sm:text-xl font-medium">min</span>
            </p>
            <p class="text-xs sm:text-sm text-misana-muted leading-snug">
              {{ locale === 'fr' ? roadCmp.peakNoteFr : roadCmp.peakNoteEn }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================================================
         05. THE FLIGHT (timeline 4 etapes avec photos)
         ================================================== -->
    <section v-if="flightTimeline.length" class="border-t border-misana-line">
      <div class="max-w-[1400px] mx-auto px-5 sm:px-8 py-10 sm:py-14">
        <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-2">
          {{ locale === 'fr' ? 'Le voyage' : 'The journey' }}
        </p>
        <h2 class="text-2xl sm:text-3xl font-semibold mb-7 max-w-2xl leading-tight">
          {{ locale === 'fr' ? 'Porte-a-porte en quatre etapes' : 'Door-to-door in four steps' }}
        </h2>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <article v-for="(step, i) in flightTimeline" :key="i" class="flex flex-col">
            <div class="relative aspect-[4/3] overflow-hidden rounded-md bg-misana-stone mb-3">
              <img
                :src="step.image"
                :alt="step.title[lng]"
                loading="lazy"
                class="absolute inset-0 w-full h-full object-cover"
              />
              <span class="absolute top-3 left-3 inline-flex items-center px-2 py-1 bg-misana-ink/85 text-misana-paper text-[10px] uppercase tracking-wider rounded backdrop-blur-sm">
                {{ step.time }}
              </span>
            </div>
            <p class="text-sm font-semibold leading-tight mb-1">{{ step.title[lng] }}</p>
            <p class="text-xs text-misana-muted leading-snug">{{ step.desc[lng] }}</p>
          </article>
        </div>
      </div>
    </section>

    <!-- ==================================================
         06. AIRCRAFT + PRICING (grille modeles)
         ================================================== -->
    <section v-if="aircraftPrices.length" id="pricing" class="border-t border-misana-line scroll-mt-24">
      <div class="max-w-[1400px] mx-auto px-5 sm:px-8 py-10 sm:py-14">
        <div class="flex items-baseline justify-between mb-5 sm:mb-7 flex-wrap gap-2">
          <div>
            <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-1.5">
              {{ locale === 'fr' ? 'Aeronefs et tarifs' : 'Aircraft & pricing' }}
            </p>
            <h2 class="text-2xl sm:text-3xl font-semibold leading-tight">
              {{ locale === 'fr' ? 'Six aeronefs au choix' : 'Six aircraft to choose from' }}
            </h2>
          </div>
          <p class="text-[11px] text-misana-muted">
            {{ locale === 'fr' ? 'One-way, taxes et chauffeur inclus' : 'One-way, taxes and chauffeur included' }}
          </p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <article
            v-for="h in aircraftPrices"
            :key="h.id"
            class="border border-misana-line rounded-md overflow-hidden hover:border-misana-ink transition group"
          >
            <div class="aspect-[16/10] overflow-hidden bg-misana-stone">
              <img
                :src="h.image"
                :alt="h.name"
                loading="lazy"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            </div>
            <div class="p-4 sm:p-5">
              <div class="flex items-baseline justify-between mb-1 gap-3">
                <p class="text-base font-semibold leading-tight">{{ h.name }}</p>
                <p class="text-base font-semibold tabular-nums whitespace-nowrap">{{ formatPriceFrom(h.price, lng) }}</p>
              </div>
              <p class="text-[10px] uppercase tracking-wider text-misana-muted mb-2">{{ h.engine }}</p>
              <div class="flex items-center justify-between text-xs text-misana-muted">
                <span>{{ h.pax }} pax</span>
                <span>{{ locale === 'fr' ? 'des' : 'from' }}</span>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- ==================================================
         07. GROUND TRANSFERS INCLUDED (V-Class + addons)
         ================================================== -->
    <section class="border-t border-misana-line">
      <div class="max-w-[1400px] mx-auto px-5 sm:px-8 py-10 sm:py-14">
        <div class="flex items-baseline justify-between mb-5 sm:mb-7 flex-wrap gap-2">
          <div>
            <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-1.5">
              {{ locale === 'fr' ? 'Transferts sol inclus' : 'Ground transfers included' }}
            </p>
            <h2 class="text-2xl sm:text-3xl font-semibold leading-tight max-w-2xl">
              {{ locale === 'fr' ? 'Votre Mercedes V-Class, aux deux bouts du vol' : 'Your Mercedes V-Class, at both ends of the flight' }}
            </h2>
          </div>
        </div>
        <p class="text-sm sm:text-base text-misana-muted leading-relaxed mb-7 max-w-3xl">
          {{ locale === 'fr'
            ? 'Mercedes V-Class incluse par defaut pour le pickup et la depose. S-Class, Range Rover ou Maybach disponibles sur demande, supplements transparents.'
            : 'Mercedes V-Class included by default for pickup and drop-off. S-Class, Range Rover or Maybach available on request, transparent supplements.' }}
        </p>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <article
            v-for="v in groundVehicles"
            :key="v.id"
            :class="[
              'border rounded-md overflow-hidden transition group',
              v.id === 'v-class' ? 'border-misana-ink bg-misana-ink/[0.02]' : 'border-misana-line hover:border-misana-ink',
            ]"
          >
            <div class="aspect-[16/10] overflow-hidden bg-misana-stone flex items-center justify-center p-2">
              <img
                :src="v.image"
                :alt="v.name"
                loading="lazy"
                :class="v.imageMode === 'cover'
                  ? 'w-full h-full object-cover'
                  : 'max-w-full max-h-full object-contain'"
              />
            </div>
            <div class="p-3.5 sm:p-4">
              <div class="flex items-center justify-between mb-1 gap-2">
                <p class="text-sm font-semibold leading-tight">{{ v.name }}</p>
                <span
                  v-if="v.id === 'v-class'"
                  class="text-[9px] uppercase tracking-wider px-1.5 py-0.5 bg-misana-ink text-misana-paper rounded"
                >
                  {{ locale === 'fr' ? 'Inclus' : 'Included' }}
                </span>
              </div>
              <p class="text-[10px] uppercase tracking-wider text-misana-muted mb-2">{{ locale === 'fr' ? v.subFr : v.sub }}</p>
              <div class="flex justify-between text-[11px] text-misana-muted">
                <span>{{ v.pax }} pax</span>
                <span>{{ v.luggage }} {{ locale === 'fr' ? 'bag.' : 'bags' }}</span>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- ==================================================
         08. HOW IT WORKS (3 etapes)
         ================================================== -->
    <section class="border-t border-misana-line bg-misana-paper">
      <div class="max-w-[1400px] mx-auto px-5 sm:px-8 py-10 sm:py-14">
        <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-2">
          {{ locale === 'fr' ? 'Comment ca marche' : 'How it works' }}
        </p>
        <h2 class="text-2xl sm:text-3xl font-semibold mb-8 max-w-2xl leading-tight">
          {{ locale === 'fr' ? 'De la demande au touchdown' : 'From request to touchdown' }}
        </h2>
        <ol class="grid sm:grid-cols-3 gap-6 sm:gap-10">
          <li v-for="step in howSteps" :key="step.n" class="flex flex-col">
            <span class="text-3xl sm:text-4xl font-semibold tabular-nums text-misana-muted/40 mb-3 leading-none">{{ step.n }}</span>
            <p class="text-base sm:text-lg font-semibold mb-2 leading-tight">{{ step.title }}</p>
            <p class="text-sm text-misana-ink/75 leading-relaxed">{{ step.desc }}</p>
          </li>
        </ol>
      </div>
    </section>

    <!-- ==================================================
         09. HELIPORTS (depart + arrivee)
         ================================================== -->
    <section
      v-if="longContent.hubFromTitle && longContent.hubToTitle && longContent.hubFromDesc && longContent.hubToDesc"
      class="border-t border-misana-line"
    >
      <div class="max-w-[1400px] mx-auto px-5 sm:px-8 py-10 sm:py-14">
        <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-5">
          {{ locale === 'fr' ? 'Heliports' : 'Heliports' }}
        </p>
        <div class="grid sm:grid-cols-2 gap-6 sm:gap-10 max-w-5xl">
          <div class="border-l border-misana-line pl-5">
            <div class="flex items-center gap-2 mb-2">
              <span class="inline-block w-1.5 h-1.5 rounded-full border border-misana-ink"></span>
              <p class="text-[10px] uppercase tracking-[0.2em] text-misana-muted">
                {{ locale === 'fr' ? 'Depart' : 'Departure' }}
              </p>
            </div>
            <p class="text-base font-semibold leading-tight mb-2">{{ longContent.hubFromTitle[lng] }}</p>
            <p class="text-sm text-misana-ink/80 leading-relaxed">{{ longContent.hubFromDesc[lng] }}</p>
          </div>
          <div class="border-l border-misana-ink pl-5">
            <div class="flex items-center gap-2 mb-2">
              <span class="inline-block w-1.5 h-1.5 rounded-full bg-misana-ink"></span>
              <p class="text-[10px] uppercase tracking-[0.2em] text-misana-muted">
                {{ locale === 'fr' ? 'Arrivee' : 'Arrival' }}
              </p>
            </div>
            <p class="text-base font-semibold leading-tight mb-2">{{ longContent.hubToTitle[lng] }}</p>
            <p class="text-sm text-misana-ink/80 leading-relaxed">{{ longContent.hubToDesc[lng] }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================================================
         10. ABOUT this route + Why fly (SEO long form)
         ================================================== -->
    <section class="border-t border-misana-line">
      <div class="max-w-[1400px] mx-auto px-5 sm:px-8 py-10 sm:py-14">
        <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-2">
          {{ locale === 'fr' ? 'A propos de cette liaison' : 'About this route' }}
        </p>
        <h2 class="text-2xl sm:text-3xl font-semibold mb-7 max-w-3xl leading-tight">
          {{ fromName }} <span class="text-misana-muted">→</span> {{ toName }}
          <span class="text-misana-muted font-normal">{{ locale === 'fr' ? 'en helicoptere' : 'by helicopter' }}</span>
        </h2>
        <div class="grid lg:grid-cols-12 gap-8 lg:gap-14">
          <div class="lg:col-span-7">
            <p class="text-sm sm:text-base leading-[1.75] text-misana-ink">{{ longContent.about[lng] }}</p>
          </div>
          <div class="lg:col-span-5">
            <p class="text-[10px] uppercase tracking-[0.2em] text-misana-muted mb-3">
              {{ locale === 'fr' ? 'Pourquoi voler' : 'Why fly' }}
            </p>
            <ul class="space-y-2.5">
              <li v-for="(r, i) in longContent.whyMode[lng]" :key="i" class="flex gap-2.5 text-sm leading-snug">
                <span class="flex-shrink-0 text-misana-ink mt-1.5 w-1 h-1 rounded-full bg-misana-ink"></span>
                <span>{{ r }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================================================
         11. FAQ
         ================================================== -->
    <section v-if="longContent.faq?.length" class="border-t border-misana-line bg-misana-paper">
      <div class="max-w-[1400px] mx-auto px-5 sm:px-8 py-10 sm:py-14">
        <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-2">FAQ</p>
        <h2 class="text-2xl sm:text-3xl font-semibold mb-7 leading-tight">
          {{ locale === 'fr' ? 'Questions frequentes' : 'Frequently asked' }}
        </h2>
        <div class="max-w-3xl divide-y divide-misana-line">
          <details v-for="(item, i) in longContent.faq" :key="i" class="group py-4">
            <summary class="flex items-center justify-between cursor-pointer list-none gap-4">
              <span class="text-sm sm:text-base font-medium pr-4 leading-snug">{{ item.q[lng] }}</span>
              <span class="text-misana-muted text-xl leading-none transition-transform group-open:rotate-45 flex-shrink-0">+</span>
            </summary>
            <p class="mt-3 text-sm text-misana-ink/80 leading-relaxed pr-8">{{ item.a[lng] }}</p>
          </details>
        </div>
      </div>
    </section>

    <!-- ==================================================
         12. RELATED helico routes
         ================================================== -->
    <section v-if="related.length" class="border-t border-misana-line">
      <div class="max-w-[1400px] mx-auto px-5 sm:px-8 py-10 sm:py-14">
        <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-5">
          {{ locale === 'fr' ? 'Autres liaisons helico' : 'Other helicopter routes' }}
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
          <NuxtLink
            v-for="other in related"
            :key="other.slug"
            :to="localePath({ name: 'helicopter-route', params: { route: other.slug } })"
            class="border border-misana-line rounded-md p-4 sm:p-5 hover:border-misana-ink transition group"
          >
            <p class="text-[10px] uppercase tracking-[0.16em] text-misana-muted mb-1.5">
              {{ locale === 'fr' ? 'Helicoptere' : 'Helicopter' }}
            </p>
            <p class="text-sm sm:text-base font-semibold mb-3 leading-tight">{{ other.tr[lng] }}</p>
            <div class="flex items-baseline justify-between text-xs">
              <span class="text-misana-muted">{{ other.det.durationHelicopter }} min</span>
              <span class="font-semibold tabular-nums">{{ formatPriceFrom(other.det.priceFrom, lng) }}</span>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ==================================================
         13. FOOTER CTA dark (desktop only ; mobile a le sticky)
         ================================================== -->
    <section class="hidden lg:block bg-misana-ink text-misana-paper">
      <div class="max-w-[1400px] mx-auto px-5 sm:px-8 py-16 text-center">
        <p class="text-[11px] uppercase tracking-[0.22em] opacity-65 mb-3">
          {{ locale === 'fr' ? 'Pret a voler ?' : 'Ready to fly?' }}
        </p>
        <h2 class="text-3xl lg:text-5xl font-semibold mb-4 leading-tight">
          {{ fromName }} <span class="opacity-60">→</span> {{ toName }}
        </h2>
        <p class="text-sm sm:text-base opacity-80 mb-7">
          {{ duration }} min
          <span class="opacity-50 mx-1.5">·</span>
          {{ locale === 'fr' ? 'A partir de' : 'From' }} {{ formatPriceFrom(detail.priceFrom, lng) }}
          <span class="opacity-50 mx-1.5">·</span>
          {{ detail.paxMin }}-{{ detail.paxMax }} pax
        </p>
        <NuxtLink
          :to="requestCta"
          class="inline-flex items-center gap-2.5 bg-misana-paper text-misana-ink px-8 py-4 rounded-full text-sm font-semibold hover:opacity-90 transition group"
        >
          <span>{{ locale === 'fr' ? 'Devis sous 2h' : 'Get quote in 2h' }}</span>
          <span class="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">→</span>
        </NuxtLink>
      </div>
    </section>

    <!-- ==================================================
         14. STICKY BOTTOM mobile CTA
         ================================================== -->
    <div class="lg:hidden fixed bottom-0 inset-x-0 bg-misana-ink text-misana-paper px-5 py-3.5 z-40 shadow-2xl border-t border-misana-ink">
      <div class="flex items-center justify-between gap-4">
        <div class="leading-tight">
          <p class="text-[10px] uppercase tracking-[0.18em] opacity-70">
            {{ locale === 'fr' ? 'A partir de' : 'From' }}
          </p>
          <p class="text-lg font-semibold tabular-nums">{{ formatPriceFrom(detail.priceFrom, lng) }}</p>
        </div>
        <NuxtLink
          :to="requestCta"
          class="inline-flex items-center gap-2 bg-misana-paper text-misana-ink px-5 py-3 rounded-full text-sm font-semibold"
        >
          <span>{{ locale === 'fr' ? 'Demander' : 'Request' }}</span>
          <span aria-hidden="true">→</span>
        </NuxtLink>
      </div>
    </div>
  </main>
</template>

<style scoped>
details summary::-webkit-details-marker { display: none; }
</style>

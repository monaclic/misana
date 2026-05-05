<script setup lang="ts">
// Homepage Misana V2 - refonte editoriale.
// 1) Sticky services hero (intro + 5 service panels reveal)
// 2) Events list (calendar of the season)
// 3) Testimonials parallax (3 vertical columns, sticky pinned)
// Footer via default layout (AppFooter enrichi).
import { CITIES, ESTABLISHMENTS } from '~/lib/constants';

definePageMeta({ layout: 'default' });

const { locale, t } = useI18n();
const localePath = useLocalePath();

useSeoMeta({
  title: () => `${t('brand.name')} · ${t('brand.tagline')}`,
  description: () => t('home.metaDescription'),
  ogTitle: () => t('home.ogTitle'),
  ogDescription: () => t('home.ogDescription'),
});

useHead({
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'TravelAgency',
      name: 'Misana',
      description: "Services privés sur la Côte d'Azur : chauffeur, yacht, hélicoptère, voitures de luxe, accès",
      areaServed: [
        { '@type': 'City', name: 'Saint-Tropez' },
        { '@type': 'City', name: 'Cannes' },
        { '@type': 'City', name: 'Antibes' },
        { '@type': 'City', name: 'Nice' },
        { '@type': 'City', name: 'Monaco' },
      ],
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Services Misana',
        itemListElement: [
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: "Chauffeur privé Côte d'Azur" } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: "Location yacht Côte d'Azur" } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Transfert hélicoptère Riviera' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: "Location voiture de luxe Côte d'Azur" } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: "Réservations restaurants et hôtels Côte d'Azur" } },
        ],
      },
      telephone: '+33400000000',
      email: 'hello@misana.com',
      url: 'https://misana.com',
    }),
  }],
});

// --- Services sticky stack (acts as hero) ---
// First panel : maison intro ("we orchestrate everything"). Then five services.
// Source : Sanity singleton homePage. Fallback en dur si Sanity vide
// (premiere instance ou erreur reseau) pour ne jamais avoir de page nue.
type ServiceSlug = 'chauffeur' | 'cars' | 'yacht' | 'helicopter' | 'access';
type HeroPanel =
  | { kind: 'intro'; img: string }
  | { kind: 'service'; slug: ServiceSlug; img: string;
      titleOverride?: string; bodyOverride?: string; ctaOverride?: string };

const { home } = useHomePage();

function pickLocale(v: { fr?: string; en?: string } | undefined): string | undefined {
  if (!v) return undefined;
  return locale.value === 'fr' ? (v.fr || v.en) : (v.en || v.fr);
}

// CMS-only : aucun fallback Unsplash. Les panels sans image dans Sanity
// sont silencieusement filtres (pas de panel cassé visuellement).
const SERVICE_PANELS = computed<HeroPanel[]>(() => {
  const introImg = home.value?.heroImage;
  const intro: HeroPanel[] = introImg ? [{ kind: 'intro', img: introImg }] : [];
  const sanityPanels = (home.value?.panels || []).filter((p) => !!p.image);
  const servicePanels: HeroPanel[] = sanityPanels.map((p) => ({
    kind: 'service' as const,
    slug: p.service,
    img: p.image as string,
    titleOverride: pickLocale(p.titleOverride),
    bodyOverride: pickLocale(p.bodyOverride),
    ctaOverride: pickLocale(p.ctaLabelOverride),
  }));
  return [...intro, ...servicePanels];
});

// Helpers pour lire les overrides editoriaux (sinon traduction i18n).
const heroTitle = computed(() => pickLocale(home.value?.heroTitleOverride) || t('home.heroIntroTitle'));
const heroBody = computed(() => pickLocale(home.value?.heroBodyOverride) || t('home.heroIntroBody'));
const heroSub = computed(() => pickLocale(home.value?.heroSubOverride) || t('home.heroIntroSub'));
const agendaKicker = computed(() => pickLocale(home.value?.agendaKickerOverride) || t('home.timelineKicker'));
const agendaTitle = computed(() => pickLocale(home.value?.agendaTitleOverride) || t('home.timelineTitle'));
const agendaLead = computed(() => pickLocale(home.value?.agendaLeadOverride) || t('home.timelineLead'));
const agendaFootnote = computed(() => pickLocale(home.value?.agendaFootnoteOverride) || t('home.timelineFootnote'));
const testimonialsKicker = computed(() => pickLocale(home.value?.testimonialsKickerOverride) || t('home.testimonialsKicker'));
const testimonialsTitleStart = computed(() => pickLocale(home.value?.testimonialsTitleStartOverride) || t('home.testimonialsTitleStart'));
const testimonialsTitleAccent = computed(() => pickLocale(home.value?.testimonialsTitleAccentOverride) || t('home.testimonialsTitleAccent'));

const panelRefs = ref<HTMLElement[]>([]);
const revealed = ref<Set<number>>(new Set());
const activePanel = ref(0);
let panelObserver: IntersectionObserver | null = null;

const heroSection = ref<HTMLElement | null>(null);
let heroObserver: IntersectionObserver | null = null;
// AppHeader seeds this from the route. Here we only flip it as the user
// scrolls past the hero (opaque header on subsequent sections).
const headerTransparent = useState<boolean>('header-transparent', () => true);
// Sticky bottom bar (WhatsApp/Call/Request) cachée tant que le hero overlap.
const stickyContactVisible = useState<boolean>('sticky-contact-visible', () => true);

// Hide the (MS · 01) + life with Misana overlay as soon as the user scrolls
// downward at all. No fancy animation : it just disappears.
const atTop = ref(true);
let atTopRaf = 0;
function updateAtTop() {
  atTop.value = window.scrollY <= 1;
}
function onScrollAtTop() {
  cancelAnimationFrame(atTopRaf);
  atTopRaf = requestAnimationFrame(updateAtTop);
}

function setPanelRef(el: Element | null, idx: number) {
  if (el) panelRefs.value[idx] = el as HTMLElement;
}

// Generic reveal observer for any element marked with [data-reveal-on-scroll].
const revealOnScroll = ref<IntersectionObserver | null>(null);

onMounted(() => {
  panelObserver = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const idx = Number((e.target as HTMLElement).dataset.idx);
        if (e.isIntersecting && e.intersectionRatio > 0.45) {
          if (!revealed.value.has(idx)) {
            const next = new Set(revealed.value);
            next.add(idx);
            revealed.value = next;
          }
          activePanel.value = idx;
        }
      }
    },
    { threshold: [0, 0.45, 0.7, 1] },
  );
  panelRefs.value.forEach((el) => el && panelObserver?.observe(el));

  // useLazyAsyncData resout apres mount sur navigation client-side : les
  // panels ne sont pas encore rendus quand l observer est cree. On watche
  // SERVICE_PANELS pour observer les nouveaux refs des qu ils apparaissent.
  watch(SERVICE_PANELS, () => {
    nextTick(() => {
      panelRefs.value.forEach((el) => {
        if (el && panelObserver) panelObserver.observe(el);
      });
      // Re-observer aussi les blocs reveal-on-scroll re-renderes.
      document.querySelectorAll('[data-reveal-on-scroll]:not([data-revealed])').forEach((el) => {
        revealOnScroll.value?.observe(el);
      });
    });
  }, { flush: 'post' });

  revealOnScroll.value = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          (e.target as HTMLElement).dataset.revealed = 'true';
          revealOnScroll.value?.unobserve(e.target);
        }
      }
    },
    { threshold: 0.18 },
  );
  document.querySelectorAll('[data-reveal-on-scroll]').forEach((el) => {
    revealOnScroll.value?.observe(el);
  });

  // Toggle header transparency while the hero section overlaps the viewport.
  // En meme temps : sticky-contact-visible reste false tant que le hero
  // overlap (l'utilisateur n'a pas quitte la "section card" des panels services).
  if (heroSection.value) {
    stickyContactVisible.value = false;
    heroObserver = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const overlapping = e.isIntersecting && e.intersectionRatio > 0;
          headerTransparent.value = overlapping;
          stickyContactVisible.value = !overlapping;
        }
      },
      { threshold: [0, 0.01] },
    );
    heroObserver.observe(heroSection.value);
  }

  window.addEventListener('scroll', onScrollAtTop, { passive: true });
  updateAtTop();

});
onBeforeUnmount(() => {
  panelObserver?.disconnect();
  panelObserver = null;
  revealOnScroll.value?.disconnect();
  revealOnScroll.value = null;
  heroObserver?.disconnect();
  heroObserver = null;
  headerTransparent.value = false;
  // Reset sticky pour les pages suivantes (default = visible).
  stickyContactVisible.value = true;
  window.removeEventListener('scroll', onScrollAtTop);
  cancelAnimationFrame(atTopRaf);
});

// --- Events timeline (lus depuis Sanity, deja ordonnes monthOrder asc) ---
const { events: sanityEvents } = useEvents();
const timelineEvents = computed(() =>
  sanityEvents.value.map((e) => ({
    slug: e.slug,
    en: e.nameEn,
    fr: e.nameFr,
    monthEn: e.monthEn,
    monthFr: e.monthFr,
    tier: e.tier,
    city: e.citySlug || '',
    cityEn: e.cityEn,
    cityFr: e.cityFr,
    image: e.heroImage,
  })),
);

// --- Testimonials (anonymised per CLAUDE.md : profile + origin only, no real names or photos) ---
type Testimonial = {
  quoteEn: string;
  quoteFr: string;
  nameEn: string;
  nameFr: string;
  roleEn: string;
  roleFr: string;
  initials: string;
};

const TESTIMONIALS: Testimonial[] = [
  { quoteEn: 'The driver was at the gate before the bags came off the carousel. The week unfolded in calm.', quoteFr: 'Le chauffeur était à la sortie avant que les bagages ne sortent du tapis. La semaine s\'est déroulée dans le calme.', nameEn: 'A family of four', nameFr: 'Une famille de quatre', roleEn: 'London · Returning guests', roleFr: 'Londres · Habitués', initials: 'LO' },
  { quoteEn: 'We sent the route in March. The reply came in three hours, with a name and a phone.', quoteFr: 'Nous avons envoyé la route en mars. La réponse est venue en trois heures, avec un nom et un téléphone.', nameEn: 'A returning guest', nameFr: 'Un habitué', roleEn: 'Geneva · Three summers', roleFr: 'Genève · Trois étés', initials: 'GE' },
  { quoteEn: 'A table at a place that does not take outside reservations, on a Sunday in August. They knew our names by the second visit.', quoteFr: 'Une table dans un lieu qui ne prend pas de réservation extérieure, un dimanche d\'août. Ils connaissaient nos noms à la deuxième visite.', nameEn: 'A couple', nameFr: 'Un couple', roleEn: 'New York · First visit', roleFr: 'New York · Premier séjour', initials: 'NY' },
  { quoteEn: 'Helicopter at La Mole, yacht at the slip, driver in Monaco who knew where to park. We did not lift a phone all week.', quoteFr: 'Hélicoptère à La Môle, yacht à quai, chauffeur à Monaco qui savait où se garer. Nous n\'avons pas décroché un téléphone de la semaine.', nameEn: 'A group of six', nameFr: 'Un groupe de six', roleEn: 'Munich · Yacht week', roleFr: 'Munich · Semaine en yacht', initials: 'MU' },
  { quoteEn: 'Discretion that takes years to earn. They have it.', quoteFr: 'Une discrétion qui se gagne avec les années. Ils l\'ont.', nameEn: 'A regular', nameFr: 'Un habitué', roleEn: 'Rome · Since 2019', roleFr: 'Rome · Depuis 2019', initials: 'RO' },
  { quoteEn: 'The maitre d\' asked about our daughter by name on the second night.', quoteFr: 'Le maître d\'hôtel a demandé des nouvelles de notre fille par son nom dès le deuxième soir.', nameEn: 'A returning family', nameFr: 'Une famille de retour', roleEn: 'Paris · Three summers', roleFr: 'Paris · Trois étés', initials: 'PA' },
  { quoteEn: 'We changed the dates twice. They changed everything else without us asking.', quoteFr: 'Nous avons changé les dates deux fois. Ils ont changé tout le reste sans qu\'on demande.', nameEn: 'A couple', nameFr: 'Un couple', roleEn: 'Brussels · Festival week', roleFr: 'Bruxelles · Semaine du festival', initials: 'BR' },
  { quoteEn: 'Six destinations in three days. Not a single moment of waiting.', quoteFr: 'Six destinations en trois jours. Pas un seul moment d\'attente.', nameEn: 'A business group', nameFr: 'Un voyage d\'affaires', roleEn: 'Stockholm · Cannes Lions', roleFr: 'Stockholm · Cannes Lions', initials: 'ST' },
  { quoteEn: 'They sent the menu of the restaurant ahead so we could pre-order for our son\'s allergies.', quoteFr: 'Ils ont envoyé le menu du restaurant en amont pour que nous puissions pré-commander pour les allergies de notre fils.', nameEn: 'A family', nameFr: 'Une famille', roleEn: 'Zurich · Returning guests', roleFr: 'Zurich · Habitués', initials: 'ZU' },
  { quoteEn: 'A car at every port. A driver who waits without asking.', quoteFr: 'Une voiture à chaque port. Un chauffeur qui attend sans poser de question.', nameEn: 'A yacht week guest', nameFr: 'Un invité, semaine en yacht', roleEn: 'Antwerp · August charter', roleFr: 'Anvers · Affrètement d\'août', initials: 'AN' },
  { quoteEn: 'Year after year, the same quiet professionalism. Nothing rehearsed, everything ready.', quoteFr: 'Année après année, le même professionnalisme tranquille. Rien de répété, tout est prêt.', nameEn: 'A returning guest', nameFr: 'Un habitué', roleEn: 'Madrid · Five summers', roleFr: 'Madrid · Cinq étés', initials: 'MA' },
  { quoteEn: 'They held the table on the right terrace at the right hour. The light was as we asked.', quoteFr: 'Ils ont tenu la table sur la bonne terrasse à la bonne heure. La lumière était comme nous voulions.', nameEn: 'A couple', nameFr: 'Un couple', roleEn: 'Copenhagen · First visit', roleFr: 'Copenhague · Premier séjour', initials: 'CO' },
];

const testimonialColumns = computed<Testimonial[][]>(() => [
  [TESTIMONIALS[0], TESTIMONIALS[3], TESTIMONIALS[6], TESTIMONIALS[9]],
  [TESTIMONIALS[1], TESTIMONIALS[4], TESTIMONIALS[7], TESTIMONIALS[10]],
  [TESTIMONIALS[2], TESTIMONIALS[5], TESTIMONIALS[8], TESTIMONIALS[11]],
]);

// Each column duplicates its cards so the CSS infinite loop translates
// from 0 to -50% and lands on a visually identical position without a jump.
// Duplicate cards for the infinite scroll. The duplicates are flagged
// so we hide them from screen readers and crawlers (no duplicate
// content indexed, no extra tab-stops).
const loopedColumn = (col: Testimonial[]) =>
  [...col, ...col].map((t, i) => ({ ...t, _dup: i >= col.length }));

// --- Quick search form on the hero intro panel ---
// Flow : 1) pick a service, 2) the relevant fields appear (contextual per service),
// 3) submit hydrates /request with the right query params.
const router = useRouter();

type Opt = { v: string; en: string; fr: string };
type QuickField = { key: string; paramName: string; type: 'select' | 'date'; options?: Opt[] };

const cityOpts: Opt[] = CITIES.map((c) => ({ v: c.slug, en: c.en, fr: c.fr }));
const hubOpts: Opt[] = ['nice', 'monaco', 'cannes', 'saint-tropez']
  .map((s) => CITIES.find((c) => c.slug === s)!)
  .map((c) => ({ v: c.slug, en: c.en, fr: c.fr }));
const portOpts: Opt[] = ['cannes', 'monaco', 'saint-tropez', 'cap-d-antibes']
  .map((s) => CITIES.find((c) => c.slug === s)!)
  .map((c) => ({ v: c.slug, en: c.en, fr: c.fr }));

const SERVICE_FIELDS: Record<string, QuickField[]> = {
  chauffeur: [
    { key: 'pickup', paramName: 'from', type: 'select', options: cityOpts },
    { key: 'dropoff', paramName: 'to', type: 'select', options: cityOpts },
    { key: 'when', paramName: 'date', type: 'date' },
  ],
  cars: [
    { key: 'pickupCity', paramName: 'destination', type: 'select', options: cityOpts },
    { key: 'carType', paramName: 'carType', type: 'select', options: [
      { v: 'grand-tourer', en: 'Grand tourer', fr: 'Grand tourer' },
      { v: 'supercar', en: 'Supercar', fr: 'Supercar' },
      { v: 'convertible', en: 'Convertible', fr: 'Cabriolet' },
      { v: 'suv', en: 'SUV', fr: 'SUV' },
      { v: 'sedan', en: 'Sedan', fr: 'Berline' },
    ] },
    { key: 'when', paramName: 'from', type: 'date' },
  ],
  yacht: [
    { key: 'port', paramName: 'destination', type: 'select', options: portOpts },
    { key: 'duration', paramName: 'duration', type: 'select', options: [
      { v: 'day', en: 'A day', fr: 'Une journée' },
      { v: 'multi-day', en: 'Two to three days', fr: 'Deux à trois jours' },
      { v: 'week', en: 'A week', fr: 'Une semaine' },
    ] },
    { key: 'guests', paramName: 'guests', type: 'select', options: [
      { v: '2', en: '1 to 2', fr: '1 à 2' },
      { v: '4', en: '3 to 4', fr: '3 à 4' },
      { v: '8', en: '5 to 8', fr: '5 à 8' },
      { v: '12', en: '9 to 12', fr: '9 à 12' },
      { v: '13', en: '13 and more', fr: '13 et plus' },
    ] },
  ],
  helicopter: [
    { key: 'from', paramName: 'from', type: 'select', options: hubOpts },
    { key: 'to', paramName: 'to', type: 'select', options: hubOpts },
    { key: 'when', paramName: 'date', type: 'date' },
  ],
  access: [
    {
      key: 'establishment',
      paramName: 'establishment',
      type: 'select',
      options: [
        ...ESTABLISHMENTS.map((e) => ({ v: e.slug, en: e.name, fr: e.name })),
        { v: 'other', en: 'Other / Not sure', fr: 'Autre / Pas encore décidé' },
      ],
    },
    { key: 'when', paramName: 'from', type: 'date' },
    { key: 'guests', paramName: 'guests', type: 'select', options: [
      { v: '2', en: '1 to 2', fr: '1 à 2' },
      { v: '4', en: '3 to 4', fr: '3 à 4' },
      { v: '6', en: '5 to 6', fr: '5 à 6' },
      { v: '10', en: '7 to 10', fr: '7 à 10' },
      { v: '11', en: '11 and more', fr: '11 et plus' },
    ] },
  ],
  // Multi : no fields, the pill click goes straight to /request?service=multi.
  multi: [],
};

const SERVICE_ORDER = ['chauffeur', 'cars', 'yacht', 'helicopter', 'access', 'multi'] as const;

const quick = reactive({
  service: '' as string,
  values: {} as Record<string, string>,
});

const quickFields = computed(() => (quick.service ? SERVICE_FIELDS[quick.service] : []));

function selectQuickService(s: string) {
  // Multi is a direct shortcut : no fields, click sends straight to /request.
  if (s === 'multi') {
    router.push({ path: localePath('/request'), query: { service: 'multi' } });
    return;
  }
  // Cars et yacht : pas de fields contextuels pertinents, on envoie direct
  // sur le listing pour que l'utilisateur choisisse la voiture/le yacht.
  if (s === 'cars') {
    router.push({ path: localePath({ name: 'services-cars-all' }) });
    return;
  }
  if (s === 'yacht') {
    router.push({ path: localePath('/services/yacht/all') });
    return;
  }
  quick.service = s;
  quick.values = {};
}

// Mapping slug ville -> code heliport (pour helicopter scenario route).
const CITY_TO_HELIPORT: Record<string, string> = {
  'nice': 'NCE',
  'monaco': 'MCM',
  'cannes': 'CEQ',
  'saint-tropez': 'LTT',
};

function submitQuickSearch() {
  if (!quick.service) return;
  const query: Record<string, string> = { service: quick.service };
  // Chauffeur a besoin de mode=transfer explicite pour basculer en
  // scenario chauffeur-transfer (sinon tombe en chauffeur-generic).
  if (quick.service === 'chauffeur') query.mode = 'transfer';
  for (const [k, v] of Object.entries(quick.values)) {
    if (!v) continue;
    if (quick.service === 'helicopter' && (k === 'from' || k === 'to')) {
      query[k] = CITY_TO_HELIPORT[v] || v;
    } else if (quick.service === 'chauffeur' && (k === 'from' || k === 'to')) {
      // Slug ville (cannes, monaco) -> nom lisible pour Google Places.
      const c = CITIES.find((x) => x.slug === v);
      query[k] = c ? c.fr : v;
    } else {
      query[k] = v;
    }
  }
  router.push({ path: localePath('/request'), query });
}
</script>

<template>
  <main>
    <!-- Visually hidden h1 for SEO ; the visible heading is inside the sticky panels. -->
    <h2 class="sr-only">{{ t('brand.name') }} · {{ t('brand.longTagline') }}</h2>

    <!-- ============================================== -->
    <!-- 1. SERVICES HERO (sticky vertical stack)        -->
    <!-- ============================================== -->
    <!-- -mt-16 pulls the hero up under the transparent (sticky) header so
         the page starts at the very top of the viewport with no white band. -->
    <section ref="heroSection" class="services-stack relative bg-misana-ink text-misana-paper -mt-16 lg:-mt-24">
      <article
        v-for="(s, idx) in SERVICE_PANELS"
        :key="s.kind === 'intro' ? 'intro' : s.slug"
        :ref="(el) => setPanelRef(el as Element | null, idx)"
        :data-idx="idx"
        :data-revealed="revealed.has(idx) ? 'true' : 'false'"
        data-hero
        class="services-panel sticky top-0 h-dvh overflow-hidden"
        :style="{ zIndex: 10 + idx }"
      >
        <img
          :src="s.img"
          :alt="s.kind === 'intro' ? t('home.heroAlt') : t(`home.serviceAlt.${s.slug}`)"
          class="absolute inset-0 w-full h-full object-cover services-panel-img"
        />
        <div class="absolute inset-0 bg-misana-ink/45"></div>

        <!-- Intro panel : H1 + body + quick search form + sub -->
        <div v-if="s.kind === 'intro'" class="relative h-full flex flex-col items-center justify-center text-center px-6 py-20">
          <div class="overflow-hidden">
            <p class="reveal font-display text-5xl sm:text-7xl lg:text-8xl leading-[0.95]" data-delay="1">
              {{ heroTitle }}
            </p>
          </div>

          <div class="overflow-hidden max-w-2xl mt-8 sm:mt-10">
            <h1 class="reveal font-display text-lg sm:text-2xl lg:text-3xl leading-[1.3] opacity-95" data-delay="2">
              {{ heroBody }}
            </h1>
          </div>

          <!-- Quick search form : sits below the body, above the sub. Variant via ?form= -->
          <div class="reveal-block w-full max-w-3xl mt-10 sm:mt-12" data-delay="3">
            <form
              @submit.prevent="submitQuickSearch"
              class="quick-search mx-auto w-full text-left"
              :data-step="quick.service ? '2' : '1'"
            >
              <!-- Step 1 : service pills (cachee mobile une fois service choisi) -->
              <div class="quick-pill-row">
                <button
                  v-for="s in SERVICE_ORDER"
                  :key="s"
                  type="button"
                  class="quick-pill"
                  :class="quick.service === s ? 'quick-pill-active' : ''"
                  @click="selectQuickService(s)"
                >
                  {{ t(`request.service.${s}`) }}
                </button>
              </div>

              <!-- Step 2 mobile : back button avec service selectionne. -->
              <button
                v-if="quick.service"
                type="button"
                class="quick-step-back"
                @click="quick.service = null"
              >
                <span class="quick-step-back-arrow">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M17 12H7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                    <path d="M10.5 8.5L7 12L10.5 15.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </span>
                <span class="quick-step-back-label">{{ t(`request.service.${quick.service}`) }}</span>
                <span class="quick-step-back-change">{{ t('home.quickChangeService') }}</span>
              </button>

              <!-- Step 2 : contextual fields (only after service is picked) -->
              <Transition name="quick-fields" mode="out-in">
                <div v-if="quick.service" :key="quick.service" class="quick-fields-row">
                  <label
                    v-for="f in quickFields"
                    :key="f.key"
                    class="quick-field"
                  >
                    <span class="quick-field-label">{{ t(`home.field.${f.key}`) }}</span>
                    <select
                      v-if="f.type === 'select'"
                      v-model="quick.values[f.paramName]"
                      class="quick-field-input"
                    >
                      <option value="">{{ t('home.fieldChoose') }}</option>
                      <option v-for="o in f.options" :key="o.v" :value="o.v">
                        {{ locale === 'fr' ? o.fr : o.en }}
                      </option>
                    </select>
                    <input
                      v-else
                      v-model="quick.values[f.paramName]"
                      type="date"
                      class="quick-field-input"
                    />
                  </label>
                  <button type="submit" class="quick-submit">
                    <span>{{ t('home.quickCta') }}</span>
                    <span class="inline-flex items-center justify-center w-[1.1em] h-[1.1em] translate-y-[0.22em]">
                      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="block w-full h-full">
                        <path d="M7 12H17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                        <path d="M13.5 8.5L17 12L13.5 15.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                    </span>
                  </button>
                </div>
                <div v-else class="quick-prompt">
                  <p>{{ t('home.quickPrompt') }}</p>
                </div>
              </Transition>
            </form>
          </div>

          <div class="overflow-hidden mt-8">
            <p class="reveal text-sm sm:text-base opacity-70 max-w-md" data-delay="4">
              {{ heroSub }}
            </p>
          </div>
        </div>

        <!-- Service panel -->
        <div v-else class="relative h-full flex flex-col items-center justify-center text-center px-6">
          <div class="overflow-hidden">
            <p class="reveal" data-delay="1">
              <span v-if="locale === 'en'" class="font-display italic text-xl sm:text-2xl opacity-90">the</span>
            </p>
          </div>
          <div class="overflow-hidden mt-1">
            <h2 class="reveal font-display text-5xl sm:text-7xl lg:text-8xl leading-[0.95]" data-delay="2">
              {{ s.titleOverride || t(`request.service.${s.slug}`) }}
            </h2>
          </div>
          <div class="reveal-line w-px h-16 sm:h-20 bg-misana-paper/70 my-8 sm:my-9" data-delay="3"></div>
          <div class="overflow-hidden max-w-md">
            <p class="reveal text-base sm:text-lg leading-relaxed opacity-90" data-delay="4">
              {{ s.bodyOverride || t(`home.serviceBody.${s.slug}`) }}
            </p>
          </div>
          <div class="overflow-hidden mt-10">
            <NuxtLink
              :to="localePath({ name: `services-${s.slug}` })"
              class="reveal group inline-flex items-center gap-8 pb-2 border-b-[1.5px] border-misana-paper text-base sm:text-lg tracking-wide"
              data-delay="5"
            >
              <span>{{ s.ctaOverride || t(`home.serviceCardCta.${s.slug}`) }}</span>
            </NuxtLink>
          </div>
        </div>
      </article>

    </section>


    <!-- ============================================== -->
    <!-- 2. EVENTS LIST (calendar of the season, dark)   -->
    <!-- ============================================== -->
    <section id="agenda" class="border-b border-misana-paper/15 bg-misana-ink text-misana-paper scroll-mt-16">
      <div class="max-w-[1600px] mx-auto px-8 sm:px-16 lg:px-24 py-16 sm:py-24" data-reveal-on-scroll>
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 mb-12 sm:mb-20 items-end reveal-block">
          <div class="lg:col-span-7">
            <p class="text-[11px] uppercase tracking-[0.2em] opacity-60 mb-4">(MS · 02) · {{ agendaKicker }}</p>
            <h2 class="font-display text-3xl sm:text-5xl lg:text-6xl leading-[1.02]">{{ agendaTitle }}</h2>
          </div>
          <div class="lg:col-span-5 lg:text-right">
            <p class="opacity-70 mb-6 max-w-md lg:ml-auto" data-display>{{ agendaLead }}</p>
            <!-- Lien "Voir tous les evenements" cache : page /events pas
                 prete au lancement V1. A reactiver quand le hub events
                 sera publie. -->
            <NuxtLink v-if="false" :to="localePath('/events')" class="inline-flex items-baseline gap-2 text-sm group">
              <span class="border-b border-misana-paper pb-0.5 transition group-hover:opacity-70">{{ t('home.allEvents') }}</span>
              <span aria-hidden="true" class="transition-transform group-hover:translate-x-0.5">→</span>
            </NuxtLink>
          </div>
        </div>

        <ul class="border-t border-misana-paper/20 reveal-block">
          <li
            v-for="(ev, idx) in timelineEvents"
            :key="ev.slug"
            class="event-row border-b border-misana-paper/20"
          >
            <!-- Mobile : flex-col stacked. Desktop (sm+) : grid-cols-12 row.
                 sm:contents sur les wrappers permet aux enfants d'etre des
                 grid items directs en desktop. -->
            <NuxtLink
              :to="localePath({ path: '/request', query: { event: ev.slug } })"
              class="flex flex-col gap-3 sm:grid sm:grid-cols-12 sm:gap-6 py-6 sm:py-12 px-3 sm:px-6 sm:items-center group relative"
            >
              <!-- Mobile : top inline (number + date + month), compact -->
              <div class="flex items-baseline gap-3 sm:contents">
                <span class="font-sans text-sm sm:text-xl opacity-40 tabular-nums sm:col-span-1">
                  {{ String(idx + 1).padStart(2, '0') }}
                </span>
                <span class="flex items-baseline gap-1.5 sm:col-span-2 sm:gap-2">
                  <span class="font-sans text-sm sm:text-3xl tabular-nums">{{ String(ev.monthOrder).padStart(2, '0') }}</span>
                  <span class="opacity-40">/</span>
                  <span class="font-sans text-sm sm:text-3xl tabular-nums">26</span>
                </span>
                <span class="text-[11px] uppercase tracking-widest opacity-60 sm:hidden">
                  {{ locale === 'fr' ? ev.monthFr : ev.monthEn }} · {{ locale === 'fr' ? ev.cityFr : ev.cityEn }}
                </span>
              </div>

              <!-- Title -->
              <div class="event-row-clip pr-2 sm:pr-4 sm:col-span-6">
                <p class="font-display text-3xl sm:text-5xl leading-[1.05] event-row-title-base">
                  {{ locale === 'fr' ? ev.fr : ev.en }}
                </p>
                <p class="font-display text-3xl sm:text-5xl leading-[1.05] italic event-row-title-hover">
                  {{ locale === 'fr' ? ev.fr : ev.en }}
                </p>
              </div>

              <!-- City + month label (desktop only) -->
              <div class="hidden sm:block sm:col-span-1 text-sm opacity-80">
                <p>{{ locale === 'fr' ? ev.cityFr : ev.cityEn }}</p>
                <p class="text-xs opacity-60 mt-0.5">{{ locale === 'fr' ? ev.monthFr : ev.monthEn }}</p>
              </div>

              <!-- CTA -->
              <div class="flex items-center justify-end gap-2.5 text-xs sm:text-sm sm:col-span-2">
                <span class="event-row-cta">{{ t('home.timelineCta') }}</span>
                <span class="event-row-arrow inline-flex items-center justify-center w-[1.3em] h-[1.3em] translate-y-[0.22em]">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="block w-full h-full">
                    <path d="M7 12H17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                    <path d="M13.5 8.5L17 12L13.5 15.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </span>
              </div>

              <!-- Floating thumbnail desktop only (cache mobile via .event-row-thumb) -->
              <div v-if="ev.image" class="event-row-thumb">
                <img :src="ev.image" :alt="locale === 'fr' ? ev.fr : ev.en" loading="lazy" />
              </div>

              <!-- Subtle row tint -->
              <div class="event-row-hover absolute inset-0 -z-10"></div>
            </NuxtLink>
          </li>
        </ul>

        <p class="mt-10 text-[11px] uppercase tracking-[0.2em] opacity-50 reveal-block" data-display>
          {{ agendaFootnote }}
        </p>
      </div>
    </section>

    <!-- ============================================== -->
    <!-- 3. TESTIMONIALS (3 columns infinite vertical loop) -->
    <!-- ============================================== -->
    <section class="relative bg-misana-ink text-misana-paper overflow-hidden">
      <!-- Title bar -->
      <div class="px-6 pt-20 sm:pt-28 pb-12 sm:pb-16 max-w-3xl mx-auto w-full text-center" data-reveal-on-scroll>
        <p class="text-[11px] uppercase tracking-[0.25em] opacity-60 mb-5 reveal-block">(MS · 03) · {{ testimonialsKicker }}</p>
        <h2 class="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] reveal-block">
          {{ testimonialsTitleStart }}
          <em class="italic opacity-70">{{ testimonialsTitleAccent }}</em>
        </h2>
      </div>

      <!-- 3 columns infinite loop. Cards duplicated 2x per column so the keyframe
           translates from 0 to -50% and lands on a visually identical position. -->
      <div class="relative max-w-[1600px] mx-auto px-6 sm:px-12 pb-12 sm:pb-16">
        <div class="testimonials-loop relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          <!-- Column 1 -->
          <div class="testimonial-col h-[78vh] sm:h-[80vh] overflow-hidden relative">
            <div class="testimonial-track testimonial-track-down-slow">
              <article v-for="(t_, idx) in loopedColumn(testimonialColumns[0])" :key="`c0-${idx}`" :aria-hidden="t_._dup ? 'true' : null" :inert="t_._dup || null" class="testimonial-card">
                <div class="flex items-start justify-between mb-5">
                  <svg width="34" height="26" viewBox="0 0 34 26" fill="currentColor" class="text-misana-ink/35" aria-hidden="true">
                    <path d="M0 26V14.6c0-3.4.5-6.4 1.6-9C2.7 3.1 4.4 1.1 6.7 0l3 3.4C8.4 4.1 7.4 5.1 6.6 6.4c-.8 1.3-1.3 2.7-1.5 4.3h6.4V26H0zm18.7 0V14.6c0-3.4.5-6.4 1.6-9C21.4 3.1 23.1 1.1 25.4 0l3 3.4c-1.3.7-2.4 1.7-3.1 3-.8 1.3-1.3 2.7-1.5 4.3H30V26H18.7z"/>
                  </svg>
                  <div class="flex items-center gap-1 mt-1.5 text-misana-ink/40">
                    <svg v-for="n in 5" :key="n" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 2l2.6 7.2L22 10l-5.7 4.9 1.9 7.1L12 18l-6.2 4 1.9-7.1L2 10l7.4-.8L12 2z" />
                    </svg>
                  </div>
                </div>
                <p class="font-display text-base sm:text-lg leading-relaxed text-misana-ink mb-7">{{ locale === 'fr' ? t_.quoteFr : t_.quoteEn }}</p>
                <div class="flex items-center gap-4">
                  <div class="w-11 h-11 rounded-full bg-misana-stone flex items-center justify-center text-[11px] font-display tracking-[0.15em] text-misana-ink shrink-0">{{ t_.initials }}</div>
                  <div class="min-w-0">
                    <p class="text-sm font-medium text-misana-ink truncate">{{ locale === 'fr' ? t_.nameFr : t_.nameEn }}</p>
                    <p class="text-xs text-misana-muted truncate">{{ locale === 'fr' ? t_.roleFr : t_.roleEn }}</p>
                  </div>
                </div>
              </article>
            </div>
          </div>

          <!-- Column 2 (hidden mobile) -->
          <div class="testimonial-col hidden md:block h-[78vh] sm:h-[80vh] overflow-hidden relative">
            <div class="testimonial-track testimonial-track-up">
              <article v-for="(t_, idx) in loopedColumn(testimonialColumns[1])" :key="`c1-${idx}`" :aria-hidden="t_._dup ? 'true' : null" :inert="t_._dup || null" class="testimonial-card">
                <div class="flex items-start justify-between mb-5">
                  <svg width="34" height="26" viewBox="0 0 34 26" fill="currentColor" class="text-misana-ink/35" aria-hidden="true">
                    <path d="M0 26V14.6c0-3.4.5-6.4 1.6-9C2.7 3.1 4.4 1.1 6.7 0l3 3.4C8.4 4.1 7.4 5.1 6.6 6.4c-.8 1.3-1.3 2.7-1.5 4.3h6.4V26H0zm18.7 0V14.6c0-3.4.5-6.4 1.6-9C21.4 3.1 23.1 1.1 25.4 0l3 3.4c-1.3.7-2.4 1.7-3.1 3-.8 1.3-1.3 2.7-1.5 4.3H30V26H18.7z"/>
                  </svg>
                  <div class="flex items-center gap-1 mt-1.5 text-misana-ink/40">
                    <svg v-for="n in 5" :key="n" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 2l2.6 7.2L22 10l-5.7 4.9 1.9 7.1L12 18l-6.2 4 1.9-7.1L2 10l7.4-.8L12 2z" />
                    </svg>
                  </div>
                </div>
                <p class="font-display text-base sm:text-lg leading-relaxed text-misana-ink mb-7">{{ locale === 'fr' ? t_.quoteFr : t_.quoteEn }}</p>
                <div class="flex items-center gap-4">
                  <div class="w-11 h-11 rounded-full bg-misana-stone flex items-center justify-center text-[11px] font-display tracking-[0.15em] text-misana-ink shrink-0">{{ t_.initials }}</div>
                  <div class="min-w-0">
                    <p class="text-sm font-medium text-misana-ink truncate">{{ locale === 'fr' ? t_.nameFr : t_.nameEn }}</p>
                    <p class="text-xs text-misana-muted truncate">{{ locale === 'fr' ? t_.roleFr : t_.roleEn }}</p>
                  </div>
                </div>
              </article>
            </div>
          </div>

          <!-- Column 3 (hidden tablet) -->
          <div class="testimonial-col hidden lg:block h-[78vh] sm:h-[80vh] overflow-hidden relative">
            <div class="testimonial-track testimonial-track-down-fast">
              <article v-for="(t_, idx) in loopedColumn(testimonialColumns[2])" :key="`c2-${idx}`" :aria-hidden="t_._dup ? 'true' : null" :inert="t_._dup || null" class="testimonial-card">
                <div class="flex items-start justify-between mb-5">
                  <svg width="34" height="26" viewBox="0 0 34 26" fill="currentColor" class="text-misana-ink/35" aria-hidden="true">
                    <path d="M0 26V14.6c0-3.4.5-6.4 1.6-9C2.7 3.1 4.4 1.1 6.7 0l3 3.4C8.4 4.1 7.4 5.1 6.6 6.4c-.8 1.3-1.3 2.7-1.5 4.3h6.4V26H0zm18.7 0V14.6c0-3.4.5-6.4 1.6-9C21.4 3.1 23.1 1.1 25.4 0l3 3.4c-1.3.7-2.4 1.7-3.1 3-.8 1.3-1.3 2.7-1.5 4.3H30V26H18.7z"/>
                  </svg>
                  <div class="flex items-center gap-1 mt-1.5 text-misana-ink/40">
                    <svg v-for="n in 5" :key="n" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 2l2.6 7.2L22 10l-5.7 4.9 1.9 7.1L12 18l-6.2 4 1.9-7.1L2 10l7.4-.8L12 2z" />
                    </svg>
                  </div>
                </div>
                <p class="font-display text-base sm:text-lg leading-relaxed text-misana-ink mb-7">{{ locale === 'fr' ? t_.quoteFr : t_.quoteEn }}</p>
                <div class="flex items-center gap-4">
                  <div class="w-11 h-11 rounded-full bg-misana-stone flex items-center justify-center text-[11px] font-display tracking-[0.15em] text-misana-ink shrink-0">{{ t_.initials }}</div>
                  <div class="min-w-0">
                    <p class="text-sm font-medium text-misana-ink truncate">{{ locale === 'fr' ? t_.nameFr : t_.nameEn }}</p>
                    <p class="text-xs text-misana-muted truncate">{{ locale === 'fr' ? t_.roleFr : t_.roleEn }}</p>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>

        <!-- Soft fade overlays clipping the top and bottom of the columns -->
        <div class="testimonials-fade-top pointer-events-none absolute top-0 left-0 right-0"></div>
        <div class="testimonials-fade-bottom pointer-events-none absolute bottom-12 sm:bottom-16 left-0 right-0"></div>
      </div>
    </section>

  </main>
</template>

<style scoped>
/* Sticky stack of service panels (hero). Footer overlay is rendered as a sibling
   pinned to the viewport bottom only while the hero is visible (toggled via v-show). */
.services-stack-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 50;
  pointer-events: none;
}

/* Reveal animation triggered by IntersectionObserver via [data-revealed]. */
.reveal {
  display: inline-block;
  opacity: 0;
  transform: translateY(110%);
  transition:
    opacity 1.1s cubic-bezier(0.16, 1, 0.3, 1),
    transform 1.1s cubic-bezier(0.16, 1, 0.3, 1);
}
[data-revealed="true"] .reveal { opacity: 1; transform: translateY(0); }
[data-revealed="true"] .reveal[data-delay="1"] { transition-delay: 0.05s; }
[data-revealed="true"] .reveal[data-delay="2"] { transition-delay: 0.18s; }
[data-revealed="true"] .reveal[data-delay="3"] { transition-delay: 0.28s; }
[data-revealed="true"] .reveal[data-delay="4"] { transition-delay: 0.42s; }
[data-revealed="true"] .reveal[data-delay="5"] { transition-delay: 0.58s; }

.reveal-line {
  transform: scaleY(0);
  transform-origin: top center;
  transition: transform 1.4s cubic-bezier(0.16, 1, 0.3, 1) 0.28s;
}
[data-revealed="true"] .reveal-line { transform: scaleY(1); }

.services-panel-img {
  transform: none;
}

/* Event list rows. Title uses a two-layer clip reveal : the regular title (in flow,
   defines the container height so multi-line titles work) slides up out of view
   while an italic clone slides up into place from below. */
.event-row-clip {
  position: relative;
  overflow: hidden;
}
.event-row-title-base {
  position: relative;
  margin: 0;
  transform: translateY(0);
  transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform;
}
.event-row-title-hover {
  position: absolute;
  inset: 0;
  margin: 0;
  transform: translateY(105%);
  opacity: 0.92;
  transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform;
}
.event-row a:hover .event-row-title-base { transform: translateY(-105%); }
.event-row a:hover .event-row-title-hover { transform: translateY(0); }

.event-row-arrow {
  transition: transform 0.55s cubic-bezier(0.16, 1, 0.3, 1);
}
.event-row a:hover .event-row-arrow { transform: translateX(8px); }

.event-row-cta {
  position: relative;
  padding-bottom: 2px;
}
.event-row-cta::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  height: 1px;
  width: 100%;
  background: currentColor;
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.event-row a:hover .event-row-cta::after {
  transform: scaleX(1);
  transform-origin: left;
}

.event-row-hover {
  background: rgba(255, 255, 255, 0.05);
  opacity: 0;
  transition: opacity 0.45s ease;
}
.event-row a:hover .event-row-hover { opacity: 1; }

.event-row-thumb {
  position: absolute;
  pointer-events: none;
  top: 50%;
  left: 60%;
  width: 220px;
  aspect-ratio: 4 / 3;
  transform: translateY(-50%) translateX(-10px) scale(0.92);
  opacity: 0;
  overflow: hidden;
  z-index: 5;
  transition:
    opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
  filter: brightness(0.85) saturate(0.9);
}
.event-row-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.event-row a:hover .event-row-thumb {
  opacity: 1;
  transform: translateY(-50%) translateX(0) scale(1);
}
@media (max-width: 768px) {
  .event-row-thumb { display: none; }
}

/* Testimonials infinite vertical loop.
   Each track contains 2 copies of the same card list. The keyframe translates
   from 0 to -50% (down direction) or -50% to 0 (up direction) and loops linearly,
   so the visible window always shows cards smoothly without a visible jump. */
.testimonial-card {
  background: var(--color-misana-paper);
  color: var(--color-misana-ink);
  padding: 1.5rem 1.4rem;
  margin-bottom: 1rem;
  border-radius: 0;
}

.testimonial-track {
  will-change: transform;
}

@keyframes testimonial-loop-down {
  0%   { transform: translateY(0%); }
  100% { transform: translateY(-50%); }
}
@keyframes testimonial-loop-up {
  0%   { transform: translateY(-50%); }
  100% { transform: translateY(0%); }
}

.testimonial-track-down-slow { animation: testimonial-loop-down 64s linear infinite; }
.testimonial-track-up        { animation: testimonial-loop-up 56s linear infinite; }
.testimonial-track-down-fast { animation: testimonial-loop-down 48s linear infinite; }


/* Top + bottom fades on the whole column band, clipping cards entering/exiting.
   Gradient uses ink to seamlessly meet the dark footer below. */
.testimonials-fade-top,
.testimonials-fade-bottom {
  height: 12vh;
  z-index: 5;
}
.testimonials-fade-top {
  background: linear-gradient(to bottom, var(--color-misana-ink) 0%, transparent 100%);
}
.testimonials-fade-bottom {
  background: linear-gradient(to top, var(--color-misana-ink) 0%, transparent 100%);
}

@media (prefers-reduced-motion: reduce) {
  .testimonial-track {
    animation: none;
  }
}

/* Quick search form on the hero intro panel.
   Glass : paper-tinted backdrop-blur over the dark hero image, paper-on-glass text.

   Subgrid alignment : the form is itself a 12-column grid. Pills row uses subgrid
   with each pill spanning 2 cols (12 / 6 = 2). Fields row uses subgrid with each
   field/submit spanning 3 cols (12 / 4 = 3). Both rows share the SAME column
   tracks computed once on the parent, so all hairlines line up at the pixel,
   regardless of viewport width. */
.quick-search {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  background: rgba(255, 255, 255, 0.07);
  backdrop-filter: blur(20px) saturate(1.05);
  -webkit-backdrop-filter: blur(20px) saturate(1.05);
  border: 1px solid rgba(255, 255, 255, 0.32);
  color: var(--color-misana-paper);
}

.quick-pill-row {
  grid-column: 1 / -1;
  display: grid;
  /* 6 colonnes egales explicites (pas de subgrid : compatibilite +
     evite l'effet 'pills concatenees' quand subgrid n'est pas
     applique). */
  grid-template-columns: repeat(6, minmax(0, 1fr));
  border-bottom: 1px solid rgba(255, 255, 255, 0.22);
}
/* Mobile : en step 2, on cache la liste des pills, le back button la
   remplace fonctionnellement. Desktop garde tout visible. */
@media (max-width: 639px) {
  .quick-search[data-step="2"] .quick-pill-row { display: none; }
}

/* Back button mobile : visible uniquement en step 2 et < 640px. */
.quick-step-back {
  grid-column: 1 / -1;
  display: none;
  align-items: center;
  gap: 0.85rem;
  padding: 1.05rem 1.1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.22);
  background: transparent;
  color: var(--color-misana-paper);
  cursor: pointer;
  text-align: left;
  width: 100%;
}
@media (max-width: 639px) {
  .quick-search[data-step="2"] .quick-step-back { display: flex; }
}
.quick-step-back-arrow {
  flex: 0 0 auto;
  width: 1.1rem;
  height: 1.1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.quick-step-back-arrow svg { width: 100%; height: 100%; }
.quick-step-back-label {
  flex: 1 1 auto;
  font-size: 0.8rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}
.quick-step-back-change {
  flex: 0 0 auto;
  font-size: 0.65rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  opacity: 0.6;
}
.quick-pill {
  padding: 0.85rem 0.5rem;
  font-size: 0.7rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-misana-paper);
  background: transparent;
  border-right: 1px solid rgba(255, 255, 255, 0.22);
  transition: background 0.25s ease, color 0.25s ease;
  cursor: pointer;
  min-height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  line-height: 1.2;
}
.quick-pill:last-child { border-right: 0; }
/* Mobile : 2 colonnes (3 rangees) pour 6 pills, plus lisible. */
@media (max-width: 639px) {
  .quick-pill-row { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .quick-pill {
    font-size: 0.72rem;
    letter-spacing: 0.15em;
    padding: 1rem 0.75rem;
    min-height: 56px;
  }
  .quick-pill:nth-child(2n) { border-right: 0; }
  .quick-pill:nth-child(2n+1) { border-right: 1px solid rgba(255, 255, 255, 0.22); }
  .quick-pill:nth-child(n+3) { border-top: 1px solid rgba(255, 255, 255, 0.22); }
}
.quick-pill:hover { background: rgba(255, 255, 255, 0.08); }
.quick-pill-active {
  background: transparent;
  color: var(--color-misana-paper);
  position: relative;
}
.quick-pill-active::after {
  content: '';
  position: absolute;
  left: 1rem;
  right: 1rem;
  bottom: -1px;
  height: 1.5px;
  background: var(--color-misana-paper);
}

.quick-fields-row {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: subgrid;
  align-items: stretch;
}
.quick-field {
  display: block;
  padding: 0.85rem 1.1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.22);
  cursor: pointer;
  background: transparent;
  text-align: left;
}
.quick-field:last-of-type { border-bottom: 0; }
@media (max-width: 767px) {
  .quick-field { grid-column: 1 / -1; }
}
@media (min-width: 768px) {
  .quick-field {
    grid-column: span 3;
    border-bottom: 0;
    border-right: 1px solid rgba(255, 255, 255, 0.22);
  }
}
.quick-field:hover { background: rgba(255, 255, 255, 0.05); }
.quick-field-label {
  display: block;
  font-size: 0.625rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 0.25rem;
}
.quick-field-input {
  width: 100%;
  background: transparent;
  color: var(--color-misana-paper);
  font-size: 0.875rem;
  border: 0;
  outline: none;
  cursor: pointer;
  font-family: inherit;
  color-scheme: dark;
}
.quick-field-input option {
  background: var(--color-misana-ink);
  color: var(--color-misana-paper);
}

.quick-submit {
  background: var(--color-misana-paper);
  color: var(--color-misana-ink);
  padding: 0 1.6rem;
  font-size: 0.8rem;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  line-height: 1;
  transition: opacity 0.25s ease;
  min-height: 56px;
}
.quick-submit:hover { opacity: 0.9; }
@media (min-width: 768px) {
  .quick-submit { grid-column: span 3; }
}
@media (max-width: 767px) {
  .quick-submit {
    grid-column: 1 / -1;
    padding: 0.95rem 1.6rem;
    border-top: 1px solid rgba(255, 255, 255, 0.22);
  }
}

.quick-prompt {
  grid-column: 1 / -1;
  padding: 1.4rem 1.1rem;
  text-align: center;
  font-size: 0.85rem;
  letter-spacing: 0.02em;
  color: rgba(255, 255, 255, 0.7);
}


/* Smooth fade between service field configurations. */
.quick-fields-enter-active,
.quick-fields-leave-active {
  transition: opacity 0.32s ease, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.quick-fields-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.quick-fields-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* Generic block reveal for editorial sections (cities, services, etc.). */
.reveal-block {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1), transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
}
[data-revealed="true"].reveal-block,
[data-revealed="true"] .reveal-block { opacity: 1; transform: translateY(0); }

@media (prefers-reduced-motion: reduce) {
  .reveal, .reveal-line, .reveal-block, .services-panel-img {
    transform: none !important;
    transition: none !important;
    opacity: 1 !important;
  }
}
</style>

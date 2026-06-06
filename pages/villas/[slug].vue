<script setup lang="ts">
// Fiche villa /villas/[slug]. Reference structurelle : fiche Le Collectionist
// (Villa Mala) adaptee a l'identite Misana. Donnees Sanity (import LC).
// Tous les blocs sont conditionnels : la donnee importee est partielle
// (relationships LC non encore mappees), la page degrade proprement et
// les blocs s'activent des que les champs sont presents.
import { CITIES } from '~/lib/constants';

definePageMeta({ layout: 'default' });
defineI18nRoute({ paths: { en: '/luxury-villa-rental/[slug]', fr: '/location-villa-de-luxe/[slug]' } });

const route = useRoute();
const sanity = useSanity();
const { locale, t } = useI18n();
const localePath = useLocalePath();

type Loc = { fr?: string | null; en?: string | null };
type LocList = { fr?: string[] | null; en?: string[] | null };
type PtBlock = { _type: string; style?: string; listItem?: string; children?: any[]; markDefs?: any[] };
type LocPt = { fr?: PtBlock[] | null; en?: PtBlock[] | null };

type Room = {
  name?: Loc | null;
  bedType?: Loc | null;
  tv?: boolean; ac?: boolean; terrace?: boolean;
  seaView?: boolean; safe?: boolean; ensuiteBathroom?: boolean;
};
type Pool = {
  name?: string | null; heated?: boolean; indoor?: boolean;
  lengthM?: number | null; widthM?: number | null; sunbeds?: number | null;
};
type AreaItem = { labelFr?: string; labelEn?: string; detailFr?: string; detailEn?: string };
type AreaDetail = {
  identifier?: string | null; nameFr?: string | null; nameEn?: string | null;
  inside?: boolean; tagsFr?: string[]; tagsEn?: string[]; items?: AreaItem[];
};

type Villa = {
  _id: string;
  name: string;
  city: string;
  slug: { fr?: { current?: string }; en?: { current?: string } } | null;
  hero: string | null;
  gallery: string[] | null;
  bedrooms: number | null; bathrooms: number | null; capacity: number | null;
  surface: number | null; domainSurface: number | null;
  elevator: boolean | null; insideParking: boolean | null; outsideParking: boolean | null;
  floorHeatingSystem: boolean | null; petFriendly: boolean | null;
  suitableForChildren: boolean | null; suitableForPeopleWithReducedMobility: boolean | null;
  matterportUrl: string | null;
  pricePerWeekFrom: number | null; pricePerWeekTo: number | null;
  displayPrices: boolean | null; publicTaxes: number | null;
  keyFeatures: LocList | null; amenities: LocList | null;
  areasDetail: AreaDetail[] | null;
  pools: Pool[] | null; rooms: Room[] | null;
  seaView: boolean | null; setting: string | null;
  gpsLat: number | null; gpsLng: number | null;
  beachDistanceMin: number | null; downtownDistanceMin: number | null;
  restaurantsDistanceMin: number | null; shopsDistanceMin: number | null;
  nearby: { category: string; mode: string | null; min: number | null }[] | null;
  surroundingDescription: Loc | null;
  includedServices: LocList | null; aLaCarteServices: LocList | null;
  housekeepingFrequency: Loc | null;
  checkInTime: number | null; checkOutTime: number | null; licenceNumber: string | null;
  shortDesc: Loc | null; body: LocPt | null; goodToKnow: Loc | null;
  lcHouseId: number | null; lcSlugEn: string | null; lcSlugFr: string | null;
  seo: { descriptionEn?: string; descriptionFr?: string } | null;
};

const VILLA_QUERY = /* groq */ `*[_type == "villa" &&
  (slugI18n.fr.current == $slug || slugI18n.en.current == $slug) &&
  published == true][0]{
  _id, name, city,
  "slug": slugI18n,
  "hero": hero.asset->url,
  "gallery": gallery[].asset->url,
  bedrooms, bathrooms, capacity, surface, domainSurface,
  elevator, insideParking, outsideParking,
  floorHeatingSystem, petFriendly, suitableForChildren,
  suitableForPeopleWithReducedMobility,
  matterportUrl,
  pricePerWeekFrom, pricePerWeekTo, displayPrices, publicTaxes,
  keyFeatures, amenities, pools, rooms, areasDetail,
  seaView, setting, gpsLat, gpsLng,
  beachDistanceMin, downtownDistanceMin,
  restaurantsDistanceMin, shopsDistanceMin,
  "nearby": nearby[]{category, mode, min},
  surroundingDescription,
  includedServices, aLaCarteServices, housekeepingFrequency,
  checkInTime, checkOutTime, licenceNumber,
  shortDesc, body, goodToKnow,
  lcHouseId, lcSlugEn, lcSlugFr,
  "seo": seo
}`;

const slug = computed(() => String(route.params.slug ?? ''));

// useAsyncData (non lazy) pour fiabiliser le 404 + le SSR du SEO. Le
// Promise.race coupe a 3s pour eviter le hang SSR sur cold start Vercel.
const { data: villa } = await useAsyncData<Villa | null>(
  `villa-${slug.value}`,
  async () => {
    try {
      return (await Promise.race([
        (sanity.client as any).fetch(VILLA_QUERY, { slug: slug.value }),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000)),
      ])) as Villa | null;
    } catch (err: any) {
      console.error('[villas/slug] Sanity fetch failed:', err?.message ?? err);
      return null;
    }
  },
  { watch: [slug] },
);

if (!villa.value) {
  throw createError({ statusCode: 404, statusMessage: 'Villa not found', fatal: true });
}

// 17 villes possibles (superset des 8 destinations Misana). Label local.
const CITY_LABELS: Record<string, { fr: string; en: string }> = {
  'saint-tropez': { fr: 'Saint-Tropez', en: 'Saint-Tropez' },
  'ramatuelle': { fr: 'Ramatuelle', en: 'Ramatuelle' },
  'gassin': { fr: 'Gassin', en: 'Gassin' },
  'grimaud': { fr: 'Grimaud', en: 'Grimaud' },
  'la-croix-valmer': { fr: 'La Croix-Valmer', en: 'La Croix-Valmer' },
  'sainte-maxime': { fr: 'Sainte-Maxime', en: 'Sainte-Maxime' },
  'cavalaire-sur-mer': { fr: 'Cavalaire-sur-Mer', en: 'Cavalaire-sur-Mer' },
  'cannes': { fr: 'Cannes', en: 'Cannes' },
  'mougins': { fr: 'Mougins', en: 'Mougins' },
  'antibes': { fr: 'Antibes', en: 'Antibes' },
  'cap-d-antibes': { fr: "Cap d'Antibes", en: "Cap d'Antibes" },
  'villefranche-sur-mer': { fr: 'Villefranche-sur-Mer', en: 'Villefranche-sur-Mer' },
  'nice': { fr: 'Nice', en: 'Nice' },
  'eze': { fr: 'Èze', en: 'Èze' },
  'monaco': { fr: 'Monaco', en: 'Monaco' },
  'menton': { fr: 'Menton', en: 'Menton' },
  'cap-ferrat': { fr: 'Cap-Ferrat', en: 'Cap-Ferrat' },
};
function cityLabel(city: string | null): string {
  if (!city) return '';
  const c = CITY_LABELS[city];
  if (c) return locale.value === 'fr' ? c.fr : c.en;
  const known = CITIES.find((x) => x.slug === city);
  if (known) return locale.value === 'fr' ? known.fr : known.en;
  return city;
}

const loc = computed<'fr' | 'en'>(() => (locale.value === 'fr' ? 'fr' : 'en'));
// Nettoie les valeurs "not_specified" qui peuvent fuiter de la donnee LC.
function cleanStr(s: string | null | undefined): string {
  if (!s) return '';
  return s
    .replace(/\(?\s*\bnot[_ ]?specified\b\s*\)?/gi, '')
    .replace(/\(\s*\)/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+,/g, ',')
    .trim();
}
function pickLoc(v: Loc | null | undefined): string {
  if (!v) return '';
  return cleanStr((v[loc.value] ?? v.en ?? v.fr ?? '') || '');
}
function pickLocList(v: LocList | null | undefined): string[] {
  if (!v) return [];
  return ((v[loc.value] ?? v.en ?? v.fr ?? []) || []).map(cleanStr).filter(Boolean);
}
function pickBody(v: LocPt | null | undefined): PtBlock[] {
  if (!v) return [];
  return (v[loc.value] ?? v.en ?? v.fr ?? []) || [];
}

function fmtPrice(p: number | null | undefined): string {
  if (p == null) return '';
  return new Intl.NumberFormat(locale.value === 'fr' ? 'fr-FR' : 'en-GB', {
    style: 'currency', currency: 'EUR', maximumFractionDigits: 0,
  }).format(p);
}

// ============== Mini renderer Portable Text ==============
// Aucun composant tiers. Gere styles h2/h3/normal/blockquote, listes
// bullet/number, marks strong/em et annotations link.
const PortableText = defineComponent({
  name: 'VillaPortableText',
  props: { blocks: { type: Array as () => PtBlock[], default: () => [] } },
  setup(props) {
    const renderSpan = (child: any, block: PtBlock) => {
      let node: any = child.text ?? '';
      for (const m of (child.marks ?? []) as string[]) {
        const def = (block.markDefs ?? []).find((d: any) => d._key === m);
        if (def && def._type === 'link') {
          node = h('a', { href: def.href, target: '_blank', rel: 'noopener', class: 'pt-link' }, [node]);
        } else if (m === 'strong') {
          node = h('strong', [node]);
        } else if (m === 'em') {
          node = h('em', [node]);
        }
      }
      return node;
    };
    const spans = (block: PtBlock) => (block.children ?? []).map((c: any) => renderSpan(c, block));
    const renderBlock = (block: PtBlock) => {
      const style = block.style ?? 'normal';
      if (style === 'h2') return h('h2', { class: 'font-display text-xl mt-8 mb-3' }, spans(block));
      if (style === 'h3') return h('h3', { class: 'font-display text-lg mt-6 mb-2' }, spans(block));
      if (style === 'blockquote') return h('blockquote', { class: 'pt-quote' }, spans(block));
      return h('p', { class: 'text-base leading-relaxed mb-4' }, spans(block));
    };
    return () => {
      const out: any[] = [];
      let list: any[] | null = null;
      let listKind: string | null = null;
      const flush = () => {
        if (list) {
          out.push(h(listKind === 'number' ? 'ol' : 'ul', { class: 'list-disc pl-5 mb-4 text-misana-muted' }, list));
          list = null; listKind = null;
        }
      };
      for (const block of props.blocks) {
        if (!block || block._type !== 'block') continue;
        if (block.listItem) {
          if (!list) { list = []; listKind = block.listItem; }
          list.push(h('li', spans(block)));
        } else {
          flush();
          out.push(renderBlock(block));
        }
      }
      flush();
      return out;
    };
  },
});

// ============== Etat UI ==============
// Visionneuse plein ecran : index de l'image courante (null = fermee) + zoom.
const lightboxIndex = ref<number | null>(null);
const lightboxZoom = ref(false);
const descOpen = ref(false);
const openFaq = ref<number | null>(0);

const galleryOpen = computed(() => lightboxIndex.value !== null);
function openLightbox(i: number) {
  lightboxIndex.value = i;
  lightboxZoom.value = false;
}
function closeLightbox() { lightboxIndex.value = null; lightboxZoom.value = false; }
function stepLightbox(delta: number) {
  if (lightboxIndex.value === null || !gallery.value.length) return;
  const n = gallery.value.length;
  lightboxIndex.value = (lightboxIndex.value + delta + n) % n;
  lightboxZoom.value = false;
}
function onLightboxKey(e: KeyboardEvent) {
  if (lightboxIndex.value === null) return;
  if (e.key === 'Escape') closeLightbox();
  else if (e.key === 'ArrowRight') stepLightbox(1);
  else if (e.key === 'ArrowLeft') stepLightbox(-1);
}

watch(galleryOpen, (open) => {
  if (!import.meta.client) return;
  document.body.style.overflow = open ? 'hidden' : '';
  if (open) window.addEventListener('keydown', onLightboxKey);
  else window.removeEventListener('keydown', onLightboxKey);
});
onBeforeUnmount(() => {
  if (!import.meta.client) return;
  document.body.style.overflow = '';
  window.removeEventListener('keydown', onLightboxKey);
});

// Clamp description : on ne replie (et n'affiche le bouton) que si le contenu
// depasse reellement la hauteur clampee. Sinon le bloc s'affiche en entier,
// sans gros vide ni bouton inutile.
const descRef = ref<HTMLElement | null>(null);
const descOverflow = ref(false);
onMounted(() => {
  nextTick(() => {
    const el = descRef.value;
    if (el) descOverflow.value = el.scrollHeight > el.clientHeight + 4;
  });
});

// ============== Donnees derivees ==============
const v = computed(() => villa.value as Villa);
const gallery = computed(() => v.value.gallery ?? []);
const heroSrc = computed(() => v.value.hero ?? gallery.value[0] ?? '');
const thumbs = computed(() => gallery.value.slice(0, 4));
const overviewPhotos = computed(() => gallery.value.slice(0, 5));

const specsLine = computed(() => {
  const parts: string[] = [];
  if (v.value.capacity != null) parts.push(t('villas.fiche.guests', { n: v.value.capacity }));
  if (v.value.bedrooms != null) parts.push(t('villas.fiche.bedrooms', { n: v.value.bedrooms }));
  if (v.value.bathrooms != null) parts.push(t('villas.fiche.bathrooms', { n: v.value.bathrooms }));
  if (v.value.surface != null) parts.push(`${v.value.surface} m²`);
  return parts.join(' · ');
});

const keyFeatures = computed(() => pickLocList(v.value.keyFeatures));
const amenities = computed(() => pickLocList(v.value.amenities));
const includedServices = computed(() => pickLocList(v.value.includedServices));
const aLaCarteServices = computed(() => pickLocList(v.value.aLaCarteServices));
const rooms = computed(() => v.value.rooms ?? []);
const pools = computed(() => v.value.pools ?? []);

// Equipements groupes par piece (localises), separes Exterieur / Interieur.
type NormArea = { id: string; name: string; inside: boolean; tags: string[]; items: { label: string; detail: string }[] };
const areasLocalized = computed<NormArea[]>(() =>
  (v.value.areasDetail ?? []).map((a) => ({
    id: a.identifier ?? '',
    name: (loc.value === 'fr' ? a.nameFr : a.nameEn) || a.nameEn || a.nameFr || '',
    inside: !!a.inside,
    tags: ((loc.value === 'fr' ? a.tagsFr : a.tagsEn) ?? []).map(cleanStr).filter(Boolean),
    items: (a.items ?? []).map((it) => ({
      label: cleanStr((loc.value === 'fr' ? it.labelFr : it.labelEn) || it.labelEn || it.labelFr || ''),
      detail: cleanStr((loc.value === 'fr' ? it.detailFr : it.detailEn) || ''),
    })).filter((it) => it.label),
  })),
);
const outsideAreas = computed(() => areasLocalized.value.filter((a) => !a.inside));
const insideAreas = computed(() => areasLocalized.value.filter((a) => a.inside));
const activeTab = ref<'exterior' | 'interior'>('exterior');
const shownAreas = computed(() => (activeTab.value === 'exterior' ? outsideAreas.value : insideAreas.value));
onMounted(() => { if (!outsideAreas.value.length && insideAreas.value.length) activeTab.value = 'interior'; });
const bodyBlocks = computed(() => pickBody(v.value.body));
const shortDesc = computed(() => pickLoc(v.value.shortDesc));
const surroundingDescription = computed(() => pickLoc(v.value.surroundingDescription));
const housekeepingFrequency = computed(() => pickLoc(v.value.housekeepingFrequency));
const hasDescription = computed(() => !!shortDesc.value || bodyBlocks.value.length > 0);

const goodToKnowLines = computed(() =>
  pickLoc(v.value.goodToKnow).split('\n').map((s) => s.trim()).filter(Boolean),
);

// Image ronde du bloc "Planifier un appel" : hero de la villa (toujours
// present), faute de portrait conseiller en V1 (pas de photoshoot).
const scheduleImg = computed(() => v.value.hero ?? (v.value.gallery ?? [])[0] ?? null);

const hasDistances = computed(() =>
  v.value.beachDistanceMin != null || v.value.downtownDistanceMin != null ||
  v.value.restaurantsDistanceMin != null || v.value.shopsDistanceMin != null,
);

// "A proximite" facon LC : label + duree (si connue) avec mode d'acces,
// sinon juste le mode (a pied / en voiture). Sur 2 colonnes.
const NEARBY_LABELS: Record<string, string> = {
  beach: 'villas.fiche.nearbyBeach',
  downtown: 'villas.fiche.nearbyDowntown',
  golf: 'villas.fiche.nearbyGolf',
  restaurants: 'villas.fiche.nearbyRestaurants',
  shops: 'villas.fiche.nearbyShops',
};
const nearbyItems = computed(() => {
  return (v.value.nearby ?? [])
    .filter((n) => NEARBY_LABELS[n.category])
    .map((n) => {
      const label = t(NEARBY_LABELS[n.category] as string);
      let detail = '';
      if (n.min != null && n.mode === 'foot') detail = t('villas.fiche.minOnFoot', { n: n.min });
      else if (n.min != null) detail = t('villas.fiche.minByCar', { n: n.min });
      else if (n.mode === 'foot') detail = t('villas.fiche.onFoot');
      else if (n.mode === 'car') detail = t('villas.fiche.byCar');
      return { label, detail };
    });
});

const settingLabel = computed(() => {
  const map: Record<string, string> = {
    'out-of-town': t('villas.fiche.settingOutOfTown'),
    'beachfront': t('villas.fiche.settingBeachfront'),
    'in-city': t('villas.fiche.settingInCity'),
    'countryside': t('villas.fiche.settingCountryside'),
  };
  return v.value.setting ? (map[v.value.setting] ?? '') : '';
});

// Mini-carte "Les alentours". Zone approximative (cercle), jamais le
// point exact : discretion absolue sur l'adresse (CLAUDE.md sec. 5).
const { enabled: mapsEnabled, load: loadMaps } = useGoogleMaps();
const hasGeo = computed(() => v.value.gpsLat != null && v.value.gpsLng != null);
const surroundMapRef = ref<HTMLElement | null>(null);
let surroundMap: any = null;
async function initSurroundMap() {
  if (!mapsEnabled || !hasGeo.value || !surroundMapRef.value || surroundMap) return;
  const center = { lat: v.value.gpsLat as number, lng: v.value.gpsLng as number };
  try {
    const g = await loadMaps();
    if (!g?.maps) return;
    surroundMap = new g.maps.Map(surroundMapRef.value, {
      center, zoom: 13,
      mapTypeControl: false, streetViewControl: false,
      fullscreenControl: false, zoomControl: false,
      gestureHandling: 'none', keyboardShortcuts: false,
      clickableIcons: false,
    });
    new g.maps.Circle({
      map: surroundMap, center, radius: 850,
      strokeColor: '#1a1a1a', strokeOpacity: 0.25, strokeWeight: 1,
      fillColor: '#1a1a1a', fillOpacity: 0.08,
    });
    // Marqueur maison au centre du cercle (zone approximative).
    const houseSvg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">' +
      '<circle cx="20" cy="20" r="14" fill="#1a1a1a"/>' +
      '<path d="M12.5 19.8 L20 13 L27.5 19.8" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M14.6 19 V27 H25.4 V19" fill="none" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/>' +
      '<path d="M18 27 V22.6 H22 V27" fill="none" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/>' +
      '</svg>';
    new g.maps.Marker({
      map: surroundMap, position: center, clickable: false,
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(houseSvg),
        scaledSize: new g.maps.Size(40, 40),
        anchor: new g.maps.Point(20, 20),
      },
    });
  } catch (e) { void e; }
}
onMounted(initSurroundMap);
onBeforeUnmount(() => { surroundMap = null; });

function roomPills(r: Room): string[] {
  const out: string[] = [];
  if (r.tv) out.push(t('villas.fiche.roomTv'));
  if (r.ac) out.push(t('villas.fiche.roomAc'));
  if (r.terrace) out.push(t('villas.fiche.roomTerrace'));
  if (r.seaView) out.push(t('villas.fiche.roomSeaView'));
  if (r.safe) out.push(t('villas.fiche.roomSafe'));
  if (r.ensuiteBathroom) out.push(t('villas.fiche.roomEnsuite'));
  return out;
}
function poolLine(p: Pool): string {
  const parts: string[] = [];
  if (p.name) parts.push(p.name);
  if (p.heated) parts.push(t('villas.fiche.poolHeated'));
  if (p.indoor) parts.push(t('villas.fiche.poolIndoor'));
  if (p.lengthM != null && p.widthM != null) parts.push(`${p.lengthM}m x ${p.widthM}m`);
  if (p.sunbeds != null) parts.push(t('villas.fiche.poolSunbeds', { n: p.sunbeds }));
  return parts.join(' · ');
}


// Mapping texte -> icone SVG (paths inline). Fallback diamant sparkle.
type IconDef = { paths?: string[]; circles?: { cx: number; cy: number; r: number }[] };
const FEATURE_ICONS = {
  pool: { paths: ['M3 17c1.5 1 3 1 4.5 0s3-1 4.5 0 3 1 4.5 0 3-1 4.5 0', 'M3 21c1.5 1 3 1 4.5 0s3-1 4.5 0 3 1 4.5 0 3-1 4.5 0'], circles: [{ cx: 16, cy: 8, r: 2 }] },
  seaview: { paths: ['M4 16h24M4 16c2-4 6-4 8 0M16 16c2-4 6-4 8 0', 'M6 9l3-3 3 3'] },
  ac: { paths: ['M16 4v24M6 10l20 12M26 10L6 22M16 4l-3 3M16 4l3 3M6 10l.5 4M6 10l4-.5M26 22l-.5-4M26 22l-4 .5'] },
  flame: { paths: ['M16 4c4 5 6 8 6 12a6 6 0 11-12 0c0-2 1-4 2-5 1 2 2 2 3 1 0-3-1-5 1-8z'] },
  elevator: { paths: ['M8 5h16v22H8zM16 9l-3 4h6zM16 23l-3-4h6'] },
  spa: { paths: ['M16 18c-4 0-7-3-7-7 4 0 7 3 7 7zM16 18c4 0 7-3 7-7-4 0-7 3-7 7zM16 18v8'] },
  jacuzzi: { circles: [{ cx: 11, cy: 12, r: 1.6 }, { cx: 16, cy: 9, r: 1.6 }, { cx: 21, cy: 12, r: 1.6 }], paths: ['M6 18h20v4a4 4 0 01-4 4H10a4 4 0 01-4-4z'] },
  fitness: { paths: ['M6 12v8M10 9v14M22 9v14M26 12v8M10 16h12'] },
  golf: { paths: ['M14 26V6l10 4-10 4', 'M14 26h6'] },
  garden: { paths: ['M16 28c0-8 4-14 10-16-1 9-5 14-10 16zM16 28c0-6-3-10-8-12 1 7 4 11 8 12'] },
  shield: { paths: ['M16 4l10 4v8c0 6-4 10-10 12C10 26 6 22 6 16V8z', 'M12 16l3 3 6-6'] },
  sparkle: { paths: ['M16 4l3 9 9 3-9 3-3 9-3-9-9-3 9-3z'] },
} satisfies Record<string, IconDef>;
function featureIcon(label: string): IconDef {
  const s = (label || '').toLowerCase();
  if (s.includes('piscine') || s.includes('pool')) return FEATURE_ICONS.pool;
  if (s.includes('vue mer') || s.includes('sea view') || s.includes('panoram')) return FEATURE_ICONS.seaview;
  if (s.includes('clim') || s.includes('air condition')) return FEATURE_ICONS.ac;
  if (s.includes('barbecue') || s.includes('plancha') || s.includes('grill') || s.includes('bbq')) return FEATURE_ICONS.flame;
  if (s.includes('ascenseur') || s.includes('elevator') || s.includes('lift')) return FEATURE_ICONS.elevator;
  if (s.includes('sauna') || s.includes('hammam') || s.includes('spa')) return FEATURE_ICONS.spa;
  if (s.includes('jacuzzi') || s.includes('hot tub')) return FEATURE_ICONS.jacuzzi;
  if (s.includes('sport') || s.includes('fitness') || s.includes('gym')) return FEATURE_ICONS.fitness;
  if (s.includes('golf')) return FEATURE_ICONS.golf;
  if (s.includes('jardin') || s.includes('garden')) return FEATURE_ICONS.garden;
  if (s.includes('sécur') || s.includes('secur') || s.includes('gardien') || s.includes('guard')) return FEATURE_ICONS.shield;
  return FEATURE_ICONS.sparkle;
}

const faqs = computed(() => [
  { q: t('villas.fiche.bookingQ1'), a: t('villas.fiche.bookingA1') },
  { q: t('villas.fiche.bookingQ2'), a: t('villas.fiche.bookingA2') },
  { q: t('villas.fiche.bookingQ3'), a: t('villas.fiche.bookingA3') },
  { q: t('villas.fiche.bookingQ4'), a: t('villas.fiche.bookingA4') },
]);

// ============== Villas similaires (BLOC 15) ==============
// Meme source que villas/all (composable useVillas) + meme carte (VillaCard)
// pour un rendu strictement identique. 3 villas : meme ville d'abord,
// completees par d'autres si besoin.
const { villas: allVillas } = useVillas();
const similar = computed(() => {
  const all = allVillas.value.filter((x) => x._id !== v.value._id);
  const sameCity = all.filter((x) => x.city === v.value.city);
  const others = all.filter((x) => x.city !== v.value.city);
  return [...sameCity, ...others].slice(0, 3);
});

// ============== Body editorial SEO (BLOC 16) ==============
const editorialBody = computed(() => {
  const isFr = locale.value === 'fr';
  const name = v.value.name;
  const cl = cityLabel(v.value.city);
  const cap = v.value.capacity;
  const surf = v.value.surface;
  if (isFr) {
    const bits = [`${name} se situe à ${cl}, sur la Côte d'Azur.`];
    if (cap != null) bits.push(`La villa accueille jusqu'à ${cap} voyageurs`);
    if (surf != null) bits.push(`${cap != null ? ' sur' : 'Elle offre'} ${surf} m² habitables.`);
    else if (cap != null) bits.push('.');
    bits.push(`L'équipe Misana coordonne le séjour : ménage, conciergerie pendant le séjour, transfert depuis l'aéroport. Faites une demande pour adapter ${name} à vos dates et à votre groupe.`);
    return bits.join(' ').replace(' .', '.').replace('  ', ' ');
  }
  const bits = [`${name} is located in ${cl}, on the French Riviera.`];
  if (cap != null) bits.push(`The villa welcomes up to ${cap} guests`);
  if (surf != null) bits.push(`${cap != null ? ' across' : 'It offers'} ${surf} sqm of living space.`);
  else if (cap != null) bits.push('.');
  bits.push(`The Misana team coordinates the stay: housekeeping, concierge during the stay, airport transfer. Make a request to adapt ${name} to your dates and your group.`);
  return bits.join(' ').replace(' .', '.').replace('  ', ' ');
});

// ============== Fil d'Ariane (barre retour sticky) ==============
const breadcrumb = computed(() => [
  { label: 'Misana', to: '/' },
  { label: t('villas.allTitle'), to: { name: 'villas-all' } },
  { label: v.value.name },
]);

// ============== SEO ==============
// Image mise en avant = premiere image de la villa (hero, sinon 1re galerie).
const seoImage = () => {
  const vv = villa.value;
  if (!vv) return '';
  return vv.hero ?? (vv.gallery ?? [])[0] ?? '';
};
// Meta SEO calquees sur cars/yacht : titre + description factuelle (specs +
// prix + ville), og + twitter. Description ~150-160 caracteres, voix Misana.
useSeoMeta({
  title: () => {
    const vv = villa.value;
    if (!vv) return 'Villa · Misana';
    const cl = cityLabel(vv.city);
    return loc.value === 'fr'
      ? `${vv.name}, ${cl} | Location villa de luxe`
      : `${vv.name}, ${cl} | Luxury villa rental`;
  },
  description: () => {
    const vv = villa.value;
    if (!vv) return '';
    const isFr = loc.value === 'fr';
    const cl = cityLabel(vv.city);
    const parts: string[] = [isFr ? `${vv.name} à ${cl}.` : `${vv.name} in ${cl}.`];
    const specs: string[] = [];
    if (vv.bedrooms != null) specs.push(isFr ? `${vv.bedrooms} chambres` : `${vv.bedrooms} bedrooms`);
    if (vv.capacity != null) specs.push(isFr ? `${vv.capacity} personnes` : `${vv.capacity} guests`);
    if (vv.surface != null) specs.push(isFr ? `${vv.surface} m²` : `${vv.surface} sqm`);
    if (specs.length) parts.push(specs.join(', ') + '.');
    if (vv.displayPrices && vv.pricePerWeekFrom != null) {
      parts.push(isFr
        ? `À partir de ${fmtPrice(vv.pricePerWeekFrom)} par semaine.`
        : `From ${fmtPrice(vv.pricePerWeekFrom)} per week.`);
    }
    parts.push(isFr ? "Conciergerie sur la Côte d'Azur." : 'Concierge service on the French Riviera.');
    return parts.join(' ');
  },
  ogTitle: () => {
    const vv = villa.value;
    return vv ? `${vv.name}, ${cityLabel(vv.city)} · Misana` : 'Villa · Misana';
  },
  ogImage: seoImage,
  twitterImage: seoImage,
});
</script>

<template>
  <main v-if="villa" class="min-h-screen bg-misana-paper">
    <!-- ===================== Barre retour ===================== -->
    <section class="border-b border-misana-line">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-3 flex items-center justify-between gap-4 flex-wrap">
        <NuxtLink
          :to="localePath({ name: 'villas-all' })"
          class="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-misana-muted hover:text-misana-ink transition group"
        >
          <span class="inline-flex items-center justify-center w-4 h-4 transition-transform duration-500 group-hover:-translate-x-1">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="block w-full h-full">
              <path d="M17 12H7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
              <path d="M10.5 8.5L7 12L10.5 15.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
          <span>{{ t('villas.fiche.backToAll') }}</span>
        </NuxtLink>
        <Breadcrumb :items="breadcrumb" class="hidden sm:block" />
      </div>
    </section>

    <!-- ===================== BLOC 1 : Galerie ===================== -->
    <section class="max-w-[1600px] mx-auto px-4 sm:px-12 pt-6 sm:pt-10">
      <div class="gallery-grid">
        <button type="button" class="gallery-hero" :aria-label="t('villas.fiche.viewAllPhotos', { n: gallery.length })" @click="openLightbox(0)">
          <img v-if="heroSrc" :src="heroSrc" :alt="v.name" class="gallery-img" />
          <div v-else class="gallery-img gallery-placeholder"></div>
          <span class="gallery-thumb-overlay" aria-hidden="true"></span>
        </button>
        <button
          v-for="(src, i) in thumbs"
          :key="i"
          type="button"
          class="gallery-thumb"
          @click="openLightbox(i)"
        >
          <img :src="src" :alt="`${v.name} ${i + 2}`" loading="lazy" class="gallery-img" />
          <span class="gallery-thumb-overlay" aria-hidden="true"></span>
        </button>
        <button
          v-if="gallery.length"
          type="button"
          class="gallery-all-btn"
          @click="openLightbox(0)"
        >
          {{ t('villas.fiche.viewAllPhotos', { n: gallery.length }) }}
        </button>
      </div>
    </section>

    <!-- ===================== BLOC 2 : Header + sidebar ===================== -->
    <section class="max-w-[1600px] mx-auto px-6 sm:px-12 py-10 sm:py-16">
      <div class="grid lg:grid-cols-12 gap-10">
        <div class="lg:col-span-8">
          <NuxtLink
            :to="localePath({ name: 'villas-all', query: { city: v.city } })"
            class="text-xs uppercase tracking-widest text-misana-muted hover:text-misana-ink transition"
          >
            {{ t('villas.fiche.breadcrumbCoast') }} · {{ cityLabel(v.city) }}
          </NuxtLink>
          <h1 class="font-display text-3xl sm:text-5xl mt-3">{{ v.name }}</h1>
          <div class="h-px w-12 bg-misana-line my-5"></div>
          <p v-if="specsLine" class="text-sm text-misana-muted">{{ specsLine }}</p>

          <!-- ===================== BLOC 3 : Description ===================== -->
          <div v-if="hasDescription" class="mt-10 max-w-[68ch]">
            <div ref="descRef" class="desc-clamp" :class="{ 'desc-open': descOpen }">
              <p v-if="shortDesc" class="italic text-lg text-misana-muted leading-relaxed mb-6">{{ shortDesc }}</p>
              <PortableText v-if="bodyBlocks.length" :blocks="bodyBlocks" />
            </div>
            <button
              v-if="descOverflow"
              type="button"
              class="link-toggle"
              @click="descOpen = !descOpen"
            >{{ descOpen ? t('villas.fiche.readLess') : t('villas.fiche.readMore') }}</button>
          </div>

          <!-- ===================== BLOC 4 : Les incontournables ===================== -->
          <section v-if="keyFeatures.length" class="section-block">
            <h2 class="section-title">{{ t('villas.fiche.keyFeaturesHeading') }}</h2>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div v-for="(feat, i) in keyFeatures" :key="i" class="flex flex-col items-center gap-2 text-center">
                <svg viewBox="0 0 32 32" fill="none" class="feature-icon" aria-hidden="true">
                  <path
                    v-for="(d, pi) in (featureIcon(feat).paths || [])"
                    :key="`p${pi}`"
                    :d="d"
                    stroke="currentColor"
                    stroke-width="1.4"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <circle
                    v-for="(c, ci) in (featureIcon(feat).circles || [])"
                    :key="`c${ci}`"
                    :cx="c.cx" :cy="c.cy" :r="c.r"
                    stroke="currentColor"
                    stroke-width="1.4"
                  />
                </svg>
                <span class="text-xs uppercase tracking-widest text-misana-muted">{{ feat }}</span>
              </div>
            </div>
          </section>

          <!-- ===================== BLOC 5-7 : Accordeon (chambres, equipements, services) ===================== -->
          <div
            v-if="rooms.length || areasLocalized.length || amenities.length || pools.length || includedServices.length || aLaCarteServices.length"
            class="villa-accordion"
          >
            <!-- Chambres -->
            <VillaCollapse v-if="rooms.length" :title="t('villas.fiche.bedroomsHeading')">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div v-for="(r, i) in rooms" :key="i" class="border border-misana-line p-4 rounded-sm">
                  <p class="font-medium text-misana-ink">{{ pickLoc(r.name) || t('villas.fiche.roomDefault', { n: i + 1 }) }}</p>
                  <p v-if="pickLoc(r.bedType)" class="text-sm text-misana-muted">{{ pickLoc(r.bedType) }}</p>
                  <div v-if="roomPills(r).length" class="flex flex-wrap gap-2 mt-3">
                    <span v-for="(pill, pi) in roomPills(r)" :key="pi" class="text-xs border border-misana-line px-2 py-1">{{ pill }}</span>
                  </div>
                </div>
              </div>
            </VillaCollapse>

            <!-- Equipements (groupes par piece) -->
            <VillaCollapse v-if="areasLocalized.length || amenities.length || pools.length" :title="t('villas.fiche.amenitiesHeading')">
              <template v-if="areasLocalized.length">
                <div class="amenity-tabs">
                  <button
                    v-if="outsideAreas.length"
                    type="button"
                    class="amenity-tab"
                    :class="{ 'amenity-tab-active': activeTab === 'exterior' }"
                    @click="activeTab = 'exterior'"
                  >{{ t('villas.fiche.tabExterior') }}</button>
                  <button
                    v-if="insideAreas.length"
                    type="button"
                    class="amenity-tab"
                    :class="{ 'amenity-tab-active': activeTab === 'interior' }"
                    @click="activeTab = 'interior'"
                  >{{ t('villas.fiche.tabInterior') }}</button>
                </div>

                <div class="area-cols">
                  <div v-for="area in shownAreas" :key="area.id + area.name" class="area-group">
                    <p class="area-name">{{ area.name }}</p>
                    <p v-if="area.tags.length" class="area-tags-line">{{ area.tags.join(' · ') }}</p>
                    <ul v-if="area.items.length" class="area-items">
                      <li v-for="(it, ii) in area.items" :key="ii" class="area-item">
                        <span class="area-item-label">{{ it.label }}</span>
                        <span v-if="it.detail" class="area-item-detail">{{ it.detail }}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </template>

              <!-- Fallback : liste a plat si pas de detail par piece -->
              <ul v-else-if="amenities.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-2 gap-x-8">
                <li v-for="(a, i) in amenities" :key="i" class="text-sm text-misana-muted before-dot">{{ a }}</li>
              </ul>

              <!-- Piscines : seulement si pas deja representees dans les pieces (evite le doublon) -->
              <div v-if="pools.length && !areasLocalized.length" class="area-pools">
                <p class="text-xs uppercase tracking-widest text-misana-muted mb-3">{{ t('villas.fiche.poolsHeading') }}</p>
                <div v-for="(p, i) in pools" :key="i" class="flex gap-4 text-sm text-misana-muted">{{ poolLine(p) }}</div>
              </div>
            </VillaCollapse>

            <!-- Services inclus -->
            <VillaCollapse v-if="includedServices.length || housekeepingFrequency" :title="t('villas.fiche.includedServicesHeading')">
              <ul class="flex flex-col gap-2">
                <li v-for="(s, i) in includedServices" :key="i" class="flex gap-2 text-sm">
                  <svg viewBox="0 0 14 14" fill="none" class="w-3.5 h-3.5 mt-0.5 shrink-0 text-misana-ink" aria-hidden="true">
                    <path d="M2 7.5L5.5 11L12 3.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                  <span>{{ s }}</span>
                </li>
              </ul>
              <span v-if="housekeepingFrequency" class="inline-block border border-misana-line text-xs px-2 py-1 mt-3">{{ housekeepingFrequency }}</span>
            </VillaCollapse>

            <!-- Services a la carte -->
            <VillaCollapse v-if="aLaCarteServices.length" :title="t('villas.fiche.aLaCarteHeading')">
              <ul class="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-8">
                <li v-for="(s, i) in aLaCarteServices" :key="i" class="text-sm text-misana-muted before-dot">{{ s }}</li>
              </ul>
            </VillaCollapse>
          </div>

          <!-- ===================== BLOC 8 : Disponibilites (placeholder) ===================== -->
          <section class="section-block">
            <h2 class="section-title">{{ t('villas.fiche.availabilityHeading') }}</h2>
            <div class="border border-misana-line p-8 bg-misana-stone text-center flex flex-col items-center gap-4">
              <svg viewBox="0 0 32 32" fill="none" class="w-8 h-8 text-misana-muted" aria-hidden="true">
                <rect x="5" y="7" width="22" height="20" rx="2" stroke="currentColor" stroke-width="1.4" />
                <path d="M5 13h22M11 4v5M21 4v5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
              </svg>
              <p class="text-sm text-misana-muted">{{ t('villas.fiche.availabilitySoon') }}</p>
              <p class="text-sm text-misana-muted max-w-md">{{ t('villas.fiche.availabilityLead', { name: v.name }) }}</p>
              <NuxtLink :to="localePath({ path: '/request', query: { service: 'villa', villa: slug, city: v.city } })" class="btn-outline">{{ t('villas.fiche.ctaRequest') }}</NuxtLink>
            </div>
            <!-- TODO Phase dispo : remplacer par appel
                 GET /fr/api/v1/house_periods/{lcHouseId}?currency=EUR&start_at=today&end_at=today+365
                 fetch onMounted cote client. -->
          </section>

          <!-- ===================== BLOC 9 : Apercu propriete ===================== -->
          <section v-if="gallery.length > 4" class="section-block">
            <h2 class="section-title">{{ t('villas.fiche.overviewHeading') }}</h2>
            <div class="overview-grid">
              <button
                v-for="(src, i) in overviewPhotos"
                :key="i"
                type="button"
                class="overview-cell"
                :class="{ 'overview-cell-lead': i === 0 }"
                @click="openLightbox(i)"
              >
                <img :src="src" :alt="`${v.name} ${i + 1}`" loading="lazy" class="overview-img" />
                <span class="overview-overlay" aria-hidden="true"></span>
              </button>
            </div>
            <button type="button" class="link-toggle mt-4" @click="openLightbox(0)">{{ t('villas.fiche.viewAllPhotos', { n: gallery.length }) }}</button>
          </section>

          <!-- ===================== BLOC 10 : Bon a savoir ===================== -->
          <section v-if="goodToKnowLines.length" class="section-block">
            <h2 class="section-title">{{ t('villas.fiche.goodToKnowHeading') }}</h2>
            <ul class="flex flex-col gap-2">
              <li v-for="(line, i) in goodToKnowLines" :key="i" class="flex gap-2 text-sm text-misana-muted before-dot">{{ line }}</li>
            </ul>
          </section>

          <!-- ===================== BLOC 10b : Planifier un appel ===================== -->
          <section class="section-block">
            <div class="schedule-call">
              <div class="schedule-call-body">
                <p class="schedule-call-title">{{ t('villas.fiche.questionsTitle', { name: v.name }) }}</p>
                <p class="schedule-call-lead">{{ t('villas.fiche.questionsLead') }}</p>
                <NuxtLink :to="localePath('/contact')" class="btn-ink schedule-call-cta">{{ t('villas.fiche.ctaScheduleCall') }}</NuxtLink>
              </div>
              <div v-if="scheduleImg" class="schedule-call-media">
                <img :src="scheduleImg" :alt="t('villas.fiche.ctaScheduleCall')" loading="lazy" />
              </div>
            </div>
          </section>

          <!-- ===================== BLOC 12 : Les alentours ===================== -->
          <section v-if="settingLabel || hasDistances || surroundingDescription || (mapsEnabled && hasGeo)" class="section-block">
            <h2 class="section-title">{{ t('villas.fiche.surroundingsHeading') }}</h2>
            <p class="text-xs uppercase tracking-widest text-misana-muted mb-4">{{ cityLabel(v.city) }}, {{ t('villas.fiche.breadcrumbCoast') }}</p>

            <div v-if="mapsEnabled && hasGeo" ref="surroundMapRef" class="surround-map" aria-hidden="true"></div>

            <div v-if="settingLabel || nearbyItems.length" class="surround-stats">
              <div v-if="settingLabel" class="stat">
                <p class="stat-label">{{ t('villas.fiche.environment') }}</p>
                <p class="stat-value">{{ settingLabel }}</p>
              </div>
              <div v-for="(n, i) in nearbyItems" :key="i" class="stat">
                <p class="stat-label">{{ n.label }}</p>
                <p class="stat-value">{{ n.detail }}</p>
              </div>
            </div>

            <p v-if="surroundingDescription" class="surround-desc">{{ surroundingDescription }}</p>
          </section>

          <!-- ===================== BLOC 13 : Conditions de reservation ===================== -->
          <section class="section-block">
            <h2 class="section-title">{{ t('villas.fiche.bookingConditionsHeading') }}</h2>
            <div class="border-t border-misana-line">
              <div v-for="(faq, i) in faqs" :key="i" class="border-b border-misana-line">
                <button
                  type="button"
                  class="faq-summary"
                  :aria-expanded="openFaq === i"
                  @click="openFaq = openFaq === i ? null : i"
                >
                  <span>{{ faq.q }}</span>
                  <svg viewBox="0 0 16 16" fill="none" class="faq-chevron" :class="{ 'faq-chevron-open': openFaq === i }" aria-hidden="true">
                    <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </button>
                <div class="faq-body" :class="{ 'faq-body-open': openFaq === i }">
                  <p class="faq-answer">{{ faq.a }}</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- ===================== Sidebar sticky ===================== -->
        <aside class="lg:col-span-4 lg:sticky lg:top-24 lg:self-start">
          <div class="villa-booking-card">
            <div v-if="v.displayPrices && v.pricePerWeekFrom != null" class="villa-price-block">
              <p class="villa-price-eyebrow">{{ t('villas.fiche.fromLabel') }}</p>
              <p class="villa-price tabular-nums">{{ fmtPrice(v.pricePerWeekFrom) }}</p>
              <p class="villa-price-period">{{ t('villas.fiche.perWeek') }}</p>
            </div>
            <p v-else class="villa-price">{{ t('villas.fiche.priceOnRequest') }}</p>

            <div class="villa-card-divider"></div>

            <div class="villa-card-actions">
              <NuxtLink :to="localePath({ path: '/request', query: { service: 'villa', villa: slug, city: v.city } })" class="btn-ink text-center">{{ t('villas.fiche.ctaRequest') }}</NuxtLink>
              <a href="tel:+33634123393" class="btn-outline text-center">+33 6 34 12 33 93</a>
            </div>

            <p class="villa-card-note">{{ t('villas.fiche.bookingNote') }}</p>
          </div>
        </aside>
      </div>
    </section>

    <!-- ===================== BLOC 15 : Villas similaires ===================== -->
    <section v-if="similar.length" class="max-w-[1600px] mx-auto px-6 sm:px-12 py-16">
      <h2 class="font-display text-xl mb-6">{{ t('villas.fiche.similarHeading') }}</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <VillaCard v-for="s in similar" :key="s._id" :villa="s" />
      </div>
      <div class="mt-10 text-center">
        <NuxtLink :to="localePath({ name: 'villas-all' })" class="similar-back-cta group">
          <span>{{ t('villas.fiche.similarBackCta') }}</span>
          <span class="inline-flex items-center justify-center w-4 h-4 transition-transform duration-500 group-hover:translate-x-1">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="block w-full h-full">
              <path d="M7 12H17" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
              <path d="M13.5 8.5L17 12L13.5 15.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
        </NuxtLink>
      </div>
    </section>

    <!-- ===================== BLOC 16 : Body editorial SEO ===================== -->
    <section class="bg-misana-paper border-t border-misana-line">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-16 sm:py-20">
        <p class="text-misana-muted leading-relaxed max-w-3xl">{{ editorialBody }}</p>
      </div>
    </section>

    <!-- ===================== Visionneuse plein ecran ===================== -->
    <Transition name="gallery-modal">
      <div v-if="lightboxIndex !== null" class="lightbox" role="dialog" aria-modal="true" @click.self="closeLightbox">
        <button type="button" class="lightbox-close" :aria-label="t('villas.fiche.closeGallery')" @click="closeLightbox">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="w-5 h-5">
            <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
          </svg>
        </button>

        <span class="lightbox-counter">{{ (lightboxIndex ?? 0) + 1 }} / {{ gallery.length }}</span>

        <button v-if="gallery.length > 1" type="button" class="lightbox-nav lightbox-prev" :aria-label="t('villas.prevPhoto')" @click.stop="stepLightbox(-1)">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="w-6 h-6">
            <path d="M15 5L8 12L15 19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>

        <div class="lightbox-stage" @click.self="closeLightbox">
          <img
            :src="gallery[lightboxIndex ?? 0]"
            :alt="`${v.name} ${(lightboxIndex ?? 0) + 1}`"
            class="lightbox-img"
            :class="{ 'lightbox-img-zoom': lightboxZoom }"
            @click.stop="lightboxZoom = !lightboxZoom"
          />
        </div>

        <button v-if="gallery.length > 1" type="button" class="lightbox-nav lightbox-next" :aria-label="t('villas.nextPhoto')" @click.stop="stepLightbox(1)">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="w-6 h-6">
            <path d="M9 5L16 12L9 19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </div>
    </Transition>
  </main>
</template>

<style scoped>
/* ============== BLOC 1 : galerie ============== */
.gallery-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  position: relative;
}
@media (min-width: 768px) {
  .gallery-grid {
    grid-template-columns: 2fr 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    height: clamp(360px, 46vh, 520px);
    gap: 10px;
  }
  .gallery-hero { grid-column: 1; grid-row: 1 / span 2; aspect-ratio: auto; }
  .gallery-thumb { aspect-ratio: auto; }
}
.gallery-hero {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: 4px;
  border: 0;
  padding: 0;
  margin: 0;
  display: block;
  cursor: pointer;
  background: var(--color-misana-stone);
}
/* Mobile : le hero seul prend un ratio 4/3 (pas de grille split). */
@media (max-width: 767px) {
  .gallery-hero { aspect-ratio: 4 / 3; }
}
.gallery-hero:hover .gallery-thumb-overlay { opacity: 0.15; }
.gallery-thumb {
  display: none;
  position: relative;
  overflow: hidden;
  border-radius: 4px;
  cursor: pointer;
  border: 0;
  padding: 0;
  background: var(--color-misana-stone);
}
@media (min-width: 768px) { .gallery-thumb { display: block; } }
.gallery-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 1.1s cubic-bezier(0.16, 1, 0.3, 1);
}
.gallery-hero:hover .gallery-img,
.gallery-thumb:hover .gallery-img { transform: scale(1.04); }
.gallery-placeholder { background: var(--color-misana-stone); }
.gallery-thumb-overlay {
  position: absolute;
  inset: 0;
  background: var(--color-misana-ink);
  opacity: 0;
  transition: opacity 0.4s ease;
}
.gallery-thumb:hover .gallery-thumb-overlay { opacity: 0.3; }
.gallery-all-btn {
  position: absolute;
  bottom: 16px;
  left: 16px;
  background: var(--color-misana-paper);
  color: var(--color-misana-ink);
  border: 1px solid var(--color-misana-line);
  border-radius: 4px;
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 10px 16px;
  cursor: pointer;
  font-family: inherit;
  transition: border-color 0.3s ease;
}
.gallery-all-btn:hover { border-color: var(--color-misana-ink); background: var(--color-misana-ink); color: var(--color-misana-paper); }
@media (max-width: 767px) {
  .gallery-all-btn {
    position: static;
    width: 100%;
    margin-top: 8px;
    padding: 12px 16px;
  }
}

/* ============== Rythme editorial des sections ============== */
.section-block {
  border-top: 1px solid var(--color-misana-line);
  margin-top: 3rem;
  padding-top: 3rem;
}
@media (min-width: 768px) {
  .section-block { margin-top: 3.5rem; padding-top: 3.5rem; }
}
.section-title {
  font-family: var(--font-display, serif);
  font-size: 1.4rem;
  line-height: 1.2;
  margin: 0 0 1.5rem;
  color: var(--color-misana-ink);
}

/* ============== BLOC 3 : description clamp ============== */
.desc-clamp {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}
.desc-clamp.desc-open {
  display: block;
  -webkit-line-clamp: unset;
}
.link-toggle {
  margin-top: 0.75rem;
  font-size: 0.8rem;
  text-decoration: underline;
  text-underline-offset: 4px;
  color: var(--color-misana-ink);
  background: transparent;
  border: 0;
  cursor: pointer;
  font-family: inherit;
}
.link-toggle:hover { color: var(--color-misana-muted); }
.pt-link { text-decoration: underline; text-underline-offset: 2px; }
.pt-quote {
  border-left: 2px solid var(--color-misana-line);
  padding-left: 1rem;
  font-style: italic;
  color: var(--color-misana-muted);
  margin-bottom: 1rem;
}

/* ============== Icones features ============== */
.feature-icon { width: 32px; height: 32px; color: var(--color-misana-ink); }

/* ============== Listes a puce discrete ============== */
.before-dot::before {
  content: '·';
  margin-right: 0.5rem;
  color: var(--color-misana-muted);
}

/* ============== BLOC 5-7 : accordeon ============== */
.villa-accordion {
  margin-top: 3rem;
}

/* ============== BLOC 6 : onglets equipements ============== */
.amenity-tabs {
  display: inline-flex;
  gap: 1.5rem;
  border-bottom: 1px solid var(--color-misana-line);
}
.amenity-tab {
  padding-bottom: 0.5rem;
  font-size: 0.8rem;
  color: var(--color-misana-muted);
  background: transparent;
  border: 0;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  cursor: pointer;
  font-family: inherit;
  transition: color 0.2s ease, border-color 0.2s ease;
}
.amenity-tab-active { color: var(--color-misana-ink); border-bottom-color: var(--color-misana-ink); }

/* Equipements groupes par piece : typographie pure, 2 colonnes, sans
   boites ni puces. Leger et lisible meme avec beaucoup de pieces. */
.area-cols {
  columns: 1;
  column-gap: 3.5rem;
  margin-top: 1.75rem;
}
@media (min-width: 768px) { .area-cols { columns: 2; } }
.area-group { break-inside: avoid; padding-bottom: 1.5rem; }
.area-name {
  font-size: 0.9rem;
  color: var(--color-misana-ink);
  font-weight: 500;
  margin: 0 0 0.3rem;
}
.area-tags-line {
  font-size: 0.78rem;
  color: var(--color-misana-muted);
  margin: 0 0 0.5rem;
}
.area-items { display: flex; flex-direction: column; gap: 0.3rem; margin: 0; padding: 0; list-style: none; }
.area-item { display: flex; flex-wrap: wrap; align-items: baseline; gap: 0.45rem; }
.area-item-label { font-size: 0.85rem; color: var(--color-misana-muted); font-weight: 300; }
.area-item-detail { font-size: 0.78rem; color: var(--color-misana-muted); opacity: 0.72; }
.area-pools { margin-top: 2rem; padding-top: 1.75rem; border-top: 1px solid var(--color-misana-line); }

/* ============== BLOC 9 : overview ============== */
.overview-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.overview-cell {
  position: relative;
  overflow: hidden;
  border-radius: 4px;
  aspect-ratio: 1 / 1;
  border: 0;
  padding: 0;
  cursor: pointer;
  background: var(--color-misana-stone);
}
/* Desktop : meme mosaique que la galerie (1 grande + 4 vignettes 2x2). */
@media (min-width: 768px) {
  .overview-grid {
    grid-template-columns: 2fr 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    height: clamp(360px, 46vh, 520px);
    gap: 10px;
  }
  .overview-cell { aspect-ratio: auto; }
  .overview-cell-lead { grid-column: 1; grid-row: 1 / span 2; }
}
.overview-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.overview-cell:hover .overview-img { transform: scale(1.02); }
.overview-overlay {
  position: absolute;
  inset: 0;
  background: var(--color-misana-ink);
  opacity: 0;
  transition: opacity 0.6s ease;
}
.overview-cell:hover .overview-overlay { opacity: 0.2; }

/* ============== BLOC 13 : accordeon FAQ ============== */
.faq-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
  padding: 1.1rem 0;
  text-align: left;
  font-size: 0.95rem;
  color: var(--color-misana-ink);
  background: transparent;
  border: 0;
  cursor: pointer;
  font-family: inherit;
}
.faq-chevron {
  width: 16px;
  height: 16px;
  flex: 0 0 auto;
  color: var(--color-misana-muted);
  transition: transform 0.3s ease;
}
.faq-chevron-open { transform: rotate(180deg); }
.faq-body {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}
.faq-body-open { max-height: 500px; }
.faq-answer {
  padding-bottom: 1.1rem;
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--color-misana-muted);
  max-width: 52ch;
}

/* ============== CTA retour listing (villas similaires) ============== */
.similar-back-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.72rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-misana-muted);
  border-bottom: 1px solid var(--color-misana-line);
  padding-bottom: 4px;
  transition: color 0.3s ease, border-color 0.3s ease;
}
.similar-back-cta:hover { color: var(--color-misana-ink); border-color: var(--color-misana-ink); }

/* ============== Boutons ============== */
.btn-ink {
  width: 100%;
  padding: 14px 18px;
  background: var(--color-misana-ink);
  color: var(--color-misana-paper);
  border: 0;
  border-radius: 4px;
  font-size: 0.72rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  cursor: pointer;
  font-family: inherit;
  transition: opacity 0.3s ease;
}
.btn-ink:hover { opacity: 0.9; }
.btn-outline {
  display: inline-block;
  width: 100%;
  padding: 13px 18px;
  background: transparent;
  color: var(--color-misana-ink);
  border: 1px solid var(--color-misana-ink);
  border-radius: 4px;
  font-size: 0.72rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.3s ease, color 0.3s ease;
}
.btn-outline:hover { background: var(--color-misana-ink); color: var(--color-misana-paper); }

/* ============== Bloc planifier un appel ============== */
.schedule-call {
  background: var(--color-misana-stone);
  padding: 40px 24px;
  border-radius: 6px;
  display: flex;
  flex-direction: column-reverse;
  gap: 20px;
}
@media (min-width: 640px) {
  .schedule-call { flex-direction: row; align-items: center; gap: 28px; padding: 28px; }
}
.schedule-call-body { display: flex; flex-direction: column; gap: 16px; align-items: flex-start; flex: 1 1 auto; }
.schedule-call-title {
  font-size: 1.05rem;
  line-height: 1.3;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-misana-ink);
  margin: 0;
}
.schedule-call-lead {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--color-misana-ink);
  max-width: 56ch;
}
.schedule-call-cta { width: auto; }
.schedule-call-media { flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
.schedule-call-media img {
  width: 128px;
  height: 128px;
  border-radius: 9999px;
  object-fit: cover;
  display: block;
}

/* ============== Alentours : bande de stats + description ============== */
.surround-stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 2.25rem 2.5rem;
  margin-top: 2.25rem;
  padding-top: 2.25rem;
  border-top: 1px solid var(--color-misana-line);
}
@media (min-width: 640px) {
  .surround-stats { grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); }
}
.stat-label {
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--color-misana-muted);
  margin: 0 0 0.55rem;
}
.stat-value { font-size: 0.9rem; color: var(--color-misana-ink); margin: 0; line-height: 1.4; }
.surround-desc {
  font-size: 0.98rem;
  line-height: 1.9;
  color: var(--color-misana-ink);
  max-width: 70ch;
  margin: 3rem 0 0;
}

/* ============== Mini-carte alentours ============== */
.surround-map {
  width: 100%;
  height: 240px;
  border: 1px solid var(--color-misana-line);
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 24px;
  background: var(--color-misana-paper);
}

/* ============== Sidebar booking card ============== */
.villa-booking-card {
  border: 1px solid var(--color-misana-line);
  border-radius: 8px;
  padding: 30px 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  background: var(--color-misana-paper);
  text-align: center;
}
.villa-price-block { display: flex; flex-direction: column; align-items: center; gap: 10px; }
.villa-price-eyebrow {
  font-size: 0.68rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-misana-muted);
}
.villa-price-period {
  font-size: 0.7rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-misana-muted);
}
.villa-card-divider { height: 1px; width: 44px; background: var(--color-misana-line); }
.villa-card-actions { width: 100%; display: flex; flex-direction: column; gap: 14px; }
.villa-card-note {
  font-size: 0.78rem;
  line-height: 1.6;
  color: var(--color-misana-muted);
  max-width: 30ch;
  margin: 0;
}
@media (min-width: 1024px) {
  .villa-booking-card {
    box-shadow: 0 24px 50px -32px rgba(0, 0, 0, 0.22);
    justify-content: center;
    gap: 22px;
  }
}
.villa-price {
  font-family: var(--font-display, serif);
  font-size: 2.6rem;
  line-height: 1.05;
  letter-spacing: -0.01em;
  color: var(--color-misana-ink);
}

/* ============== Visionneuse plein ecran (lightbox) ============== */
.lightbox {
  position: fixed;
  inset: 0;
  z-index: 50;
  background: rgba(11, 11, 11, 0.96);
  display: flex;
  align-items: center;
  justify-content: center;
}
.lightbox-close {
  position: absolute;
  top: 18px;
  right: 18px;
  z-index: 60;
  width: 44px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--color-misana-paper);
  color: var(--color-misana-ink);
  border: 0;
  border-radius: 999px;
  cursor: pointer;
}
.lightbox-counter {
  position: absolute;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 60;
  color: var(--color-misana-paper);
  font-size: 0.78rem;
  letter-spacing: 0.16em;
  opacity: 0.8;
}
.lightbox-stage {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 72px 16px;
  overflow: auto;
}
.lightbox-img {
  max-width: 92vw;
  max-height: 86vh;
  object-fit: contain;
  border-radius: 2px;
  cursor: zoom-in;
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.lightbox-img-zoom {
  transform: scale(2);
  cursor: zoom-out;
  max-width: none;
  max-height: none;
}
.lightbox-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 60;
  width: 48px;
  height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.12);
  color: var(--color-misana-paper);
  border: 0;
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.25s ease;
}
.lightbox-nav:hover { background: rgba(255, 255, 255, 0.25); }
.lightbox-prev { left: 16px; }
.lightbox-next { right: 16px; }
@media (max-width: 767px) {
  .lightbox-nav { width: 40px; height: 40px; }
  .lightbox-prev { left: 8px; }
  .lightbox-next { right: 8px; }
}

.gallery-modal-enter-active,
.gallery-modal-leave-active { transition: opacity 0.25s ease; }
.gallery-modal-enter-from,
.gallery-modal-leave-to { opacity: 0; }

/* ============== prefers-reduced-motion ============== */
@media (prefers-reduced-motion: reduce) {
  .gallery-img,
  .overview-img,
  .gallery-thumb-overlay,
  .overview-overlay,
  .desc-clamp,
  .faq-body,
  .faq-chevron,
  .amenity-tab,
  .gallery-modal-enter-active,
  .gallery-modal-leave-active { transition: none !important; }
}
</style>

<script setup lang="ts">
// Hub catalog villas (Côte d'Azur).
// - Pas de sidebar permanente. Bouton "Filtres" dans la sticky bar
//   ouvre un drawer overlay slide-from-left.
// - Grid + map prennent toute la largeur du content.
// - Carte Google Maps en split desktop (toggle Hide/Show), FAB toggle
//   mobile.
// - Cards LC-style : image landscape + nom + location + specs + prix.
// - Pagination Load more 12 par page.
import { useVillas, type Villa, type VillaCity, type VillaSetting } from '~/composables/useVillas';
import { useGoogleMaps } from '~/composables/useGoogleMaps';

definePageMeta({ layout: 'default' });
defineI18nRoute({
  paths: { en: '/villas/all', fr: '/villas/all' },
});

const { villas: VILLAS_REF } = useVillas();
const { enabled: mapsEnabled, load: loadMaps } = useGoogleMaps();

const route = useRoute();
const router = useRouter();
const { locale, t } = useI18n();
const localePath = useLocalePath();

const stickyContactVisible = useState<boolean>('sticky-contact-visible', () => true);
const isMdUp = ref(false);
let mdMq: MediaQueryList | null = null;
function syncMd() { isMdUp.value = mdMq?.matches ?? false; }
onMounted(() => {
  stickyContactVisible.value = false;
  mdMq = window.matchMedia('(min-width: 768px)');
  syncMd();
  mdMq.addEventListener('change', syncMd);
  // Active la map par defaut sur desktop uniquement, et si l'URL ne
  // dit pas explicitement le contraire (?map=0).
  if (isMdUp.value && route.query.map !== '0') {
    showMap.value = true;
  }
});
onBeforeUnmount(() => {
  stickyContactVisible.value = true;
  mdMq?.removeEventListener('change', syncMd);
  mdMq = null;
});

// ============== Référentiels ==============

const CITY_OPTIONS: { value: VillaCity; labelFr: string; labelEn: string }[] = [
  { value: 'saint-tropez', labelFr: 'Saint-Tropez', labelEn: 'Saint-Tropez' },
  { value: 'ramatuelle', labelFr: 'Ramatuelle', labelEn: 'Ramatuelle' },
  { value: 'gassin', labelFr: 'Gassin', labelEn: 'Gassin' },
  { value: 'grimaud', labelFr: 'Grimaud', labelEn: 'Grimaud' },
  { value: 'la-croix-valmer', labelFr: 'La Croix-Valmer', labelEn: 'La Croix-Valmer' },
  { value: 'sainte-maxime', labelFr: 'Sainte-Maxime', labelEn: 'Sainte-Maxime' },
  { value: 'cavalaire-sur-mer', labelFr: 'Cavalaire-sur-Mer', labelEn: 'Cavalaire-sur-Mer' },
  { value: 'cannes', labelFr: 'Cannes', labelEn: 'Cannes' },
  { value: 'mougins', labelFr: 'Mougins', labelEn: 'Mougins' },
  { value: 'antibes', labelFr: 'Antibes', labelEn: 'Antibes' },
  { value: 'cap-d-antibes', labelFr: "Cap d'Antibes", labelEn: "Cap d'Antibes" },
  { value: 'villefranche-sur-mer', labelFr: 'Villefranche-sur-Mer', labelEn: 'Villefranche-sur-Mer' },
  { value: 'nice', labelFr: 'Nice', labelEn: 'Nice' },
  { value: 'eze', labelFr: 'Èze', labelEn: 'Èze' },
  { value: 'monaco', labelFr: 'Monaco', labelEn: 'Monaco' },
  { value: 'menton', labelFr: 'Menton', labelEn: 'Menton' },
  { value: 'cap-ferrat', labelFr: 'Cap-Ferrat', labelEn: 'Cap-Ferrat' },
];

const CAPACITY_BUCKETS = [
  { id: 'up-to-6', labelFr: "Jusqu'à 6", labelEn: 'Up to 6', min: 0, max: 6 },
  { id: '7-10', labelFr: '7 à 10', labelEn: '7 to 10', min: 7, max: 10 },
  { id: '11-plus', labelFr: '11+', labelEn: '11+', min: 11, max: 99 },
];
const BEDROOM_BUCKETS = [
  { id: '1-3', labelFr: '1 à 3', labelEn: '1 to 3', min: 1, max: 3 },
  { id: '4-6', labelFr: '4 à 6', labelEn: '4 to 6', min: 4, max: 6 },
  { id: '7-plus', labelFr: '7+', labelEn: '7+', min: 7, max: 30 },
];
const PRICE_BUCKETS = [
  { id: 'under-15k', labelFr: '< 15 000 €', labelEn: '< €15k', min: 0, max: 15000 },
  { id: '15k-50k', labelFr: '15-50 000 €', labelEn: '€15-50k', min: 15000, max: 50000 },
  { id: '50k-plus', labelFr: '> 50 000 €', labelEn: '> €50k', min: 50000, max: 9999999 },
];
const SETTING_OPTIONS: { value: VillaSetting; labelFr: string; labelEn: string }[] = [
  { value: 'out-of-town', labelFr: 'Hors ville', labelEn: 'Out of town' },
  { value: 'beachfront', labelFr: 'Face mer', labelEn: 'Beachfront' },
  { value: 'in-city', labelFr: 'En ville', labelEn: 'In city' },
  { value: 'countryside', labelFr: 'Campagne', labelEn: 'Countryside' },
];

function asArray<T extends string>(v: unknown, allowed: readonly T[]): T[] {
  if (!v) return [];
  const list = Array.isArray(v) ? v : String(v).split(',');
  return list.map((x) => String(x).trim()).filter((x): x is T => (allowed as readonly string[]).includes(x));
}

// ============== Filtres (URL = état) ==============

const CITY_VALUES = CITY_OPTIONS.map((c) => c.value);
const SETTING_VALUES = SETTING_OPTIONS.map((s) => s.value);

const fCity = ref<VillaCity[]>(asArray(route.query.city, CITY_VALUES));
const fCapacity = ref<string[]>(asArray(route.query.capacity, CAPACITY_BUCKETS.map((b) => b.id) as readonly string[]));
const fBedrooms = ref<string[]>(asArray(route.query.bedrooms, BEDROOM_BUCKETS.map((b) => b.id) as readonly string[]));
const fPrice = ref<string[]>(asArray(route.query.price, PRICE_BUCKETS.map((b) => b.id) as readonly string[]));
const fSeaView = ref<boolean>(route.query.seaView === '1');
const fSetting = ref<VillaSetting[]>(asArray(route.query.setting, SETTING_VALUES));
const fSearch = ref<string>(typeof route.query.q === 'string' ? route.query.q : '');
const showFilters = ref(false);

function syncQuery() {
  const q: Record<string, string> = { ...route.query } as Record<string, string>;
  delete q.city; delete q.capacity; delete q.bedrooms; delete q.price; delete q.seaView; delete q.setting; delete q.q;
  if (fCity.value.length) q.city = fCity.value.join(',');
  if (fCapacity.value.length) q.capacity = fCapacity.value.join(',');
  if (fBedrooms.value.length) q.bedrooms = fBedrooms.value.join(',');
  if (fPrice.value.length) q.price = fPrice.value.join(',');
  if (fSeaView.value) q.seaView = '1';
  if (fSetting.value.length) q.setting = fSetting.value.join(',');
  if (fSearch.value.trim()) q.q = fSearch.value.trim();
  router.replace({ path: route.path, query: q });
}
watch([fCity, fCapacity, fBedrooms, fPrice, fSeaView, fSetting, fSearch], syncQuery, { deep: true });

// Body lock quand drawer ouvert
watch(showFilters, (open) => {
  if (typeof document === 'undefined') return;
  document.body.style.overflow = open ? 'hidden' : '';
});

// ============== Tri ==============

const VALID_SORTS = ['default', 'price-asc', 'price-desc', 'bedrooms-asc', 'bedrooms-desc'] as const;
type SortMode = typeof VALID_SORTS[number];
const initialSort: SortMode = (typeof route.query.sort === 'string' && (VALID_SORTS as readonly string[]).includes(route.query.sort))
  ? (route.query.sort as SortMode)
  : 'default';
const fSort = ref<SortMode>(initialSort);
function syncSort() {
  const q: Record<string, string> = { ...route.query } as Record<string, string>;
  if (fSort.value === 'default') delete q.sort;
  else q.sort = fSort.value;
  router.replace({ path: route.path, query: q });
}
watch(fSort, syncSort);

// ============== Show map ==============

// Default false (SSR-safe sur mobile). On l'active en onMounted si on
// est en desktop ET que l'URL ne demande pas explicitement map=0.
// Sur mobile, showMap reste false par defaut : l'utilisateur ouvre la
// carte en plein ecran a la demande via le bouton "Show map".
const showMap = ref<boolean>(false);
function syncMap() {
  const q: Record<string, string> = { ...route.query } as Record<string, string>;
  if (showMap.value) delete q.map;
  else q.map = '0';
  router.replace({ path: route.path, query: q });
}
watch(showMap, (visible) => {
  syncMap();
  // Quand on cache la carte, detruire l'instance Google Maps pour pouvoir
  // la re-creer proprement au prochain show. Reset aussi le filtre bounds.
  if (!visible) {
    destroyMarkers();
    mapInstance = null;
    googleRef = null;
    mapBoundsRef.value = null;
    filterByMapBounds.value = false;
  }
});

// ============== Filtrage + tri ==============

function villaHaystack(v: Villa): string {
  const cityOpt = CITY_OPTIONS.find((c) => c.value === v.city);
  const cityNames = cityOpt ? [cityOpt.labelFr, cityOpt.labelEn] : [];
  return [v.name, v.city, ...cityNames].filter(Boolean).join(' ').toLowerCase();
}
function matchSearch(v: Villa, terms: string[]): boolean {
  if (!terms.length) return true;
  const hay = villaHaystack(v);
  return terms.every((t) => hay.includes(t));
}

// Applique tous les filtres actifs, sauf `skip` (pour calculer le count
// d'une categorie de filtre en ignorant sa propre selection).
function applyFilters(villas: Villa[], skip?: string): Villa[] {
  const terms = fSearch.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return villas.filter((v) => {
    if (skip !== 'search' && !matchSearch(v, terms)) return false;
    if (skip !== 'city' && fCity.value.length && !fCity.value.includes(v.city)) return false;
    if (skip !== 'capacity' && fCapacity.value.length) {
      if (v.capacity == null) return false;
      const matched = fCapacity.value.some((id) => {
        const b = CAPACITY_BUCKETS.find((x) => x.id === id);
        return b ? v.capacity! >= b.min && v.capacity! <= b.max : false;
      });
      if (!matched) return false;
    }
    if (skip !== 'bedrooms' && fBedrooms.value.length) {
      if (v.bedrooms == null) return false;
      const matched = fBedrooms.value.some((id) => {
        const b = BEDROOM_BUCKETS.find((x) => x.id === id);
        return b ? v.bedrooms! >= b.min && v.bedrooms! <= b.max : false;
      });
      if (!matched) return false;
    }
    if (skip !== 'price' && fPrice.value.length) {
      if (v.pricePerWeekFrom == null) return false;
      const matched = fPrice.value.some((id) => {
        const b = PRICE_BUCKETS.find((x) => x.id === id);
        return b ? v.pricePerWeekFrom! >= b.min && v.pricePerWeekFrom! <= b.max : false;
      });
      if (!matched) return false;
    }
    if (skip !== 'seaView' && fSeaView.value && !v.seaView) return false;
    if (skip !== 'setting' && fSetting.value.length) {
      if (!v.setting) return false;
      if (!fSetting.value.includes(v.setting)) return false;
    }
    return true;
  });
}

const filteredVillas = computed(() => applyFilters(VILLAS_REF.value));

// Counts par option pour chaque categorie (ignorant le filtre de la
// categorie courante). Affiche dans le drawer a cote de chaque option.
const countByCity = computed(() => {
  const pool = applyFilters(VILLAS_REF.value, 'city');
  const out: Record<string, number> = {};
  for (const opt of CITY_OPTIONS) out[opt.value] = pool.filter((v) => v.city === opt.value).length;
  return out;
});
const countByCapacity = computed(() => {
  const pool = applyFilters(VILLAS_REF.value, 'capacity');
  const out: Record<string, number> = {};
  for (const b of CAPACITY_BUCKETS) {
    out[b.id] = pool.filter((v) => v.capacity != null && v.capacity >= b.min && v.capacity <= b.max).length;
  }
  return out;
});
const countByBedrooms = computed(() => {
  const pool = applyFilters(VILLAS_REF.value, 'bedrooms');
  const out: Record<string, number> = {};
  for (const b of BEDROOM_BUCKETS) {
    out[b.id] = pool.filter((v) => v.bedrooms != null && v.bedrooms >= b.min && v.bedrooms <= b.max).length;
  }
  return out;
});
const countByPrice = computed(() => {
  const pool = applyFilters(VILLAS_REF.value, 'price');
  const out: Record<string, number> = {};
  for (const b of PRICE_BUCKETS) {
    out[b.id] = pool.filter((v) => v.pricePerWeekFrom != null && v.pricePerWeekFrom >= b.min && v.pricePerWeekFrom <= b.max).length;
  }
  return out;
});
const countBySetting = computed(() => {
  const pool = applyFilters(VILLAS_REF.value, 'setting');
  const out: Record<string, number> = {};
  for (const opt of SETTING_OPTIONS) out[opt.value] = pool.filter((v) => v.setting === opt.value).length;
  return out;
});
const countSeaView = computed(() => {
  const pool = applyFilters(VILLAS_REF.value, 'seaView');
  return pool.filter((v) => v.seaView).length;
});

const visibleVillas = computed(() => {
  const arr = [...filteredVillas.value];
  switch (fSort.value) {
    case 'price-asc': return arr.sort((a, b) => (a.pricePerWeekFrom ?? Infinity) - (b.pricePerWeekFrom ?? Infinity));
    case 'price-desc': return arr.sort((a, b) => (b.pricePerWeekFrom ?? -1) - (a.pricePerWeekFrom ?? -1));
    case 'bedrooms-asc': return arr.sort((a, b) => (a.bedrooms ?? Infinity) - (b.bedrooms ?? Infinity));
    case 'bedrooms-desc': return arr.sort((a, b) => (b.bedrooms ?? -1) - (a.bedrooms ?? -1));
    default: return arr;
  }
});

const filterCount = computed(() =>
  fCity.value.length + fCapacity.value.length + fBedrooms.value.length +
  fPrice.value.length + fSetting.value.length + (fSeaView.value ? 1 : 0),
);

function clearFilters() {
  fSearch.value = '';
  fCity.value = [];
  fCapacity.value = [];
  fBedrooms.value = [];
  fPrice.value = [];
  fSeaView.value = false;
  fSetting.value = [];
}

// ============== Load more ==============

// Bounds carte courante : filtre la grille pour ne montrer que les
// villas visibles dans le viewport map (pattern Airbnb). Declares ici
// car referencees plus haut dans watch(showMap) et plus bas dans
// villasInMapView ; doit etre defini avant tout consumer pour eviter TDZ.
const mapBoundsRef = ref<{ n: number; s: number; e: number; w: number } | null>(null);
const filterByMapBounds = ref(false); // active uniquement apres la 1ere interaction utilisateur

// Filtre supplementaire : villas dont gps est dans le viewport map
// (uniquement quand l'utilisateur a pan/zoom la carte au moins une fois).
const villasInMapView = computed(() => {
  if (!showMap.value || !filterByMapBounds.value || !mapBoundsRef.value) return visibleVillas.value;
  const b = mapBoundsRef.value;
  return visibleVillas.value.filter((v) => {
    if (v.gpsLat == null || v.gpsLng == null) return false;
    return v.gpsLat >= b.s && v.gpsLat <= b.n && v.gpsLng >= b.w && v.gpsLng <= b.e;
  });
});

const PAGE_SIZE = 12;
const visibleCount = ref(PAGE_SIZE);
watch([fCity, fCapacity, fBedrooms, fPrice, fSeaView, fSetting, fSearch, fSort, mapBoundsRef], () => {
  visibleCount.value = PAGE_SIZE;
}, { deep: true });
const paginatedVillas = computed(() => villasInMapView.value.slice(0, visibleCount.value));
const hasMore = computed(() => villasInMapView.value.length > visibleCount.value);
function loadMore() {
  visibleCount.value = Math.min(visibleCount.value + PAGE_SIZE, villasInMapView.value.length);
}

// ============== Format / labels ==============

function fmtPrice(p: number | null): string {
  if (p == null) return t('villas.onRequest');
  return new Intl.NumberFormat(locale.value === 'fr' ? 'fr-FR' : 'en-GB', {
    style: 'currency', currency: 'EUR', maximumFractionDigits: 0,
  }).format(p);
}
function fmtPriceShort(p: number | null): string {
  if (p == null) return locale.value === 'fr' ? 'Sur dem.' : 'On req.';
  if (p >= 1000) return `${Math.round(p / 1000)}k€`;
  return `${p}€`;
}
function priceLine(v: Villa): string {
  if (v.pricePerWeekFrom == null) return t('villas.onRequest');
  if (v.pricePerWeekTo != null && v.pricePerWeekTo > v.pricePerWeekFrom) {
    return t('villas.fromToWeek', { min: fmtPrice(v.pricePerWeekFrom), max: fmtPrice(v.pricePerWeekTo) });
  }
  return t('villas.fromWeek', { min: fmtPrice(v.pricePerWeekFrom) });
}
function cityLabel(value: VillaCity): string {
  const c = CITY_OPTIONS.find((x) => x.value === value);
  if (!c) return value;
  return locale.value === 'fr' ? c.labelFr : c.labelEn;
}
function cityInitial(value: VillaCity): string {
  return cityLabel(value).charAt(0).toUpperCase();
}
function locationLine(v: Villa): string {
  return `${cityLabel(v.city)}, ${t('villas.locationSuffix')}`;
}
function specsLine(v: Villa): string {
  // Card : on garde court, juste capacite + chambres (pas bathrooms).
  if (v.capacity == null && v.bedrooms == null) return '';
  const parts: string[] = [];
  if (v.capacity != null) parts.push(`${v.capacity} ${t('villas.guestsShort')}`);
  if (v.bedrooms != null) parts.push(`${v.bedrooms} ${t('villas.bedroomsShort')}`);
  return parts.join(' · ');
}
function taglineLine(v: Villa): string {
  // Tagline editoriale derivee : setting + vue mer si applicable.
  const parts: string[] = [];
  if (v.setting) {
    const s = SETTING_OPTIONS.find((x) => x.value === v.setting);
    if (s) parts.push((locale.value === 'fr' ? s.labelFr : s.labelEn).toLowerCase());
  }
  if (v.seaView && v.setting !== 'beachfront') {
    parts.push(locale.value === 'fr' ? 'vue mer' : 'sea view');
  }
  return parts.join(', ');
}
function priceLineShort(v: Villa): string {
  // Prix card : version courte "From X / week" (pas le range).
  if (v.pricePerWeekFrom == null) return t('villas.onRequest');
  return t('villas.fromWeek', { min: fmtPrice(v.pricePerWeekFrom) });
}
function villaSlug(v: Villa): string {
  return locale.value === 'fr' ? v.slug.fr : v.slug.en;
}

// Carousel inline : hero + gallery, max 6 photos (pattern LC).
const MAX_CARD_PHOTOS = 6;
function villaPhotosAll(v: Villa): string[] {
  const out: string[] = [];
  if (v.hero) out.push(v.hero);
  if (Array.isArray(v.gallery)) for (const g of v.gallery) if (g && g !== v.hero) out.push(g);
  return out;
}
function villaPhotos(v: Villa): string[] {
  return villaPhotosAll(v).slice(0, MAX_CARD_PHOTOS);
}
function villaPhotosHasMore(v: Villa): boolean {
  return villaPhotosAll(v).length > MAX_CARD_PHOTOS;
}

function onCardScroll(e: Event) {
  const target = e.currentTarget as HTMLElement;
  const slide = Math.round(target.scrollLeft / target.clientWidth);
  const total = target.children.length;
  target.dataset.atStart = slide === 0 ? 'true' : 'false';
  target.dataset.atEnd = slide >= total - 1 ? 'true' : 'false';
  const dotsWrap = target.parentElement?.querySelector('.card-dots');
  if (!dotsWrap) return;
  dotsWrap.querySelectorAll('.card-dot').forEach((d, i) => {
    d.classList.toggle('card-dot-active', i === slide);
  });
}
function scrollCardCarousel(e: MouseEvent, dir: -1 | 1) {
  e.preventDefault();
  e.stopPropagation();
  const btn = e.currentTarget as HTMLElement;
  const wrap = btn.closest('.ccg-image-wrap')?.querySelector('.card-photos') as HTMLElement | null;
  if (!wrap) return;
  wrap.scrollBy({ left: dir * wrap.clientWidth, behavior: 'smooth' });
}

// ============== Hover sync (highlight) + clic (preview) ==============

const hoveredVillaId = ref<string | null>(null);
const clickedVillaId = ref<string | null>(null);
const previewedVilla = computed<Villa | null>(() => {
  if (!clickedVillaId.value) return null;
  return visibleVillas.value.find((v) => v._id === clickedVillaId.value) ?? null;
});

// ============== Map (Google Maps) ==============

const mapContainerRef = ref<HTMLElement | null>(null);
let mapInstance: any = null;
let mapOverlays: any[] = [];
let googleRef: any = null;

function destroyMarkers() {
  for (const ov of mapOverlays) {
    try { ov.setMap(null); } catch (e) { void e; }
  }
  mapOverlays = [];
}

function buildOverlays(villas: Villa[]) {
  if (!googleRef || !mapInstance) return;
  destroyMarkers();
  const withGps = villas.filter((v) => v.gpsLat != null && v.gpsLng != null);
  if (!withGps.length) return;

  class PriceMarker extends googleRef.maps.OverlayView {
    private position: any;
    private price: number | null;
    private id: string;
    private div: HTMLElement | null = null;
    private onClickFn: () => void;
    constructor(position: any, price: number | null, id: string, onClickFn: () => void) {
      super();
      this.position = position;
      this.price = price;
      this.id = id;
      this.onClickFn = onClickFn;
    }
    onAdd() {
      const div = document.createElement('div');
      div.className = 'vm-marker';
      div.dataset.villaId = this.id;
      div.textContent = fmtPriceShort(this.price);
      div.addEventListener('click', (e) => {
        e.stopPropagation(); // empeche le map.click de reset
        this.onClickFn();
      });
      div.addEventListener('mouseenter', () => { hoveredVillaId.value = this.id; });
      div.addEventListener('mouseleave', () => { hoveredVillaId.value = null; });
      this.div = div;
      const panes = this.getPanes();
      panes?.overlayMouseTarget.appendChild(div);
    }
    draw() {
      if (!this.div) return;
      const proj = this.getProjection();
      const pos = proj?.fromLatLngToDivPixel(this.position);
      if (pos) { this.div.style.left = pos.x + 'px'; this.div.style.top = pos.y + 'px'; }
    }
    onRemove() { this.div?.remove(); this.div = null; }
    updateActive(active: boolean) { this.div?.classList.toggle('vm-marker-active', active); }
    setVisible(v: boolean) {
      if (!this.div) return;
      this.div.style.display = v ? '' : 'none';
    }
    getId() { return this.id; }
    getPosition() { return this.position; }
    getPrice() { return this.price; }
  }

  const bounds = new googleRef.maps.LatLngBounds();
  for (const v of withGps) {
    const pos = new googleRef.maps.LatLng(v.gpsLat, v.gpsLng);
    bounds.extend(pos);
    const marker = new PriceMarker(pos, v.pricePerWeekFrom, v._id, () => {
      // Click marker = ouvre la preview (pas navigation directe).
      // La navigation se fait via le clic sur le bloc preview.
      clickedVillaId.value = v._id;
    });
    marker.setMap(mapInstance);
    mapOverlays.push(marker);
  }
  if (!bounds.isEmpty()) {
    // Padding reduit (40 au lieu de 80) pour zoomer un peu plus.
    // Cap max a 14 (au lieu de 12) pour eviter de zoomer trop sur un
    // seul marker mais permettre plus de detail quand 2-3 villas visibles.
    mapInstance.fitBounds(bounds, 40);
    googleRef.maps.event.addListenerOnce(mapInstance, 'idle', () => {
      if (mapInstance.getZoom() > 14) mapInstance.setZoom(14);
      cullMarkers();
    });
  }
}

// Cache les markers trop proches (1 par cellule de grille en pixels).
// Plus on zoom, plus la grille est fine en world coords donc plus
// de markers s'affichent. Evite la cacophonie de pills sur Saint-Tropez
// au zoom faible.
function cullMarkers() {
  if (!mapInstance || !googleRef) return;
  const projection = mapInstance.getProjection();
  if (!projection) return;
  const zoom = mapInstance.getZoom() ?? 9;
  const scale = Math.pow(2, zoom);
  const CELL_SIZE = 70; // px : un marker pill mesure ~50-60px de large

  // Tri par prix decroissant pour garder les villas les plus chères
  // visibles en priorite (plus parlant a faible zoom).
  const sorted = [...mapOverlays].sort((a, b) => (b.getPrice() ?? 0) - (a.getPrice() ?? 0));
  const taken = new Set<string>();

  for (const marker of sorted) {
    const pos = marker.getPosition();
    if (!pos) { marker.setVisible(false); continue; }
    const point = projection.fromLatLngToPoint(pos);
    if (!point) { marker.setVisible(false); continue; }
    const px = Math.floor((point.x * scale) / CELL_SIZE);
    const py = Math.floor((point.y * scale) / CELL_SIZE);
    const key = `${px},${py}`;
    if (taken.has(key)) {
      marker.setVisible(false);
    } else {
      taken.add(key);
      marker.setVisible(true);
    }
  }
}

async function initMap() {
  if (!mapsEnabled || !mapContainerRef.value) return;
  if (mapInstance) {
    setTimeout(() => googleRef?.maps?.event?.trigger(mapInstance, 'resize'), 50);
    return;
  }
  try {
    googleRef = await loadMaps();
    if (!googleRef?.maps) return;
    mapInstance = new googleRef.maps.Map(mapContainerRef.value, {
      center: { lat: 43.55, lng: 7.1 },
      zoom: 9,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: true,
      gestureHandling: 'greedy',
    });
    // Re-culler les markers + update bounds a chaque fin de mouvement
    googleRef.maps.event.addListener(mapInstance, 'idle', () => {
      cullMarkers();
      const b = mapInstance.getBounds();
      if (b) {
        const ne = b.getNorthEast();
        const sw = b.getSouthWest();
        mapBoundsRef.value = { n: ne.lat(), e: ne.lng(), s: sw.lat(), w: sw.lng() };
      }
    });
    // Active le filtre par bounds uniquement quand l'utilisateur
    // interagit avec la carte (pan/zoom), pas au premier fitBounds.
    googleRef.maps.event.addListener(mapInstance, 'dragstart', () => {
      filterByMapBounds.value = true;
    });
    googleRef.maps.event.addListener(mapInstance, 'zoom_changed', () => {
      // Le 1er zoom_changed est declenche par fitBounds : ignorer si
      // utilisateur n'a pas drag encore. Le mode active devient effectif
      // au 2eme zoom user.
      if (filterByMapBounds.value === false) {
        // attendre une vraie interaction (drag) avant d'activer
      } else {
        filterByMapBounds.value = true;
      }
    });
    // Clic sur la map (hors marker) = ferme la preview ouverte
    googleRef.maps.event.addListener(mapInstance, 'click', () => {
      clickedVillaId.value = null;
    });
    buildOverlays(visibleVillas.value);
  } catch (e) {
    console.warn('[villas/all] map init failed', e);
  }
}

watch([mapContainerRef, visibleVillas, () => showMap.value, () => isMdUp.value], async () => {
  if (!mapContainerRef.value) return;
  if (!showMap.value) return;
  if (!mapInstance) await initMap();
  else {
    setTimeout(() => googleRef?.maps?.event?.trigger(mapInstance, 'resize'), 50);
    buildOverlays(visibleVillas.value);
  }
}, { flush: 'post' });

watch(hoveredVillaId, (id) => {
  for (const ov of mapOverlays) {
    if (typeof ov.updateActive === 'function') {
      ov.updateActive(ov.getId() === id);
    }
  }
});

onBeforeUnmount(() => {
  destroyMarkers();
  mapInstance = null;
  googleRef = null;
});

// ============== SEO ==============

const dynamicTitle = computed(() => {
  const parts: string[] = [];
  const firstCity = fCity.value[0];
  if (fCity.value.length === 1 && firstCity) parts.push(cityLabel(firstCity));
  if (fSeaView.value) parts.push(locale.value === 'fr' ? 'vue mer' : 'sea view');
  const base = locale.value === 'fr' ? 'Villas sur la Riviera' : 'Villas on the Riviera';
  return parts.length ? `${parts.join(' · ')} · ${base}` : t('villas.allTitle');
});

useSeoMeta({
  title: () => dynamicTitle.value,
  description: () => t('villas.allDescription'),
});

// ============== Body editorial ==============

const editorialBody = computed(() => {
  const isFr = locale.value === 'fr';
  if (fCity.value.length === 1) {
    const cv = fCity.value[0];
    if (cv === 'saint-tropez' || cv === 'ramatuelle' || cv === 'gassin' || cv === 'grimaud' || cv === 'la-croix-valmer' || cv === 'sainte-maxime' || cv === 'cavalaire-sur-mer') {
      return isFr
        ? `De la presqu'île de Saint-Tropez à Cavalaire, la sélection couvre les villas avec piscine, vue mer ou pieds dans l'eau, capacité de 6 à 22 personnes. Cuisinier, ménage, conciergerie pendant le séjour, livraison de courses à l'arrivée. Transferts depuis Nice ou Toulon coordonnés.`
        : `From the Saint-Tropez peninsula to Cavalaire, the selection covers villas with pool, sea view or beachfront, capacity from 6 to 22. Private chef, housekeeping, concierge during the stay, pre-arrival grocery delivery. Transfers from Nice or Toulon coordinated.`;
    }
    if (cv === 'cannes' || cv === 'mougins' || cv === 'antibes' || cv === 'cap-d-antibes') {
      return isFr
        ? `Cannes et son arrière-pays : du Cap-d'Antibes à Mougins, en passant par les hauteurs cannoises. Villas accessibles à pied de la Croisette, propriétés sur le Cap, mas provençaux dans les collines. Conciergerie 24 heures pendant le Festival, le MIPIM, Cannes Lions, le Yachting Festival.`
        : `Cannes and its inland : from Cap-d'Antibes to Mougins, via the heights of Cannes. Villas within walking distance of the Croisette, properties on the Cap, Provençal mas in the hills. 24-hour concierge during the Festival, MIPIM, Cannes Lions, Yachting Festival.`;
    }
    if (cv === 'villefranche-sur-mer' || cv === 'cap-ferrat' || cv === 'nice' || cv === 'eze' || cv === 'monaco' || cv === 'menton') {
      return isFr
        ? `De Villefranche à Menton, l'autre versant de la Riviera. Le Cap-Ferrat et ses propriétés discrètes, Èze et ses villas perchées, Monaco et son hinterland, Menton et ses jardins. Vue sur la baie ou sur la rade. Transferts depuis Nice-Côte d'Azur en 20 minutes, hélicoptère sur demande pour Monaco.`
        : `From Villefranche to Menton, the other side of the Riviera. Cap-Ferrat and its discreet properties, Èze and its perched villas, Monaco and its hinterland, Menton and its gardens. View over the bay or the harbour. Transfers from Nice-Côte d'Azur in 20 minutes, helicopter on request for Monaco.`;
    }
  }
  return isFr
    ? `Sélection de villas sur la Côte d'Azur de Saint-Tropez à Menton. Chaque adresse a été visitée par l'équipe Misana et propose un standard cohérent : ménage, conciergerie pendant le séjour, transfert depuis l'aéroport coordonné. Demande sur mesure pour adapter à vos dates, votre groupe et vos préférences.`
    : `Selection of villas on the French Riviera from Saint-Tropez to Menton. Each address has been visited by the Misana team and offers a consistent standard : housekeeping, concierge during the stay, coordinated airport transfer. Tailor-made request to adapt to your dates, group and preferences.`;
});
</script>

<template>
  <main class="min-h-screen bg-misana-paper">
    <!-- Hero band -->
    <section class="border-b border-misana-line">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-10 sm:py-20">
        <p class="text-xs uppercase tracking-widest text-misana-muted mb-3 sm:mb-4">{{ t('villas.kicker') }}</p>
        <h1 class="font-display text-3xl sm:text-5xl mb-3 sm:mb-4">{{ t('villas.hubTitle') }}</h1>
        <p class="text-misana-muted text-base sm:text-lg max-w-2xl" data-display>{{ t('villas.hubLead') }}</p>
      </div>
    </section>

    <!-- Sticky bar : count + filtres + map toggle + sort -->
    <section class="sticky top-0 z-30 bg-misana-paper border-b border-misana-line">
      <div class="max-w-[1600px] mx-auto px-4 sm:px-12 py-3 flex items-center gap-3">
        <p class="text-sm text-misana-muted">
          <span class="text-misana-ink font-medium">{{ visibleVillas.length }}</span>
          {{ t('villas.propertiesCount', visibleVillas.length) }}
        </p>

        <div class="flex-1"></div>

        <button
          type="button"
          class="bar-btn hidden lg:inline-flex"
          @click="showFilters = true"
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="w-4 h-4">
            <path d="M4 6H20M7 12H17M10 18H14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
          <span>{{ t('villas.filters') }}</span>
          <span v-if="filterCount" class="bar-btn-badge">{{ filterCount }}</span>
        </button>

        <button
          v-if="mapsEnabled"
          type="button"
          class="bar-btn hidden md:inline-flex"
          @click="showMap = !showMap"
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="w-4 h-4">
            <path d="M3 6L9 4L15 6L21 4V18L15 20L9 18L3 20V6Z" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M9 4V18M15 6V20" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span>{{ showMap ? t('villas.hideMap') : t('villas.showMap') }}</span>
        </button>

        <div class="sort-wrap">
          <select v-model="fSort" class="sort-select" :aria-label="t('villas.sortAria')">
            <option value="default">{{ t('villas.sortDefault') }}</option>
            <option value="price-asc">{{ t('villas.sortPriceAsc') }}</option>
            <option value="price-desc">{{ t('villas.sortPriceDesc') }}</option>
            <option value="bedrooms-asc">{{ locale === 'fr' ? 'Chambres (croissant)' : 'Bedrooms (low to high)' }}</option>
            <option value="bedrooms-desc">{{ locale === 'fr' ? 'Chambres (décroissant)' : 'Bedrooms (high to low)' }}</option>
          </select>
          <span class="sort-chevron" aria-hidden="true">
            <svg viewBox="0 0 12 12" fill="none" class="block w-3 h-3">
              <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
        </div>
      </div>
    </section>

    <!-- Grid + Map (sans sidebar, full largeur) -->
    <section class="max-w-[1600px] mx-auto px-4 sm:px-12 py-8 sm:py-10">
      <div class="grid-map-wrap" :class="{ 'has-map': showMap }">
        <!-- Grid -->
        <div class="villas-grid-col">
          <div
            v-if="paginatedVillas.length"
            class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-10"
            :class="!showMap ? 'lg:grid-cols-3' : 'lg:grid-cols-2'"
          >
            <NuxtLink
              v-for="v in paginatedVillas"
              :key="v._id"
              :to="localePath(`/villas/${villaSlug(v)}`)"
              class="ccg group"
              :class="{ 'ccg-active': hoveredVillaId === v._id }"
              @mouseenter="hoveredVillaId = v._id"
              @mouseleave="hoveredVillaId = null"
            >
              <div class="ccg-image-wrap" :data-multi="villaPhotos(v).length > 1 ? 'true' : 'false'">
                <div class="card-photos" data-at-start="true" data-at-end="false" @scroll.passive="onCardScroll">
                  <div
                    v-for="(src, i) in villaPhotos(v)"
                    :key="i"
                    class="card-photo-slide"
                  >
                    <img :src="src" :alt="v.name" loading="lazy" class="ccg-image" />
                    <!-- Overlay sur la derniere slide si la villa a + de 6 photos -->
                    <div
                      v-if="i === villaPhotos(v).length - 1 && villaPhotosHasMore(v)"
                      class="card-photo-more"
                    >
                      <span class="card-photo-more-label">{{ locale === 'fr' ? 'Voir la villa' : 'See villa' }}</span>
                      <span class="card-photo-more-arrow" aria-hidden="true">→</span>
                    </div>
                  </div>
                  <div v-if="!villaPhotos(v).length" class="card-photo-slide">
                    <div class="ccg-image ccg-image-placeholder"></div>
                  </div>
                </div>

                <button
                  v-if="villaPhotos(v).length > 1"
                  type="button"
                  class="card-arrow card-arrow-prev"
                  :aria-label="t('villas.prevPhoto')"
                  @click="(e) => scrollCardCarousel(e, -1)"
                >
                  <svg viewBox="0 0 16 16" fill="none" class="block w-3 h-3">
                    <path d="M10 12L6 8L10 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </button>
                <button
                  v-if="villaPhotos(v).length > 1"
                  type="button"
                  class="card-arrow card-arrow-next"
                  :aria-label="t('villas.nextPhoto')"
                  @click="(e) => scrollCardCarousel(e, 1)"
                >
                  <svg viewBox="0 0 16 16" fill="none" class="block w-3 h-3">
                    <path d="M6 4L10 8L6 12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </button>

                <div v-if="villaPhotos(v).length > 1" class="card-dots">
                  <span
                    v-for="(_, i) in villaPhotos(v)"
                    :key="i"
                    class="card-dot"
                    :class="{ 'card-dot-active': i === 0 }"
                    aria-hidden="true"
                  ></span>
                </div>

              </div>

              <div class="ccg-title-wrap">
                <div class="ccg-title-block">
                  <h3 class="ccg-title">{{ v.name }}</h3>
                  <p class="ccg-location">{{ cityLabel(v.city) }}</p>
                </div>
                <p class="ccg-price">
                  <span class="ccg-price-from">{{ locale === 'fr' ? 'dès' : 'from' }}</span>
                  <span class="ccg-price-value">{{ fmtPrice(v.pricePerWeekFrom) }}</span>
                  <span class="ccg-price-unit">{{ t('villas.perWeekShort') }}</span>
                </p>
              </div>

              <div class="ccg-icons-row">
                <div class="ccg-icons">
                  <span v-if="v.capacity != null" class="ccg-icon-item">
                    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" class="block w-4 h-4">
                      <circle cx="8" cy="5.5" r="2.4" stroke="currentColor" stroke-width="1.3" />
                      <path d="M3 13.5C3 11 5.2 9.5 8 9.5S13 11 13 13.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
                    </svg>
                    <span>{{ v.capacity }}</span>
                  </span>
                  <span v-if="v.bedrooms != null" class="ccg-icon-item">
                    <svg viewBox="0 0 18 18" fill="none" aria-hidden="true" class="block w-4 h-4">
                      <path d="M2.5 13.5V5M15.5 13.5V8.5C15.5 7.7 14.8 7 14 7H6V13.5M2.5 11H15.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
                      <path d="M6 9.5C6 8.7 6.7 8 7.5 8H10.5C11.3 8 12 8.7 12 9.5V11H6V9.5Z" stroke="currentColor" stroke-width="1.3" />
                    </svg>
                    <span>{{ v.bedrooms }}</span>
                  </span>
                  <span v-if="v.bathrooms != null" class="ccg-icon-item">
                    <svg viewBox="0 0 18 18" fill="none" aria-hidden="true" class="block w-4 h-4">
                      <path d="M2.5 9.5H15.5V11.5C15.5 13.2 14.2 14.5 12.5 14.5H5.5C3.8 14.5 2.5 13.2 2.5 11.5V9.5Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" />
                      <path d="M5 9.5V5.5C5 4.4 5.9 3.5 7 3.5C8.1 3.5 9 4.4 9 5.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
                      <path d="M7 5.5L9 5.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
                      <path d="M4 14.5L4 16M14 14.5L14 16" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
                    </svg>
                    <span>{{ v.bathrooms }}</span>
                  </span>
                </div>
                <span v-if="v.surface != null" class="ccg-icon-item ccg-icon-surface">
                  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" class="block w-4 h-4">
                    <rect x="2.5" y="2.5" width="11" height="11" stroke="currentColor" stroke-width="1.3" />
                    <path d="M5.5 5.5L5.5 10.5M10.5 5.5L10.5 10.5" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-dasharray="1 1.5" />
                  </svg>
                  <span>{{ v.surface }} m²</span>
                </span>
              </div>
            </NuxtLink>
          </div>

          <div v-else class="text-center py-24">
            <p class="text-misana-muted text-sm mb-4">{{ t('villas.noResults') }}</p>
            <button
              v-if="filterCount"
              type="button"
              class="text-xs underline underline-offset-4 hover:text-misana-ink transition"
              @click="clearFilters"
            >{{ t('villas.clearFilters') }}</button>
          </div>
        </div>

        <!-- Map -->
        <aside
          v-if="showMap"
          class="villa-map-aside"
        >
          <!-- Bouton close visible uniquement en mobile modal fullscreen -->
          <button
            v-if="!isMdUp"
            type="button"
            class="map-close-mobile"
            :aria-label="t('villas.filtersClose')"
            @click="showMap = false"
          >
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" class="w-3 h-3">
              <path d="M4 4L12 12M4 12L12 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            </svg>
          </button>

          <div class="villa-map-wrap">
            <div ref="mapContainerRef" class="villa-map">
              <p v-if="!mapsEnabled" class="villa-map-fallback">{{ t('villas.mapUnavailable') }}</p>
            </div>

            <Transition name="preview-fade">
              <div v-if="previewedVilla" class="map-preview">
                <NuxtLink
                  :to="localePath(`/villas/${villaSlug(previewedVilla)}`)"
                  class="map-preview-link"
                >
                  <img v-if="previewedVilla.hero" :src="previewedVilla.hero" :alt="previewedVilla.name" loading="lazy" class="map-preview-img" />
                  <div v-else class="map-preview-img map-preview-img-placeholder"></div>
                  <div class="map-preview-text">
                    <p class="map-preview-name">{{ previewedVilla.name }}</p>
                    <p class="map-preview-city">{{ cityLabel(previewedVilla.city) }}</p>
                    <p class="map-preview-price">{{ priceLine(previewedVilla) }}</p>
                  </div>
                </NuxtLink>
                <button
                  type="button"
                  class="map-preview-close"
                  :aria-label="t('villas.filtersClose')"
                  @click="clickedVillaId = null"
                >
                  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" class="w-3 h-3">
                    <path d="M4 4L12 12M4 12L12 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                  </svg>
                </button>
              </div>
            </Transition>
          </div>
        </aside>
      </div>

      <!-- Load more + footnote : SOUS la map sticky, pleine largeur.
           Le scroll sticky de la map s'arrete donc a la fin des cards. -->
      <div
        v-if="paginatedVillas.length"
        class="villas-after-grid"
      >
        <div v-if="hasMore" class="text-center mt-12">
          <button
            type="button"
            class="load-more-btn"
            @click="loadMore"
          >{{ t('villas.loadMore') }}</button>
        </div>

        <p class="text-xs text-misana-muted mt-12 italic text-center">{{ t('villas.priceFootnote') }}</p>
      </div>
    </section>

    <!-- "Cant find..." CTA -->
    <section class="border-y border-misana-line bg-misana-stone">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-14 sm:py-20 text-center">
        <h2 class="font-display text-2xl sm:text-3xl mb-4">{{ t('villas.schedCallTitle') }}</h2>
        <p class="text-misana-muted max-w-xl mx-auto mb-8 leading-relaxed">{{ t('villas.schedCallLead') }}</p>
        <NuxtLink
          :to="localePath({ path: '/request', query: { service: 'villa' } })"
          class="sched-call-cta"
        >{{ t('villas.schedCallCta') }}</NuxtLink>
      </div>
    </section>

    <!-- Body editorial -->
    <section class="bg-misana-paper">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-16 sm:py-20">
        <p class="text-misana-muted leading-relaxed max-w-3xl">{{ editorialBody }}</p>
      </div>
    </section>

<!-- ===================== DRAWER FILTRES (overlay) ===================== -->
    <Transition name="drawer-fade">
      <div
        v-if="showFilters"
        class="drawer-backdrop"
        @click="showFilters = false"
      ></div>
    </Transition>
    <Transition name="drawer-slide">
      <aside
        v-if="showFilters"
        class="filters-drawer"
        role="dialog"
        aria-modal="true"
      >
        <header class="drawer-header">
          <p class="drawer-title">{{ t('villas.filters') }}<span v-if="filterCount" class="drawer-title-badge">{{ filterCount }}</span></p>
          <button
            type="button"
            class="drawer-close"
            :aria-label="t('villas.filtersClose')"
            @click="showFilters = false"
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="w-4 h-4">
              <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
            </svg>
          </button>
        </header>

        <div class="drawer-body">
          <section class="filter-section">
            <p class="filter-section-key">{{ t('villas.filterCity') }}</p>
            <ul class="filter-list">
              <li v-for="c in CITY_OPTIONS" :key="c.value" v-show="countByCity[c.value] > 0 || fCity.includes(c.value)">
                <label class="filter-row" :class="{ 'filter-row-disabled': countByCity[c.value] === 0 && !fCity.includes(c.value) }">
                  <input type="checkbox" v-model="fCity" :value="c.value" class="filter-check" />
                  <span class="filter-label">{{ locale === 'fr' ? c.labelFr : c.labelEn }}</span>
                  <span class="filter-count">({{ countByCity[c.value] ?? 0 }})</span>
                </label>
              </li>
            </ul>
          </section>

          <section class="filter-section">
            <p class="filter-section-key">{{ t('villas.filterBedrooms') }}</p>
            <ul class="filter-list">
              <li v-for="b in BEDROOM_BUCKETS" :key="b.id">
                <label class="filter-row" :class="{ 'filter-row-disabled': countByBedrooms[b.id] === 0 && !fBedrooms.includes(b.id) }">
                  <input type="checkbox" v-model="fBedrooms" :value="b.id" class="filter-check" />
                  <span class="filter-label">{{ locale === 'fr' ? b.labelFr : b.labelEn }}</span>
                  <span class="filter-count">({{ countByBedrooms[b.id] ?? 0 }})</span>
                </label>
              </li>
            </ul>
          </section>

          <section class="filter-section">
            <p class="filter-section-key">{{ t('villas.filterCapacity') }}</p>
            <ul class="filter-list">
              <li v-for="b in CAPACITY_BUCKETS" :key="b.id">
                <label class="filter-row" :class="{ 'filter-row-disabled': countByCapacity[b.id] === 0 && !fCapacity.includes(b.id) }">
                  <input type="checkbox" v-model="fCapacity" :value="b.id" class="filter-check" />
                  <span class="filter-label">{{ locale === 'fr' ? b.labelFr : b.labelEn }}</span>
                  <span class="filter-count">({{ countByCapacity[b.id] ?? 0 }})</span>
                </label>
              </li>
            </ul>
          </section>

          <section class="filter-section">
            <p class="filter-section-key">{{ t('villas.filterPrice') }}</p>
            <ul class="filter-list">
              <li v-for="b in PRICE_BUCKETS" :key="b.id">
                <label class="filter-row" :class="{ 'filter-row-disabled': countByPrice[b.id] === 0 && !fPrice.includes(b.id) }">
                  <input type="checkbox" v-model="fPrice" :value="b.id" class="filter-check" />
                  <span class="filter-label">{{ locale === 'fr' ? b.labelFr : b.labelEn }}</span>
                  <span class="filter-count">({{ countByPrice[b.id] ?? 0 }})</span>
                </label>
              </li>
            </ul>
          </section>

          <section class="filter-section">
            <p class="filter-section-key">{{ t('villas.filterSetting') }}</p>
            <ul class="filter-list">
              <li v-for="s in SETTING_OPTIONS" :key="s.value" v-show="countBySetting[s.value] > 0 || fSetting.includes(s.value)">
                <label class="filter-row" :class="{ 'filter-row-disabled': countBySetting[s.value] === 0 && !fSetting.includes(s.value) }">
                  <input type="checkbox" v-model="fSetting" :value="s.value" class="filter-check" />
                  <span class="filter-label">{{ locale === 'fr' ? s.labelFr : s.labelEn }}</span>
                  <span class="filter-count">({{ countBySetting[s.value] ?? 0 }})</span>
                </label>
              </li>
            </ul>
          </section>

          <section class="filter-section">
            <p class="filter-section-key">{{ t('villas.filterView') }}</p>
            <ul class="filter-list">
              <li>
                <label class="filter-row" :class="{ 'filter-row-disabled': countSeaView === 0 && !fSeaView }">
                  <input type="checkbox" v-model="fSeaView" class="filter-check" />
                  <span class="filter-label">{{ t('villas.seaView') }}</span>
                  <span class="filter-count">({{ countSeaView }})</span>
                </label>
              </li>
            </ul>
          </section>
        </div>

        <footer class="drawer-footer">
          <button type="button" class="drawer-clear" @click="clearFilters">{{ t('villas.clearFilters') }}</button>
          <button type="button" class="drawer-apply" @click="showFilters = false">
            {{ t('villas.viewResults', { n: visibleVillas.length }) }}
          </button>
        </footer>
      </aside>
    </Transition>

    <!-- FAB filtres mobile (Airbnb-style) : seul point d'entree filtres en
         mobile, cache pendant que le drawer ou la map modal sont ouverts. -->
    <button
      v-show="!showFilters && !showMap"
      type="button"
      class="filters-fab lg:hidden"
      @click="showFilters = true"
    >
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="w-4 h-4">
        <path d="M4 6H20M7 12H17M10 18H14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
      </svg>
      <span>{{ t('villas.filters') }}</span>
      <span v-if="filterCount" class="filters-fab-badge">{{ filterCount }}</span>
    </button>
  </main>
</template>

<style scoped>
/* STICKY BAR */
.bar-btn {
  display: inline-flex; align-items: center; gap: 8px;
  height: 36px; padding: 0 14px;
  background: var(--color-misana-paper); color: var(--color-misana-ink);
  border: 1px solid var(--color-misana-line); border-radius: 999px;
  font-size: 0.78rem; cursor: pointer; font-family: inherit;
  transition: border-color 0.25s ease;
  white-space: nowrap;
}
.bar-btn:hover { border-color: var(--color-misana-ink); }
.bar-btn-badge {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 18px; height: 18px; padding: 0 5px;
  background: var(--color-misana-ink); color: var(--color-misana-paper);
  border-radius: 999px; font-size: 0.65rem;
}
.sort-wrap { position: relative; display: inline-flex; align-items: center; }
.sort-select {
  appearance: none; -webkit-appearance: none;
  background: transparent; color: var(--color-misana-ink);
  border: 1px solid var(--color-misana-line); border-radius: 999px;
  padding: 0 30px 0 14px; height: 36px;
  font-size: 0.78rem; cursor: pointer; font-family: inherit;
  transition: border-color 0.25s ease; outline: none; line-height: 1;
}
.sort-select:hover, .sort-select:focus { border-color: var(--color-misana-ink); }
.sort-chevron { position: absolute; right: 10px; pointer-events: none; color: var(--color-misana-muted); }

@media (max-width: 640px) {
  .bar-btn { font-size: 0.72rem; padding: 0 12px; gap: 6px; }
  .bar-btn span:not(.bar-btn-badge) { display: none; }
  .sort-select { font-size: 0.72rem; padding: 0 26px 0 12px; }
}

/* FAB filtres mobile (pill flottante centree, Airbnb-style). Cache en
   desktop (>= 1024px) ou la sticky bar porte deja le bouton filtres. */
.filters-fab {
  position: fixed;
  bottom: calc(20px + env(safe-area-inset-bottom));
  left: 50%;
  transform: translateX(-50%);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 22px;
  background: var(--color-misana-ink);
  color: var(--color-misana-paper);
  border: 0;
  border-radius: 999px;
  font-size: 0.75rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  cursor: pointer;
  font-family: inherit;
  z-index: 30;
  box-shadow: 0 6px 20px -8px rgba(0, 0, 0, 0.4);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.filters-fab:hover { transform: translateX(-50%) translateY(-1px); }
@media (min-width: 1024px) {
  .filters-fab { display: none !important; }
}
.filters-fab-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  margin-left: 4px;
  background: var(--color-misana-paper);
  color: var(--color-misana-ink);
  border-radius: 999px;
  font-size: 0.65rem;
  letter-spacing: 0;
}

/* GRID + MAP SPLIT */
.grid-map-wrap { display: block; }
@media (min-width: 1024px) {
  .grid-map-wrap.has-map {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 480px);
    gap: 24px;
    align-items: start;
  }
}
.villas-grid-col { min-width: 0; }
.villa-map-aside { position: relative; }

/* Mobile + map active : modal fullscreen.
   La map prend tout l'ecran (z-index 50), la grille de cards est
   cachee. L'utilisateur ferme via le bouton X en haut a droite et
   retombe sur la liste. Pas de pattern split mobile. */
.map-close-mobile { display: none; }
@media (max-width: 1023px) {
  .grid-map-wrap.has-map .villa-map-aside {
    position: fixed; inset: 0;
    height: 100dvh; margin: 0;
    z-index: 50;
  }
  .grid-map-wrap.has-map .villa-map-wrap {
    border-radius: 0; height: 100%;
  }
  .grid-map-wrap.has-map .villas-grid-col {
    display: none;
  }
  .map-close-mobile {
    position: absolute; top: 16px; right: 16px;
    z-index: 60;
    display: inline-flex; align-items: center; justify-content: center;
    width: 38px; height: 38px;
    background: var(--color-misana-paper);
    border: 1px solid var(--color-misana-line);
    border-radius: 999px;
    color: var(--color-misana-ink);
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
  }
}
@media (min-width: 1024px) {
  .villa-map-aside {
    position: sticky; top: 80px;
    align-self: flex-start;
    /* Hauteur compacte : ne pas etirer la map. */
    height: min(520px, calc(100vh - 160px));
  }
}
.villa-map-wrap {
  position: relative;
  width: 100%; height: 100%;
  min-height: 0;
  border-radius: 6px;
  overflow: hidden;
  background: var(--color-misana-stone);
}
.villa-map { position: absolute; inset: 0; }
.villa-map-fallback {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.85rem; color: var(--color-misana-muted);
}

/* Pill marker */
:global(.vm-marker) {
  position: absolute;
  transform: translate(-50%, -50%);
  background: var(--color-misana-paper); color: var(--color-misana-ink);
  border: 1px solid rgba(0, 0, 0, 0.12); border-radius: 999px;
  padding: 6px 11px;
  font-family: var(--font-sans, system-ui);
  font-size: 0.74rem; font-weight: 600;
  white-space: nowrap; cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
  user-select: none;
  transition: transform 0.18s cubic-bezier(0.16, 1, 0.3, 1), background 0.18s ease, color 0.18s ease, box-shadow 0.18s ease;
  z-index: 1;
}
:global(.vm-marker:hover) {
  transform: translate(-50%, -50%) scale(1.08);
  z-index: 5;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.25);
}
:global(.vm-marker-active) {
  background: var(--color-misana-ink); color: var(--color-misana-paper);
  border-color: var(--color-misana-ink); z-index: 5;
  transform: translate(-50%, -50%) scale(1.12);
}

/* Map preview */
.map-preview {
  position: absolute;
  left: 12px; right: 12px; bottom: 12px;
  z-index: 4;
  background: var(--color-misana-paper);
  border-radius: 8px;
  box-shadow: 0 8px 28px -8px rgba(0, 0, 0, 0.28);
  max-width: 340px;
  margin-left: auto;
}
.map-preview-link {
  display: flex; align-items: stretch; gap: 12px;
  padding: 10px;
  text-decoration: none; color: inherit;
}
.map-preview-close {
  position: absolute;
  top: 6px; right: 6px;
  width: 24px; height: 24px;
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--color-misana-paper);
  color: var(--color-misana-ink);
  border: 1px solid var(--color-misana-line);
  border-radius: 999px;
  cursor: pointer; padding: 0;
  z-index: 5;
  transition: border-color 0.2s ease, background 0.2s ease;
}
.map-preview-close:hover {
  border-color: var(--color-misana-ink);
  background: var(--color-misana-stone);
}
.map-preview-img {
  flex: 0 0 84px; width: 84px; height: 84px;
  object-fit: cover; border-radius: 4px;
  background: var(--color-misana-stone);
}
.map-preview-img-placeholder { background: var(--color-misana-stone); }
.map-preview-text { flex: 1 1 0; min-width: 0; display: flex; flex-direction: column; gap: 2px; padding: 2px 0; }
.map-preview-name {
  margin: 0;
  font-family: var(--font-display, serif);
  font-size: 0.95rem; line-height: 1.2; font-weight: 500;
  color: var(--color-misana-ink);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.map-preview-city { margin: 0; font-size: 0.72rem; color: var(--color-misana-muted); }
.map-preview-price { margin: auto 0 0; font-size: 0.78rem; color: var(--color-misana-ink); font-weight: 500; }
.preview-fade-enter-active, .preview-fade-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.preview-fade-enter-from, .preview-fade-leave-to { opacity: 0; transform: translateY(8px); }

/* CARD VILLA (pattern yacht/cars .ccg) */
.ccg {
  display: flex; flex-direction: column; gap: 12px;
  background: var(--color-misana-paper);
  border: 1px solid var(--color-misana-line);
  border-radius: 6px;
  padding: 10px;
  text-decoration: none; color: var(--color-misana-ink);
  overflow: hidden;
  transition: border-color 0.4s ease, box-shadow 0.4s ease;
}
@media (min-width: 768px) { .ccg { gap: 24px; padding: 24px; } }
.ccg:hover, .ccg-active {
  border-color: var(--color-misana-ink);
  box-shadow: 0 12px 28px -20px rgba(0, 0, 0, 0.18);
}

.ccg-image-wrap {
  position: relative;
  width: 100%; aspect-ratio: 4 / 3;
  overflow: hidden; border-radius: 4px;
  background: var(--color-misana-stone);
}
@media (min-width: 768px) { .ccg-image-wrap { aspect-ratio: 3 / 2; } }
.ccg-image {
  position: absolute; inset: 0;
  width: 100%; height: 100%; object-fit: cover;
}
.ccg-image-placeholder { background: var(--color-misana-stone); }

/* Bloc titre+prix : 2 colonnes sur 1 ligne, baseline alignee. */
.ccg-title-wrap {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 14px; width: 100%;
}
.ccg-title-block { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.ccg-title {
  font-family: var(--font-display, serif);
  font-size: 1.05rem; font-weight: 500; line-height: 1.2;
  margin: 0; color: var(--color-misana-ink);
  word-break: break-word;
}
@media (min-width: 768px) { .ccg-title { font-size: 1.2rem; line-height: 1.25; } }
.ccg-location {
  margin: 2px 0 0;
  font-size: 0.78rem; color: var(--color-misana-muted);
}

/* Prix : discret, sans hierarchie sur le titre. Tout petit, muted,
   nowrap, baseline alignee au nom. Le luxe ne crie pas son prix. */
.ccg-price {
  flex: 0 0 auto; margin: 0;
  display: inline-flex; align-items: baseline; justify-content: flex-end;
  gap: 3px; white-space: nowrap;
  line-height: 1.2;
  font-size: 0.78rem;
  color: var(--color-misana-muted);
  font-variant-numeric: tabular-nums;
}
.ccg-price-from { font-style: italic; }
.ccg-price-value { color: var(--color-misana-ink); }
.ccg-price-unit { color: var(--color-misana-muted); }

/* Rangee d'icones : groupe capacite/chambres/sdb a gauche, surface m²
   alignee a droite. Pattern naturel : on liste les caracteristiques de
   "vie" a gauche, la dimension en bout de ligne. */
.ccg-icons-row {
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px;
}
.ccg-icons {
  display: flex; align-items: center;
  gap: 20px; flex-wrap: wrap;
  color: var(--color-misana-ink);
  font-variant-numeric: tabular-nums;
}
.ccg-icon-surface { flex: 0 0 auto; }
.ccg-icon-item {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 0.82rem;
  color: var(--color-misana-ink);
}
.ccg-icon-item svg {
  color: var(--color-misana-muted);
  flex: 0 0 auto;
}

/* === Carousel inline cards === */
.card-photos {
  display: flex; flex-direction: row;
  width: 100%; height: 100%;
  overflow-x: auto; overflow-y: hidden;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.card-photos::-webkit-scrollbar { display: none; }
.card-photo-slide {
  position: relative;
  flex: 0 0 100%;
  width: 100%; height: 100%;
  scroll-snap-align: start;
}
.ccg-image-wrap .ccg-image {
  position: absolute; inset: 0;
  width: 100%; height: 100%; object-fit: cover;
}

/* Overlay "Voir la villa" sur la derniere slide (si plus de 6 photos) */
.card-photo-more {
  position: absolute; inset: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 12px;
  background: rgba(11, 11, 11, 0.55);
  color: var(--color-misana-paper);
  text-align: center;
  pointer-events: none;
}
.card-photo-more-label {
  font-family: var(--font-display, serif);
  font-size: 1.1rem; letter-spacing: 0.02em;
}
.card-photo-more-arrow {
  font-size: 1.5rem; line-height: 1; opacity: 0.9;
  transition: transform 0.3s ease;
}
.ccg:hover .card-photo-more-arrow { transform: translateX(4px); }
.card-arrow {
  position: absolute; top: 50%; transform: translateY(-50%);
  width: 28px; height: 28px;
  display: none; align-items: center; justify-content: center;
  background: rgba(255, 255, 255, 0.96); color: var(--color-misana-ink);
  border: 1px solid rgba(0, 0, 0, 0.06); border-radius: 999px;
  cursor: pointer; padding: 0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  opacity: 0; z-index: 2;
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.card-arrow:hover { transform: translateY(-50%) scale(1.08); }
.card-arrow-prev { left: 8px; }
.card-arrow-next { right: 8px; }
@media (hover: hover) and (min-width: 768px) {
  .ccg-image-wrap[data-multi="true"] .card-arrow { display: inline-flex; }
  .ccg:hover .card-arrow { opacity: 1; }
}
/* Cache prev/next aux extremites du carousel */
.card-photos[data-at-start="true"] ~ .card-arrow-prev {
  opacity: 0 !important;
  pointer-events: none !important;
}
.card-photos[data-at-end="true"] ~ .card-arrow-next {
  opacity: 0 !important;
  pointer-events: none !important;
}
.card-dots {
  position: absolute; bottom: 10px; left: 50%;
  transform: translateX(-50%);
  display: inline-flex; align-items: center; gap: 5px;
  z-index: 2; pointer-events: none;
}
.card-dot {
  width: 6px; height: 6px; border-radius: 999px;
  background: rgba(255, 255, 255, 0.6);
  transition: background 0.25s ease, transform 0.25s ease;
}
.card-dot-active { background: rgba(255, 255, 255, 1); transform: scale(1.15); }


/* LOAD MORE */
.load-more-btn {
  display: inline-flex; align-items: center; justify-content: center;
  height: 48px; padding: 0 36px;
  background: var(--color-misana-paper); color: var(--color-misana-ink);
  border: 1px solid var(--color-misana-ink); border-radius: 0;
  font-size: 0.7rem; letter-spacing: 0.22em; text-transform: uppercase;
  cursor: pointer; font-family: inherit;
  transition: background 0.25s ease, color 0.25s ease;
}
.load-more-btn:hover { background: var(--color-misana-ink); color: var(--color-misana-paper); }

/* SCHEDULE CTA */
.sched-call-cta {
  display: inline-flex; align-items: center; justify-content: center;
  height: 48px; padding: 0 36px;
  background: var(--color-misana-ink); color: var(--color-misana-paper);
  border: 0; border-radius: 0;
  font-size: 0.7rem; letter-spacing: 0.22em; text-transform: uppercase;
  cursor: pointer; font-family: inherit; text-decoration: none;
  transition: opacity 0.25s ease;
}
.sched-call-cta:hover { opacity: 0.9; }

/* DRAWER OVERLAY */
.drawer-backdrop {
  position: fixed; inset: 0; z-index: 40;
  background: rgba(0, 0, 0, 0.45);
}
.filters-drawer {
  position: fixed;
  inset: 0 auto 0 0;
  width: min(420px, 92vw);
  z-index: 50;
  background: var(--color-misana-paper);
  display: flex; flex-direction: column;
  box-shadow: 8px 0 30px -10px rgba(0, 0, 0, 0.22);
}
.drawer-header {
  flex: 0 0 auto;
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; padding: 18px 22px;
  border-bottom: 1px solid var(--color-misana-line);
}
.drawer-title {
  margin: 0;
  font-size: 0.75rem; letter-spacing: 0.18em;
  text-transform: uppercase; color: var(--color-misana-ink);
  display: inline-flex; align-items: center; gap: 8px;
}
.drawer-title-badge {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 22px; height: 22px; padding: 0 6px;
  background: var(--color-misana-ink); color: var(--color-misana-paper);
  border-radius: 999px; font-size: 0.7rem; letter-spacing: 0;
}
.drawer-close {
  width: 32px; height: 32px;
  background: transparent; color: var(--color-misana-ink);
  border: 1px solid var(--color-misana-line); border-radius: 999px;
  display: inline-flex; align-items: center; justify-content: center;
  cursor: pointer; transition: border-color 0.2s ease, background 0.2s ease;
}
.drawer-close:hover { border-color: var(--color-misana-ink); background: var(--color-misana-stone); }
.drawer-body {
  flex: 1 1 auto;
  padding: 22px 22px 32px;
  overflow-y: auto; -webkit-overflow-scrolling: touch;
  display: flex; flex-direction: column; gap: 26px;
}
.filter-section { display: flex; flex-direction: column; gap: 12px; }
.filter-section-key {
  margin: 0; font-size: 0.65rem; letter-spacing: 0.22em;
  text-transform: uppercase; color: var(--color-misana-ink); font-weight: 500;
  padding-bottom: 4px;
  border-bottom: 1px solid var(--color-misana-line);
}
.filter-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 2px; }
.filter-row { display: flex; align-items: center; gap: 10px; padding: 5px 0; cursor: pointer; user-select: none; }
.filter-row-disabled { opacity: 0.4; cursor: not-allowed; }
.filter-count {
  margin-left: auto;
  font-size: 0.72rem;
  color: var(--color-misana-muted);
  font-variant-numeric: tabular-nums;
}
.filter-check {
  appearance: none; -webkit-appearance: none;
  flex: 0 0 auto; width: 14px; height: 14px; margin: 0;
  border: 1px solid var(--color-misana-ink);
  background: var(--color-misana-paper);
  border-radius: 2px; cursor: pointer; position: relative;
  transition: background 0.2s ease;
}
.filter-check:checked { background: var(--color-misana-ink); }
.filter-label { font-size: 0.85rem; color: var(--color-misana-ink); transition: color 0.2s ease; }
.filter-check:checked ~ .filter-label { font-weight: 500; }

.drawer-footer {
  flex: 0 0 auto;
  display: flex; align-items: center; gap: 12px;
  padding: 14px 22px calc(14px + env(safe-area-inset-bottom));
  border-top: 1px solid var(--color-misana-line);
  background: var(--color-misana-paper);
}
.drawer-clear {
  font-size: 0.78rem; color: var(--color-misana-ink);
  background: transparent; border: 0; cursor: pointer; padding: 8px 4px;
  text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 4px;
  font-family: inherit;
}
.drawer-apply {
  flex: 1 1 0;
  background: var(--color-misana-ink); color: var(--color-misana-paper);
  border: 0; border-radius: 8px;
  height: 48px; padding: 0 22px;
  font-size: 0.78rem; letter-spacing: 0.12em; text-transform: uppercase;
  cursor: pointer; font-family: inherit;
  transition: opacity 0.2s ease;
}
.drawer-apply:hover { opacity: 0.9; }

.drawer-fade-enter-active, .drawer-fade-leave-active { transition: opacity 0.25s ease; }
.drawer-fade-enter-from, .drawer-fade-leave-to { opacity: 0; }
.drawer-slide-enter-active, .drawer-slide-leave-active {
  transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1);
}
.drawer-slide-enter-from, .drawer-slide-leave-to {
  transform: translateX(-100%);
}

@media (prefers-reduced-motion: reduce) {
  .card-image, :global(.vm-marker),
  .preview-fade-enter-active, .preview-fade-leave-active,
  .drawer-fade-enter-active, .drawer-fade-leave-active,
  .drawer-slide-enter-active, .drawer-slide-leave-active {
    transition: none !important; transform: none !important;
  }
}
</style>

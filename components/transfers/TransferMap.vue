<script setup lang="ts">
// Carte sobre du trajet. SVG monochrome, 8 villes contextuelles muted,
// 2 pins (depart open + arrivee filled), ligne courbee solide pour chauffeur,
// pointillee pour helicoptere.
import { CITY_COORDS } from '~/lib/transferDetails';
import { CITIES } from '~/lib/constants';

type Props = {
  from: string;
  to: string;
  mode: 'chauffeur' | 'helicopter';
  fromName: string;
  toName: string;
};

const props = defineProps<Props>();

// Bounds elargies avec marge.
const LNG_MIN = 6.50;
const LNG_MAX = 7.60;
const LAT_MIN = 43.18;
const LAT_MAX = 43.85;
const W = 800;
const H = 460;
const PADDING_X = 50;
const PADDING_Y = 60;

function project(coord: [number, number]) {
  const x = PADDING_X + ((coord[1] - LNG_MIN) / (LNG_MAX - LNG_MIN)) * (W - 2 * PADDING_X);
  const y = (H - PADDING_Y) - ((coord[0] - LAT_MIN) / (LAT_MAX - LAT_MIN)) * (H - 2 * PADDING_Y);
  return [x, y];
}

const fromKey = computed(() => (props.from === 'nice-airport' ? 'nice-airport' : props.from));
const toKey = computed(() => props.to);

const fromCoord = computed(() => CITY_COORDS[fromKey.value] ?? CITY_COORDS.nice);
const toCoord = computed(() => CITY_COORDS[toKey.value] ?? CITY_COORDS.nice);

const fromXY = computed(() => project(fromCoord.value));
const toXY = computed(() => project(toCoord.value));

// Pour un trace incurve : control point au-dessus pour helico, en-dessous pour chauffeur.
const isHelico = computed(() => props.mode === 'helicopter');
const path = computed(() => {
  const [fx, fy] = fromXY.value;
  const [tx, ty] = toXY.value;
  const mx = (fx + tx) / 2;
  const my = (fy + ty) / 2;
  const offset = isHelico.value ? -70 : 35;
  return `M ${fx} ${fy} Q ${mx} ${my + offset} ${tx} ${ty}`;
});

// Toutes les villes V1 hors from/to comme points contextuels muted.
const CITY_KEYS = ['saint-tropez', 'cannes', 'cap-d-antibes', 'nice', 'cap-ferrat', 'eze', 'monaco', 'menton'] as const;
const contextDots = computed(() =>
  CITY_KEYS.filter((k) => k !== fromKey.value && k !== toKey.value).map((k) => ({
    slug: k,
    xy: project(CITY_COORDS[k]),
  })),
);

// Position des labels : decale du pin pour eviter chevauchement.
function labelOffset(xy: number[], isFrom: boolean): { x: number; y: number; anchor: 'start' | 'end' | 'middle' } {
  // Si pin est a gauche du milieu, label a droite. Sinon label a gauche.
  const midX = W / 2;
  const isLeft = xy[0] < midX;
  return {
    x: xy[0] + (isLeft ? 14 : -14),
    y: xy[1] + 5,
    anchor: isLeft ? 'start' : 'end',
  };
}
</script>

<template>
  <div class="transfer-map relative">
    <svg
      :viewBox="`0 0 ${W} ${H}`"
      preserveAspectRatio="xMidYMid meet"
      class="w-full h-full"
      role="img"
      :aria-label="`Map ${fromName} to ${toName}`"
    >
      <!-- Coastline guide (very subtle stroke that traces the Riviera roughly) -->
      <path
        d="M 60 320 Q 180 305, 290 295 Q 400 280, 500 270 Q 600 258, 690 245 Q 730 240, 760 235"
        fill="none"
        stroke="rgba(11, 11, 11, 0.06)"
        stroke-width="60"
        stroke-linecap="round"
      />
      <path
        d="M 60 320 Q 180 305, 290 295 Q 400 280, 500 270 Q 600 258, 690 245 Q 730 240, 760 235"
        fill="none"
        stroke="rgba(11, 11, 11, 0.18)"
        stroke-width="1"
      />

      <!-- Context cities : small dots + labels muted -->
      <g v-for="dot in contextDots" :key="dot.slug">
        <circle :cx="dot.xy[0]" :cy="dot.xy[1]" r="2.5" fill="rgba(11, 11, 11, 0.28)" />
      </g>

      <!-- Route path -->
      <path
        :d="path"
        fill="none"
        stroke="var(--color-misana-ink)"
        stroke-width="1.6"
        :stroke-dasharray="isHelico ? '5 6' : ''"
        stroke-linecap="round"
      />

      <!-- From pin : open circle (depart) -->
      <circle :cx="fromXY[0]" :cy="fromXY[1]" r="11" fill="var(--color-misana-paper)" stroke="var(--color-misana-ink)" stroke-width="2" />
      <circle :cx="fromXY[0]" :cy="fromXY[1]" r="3" fill="var(--color-misana-ink)" />

      <!-- To pin : filled circle (arrivee) -->
      <circle :cx="toXY[0]" :cy="toXY[1]" r="11" fill="var(--color-misana-ink)" />
      <circle :cx="toXY[0]" :cy="toXY[1]" r="3" fill="var(--color-misana-paper)" />

      <!-- Labels : noms des villes en typo serif -->
      <text
        :x="labelOffset(fromXY, true).x"
        :y="labelOffset(fromXY, true).y"
        :text-anchor="labelOffset(fromXY, true).anchor"
        font-family="Cormorant Garamond, Georgia, serif"
        font-size="20"
        font-style="italic"
        fill="var(--color-misana-ink)"
      >
        {{ fromName }}
      </text>
      <text
        :x="labelOffset(toXY, false).x"
        :y="labelOffset(toXY, false).y"
        :text-anchor="labelOffset(toXY, false).anchor"
        font-family="Cormorant Garamond, Georgia, serif"
        font-size="20"
        font-weight="500"
        fill="var(--color-misana-ink)"
      >
        {{ toName }}
      </text>
    </svg>
  </div>
</template>

<style scoped>
.transfer-map {
  background: var(--color-misana-stone);
  border-radius: 6px;
  overflow: hidden;
  aspect-ratio: 800 / 460;
}
</style>

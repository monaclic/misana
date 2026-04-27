# Misana V2 - Design System

Reference vivante pour garder une consistance visuelle et comportementale entre toutes les sections du site.

**Lire dans cet ordre** : 1) Principes, 2) Tokens, 3) Patterns de section, 4) Animations, 5) Voix.

A consulter **avant** de creer ou modifier une section. Si une regle ne couvre pas un cas, l'ajouter ici puis l'appliquer.

---

## 0. Principes

### 0.1 Sources d'inspiration assumees
- **Le Collectionist** (lecollectionist.com) : typographie, couleurs, ton editorial, hierarchie de l'information.
- **Rumaya** (rumaya.framer.ai) : structure des sections (pinned, sticky stacks, gallery panning) et animations de revelation.

On ne **copie** rien. On reproduit la **structure** (layout, composition, comportement) et on l'habille avec notre typo, nos couleurs, notre voix.

### 0.2 Hierarchie editoriale
1. Une section a **un** message principal.
2. Le visuel sert le message, jamais l'inverse. Pas d'animation gratuite.
3. Densite faible. Du blanc, du noir, peu de couleur. Lecture lente.

### 0.3 Contraintes Misana
- Photographie : Riviera mediterraneenne, lumiere naturelle. **Jamais** Dubai, Caraibes, Asie. Si placeholder : `picsum.photos/seed/...` ou Unsplash neutre.
- Pas de prix dans le copy editorial. Pas de superlatifs. Pas de tirets longs.

---

## 1. Tokens

### 1.1 Couleurs
Definies dans `assets/css/main.css` via `@theme` Tailwind 4.

| Token | Hex | Usage |
|---|---|---|
| `misana-paper` | `#ffffff` | Background dominant, texte sur fond fonce |
| `misana-ink` | `#0b0b0b` | Texte principal, accents, sections sombres |
| `misana-stone` | `#f5f4f1` | Background secondaire (cards, sections alternees) |
| `misana-line` | `#e8e6e1` | Borders fines, separateurs |
| `misana-muted` | `#6b6b66` | Texte secondaire, kickers, captions |

**Regle de fond** : alternance `paper` / `stone` / `ink` entre sections successives pour creer un rythme. Jamais deux sections `stone` consecutives, jamais deux `ink` consecutives sans un `paper` au milieu.

**Regle d'accent** : le noir (`misana-ink`) est l'unique accent. Jamais de bleu, vert, doré, gradient.

### 1.2 Typographie

Definies dans `assets/css/main.css`.

| Token | Famille | Usage |
|---|---|---|
| `font-sans` | Inter, system-ui | Corps, UI, navigation |
| `font-display` | Cormorant Garamond, Georgia, serif | Titres, kickers chiffres, accents editoriaux |

**Echelle des titres** :
- Hero panel : `text-5xl sm:text-7xl lg:text-8xl` (Cormorant)
- H2 section : `text-4xl sm:text-5xl lg:text-6xl` (Cormorant)
- H3 sub-section : `text-2xl sm:text-4xl` (Cormorant)
- Body : `text-base sm:text-lg` (Inter)
- Kicker / eyebrow : `text-[11px] uppercase tracking-[0.2em]` (Inter)
- Caption / footnote : `text-xs sm:text-sm text-misana-muted`

**Lettrage** :
- Tracking serre sur les chiffres et numeros : `tabular-nums tracking-[0.2em]`
- Italique reserve a l'accent (mots accent dans titre, signature, "the", etc.)
- Pas de all-caps sauf kickers / labels courts

### 1.3 Spacing & layout

- Container : `max-w-7xl mx-auto px-6`
- Container compact : `max-w-3xl` ou `max-w-2xl mx-auto`
- Padding section vertical : `py-20` mobile, `py-24` desktop, `py-32` pour hero
- Gap grille : `gap-3 sm:gap-5` (cards), `gap-10` (colonnes editoriales)

### 1.4 Bordures & opacites

- Border standard : `border border-misana-line` sur fond clair
- Border sur fond sombre : `border-misana-paper/15` ou `/20`
- Overlay image dark : `bg-black/55` (image-text), `bg-misana-ink/45` (hero panels)

---

## 2. Patterns de section

Chaque section devrait correspondre a **un** des patterns ci-dessous. Si on innove, l'ajouter ici.

### 2.1 Sticky stack (hero, services)
Utilise pour : hero homepage (6 panels), futures sections "tour" multi-screen.

**Structure** :
```
section (bg-misana-ink)
  article × N (sticky top-0 h-screen, z-index croissant 10..10+N)
    img (object-cover, brightness-0.55 ou bg-misana-ink/45 overlay)
    content centred (eyebrow + title + divider + body + cta)
```

**Comportement** : chaque panel pin au top du viewport, le suivant scrolle par-dessus. IntersectionObserver (threshold 0.45) marque chaque panel `data-revealed="true"` au passage pour declencher les reveals.

**Quand l'utiliser** : intro de page longue, suite de propositions de valeur fortes, transitions de chapitre.

### 2.2 Pinned gallery panning (cities)
Utilise pour : cities band, futures sections "guides" / "addresses".

**Structure** :
```
section (height = N × 100vh pour donner du scroll)
  div sticky top-0 h-screen (le pin)
    top : kicker + titre split avec mot accent italique
    middle : flex absolute centre vertical, translateX au scroll
      cards (rotation legere -3° a +3°)
    bottom : lead + cta
    progress indicator (01..08 + barre)
```

**Comportement** : `requestAnimationFrame` throttled `scroll/resize` listener, calcule `progress = -rect.top / (offsetHeight - innerHeight)` clamped 0..1, applique `translateX` sur le wrapper flex (de `+18vw` a `-110vw`). Cards ont chacune une rotation pseudo-random.

**Quand l'utiliser** : presentation d'une collection de 6-12 elements visuels avec une narration courte qui les accompagne.

### 2.3 Editorial split (services features)
Utilise pour : helicopter, yacht, cars, chauffeur features sur la home.

**Structure** :
```
section (bg-misana-paper ou stone, alterne)
  grid lg:grid-cols-12 gap-10 items-center
    col-span-5 : kicker + h2 + body + cta (border outline button)
    col-span-7 : grille 2 ou 3 cards thumbs (heliports, yachts, cars, routes)
  alterner ordre image/content section sur section (order-1/order-2)
```

**Quand l'utiliser** : presenter un service avec 3-4 elements visuels supports.

### 2.4 List rows (events, journal)
Utilise pour : events agenda, futures listes editoriales (regulars, tables, journal).

**Structure** :
```
section (bg-misana-ink, texte paper - DARK pour les listes)
  header split : titre + counter (N+) + lead
  ul border-t border-paper/20
    li × N border-b border-paper/20
      a grid 12 cols : seq number + date + title + meta + cta
      hover : title clip-reveal italique, thumbnail flottant a droite, fleche translate, soulignement scale-in
  footnote bas
```

**Quand l'utiliser** : longue liste editoriale ou la lecture lineaire fait sens (calendrier, articles, regulars).

### 2.5 Form section (request)
Utilise pour : full request form embed.

**Structure** :
```
section (bg-misana-stone)
  text center : kicker + h2 + lead
  card (bg-paper p-10 ring-1 ring-line)
    <RequestForm />
```

**Quand l'utiliser** : conversion finale d'une page longue.

### 2.6 Editorial cards grid (access, guides)
Utilise pour : access top picks, latest guides.

**Structure** :
```
section (bg-paper)
  header split : kicker + h2 + lead | cta link
  grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5
    card : aspect 4/5 ou 4/3, image cover, gradient bottom, label kicker + name overlay
```

**Quand l'utiliser** : 3-9 entites a presenter avec poids visuel egal.

---

## 3. Animations

Toutes les durees en `cubic-bezier(0.16, 1, 0.3, 1)` (ease expo-out) sauf indication. Toutes respectent `prefers-reduced-motion`.

### 3.1 Reveal block (generique)
Sur tout block editorial qui entre en viewport.

```css
.reveal-block {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
}
[data-revealed="true"] .reveal-block { opacity: 1; transform: translateY(0); }
```

Trigger : IntersectionObserver threshold 0.18, ajoute `data-revealed="true"` au parent `[data-reveal-on-scroll]`.

### 3.2 Reveal staggered (hero panels)
Plusieurs elements dans un meme panel, qui se revelent en cascade.

```
[data-reveal] : opacity 0, translateY(110%), transition 1.1s
delay-1 : 0.05s
delay-2 : 0.18s
delay-3 : 0.28s
delay-4 : 0.42s
delay-5 : 0.58s
```

Chaque element est dans un wrapper `overflow: hidden` pour effet de mask vertical.

### 3.3 Reveal-line (divider vertical)
Sur les dividers fins entre titre et body dans les hero panels.

```css
.reveal-line {
  transform: scaleY(0);
  transform-origin: top center;
  transition: transform 1.4s cubic-bezier(0.16, 1, 0.3, 1) 0.28s;
}
```

### 3.4 Ken-Burns subtle (hero panels images)
Image se decompresse legerement quand le panel devient actif.

```css
.services-panel-img {
  transform: scale(1.06);
  transition: transform 8s ease-out;
}
[data-revealed="true"] .services-panel-img { transform: scale(1); }
```

### 3.5 Hover row (event list, link rows)
Pattern combine pour lignes interactives :
- Title : clip-reveal (base translateY -105%, hover translateY +105%, italique)
- Arrow : translateX +8px
- Underline CTA : scaleX 0 -> 1 transform-origin left
- Background : opacity 0 -> 1 (rgba 5% sur dark, stone sur light)
- Floating thumbnail : opacity 0 -> 1, scale 0.92 -> 1, translateX -10 -> 0

Toutes durees 0.5s a 0.7s, cubic-bezier expo-out, will-change transform.

### 3.6 Hover card (service tiles, gallery thumbs)
- Image scale `1 -> 1.04` over 700ms
- Pas d'autre changement (pas de border highlight, pas de shadow)

### 3.7 Header transparency
Sur routes hero (`/`, `/en`, `/fr`) : header `bg-transparent text-paper` au load. Switche sur `bg-paper text-ink` quand l'utilisateur scrolle au-dela du hero (toggle via `useState('header-transparent')` lue par AppHeader, ecrite par la page via IntersectionObserver).

---

## 4. Composants reutilisables

### 4.1 CTA primary (button)
Bordure outline, hover invert.
```html
<NuxtLink class="inline-block border border-misana-ink px-6 py-3 text-sm tracking-wide hover:bg-misana-ink hover:text-misana-paper transition">
  Label →
</NuxtLink>
```
Sur fond sombre : `border-misana-paper hover:bg-misana-paper hover:text-misana-ink`.

### 4.2 CTA editorial (link)
Souligne, sans bordure, pour navigation secondaire.
```html
<NuxtLink class="text-sm underline underline-offset-4 hover:text-misana-muted transition">
  Label →
</NuxtLink>
```

### 4.3 CTA counter (en-tete de section liste)
```html
<NuxtLink class="inline-flex items-baseline gap-2 text-sm group">
  <span class="opacity-50">(</span>
  <span class="border-b border-misana-ink pb-0.5">All events</span>
  <span class="opacity-60 tabular-nums">8+</span>
  <span class="opacity-50">)</span>
</NuxtLink>
```

### 4.4 Eyebrow / kicker
```html
<p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-3">(MS · NN) · Section name</p>
```
Le `(MS · NN)` numerote la section dans la page (01..10 sur la home).

### 4.5 Section title with italic accent
Le mot accent est italique muted, encadre du reste en regular.
```html
<h2 class="font-display text-4xl sm:text-6xl leading-[1.02]">
  Eight cities,
  <em class="italic text-misana-muted">held by name</em>
  from Saint-Tropez to Menton.
</h2>
```

### 4.6 Divider vertical (hero panels)
```html
<div class="reveal-line w-px h-16 sm:h-20 bg-misana-paper/70 my-8 sm:my-9"></div>
```

### 4.7 Arrow SVG inline
```html
<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
  <path d="M7 12H17" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
  <path d="M13.5 8.5L17 12L13.5 15.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
</svg>
```

---

## 5. Voix de section

Voir `CLAUDE.md` section 5 pour le vocabulaire complet. Resume :

- **Eyebrows** : "(MS · NN) · Topic short". Toujours en uppercase tracking widest muted.
- **Titres H2** : phrase complete avec point. 4 a 8 mots. Accent italique sur 2-3 mots.
- **Body** : 1 a 3 phrases courtes. Pas de phrase de plus de 20 mots.
- **CTA** : verbe + nom court ("View the yachts", "Plan the week", "Discover the maison"). Pas "Click here", "Learn more", "Get started".

**Banni** : exclusive, premium, ultimate, unique, amazing, VIP, luxury experience, elevated, curated lifestyle, exception, exceptional, bespoke (V1), boutique, emojis, exclamations, superlatifs, all caps.

**Prefere** : considered, orchestrated, navigated, curated, arranged, secured, held, prepared, discreet, trusted, the right, an address, a name, guests, regulars, on the coast, eighty kilometres.

---

## 6. Checklist avant merge d'une nouvelle section

- [ ] Pattern utilise est dans la liste (sticky stack, pinned gallery, editorial split, list rows, form, cards grid). Sinon : ajouter le pattern ici.
- [ ] Eyebrow `(MS · NN) · ...`, le `NN` est unique sur la page.
- [ ] Titre suit le format "phrase courte avec accent italique".
- [ ] Background respecte l'alternance avec la section precedente et suivante.
- [ ] Animations : `reveal-block` ou `data-reveal` + delays, IntersectionObserver branche.
- [ ] `prefers-reduced-motion` desactive les transforms.
- [ ] Aucun tiret long (`—`, `–`). Verifier avec `grep -nP '[—–]'`.
- [ ] Aucun superlatif banni.
- [ ] Images : Riviera-themed, ou placeholder neutre. Pas Dubai / generic.
- [ ] CTA suit l'un des 3 patterns (primary outline, editorial link, counter).
- [ ] Pas de prix dans le copy editorial.
- [ ] Build passe (`pnpm build`), aucun em dash, JSON locales valides.

---

## 7. Repo conventions

- Sections homepage : numerotees `(MS · 01)` a `(MS · NN)` dans l'ordre du DOM.
- i18n keys : `home.<sectionShort><Field>` (ex : `home.citiesKicker`, `home.timelineFootnote`).
- Animations CSS : dans `<style scoped>` de la page concernee, ou dans `assets/css/main.css` si reutilise sur >1 page.
- IntersectionObserver : un seul observer generique pour `[data-reveal-on-scroll]` par page, plus des observers specifiques pour mecaniques particulieres (panels actifs, header transparency, etc.).

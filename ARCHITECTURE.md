# ARCHITECTURE.md — Misana V2

Reference vivante. A mettre a jour quand on devie ou on avance.

Derniere mise a jour : 2026-04-26.

---

## 1. Triangulation Misana

| Reference | Pour quoi | Ce qu on prend |
|---|---|---|
| **Excellence Riviera** | Catalog product-led | Listing + filtres + fiches produit (cars, yacht, villas) avec galerie photo, specs, prix tier durees |
| **Leader Limousines** | Funnel + SEO + ads | Multi-step booking (steppers, conditional, validation, calcul live), landings SEO ultra-precises par route, events saisonniers, pages port niches |
| **Le Collectionist** | Branding + voix | Sobriete blanc dominant, noir mesure, typo Cormorant Garamond + Inter, photographie naturelle, pas d em-dash, pas de superlatifs, vocabulaire mesure |

**Resultat unique Misana** : la maison Riviera qui combine catalog Excellence + funnel Leader + voix Le Collectionist. Aucun concurrent ne fait les trois ensemble.

---

## 2. Regle 80/20 inversee par type de service

### Services experiential — 80% Leader / 20% Excellence
Chauffeur, helicoptere, access (restaurants, hotels, palaces, beach clubs, nightclubs, events).

- Structure pages : Leader (H1 cible route x ville + body 1500-3000 mots SEO + tableau routes/durees/prix + sections trust + FAQ + form embedded)
- Iconographie + cards routes : Excellence (visuel plus lisse que Leader)
- Voix : Le Collectionist (vocabulaire mesure, pas em-dash, pas VIP/luxury)

### Services product-led — 80% Excellence / 20% Leader
Cars rental, yacht charter, villas (V1.5+).

- Structure pages : Excellence (header hero + galerie + grid filtres + grid cards + fiche produit avec specs + tier prix + CTA + sections trust + FAQ)
- Sections trust + FAQ + body editorial SEO long : Leader (Excellence est plus pauvre en copy, Leader est dense)
- Voix : Le Collectionist

### Couche Le Collectionist (les deux)
- Bordures `ring-1 ring-misana-line` discret, pas de border-2
- Coins carres stricts ou `rounded-sm` a peine, jamais `rounded-xl`
- Couleur accent : noir misana-ink uniquement sur blanc misana-paper
- Boutons CTA : plats, monochromes, hover swap (border noir to fill noir)
- Photographie : naturelle Mediterranee, pas de filtre, pas de stock cliche
- Trust signals : "Within twenty-four hours, the right person answers" (pas "24/7 available, instant confirmation")
- Backgrounds : blanc plein ou stone subtil, pas de gradient

---

## 3. Architecture URL V1

### Tier 1 — Le 20% qui rapporte 80% (V1 prioritaire)

#### Routes transferts (chauffeur + helico) — gros volume Google + Ads
```
/transfers                                hub catalogue routes
/transfers/[route]                        ex /transfers/nice-airport-monaco
                                          ex /transfers/cannes-monaco
                                          ex /transfers/saint-tropez-nice
```
**12-15 routes Riviera + airport** : Nice airport vers les 7 destinations + 6 routes croisees ville-a-ville.

#### Events saisonniers — volume enorme aux dates
```
/events/[event]                           ex /events/festival-de-cannes
                                          ex /events/monaco-grand-prix
                                          ex /events/cannes-lions
                                          ex /events/monaco-yacht-show
```
**4 events heavy V1** : Festival de Cannes, Monaco GP, Cannes Lions, Monaco Yacht Show.

#### Cars catalog — data prete (12 voitures Excellence Riviera)
```
/services/cars                            hub catalog (12 voitures, filtres)
/services/cars/category/[cat]             ex /services/cars/category/supercar
/services/cars/[brand-model]              fiche produit
                                          ex /services/cars/ferrari-roma-spider
                                          ex /services/cars/mercedes-g63-amg
```
**~18 pages V1** : 1 hub + 5 categories + 12 fiches modeles.

#### Hubs services — entree principale par service
```
/services/[service]                       ex /services/chauffeur, /helicopter, /yacht, /access
```
**5 pages hubs** services principaux.

#### Hubs destinations — entree principale par ville
```
/destinations/[city]                      ex /destinations/cannes, /monaco, /saint-tropez, /nice
```
**4 pages heavy V1** + 4 pages stub.

#### Access establishments — fiches etablissements premium
```
/services/access                          hub catalog
/services/access/[establishment]          ex /services/access/le-louis-xv
                                          ex /services/access/club-55
                                          ex /services/access/cap-eden-roc
```
**~16 pages V1** : 1 hub + 15 establishments.

#### Total Tier 1 V1 : ~60 pages

### Tier 2 — Volume secondaire (V1.5)

#### Yachts catalog
```
/services/yacht                           hub
/services/yacht/[size-bracket]            ex /services/yacht/30-50m
/services/yacht/[port]                    ex /services/yacht/saint-tropez
/services/yacht/with-[equipment]          axe equipment SEO Excellence
                                          ex /services/yacht/with-jet-ski
                                          ex /services/yacht/with-jacuzzi
                                          ex /services/yacht/with-gym
                                          ex /services/yacht/12-plus-guests
/services/yacht/[yacht-id]                fiche yacht V1.5+ (Sanity)
```
**~25 pages V1.5**.

#### Cars x ville croise — long-tail SEO
```
/services/cars/[brand-model]/[city]       ex /services/cars/ferrari-roma-spider/cannes
/services/cars/[city]                     ex /services/cars/monaco
```
**~50 pages V1.5** (12 modeles x 4 villes + 4 villes hub).

#### Discover content marketing — restaurants/bars/nightlife par ville
```
/discover/restaurants/[city]              ex /discover/restaurants/cannes
/discover/private-beaches/[city]          ex /discover/private-beaches/saint-tropez
/discover/nightlife/[city]                ex /discover/nightlife/monaco
```
**~12 pages V1.5**.

#### Routes hub par ville (services x ville)
```
/services/chauffeur/[city]                ex /services/chauffeur/cannes
/services/helicopter/[city]               ex /services/helicopter/saint-tropez
/services/access/[category]/[city]        ex /services/access/restaurants/cannes
```
**~30 pages V1.5**.

### Tier 3 — Long-tail (V2)

- Villas (60+ pages amenity x ville Saint-Tropez focus)
- Routes hors zone Misana (Forte dei Marmi, Portofino, Courchevel, Geneva)
- Events stub (MIPIM, MIPCOM, Voiles Saint-Tropez, etc.)
- Pages ports niches (port-vauban-antibes-chauffeur, port-canto-cannes-chauffeur)
- Italie a l ouest (Cinque Terre, Lac de Come)

---

## 4. Composants techniques

### Composant cle a refactorer en priorite
`<RequestForm>` reutilisable, embeddable dans :
- Page `/request` autonome (entry direct sans contexte)
- Toutes les landings SEO experiential (preset service + route + event)
- Toutes les fiches produit catalog (preset rentalCarId / yachtId locke)

```vue
<RequestForm
  :preset-service="'chauffeur' | 'helicopter' | 'cars' | 'yacht' | 'access'"
  :preset-data="{ pickup, dropoff, date, vehicleId, ... }"
  :lock-service="boolean"
  :embedded="boolean"
/>
```

### Composants existants reutilisables
- `<FleetCarouselCard>` (carousel + prix + meta) — voitures + helicos
- `<PhoneCodeSelect>` (custom dropdown indicatifs)
- `<AddressAutocomplete>` (Google Places)
- `<Disclosure>` (sections collapsibles)
- `<Stepper>` (compteur passengers/luggage)
- Step* (Context, Detail, Contact, Review) — privatises au composant RequestForm
- Panel* (Chauffeur, Helicopter, Cars, Yacht, Access)

### Templates Nuxt a creer
- `pages/transfers/[route].vue` — landing transfert SEO
- `pages/events/[event].vue` — landing event SEO
- `pages/services/[service].vue` — hub service
- `pages/services/cars/index.vue` — catalog cars
- `pages/services/cars/[brandModel].vue` — fiche voiture
- `pages/services/cars/category/[cat].vue` — categorie voiture
- `pages/destinations/[city].vue` — hub ville
- `pages/services/access/[establishment].vue` — fiche etablissement

---

## 5. Sources de donnees

### Donnees structurelles (typees, en code)
- `lib/constants.ts` — SERVICES, CITIES, EVENTS, WEEKENDS, TRANSFERS, ESTABLISHMENTS slugs verrouilles
- `lib/rentalCars.ts` — 12 voitures Excellence Riviera (id, brand, model, prix, specs, images)
- `lib/heliRoutes.ts` — 12 routes hélico avec matrice prix x 6 modeles
- `lib/chauffeurRoutes.ts` — 10 routes chauffeur Riviera + airport
- `lib/fleet.ts` — flotte chauffeur + helicos avec carousel images
- `lib/megaMenu.ts` — structure mega menu 8 entrees x 2 locales
- `lib/phoneCodes.ts` — 50 codes telephone UHNWI markets
- `types/request.ts` — enums (SERVICES, DESTINATIONS, HELIPORTS, etc.)

### Contenu editorial (Sanity, ton associee edite)
Schemas existants (sanity/schemas/documents/) :
- `service.ts` — body editorial par service
- `destination.ts` — body editorial par ville
- `event.ts` — body editorial par event
- `transferRoute.ts` — body editorial par route
- `accessEstablishment.ts` — body editorial par etablissement
- `vehicle.ts` — chauffeur fleet (a etendre pour rental V1.5)
- `helicopter.ts` — flotte helicos
- `heliport.ts` — heliports
- `journalPost.ts` — articles journal
- `globalSettings.ts` — config globale
- `faqItem.ts`, `testimonial.ts`, `route.ts`, `subService.ts`, `serviceVariant.ts`

A enrichir V1 : bodies editorials par page Tier 1 (~60 PortableText a ecrire). Production editoriale par ton associee.

### Sources scraped (recettes)
- Excellence Riviera : cars catalog (12 voitures + images + prix tiers), yachts (V1.5), helicopter (4 villes hubs)
- Leader Limousines : helicoptere matrice prix routes (12 routes x 6 modeles), chauffeur fleet images, structures pages SEO

---

## 6. Etat actuel (snapshot 2026-04-26)

### Fait
- Stack Nuxt 3 + Vue 3 + Tailwind 4 + Pinia + Sanity + Supabase
- Layout shell minimal (header mega menu, footer cocoon, locale switcher)
- Tronc `/request` autonome 4 etapes (Context, Detail, Contact, Review)
  - Single-service avec validation par service
  - Helicopter : 4 hubs villes + sub-pills heliport, cards aircraft carousel + prix matrice
  - Chauffeur : 10 routes pre-definies + Google Places autocomplete + calcul km dynamique + cards vehicules
  - Cars : 12 voitures Excellence Riviera, filtre categorie, cards carousel, prix tier dynamique selon dates
  - Yacht : 4 brackets taille avec photos
  - Access : multi-adresse additif avec date+heure par item
- Recap Leader-style 3 sections (Service / Details / Contact) avec Edit deep-link
- PhoneCodeSelect custom dropdown 50 pays
- Validation step 2 stricte par service
- Endpoint `server/api/inquiries.post.ts` (Supabase service-role)
- Sanity schemas tous fondés (15 types)
- SQL Supabase init (profiles, inquiries, RLS)
- i18n FR/EN strategy prefix
- Voix Misana stricte : zero em-dash, zero VIP/Premium/Luxury en clair
- Deploy Vercel auto sur push main

### A faire (V1 prioritaire)
1. **Phase A bloquant tech** : refactor `<RequestForm>` reutilisable (extract du formulaire actuel)
2. **Phase B routes transferts (Tier 1)** : 3 routes Nice airport + 4 events heavy
3. **Phase C cars catalog (Tier 1)** : `/services/cars` hub + 12 fiches `/services/cars/[brand-model]`
4. **Phase D access establishments** : 1 fiche pattern + duplication 15 establishments
5. **Phase E hubs** : 5 hubs services + 4 hubs destinations heavy

### A faire (V1.5)
1. Yachts catalog complet (data scraping Excellence Riviera + axe equipment)
2. Cars x ville croise (~50 pages long-tail)
3. Discover content marketing par ville
4. Body editorial Sanity (production par associee)
5. JSON-LD par template
6. Sitemap multilocale + maillage interne 8 liens par page produit
7. Lighthouse 90+ mobile
8. Email Resend templates par service (V1 = stub log)

### A faire (V2)
1. Villas catalog (60+ pages amenity x ville)
2. Routes hors zone Riviera
3. Italie ouest extension
4. Stripe transactionnel par service (chauffeur d abord)
5. Mapbox Distance Matrix tarification dynamique helico
6. Resend email transactionnel + recap automatique
7. WhatsApp deeplink contextualise
8. Italian locale
9. Membership / corporate accounts

---

## 7. Decisions architecturales prises

### Single-service (decision 2026-04-26)
Multi-service represente moins de 10% des cas et complique le flux. Un client = un service par demande V1. Les autres services sont mentionnes dans le message libre, ou plusieurs demandes.

### URL = source de verite (sur /request autonome uniquement)
Sur /request autonome : query params `?service=`, `?destination=`, `?step=` syncrhonisent avec le store Pinia.
Sur les landings SEO et fiches produit : preset injecte au mount via prop, pas de sync URL (l URL reste l URL de la landing).

### 4 villes hubs Riviera pour helico (verrouille)
Helicopter limite a Nice / Monaco / Cannes / Saint-Tropez (les 4 villes "heavy" Misana V1). Les 4 villes "stub" (Cap-d Antibes, Cap-Ferrat, Eze, Menton) ne sont accessibles qu en chauffeur/voiture (pas d heliport sur ces villes).

### 8 destinations Misana verrouillees (decision 2026-04-26)
Saint-Tropez, Cannes, Cap-d Antibes, Cap-Ferrat, Nice, Eze, Monaco, Menton. Aucune extension territoriale V1 ni V2 (CLAUDE.md section 10). Pas de Toulon, Marseille, Courchevel, Italie en V1.

### Voix Misana stricte
- Em-dash (—) interdit absolu (CLAUDE.md section 5)
- Vocabulaire banni : exclusive, premium, ultimate, unique, amazing, VIP, luxury experience, elevated, curated lifestyle, exception, exceptional, bespoke, boutique, emojis, points d exclamation, superlatifs
- Vocabulaire prefere : considered, orchestrated, navigated, curated, arranged, secured, held, prepared, discreet, trusted, the right, an address, a name, guests, regulars, on the coast, eighty kilometres
- Pas de prix dans copy editoriale (les prix indicatifs sur cards sont OK, mais pas dans les body editoriaux)

### Stack verrouillee
- Nuxt 3 + Vue 3 + TypeScript 5 strict
- Tailwind 4 CSS-first (pas de tailwind.config.js)
- Sanity 4 + @nuxtjs/sanity
- Supabase + @nuxtjs/supabase
- @nuxtjs/i18n FR/EN prefix
- vee-validate + zod
- Pinia
- pnpm uniquement
- Pas de React, Next, framer-motion, next-intl, etc.

### Telemetry / analytics
- Pas de Google Analytics par defaut (RGPD)
- Plausible (cookieless) ou Vercel Analytics quand on activera

### Google Maps integration
- Cle API : NUXT_PUBLIC_GOOGLE_MAPS_KEY (`.env.local` + Vercel env)
- APIs legacy utilisees : AutocompleteService + DistanceMatrixService (Places API new + Routes API non activees Google Cloud)
- Pour migrer aux nouvelles APIs : activer "Places API (New)" + "Routes API" Google Cloud Console, puis reverter au commit 43144a0

---

## 8. Workflow

### Branches & deploy
- `main` = production, push declenche deploy Vercel auto
- Branches feature pour iterations longues (preview deploys Vercel)
- Pas de PR strict en V1 solo

### Commits
- Conventions libres FR ou EN
- Co-Authored-By Claude Opus 4.7 sur les commits assistes

### Variables d env Vercel a configurer
```
NUXT_PUBLIC_SANITY_PROJECT_ID    = akpi9bfm
NUXT_PUBLIC_SANITY_DATASET       = production
NUXT_PUBLIC_SANITY_API_VERSION   = 2026-04-26
SUPABASE_URL                     = https://iayybwjlvulqlynjuyup.supabase.co
SUPABASE_KEY                     = sb_publishable_...
SUPABASE_SERVICE_KEY             = eyJh... (jamais commit)
NUXT_MISANA_INQUIRIES_TO         = email destinataire inquiries
NUXT_PUBLIC_GOOGLE_MAPS_KEY      = AIzaSyBK38nULYxkVOXHZmGmp_PogbxuYR6rM9g (referrers a configurer)
```

---

## 9. Plan d execution prochaine session

**Objectif session** : completer Tier 1 du Pareto V1 (Phases A a E).

**Phase A (bloquant tech, ~40 min)** : `<RequestForm>` reutilisable
- Extraire le formulaire de pages/request/index.vue dans components/forms/RequestForm.vue
- Props : presetService, presetData, lockService, embedded
- pages/request/index.vue devient un wrapper sans preset

**Phase B (routes transferts, ~60 min)** : 3 routes prioritaires Tier 1
- Template `pages/transfers/[route].vue`
- Generation dynamique pour 3 routes : nice-airport-monaco, nice-airport-cannes, nice-airport-saint-tropez
- Sections : H1 + intro + tableau prix routes + form embedded preset (chauffeur, pickup=NCE, dropoff=...) + FAQ + body editorial Sanity (placeholder)

**Phase C (events heavy, ~30 min)** : 2 events prioritaires Tier 1
- Template `pages/events/[event].vue`
- Festival de Cannes + Monaco Grand Prix
- Sections : H1 + dates + body editorial + form embedded preset (event=...) + sections services pour cet event (chauffeur, helico, access, hotels)

**Phase D (cars catalog, ~60 min)** : 12 fiches produit Tier 1
- Template `pages/services/cars/index.vue` hub catalog avec filtre categorie
- Template `pages/services/cars/[brandModel].vue` fiche produit
- Generation dynamique 12 fiches depuis lib/rentalCars.ts
- Sections fiche : H1 + galerie carousel + grid 2 cols (specs / pricing tiers / form embedded preset rentalCarId)

**Phase E (hubs, ~30 min)** : 5 services + 4 destinations
- Templates `pages/services/[service]/index.vue` et `pages/destinations/[city]/index.vue`
- Body editorial Sanity (placeholder)
- Cross-link vers tier 1 pages (transferts ville, events ville, fiches produit)

**Total session estime** : 3-4h pour Phase A a E completes.

**Skip session** : yachts catalog (V1.5), cars x ville croise (V1.5), discover content (V1.5).

---

## 10. Liens utiles

- Repo GitHub : https://github.com/monaclic/misana
- Vercel : https://vercel.com/monaclic/misana
- Supabase : https://supabase.com/dashboard/project/iayybwjlvulqlynjuyup
- Sanity Studio : `pnpm studio` (montable a /studio en dev)
- Excellence Riviera : https://excellenceriviera.com (reference catalog)
- Leader Limousines : https://www.leaderlimousines.com (reference SEO + funnel)
- Le Collectionist : https://www.lecollectionist.com (reference branding)

---

Fin ARCHITECTURE.md V1

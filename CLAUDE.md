# CLAUDE.md

Instructions de comportement et regles produit Misana V2. Lire integralement avant tout travail sur ce repo.

## 0. Principes generaux

### 0.1 Reflechir avant de coder
- Pas d'hypothese silencieuse. Si plusieurs interpretations existent, les exposer.
- Si un chemin plus simple existe, le proposer.
- Si quelque chose n'est pas clair, s'arreter et demander.

### 0.2 Simplicite d'abord
- Code minimum qui resout le probleme.
- Aucune feature au dela de ce qui est demande.
- Aucune abstraction pour du code utilise une seule fois.
- Aucune flexibilite ou configurabilite non demandee.
- Si tu ecris 200 lignes alors que 50 suffisent, tu reecris.

### 0.3 Changements chirurgicaux
- Toucher uniquement ce qui doit l'etre.
- Pas de refactor adjacent non demande.
- Match du style existant.
- Nettoyer uniquement les orphelins crees PAR tes changements.

### 0.4 Execution orientee but
Reformuler chaque tache en critere verifiable :
- "Ajoute la validation" -> "Ecris des tests d'inputs invalides puis fais-les passer"
- "Corrige le bug" -> "Ecris un test qui reproduit, puis fais-le passer"

---

## 1. Stack verrouillee V2

- **Nuxt 3** App Router file-based, **Vue 3** `<script setup lang="ts">`, **TypeScript 5 strict**
- **Tailwind CSS 4** (CSS-first config, `@import "tailwindcss"` dans `assets/css/main.css`, plugin `@tailwindcss/vite`). Pas de `tailwind.config.js`.
- **Sanity 4** + `@nuxtjs/sanity` (CMS editorial, project ID `akpi9bfm`, dataset `production`)
- **Supabase** + `@nuxtjs/supabase` (DB + Auth admin)
- **@nuxtjs/i18n** FR/EN (EN par defaut, routes `/en/*` et `/fr/*`)
- **vee-validate + zod** pour tous les formulaires
- **Pinia** pour state global si justifie. Sinon useState ou composables.
- **Animations** : CSS natives + View Transitions API + Motion-v ou GSAP en phase design lourde. Pas de framer-motion (React-only).
- **@vercel/analytics** si besoin trafic
- **Convention** : Pages = Server-rendered par defaut. Pas de "use client" / "use server" (concept React absent en Nuxt). Composants `.vue` rendus cote serveur sauf si logique cote client uniquement.

### Ce qui n'existe PAS dans ce projet
- React, Next.js, App Router Next, Server Components, Server Actions, `proxy.ts` Next, `middleware.ts` Next, `'use client'`, `'use server'`, hydration boundaries React, framer-motion, styled-components, next-intl, `next-sanity`, `@supabase/ssr`.
- Si tu vois ces termes dans un prompt utilisateur, tu signales que la stack a change et tu demandes confirmation avant d'agir.

### Package manager
`pnpm` est le seul gestionnaire utilise. Pas de `npm install`, pas de `yarn`. Le `packageManager` est verrouille dans `package.json`.

## 2. Architecture du site (V1)

### Navigation top-niveau
- 5 services : Chauffeur, Cars (Grand Tourer + Supercars), Yacht, Helicopter, Access
- 2 sections editoriales : Destinations, Events
- 1 hub maison : About
- 1 CTA contraste : "Make a request" -> `/request`

### Mega menu par entree nav

Chauffeur, Cars, Yacht, Helicopter, Access, Destinations, Events, About.

### URLs publiques (~115 pages V1)

- `/` homepage
- `/services/[service]` : 5 hubs services
- `/services/[service]/[city]` : 5 x 8 = 40 pages services x ville
- `/services/access/[etablissement]` : 12 a 15 pages V1
- `/transfers` + `/transfers/[route]` : ~30 pages
- `/destinations` + `/destinations/[city]` : 8 pages
- `/events` + `/events/[event]` : 8 pages
- `/weekends` + `/weekends/[weekend]` : 3 a 5 pages V1
- `/journal` + `/journal/[slug]` : ~10 articles V1
- `/about`, `/contact`, `/legal/*`
- **`/request`** : tronc formulaire intelligent universel
- `/admin`, `/admin/inquiries` : protege par middleware Nuxt

Toutes generees via 6 templates dynamiques avec `useAsyncData` + Sanity.

## 3. Le tronc /request (critique)

Page unique, formulaire adaptatif au contexte URL :

```
?service=chauffeur|cars|yacht|helicopter|access|multi
?destination=saint-tropez|cannes|...
?event=festival-de-cannes|...
?weekend=...&from=...&to=...&establishment=...&date=...&lang=fr|en
```

**Regle absolue : l'URL est l'etat.** `useRoute().query` + state local Vue, jamais d'etat persiste localement seulement. Si un lien est partage, le destinataire retombe au meme endroit du funnel.

5 etapes max : Context -> Service Detail -> Dates & People -> Contact -> Review. Bouton Back partout. L'utilisateur peut modifier les pre-remplissages.

Variables par service en etape 2 : voir specs dans `.specs/request-form.md` (a ecrire en Phase 2).

Soumission via endpoint Nuxt (`server/api/inquiries.post.ts`) -> validation zod -> insert Supabase `inquiries` -> email transactionnel a `NUXT_MISANA_INQUIRIES_TO`. V1 = consultatif, V2 = transactionnel par service.

## 4. Sources de donnees

### Sanity (CMS, gere sans code par l'associee)
- services, service_variants, sub_services, destinations, events, curated_weekends
- journal_posts, authors
- transfer_routes, routes
- access_establishments
- vehicles, helicopters, heliports
- faq_items, testimonials
- global_settings

Schemas dans `sanity/schemas/`. Studio lance avec `pnpm studio` (mountable a `/studio` aussi).

### Supabase (DB)
- `profiles` (admin auth uniquement)
- `inquiries` (toutes soumissions /request avec contexte URL et reponses)
- RLS active. `SUPABASE_SERVICE_KEY` jamais exposee cote client.

Pas de tables transactionnelles V1.

## 5. Voix de marque (CRITIQUE)

### Interdiction absolue
**INTERDICTION ABSOLUE des tirets longs (em dash, en dash) dans tout texte produit pour le site.** Utiliser points, virgules, deux-points, point-virgules, parentheses. Tiret simple `-` autorise uniquement pour mots composes (Cap-Ferrat) et URL slugs.

### Vocabulaire a eviter
exclusive, premium, ultimate, unique, amazing, VIP, luxury experience, elevated, curated lifestyle, exception, exceptional, bespoke (banni V1), boutique, emojis, points d'exclamation, superlatifs, all caps.

### Vocabulaire a utiliser
considered, orchestrated, navigated, curated, arranged, secured, held, prepared, discreet, trusted, the right, an address, a name, guests, regulars, on the coast, eighty kilometres.

### Tonalite cible
European luxury house contemporaine.

### Discretion absolue
- Jamais de nom client reel
- Jamais de prix dans copy editoriale
- Quotes anonymisees par profession + nationalite
- Pas de logos clients
- Pas de cas d'etude nommes

### Mention partenaires
"We work with...", "Among the addresses we secure tables at...". Pas de "official partner of..." sans accord ecrit.

### Langues
EN-first sur toute production. FR par traducteur humain. IT en V2. Les regles ci-dessus s'appliquent dans toutes les langues.

## 6. Design

Reference unique : Le Collectionist (lecollectionist.com).

- **Background dominant** : blanc
- **Couleur d'accent unique** : noir, en touches mesurees
- Pas de gradient, glassmorphism, effet a la mode
- **Photographie** : sobre, lumiere naturelle mediterraneenne, pas de filtre, pas de stock cliche Riviera
- V1 = placeholders neutres en attente de photoshoot
- V2 design : animations sobres mais riches (View Transitions, scroll-driven, magnetic CTA, text reveals). Jamais gratuit. Toujours respectueux de `prefers-reduced-motion`.

Tokens design dans `assets/css/main.css` via `@theme` block Tailwind 4.

## 7. SEO et architecture semantique

### 5 cocons
DESTINATION (8) x SERVICE (5) x SERVICE x VILLE (40) x TRANSFER (~30) x EVENT (8).

### Maillage interne
Minimum **8 liens internes contextuels** par page produit (service hub, service x ville, transfer, destination, event, weekend). Ancres en mots-cles naturels varies, jamais "click here". Footer = sitemap editorial structure par cocon.

### Profondeurs V1
- **Lourdes** (priorite Phase 2-3) : Cannes, Monaco, Nice, Saint-Tropez (2000 a 3500 mots), 5 hubs services (1500 a 2500), 4 events majeurs (1500 a 2500), 3 weekends (800 a 1500)
- **Stub** (V1 puis enrichi V1.5) : 4 destinations secondaires (800 a 1200), 40 services x ville (800 a 1200), 30 transfers (600 a 1000), 12 a 15 access x etablissement (600 a 1200), 4 events secondaires (800), 10 articles Journal (1200 a 2500)

### Schema.org V1
LocalBusiness, Service (hub + ville avec areaServed), TouristAttraction, Event, TouristTrip, Article, FAQPage, BreadcrumbList, Organization, Vehicle, Place.

### Technique
- Sitemap par locale + sitemap-index
- hreflang
- canonical
- Meta dynamiques (title 50 a 60, description 150 a 160, OG dediee) via `useSeoMeta()`
- Lighthouse 90+ mobile
- Core Web Vitals : LCP <2.5s, INP <200ms, CLS <0.1

## 8. Conventions de code Nuxt

- **Pas de useState gratuit cote client.** Pour `/request`, etat = URL via `useRoute().query` + `navigateTo` pour mettre a jour.
- Tous les forms en zod + vee-validate.
- Toutes les data fetches typees via `useAsyncData<T>()` ou `useFetch<T>()`.
- Tailwind 4 + CSS variables uniquement.
- Composants atomiques reutilisables dans `/components/ui`.
- RLS Supabase active, secrets jamais cote client (`SUPABASE_SERVICE_KEY` uniquement dans `server/`).
- Variables d'env dans `.env.local`, `.env.example` a jour, jamais commit de secrets.
- Mobile-first.
- Accessibilite WCAG AA minimum.
- RGPD : bandeau cookies sobre, pas de Google Analytics par defaut.
- Pas de `console.log` commit.
- Pas de commentaires evidents ; commentaires uniquement pour le POURQUOI non-evident.

### Routing et i18n
Pages dans `pages/`. i18n strategy = `prefix` -> `/en/services/chauffeur` et `/fr/services/chauffeur`. Pas d'URL non prefixee. Locale par defaut `en`.

### Server endpoints
- `server/api/*.ts` pour endpoints REST
- `server/middleware/*.ts` pour middleware global (auth admin, etc.)

### Auth admin
- Route `/admin/*` protegee via middleware Nuxt qui verifie `useSupabaseUser()`
- Redirection vers `/admin/login` si pas authentifie

## 9. Workflow

- Pas de GSD. Pas de `.planning/`.
- Conventions commits libres, message clair en francais ou anglais.
- Branches feature pour Vercel preview deploys.
- Push sur `main` = deploy production sur Vercel.

## 10. Perimetre

### Zone geographique
Strictement **80 km Saint-Tropez a Menton**. Jamais d'extension territoriale en V1 ni V2.

### 8 destinations V1
Saint-Tropez, Cannes, Cap-d'Antibes, Cap-Ferrat, Nice, Eze, Monaco, Menton.
- **Lourdes** : Cannes, Monaco, Nice, Saint-Tropez
- **Stub** : Cap-d'Antibes, Cap-Ferrat, Eze, Menton

### 4 events lourds V1
Festival de Cannes, Grand Prix Monaco, Cannes Lions, Monaco Yacht Show.
**Stub** : MIPIM, MIPCOM, Cannes Yachting Festival, Saint-Tropez Voiles.

### 3 curated weekends V1
Festival Edition, Grand Prix Edition, Three Days in Cap-Ferrat.

### 15 access establishments V1

**Restaurants** : Le Louis XV (Monaco), La Vague d'Or (Saint-Tropez), Mirazur (Menton), La Palme d'Or (Cannes), Le Chantecler (Nice).

**Palaces** : Hotel du Cap-Eden-Roc (Cap-d'Antibes), Hotel Carlton (Cannes), Hotel Martinez (Cannes), Grand-Hotel du Cap-Ferrat, Hotel de Paris Monte-Carlo.

**Beach & Nightlife** : Club 55 (Pampelonne), Bagatelle (Saint-Tropez), Jimmy'z (Monaco), Baoli (Cannes), La Plage Beau Rivage (Nice).

## 11. Ce qui n'est PAS V1

Mise en prod immediate, calcul prix automatique, Stripe, Resend templates par service, WhatsApp deeplink contextuel, webhook CRM, routing inquiries selon montant, Kanban admin, app native, membership, A/B testing, chat IA, marketplace, multi-tenant, IT, Alpes, Italie, Paris (focus Riviera permanent), villas, jet prive en service principal.

V2 = travail individuel par service pour ajouter le flow transactionnel approprie a chacun (chauffeur transferts d'abord, puis helico point-a-point, puis voiture jour, puis yacht day cruise).

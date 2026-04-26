# Misana

The French Riviera, orchestrated.

## Stack

- **Nuxt 3** (Vue 3, server + static)
- **Tailwind CSS 4** (CSS-first config via `@tailwindcss/vite`)
- **Sanity 4** (CMS editorial - project `akpi9bfm`, dataset `production`)
- **Supabase** (DB + Auth admin via `@nuxtjs/supabase`)
- **@nuxtjs/i18n** (FR/EN, EN par defaut)
- **vee-validate + zod** (formulaires)
- **Pinia** (state global si besoin)

## Setup

```bash
pnpm install
cp .env.example .env.local   # remplir les valeurs
pnpm dev                     # http://localhost:3000
```

## Scripts

- `pnpm dev` lance Nuxt en dev sur `:3000`
- `pnpm build` build SSR pour Vercel
- `pnpm generate` build statique complet
- `pnpm preview` previsualise le build
- `pnpm studio` lance Sanity Studio en local
- `pnpm typecheck` verification TypeScript

## Architecture

Voir `CLAUDE.md` pour les regles produit, perimetre, voix, SEO.

```
.
|-- app.vue              point d'entree
|-- pages/               routes (file-based routing)
|-- components/          composants Vue reutilisables
|-- composables/         logique reutilisable
|-- assets/css/          Tailwind + tokens design
|-- i18n/locales/        traductions FR/EN
|-- sanity/schemas/      schemas Sanity (documents + objects)
|-- server/api/          endpoints API (formulaire /request, etc.)
|-- sql/                 migrations Supabase
|-- public/              assets statiques
```

## Deploiement

- Vercel relie au repo GitHub, deploiement auto sur push
- Variables d'env Vercel : copier `.env.example` dans le dashboard

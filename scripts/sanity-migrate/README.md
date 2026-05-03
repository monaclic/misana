# Sanity migrations

Scripts one-shot pour pomper les donnees `lib/*.ts` vers Sanity.

## Setup

1. Recupere un token Sanity avec permissions Editor :
   - https://www.sanity.io/manage/personal/project/akpi9bfm/api
   - "Add API token" -> Editor permissions
2. Ajoute dans `.env.local` :
   ```
   SANITY_AUTH_TOKEN="sk_..."
   ```

## Lancer une migration

```bash
pnpm exec tsx scripts/sanity-migrate/01-rental-car-categories.ts
pnpm exec tsx scripts/sanity-migrate/02-rental-cars.ts
```

Ordre important : categories avant voitures (les voitures referencent une categorie).

## Idempotence

Chaque script utilise `createOrReplace` avec un `_id` deterministe. Tu peux relancer
sans creer de doublons. Pour repartir de zero, supprime depuis le Studio puis relance.

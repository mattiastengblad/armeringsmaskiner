# Armeringsmaskiner.se

Återförsäljarsajt för armeringsjärnsmaskiner, byggd med Next.js, Drizzle
och Supabase.

**Ny på projektet?** Läs [HANDOFF.md](./HANDOFF.md) — det täcker
arkitektur, datamodell, kända begränsningar och vad som krävs för att gå
live på den riktiga domänen.

## Snabbstart

```bash
pnpm install
cp .env.example .env.local   # se HANDOFF.md §7 för var värdena hittas
pnpm dev                     # http://localhost:3000
```

## Vanliga kommandon

```bash
pnpm test          # Vitest (enhetstester)
pnpm test:e2e       # Playwright (E2E, mot riktig databas — se HANDOFF.md §8)
pnpm lint           # ESLint
pnpm db:studio      # Bläddra i databasen
```

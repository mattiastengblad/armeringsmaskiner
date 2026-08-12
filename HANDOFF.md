# Armeringsmaskiner.se — överlämningsdokument

Det här dokumentet är till för en ny utvecklare som ska ta över projektet:
vad som är byggt, hur det hänger ihop, vad som saknas, och vad som krävs
för att flytta siten till sin riktiga domän och drift.

## 1. Vad är det här för sajt?

En återförsäljarsajt för armeringsjärnsmaskiner (GMS bock-/klippmaskiner,
Oguras handhållna verktyg). Kunder bläddrar i en produktkatalog och skickar
en offertförfrågan/beställning via ett formulär — det finns **ingen
kassa/betalning i nuläget** (medvetet MVP-beslut, se §8). Ett admin-gränssnitt
låter personal hantera förfrågningar, priser och lägga till produkter.

Ägare: Pär Bergman Armeringsmaskiner AB.

## 2. Teknisk stack

- **Next.js 16** (App Router, Turbopack), **React 19**, TypeScript (strict)
- **Tailwind CSS v4** (token-baserad, `@theme inline` i `src/app/globals.css`)
- **shadcn/ui**, men byggt på **`@base-ui/react`** — inte Radix. Komponenter
  tar en `render`-prop för polymorfism (`<Button render={<Link .../>}>`)
  istället för Radix `asChild`. Viktigt att veta innan man lägger till fler
  shadcn-komponenter eller googlar exempel.
- **Drizzle ORM** (`drizzle-orm/postgres-js`) mot Postgres. Schema i
  `src/lib/db/schema.ts` är den enda källan till sanning för datamodellen.
- **Supabase**: Postgres-hosting, Auth (admin-inloggning), Storage (två
  publika buckets: `product-images`, `documents`).
- **Resend** för transaktionsmejl.
- **Vitest** (enhetstester, prismotorn) + **Playwright** (E2E).
- **Vercel** för hosting, **GitHub Actions** för CI.

## 3. Arkitektur — hur det hänger ihop

- **All publik datahämtning** går genom `src/lib/data/catalog.ts`. Inga
  hårdkodade produkter någonstans i UI-lagret.
- **Alla mutationer** är Server Actions (`'use server'`) i `src/lib/actions/`,
  mönstret är alltid: `requireAdmin()` (om admin-only) → Drizzle-skrivning →
  `revalidatePath()`.
- **Auth**: Supabase Auth med e-post/lösenord. `src/proxy.ts` (Next 16:s namn
  för middleware) skyddar `/admin/*`, och `requireAdmin()`
  (`src/lib/auth/require-admin.ts`) kollar dessutom att
  `profiles.role = 'admin'` innan varje admin-sida/action körs.
- **RLS**: Row Level Security-policyer finns (`drizzle/rls-policies.sql`),
  men **vår egen appkod använder Drizzle med en direkt Postgres-anslutning,
  inte Supabases JS-klient** — det innebär att RLS **kringgås helt** av vår
  egen kod. RLS spelar bara roll om någon pratar direkt med Supabase via
  PostgREST/anon-nyckeln. All behörighetskontroll i appen sker i
  applikationskod (`requireAdmin()`), inte i databasen.
- **Prismotorn** (`src/lib/pricing.ts`) är en ren funktion som återskapar
  formlerna från kundens Excel-kalkyl (`computePricing()`), verifierad
  cell-för-cell mot originalfilen (se testerna i `src/lib/pricing.test.ts`).
  Den beräknas **live vid varje sidladdning** i `catalog.ts` utifrån
  `product_cost_inputs` + den aktiva raden i `pricing_settings` — inget
  cachat/sparat pris. Ändrar man växelkurs/påslag på `/admin/priser` slår
  det igenom direkt på hela sajten.

## 4. Datamodell (kort)

Se `src/lib/db/schema.ts` för fullständiga fält. Grovt:

- **Katalog**: `brands`, `categories`, `products` (+ `product_images`,
  `product_specs`, `product_capacity`, `accessories`, `documents`)
- **Leads**: `inquiries`, `orders`, `order_items`, `customers` (schemat är
  förberett för e-handel senare, men inget av det är byggt i UI)
- **Admin**: `profiles` (roll: `admin`/`staff`, kopplad till
  `auth.users.id`)
- **Prismotor**: `pricing_settings` (globala konstanter: EUR-kurs,
  fraktpåslag, FIK-påslag), `product_cost_inputs` (per produkt/variant:
  inköpspris €, frakt €, målmarginal — plus `is_uncertain` som döljer
  publikt pris tills någon bekräftar siffran), `resellers`,
  `reseller_prices` (oanvänt i UI ännu)

## 5. Publika sidor

`/`, `/produkter/[category]`, `/produkter/[category]/[product]`,
`/dokumentation`, `/service`, `/kontakt`, `/integritetspolicy`.
Kontaktformuläret går via en Server Action → skriver till `inquiries` →
skickar mejl via Resend.

## 6. Admin (`/admin/*`)

- `/admin/login` — inloggning
- `/admin` — ordrar & förfrågningar, statusändring
- `/admin/priser` — prisinställningar + kostnadsunderlag per produkt →
  visar beräknat TIB/bruttopris/kaper-pris
- `/admin/produkter` — produktlista
- `/admin/produkter/ny` — skapa ny produkt (grundinfo, specs, kapacitet,
  tillbehör, bilduppladdning, dokumentuppladdning)

**Saknas:** en "redigera produkt"-sida — man kan bara skapa nya produkter,
inte ändra befintliga via UI. Näst rimligaste utökning av admin-panelen.

## 7. Miljövariabler

Se `.env.example`. Ingen hemlig värde ligger i det här dokumentet.

| Variabel                                   | Var man hittar den                                                                                                                                                |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                     | Sajtens publika URL (för sitemap/OG/canonical)                                                                                                                    |
| `NEXT_PUBLIC_SUPABASE_URL`                 | Supabase → Project Settings → API                                                                                                                                 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`            | Supabase → Project Settings → API                                                                                                                                 |
| `SUPABASE_SERVICE_ROLE_KEY`                | Supabase → Project Settings → API (hemlig!)                                                                                                                       |
| `DATABASE_URL`                             | Supabase → Project Settings → Database → **Transaction pooler**-strängen (inte "Direct connection" — den är bara IPv6 och funkar inte från Vercel/GitHub Actions) |
| `RESEND_API_KEY`                           | resend.com → API Keys                                                                                                                                             |
| `ORDER_NOTIFICATION_EMAIL`                 | Se §8 — pekar just nu på ett privat konto, inte den riktiga domänen                                                                                               |
| `ADMIN_TEST_EMAIL` / `ADMIN_TEST_PASSWORD` | Ett riktigt admin-konto, används av Playwright E2E-testerna för att logga in                                                                                      |

## 8. Kom igång lokalt

```bash
pnpm install
cp .env.example .env.local   # fyll i enligt tabellen ovan
pnpm dev                     # http://localhost:3000
```

**Viktigt att veta:** det finns **ingen separat stagingdatabas**. Lokal
utveckling, CI och produktion pratar just nu med **samma** Supabase-projekt.
Playwright-testerna som skriver data (t.ex. kontaktformuläret) städar upp
efter sig, men var försiktig med att köra skript mot databasen. Att sätta
upp en riktig staging-miljö är en naturlig första förbättring.

Databasschema hanteras med Drizzle:

```bash
pnpm db:generate   # generera migration från schema.ts
pnpm db:migrate    # kör migrationer mot DATABASE_URL
pnpm db:studio     # bläddra i databasen visuellt
```

## 9. Deploy / hosting — flytta till riktig domän

Projektet är kopplat till Vercel (`armeringsmaskiner`-projektet) med
auto-deploy från GitHubs `main`-branch. Live idag på:

```
https://armeringsmaskiner.vercel.app
```

**Ingen riktig domän är kopplad än.** För att gå live på `armeringsmaskiner.se`:

1. Bli inbjuden till (eller ta över) Vercel-projektet och Supabase-projektet
   — kontakta nuvarande ägare för åtkomst.
2. Vercel-projektet → Settings → Domains → lägg till `armeringsmaskiner.se`
   och `www.armeringsmaskiner.se`.
3. Uppdatera DNS hos domänregistraren enligt Vercels instruktioner (oftast
   en A-post till Vercel + CNAME för `www`).
4. Uppdatera `NEXT_PUBLIC_SITE_URL` i Vercels miljövariabler till
   `https://armeringsmaskiner.se`.
5. Verifiera domänen i Resend (se §11) så att mejl kan skickas från/till
   riktiga `@armeringsmaskiner.se`-adresser.

Miljövariabler i Vercel sätts via dashboarden eller
`vercel env add <namn> production,preview`.

## 10. CI/CD

`.github/workflows/ci.yml` körs på varje push/PR mot `main`: lint →
`next typegen` (krävs innan typecheck — `PageProps`/`LayoutProps` genereras
bara av `next dev/build/typegen`) → `tsc --noEmit` → Vitest → Playwright E2E.
Kräver samma hemligheter som `.env.local`, satta som GitHub Actions secrets
(`gh secret set <namn>` eller repo Settings → Secrets).

## 11. Kända begränsningar och öppna beslut

Sånt en ny utvecklare bör känna till innan de bygger vidare:

- **Ingen staging-miljö** (se §8) — största strukturella skulden just nu.
- **Ingen "redigera produkt"-sida** i admin, bara skapa nya.
- **Resend är inte klar för produktion**: `ORDER_NOTIFICATION_EMAIL` pekar
  på ett privat testkonto (`mattias@sonicseed.co`) eftersom
  `armeringsmaskiner.se` inte är domän-verifierad i Resend än. Måste
  åtgärdas innan riktiga kundmejl kan gå ut från/till den riktiga domänen.
- **Prismotorn är bara delvis populerad.** `src/lib/pricing-import/model-mapping.ts`
  innehåller 12 rader från kundens Excel-kalkyl, **alla fortfarande
  `approved: false`** — de kräver ägarens (Pärs) godkännande innan de kan
  importeras med `pnpm pricing:import`. Ett nyare, renare dataset importerades
  separat med `pnpm pricing:import-json` (se `scripts/import-gms-cost-inputs.ts`)
  och täcker ~9 produkter (BD/H/M-serien, MG 20 B/BD) — övriga produkter
  (MG 16 B/BD, Oguras handverktyg, stationer/förlager m.fl.) saknar
  fortfarande kostnadsdata och visar "Pris på begäran".
- En produkt (BD 26) har `is_uncertain = true` på sin kostnadsrad — priset
  är en gissning, inte bekräftat, och döljs därför publikt tills fältet
  rensas i databasen.
- `/admin/priser`-tabellen visar bara **en** kostnadsrad per produkt, men
  schemat (`product_cost_inputs.variant_label`) stödjer flera (t.ex.
  MG 20 B finns i 220V/380V) — båda finns korrekt i databasen, men UI:t
  visar bara en av dem. Värt att bygga ut.
- **Ingen kundvagn/kassa/betalning** — medvetet avgränsat i nuläget. Schemat
  (`orders`, `order_items`, `customers`) är förberett för det, men inget
  UI finns. En senare designmanual antog full e-handel (kundvagn, SV/EN,
  lagerantal) — ägaren valde uttryckligen "bara visuell design, ingen
  e-handel" när det kom upp, så bygg inte det utan att stämma av igen.
- **Ingen sökfunktion** — medvetet uteslutet snarare än fejkat.
- **Innehållsluckor** kvar sedan text/bilder skrapades från den gamla
  sajten: telefonnummer stämde inte helt överens mellan källor, några
  produktbilder saknas (SLS 12, GMS XL), och HBB-seriens specifikationer
  finns bara som bilder, inte strukturerad data.

## 12. Tester

```bash
pnpm test       # Vitest — främst prismotorns formler
pnpm test:e2e   # Playwright — mot RIKTIGA databasen, se §8
```

## 13. Åtkomst som nästa utvecklare behöver

- GitHub-repo: `mattiastengblad/armeringsmaskiner` (bjudas in eller överföras)
- Supabase-projekt (Postgres, Auth, Storage)
- Vercel-projekt (`armeringsmaskiner`)
- Resend-konto
- DNS-åtkomst hos domänregistraren för `armeringsmaskiner.se`

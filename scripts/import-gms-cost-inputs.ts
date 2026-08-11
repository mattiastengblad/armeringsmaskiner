/**
 * Imports the structured GMS cost-basis JSON (a cleaned-up extraction of
 * "GMSkalkyler till AI 20210719 1.xlsx") into pricing_settings and
 * product_cost_inputs.
 *
 * Unlike scripts/import-pricing.ts (which matches ambiguous Excel model
 * names to catalog products via a manually-approved mapping table), this
 * JSON already carries real catalog SKUs — so no name-matching/approval
 * step is needed. Voltage variants (e.g. "GMS-MG20B-220V") are split into
 * separate product_cost_inputs rows against the base product's SKU
 * ("GMS-MG20B"), using the schema's variant_label column.
 *
 * The "Budget" parameter set (€11, frakt ×1.3, FIK ×1.2 — "GMS kreditpris")
 * is written as the active pricing_settings row; it matches the defaults
 * already hardcoded in the admin pricing form. "Dagsläge 2021" is written
 * as a second, inactive row for reference.
 *
 * Every row's computed TIB/bruttopris is cross-checked against the JSON's
 * own "facit" (expected output) values before writing, as a sanity check
 * that the input data was transcribed correctly.
 *
 * Usage:
 *   pnpm tsx --env-file=.env.local scripts/import-gms-cost-inputs.ts "<path-to-json>"
 *   pnpm tsx --env-file=.env.local scripts/import-gms-cost-inputs.ts "<path-to-json>" --write
 */
import { readFileSync } from 'node:fs';
import { eq, and, isNull } from 'drizzle-orm';
import { db } from '../src/lib/db';
import * as schema from '../src/lib/db/schema';
import { computePricing, type PricingSettings } from '../src/lib/pricing';

interface ScenarioParams {
  eur_kurs: number;
  fraktpaslag: number;
  fikpaslag: number;
  beskrivning: string;
}

interface ProductRow {
  artikelnummer: string;
  modell: string;
  variant: string | null;
  osaker: boolean;
  osakerhetsnot: string | null;
  indata: Record<string, { inkopspris_eur: number; frakt_eur: number; inkopsandel: number }>;
  facit: Record<string, { tib: number; bruttopris: number; tackningsgrad: number }>;
}

interface GmsJson {
  kalla: string;
  kalkyldatum: string;
  parametrar: Record<string, ScenarioParams>;
  produkter: ProductRow[];
}

const ACTIVE_SCENARIO = 'Budget';
const TOLERANCE_SEK = 1; // facit values are rounded to 2 decimals; allow a small drift

function formatSek(n: number): string {
  return new Intl.NumberFormat('sv-SE', { maximumFractionDigits: 0 }).format(n) + ' kr';
}

function baseSku(row: ProductRow): string {
  return row.variant ? row.artikelnummer.replace(`-${row.variant}`, '') : row.artikelnummer;
}

async function main() {
  const filePath = process.argv[2];
  const shouldWrite = process.argv.includes('--write');

  if (!filePath) {
    console.error(
      'Usage: pnpm tsx --env-file=.env.local scripts/import-gms-cost-inputs.ts "<path-to-json>" [--write]',
    );
    process.exit(1);
  }

  const data = JSON.parse(readFileSync(filePath, 'utf-8')) as GmsJson;
  const activeParams = data.parametrar[ACTIVE_SCENARIO];
  if (!activeParams) {
    console.error(`Hittar inget scenario "${ACTIVE_SCENARIO}" i parametrar.`);
    process.exit(1);
  }
  const activeSettings: PricingSettings = {
    eurToSekRate: activeParams.eur_kurs,
    freightMarkupMultiplier: activeParams.fraktpaslag,
    resellerMarkupMultiplier: activeParams.fikpaslag,
  };

  console.log(
    `\nKälla: ${data.kalla} (${data.kalkyldatum})\nAktivt scenario: "${ACTIVE_SCENARIO}" — € ${activeSettings.eurToSekRate}, frakt ×${activeSettings.freightMarkupMultiplier}, FIK ×${activeSettings.resellerMarkupMultiplier}\n`,
  );

  const allProducts = await db.query.products.findMany({
    columns: { id: true, sku: true, name: true },
  });
  const productBySku = new Map(allProducts.map((p) => [p.sku, p]));

  type PlanRow = {
    row: ProductRow;
    product: { id: string; sku: string; name: string };
    computed: ReturnType<typeof computePricing>;
    facit: { tib: number; bruttopris: number } | undefined;
    mismatch: boolean;
  };

  const plan: PlanRow[] = [];
  const unmatched: ProductRow[] = [];

  for (const row of data.produkter) {
    const sku = baseSku(row);
    const product = productBySku.get(sku);
    if (!product) {
      unmatched.push(row);
      continue;
    }

    const inputs = row.indata[ACTIVE_SCENARIO];
    const facit = row.facit[ACTIVE_SCENARIO];
    const computed = computePricing(
      {
        gmsCreditPriceEur: inputs.inkopspris_eur,
        freightPriceEur: inputs.frakt_eur,
        targetCostRatio: inputs.inkopsandel,
      },
      activeSettings,
    );

    const mismatch =
      !!facit &&
      (Math.abs(computed.tib - facit.tib) > TOLERANCE_SEK ||
        Math.abs(computed.grossPrice - facit.bruttopris) > TOLERANCE_SEK);

    plan.push({ row, product, computed, facit, mismatch });
  }

  console.log('Rader att skriva (product_cost_inputs):\n');
  for (const { row, product, computed, facit, mismatch } of plan) {
    const label = `${product.sku}${row.variant ? ` (${row.variant})` : ''}`.padEnd(24);
    const osaker = row.osaker ? '  ⚠️ OSÄKERT PRIS' : '';
    console.log(
      `  ${label} ${product.name.padEnd(18)} TIB=${formatSek(computed.tib).padEnd(12)} Bruttopris=${formatSek(computed.grossPrice).padEnd(14)}${osaker}`,
    );
    if (row.osakerhetsnot) console.log(`      ↳ ${row.osakerhetsnot}`);
    if (mismatch && facit) {
      console.log(
        `      ⚠️ Avviker från facit: TIB ${formatSek(facit.tib)}, Bruttopris ${formatSek(facit.bruttopris)} — kontrollera indata`,
      );
    }
  }

  if (unmatched.length > 0) {
    console.log('\n❌ Omatchade artikelnummer (ingen produkt med den SKUn i databasen):');
    for (const row of unmatched) {
      console.log(`  ${row.artikelnummer}`);
    }
  }

  const hardMismatches = plan.filter((p) => p.mismatch);
  if (hardMismatches.length > 0) {
    console.log(
      `\n⚠️  ${hardMismatches.length} rad(er) avviker från facit i JSON-filen — dubbelkolla indata innan du kör --write.`,
    );
  }

  if (!shouldWrite) {
    console.log(
      '\n(dry run — kör med --write för att skriva pricing_settings + product_cost_inputs)',
    );
    process.exit(0);
  }

  console.log('\nSkriver...');

  const settingsIds: Record<string, string> = {};
  for (const [label, params] of Object.entries(data.parametrar)) {
    const isActive = label === ACTIVE_SCENARIO;
    const existing = await db.query.pricingSettings.findFirst({
      where: eq(schema.pricingSettings.label, label),
    });
    if (existing) {
      await db
        .update(schema.pricingSettings)
        .set({
          eurToSekRate: String(params.eur_kurs),
          freightMarkupMultiplier: String(params.fraktpaslag),
          resellerMarkupMultiplier: String(params.fikpaslag),
          isActive,
          updatedAt: new Date(),
        })
        .where(eq(schema.pricingSettings.id, existing.id));
      settingsIds[label] = existing.id;
    } else {
      const [inserted] = await db
        .insert(schema.pricingSettings)
        .values({
          label,
          eurToSekRate: String(params.eur_kurs),
          freightMarkupMultiplier: String(params.fraktpaslag),
          resellerMarkupMultiplier: String(params.fikpaslag),
          isActive,
        })
        .returning({ id: schema.pricingSettings.id });
      settingsIds[label] = inserted.id;
    }
  }
  console.log(
    `  pricing_settings: ${Object.keys(settingsIds).length} rad(er) uppdaterade/skapade.`,
  );

  const activeSettingsId = settingsIds[ACTIVE_SCENARIO];
  let written = 0;
  for (const { row, product } of plan) {
    const inputs = row.indata[ACTIVE_SCENARIO];
    const variantLabel = row.variant;
    const existing = await db.query.productCostInputs.findFirst({
      where: variantLabel
        ? and(
            eq(schema.productCostInputs.productId, product.id),
            eq(schema.productCostInputs.variantLabel, variantLabel),
          )
        : and(
            eq(schema.productCostInputs.productId, product.id),
            isNull(schema.productCostInputs.variantLabel),
          ),
    });

    const values = {
      gmsCreditPriceEur: String(inputs.inkopspris_eur),
      freightPriceEur: String(inputs.frakt_eur),
      targetCostRatio: String(inputs.inkopsandel),
      pricingSettingsId: activeSettingsId,
      isUncertain: row.osaker,
      notes: row.osaker ? row.osakerhetsnot : null,
    };

    if (existing) {
      await db
        .update(schema.productCostInputs)
        .set({ ...values, updatedAt: new Date() })
        .where(eq(schema.productCostInputs.id, existing.id));
    } else {
      await db.insert(schema.productCostInputs).values({
        productId: product.id,
        variantLabel,
        ...values,
      });
    }
    written++;
  }

  console.log(`  product_cost_inputs: ${written} rad(er) uppdaterade/skapade.`);
  console.log('\nKlart. Granska resultatet på /admin/priser.');
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

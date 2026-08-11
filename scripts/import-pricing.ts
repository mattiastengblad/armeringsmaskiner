/**
 * One-time import script: reads the "Data" sheet of
 * GMS-kalkyler till AI 20210719 1.xlsx, maps each row to a catalog product
 * via src/lib/pricing-import/model-mapping.ts, runs computePricing() on it,
 * and prints a report.
 *
 * Never imports from the "Dags" sheet — that tab is example-only per the
 * workbook's own header ("ÄNDRA INGET I DENNA FLIK. DEN ÄR BARA EXEMPEL.").
 *
 * Rows are only written to product_cost_inputs when BOTH:
 *   1. mapping.approved === true (Per has signed off on that row), AND
 *   2. --write was passed AND DATABASE_URL points to a real, reachable DB
 *      with the product already seeded (not yet true as of writing this —
 *      the real Supabase project doesn't exist yet).
 * Otherwise this is a dry run: report only, nothing is written.
 *
 * Usage:
 *   pnpm tsx scripts/import-pricing.ts "/path/to/GMS-kalkyler till AI 20210719 1.xlsx"
 *   pnpm tsx scripts/import-pricing.ts "/path/to/file.xlsx" --write
 */
import XLSX from 'xlsx';
import { computePricing, type PricingSettings } from '../src/lib/pricing';
import {
  EXCEL_MODEL_MAPPING,
  PRODUCTS_WITHOUT_EXCEL_PRICING,
} from '../src/lib/pricing-import/model-mapping';

const DATA_SHEET_NAME = 'Data';
const VALUES_SHEET_NAME = 'Värden';
const DATA_FIRST_ROW = 5; // 1-indexed row where model data starts (row 4 is the header)
const DATA_LAST_ROW = 16;

interface ParsedRow {
  excelModelName: string;
  gmsCreditPriceEur: number;
  freightPriceEur: number;
  targetCostRatio: number;
}

function readBasSettings(sheet: XLSX.WorkSheet): PricingSettings {
  const json = XLSX.utils.sheet_to_json<(string | number)[]>(sheet, { header: 1, raw: true });
  // "Värden" layout: row 2 = ["", "€", 11], row 3 = ["", "Fraktpåslag", 1.3], row 4 = ["", "FIKpåslag", 1.2]
  const eurToSekRate = Number(json[1]?.[2]);
  const freightMarkupMultiplier = Number(json[2]?.[2]);
  const resellerMarkupMultiplier = Number(json[3]?.[2]);

  if (![eurToSekRate, freightMarkupMultiplier, resellerMarkupMultiplier].every(Number.isFinite)) {
    throw new Error('Could not read Bas settings from Värden sheet — check its layout.');
  }

  return { eurToSekRate, freightMarkupMultiplier, resellerMarkupMultiplier };
}

function readDataRows(sheet: XLSX.WorkSheet): ParsedRow[] {
  const json = XLSX.utils.sheet_to_json<(string | number)[]>(sheet, { header: 1, raw: true });
  const rows: ParsedRow[] = [];

  for (let excelRow = DATA_FIRST_ROW; excelRow <= DATA_LAST_ROW; excelRow++) {
    const row = json[excelRow - 1]; // sheet_to_json is 0-indexed
    if (!row || row[0] === '' || row[0] === undefined) continue;

    rows.push({
      excelModelName: String(row[0]).trim(),
      gmsCreditPriceEur: Number(row[1]), // column B
      freightPriceEur: Number(row[3]), // column D
      targetCostRatio: Number(row[6]), // column G
    });
  }

  return rows;
}

function formatSek(n: number): string {
  return new Intl.NumberFormat('sv-SE', { maximumFractionDigits: 0 }).format(n) + ' kr';
}

async function main() {
  const filePath = process.argv[2];
  const shouldWrite = process.argv.includes('--write');

  if (!filePath) {
    console.error('Usage: pnpm tsx scripts/import-pricing.ts "<path-to-xlsx>" [--write]');
    process.exit(1);
  }

  const workbook = XLSX.readFile(filePath);
  const dataSheet = workbook.Sheets[DATA_SHEET_NAME];
  const valuesSheet = workbook.Sheets[VALUES_SHEET_NAME];

  if (!dataSheet || !valuesSheet) {
    console.error(`Expected sheets "${DATA_SHEET_NAME}" and "${VALUES_SHEET_NAME}" in workbook.`);
    process.exit(1);
  }

  const basSettings = readBasSettings(valuesSheet);
  const rows = readDataRows(dataSheet);

  console.log(
    `\nRead ${rows.length} model rows from "${DATA_SHEET_NAME}" (Bas settings: € ${basSettings.eurToSekRate}, frakt ×${basSettings.freightMarkupMultiplier}, FIK ×${basSettings.resellerMarkupMultiplier}).\n`,
  );

  const unmatched: ParsedRow[] = [];
  const pendingApproval: { row: ParsedRow; mapping: (typeof EXCEL_MODEL_MAPPING)[number] }[] = [];
  const readyToWrite: { row: ParsedRow; mapping: (typeof EXCEL_MODEL_MAPPING)[number] }[] = [];

  for (const row of rows) {
    const mapping = EXCEL_MODEL_MAPPING.find((m) => m.excelModelName === row.excelModelName);

    if (!mapping || !mapping.productSlug) {
      unmatched.push(row);
      continue;
    }

    if (!mapping.approved) {
      pendingApproval.push({ row, mapping });
      continue;
    }

    readyToWrite.push({ row, mapping });
  }

  function printRow(row: ParsedRow, label: string) {
    const pricing = computePricing(
      {
        gmsCreditPriceEur: row.gmsCreditPriceEur,
        freightPriceEur: row.freightPriceEur,
        targetCostRatio: row.targetCostRatio,
      },
      basSettings,
    );
    console.log(
      `  ${row.excelModelName.padEnd(28)} → ${label.padEnd(14)} TIB=${formatSek(pricing.tib).padEnd(12)} Bruttopris=${formatSek(pricing.grossPrice).padEnd(14)} Kaper(FIK)=${formatSek(pricing.resellerCostPrice)}`,
    );
  }

  console.log('✅ Redo att skriva (approved: true):');
  if (readyToWrite.length === 0) {
    console.log(
      '  (inga rader — flippa `approved: true` i model-mapping.ts när Per godkänt en rad)',
    );
  }
  for (const { row, mapping } of readyToWrite) {
    printRow(
      row,
      mapping.productSlug! + (mapping.variantLabel ? ` (${mapping.variantLabel})` : ''),
    );
  }

  console.log('\n⏳ Väntar på godkännande (mappad, men approved: false):');
  for (const { row, mapping } of pendingApproval) {
    printRow(
      row,
      mapping.productSlug! + (mapping.variantLabel ? ` (${mapping.variantLabel})` : ''),
    );
    if (mapping.notes) console.log(`      ↳ ${mapping.notes}`);
  }

  if (unmatched.length > 0) {
    console.log('\n❌ Omatchade Excel-rader (finns ingen mapping-post):');
    for (const row of unmatched) {
      console.log(`  ${row.excelModelName}`);
    }
  }

  console.log('\n⚠️  Produkter på sajten utan kostnadsunderlag i Excel:');
  for (const slug of PRODUCTS_WITHOUT_EXCEL_PRICING) {
    console.log(
      `  ${slug} — inget pris kan räknas ut förrän Per ger GMS Kreditpris €/Frakt €/Påslag`,
    );
  }

  if (!shouldWrite) {
    console.log(
      '\n(dry run — kör med --write för att försöka skriva product_cost_inputs för godkända rader)',
    );
    return;
  }

  if (readyToWrite.length === 0) {
    console.log('\nInget att skriva — inga rader är godkända än.');
    return;
  }

  const databaseUrl = process.env.DATABASE_URL ?? '';
  if (databaseUrl.includes('YOUR-PROJECT') || databaseUrl.includes('YOUR-PASSWORD')) {
    console.log(
      '\n❌ DATABASE_URL är fortfarande platshållarvärdet i .env.local — inget riktigt Supabase-projekt att skriva till än. Skippar skrivning.',
    );
    return;
  }

  console.log(
    '\n❌ TODO: DB-skrivning är inte implementerad än — kräver att produkterna redan finns seedade i en riktig Supabase-databas (matchande slugs), så deras UUID kan slås upp. Kör seed-scriptet för produkter först.',
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

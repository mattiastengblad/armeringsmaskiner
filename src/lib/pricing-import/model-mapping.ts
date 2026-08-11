/**
 * Maps each model row on the Excel "Data" sheet (GMS-kalkyler till AI
 * 20210719 1.xlsx) to a product in our catalog. This is the mapping table
 * called for in the pricing spec (section 3) — Claude Code filled it in
 * preliminarily, but `approved` must be flipped to `true` per row (by Per,
 * since he owns the real dealership numbers) before scripts/import-pricing.ts
 * will write any product_cost_inputs from that row. Until approved, the
 * import script only reports what it *would* do.
 *
 * Rows that don't appear here (Power 24, H 45 High) have no cost basis in
 * the Excel workbook at all — they're not missing a mapping, there's simply
 * nothing to map to. Those products keep price_ex_vat / list_price_sek null
 * ("ring för pris") until Per provides GMS Kreditpris/Frakt/Påslag for them.
 */

export interface ExcelModelMapping {
  /** Exact text in column A of the "Data" sheet. */
  excelModelName: string;
  /** Slug in our catalog (src/lib/mock/catalog.ts), or null if genuinely unmatched. */
  productSlug: string | null;
  /** e.g. "220V" / "380V" when one product has multiple Excel rows (voltage variants). */
  variantLabel: string | null;
  /** Must be true before scripts/import-pricing.ts will write this row's cost inputs. */
  approved: boolean;
  notes: string | null;
}

export const EXCEL_MODEL_MAPPING: ExcelModelMapping[] = [
  {
    excelModelName: 'MG 20 B - 220V',
    productSlug: 'mg-20-b',
    variantLabel: '220V',
    approved: false,
    notes:
      'Excel prissätter bara "MG 20" (3-fas). MG 16 (1-fas, egen produkt sedan katalogsplitten 2026-08-11) saknar kostnadsunderlag helt.',
  },
  {
    excelModelName: 'MG 20 B - 380V',
    productSlug: 'mg-20-b',
    variantLabel: '380V',
    approved: false,
    notes: null,
  },
  {
    excelModelName: 'MG 20 BD - 220V',
    productSlug: 'mg-20-bd',
    variantLabel: '220V',
    approved: false,
    notes: 'Excel prissätter bara "MG 20" (3-fas). MG 16 BD saknar kostnadsunderlag helt.',
  },
  {
    excelModelName: 'MG 20 BD - 380V',
    productSlug: 'mg-20-bd',
    variantLabel: '380V',
    approved: false,
    notes: null,
  },
  {
    excelModelName: 'BD 26 (gissat pris, ej i lista)',
    productSlug: 'bd-26',
    variantLabel: null,
    approved: false,
    notes: 'Per har själv flaggat priset som gissat och inte i den officiella GMS-prislistan.',
  },
  {
    excelModelName: 'BD 36 (BSD 36 i prislista)',
    productSlug: 'bd-36',
    variantLabel: null,
    approved: false,
    notes: 'Kallas "BSD 36" i GMS officiella prislista.',
  },
  {
    excelModelName: 'BD 45 (BSD 45 i prislista)',
    productSlug: 'bd-45',
    variantLabel: null,
    approved: false,
    notes: 'Kallas "BSD 45" i GMS officiella prislista.',
  },
  {
    excelModelName: 'H 26',
    productSlug: 'h-26',
    variantLabel: null,
    approved: false,
    notes:
      'Finns i Excel men marknadsfördes inte på gamla publika sajten. Tillagd som opublicerad produkt 2026-08-11 efter beslut med Mattias — invänta Pers godkännande innan ev. publicering.',
  },
  {
    excelModelName: 'H 38 S',
    productSlug: 'h-38-s',
    variantLabel: null,
    approved: false,
    notes: 'Rakt namnmatchning, ingen känd ambiguitet.',
  },
  {
    excelModelName: 'H 45 (H 45 S i prislista)',
    productSlug: 'h-45-s',
    variantLabel: null,
    approved: false,
    notes: 'Kallas "H 45 S" i GMS officiella prislista, matchar sajtens H 45 S.',
  },
  {
    excelModelName: 'M 36',
    productSlug: 'm-36',
    variantLabel: null,
    approved: false,
    notes: 'Rakt namnmatchning, ingen känd ambiguitet.',
  },
  {
    excelModelName: 'M 45',
    productSlug: 'm-45',
    variantLabel: null,
    approved: false,
    notes: 'Rakt namnmatchning, ingen känd ambiguitet.',
  },
];

/**
 * Products in the catalog that appear on the public site but have no row
 * anywhere in the Excel workbook — not a mapping gap, there's simply no
 * cost data for them yet. Listed here so the import report surfaces them
 * explicitly instead of silently leaving them unpriced.
 */
export const PRODUCTS_WITHOUT_EXCEL_PRICING = ['power-24', 'h-45-high'];

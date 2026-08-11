/**
 * Reimplements the "GMS-kalkyler till AI 20210719 1.xlsx" workbook as code
 * (Data/Dags sheets), so a single change to `PricingSettings` recomputes
 * every product's price instead of requiring a manual spreadsheet pass.
 *
 * Discount tiers are 10/20/25/30/40/50% — verified cell-by-cell against the
 * workbook. Its header row labels the last two columns "45%v" / "Rab. 40%
 * TG", but the actual formulas in every data row compute 50% of Bruttopris
 * at that position (e.g. row 5 "MG 20 B - 220V": 49426.67 * 0.5 = 24713.33,
 * matching the sheet exactly). There is no 45% tier in the live workbook —
 * those labels are a stale leftover from an earlier version.
 */

export const DISCOUNT_TIERS = [0.1, 0.2, 0.25, 0.3, 0.4, 0.5] as const;

export interface PricingSettings {
  /** Värden!C4 / Värden!C8 — SEK per EUR. */
  eurToSekRate: number;
  /** Värden!C5 / Värden!C9 — e.g. 1.3 for +30%, 1.0 for no markup. */
  freightMarkupMultiplier: number;
  /** Värden!C6 / Värden!C10 — reseller (Kaper) markup on TIB, e.g. 1.2 for +20%. */
  resellerMarkupMultiplier: number;
}

export interface CostInputs {
  /** Column B — GMS Kreditpris €. */
  gmsCreditPriceEur: number;
  /** Column D — Frakt enl typoffert €. */
  freightPriceEur: number;
  /** Column G — "Påslag" på TIB, e.g. 0.375. Per-product, not a global constant. */
  targetCostRatio: number;
}

export interface DiscountTierResult {
  discountPct: number;
  discountValue: number;
  netPrice: number;
  marginRatio: number;
}

export interface PricingResult {
  /** Column C — GMS Kreditpris SEK. */
  creditPriceSek: number;
  /** Column E — Standard fraktpris SEK. */
  freightSek: number;
  /** Column F — TIB (Totalt In-pris Budget). */
  tib: number;
  /** Column H — Bruttopris (list price). */
  grossPrice: number;
  discountTiers: DiscountTierResult[];
  /** Column AB — FIK (Fast In-pris Kaper), the reseller's cost price. */
  resellerCostPrice: number;
  /** Column AC — Kaper Bruttopris (same list price, reseller's TG is measured against it). */
  resellerGrossPrice: number;
  /** Column AD — Kaper Brutto TG. */
  resellerMarginRatio: number;
}

export function computePricing(inputs: CostInputs, settings: PricingSettings): PricingResult {
  const creditPriceSek = inputs.gmsCreditPriceEur * settings.eurToSekRate;
  const freightSek =
    inputs.freightPriceEur * settings.eurToSekRate * settings.freightMarkupMultiplier;
  const tib = creditPriceSek + freightSek;
  const grossPrice = tib / inputs.targetCostRatio;

  const discountTiers = DISCOUNT_TIERS.map((discountPct) => {
    const discountValue = grossPrice * discountPct;
    const netPrice = grossPrice - discountValue;
    const marginRatio = 1 - tib / netPrice;
    return { discountPct, discountValue, netPrice, marginRatio };
  });

  const resellerCostPrice = tib * settings.resellerMarkupMultiplier;
  const resellerGrossPrice = grossPrice;
  const resellerMarginRatio = 1 - resellerCostPrice / resellerGrossPrice;

  return {
    creditPriceSek,
    freightSek,
    tib,
    grossPrice,
    discountTiers,
    resellerCostPrice,
    resellerGrossPrice,
    resellerMarginRatio,
  };
}

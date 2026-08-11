import { describe, expect, it } from 'vitest';
import { computePricing, DISCOUNT_TIERS, type PricingSettings } from '@/lib/pricing';

// Fixtures below are read directly, cell by cell, from
// "GMS-kalkyler till AI 20210719 1.xlsx" (Värden / Data / Dags sheets) —
// not recomputed by hand. Precision matches the sheet's IEEE-754 doubles.

const BAS_SETTINGS: PricingSettings = {
  eurToSekRate: 11,
  freightMarkupMultiplier: 1.3,
  resellerMarkupMultiplier: 1.2,
};

const DAGS_SETTINGS: PricingSettings = {
  eurToSekRate: 10.25,
  freightMarkupMultiplier: 1,
  resellerMarkupMultiplier: 1.2,
};

describe('computePricing', () => {
  it('uses the 10/20/25/30/40/50% tiers actually computed by the workbook', () => {
    // The sheet's header row labels the last pair of columns "45%v" /
    // "Rab. 40% TG", but every data row computes 50% of Bruttopris at that
    // position (verified against all 12 model rows on both sheets) — there
    // is no live 45% tier, the label is stale.
    expect(DISCOUNT_TIERS).toEqual([0.1, 0.2, 0.25, 0.3, 0.4, 0.5]);
  });

  it('matches the Data ("Bas") sheet for MG 20 B - 220V', () => {
    const result = computePricing(
      { gmsCreditPriceEur: 1035, freightPriceEur: 500, targetCostRatio: 0.375 },
      BAS_SETTINGS,
    );

    expect(result.creditPriceSek).toBeCloseTo(11385, 9);
    expect(result.freightSek).toBeCloseTo(7150, 9);
    expect(result.tib).toBeCloseTo(18535, 9);
    expect(result.grossPrice).toBeCloseTo(49426.666666666664, 9);
    expect(result.resellerCostPrice).toBeCloseTo(22242, 9);
    expect(result.resellerGrossPrice).toBeCloseTo(49426.666666666664, 9);
    expect(result.resellerMarginRatio).toBeCloseTo(0.55, 9);

    const expectedTiers = [
      {
        discountPct: 0.1,
        discountValue: 4942.666666666667,
        netPrice: 44484,
        marginRatio: 0.5833333333333334,
      },
      {
        discountPct: 0.2,
        discountValue: 9885.333333333334,
        netPrice: 39541.33333333333,
        marginRatio: 0.53125,
      },
      { discountPct: 0.25, discountValue: 12356.666666666666, netPrice: 37070, marginRatio: 0.5 },
      {
        discountPct: 0.3,
        discountValue: 14827.999999999998,
        netPrice: 34598.666666666664,
        marginRatio: 0.4642857142857143,
      },
      {
        discountPct: 0.4,
        discountValue: 19770.666666666668,
        netPrice: 29655.999999999996,
        marginRatio: 0.3749999999999999,
      },
      {
        discountPct: 0.5,
        discountValue: 24713.333333333332,
        netPrice: 24713.333333333332,
        marginRatio: 0.25,
      },
    ];

    expectedTiers.forEach((expected, i) => {
      expect(result.discountTiers[i].discountPct).toBe(expected.discountPct);
      expect(result.discountTiers[i].discountValue).toBeCloseTo(expected.discountValue, 9);
      expect(result.discountTiers[i].netPrice).toBeCloseTo(expected.netPrice, 9);
      expect(result.discountTiers[i].marginRatio).toBeCloseTo(expected.marginRatio, 9);
    });
  });

  it('matches the "Dags" sheet for MG 20 B - 220V (different constants AND different cost inputs)', () => {
    const result = computePricing(
      { gmsCreditPriceEur: 978, freightPriceEur: 500, targetCostRatio: 0.307 },
      DAGS_SETTINGS,
    );

    expect(result.creditPriceSek).toBeCloseTo(10024.5, 9);
    expect(result.freightSek).toBeCloseTo(5125, 9);
    expect(result.tib).toBeCloseTo(15149.5, 9);
    expect(result.grossPrice).toBeCloseTo(49346.905537459286, 9);
    expect(result.resellerCostPrice).toBeCloseTo(18179.399999999998, 9);
    expect(result.resellerGrossPrice).toBeCloseTo(49346.905537459286, 9);
    expect(result.resellerMarginRatio).toBeCloseTo(0.6316, 4);

    const expectedTiers = [
      {
        discountValue: 4934.690553745929,
        netPrice: 44412.214983713355,
        marginRatio: 0.6588888888888889,
      },
      { discountValue: 9869.381107491858, netPrice: 39477.52442996743, marginRatio: 0.61625 },
      {
        discountValue: 12336.726384364822,
        netPrice: 37010.17915309446,
        marginRatio: 0.5906666666666667,
      },
      {
        discountValue: 14804.071661237786,
        netPrice: 34542.8338762215,
        marginRatio: 0.5614285714285714,
      },
      {
        discountValue: 19738.762214983715,
        netPrice: 29608.14332247557,
        marginRatio: 0.4883333333333334,
      },
      { discountValue: 24673.452768729643, netPrice: 24673.452768729643, marginRatio: 0.386 },
    ];

    expectedTiers.forEach((expected, i) => {
      expect(result.discountTiers[i].discountValue).toBeCloseTo(expected.discountValue, 9);
      expect(result.discountTiers[i].netPrice).toBeCloseTo(expected.netPrice, 9);
      expect(result.discountTiers[i].marginRatio).toBeCloseTo(expected.marginRatio, 6);
    });
  });

  it('matches the Data ("Bas") sheet for BD 36', () => {
    const result = computePricing(
      { gmsCreditPriceEur: 2295, freightPriceEur: 550, targetCostRatio: 0.3 },
      BAS_SETTINGS,
    );

    expect(result.creditPriceSek).toBeCloseTo(25245, 9);
    expect(result.freightSek).toBeCloseTo(7865, 9);
    expect(result.tib).toBeCloseTo(33110, 9);
    expect(result.grossPrice).toBeCloseTo(110366.66666666667, 9);
    expect(result.resellerCostPrice).toBeCloseTo(39732, 9);
    expect(result.resellerMarginRatio).toBeCloseTo(0.64, 9);

    const expectedTiers = [
      { discountValue: 11036.666666666668, netPrice: 99330, marginRatio: 0.6666666666666667 },
      { discountValue: 22073.333333333336, netPrice: 88293.33333333334, marginRatio: 0.625 },
      { discountValue: 27591.666666666668, netPrice: 82775, marginRatio: 0.6 },
      { discountValue: 33110, netPrice: 77256.66666666667, marginRatio: 0.5714285714285714 },
      { discountValue: 44146.66666666667, netPrice: 66220, marginRatio: 0.5 },
      { discountValue: 55183.333333333336, netPrice: 55183.333333333336, marginRatio: 0.4 },
    ];

    expectedTiers.forEach((expected, i) => {
      expect(result.discountTiers[i].discountValue).toBeCloseTo(expected.discountValue, 9);
      expect(result.discountTiers[i].netPrice).toBeCloseTo(expected.netPrice, 9);
      expect(result.discountTiers[i].marginRatio).toBeCloseTo(expected.marginRatio, 9);
    });
  });
});

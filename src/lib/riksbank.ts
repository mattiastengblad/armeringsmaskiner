/**
 * Fetches the Riksbank's latest published EUR/SEK mid rate (series
 * SEKEURPMI) from the open SWEA API. Shown on /admin/priser as a reference
 * next to the budget rate — it is never written to `pricing_settings`
 * automatically, so a currency move can't silently reprice the site.
 */

/** Safety margin added on top of the Riksbank rate when it's used as the budget rate. */
export const BUDGET_RATE_MARGIN = 0.02;

const LATEST_EUR_SEK_URL = 'https://api.riksbank.se/swea/v1/Observations/Latest/SEKEURPMI';

export interface RiksbankRate {
  /** Observation date, YYYY-MM-DD. The Riksbank publishes on bank days only. */
  date: string;
  /** SEK per EUR. */
  value: number;
}

export function parseRiksbankObservation(json: unknown): RiksbankRate | null {
  if (typeof json !== 'object' || json === null) return null;
  const { date, value } = json as Record<string, unknown>;
  if (typeof date !== 'string' || typeof value !== 'number' || !Number.isFinite(value)) {
    return null;
  }
  return { date, value };
}

/** Riksbank rate plus BUDGET_RATE_MARGIN, rounded to the form's 0.01 step. */
export function budgetRateFromRiksbank(rate: number): number {
  return Math.round(rate * (1 + BUDGET_RATE_MARGIN) * 100) / 100;
}

/** Returns null instead of throwing so the admin page still renders if the API is down. */
export async function fetchLatestEurSekRate(): Promise<RiksbankRate | null> {
  try {
    const response = await fetch(LATEST_EUR_SEK_URL, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return null;
    return parseRiksbankObservation(await response.json());
  } catch {
    return null;
  }
}

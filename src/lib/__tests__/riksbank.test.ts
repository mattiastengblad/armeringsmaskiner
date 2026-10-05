import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  budgetRateFromRiksbank,
  fetchLatestEurSekRate,
  parseRiksbankObservation,
} from '@/lib/riksbank';

describe('budgetRateFromRiksbank', () => {
  it('adds a 2% margin rounded to two decimals', () => {
    expect(budgetRateFromRiksbank(11.29)).toBe(11.52);
    expect(budgetRateFromRiksbank(11)).toBe(11.22);
  });
});

describe('parseRiksbankObservation', () => {
  it('parses a SWEA observation', () => {
    expect(parseRiksbankObservation({ date: '2026-10-02', value: 11.29 })).toEqual({
      date: '2026-10-02',
      value: 11.29,
    });
  });

  it('rejects malformed payloads', () => {
    expect(parseRiksbankObservation(null)).toBeNull();
    expect(parseRiksbankObservation([])).toBeNull();
    expect(parseRiksbankObservation({ date: '2026-10-02', value: '11.29' })).toBeNull();
    expect(parseRiksbankObservation({ value: 11.29 })).toBeNull();
  });
});

describe('fetchLatestEurSekRate', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('returns null when the API responds with an error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 503 })));
    expect(await fetchLatestEurSekRate()).toBeNull();
  });

  it('returns null when the request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));
    expect(await fetchLatestEurSekRate()).toBeNull();
  });

  it('returns the parsed rate on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(Response.json({ date: '2026-10-02', value: 11.29 })),
    );
    expect(await fetchLatestEurSekRate()).toEqual({ date: '2026-10-02', value: 11.29 });
  });
});

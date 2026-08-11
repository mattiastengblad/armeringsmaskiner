'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { upsertActivePricingSettings } from '@/lib/actions/admin-pricing';

export function PricingSettingsForm({
  initial,
}: {
  initial: {
    eurToSekRate: string;
    freightMarkupMultiplier: string;
    resellerMarkupMultiplier: string;
  } | null;
}) {
  const [eurToSekRate, setEurToSekRate] = useState(initial?.eurToSekRate ?? '11');
  const [freightMarkupMultiplier, setFreightMarkupMultiplier] = useState(
    initial?.freightMarkupMultiplier ?? '1.3',
  );
  const [resellerMarkupMultiplier, setResellerMarkupMultiplier] = useState(
    initial?.resellerMarkupMultiplier ?? '1.2',
  );
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setSaved(false);
        startTransition(async () => {
          await upsertActivePricingSettings({
            eurToSekRate: Number(eurToSekRate),
            freightMarkupMultiplier: Number(freightMarkupMultiplier),
            resellerMarkupMultiplier: Number(resellerMarkupMultiplier),
          });
          setSaved(true);
        });
      }}
      className="grid max-w-xl gap-4 sm:grid-cols-3"
    >
      <div>
        <Label htmlFor="eur-rate">€ → SEK-kurs</Label>
        <Input
          id="eur-rate"
          type="number"
          step="0.01"
          value={eurToSekRate}
          onChange={(e) => setEurToSekRate(e.target.value)}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="freight-markup">Fraktpåslag (×)</Label>
        <Input
          id="freight-markup"
          type="number"
          step="0.01"
          value={freightMarkupMultiplier}
          onChange={(e) => setFreightMarkupMultiplier(e.target.value)}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="reseller-markup">FIK-påslag (×)</Label>
        <Input
          id="reseller-markup"
          type="number"
          step="0.01"
          value={resellerMarkupMultiplier}
          onChange={(e) => setResellerMarkupMultiplier(e.target.value)}
          className="mt-1"
        />
      </div>
      <div className="sm:col-span-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Sparar…' : 'Spara inställningar'}
        </Button>
        {saved && <span className="text-muted-foreground ml-3 text-sm">Sparat.</span>}
      </div>
    </form>
  );
}

'use client';

import { useMemo, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TableCell, TableRow } from '@/components/ui/table';
import { computePricing, type PricingSettings } from '@/lib/pricing';
import { upsertProductCostInput } from '@/lib/actions/admin-pricing';

const sekFormatter = new Intl.NumberFormat('sv-SE', { maximumFractionDigits: 0 });

export function ProductCostRow({
  product,
  initial,
  pricingSettings,
}: {
  product: { id: string; name: string; sku: string };
  initial: { gmsCreditPriceEur: string; freightPriceEur: string; targetCostRatio: string } | null;
  pricingSettings: PricingSettings | null;
}) {
  const [gmsCreditPriceEur, setGmsCreditPriceEur] = useState(initial?.gmsCreditPriceEur ?? '');
  const [freightPriceEur, setFreightPriceEur] = useState(initial?.freightPriceEur ?? '');
  const [targetCostRatio, setTargetCostRatio] = useState(initial?.targetCostRatio ?? '');
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const computed = useMemo(() => {
    if (!pricingSettings) return null;
    const credit = Number(gmsCreditPriceEur);
    const freight = Number(freightPriceEur);
    const ratio = Number(targetCostRatio);
    if (!credit || !freight || !ratio) return null;
    return computePricing(
      { gmsCreditPriceEur: credit, freightPriceEur: freight, targetCostRatio: ratio },
      pricingSettings,
    );
  }, [gmsCreditPriceEur, freightPriceEur, targetCostRatio, pricingSettings]);

  return (
    <TableRow>
      <TableCell>
        <div className="font-medium">{product.name}</div>
        <div className="text-muted-foreground text-xs">{product.sku}</div>
      </TableCell>
      <TableCell>
        <Input
          type="number"
          step="0.01"
          value={gmsCreditPriceEur}
          onChange={(e) => setGmsCreditPriceEur(e.target.value)}
          className="w-24"
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          step="0.01"
          value={freightPriceEur}
          onChange={(e) => setFreightPriceEur(e.target.value)}
          className="w-24"
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          step="0.001"
          value={targetCostRatio}
          onChange={(e) => setTargetCostRatio(e.target.value)}
          className="w-24"
        />
      </TableCell>
      <TableCell className="text-sm">
        {computed ? `${sekFormatter.format(computed.tib)} kr` : '–'}
      </TableCell>
      <TableCell className="text-sm">
        {computed ? `${sekFormatter.format(computed.grossPrice)} kr` : '–'}
      </TableCell>
      <TableCell className="text-sm">
        {computed ? `${sekFormatter.format(computed.resellerCostPrice)} kr` : '–'}
      </TableCell>
      <TableCell>
        <Button
          size="sm"
          disabled={isPending || !pricingSettings}
          onClick={() => {
            setSaved(false);
            startTransition(async () => {
              await upsertProductCostInput(product.id, {
                gmsCreditPriceEur: Number(gmsCreditPriceEur),
                freightPriceEur: Number(freightPriceEur),
                targetCostRatio: Number(targetCostRatio),
              });
              setSaved(true);
            });
          }}
        >
          {isPending ? 'Sparar…' : 'Spara'}
        </Button>
        {saved && <div className="text-muted-foreground mt-1 text-xs">Sparat</div>}
      </TableCell>
    </TableRow>
  );
}

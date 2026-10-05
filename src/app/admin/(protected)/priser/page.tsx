import type { Metadata } from 'next';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import * as schema from '@/lib/db/schema';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PricingSettingsForm } from '@/components/admin/pricing-settings-form';
import { ProductCostRow } from '@/components/admin/product-cost-row';
import { fetchLatestEurSekRate } from '@/lib/riksbank';

export const metadata: Metadata = {
  title: 'Priser',
  robots: { index: false, follow: false },
};

export default async function AdminPricingPage() {
  const [settings, products, costInputs, riksbankRate] = await Promise.all([
    db.query.pricingSettings.findFirst({ where: eq(schema.pricingSettings.isActive, true) }),
    db.query.products.findMany({
      columns: { id: true, name: true, sku: true },
      orderBy: (products, { asc }) => [asc(products.name)],
    }),
    db.query.productCostInputs.findMany(),
    fetchLatestEurSekRate(),
  ]);

  const costInputByProductId = new Map(costInputs.map((row) => [row.productId, row]));
  const missingCostCount = products.filter((p) => !costInputByProductId.has(p.id)).length;

  const pricingSettings = settings
    ? {
        eurToSekRate: Number(settings.eurToSekRate),
        freightMarkupMultiplier: Number(settings.freightMarkupMultiplier),
        resellerMarkupMultiplier: Number(settings.resellerMarkupMultiplier),
      }
    : null;

  return (
    <div className="space-y-10">
      <section>
        <h1 className="mb-1 text-xl font-semibold">Prisinställningar</h1>
        <p className="text-muted-foreground mb-4 text-sm">
          Motsvarar fliken &quot;Värden&quot; i GMS-kalkylen. En ändring här räknar om alla
          produktpriser nedan direkt.
        </p>
        <PricingSettingsForm
          initial={
            settings
              ? {
                  eurToSekRate: settings.eurToSekRate,
                  freightMarkupMultiplier: settings.freightMarkupMultiplier,
                  resellerMarkupMultiplier: settings.resellerMarkupMultiplier,
                }
              : null
          }
          riksbankRate={riksbankRate}
        />
      </section>

      <section>
        <div className="mb-4 flex items-center gap-3">
          <h2 className="text-xl font-semibold">Produktpriser</h2>
          {missingCostCount > 0 && (
            <Badge variant="outline">{missingCostCount} produkter saknar kostnadsdata</Badge>
          )}
        </div>
        {!pricingSettings && (
          <p className="text-muted-foreground text-sm">
            Spara prisinställningarna ovan innan du lägger till produktpriser.
          </p>
        )}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produkt</TableHead>
              <TableHead>GMS Kreditpris €</TableHead>
              <TableHead>Frakt €</TableHead>
              <TableHead>Påslag (TIB-kvot)</TableHead>
              <TableHead>TIB</TableHead>
              <TableHead>Bruttopris</TableHead>
              <TableHead>Kaper-pris</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const costInput = costInputByProductId.get(product.id);
              return (
                <ProductCostRow
                  key={product.id}
                  product={product}
                  pricingSettings={pricingSettings}
                  initial={
                    costInput
                      ? {
                          gmsCreditPriceEur: costInput.gmsCreditPriceEur,
                          freightPriceEur: costInput.freightPriceEur,
                          targetCostRatio: costInput.targetCostRatio,
                        }
                      : null
                  }
                />
              );
            })}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/db';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { STOCK_STATUS_BADGE } from '@/lib/status-labels';

export const metadata: Metadata = {
  title: 'Produkter',
  robots: { index: false, follow: false },
};

export default async function AdminProductsPage() {
  const products = await db.query.products.findMany({
    orderBy: (products, { desc }) => [desc(products.createdAt)],
    with: {
      brand: { columns: { name: true } },
      category: { columns: { name: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-xl font-semibold">Produkter</h1>
        <Button render={<Link href="/admin/produkter/ny" />}>Ny produkt</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Namn</TableHead>
            <TableHead>Artikelnr</TableHead>
            <TableHead>Varumärke</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Publicerad</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const badge = STOCK_STATUS_BADGE[product.stockStatus];
            return (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell className="font-mono text-xs">{product.sku}</TableCell>
                <TableCell>{product.brand?.name}</TableCell>
                <TableCell>{product.category?.name}</TableCell>
                <TableCell>
                  <Badge variant={badge.variant}>{badge.label}</Badge>
                </TableCell>
                <TableCell>{product.isPublished ? 'Ja' : 'Nej'}</TableCell>
              </TableRow>
            );
          })}
          {products.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-muted-foreground text-center">
                Inga produkter ännu.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

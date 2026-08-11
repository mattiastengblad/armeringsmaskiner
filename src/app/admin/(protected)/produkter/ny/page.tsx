import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { ProductForm } from '@/components/admin/product-form';

export const metadata: Metadata = {
  title: 'Ny produkt',
  robots: { index: false, follow: false },
};

export default async function NewProductPage() {
  const [brands, categories] = await Promise.all([
    db.query.brands.findMany({
      columns: { id: true, name: true },
      orderBy: (brands, { asc }) => [asc(brands.name)],
    }),
    db.query.categories.findMany({
      columns: { id: true, name: true },
      orderBy: (categories, { asc }) => [asc(categories.name)],
    }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-xl font-semibold">Ny produkt</h1>
      <ProductForm brands={brands} categories={categories} />
    </div>
  );
}

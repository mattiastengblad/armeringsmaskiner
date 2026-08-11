import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Container } from '@/components/layout/container';
import { ProductCard } from '@/components/product/product-card';
import { getCategories, getCategoryBySlug, getProductsByCategorySlug } from '@/lib/data/catalog';

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category) => ({ category: category.slug }));
}

export async function generateMetadata(
  props: PageProps<'/produkter/[category]'>,
): Promise<Metadata> {
  const { category: categorySlug } = await props.params;
  const category = await getCategoryBySlug(categorySlug);
  if (!category) return {};

  return {
    title: category.metaTitle ?? category.name,
    description: category.metaDescription ?? category.description ?? undefined,
  };
}

export default async function CategoryPage(props: PageProps<'/produkter/[category]'>) {
  const { category: categorySlug } = await props.params;
  const category = await getCategoryBySlug(categorySlug);
  if (!category) notFound();

  const products = await getProductsByCategorySlug(categorySlug);

  return (
    <Container className="py-12">
      <h1 className="text-3xl font-bold tracking-tight">{category.name}</h1>
      {category.description && (
        <p className="text-muted-foreground mt-2 max-w-2xl">{category.description}</p>
      )}

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {products.length === 0 && (
        <p className="text-muted-foreground mt-8">Inga produkter i den här kategorin ännu.</p>
      )}
    </Container>
  );
}

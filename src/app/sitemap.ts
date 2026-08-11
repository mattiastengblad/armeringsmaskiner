import type { MetadataRoute } from 'next';
import { getAllProductSlugsWithCategory, getCategories } from '@/lib/data/catalog';
import { SITE_URL } from '@/lib/site-config';

const STATIC_ROUTES: MetadataRoute.Sitemap = [
  { url: `${SITE_URL}/`, changeFrequency: 'weekly', priority: 1 },
  { url: `${SITE_URL}/dokumentation`, changeFrequency: 'monthly', priority: 0.6 },
  { url: `${SITE_URL}/service`, changeFrequency: 'monthly', priority: 0.6 },
  { url: `${SITE_URL}/kontakt`, changeFrequency: 'monthly', priority: 0.6 },
  { url: `${SITE_URL}/integritetspolicy`, changeFrequency: 'yearly', priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, productSlugs] = await Promise.all([
    getCategories(),
    getAllProductSlugsWithCategory(),
  ]);

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${SITE_URL}/produkter/${category.slug}`,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const productRoutes: MetadataRoute.Sitemap = productSlugs.map(
    ({ categorySlug, productSlug }) => ({
      url: `${SITE_URL}/produkter/${categorySlug}/${productSlug}`,
      changeFrequency: 'weekly',
      priority: 0.7,
    }),
  );

  return [...STATIC_ROUTES, ...categoryRoutes, ...productRoutes];
}

import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Container } from '@/components/layout/container';
import { ContactForm } from '@/components/forms/contact-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CapacityTable } from '@/components/product/capacity-table';
import { DocumentList } from '@/components/product/document-list';
import { SpecTable } from '@/components/product/spec-table';
import { getAllProductSlugsWithCategory, getProductBySlugs } from '@/lib/data/catalog';
import { CONTACT } from '@/lib/nav';
import { absoluteUrl } from '@/lib/site-config';
import type { ProductDetail } from '@/lib/types';

const STOCK_STATUS_LABEL = {
  kontakta_oss: 'Kontakta oss',
  i_lager: 'I lager',
  bestallningsvara: 'Beställningsvara',
} as const;

const SCHEMA_AVAILABILITY = {
  kontakta_oss: 'https://schema.org/PreOrder',
  i_lager: 'https://schema.org/InStock',
  bestallningsvara: 'https://schema.org/BackOrder',
} as const;

function buildProductJsonLd(product: ProductDetail) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription ?? product.description ?? undefined,
    sku: product.sku,
    brand: { '@type': 'Brand', name: product.brand.name },
    image: product.images.map((image) => absoluteUrl(image.url)),
    offers: {
      '@type': 'Offer',
      url: absoluteUrl(`/produkter/${product.category.slug}/${product.slug}`),
      priceCurrency: product.currency,
      ...(product.priceExVat ? { price: product.priceExVat } : {}),
      availability: SCHEMA_AVAILABILITY[product.stockStatus],
    },
  };
}

export async function generateStaticParams() {
  const slugs = await getAllProductSlugsWithCategory();
  return slugs.map(({ categorySlug, productSlug }) => ({
    category: categorySlug,
    product: productSlug,
  }));
}

export async function generateMetadata(
  props: PageProps<'/produkter/[category]/[product]'>,
): Promise<Metadata> {
  const { category, product: productSlug } = await props.params;
  const product = await getProductBySlugs(category, productSlug);
  if (!product) return {};

  return {
    title: product.name,
    description: product.shortDescription ?? undefined,
  };
}

export default async function ProductPage(props: PageProps<'/produkter/[category]/[product]'>) {
  const { category, product: productSlug } = await props.params;
  const product = await getProductBySlugs(category, productSlug);
  if (!product) notFound();

  const jsonLd = buildProductJsonLd(product);

  return (
    <Container className="py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <nav className="text-muted-foreground mb-6 text-sm">
        <Link href={`/produkter/${product.category.slug}`} className="hover:underline">
          {product.category.name}
        </Link>
        <span className="mx-2">/</span>
        <span>{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="bg-muted aspect-square overflow-hidden rounded-xl">
          {product.primaryImage && (
            <Image
              src={product.primaryImage.url}
              alt={product.primaryImage.altText ?? product.name}
              width={800}
              height={800}
              className="h-full w-full object-contain p-8"
            />
          )}
        </div>

        <div>
          <span className="text-muted-foreground text-sm">{product.brand.name}</span>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">{product.name}</h1>
          {product.shortDescription && (
            <p className="text-muted-foreground mt-3">{product.shortDescription}</p>
          )}

          <div className="mt-4 flex items-center gap-3">
            <Badge variant="outline">{STOCK_STATUS_LABEL[product.stockStatus]}</Badge>
            {product.priceExVat ? (
              <span className="font-medium">
                {product.priceExVat} {product.currency} exkl. moms
              </span>
            ) : (
              <span className="font-medium">Ring för pris</span>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button size="lg" render={<a href="#offertformular" />}>
              Begär offert / Beställ
            </Button>
            <Button size="lg" variant="outline" render={<a href={CONTACT.phoneHref} />}>
              Ring {CONTACT.phone}
            </Button>
          </div>

          {product.description && (
            <p className="text-muted-foreground mt-6 leading-relaxed">{product.description}</p>
          )}
        </div>
      </div>

      {product.specs.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-semibold">Specifikationer</h2>
          <SpecTable specs={product.specs} />
        </section>
      )}

      {product.capacity.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-semibold">Kapacitet</h2>
          <CapacityTable rows={product.capacity} />
        </section>
      )}

      {product.accessories.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-semibold">Tillbehör som ingår</h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {product.accessories.map((accessory) => (
              <li key={accessory.id} className="rounded-lg border px-4 py-3 text-sm">
                {accessory.name}
                {accessory.quantityIncluded > 1 && ` (${accessory.quantityIncluded} st)`}
              </li>
            ))}
          </ul>
        </section>
      )}

      {product.documents.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-semibold">Dokumentation</h2>
          <DocumentList documents={product.documents} />
        </section>
      )}

      <section id="offertformular" className="mt-12 max-w-xl scroll-mt-24">
        <h2 className="mb-4 text-xl font-semibold">Begär offert / Beställ {product.name}</h2>
        <ContactForm
          productId={product.id}
          defaultMessage={`Jag är intresserad av ${product.name}.`}
        />
      </section>
    </Container>
  );
}

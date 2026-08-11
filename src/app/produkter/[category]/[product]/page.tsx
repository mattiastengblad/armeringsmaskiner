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
import { getDisplayPrice } from '@/lib/price-display';
import { absoluteUrl } from '@/lib/site-config';
import { STOCK_STATUS_BADGE } from '@/lib/status-labels';
import type { ProductDetail } from '@/lib/types';

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
      ...(product.priceExVat
        ? { price: product.priceExVat }
        : product.computedGrossPriceSek != null
          ? { price: product.computedGrossPriceSek }
          : {}),
      availability: SCHEMA_AVAILABILITY[product.stockStatus],
    },
  };
}

function buildKeyFacts(product: ProductDetail): { label: string; value: string }[] {
  const facts: { label: string; value: string }[] = [];
  const maxCapacity = product.capacity.reduce(
    (max, row) => Math.max(max, Number(row.barDiameterMm)),
    0,
  );

  if (maxCapacity > 0) facts.push({ label: 'Kapacitet', value: `Ø${maxCapacity} mm` });
  if (product.voltage) facts.push({ label: 'Spänning', value: `${product.voltage} V` });
  if (product.powerWatts) facts.push({ label: 'Effekt', value: `${product.powerWatts} W` });
  if (product.weightKg) {
    facts.push({ label: 'Vikt', value: `${parseFloat(product.weightKg)} kg` });
  }

  return facts.slice(0, 4);
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
  const status = STOCK_STATUS_BADGE[product.stockStatus];
  const keyFacts = buildKeyFacts(product);
  const displayPrice = getDisplayPrice(product);

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
        <div className="relative aspect-4/3 overflow-hidden rounded-lg bg-[#efede8]">
          {product.primaryImage && (
            <Image
              src={product.primaryImage.url}
              alt={product.primaryImage.altText ?? product.name}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-contain p-8"
            />
          )}
        </div>

        <div>
          <span className="text-muted-foreground font-mono text-xs">{product.sku}</span>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">{product.name}</h1>
          {product.shortDescription && (
            <p className="text-muted-foreground mt-3">{product.shortDescription}</p>
          )}

          {keyFacts.length > 0 && (
            <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg border">
              {keyFacts.map((fact) => (
                <div key={fact.label} className="bg-card p-4">
                  <div className="text-muted-foreground text-xs">{fact.label}</div>
                  <div className="font-mono text-lg font-medium">{fact.value}</div>
                </div>
              ))}
            </div>
          )}

          <div className="border-primary bg-card mt-6 flex items-center justify-between gap-4 border-l-[3px] p-4">
            <div>
              {displayPrice ? (
                <span className="font-mono text-xl font-semibold">
                  {displayPrice.amount}{' '}
                  <span className="text-muted-foreground font-sans text-base font-normal">
                    {displayPrice.note}
                  </span>
                </span>
              ) : (
                <span className="text-xl font-semibold">Pris på begäran</span>
              )}
              <p className="text-muted-foreground mt-1 text-sm">Svar inom en arbetsdag.</p>
            </div>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button size="lg" render={<a href="#offertformular" />}>
              Begär offert / Beställ
            </Button>
            <Button size="lg" variant="secondary" render={<a href={CONTACT.phoneHref} />}>
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
          <h2 className="mb-4 text-xl font-semibold">Tekniska data</h2>
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

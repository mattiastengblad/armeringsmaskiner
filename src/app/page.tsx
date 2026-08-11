import Link from 'next/link';
import { Container } from '@/components/layout/container';
import { NewsletterForm } from '@/components/layout/newsletter-form';
import { ProductCard } from '@/components/product/product-card';
import { Button } from '@/components/ui/button';
import { getFeaturedProducts } from '@/lib/data/catalog';
import { CONTACT, PRODUCT_CATEGORIES } from '@/lib/nav';

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <>
      <section className="bg-muted/30 border-b">
        <Container className="grid gap-8 py-16 lg:grid-cols-2 lg:items-center lg:py-24">
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Bock- och klippmaskiner för armeringsjärn
            </h1>
            <p className="text-muted-foreground mt-4 text-lg">
              Pär Bergman Armeringsmaskiner AB har i över 20 år levererat GMS bock- och
              klippmaskiner samt Oguras handhållna verktyg till svenska byggarbetsplatser. Better
              call Pär.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button size="lg" render={<Link href="/produkter/bockmaskiner" />}>
                Se produkter
              </Button>
              <Button size="lg" variant="outline" render={<Link href="/kontakt" />}>
                Kontakta oss
              </Button>
            </div>
            <a
              href={CONTACT.phoneHref}
              className="mt-6 inline-block text-sm font-medium hover:underline"
            >
              Eller ring direkt: {CONTACT.phone}
            </a>
          </div>
          <div className="bg-muted aspect-video overflow-hidden rounded-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/placeholder-product.svg"
              alt="Armeringsmaskin i drift"
              className="h-full w-full object-cover"
            />
          </div>
        </Container>
      </section>

      <section>
        <Container className="py-16">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Pärs urval</h2>
            <Link href="/produkter/bockmaskiner" className="text-sm font-medium hover:underline">
              Visa alla produkter
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-muted/30 border-y">
        <Container className="py-16">
          <h2 className="mb-8 text-2xl font-bold tracking-tight">Produktkategorier</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PRODUCT_CATEGORIES.map((category) => (
              <Link
                key={category.slug}
                href={`/produkter/${category.slug}`}
                className="hover:border-foreground/40 rounded-xl border bg-card p-6 transition-colors"
              >
                <h3 className="font-semibold">{category.label}</h3>
                <p className="text-muted-foreground mt-1 text-sm">{category.description}</p>
              </Link>
            ))}
            <Link
              href="/service"
              className="hover:border-foreground/40 rounded-xl border bg-card p-6 transition-colors"
            >
              <h3 className="font-semibold">Service &amp; underhåll</h3>
              <p className="text-muted-foreground mt-1 text-sm">
                Vi hjälper dig hålla maskinerna i drift.
              </p>
            </Link>
          </div>
        </Container>
      </section>

      <section>
        <Container className="grid gap-8 py-16 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Håll dig uppdaterad</h2>
            <p className="text-muted-foreground mt-2">
              Nyheter om nya maskiner och erbjudanden, direkt i din inkorg.
            </p>
            <div className="mt-4 max-w-md">
              <NewsletterForm />
            </div>
          </div>
          <div className="rounded-xl border bg-card p-8">
            <h3 className="font-semibold">Behöver du hjälp att välja maskin?</h3>
            <p className="text-muted-foreground mt-2 text-sm">
              Ring Per direkt så hjälper han dig hitta rätt maskin för ditt behov.
            </p>
            <Button className="mt-4" render={<a href={CONTACT.phoneHref} />}>
              Ring {CONTACT.phone}
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}

import Link from 'next/link';
import { Container } from '@/components/layout/container';
import { NewsletterForm } from '@/components/layout/newsletter-form';
import { CONTACT, DOCUMENTATION_BRANDS, PRODUCT_CATEGORIES } from '@/lib/nav';

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-secondary text-secondary-foreground">
      <Container className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link href="/" className="font-heading text-lg font-bold tracking-tight">
            Armeringsmaskiner<span className="text-primary">.se</span>
          </Link>
          <p className="mt-3 text-sm text-white/70">
            GMS bock- och klippmaskiner samt Oguras handhållna verktyg. Better call Pär.
          </p>
          <address className="mt-4 space-y-1 text-sm text-white/70 not-italic">
            <p>
              <a href={CONTACT.phoneHref} className="hover:text-white hover:underline">
                {CONTACT.phone}
              </a>
            </p>
            <p>
              <a href={`mailto:${CONTACT.email}`} className="hover:text-white hover:underline">
                {CONTACT.email}
              </a>
            </p>
          </address>
        </div>

        <div>
          <h2 className="font-heading text-sm font-semibold tracking-wide uppercase">Sortiment</h2>
          <ul className="mt-3 space-y-1 text-sm text-white/70">
            {PRODUCT_CATEGORIES.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/produkter/${category.slug}`}
                  className="hover:text-white hover:underline"
                >
                  {category.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-heading text-sm font-semibold tracking-wide uppercase">Support</h2>
          <ul className="mt-3 space-y-1 text-sm text-white/70">
            {DOCUMENTATION_BRANDS.map((brand) => (
              <li key={brand.slug}>
                <Link
                  href={`/dokumentation#${brand.slug}`}
                  className="hover:text-white hover:underline"
                >
                  {brand.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/service" className="hover:text-white hover:underline">
                Service &amp; underhåll
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-heading text-sm font-semibold tracking-wide uppercase">Företaget</h2>
          <ul className="mt-3 space-y-1 text-sm text-white/70">
            <li>
              <Link href="/kontakt" className="hover:text-white hover:underline">
                Kontakt
              </Link>
            </li>
            <li>
              <Link href="/integritetspolicy" className="hover:text-white hover:underline">
                Integritetspolicy
              </Link>
            </li>
          </ul>
          <div className="mt-6">
            <h3 className="font-heading text-sm font-semibold tracking-wide uppercase">
              Nyhetsbrev
            </h3>
            <div className="mt-3">
              <NewsletterForm />
            </div>
          </div>
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-col gap-2 py-6 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {year} {CONTACT.company} · Org.nr {CONTACT.orgNumber}
          </p>
          <Link href="/integritetspolicy" className="hover:text-white hover:underline">
            Integritetspolicy
          </Link>
        </Container>
      </div>
    </footer>
  );
}

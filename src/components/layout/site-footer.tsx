import Link from 'next/link';
import { Container } from '@/components/layout/container';
import { NewsletterForm } from '@/components/layout/newsletter-form';
import { CONTACT, DOCUMENTATION_BRANDS, PRODUCT_CATEGORIES } from '@/lib/nav';

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/30">
      <Container className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h2 className="text-sm font-semibold">Kontakt</h2>
          <address className="text-muted-foreground mt-3 space-y-1 text-sm not-italic">
            <p>{CONTACT.company}</p>
            <p>{CONTACT.name}</p>
            <p>{CONTACT.address}</p>
            <p>
              <a href={CONTACT.phoneHref} className="hover:underline">
                {CONTACT.phone}
              </a>
            </p>
            <p>
              <a href={`mailto:${CONTACT.email}`} className="hover:underline">
                {CONTACT.email}
              </a>
            </p>
          </address>
        </div>

        <div>
          <h2 className="text-sm font-semibold">Produkter</h2>
          <ul className="text-muted-foreground mt-3 space-y-1 text-sm">
            {PRODUCT_CATEGORIES.map((category) => (
              <li key={category.slug}>
                <Link href={`/produkter/${category.slug}`} className="hover:underline">
                  {category.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold">Mer</h2>
          <ul className="text-muted-foreground mt-3 space-y-1 text-sm">
            {DOCUMENTATION_BRANDS.map((brand) => (
              <li key={brand.slug}>
                <Link href={`/dokumentation#${brand.slug}`} className="hover:underline">
                  {brand.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/service" className="hover:underline">
                Service
              </Link>
            </li>
            <li>
              <Link href="/kontakt" className="hover:underline">
                Kontakt
              </Link>
            </li>
            <li>
              <Link href="/integritetspolicy" className="hover:underline">
                Integritetspolicy
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold">Nyhetsbrev</h2>
          <p className="text-muted-foreground mt-3 text-sm">
            Få nyheter om nya maskiner och erbjudanden.
          </p>
          <div className="mt-3">
            <NewsletterForm />
          </div>
        </div>
      </Container>

      <div className="border-t">
        <Container className="text-muted-foreground flex flex-col gap-2 py-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {year} {CONTACT.company}
          </p>
          <Link href="/integritetspolicy" className="hover:underline">
            Integritetspolicy
          </Link>
        </Container>
      </div>
    </footer>
  );
}

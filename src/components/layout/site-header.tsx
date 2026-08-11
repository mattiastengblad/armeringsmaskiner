import Link from 'next/link';
import { Menu, Phone } from 'lucide-react';
import { CategoryNav } from '@/components/layout/category-nav';
import { Container } from '@/components/layout/container';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { CONTACT, DOCUMENTATION_BRANDS, PRODUCT_CATEGORIES } from '@/lib/nav';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50">
      {/* Tier 1: service bar */}
      <div className="bg-secondary text-secondary-foreground">
        <Container className="flex h-9 items-center justify-between text-xs">
          <a href={CONTACT.phoneHref} className="flex items-center gap-1.5 hover:underline">
            <Phone className="size-3" aria-hidden="true" />
            {CONTACT.phone}
          </a>
          <Link href="/service" className="hover:underline">
            Service &amp; underhåll
          </Link>
        </Container>
      </div>

      {/* Tier 2: logo + primary CTA */}
      <div className="bg-background border-b">
        <Container className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="font-heading shrink-0 text-lg font-bold tracking-tight">
            Armeringsmaskiner<span className="text-primary">.se</span>
          </Link>

          <div className="hidden shrink-0 lg:block">
            <Button render={<Link href="/kontakt" />}>Begär offert</Button>
          </div>

          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="outline"
                  size="icon"
                  className="lg:hidden"
                  aria-label="Öppna meny"
                />
              }
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle>Meny</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4">
                <p className="text-muted-foreground mt-2 mb-1 text-xs font-semibold tracking-wide uppercase">
                  Produkter
                </p>
                {PRODUCT_CATEGORIES.map((category) => (
                  <Link
                    key={category.slug}
                    href={`/produkter/${category.slug}`}
                    className="hover:bg-accent rounded-md px-2 py-2 text-sm"
                  >
                    {category.label}
                  </Link>
                ))}
                <p className="text-muted-foreground mt-4 mb-1 text-xs font-semibold tracking-wide uppercase">
                  Dokumentation
                </p>
                {DOCUMENTATION_BRANDS.map((brand) => (
                  <Link
                    key={brand.slug}
                    href={`/dokumentation#${brand.slug}`}
                    className="hover:bg-accent rounded-md px-2 py-2 text-sm"
                  >
                    {brand.label}
                  </Link>
                ))}
                <div className="mt-4 flex flex-col gap-1 border-t pt-4">
                  <Link href="/service" className="hover:bg-accent rounded-md px-2 py-2 text-sm">
                    Service
                  </Link>
                  <Link href="/kontakt" className="hover:bg-accent rounded-md px-2 py-2 text-sm">
                    Kontakt
                  </Link>
                </div>
                <a
                  href={CONTACT.phoneHref}
                  className="mt-4 flex items-center gap-2 rounded-md border px-2 py-2 text-sm font-medium"
                >
                  <Phone className="size-4" aria-hidden="true" />
                  {CONTACT.phone}
                </a>
              </nav>
            </SheetContent>
          </Sheet>
        </Container>
      </div>

      {/* Tier 3: category row */}
      <div className="bg-background border-b">
        <Container>
          <div className="hidden lg:block">
            <CategoryNav />
          </div>
        </Container>
      </div>
    </header>
  );
}

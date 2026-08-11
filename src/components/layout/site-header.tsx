import Link from 'next/link';
import { Menu, Phone } from 'lucide-react';
import { Container } from '@/components/layout/container';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { CONTACT, DOCUMENTATION_BRANDS, PRODUCT_CATEGORIES } from '@/lib/nav';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link href="/" className="shrink-0 text-lg font-bold tracking-tight">
          Armeringsmaskiner<span className="text-primary">.se</span>
        </Link>

        <NavigationMenu className="hidden lg:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Produkter</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[min(90vw,32rem)] gap-1 p-2 sm:grid-cols-2">
                  {PRODUCT_CATEGORIES.map((category) => (
                    <li key={category.slug}>
                      <NavigationMenuLink render={<Link href={`/produkter/${category.slug}`} />}>
                        <div className="font-medium">{category.label}</div>
                        <div className="text-muted-foreground text-sm">{category.description}</div>
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger>Dokumentation</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-56 gap-1 p-2">
                  {DOCUMENTATION_BRANDS.map((brand) => (
                    <li key={brand.slug}>
                      <NavigationMenuLink render={<Link href={`/dokumentation#${brand.slug}`} />}>
                        {brand.label}
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink render={<Link href="/service" />}>Service</NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink render={<Link href="/kontakt" />}>Kontakt</NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="hidden shrink-0 items-center gap-4 lg:flex">
          <a
            href={CONTACT.phoneHref}
            className="flex items-center gap-2 text-sm font-medium hover:underline"
          >
            <Phone className="size-4" aria-hidden="true" />
            {CONTACT.phone}
          </a>
          <Button render={<Link href="/kontakt" />}>Begär offert</Button>
        </div>

        <Sheet>
          <SheetTrigger
            render={
              <Button variant="outline" size="icon" className="lg:hidden" aria-label="Öppna meny" />
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
                  className="rounded-md px-2 py-2 text-sm hover:bg-accent"
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
                  className="rounded-md px-2 py-2 text-sm hover:bg-accent"
                >
                  {brand.label}
                </Link>
              ))}
              <div className="mt-4 flex flex-col gap-1 border-t pt-4">
                <Link href="/service" className="rounded-md px-2 py-2 text-sm hover:bg-accent">
                  Service
                </Link>
                <Link href="/kontakt" className="rounded-md px-2 py-2 text-sm hover:bg-accent">
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
    </header>
  );
}

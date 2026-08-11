'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { PRODUCT_CATEGORIES } from '@/lib/nav';

export function CategoryNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 overflow-x-auto">
      {PRODUCT_CATEGORIES.map((category) => {
        const href = `/produkter/${category.slug}`;
        const isActive = pathname === href;
        return (
          <Link
            key={category.slug}
            href={href}
            className={cn(
              'border-b-[3px] px-3 py-3 text-sm font-medium whitespace-nowrap transition-colors',
              isActive
                ? 'border-primary text-foreground'
                : 'text-muted-foreground hover:text-foreground border-transparent',
            )}
          >
            {category.label}
          </Link>
        );
      })}
      <Link
        href="/dokumentation"
        className={cn(
          'border-b-[3px] px-3 py-3 text-sm font-medium whitespace-nowrap transition-colors',
          pathname === '/dokumentation'
            ? 'border-primary text-foreground'
            : 'text-muted-foreground hover:text-foreground border-transparent',
        )}
      >
        Dokumentation
      </Link>
      <Link
        href="/service"
        className={cn(
          'border-b-[3px] px-3 py-3 text-sm font-medium whitespace-nowrap transition-colors',
          pathname === '/service'
            ? 'border-primary text-foreground'
            : 'text-muted-foreground hover:text-foreground border-transparent',
        )}
      >
        Service
      </Link>
      <Link
        href="/kontakt"
        className={cn(
          'border-b-[3px] px-3 py-3 text-sm font-medium whitespace-nowrap transition-colors',
          pathname === '/kontakt'
            ? 'border-primary text-foreground'
            : 'text-muted-foreground hover:text-foreground border-transparent',
        )}
      >
        Kontakt
      </Link>
    </nav>
  );
}

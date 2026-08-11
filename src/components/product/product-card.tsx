import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { getDisplayPrice } from '@/lib/price-display';
import { STOCK_STATUS_BADGE } from '@/lib/status-labels';
import type { ProductSummary } from '@/lib/types';

export function ProductCard({ product }: { product: ProductSummary }) {
  const status = STOCK_STATUS_BADGE[product.stockStatus];
  const displayPrice = getDisplayPrice(product);

  return (
    <Link
      href={`/produkter/${product.category.slug}/${product.slug}`}
      className="group border-border bg-card hover:border-foreground/30 flex flex-col overflow-hidden rounded-lg border transition-colors"
    >
      <div className="bg-[#efede8] relative aspect-4/3 overflow-hidden">
        {product.primaryImage ? (
          <Image
            src={product.primaryImage.url}
            alt={product.primaryImage.altText ?? product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-contain p-6 transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
            Ingen bild
          </div>
        )}
        <div className="absolute top-3 left-3">
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <span className="text-muted-foreground font-mono text-xs">{product.sku}</span>
        <h3 className="font-heading font-semibold">{product.name}</h3>
        {product.shortDescription && (
          <p className="text-muted-foreground line-clamp-2 text-sm">{product.shortDescription}</p>
        )}
        <div className="mt-auto pt-3">
          {displayPrice ? (
            <span className="font-mono text-sm font-medium">
              {displayPrice.amount}{' '}
              <span className="text-muted-foreground font-sans font-normal">
                {displayPrice.note}
              </span>
            </span>
          ) : (
            <span className="text-sm font-medium">Pris på begäran</span>
          )}
        </div>
      </div>
    </Link>
  );
}

import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import type { ProductSummary } from '@/lib/types';

const STOCK_STATUS_LABEL: Record<ProductSummary['stockStatus'], string> = {
  kontakta_oss: 'Kontakta oss',
  i_lager: 'I lager',
  bestallningsvara: 'Beställningsvara',
};

export function ProductCard({ product }: { product: ProductSummary }) {
  return (
    <Link
      href={`/produkter/${product.category.slug}/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md"
    >
      <div className="bg-muted relative aspect-square overflow-hidden">
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
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <span className="text-muted-foreground text-xs">{product.brand.name}</span>
        <h3 className="font-semibold">{product.name}</h3>
        {product.shortDescription && (
          <p className="text-muted-foreground line-clamp-2 text-sm">{product.shortDescription}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-3">
          <Badge variant="outline">{STOCK_STATUS_LABEL[product.stockStatus]}</Badge>
          {product.priceExVat ? (
            <span className="text-sm font-medium">
              {product.priceExVat} {product.currency} exkl. moms
            </span>
          ) : (
            <span className="text-sm font-medium">Ring för pris</span>
          )}
        </div>
      </div>
    </Link>
  );
}

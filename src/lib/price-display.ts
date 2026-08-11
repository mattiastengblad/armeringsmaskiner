export interface DisplayPrice {
  amount: string;
  note: string;
}

export function getDisplayPrice(product: {
  priceExVat: string | null;
  computedGrossPriceSek: number | null;
  hasMultiplePriceVariants: boolean;
  currency: string;
}): DisplayPrice | null {
  if (product.priceExVat) {
    return {
      amount: `${Number(product.priceExVat).toLocaleString('sv-SE')} ${product.currency}`,
      note: 'exkl. moms',
    };
  }
  if (product.computedGrossPriceSek != null) {
    const prefix = product.hasMultiplePriceVariants ? 'Fr. ' : '';
    return {
      amount: `${prefix}${Math.round(product.computedGrossPriceSek).toLocaleString('sv-SE')} kr`,
      note: 'exkl. moms',
    };
  }
  return null;
}

import type { StockStatus } from '@/lib/types';

export const STOCK_STATUS_BADGE: Record<
  StockStatus,
  { label: string; variant: 'instock' | 'backorder' | 'quote' }
> = {
  i_lager: { label: 'I lager', variant: 'instock' },
  bestallningsvara: { label: 'Beställningsvara', variant: 'backorder' },
  kontakta_oss: { label: 'Endast offert', variant: 'quote' },
};

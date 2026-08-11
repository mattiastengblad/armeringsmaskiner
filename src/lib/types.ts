export type DriveType = 'mekanisk' | 'hydraulisk' | 'elektrisk';
export type StockStatus = 'kontakta_oss' | 'i_lager' | 'bestallningsvara';
export type DocumentType = 'manual' | 'certifikat' | 'broschyr' | 'garanti';
export type DocumentLanguage = 'sv' | 'en';

export interface Brand {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
}

export interface ProductImage {
  id: string;
  url: string;
  altText: string | null;
  sortOrder: number;
}

export interface ProductSpec {
  id: string;
  specKey: string;
  specValue: string;
  sortOrder: number;
}

export interface ProductCapacityRow {
  id: string;
  barDiameterMm: string;
  maxQtySimultaneous: number;
  sortOrder: number;
}

export interface Accessory {
  id: string;
  name: string;
  description: string | null;
  quantityIncluded: number;
}

export interface DocumentItem {
  id: string;
  title: string;
  fileUrl: string;
  docType: DocumentType;
  language: DocumentLanguage;
}

export interface ProductSummary {
  id: string;
  slug: string;
  name: string;
  shortDescription: string | null;
  stockStatus: StockStatus;
  priceExVat: string | null;
  currency: string;
  isFeatured: boolean;
  category: Pick<Category, 'slug' | 'name'>;
  brand: Pick<Brand, 'slug' | 'name'>;
  primaryImage: ProductImage | null;
}

export interface ProductDetail extends ProductSummary {
  description: string | null;
  powerWatts: number | null;
  voltage: number | null;
  driveType: DriveType | null;
  weightKg: string | null;
  dimensionsLengthMm: number | null;
  dimensionsWidthMm: number | null;
  dimensionsHeightMm: number | null;
  images: ProductImage[];
  specs: ProductSpec[];
  capacity: ProductCapacityRow[];
  accessories: Accessory[];
  documents: DocumentItem[];
}

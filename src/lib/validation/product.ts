import { z } from 'zod';

export const productBaseSchema = z.object({
  name: z.string().trim().min(2, 'Ange ett namn.'),
  slug: z
    .string()
    .trim()
    .min(2, 'Ange en slug.')
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Endast gemener, siffror och bindestreck.'),
  sku: z.string().trim().min(1, 'Ange ett artikelnummer.'),
  brandId: z.string().uuid('Välj ett varumärke.'),
  categoryId: z.string().uuid('Välj en kategori.'),
  shortDescription: z.string().trim().optional(),
  description: z.string().trim().optional(),
  powerWatts: z.coerce.number().int().positive().optional(),
  voltage: z.coerce.number().int().positive().optional(),
  driveType: z.enum(['mekanisk', 'hydraulisk', 'elektrisk']).optional(),
  weightKg: z.coerce.number().positive().optional(),
  dimensionsLengthMm: z.coerce.number().int().positive().optional(),
  dimensionsWidthMm: z.coerce.number().int().positive().optional(),
  dimensionsHeightMm: z.coerce.number().int().positive().optional(),
  priceExVat: z.coerce.number().positive().optional(),
  stockStatus: z.enum(['kontakta_oss', 'i_lager', 'bestallningsvara']),
  isPublished: z.coerce.boolean(),
  isFeatured: z.coerce.boolean(),
});

export type ProductBaseValues = z.infer<typeof productBaseSchema>;

export const specRowSchema = z.object({
  specKey: z.string().trim().min(1),
  specValue: z.string().trim().min(1),
});
export type SpecRow = z.infer<typeof specRowSchema>;

export const capacityRowSchema = z.object({
  barDiameterMm: z.coerce.number().positive(),
  maxQtySimultaneous: z.coerce.number().int().positive(),
});
export type CapacityRow = z.infer<typeof capacityRowSchema>;

export const accessoryRowSchema = z.object({
  name: z.string().trim().min(1),
  quantityIncluded: z.coerce.number().int().positive(),
});
export type AccessoryRow = z.infer<typeof accessoryRowSchema>;

export const documentRowSchema = z.object({
  title: z.string().trim().min(1),
  docType: z.enum(['manual', 'certifikat', 'broschyr', 'garanti']),
  language: z.enum(['sv', 'en']),
});
export type DocumentRow = z.infer<typeof documentRowSchema>;

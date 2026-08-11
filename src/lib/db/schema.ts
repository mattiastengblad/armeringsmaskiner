import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  numeric,
  boolean,
  timestamp,
  jsonb,
  type AnyPgColumn,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ---------- Enums ----------

export const driveTypeEnum = pgEnum('drive_type', ['mekanisk', 'hydraulisk', 'elektrisk']);

export const stockStatusEnum = pgEnum('stock_status', [
  'kontakta_oss',
  'i_lager',
  'bestallningsvara',
]);

export const documentTypeEnum = pgEnum('document_type', [
  'manual',
  'certifikat',
  'broschyr',
  'garanti',
]);

export const documentLanguageEnum = pgEnum('document_language', ['sv', 'en']);

export const inquiryTypeEnum = pgEnum('inquiry_type', ['contact', 'order', 'testpilot']);

export const inquiryStatusEnum = pgEnum('inquiry_status', [
  'new',
  'contacted',
  'quoted',
  'won',
  'lost',
]);

export const orderTypeEnum = pgEnum('order_type', ['quote_request', 'confirmed_order']);

export const orderStatusEnum = pgEnum('order_status', [
  'received',
  'sent_to_par',
  'confirmed',
  'invoiced',
  'delivered',
  'cancelled',
]);

export const profileRoleEnum = pgEnum('profile_role', ['admin', 'staff']);

// ---------- Core catalog tables ----------

export const brands = pgTable('brands', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  logoUrl: text('logo_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  sortOrder: integer('sort_order').notNull().default(0),
  parentId: uuid('parent_id').references((): AnyPgColumn => categories.id, {
    onDelete: 'set null',
  }),
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  sku: text('sku').notNull().unique(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  brandId: uuid('brand_id')
    .notNull()
    .references(() => brands.id, { onDelete: 'restrict' }),
  categoryId: uuid('category_id')
    .notNull()
    .references(() => categories.id, { onDelete: 'restrict' }),
  shortDescription: text('short_description'),
  description: text('description'),
  powerWatts: integer('power_watts'),
  voltage: integer('voltage'),
  driveType: driveTypeEnum('drive_type'),
  weightKg: numeric('weight_kg', { precision: 8, scale: 2 }),
  dimensionsLengthMm: integer('dimensions_length_mm'),
  dimensionsWidthMm: integer('dimensions_width_mm'),
  dimensionsHeightMm: integer('dimensions_height_mm'),
  isDigital: boolean('is_digital').notNull().default(false),
  priceExVat: numeric('price_ex_vat', { precision: 10, scale: 2 }),
  currency: text('currency').notNull().default('SEK'),
  stockStatus: stockStatusEnum('stock_status').notNull().default('kontakta_oss'),
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  isPublished: boolean('is_published').notNull().default(false),
  isFeatured: boolean('is_featured').notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const productImages = pgTable('product_images', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  altText: text('alt_text'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const productSpecs = pgTable('product_specs', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  specKey: text('spec_key').notNull(),
  specValue: text('spec_value').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
});

export const productCapacity = pgTable('product_capacity', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  barDiameterMm: numeric('bar_diameter_mm', { precision: 5, scale: 1 }).notNull(),
  maxQtySimultaneous: integer('max_qty_simultaneous').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
});

export const accessories = pgTable('accessories', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  quantityIncluded: integer('quantity_included').notNull().default(1),
  sortOrder: integer('sort_order').notNull().default(0),
});

export const documents = pgTable('documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }),
  brandId: uuid('brand_id').references(() => brands.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  fileUrl: text('file_url').notNull(),
  docType: documentTypeEnum('doc_type').notNull(),
  language: documentLanguageEnum('language').notNull().default('sv'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ---------- Leads / orders ----------

export const inquiries = pgTable('inquiries', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: inquiryTypeEnum('type').notNull().default('contact'),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  company: text('company'),
  message: text('message'),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'set null' }),
  status: inquiryStatusEnum('status').notNull().default('new'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const customers = pgTable('customers', {
  id: uuid('id').primaryKey().defaultRandom(),
  authUserId: uuid('auth_user_id'),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  company: text('company'),
  billingAddress: jsonb('billing_address'),
  shippingAddress: jsonb('shipping_address'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  inquiryId: uuid('inquiry_id').references(() => inquiries.id, { onDelete: 'set null' }),
  customerName: text('customer_name').notNull(),
  customerEmail: text('customer_email').notNull(),
  customerPhone: text('customer_phone'),
  deliveryAddress: text('delivery_address'),
  orderType: orderTypeEnum('order_type').notNull().default('quote_request'),
  status: orderStatusEnum('status').notNull().default('received'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'restrict' }),
  quantity: integer('quantity').notNull().default(1),
  unitPriceExVat: numeric('unit_price_ex_vat', { precision: 10, scale: 2 }),
  notes: text('notes'),
});

// ---------- Admin ----------

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(), // matches Supabase auth.users.id
  role: profileRoleEnum('role').notNull().default('staff'),
  fullName: text('full_name'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ---------- Relations ----------

export const brandsRelations = relations(brands, ({ many }) => ({
  products: many(products),
  documents: many(documents),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
  }),
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  brand: one(brands, { fields: [products.brandId], references: [brands.id] }),
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  images: many(productImages),
  specs: many(productSpecs),
  capacity: many(productCapacity),
  accessories: many(accessories),
  documents: many(documents),
  orderItems: many(orderItems),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, { fields: [productImages.productId], references: [products.id] }),
}));

export const productSpecsRelations = relations(productSpecs, ({ one }) => ({
  product: one(products, { fields: [productSpecs.productId], references: [products.id] }),
}));

export const productCapacityRelations = relations(productCapacity, ({ one }) => ({
  product: one(products, { fields: [productCapacity.productId], references: [products.id] }),
}));

export const accessoriesRelations = relations(accessories, ({ one }) => ({
  product: one(products, { fields: [accessories.productId], references: [products.id] }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  product: one(products, { fields: [documents.productId], references: [products.id] }),
  brand: one(brands, { fields: [documents.brandId], references: [brands.id] }),
}));

export const inquiriesRelations = relations(inquiries, ({ one, many }) => ({
  product: one(products, { fields: [inquiries.productId], references: [products.id] }),
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  inquiry: one(inquiries, { fields: [orders.inquiryId], references: [inquiries.id] }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
}));

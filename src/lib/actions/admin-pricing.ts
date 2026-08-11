'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import * as schema from '@/lib/db/schema';
import { requireAdmin } from '@/lib/auth/require-admin';

export interface PricingSettingsInput {
  eurToSekRate: number;
  freightMarkupMultiplier: number;
  resellerMarkupMultiplier: number;
}

export async function upsertActivePricingSettings(input: PricingSettingsInput) {
  const { user } = await requireAdmin();

  const existing = await db.query.pricingSettings.findFirst({
    where: eq(schema.pricingSettings.isActive, true),
  });

  if (existing) {
    await db
      .update(schema.pricingSettings)
      .set({
        eurToSekRate: String(input.eurToSekRate),
        freightMarkupMultiplier: String(input.freightMarkupMultiplier),
        resellerMarkupMultiplier: String(input.resellerMarkupMultiplier),
        updatedAt: new Date(),
        updatedBy: user.id,
      })
      .where(eq(schema.pricingSettings.id, existing.id));
  } else {
    await db.insert(schema.pricingSettings).values({
      label: 'Bas',
      eurToSekRate: String(input.eurToSekRate),
      freightMarkupMultiplier: String(input.freightMarkupMultiplier),
      resellerMarkupMultiplier: String(input.resellerMarkupMultiplier),
      isActive: true,
      updatedBy: user.id,
    });
  }

  revalidatePath('/admin/priser');
}

export interface ProductCostInput {
  gmsCreditPriceEur: number;
  freightPriceEur: number;
  targetCostRatio: number;
}

export async function upsertProductCostInput(productId: string, input: ProductCostInput) {
  await requireAdmin();

  const settings = await db.query.pricingSettings.findFirst({
    where: eq(schema.pricingSettings.isActive, true),
  });
  if (!settings) {
    throw new Error('Ställ in växelkurs och påslag innan du lägger till produktpriser.');
  }

  const existing = await db.query.productCostInputs.findFirst({
    where: eq(schema.productCostInputs.productId, productId),
  });

  if (existing) {
    await db
      .update(schema.productCostInputs)
      .set({
        gmsCreditPriceEur: String(input.gmsCreditPriceEur),
        freightPriceEur: String(input.freightPriceEur),
        targetCostRatio: String(input.targetCostRatio),
        pricingSettingsId: settings.id,
        updatedAt: new Date(),
      })
      .where(eq(schema.productCostInputs.id, existing.id));
  } else {
    await db.insert(schema.productCostInputs).values({
      productId,
      gmsCreditPriceEur: String(input.gmsCreditPriceEur),
      freightPriceEur: String(input.freightPriceEur),
      targetCostRatio: String(input.targetCostRatio),
      pricingSettingsId: settings.id,
    });
  }

  revalidatePath('/admin/priser');
}

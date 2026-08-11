'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import * as schema from '@/lib/db/schema';
import { requireAdmin } from '@/lib/auth/require-admin';

export async function updateOrderStatus(
  orderId: string,
  status: (typeof schema.orderStatusEnum.enumValues)[number],
) {
  await requireAdmin();
  await db
    .update(schema.orders)
    .set({ status, updatedAt: new Date() })
    .where(eq(schema.orders.id, orderId));
  revalidatePath('/admin');
}

export async function updateInquiryStatus(
  inquiryId: string,
  status: (typeof schema.inquiryStatusEnum.enumValues)[number],
) {
  await requireAdmin();
  await db.update(schema.inquiries).set({ status }).where(eq(schema.inquiries.id, inquiryId));
  revalidatePath('/admin');
}

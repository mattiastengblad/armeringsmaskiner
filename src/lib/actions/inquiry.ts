'use server';

import { eq } from 'drizzle-orm';
import { Resend } from 'resend';
import { db } from '@/lib/db';
import * as schema from '@/lib/db/schema';
import {
  buildCustomerConfirmationEmail,
  buildStaffNotificationEmail,
} from '@/lib/email/inquiry-emails';
import { inquiryFormSchema, type InquiryFormValues } from '@/lib/validation/inquiry';

const FROM_ADDRESS = 'Armeringsmaskiner.se <onboarding@resend.dev>';

export interface SubmitInquiryResult {
  success: boolean;
  error?: string;
}

export async function submitInquiry(values: InquiryFormValues): Promise<SubmitInquiryResult> {
  const parsed = inquiryFormSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: 'Ogiltiga uppgifter.' };
  }
  const data = parsed.data;

  const product = data.productId
    ? await db.query.products.findFirst({
        where: eq(schema.products.id, data.productId),
        columns: { id: true, name: true },
      })
    : null;

  const [inquiry] = await db
    .insert(schema.inquiries)
    .values({
      type: product ? 'order' : 'contact',
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      company: data.company || null,
      message: data.message,
      productId: product?.id ?? null,
    })
    .returning({ id: schema.inquiries.id });

  let order: { id: string } | null = null;
  if (product) {
    const [orderRow] = await db
      .insert(schema.orders)
      .values({
        inquiryId: inquiry.id,
        customerName: data.name,
        customerEmail: data.email,
        customerPhone: data.phone || null,
        orderType: 'quote_request',
        status: 'received',
      })
      .returning({ id: schema.orders.id });
    order = orderRow;

    await db.insert(schema.orderItems).values({
      orderId: order.id,
      productId: product.id,
      quantity: 1,
      notes: data.message,
    });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const emailContext = { values: data, productName: product?.name ?? null };
  let emailSent = false;

  try {
    const staffEmail = buildStaffNotificationEmail(emailContext);
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: process.env.ORDER_NOTIFICATION_EMAIL!,
      replyTo: data.email,
      subject: staffEmail.subject,
      html: staffEmail.html,
      text: staffEmail.text,
    });

    const customerEmail = buildCustomerConfirmationEmail(emailContext);
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: data.email,
      subject: customerEmail.subject,
      html: customerEmail.html,
      text: customerEmail.text,
    });

    emailSent = true;
  } catch (error) {
    console.error('Failed to send inquiry emails:', error);
  }

  await db
    .update(schema.inquiries)
    .set({ status: emailSent ? 'contacted' : 'new' })
    .where(eq(schema.inquiries.id, inquiry.id));

  if (order) {
    await db
      .update(schema.orders)
      .set({ status: emailSent ? 'sent_to_par' : 'received' })
      .where(eq(schema.orders.id, order.id));
  }

  // The inquiry/order is saved regardless of email outcome — that's the
  // source of truth. Don't fail the user-facing submission just because
  // Resend is still in test mode (e.g. domain not verified yet).
  return { success: true };
}

import type { Metadata } from 'next';
import { db } from '@/lib/db';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { InquiryStatusSelect, OrderStatusSelect } from '@/components/admin/status-select';

export const metadata: Metadata = {
  title: 'Ordrar & förfrågningar',
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage() {
  const [orders, inquiries] = await Promise.all([
    db.query.orders.findMany({
      orderBy: (orders, { desc }) => [desc(orders.createdAt)],
      with: { items: { with: { product: { columns: { name: true } } } } },
    }),
    db.query.inquiries.findMany({
      where: (inquiries, { eq }) => eq(inquiries.type, 'contact'),
      orderBy: (inquiries, { desc }) => [desc(inquiries.createdAt)],
    }),
  ]);

  return (
    <div className="space-y-12">
      <section>
        <h1 className="mb-4 text-xl font-semibold">Beställningar / offertförfrågningar</h1>
        {orders.length === 0 ? (
          <p className="text-muted-foreground text-sm">Inga beställningar ännu.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Datum</TableHead>
                <TableHead>Kund</TableHead>
                <TableHead>Produkt</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                    {new Intl.DateTimeFormat('sv-SE', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    }).format(order.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{order.customerName}</div>
                    <div className="text-muted-foreground text-sm">{order.customerEmail}</div>
                    {order.customerPhone && (
                      <div className="text-muted-foreground text-sm">{order.customerPhone}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    {order.items.map((item) => (
                      <div key={item.id}>
                        {item.product.name} × {item.quantity}
                      </div>
                    ))}
                  </TableCell>
                  <TableCell>
                    <OrderStatusSelect orderId={order.id} status={order.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>

      <section>
        <h1 className="mb-4 text-xl font-semibold">Kontaktförfrågningar</h1>
        {inquiries.length === 0 ? (
          <p className="text-muted-foreground text-sm">Inga kontaktförfrågningar ännu.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Datum</TableHead>
                <TableHead>Kontakt</TableHead>
                <TableHead>Meddelande</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inquiries.map((inquiry) => (
                <TableRow key={inquiry.id}>
                  <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                    {new Intl.DateTimeFormat('sv-SE', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    }).format(inquiry.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{inquiry.name}</div>
                    <div className="text-muted-foreground text-sm">{inquiry.email}</div>
                    {inquiry.phone && (
                      <div className="text-muted-foreground text-sm">{inquiry.phone}</div>
                    )}
                  </TableCell>
                  <TableCell className="max-w-sm text-sm">{inquiry.message}</TableCell>
                  <TableCell>
                    <InquiryStatusSelect inquiryId={inquiry.id} status={inquiry.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </div>
  );
}

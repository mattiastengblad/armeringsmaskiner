'use client';

import { useTransition } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { updateInquiryStatus, updateOrderStatus } from '@/lib/actions/admin-orders';

const ORDER_STATUS_LABELS = {
  received: 'Mottagen',
  sent_to_par: 'Skickad till Per',
  confirmed: 'Bekräftad',
  invoiced: 'Fakturerad',
  delivered: 'Levererad',
  cancelled: 'Avbruten',
} as const;

const INQUIRY_STATUS_LABELS = {
  new: 'Ny',
  contacted: 'Kontaktad',
  quoted: 'Offert skickad',
  won: 'Vunnen',
  lost: 'Förlorad',
} as const;

export function OrderStatusSelect({
  orderId,
  status,
}: {
  orderId: string;
  status: keyof typeof ORDER_STATUS_LABELS;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      value={status}
      disabled={isPending}
      onValueChange={(value) =>
        startTransition(() => updateOrderStatus(orderId, value as keyof typeof ORDER_STATUS_LABELS))
      }
    >
      <SelectTrigger size="sm" className="w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function InquiryStatusSelect({
  inquiryId,
  status,
}: {
  inquiryId: string;
  status: keyof typeof INQUIRY_STATUS_LABELS;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      value={status}
      disabled={isPending}
      onValueChange={(value) =>
        startTransition(() =>
          updateInquiryStatus(inquiryId, value as keyof typeof INQUIRY_STATUS_LABELS),
        )
      }
    >
      <SelectTrigger size="sm" className="w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(INQUIRY_STATUS_LABELS).map(([value, label]) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

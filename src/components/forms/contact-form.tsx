'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { submitInquiry } from '@/lib/actions/inquiry';
import { inquiryFormSchema, type InquiryFormValues } from '@/lib/validation/inquiry';

export function ContactForm({
  productId,
  defaultMessage,
}: {
  productId?: string;
  defaultMessage?: string;
}) {
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<InquiryFormValues>({
    resolver: zodResolver(inquiryFormSchema),
    defaultValues: { productId, message: defaultMessage },
  });

  if (submitted) {
    return (
      <div className="rounded-lg border bg-card p-6 text-sm">
        Tack! Vi har tagit emot ditt meddelande och hör av oss inom kort.
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        setSubmitError(null);
        const result = await submitInquiry(values);
        if (result.success) {
          setSubmitted(true);
        } else {
          setSubmitError(result.error ?? 'Något gick fel. Försök igen eller ring oss direkt.');
        }
      })}
      className="space-y-4"
    >
      <div>
        <Label htmlFor="name">Namn</Label>
        <Input id="name" {...register('name')} className="mt-1" />
        {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div>
        <Label htmlFor="email">E-post</Label>
        <Input id="email" type="email" {...register('email')} className="mt-1" />
        {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <div>
        <Label htmlFor="phone">Telefon (valfritt)</Label>
        <Input id="phone" type="tel" {...register('phone')} className="mt-1" />
      </div>

      <div>
        <Label htmlFor="company">Företag (valfritt)</Label>
        <Input id="company" {...register('company')} className="mt-1" />
      </div>

      <div>
        <Label htmlFor="message">Meddelande</Label>
        <Textarea id="message" rows={5} {...register('message')} className="mt-1" />
        {errors.message && (
          <p className="mt-1 text-sm text-destructive">{errors.message.message}</p>
        )}
      </div>

      {submitError && <p className="text-sm text-destructive">{submitError}</p>}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Skickar…' : 'Skicka'}
      </Button>
    </form>
  );
}

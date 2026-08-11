import { z } from 'zod';

export const inquiryFormSchema = z.object({
  name: z.string().trim().min(2, 'Ange ditt namn.'),
  email: z.email('Ange en giltig e-postadress.'),
  phone: z.string().trim().optional(),
  company: z.string().trim().optional(),
  message: z.string().trim().min(5, 'Skriv ett meddelande.'),
  productId: z.string().optional(),
});

export type InquiryFormValues = z.infer<typeof inquiryFormSchema>;

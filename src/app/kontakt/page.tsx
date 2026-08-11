import type { Metadata } from 'next';
import { Container } from '@/components/layout/container';
import { ContactForm } from '@/components/forms/contact-form';
import { CONTACT } from '@/lib/nav';

export const metadata: Metadata = {
  title: 'Kontakt',
  description: 'Kontakta Per Lindgren för offert eller frågor om GMS- och Ogura-maskiner.',
};

export default function ContactPage() {
  return (
    <Container className="py-12">
      <h1 className="text-3xl font-bold tracking-tight">Kontakt</h1>
      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold">Skicka ett meddelande</h2>
          <div className="mt-4">
            <ContactForm />
          </div>
        </div>
        <div>
          <h2 className="text-lg font-semibold">Kontaktuppgifter</h2>
          <address className="text-muted-foreground mt-4 space-y-1 text-sm not-italic">
            <p>{CONTACT.company}</p>
            <p>{CONTACT.name}</p>
            <p>{CONTACT.address}</p>
            <p>
              <a href={CONTACT.phoneHref} className="hover:underline">
                {CONTACT.phone}
              </a>
            </p>
            <p>
              <a href={`mailto:${CONTACT.email}`} className="hover:underline">
                {CONTACT.email}
              </a>
            </p>
          </address>
        </div>
      </div>
    </Container>
  );
}

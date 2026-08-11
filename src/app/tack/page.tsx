import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/layout/container';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Tack',
  description: 'Tack för ditt meddelande, vi hör av oss inom kort.',
};

export default function ThankYouPage() {
  return (
    <Container className="flex flex-col items-center py-24 text-center">
      <h1 className="text-3xl font-bold tracking-tight">Tack för ditt meddelande!</h1>
      <p className="text-muted-foreground mt-4 max-w-md">
        Vi har tagit emot din förfrågan och hör av oss så snart som möjligt.
      </p>
      <Button className="mt-6" render={<Link href="/" />}>
        Tillbaka till startsidan
      </Button>
    </Container>
  );
}

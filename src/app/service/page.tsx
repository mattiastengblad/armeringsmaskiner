import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/layout/container';
import { Button } from '@/components/ui/button';
import { CONTACT } from '@/lib/nav';

export const metadata: Metadata = {
  title: 'Service & underhåll',
  description: 'Service och underhåll av GMS- och Ogura-maskiner i samarbete med Mekina.',
};

export default function ServicePage() {
  return (
    <Container className="py-12">
      <h1 className="text-3xl font-bold tracking-tight">Service &amp; underhåll</h1>
      <p className="text-muted-foreground mt-4 max-w-2xl">
        Bra grejer håller länge om de tas om hand på rätt sätt. Så självklart är service och
        underhåll en viktig punkt på vår agenda. Därför samarbetar vi med de bästa — nämligen
        Mekina. Det betyder att du kan ringa mig i alla lägen så fixar sig allt.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button size="lg" render={<Link href="/kontakt" />}>
          Kontakta oss
        </Button>
        <Button size="lg" variant="outline" render={<a href={CONTACT.phoneHref} />}>
          Ring {CONTACT.phone}
        </Button>
      </div>
    </Container>
  );
}

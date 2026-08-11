import type { Metadata } from 'next';
import { Container } from '@/components/layout/container';
import { CONTACT } from '@/lib/nav';

export const metadata: Metadata = {
  title: 'Integritetspolicy',
  description: 'Hur Pär Bergman Armeringsmaskiner AB hanterar personuppgifter.',
};

export default function PrivacyPolicyPage() {
  return (
    <Container className="max-w-3xl py-12">
      <h1 className="text-3xl font-bold tracking-tight">Integritetspolicy</h1>
      <p className="bg-muted text-muted-foreground mt-4 rounded-lg border px-4 py-3 text-sm">
        Utkast — innehållet nedan behöver granskas och godkännas av Per innan sajten lanseras.
      </p>

      <div className="mt-8 space-y-4 text-sm leading-relaxed [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:first:mt-0">
        <h2>Personuppgiftsansvarig</h2>
        <p>
          {CONTACT.company}, {CONTACT.address}, är personuppgiftsansvarig för behandlingen av
          personuppgifter som lämnas via denna webbplats.
        </p>

        <h2>Vilka uppgifter vi samlar in</h2>
        <p>
          När du skickar en kontakt- eller offertförfrågan sparar vi namn, e-postadress, telefon,
          företag (om angivet) och ditt meddelande. Uppgifterna används för att kunna besvara din
          förfrågan och, vid en beställning, för att hantera ordern.
        </p>

        <h2>Hur uppgifterna lagras och behandlas</h2>
        <p>
          Uppgifterna lagras i vår databas (Supabase) och kan även hanteras i vårt CRM-system och
          via e-post. Vi använder Google Analytics för att analysera trafik på webbplatsen, och
          Mailchimp för utskick av nyhetsbrev till dig som aktivt anmält dig.
        </p>

        <h2>Hur länge vi sparar uppgifterna</h2>
        <p>
          Vi sparar uppgifter så länge det behövs för att hantera din förfrågan eller order, samt så
          länge vi är skyldiga att göra det enligt bokföringslagen eller annan tillämplig lag.
        </p>

        <h2>Dina rättigheter</h2>
        <p>
          Du har rätt att begära utdrag, rättelse eller radering av dina personuppgifter. Kontakta
          oss på{' '}
          <a href={`mailto:${CONTACT.email}`} className="underline">
            {CONTACT.email}
          </a>{' '}
          för frågor om hur dina uppgifter behandlas.
        </p>

        <h2>Cookies</h2>
        <p>
          Webbplatsen använder cookies för nödvändig funktionalitet och, om du samtycker, för
          analys. Du kan när som helst ändra dina val i cookie-inställningarna.
        </p>
      </div>
    </Container>
  );
}

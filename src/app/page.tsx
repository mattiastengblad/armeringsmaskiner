import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/layout/container';
import { NewsletterForm } from '@/components/layout/newsletter-form';
import { ProductCard } from '@/components/product/product-card';
import { Button } from '@/components/ui/button';
import { getFeaturedProducts } from '@/lib/data/catalog';
import { CONTACT, PRODUCT_CATEGORIES } from '@/lib/nav';
import { productImageUrl } from '@/lib/storage';

const GOCMAKSAN_MILESTONES = [
  'Från små intäkter till stora investeringar',
  'Från leverantörsberoende till egen tillverkning av alla maskindelar inkl. växellådor',
  'Från tillverkning av handverktyg till datorstyrda industrimaskiner',
  'Från hantverkskänsla till robotprecision i tillverkningen',
  'Från smedja till datorstyrd värmehärdning',
  'Från penselmålning till 100% robotiserad lackning med elektrostatisk färg',
  'Från ett kritiskt öga till testutrustning för 15 MSEK',
  'Från stora visioner till överlägset kostnadseffektiva produkter',
  'Från kvarteret till hela planeten',
];

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <>
      <section className="bg-muted/30 border-b">
        <Container className="grid gap-8 py-16 lg:grid-cols-2 lg:items-center lg:py-24">
          <div>
            <p className="text-muted-foreground text-sm font-medium">
              Armeringsmaskiner.se presenterar stolt
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Pär Bergman &amp; GMS-Göçmaksan
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">och en ny prisbild i branschen.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button size="lg" render={<Link href="/produkter/bockmaskiner" />}>
                Se produkter
              </Button>
              <Button size="lg" variant="outline" render={<Link href="/kontakt" />}>
                Kontakta oss
              </Button>
            </div>
            <a
              href={CONTACT.phoneHref}
              className="mt-6 inline-block text-sm font-medium hover:underline"
            >
              Eller ring direkt: {CONTACT.phone}
            </a>
          </div>
          <div className="bg-muted relative aspect-[4/5] overflow-hidden rounded-xl">
            <Image
              src={productImageUrl('par-bergman-hero.webp')}
              alt="Pär Bergman, Armeringsmaskiner.se"
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover object-top"
            />
          </div>
        </Container>
      </section>

      <section>
        <Container className="py-16">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Pärs urval</h2>
            <Link href="/produkter/bockmaskiner" className="text-sm font-medium hover:underline">
              Visa alla produkter
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-muted/30 border-y">
        <Container className="py-16">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-bold tracking-tight">Dags att öppna en ny dörr</h2>
            <div className="text-muted-foreground mt-4 space-y-4 leading-relaxed">
              <p>
                I 30 år har jag ägnat min vakna tid åt armeringsmaskiner i Sverige. Klipp &amp; Bock
                är en bransch jag känner väl. Jag vet hur kvalitet ser ut och har förstått varför
                den kostar. Men nu händer något. Ett turkiskt familjeföretag lyckas leverera
                kvalitet utan att priserna skenar.
              </p>
              <p>
                Det är en förändring jag verkligen gillar och den vill jag öppna dörren för i
                Sverige. Armeringsmaskiner.se har jag startat just för att kunna göra det. Så nu
                presenterar jag GMS för den svenska marknaden. Och samtidigt presenterar jag
                japanska Ogura, ännu ett fint företag, som kompletterar vårt sortiment perfekt.
              </p>
              <p>
                GMS har investerat klokt genom sin historia och prioriterat både ett ambitiöst
                utvecklingsarbete och stora satsningar på moderna tillverkningslinjer. På så sätt
                har de lyckats skapa högklassiga och pålitliga maskinmodeller som kräver minimalt
                underhåll. Robottillverkning har gett snabb produktion och jämn, hög kvalitet.
              </p>
              <p>
                Här kan du bekanta dig med GMS och ett urval av maskiner de producerar. Urvalet är
                mitt eget, baserat på min erfarenhet av vad den svenska marknaden behöver och
                föredrar. Söker du något annat så fixar jag det också. Närhelst du har lust att
                prata klipp &amp; bock är det bara att ringa mig.
              </p>
              <p className="text-foreground font-medium">
                Välkommen!
                <br />
                Armeringsmaskiner.se — {CONTACT.phone}
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section>
        <Container className="py-16">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-bold tracking-tight">Göçmaksan — en familjeresa</h2>
            <div className="text-muted-foreground mt-4 space-y-4 leading-relaxed">
              <p>
                På 60-talet började Arif Göçmen tillverka handverktyg för armeringsjärn i sin 30 m²
                stora smedja i Ankara. På den vägen är det, och familjen har lyckats ta företaget en
                bra bit sedan dess.
              </p>
              <p>
                Man är visserligen kvar i Ankara men därifrån exporterar Göçmaksan till 90 länder,
                spridda från Sibirien till Sydamerika. Idag är det Arifs son, Mehmet Göçmen, som
                utvecklar traditionen och styr resan, med 130 medarbetare och ett stort arv av
                visioner.
              </p>
              <ul className="list-inside list-disc space-y-1">
                {GOCMAKSAN_MILESTONES.map((milestone) => (
                  <li key={milestone}>{milestone}</li>
                ))}
              </ul>
              <p>Nu kan även vi i Sverige dra fördel av familjen Göçmens resa. Det är bra det!</p>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-muted/30 border-y">
        <Container className="py-16">
          <h2 className="mb-8 text-2xl font-bold tracking-tight">Produktkategorier</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PRODUCT_CATEGORIES.map((category) => (
              <Link
                key={category.slug}
                href={`/produkter/${category.slug}`}
                className="hover:border-foreground/40 rounded-xl border bg-card p-6 transition-colors"
              >
                <h3 className="font-semibold">{category.label}</h3>
                <p className="text-muted-foreground mt-1 text-sm">{category.description}</p>
              </Link>
            ))}
            <Link
              href="/service"
              className="hover:border-foreground/40 rounded-xl border bg-card p-6 transition-colors"
            >
              <h3 className="font-semibold">Service &amp; underhåll</h3>
              <p className="text-muted-foreground mt-1 text-sm">
                Vi hjälper dig hålla maskinerna i drift.
              </p>
            </Link>
          </div>
        </Container>
      </section>

      <section>
        <Container className="grid gap-8 py-16 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Håll dig uppdaterad</h2>
            <p className="text-muted-foreground mt-2">
              Nyheter om nya maskiner och erbjudanden, direkt i din inkorg.
            </p>
            <div className="mt-4 max-w-md">
              <NewsletterForm />
            </div>
          </div>
          <div className="rounded-xl border bg-card p-8">
            <h3 className="font-semibold">Behöver du hjälp att välja maskin?</h3>
            <p className="text-muted-foreground mt-2 text-sm">
              Ring Per direkt så hjälper han dig hitta rätt maskin för ditt behov.
            </p>
            <Button className="mt-4" render={<a href={CONTACT.phoneHref} />}>
              Ring {CONTACT.phone}
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}

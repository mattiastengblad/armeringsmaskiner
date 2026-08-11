import type { Metadata } from 'next';
import { Container } from '@/components/layout/container';
import { DocumentList } from '@/components/product/document-list';
import { getDocumentsGroupedByBrand } from '@/lib/data/catalog';

export const metadata: Metadata = {
  title: 'Dokumentation',
  description: 'Manualer, certifikat och broschyrer för GMS- och Ogura-maskiner.',
};

export default async function DocumentationPage() {
  const groups = await getDocumentsGroupedByBrand();

  return (
    <Container className="py-12">
      <h1 className="text-3xl font-bold tracking-tight">Dokumentation</h1>
      <p className="text-muted-foreground mt-2 max-w-2xl">
        Manualer, certifikat och broschyrer för respektive varumärke.
      </p>

      <div className="mt-10 space-y-12">
        {groups.map(({ brand, documents }) => (
          <section key={brand.id} id={brand.slug}>
            <h2 className="mb-4 text-xl font-semibold">{brand.name}</h2>
            {documents.length > 0 ? (
              <DocumentList documents={documents} />
            ) : (
              <p className="text-muted-foreground text-sm">Inga dokument publicerade ännu.</p>
            )}
          </section>
        ))}
      </div>
    </Container>
  );
}

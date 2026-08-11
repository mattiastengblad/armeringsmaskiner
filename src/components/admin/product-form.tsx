'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createProduct } from '@/lib/actions/admin-products';
import type { AccessoryRow, CapacityRow, DocumentRow, SpecRow } from '@/lib/validation/product';

const DRIVE_TYPE_LABELS = {
  mekanisk: 'Mekanisk',
  hydraulisk: 'Hydraulisk',
  elektrisk: 'Elektrisk',
} as const;

const STOCK_STATUS_LABELS = {
  kontakta_oss: 'Endast offert',
  i_lager: 'I lager',
  bestallningsvara: 'Beställningsvara',
} as const;

const DOC_TYPE_LABELS = {
  manual: 'Manual',
  certifikat: 'Certifikat',
  broschyr: 'Broschyr',
  garanti: 'Garanti',
} as const;

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[åä]/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

interface DocumentDraft {
  file: File;
  title: string;
  docType: DocumentRow['docType'];
  language: DocumentRow['language'];
}

export function ProductForm({
  brands,
  categories,
}: {
  brands: { id: string; name: string }[];
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [sku, setSku] = useState('');
  const [brandId, setBrandId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [powerWatts, setPowerWatts] = useState('');
  const [voltage, setVoltage] = useState('');
  const [driveType, setDriveType] = useState<'' | keyof typeof DRIVE_TYPE_LABELS>('');
  const [weightKg, setWeightKg] = useState('');
  const [dimensionsLengthMm, setDimensionsLengthMm] = useState('');
  const [dimensionsWidthMm, setDimensionsWidthMm] = useState('');
  const [dimensionsHeightMm, setDimensionsHeightMm] = useState('');
  const [priceExVat, setPriceExVat] = useState('');
  const [stockStatus, setStockStatus] = useState<keyof typeof STOCK_STATUS_LABELS>('kontakta_oss');
  const [isPublished, setIsPublished] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);

  const [specs, setSpecs] = useState<SpecRow[]>([]);
  const [capacity, setCapacity] = useState<CapacityRow[]>([]);
  const [accessories, setAccessories] = useState<AccessoryRow[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [documents, setDocuments] = useState<DocumentDraft[]>([]);

  const imagePreviews = useMemo(() => images.map((file) => URL.createObjectURL(file)), [images]);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await createProduct({
        base: {
          name,
          slug,
          sku,
          brandId,
          categoryId,
          shortDescription: shortDescription || undefined,
          description: description || undefined,
          powerWatts: powerWatts ? Number(powerWatts) : undefined,
          voltage: voltage ? Number(voltage) : undefined,
          driveType: driveType || undefined,
          weightKg: weightKg ? Number(weightKg) : undefined,
          dimensionsLengthMm: dimensionsLengthMm ? Number(dimensionsLengthMm) : undefined,
          dimensionsWidthMm: dimensionsWidthMm ? Number(dimensionsWidthMm) : undefined,
          dimensionsHeightMm: dimensionsHeightMm ? Number(dimensionsHeightMm) : undefined,
          priceExVat: priceExVat ? Number(priceExVat) : undefined,
          stockStatus,
          isPublished,
          isFeatured,
        },
        specs,
        capacity,
        accessories,
        images,
        documents: documents.map((doc) => ({
          file: doc.file,
          meta: { title: doc.title, docType: doc.docType, language: doc.language },
        })),
      });

      if (!result.success) {
        setError(result.error ?? 'Något gick fel.');
        return;
      }
      router.push('/admin/produkter');
    });
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      className="max-w-3xl space-y-10"
    >
      <section className="space-y-4">
        <h2 className="font-heading text-lg font-semibold">Grundinfo</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="name">Namn</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="mt-1"
              required
            />
          </div>
          <div>
            <Label htmlFor="slug">Slug (URL)</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              className="mt-1"
              required
            />
          </div>
          <div>
            <Label htmlFor="sku">Artikelnummer</Label>
            <Input
              id="sku"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="mt-1"
              required
            />
          </div>
          <div>
            <Label htmlFor="price">Pris exkl. moms (SEK)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={priceExVat}
              onChange={(e) => setPriceExVat(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="brand">Varumärke</Label>
            <Select value={brandId} onValueChange={(value) => setBrandId(value ?? '')}>
              <SelectTrigger id="brand" className="mt-1 w-full">
                <SelectValue placeholder="Välj varumärke" />
              </SelectTrigger>
              <SelectContent>
                {brands.map((brand) => (
                  <SelectItem key={brand.id} value={brand.id}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="category">Kategori</Label>
            <Select value={categoryId} onValueChange={(value) => setCategoryId(value ?? '')}>
              <SelectTrigger id="category" className="mt-1 w-full">
                <SelectValue placeholder="Välj kategori" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="stock-status">Lagerstatus</Label>
            <Select
              value={stockStatus}
              onValueChange={(value) => setStockStatus(value as keyof typeof STOCK_STATUS_LABELS)}
            >
              <SelectTrigger id="stock-status" className="mt-1 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STOCK_STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="drive-type">Drivtyp</Label>
            <Select
              value={driveType}
              onValueChange={(value) => setDriveType(value as keyof typeof DRIVE_TYPE_LABELS)}
            >
              <SelectTrigger id="drive-type" className="mt-1 w-full">
                <SelectValue placeholder="Ej angiven" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DRIVE_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="short-description">Kort beskrivning</Label>
          <Textarea
            id="short-description"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            className="mt-1"
            rows={2}
          />
        </div>
        <div>
          <Label htmlFor="description">Beskrivning</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1"
            rows={6}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="power">Effekt (W)</Label>
            <Input
              id="power"
              type="number"
              value={powerWatts}
              onChange={(e) => setPowerWatts(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="voltage">Spänning (V)</Label>
            <Input
              id="voltage"
              type="number"
              value={voltage}
              onChange={(e) => setVoltage(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="weight">Vikt (kg)</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="length">Längd (mm)</Label>
            <Input
              id="length"
              type="number"
              value={dimensionsLengthMm}
              onChange={(e) => setDimensionsLengthMm(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="width">Bredd (mm)</Label>
            <Input
              id="width"
              type="number"
              value={dimensionsWidthMm}
              onChange={(e) => setDimensionsWidthMm(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="height">Höjd (mm)</Label>
            <Input
              id="height"
              type="number"
              value={dimensionsHeightMm}
              onChange={(e) => setDimensionsHeightMm(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="size-4"
            />
            Publicerad
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="size-4"
            />
            Utvald produkt
          </label>
        </div>
      </section>

      <RowListSection
        title="Tekniska data"
        addLabel="Lägg till specifikation"
        rows={specs}
        onAdd={() => setSpecs((rows) => [...rows, { specKey: '', specValue: '' }])}
        onRemove={(i) => setSpecs((rows) => rows.filter((_, idx) => idx !== i))}
        renderRow={(row, i) => (
          <>
            <Input
              placeholder="Nyckel (t.ex. Kapacitet)"
              value={row.specKey}
              onChange={(e) =>
                setSpecs((rows) =>
                  rows.map((r, idx) => (idx === i ? { ...r, specKey: e.target.value } : r)),
                )
              }
            />
            <Input
              placeholder="Värde"
              value={row.specValue}
              onChange={(e) =>
                setSpecs((rows) =>
                  rows.map((r, idx) => (idx === i ? { ...r, specValue: e.target.value } : r)),
                )
              }
            />
          </>
        )}
      />

      <RowListSection
        title="Böjkapacitet"
        addLabel="Lägg till kapacitetsrad"
        rows={capacity}
        onAdd={() => setCapacity((rows) => [...rows, { barDiameterMm: 0, maxQtySimultaneous: 1 }])}
        onRemove={(i) => setCapacity((rows) => rows.filter((_, idx) => idx !== i))}
        renderRow={(row, i) => (
          <>
            <Input
              type="number"
              step="0.1"
              placeholder="Stångdiameter (mm)"
              value={row.barDiameterMm || ''}
              onChange={(e) =>
                setCapacity((rows) =>
                  rows.map((r, idx) =>
                    idx === i ? { ...r, barDiameterMm: Number(e.target.value) } : r,
                  ),
                )
              }
            />
            <Input
              type="number"
              placeholder="Max antal samtidigt"
              value={row.maxQtySimultaneous || ''}
              onChange={(e) =>
                setCapacity((rows) =>
                  rows.map((r, idx) =>
                    idx === i ? { ...r, maxQtySimultaneous: Number(e.target.value) } : r,
                  ),
                )
              }
            />
          </>
        )}
      />

      <RowListSection
        title="Tillbehör"
        addLabel="Lägg till tillbehör"
        rows={accessories}
        onAdd={() => setAccessories((rows) => [...rows, { name: '', quantityIncluded: 1 }])}
        onRemove={(i) => setAccessories((rows) => rows.filter((_, idx) => idx !== i))}
        renderRow={(row, i) => (
          <>
            <Input
              placeholder="Namn"
              value={row.name}
              onChange={(e) =>
                setAccessories((rows) =>
                  rows.map((r, idx) => (idx === i ? { ...r, name: e.target.value } : r)),
                )
              }
            />
            <Input
              type="number"
              placeholder="Antal"
              value={row.quantityIncluded || ''}
              onChange={(e) =>
                setAccessories((rows) =>
                  rows.map((r, idx) =>
                    idx === i ? { ...r, quantityIncluded: Number(e.target.value) } : r,
                  ),
                )
              }
            />
          </>
        )}
      />

      <section className="space-y-4">
        <h2 className="font-heading text-lg font-semibold">Bilder</h2>
        <Input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setImages(Array.from(e.target.files ?? []))}
        />
        {imagePreviews.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {imagePreviews.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={src}
                src={src}
                alt=""
                className="size-24 rounded-md border border-border object-cover"
                data-primary={i === 0}
              />
            ))}
          </div>
        )}
        <p className="text-muted-foreground text-xs">Den första bilden blir huvudbild.</p>
      </section>

      <section className="space-y-4">
        <h2 className="font-heading text-lg font-semibold">Dokument</h2>
        <Input
          type="file"
          accept="application/pdf"
          multiple
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            setDocuments(
              files.map((file) => ({
                file,
                title: file.name.replace(/\.pdf$/i, ''),
                docType: 'manual',
                language: 'sv',
              })),
            );
          }}
        />
        {documents.map((doc, i) => (
          <div key={doc.file.name + i} className="grid gap-2 sm:grid-cols-4">
            <Input
              className="sm:col-span-2"
              value={doc.title}
              onChange={(e) =>
                setDocuments((rows) =>
                  rows.map((r, idx) => (idx === i ? { ...r, title: e.target.value } : r)),
                )
              }
            />
            <Select
              value={doc.docType}
              onValueChange={(value) =>
                setDocuments((rows) =>
                  rows.map((r, idx) =>
                    idx === i ? { ...r, docType: value as DocumentRow['docType'] } : r,
                  ),
                )
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DOC_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={doc.language}
              onValueChange={(value) =>
                setDocuments((rows) =>
                  rows.map((r, idx) =>
                    idx === i ? { ...r, language: value as DocumentRow['language'] } : r,
                  ),
                )
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sv">Svenska</SelectItem>
                <SelectItem value="en">Engelska</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ))}
      </section>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Sparar…' : 'Skapa produkt'}
        </Button>
      </div>
    </form>
  );
}

function RowListSection<T>({
  title,
  addLabel,
  rows,
  onAdd,
  onRemove,
  renderRow,
}: {
  title: string;
  addLabel: string;
  rows: T[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  renderRow: (row: T, index: number) => React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="font-heading text-lg font-semibold">{title}</h2>
      {rows.map((row, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="grid flex-1 gap-2 sm:grid-cols-2">{renderRow(row, i)}</div>
          <Button type="button" variant="ghost" size="sm" onClick={() => onRemove(i)}>
            Ta bort
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={onAdd}>
        {addLabel}
      </Button>
    </section>
  );
}

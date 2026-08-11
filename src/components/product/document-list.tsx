import { Download, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { DocumentItem } from '@/lib/types';

const DOC_TYPE_LABEL: Record<DocumentItem['docType'], string> = {
  manual: 'Manual',
  certifikat: 'Certifikat',
  broschyr: 'Broschyr',
  garanti: 'Garanti',
};

export function DocumentList({ documents }: { documents: DocumentItem[] }) {
  if (documents.length === 0) return null;

  return (
    <ul className="divide-y rounded-lg border">
      {documents.map((doc) => (
        <li key={doc.id}>
          <a
            href={doc.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:bg-muted/50 flex items-center gap-3 px-4 py-3 text-sm transition-colors"
          >
            <FileText className="text-muted-foreground size-5 shrink-0" aria-hidden="true" />
            <span className="flex-1 font-medium">{doc.title}</span>
            <Badge variant="outline">{DOC_TYPE_LABEL[doc.docType]}</Badge>
            {doc.language === 'en' && <Badge variant="outline">EN</Badge>}
            <Download className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
          </a>
        </li>
      ))}
    </ul>
  );
}

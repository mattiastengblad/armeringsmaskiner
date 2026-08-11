import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import type { ProductSpec } from '@/lib/types';

export function SpecTable({ specs }: { specs: ProductSpec[] }) {
  if (specs.length === 0) return null;

  const sorted = [...specs].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <Table>
      <TableBody>
        {sorted.map((spec) => (
          <TableRow key={spec.id}>
            <TableCell className="text-muted-foreground w-1/2 font-medium">
              {spec.specKey}
            </TableCell>
            <TableCell>{spec.specValue}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

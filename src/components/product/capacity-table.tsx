import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { ProductCapacityRow } from '@/lib/types';

export function CapacityTable({ rows }: { rows: ProductCapacityRow[] }) {
  if (rows.length === 0) return null;

  const sorted = [...rows].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Järndimension</TableHead>
          <TableHead className="text-right">Max antal samtidigt</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((row) => (
          <TableRow key={row.id}>
            <TableCell>Ø {row.barDiameterMm} mm</TableCell>
            <TableCell className="text-right">{row.maxQtySimultaneous} st</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

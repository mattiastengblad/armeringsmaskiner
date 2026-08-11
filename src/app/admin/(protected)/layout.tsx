import Link from 'next/link';
import { Container } from '@/components/layout/container';
import { Button } from '@/components/ui/button';
import { requireAdmin } from '@/lib/auth/require-admin';
import { signOut } from '@/lib/actions/auth';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="min-h-[80vh]">
      <header className="border-b">
        <Container className="flex h-14 items-center justify-between">
          <nav className="flex items-center gap-4 text-sm font-medium">
            <Link href="/admin">Ordrar &amp; förfrågningar</Link>
            <Link href="/admin/priser" className="text-muted-foreground hover:text-foreground">
              Priser
            </Link>
          </nav>
          <form action={signOut}>
            <Button type="submit" variant="outline" size="sm">
              Logga ut
            </Button>
          </form>
        </Container>
      </header>
      <Container className="py-8">{children}</Container>
    </div>
  );
}

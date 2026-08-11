import type { Metadata } from 'next';
import { Container } from '@/components/layout/container';
import { LoginForm } from '@/components/admin/login-form';

export const metadata: Metadata = {
  title: 'Logga in',
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <Container className="flex min-h-[60vh] items-center justify-center py-12">
      <div className="w-full max-w-sm rounded-xl border p-8">
        <h1 className="mb-6 text-xl font-semibold">Admin – logga in</h1>
        <LoginForm />
      </div>
    </Container>
  );
}

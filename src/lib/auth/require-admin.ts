import 'server-only';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import * as schema from '@/lib/db/schema';
import { createClient } from '@/lib/supabase/server';

/**
 * Real authorization check for admin pages/actions — the proxy only does an
 * optimistic "is someone logged in" check, per Next.js's recommendation to
 * keep the actual authorization close to the data (see docs/guides/
 * authentication.md "Creating a Data Access Layer").
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/admin/login');

  const profile = await db.query.profiles.findFirst({
    where: eq(schema.profiles.id, user.id),
  });

  if (!profile || profile.role !== 'admin') redirect('/admin/login');

  return { user, profile };
}

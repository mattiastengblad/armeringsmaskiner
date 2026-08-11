/**
 * One-time setup script: creates a Supabase Auth user and a matching
 * profiles row with role='admin', so that person can log in at /admin.
 *
 * Usage:
 *   pnpm exec tsx --env-file=.env.local scripts/create-admin.ts <email> <password>
 */
import { createClient } from '@supabase/supabase-js';
import { db } from '../src/lib/db';
import * as schema from '../src/lib/db/schema';

async function main() {
  const [email, password] = process.argv.slice(2);
  if (!email || !password) {
    console.error('Usage: tsx scripts/create-admin.ts <email> <password>');
    process.exit(1);
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    console.error('Failed to create auth user:', error.message);
    process.exit(1);
  }

  await db.insert(schema.profiles).values({
    id: data.user.id,
    role: 'admin',
  });

  console.log(`Admin user created: ${email}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

-- Row Level Security policies for Supabase.
-- Run after `pnpm drizzle-kit push` (or migrate) has created the tables.
--
-- Design (see PLAN.md section 4):
--   * Public catalog tables are readable by anon, but only published rows.
--   * inquiries / orders / order_items / customers are fully locked down for
--     anon and authenticated non-admin users -- writes go through Server
--     Actions using the service-role key, which bypasses RLS entirely.
--   * Admins (profiles.role = 'admin') can read/write everything for the
--     admin CRUD screens.

alter table brands enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table product_specs enable row level security;
alter table product_capacity enable row level security;
alter table accessories enable row level security;
alter table documents enable row level security;
alter table inquiries enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table customers enable row level security;
alter table profiles enable row level security;

-- Helper: is the current user an admin?
create or replace function is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  );
$$;

-- ---------- Public catalog: readable by anyone, published rows only ----------

create policy "public read brands" on brands
  for select using (true);

create policy "public read categories" on categories
  for select using (true);

create policy "public read published products" on products
  for select using (is_published = true or is_admin());

create policy "public read product_images" on product_images
  for select using (
    exists (
      select 1 from products
      where products.id = product_images.product_id
        and (products.is_published = true or is_admin())
    )
  );

create policy "public read product_specs" on product_specs
  for select using (
    exists (
      select 1 from products
      where products.id = product_specs.product_id
        and (products.is_published = true or is_admin())
    )
  );

create policy "public read product_capacity" on product_capacity
  for select using (
    exists (
      select 1 from products
      where products.id = product_capacity.product_id
        and (products.is_published = true or is_admin())
    )
  );

create policy "public read accessories" on accessories
  for select using (true);

create policy "public read documents" on documents
  for select using (true);

-- Admin-only writes on catalog tables
create policy "admin write brands" on brands for all using (is_admin()) with check (is_admin());
create policy "admin write categories" on categories for all using (is_admin()) with check (is_admin());
create policy "admin write products" on products for all using (is_admin()) with check (is_admin());
create policy "admin write product_images" on product_images for all using (is_admin()) with check (is_admin());
create policy "admin write product_specs" on product_specs for all using (is_admin()) with check (is_admin());
create policy "admin write product_capacity" on product_capacity for all using (is_admin()) with check (is_admin());
create policy "admin write accessories" on accessories for all using (is_admin()) with check (is_admin());
create policy "admin write documents" on documents for all using (is_admin()) with check (is_admin());

-- ---------- Leads / orders: locked down, service role + admin only ----------

create policy "admin read inquiries" on inquiries for select using (is_admin());
create policy "admin write inquiries" on inquiries for all using (is_admin()) with check (is_admin());

create policy "admin read orders" on orders for select using (is_admin());
create policy "admin write orders" on orders for all using (is_admin()) with check (is_admin());

create policy "admin read order_items" on order_items for select using (is_admin());
create policy "admin write order_items" on order_items for all using (is_admin()) with check (is_admin());

create policy "admin read customers" on customers for select using (is_admin());
create policy "admin write customers" on customers for all using (is_admin()) with check (is_admin());

-- ---------- Profiles ----------

create policy "users read own profile" on profiles
  for select using (auth.uid() = id or is_admin());

create policy "admin write profiles" on profiles
  for all using (is_admin()) with check (is_admin());

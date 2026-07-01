-- Heaven Beauty — on-site checkout orders.
-- Adds an `orders` table, written server-side with the service-role client.
-- Orders are private: no anon access at all; the authenticated owner can read
-- them from the admin. Inserts happen only via the service role, which
-- bypasses RLS. The owner notification email goes to a single fixed
-- OWNER_EMAIL env var, so no per-country column is needed.

-- ----------------------------------------------------------------------------
-- orders
-- ----------------------------------------------------------------------------
create table if not exists orders (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  country_code   text not null references countries(code),
  customer_name  text not null,
  customer_phone text not null,
  customer_email text not null,
  address        text not null,
  city           text not null,
  notes          text,
  items          jsonb not null,            -- [{ productId, slug, name, qty, price }]
  subtotal       numeric(10,2) not null,
  currency       text not null,             -- ISO 4217, e.g. 'JOD'
  status         text not null default 'new',
  notify_status  jsonb,                     -- { owner_whatsapp, owner_email, customer_email }
  updated_at     timestamptz not null default now()
);

create index if not exists orders_created_idx on orders (created_at desc);
create index if not exists orders_country_idx on orders (country_code);
create index if not exists orders_status_idx  on orders (status);

-- Keep updated_at fresh (reuses the trigger fn from the init migration).
drop trigger if exists orders_set_updated_at on orders;
create trigger orders_set_updated_at
  before update on orders
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- Row Level Security
--
-- No anon policy → the public/anon key can neither read nor write orders.
-- Inserts are performed by the server with the service-role client, which
-- bypasses RLS entirely. The authenticated owner may read (and manage) orders
-- from the admin dashboard.
-- ----------------------------------------------------------------------------
alter table orders enable row level security;

drop policy if exists "admin read orders"   on orders;
drop policy if exists "admin manage orders" on orders;

-- Read for the authenticated admin (mirrors the catalog admin gate).
create policy "admin read orders" on orders
  for select to authenticated using (public.is_admin());

-- Allow the admin to update status / notes from the dashboard. Inserts are
-- intentionally NOT granted to any role — they only ever come from the
-- service role, which is exempt from RLS.
create policy "admin manage orders" on orders
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

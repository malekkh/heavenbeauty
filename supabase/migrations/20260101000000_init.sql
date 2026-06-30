-- Heaven Beauty — initial schema, RLS, and storage policies.
-- Public (anon) can read only active/available rows. Authenticated users
-- (the owner; sign-ups are disabled) get full write access.

-- ----------------------------------------------------------------------------
-- Tables
-- ----------------------------------------------------------------------------

create table if not exists countries (
  code            text primary key,            -- ISO alpha-2 lowercase: 'jo','lb','ae','eg'
  name            text not null,
  currency_code   text not null,               -- 'JOD','USD','AED','EGP'
  currency_symbol text not null,               -- 'د.ا','$','د.إ','ج.م'
  whatsapp_number text not null,               -- E.164 digits, e.g. '96178835078'
  is_default      boolean not null default false,
  is_active       boolean not null default true,
  sort_order      int not null default 0
);

create table if not exists categories (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,
  name       text not null,
  sort_order int not null default 0,
  is_active  boolean not null default true
);

create table if not exists products (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  description text,
  category_id uuid references categories(id) on delete set null,
  sort_order  int not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists product_images (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  url        text not null,
  alt        text,
  sort_order int not null default 0
);

create table if not exists product_country (
  product_id   uuid not null references products(id) on delete cascade,
  country_code text not null references countries(code) on delete cascade,
  price        numeric(10,2) not null,
  is_available boolean not null default true,
  primary key (product_id, country_code)
);

create index if not exists products_category_idx     on products (category_id);
create index if not exists products_active_idx        on products (is_active);
create index if not exists product_images_product_idx on product_images (product_id);
create index if not exists product_country_country_idx on product_country (country_code);
create index if not exists product_country_available_idx
  on product_country (country_code, is_available);

-- Keep products.updated_at fresh on every write (used by admin/audit).
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on products;
create trigger products_set_updated_at
  before update on products
  for each row execute function set_updated_at();

-- Only one default country.
create unique index if not exists countries_single_default_idx
  on countries (is_default) where is_default;

-- ----------------------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------------------

alter table countries       enable row level security;
alter table categories      enable row level security;
alter table products        enable row level security;
alter table product_images  enable row level security;
alter table product_country enable row level security;

-- Public (anon) reads only active/available rows.
drop policy if exists "read countries"       on countries;
drop policy if exists "read categories"      on categories;
drop policy if exists "read products"        on products;
drop policy if exists "read product_images"  on product_images;
drop policy if exists "read product_country" on product_country;

create policy "read countries"       on countries       for select using (is_active = true);
create policy "read categories"      on categories      for select using (is_active = true);
create policy "read products"        on products        for select using (is_active = true);
create policy "read product_images"  on product_images  for select using (true);
create policy "read product_country" on product_country for select using (is_available = true);

-- Authenticated = admin (sign-ups disabled, owner created by hand).
drop policy if exists "admin countries"       on countries;
drop policy if exists "admin categories"      on categories;
drop policy if exists "admin products"        on products;
drop policy if exists "admin product_images"  on product_images;
drop policy if exists "admin product_country" on product_country;

create policy "admin countries"       on countries       for all to authenticated using (true) with check (true);
create policy "admin categories"      on categories      for all to authenticated using (true) with check (true);
create policy "admin products"        on products        for all to authenticated using (true) with check (true);
create policy "admin product_images"  on product_images  for all to authenticated using (true) with check (true);
create policy "admin product_country" on product_country for all to authenticated using (true) with check (true);

-- ----------------------------------------------------------------------------
-- Storage: public product-images bucket
-- ----------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "read product images"  on storage.objects;
drop policy if exists "admin upload images"  on storage.objects;
drop policy if exists "admin update images"  on storage.objects;
drop policy if exists "admin delete images"  on storage.objects;

create policy "read product images" on storage.objects
  for select using (bucket_id = 'product-images');
create policy "admin upload images" on storage.objects
  for insert to authenticated with check (bucket_id = 'product-images');
create policy "admin update images" on storage.objects
  for update to authenticated using (bucket_id = 'product-images');
create policy "admin delete images" on storage.objects
  for delete to authenticated using (bucket_id = 'product-images');

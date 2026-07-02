-- Heaven Beauty — governorates / states with per-governorate delivery rates.
-- A country MAY have governorates. When it does, the delivery charge comes from
-- the chosen governorate; countries with no governorates keep using the flat
-- countries.delivery_rate as before.

-- ----------------------------------------------------------------------------
-- governorates
-- ----------------------------------------------------------------------------
create table if not exists governorates (
  id            uuid primary key default gen_random_uuid(),
  country_code  text not null references countries(code) on delete cascade,
  name          text not null,
  delivery_rate numeric(10,2) not null default 0,
  sort_order    int not null default 0,
  is_active     boolean not null default true
);

create index if not exists governorates_country_idx
  on governorates (country_code);
create unique index if not exists governorates_country_name_idx
  on governorates (country_code, lower(name));

alter table governorates enable row level security;

-- Public (anon) reads active governorates (needed at checkout).
drop policy if exists "read governorates" on governorates;
create policy "read governorates" on governorates
  for select using (is_active = true);

-- Admins manage them.
drop policy if exists "admin governorates" on governorates;
create policy "admin governorates" on governorates
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ----------------------------------------------------------------------------
-- orders: capture the selected governorate + postal code
-- ----------------------------------------------------------------------------
alter table orders add column if not exists governorate text;
alter table orders add column if not exists postal_code text;

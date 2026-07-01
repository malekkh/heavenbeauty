-- Heaven Beauty — admin hardening.
-- Adds a `profiles` table with an `is_admin` flag and rewrites the catalog
-- write policies to require an admin profile, instead of "any authenticated
-- user". Also backfills existing auth users and marks the owner as admin.

-- ----------------------------------------------------------------------------
-- profiles: one row per auth user
-- ----------------------------------------------------------------------------
create table if not exists profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  is_admin   boolean not null default false,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

-- A signed-in user may read their own profile (so the app can check is_admin).
drop policy if exists "read own profile" on profiles;
create policy "read own profile" on profiles
  for select to authenticated using (auth.uid() = id);
-- No insert/update/delete policy: profiles are managed by the trigger below
-- and the service role. Admin flags are never self-serve.

-- Auto-create a profile whenever a new auth user is created.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Helper used by RLS: is the current user an admin?
create or replace function is_admin()
returns boolean
language sql
security definer stable set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and is_admin = true
  );
$$;

-- ----------------------------------------------------------------------------
-- Rewrite catalog write policies to require an admin profile
-- ----------------------------------------------------------------------------
drop policy if exists "admin countries"       on countries;
drop policy if exists "admin categories"      on categories;
drop policy if exists "admin products"        on products;
drop policy if exists "admin product_images"  on product_images;
drop policy if exists "admin product_country" on product_country;

create policy "admin countries"       on countries       for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin categories"      on categories      for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin products"        on products        for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin product_images"  on product_images  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin product_country" on product_country for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Storage writes require admin too.
drop policy if exists "admin upload images" on storage.objects;
drop policy if exists "admin update images" on storage.objects;
drop policy if exists "admin delete images" on storage.objects;
create policy "admin upload images" on storage.objects
  for insert to authenticated with check (bucket_id = 'product-images' and public.is_admin());
create policy "admin update images" on storage.objects
  for update to authenticated using (bucket_id = 'product-images' and public.is_admin());
create policy "admin delete images" on storage.objects
  for delete to authenticated using (bucket_id = 'product-images' and public.is_admin());

-- ----------------------------------------------------------------------------
-- Backfill: create profiles for existing users; mark the owner as admin.
-- Change the email below if your owner login differs.
-- ----------------------------------------------------------------------------
insert into public.profiles (id, email, is_admin)
select id, email, (email = 'malekkhoder98@gmail.com')
from auth.users
on conflict (id) do update set is_admin = excluded.is_admin;

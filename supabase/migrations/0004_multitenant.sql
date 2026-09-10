-- ============================================================
-- KosMate — Multi-tenant SaaS (1 akun = 1 kos) + role Admin
-- 1. Tabel app_users (role owner/admin)
-- 2. Akun auth: berly@gmail.com (owner Berly), admin@gmail.com (admin)
-- 3. Kolom owner_id di settings/rooms/tenants/payments + composite PK
-- 4. RLS owner-scoped + admin read-only
-- 5. RPC admin_create_owner (security definer)
-- Jalankan di dashboard Supabase SQL Editor (sekali jalan).
-- ============================================================

-- ---------- 1. tabel app_users ----------
create table if not exists public.app_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'owner' check (role in ('owner','admin')),
  email text not null,
  created_at timestamptz not null default now()
);

-- ---------- 2. buat akun auth (idempotent) ----------
-- GosTrue memakai unique index pada lower(email), jadi ON CONFLICT (email)
-- tidak bisa dipakai; gunakan DO check-then-insert.
do $$
declare
  v_berly uuid := '11111111-1111-4111-8111-111111111111';
  v_admin uuid := '22222222-2222-4222-8222-222222222222';
begin
  if not exists (select 1 from auth.users where lower(email) = 'berly@gmail.com') then
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      '00000000-0000-0000-0000-000000000000', v_berly,
      'authenticated', 'authenticated', 'berly@gmail.com',
      crypt('berly123', gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}', '{}', now(), now(),
      '', '', '', ''
    );
  end if;

  if not exists (select 1 from auth.users where lower(email) = 'admin@gmail.com') then
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      '00000000-0000-0000-0000-000000000000', v_admin,
      'authenticated', 'authenticated', 'admin@gmail.com',
      crypt('kosmate123', gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}', '{}', now(), now(),
      '', '', '', ''
    );
  end if;
end $$;

insert into public.app_users (user_id, role, email)
values
  ('11111111-1111-4111-8111-111111111111', 'owner', 'berly@gmail.com'),
  ('22222222-2222-4222-8222-222222222222', 'admin', 'admin@gmail.com')
on conflict (user_id) do nothing;

-- ---------- 3. owner_id di settings ----------
alter table public.settings add column if not exists owner_id uuid;
update public.settings set owner_id = '11111111-1111-4111-8111-111111111111', id = '11111111-1111-4111-8111-111111111111' where owner_id is null;
alter table public.settings alter column owner_id set not null;
alter table public.settings alter column owner_id set default auth.uid();

-- pastikan baris settings Berly selalu ada
insert into public.settings (id, owner_id, nama_kos, nama_pemilik, whatsapp_kos)
values ('11111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111', 'Berly Kost', 'Berly', '081234567890')
on conflict (id) do nothing;

-- ---------- 4. owner_id di rooms/tenants/payments ----------
alter table public.rooms add column if not exists owner_id uuid;
alter table public.tenants add column if not exists owner_id uuid;
alter table public.payments add column if not exists owner_id uuid;

update public.rooms set owner_id = '11111111-1111-4111-8111-111111111111' where owner_id is null;
update public.tenants set owner_id = '11111111-1111-4111-8111-111111111111' where owner_id is null;
update public.payments set owner_id = '11111111-1111-4111-8111-111111111111' where owner_id is null;

alter table public.rooms alter column owner_id set not null;
alter table public.tenants alter column owner_id set not null;
alter table public.payments alter column owner_id set not null;

alter table public.rooms alter column owner_id set default auth.uid();
alter table public.tenants alter column owner_id set default auth.uid();
alter table public.payments alter column owner_id set default auth.uid();

-- ---------- 5. composite PK / FK / unique ----------
alter table public.tenants drop constraint if exists tenants_room_number_fkey;
alter table public.rooms drop constraint if exists rooms_pkey;
alter table public.payments drop constraint if exists payments_room_number_period_key;

alter table public.rooms add constraint rooms_pkey primary key (owner_id, room_number);
alter table public.tenants add constraint tenants_owner_room_fkey
  foreign key (owner_id, room_number) references public.rooms (owner_id, room_number);
alter table public.payments add constraint payments_owner_room_period_key
  unique (owner_id, room_number, period);

-- ---------- 6. index ----------
drop index if exists public.idx_payments_room_period;
drop index if exists public.idx_payments_status;
drop index if exists public.idx_tenants_room;

create index if not exists idx_rooms_owner on public.rooms (owner_id);
create index if not exists idx_tenants_owner on public.tenants (owner_id);
create index if not exists idx_tenants_owner_room on public.tenants (owner_id, room_number);
create index if not exists idx_payments_owner on public.payments (owner_id);
create index if not exists idx_payments_owner_status on public.payments (owner_id, status);

-- ---------- 7. helper is_admin ----------
-- Pakai auth.uid() (bukan current_setting claim langsung): PostgREST menyimpan
-- klaim JWT di request.jwt.claims (JSON), auth.uid() menangani kedua bentuk.
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public, extensions
as $$
  select exists (
    select 1 from public.app_users
    where user_id = auth.uid()
      and role = 'admin'
  );
$$;

-- ---------- 8. RLS baru ----------
-- revoke anon (data kini hanya untuk pemilik ter-autentikasi)
revoke all on public.settings from anon;
revoke all on public.rooms from anon;
revoke all on public.tenants from anon;
revoke all on public.payments from anon;

alter table public.settings enable row level security;
alter table public.rooms enable row level security;
alter table public.tenants enable row level security;
alter table public.payments enable row level security;
alter table public.app_users enable row level security;

drop policy if exists "settings open" on public.settings;
drop policy if exists "rooms open" on public.rooms;
drop policy if exists "tenants open" on public.tenants;
drop policy if exists "payments open" on public.payments;

-- settings: pemilik kelola miliknya; admin baca semua (daftar kos)
create policy "settings owner manage" on public.settings
  for all using (id = auth.uid()) with check (id = auth.uid());
create policy "settings admin read" on public.settings
  for select using (public.is_admin());

-- rooms/tenants/payments: pemilik mengelola miliknya; admin read-only
create policy "rooms owner manage" on public.rooms
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "rooms admin read" on public.rooms
  for select using (public.is_admin());

create policy "tenants owner manage" on public.tenants
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "tenants admin read" on public.tenants
  for select using (public.is_admin());

create policy "payments owner manage" on public.payments
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "payments admin read" on public.payments
  for select using (public.is_admin());

-- app_users: admin semua; owner baca barisnya sendiri
create policy "app_users admin all" on public.app_users
  for all using (public.is_admin()) with check (public.is_admin());
create policy "app_users owner self" on public.app_users
  for select using (user_id = auth.uid());

grant select, insert, update on public.app_users to authenticated;

-- ---------- 9. RPC admin_create_owner ----------
create or replace function public.admin_create_owner(
  p_email text,
  p_password text,
  p_nama_kos text,
  p_nama_pemilik text,
  p_whatsapp_kos text
) returns uuid
language plpgsql security definer set search_path = public, extensions
as $$
declare
  v_admin uuid;
  v_uid uuid;
begin
  v_admin := auth.uid();
  if v_admin is null or not exists (
    select 1 from public.app_users where user_id = v_admin and role = 'admin'
  ) then
    raise exception 'forbidden: hanya admin yang dapat membuat akun';
  end if;

  select id into v_uid from auth.users where lower(email) = lower(p_email);
  if v_uid is null then
    v_uid := gen_random_uuid();
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      '00000000-0000-0000-0000-000000000000', v_uid,
      'authenticated', 'authenticated', lower(p_email),
      crypt(p_password, gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}', '{}', now(), now(),
      '', '', '', ''
    );
  end if;

  insert into public.app_users (user_id, role, email)
  values (v_uid, 'owner', lower(p_email))
  on conflict (user_id) do nothing;

  insert into public.settings (id, owner_id, nama_kos, nama_pemilik, whatsapp_kos)
  values (v_uid, v_uid, p_nama_kos, p_nama_pemilik, p_whatsapp_kos)
  on conflict (id) do update
    set nama_kos = excluded.nama_kos,
        nama_pemilik = excluded.nama_pemilik,
        whatsapp_kos = excluded.whatsapp_kos;

  return v_uid;
end;
$$;

revoke all on function public.admin_create_owner(text, text, text, text, text) from public;
grant execute on function public.admin_create_owner(text, text, text, text, text) to authenticated;
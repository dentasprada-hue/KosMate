-- ============================================================
-- KosMate — skema awal + RLS (mode prototype tanpa auth)
-- Jalankan di dashboard Supabase SQL Editor (urutan bisa sekali jalan).
-- ============================================================

create extension if not exists pgcrypto;

-- ---------- settings ----------
create table if not exists public.settings (
  id uuid primary key default gen_random_uuid(),
  nama_kos text not null default 'KosMate',
  nama_pemilik text not null default '',
  whatsapp_kos text not null default '',
  alamat text not null default '',
  tipe_kos text not null default 'campur' check (tipe_kos in ('campur','putra','putri')),
  kosong_otomatis boolean not null default false,
  tagihan_duitku boolean not null default false,
  program_duitku text not null default '',
  bank text not null default '',
  logo_url text,
  dare_tanggal boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- rooms ----------
create table if not exists public.rooms (
  room_number text primary key,
  price numeric not null default 0 check (price >= 0),
  status text not null default 'kosong' check (status in ('terisi','kosong','perbaikan')),
  created_at timestamptz not null default now()
);

-- ---------- tenants ----------
create table if not exists public.tenants (
  tenant_id uuid primary key default gen_random_uuid(),
  name text not null,
  room_number text not null references public.rooms (room_number),
  whatsapp text not null default '',
  price numeric not null default 0 check (price >= 0),
  start_date date not null,
  due_date date not null,
  payment_status text not null default 'belum_bayar' check (payment_status in ('sudah_bayar','belum_bayar','jatuh_tempo','terlambat')),
  created_at timestamptz not null default now()
);

-- ---------- payments ----------
create table if not exists public.payments (
  payment_id uuid primary key default gen_random_uuid(),
  tenant_name text not null,
  room_number text not null,
  period text not null, -- 'YYYY-MM'
  amount numeric not null default 0 check (amount >= 0),
  due_date date not null,
  paid_at timestamptz,
  method text check (method in ('Tunai','Transfer') or method is null),
  status text not null default 'belum_bayar' check (status in ('sudah_bayar','belum_bayar','jatuh_tempo','terlambat')),
  created_at timestamptz not null default now(),
  unique (room_number, period)
);

-- ---------- indexes ----------
create index if not exists idx_payments_room_period on public.payments (room_number, period);
create index if not exists idx_payments_status on public.payments (status);
create index if not exists idx_tenants_room on public.tenants (room_number);

-- ---------- RLS (prototype: akses anon terbuka) ----------
alter table public.settings enable row level security;
alter table public.rooms enable row level security;
alter table public.tenants enable row level security;
alter table public.payments enable row level security;

drop policy if exists "settings open" on public.settings;
drop policy if exists "rooms open" on public.rooms;
drop policy if exists "tenants open" on public.tenants;
drop policy if exists "payments open" on public.payments;

create policy "settings open" on public.settings for all using (true) with check (true);
create policy "rooms open" on public.rooms for all using (true) with check (true);
create policy "tenants open" on public.tenants for all using (true) with check (true);
create policy "payments open" on public.payments for all using (true) with check (true);

grant all on public.settings to anon, authenticated;
grant all on public.rooms to anon, authenticated;
grant all on public.tenants to anon, authenticated;
grant all on public.payments to anon, authenticated;
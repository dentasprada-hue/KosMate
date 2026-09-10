-- ============================================================
-- KosMate — aktifkan Realtime (Postgres Changes) utk data app
-- Jalankan di dashboard Supabase SQL Editor (1 baris).
-- Tabel-tabel di publication supabase_realtime sehingga
-- perubahan data dikirim real-time ke semua perangkat.
-- ============================================================

alter publication supabase_realtime add table public.settings, public.rooms, public.tenants, public.payments;
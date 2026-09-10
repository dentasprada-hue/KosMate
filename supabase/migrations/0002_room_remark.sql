-- ============================================================
-- KosMate — kolom remark (keterangan opsional) pada kamar
-- Jalankan di dashboard Supabase SQL Editor (1 baris).
-- ============================================================

alter table public.rooms add column if not exists remark text;
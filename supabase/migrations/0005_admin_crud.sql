-- ============================================================
-- KosMate — Admin CRUD pemilik kos
-- admin_update_owner: ubah profil kos
-- admin_delete_owner: hapus akun + SEMUA datanya
-- Jalankan di Supabase SQL Editor.
-- ============================================================

create or replace function public.admin_update_owner(
  p_user_id uuid,
  p_nama_kos text,
  p_nama_pemilik text,
  p_whatsapp_kos text
) returns void
language plpgsql security definer set search_path = public, extensions
as $$
begin
  if auth.uid() is null or not exists (
    select 1 from public.app_users where user_id = auth.uid() and role = 'admin'
  ) then
    raise exception 'forbidden: hanya admin yang dapat mengubah akun';
  end if;

  update public.settings
  set nama_kos = p_nama_kos,
      nama_pemilik = p_nama_pemilik,
      whatsapp_kos = p_whatsapp_kos
  where id = p_user_id;

  if not found then
    insert into public.settings (id, owner_id, nama_kos, nama_pemilik, whatsapp_kos)
    values (p_user_id, p_user_id, p_nama_kos, p_nama_pemilik, p_whatsapp_kos);
  end if;
end;
$$;

create or replace function public.admin_delete_owner(
  p_user_id uuid
) returns void
language plpgsql security definer set search_path = public, extensions
as $$
begin
  if auth.uid() is null or not exists (
    select 1 from public.app_users where user_id = auth.uid() and role = 'admin'
  ) then
    raise exception 'forbidden: hanya admin yang dapat menghapus akun';
  end if;

  if p_user_id = auth.uid() then
    raise exception 'Tidak dapat menghapus akun admin yang sedang dipakai.';
  end if;

  -- hapus data pemilik (urutan penting karena FK komposit)
  delete from public.payments where owner_id = p_user_id;
  delete from public.tenants where owner_id = p_user_id;
  delete from public.rooms where owner_id = p_user_id;
  delete from public.settings where id = p_user_id or owner_id = p_user_id;
  delete from public.app_users where user_id = p_user_id;

  -- hapus user auth + relasi GoTrue-nya
  delete from auth.identities where user_id = p_user_id;
  delete from auth.users where id = p_user_id;
end;
$$;

revoke all on function public.admin_update_owner(uuid, text, text, text) from public;
grant execute on function public.admin_update_owner(uuid, text, text, text) to authenticated;

revoke all on function public.admin_delete_owner(uuid) from public;
grant execute on function public.admin_delete_owner(uuid) to authenticated;
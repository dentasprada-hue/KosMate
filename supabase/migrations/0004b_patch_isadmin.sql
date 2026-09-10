-- ============================================================
-- KosMate — patch is_admin() + admin_create_owner()
-- Perbaikan: pakai auth.uid() (compatible dengan request.jwt.claims JSON)
-- Jalankan di Supabase SQL Editor.
-- ============================================================

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
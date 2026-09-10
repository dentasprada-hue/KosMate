// ============================================================
// Migrasi data Berly Kost ke Supabase.
// Pakai service_role (backend-only). JANGAN commit key-nya.
//
// Cara pakai (PowerShell):
//   $env:SUPABASE_SERVICE_ROLE_KEY="sb_secret_..." ; node scripts/migrate-berly.mjs
// ============================================================
import { createClient } from '@supabase/supabase-js';

const URL = process.env.SUPABASE_URL || 'https://nhqebzfuoudyilevksml.supabase.co';
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!KEY) {
  console.error('ERROR: set SUPABASE_SERVICE_ROLE_KEY dulu, contoh:');
  console.error('  $env:SUPABASE_SERVICE_ROLE_KEY="sb_secret_..." ; node scripts/migrate-berly.mjs');
  console.error('(opsional: $env:SUPABASE_URL="https://<ref>.supabase.co")');
  process.exit(1);
}

const supabase = createClient(URL, KEY, { auth: { persistSession: false } });

// akun pemilik Berly (dibuat oleh migrasi 0004)
const BERLY_OWNER_EMAIL = 'berly@gmail.com';

const SETTINGS = {
  nama_kos: 'Berly Kost',
  nama_pemilik: 'Berly',
  whatsapp_kos: '081234567890',
  alamat: 'Berly Kost',
  tipe_kos: 'campur',
  kosong_otomatis: false,
  tagihan_duitku: false,
  program_duitku: '',
  bank: '',
  logo_url: null,
  dare_tanggal: false,
};

const berlyRooms = [
  { room_number: 'No J LT 2', price: 900000, status: 'terisi' },
  { room_number: 'LT 2 KM I', price: 850000, status: 'kosong' },
  { room_number: 'No A Lt 2', price: 1050000, status: 'terisi' },
  { room_number: 'No G LT 2', price: 900000, status: 'terisi' },
  { room_number: 'E LT 2', price: 850000, status: 'terisi' },
  { room_number: 'H LT Lt 2', price: 850000, status: 'terisi' },
  { room_number: 'LT 3 KM L', price: 850000, status: 'kosong' },
  { room_number: 'LT 3 KM Q', price: 850000, status: 'terisi' },
  { room_number: 'Lt 1 no 7', price: 900000, status: 'terisi' },
  { room_number: 'Lt 1 no 3', price: 850000, status: 'terisi' },
  { room_number: 'lt 1 no 6', price: 850000, status: 'terisi' },
  { room_number: 'lt 1 no 1', price: 900000, status: 'terisi' },
  { room_number: 'lt 1 no 4', price: 900000, status: 'terisi' },
  { room_number: 'lt 1 no 5', price: 900000, status: 'terisi' },
  { room_number: 'lt 1 no 2', price: 850000, status: 'terisi' },
  { room_number: 'LT 2 KM B', price: 1050000, status: 'terisi' },
  { room_number: 'LT 2 KM C', price: 900000, status: 'terisi' },
  { room_number: 'LT 2 KM F', price: 700000, status: 'terisi' },
  { room_number: 'LT 2 KM D', price: 900000, status: 'terisi' },
  { room_number: 'LT 2 KM K', price: 850000, status: 'kosong', remark: 'EXHOUST' },
  { room_number: 'LT 3 no P', price: 1400000, status: 'terisi' },
  { room_number: 'LT 3 no O', price: 900000, status: 'terisi' },
  { room_number: 'LT 3 no N', price: 1000000, status: 'terisi' },
  { room_number: 'LT 3 no M', price: 900000, status: 'terisi' },
];

const berlyTenants = [
  { name: 'ILMI', room_number: 'No J LT 2', start_date: '2025-12-03', price: 900000 },
  { name: 'BENNY 20', room_number: 'No A Lt 2', start_date: '2025-10-21', price: 1050000 },
  { name: 'SYAEFUL', room_number: 'No G LT 2', start_date: '2024-03-03', price: 900000 },
  { name: 'KODIR', room_number: 'E LT 2', start_date: '2026-01-06', price: 850000 },
  { name: 'ADIT', room_number: 'H LT Lt 2', start_date: '2026-09-02', price: 850000 },
  { name: 'OKTA', room_number: 'LT 3 KM Q', start_date: '2026-09-06', price: 850000 },
  { name: 'DIMAS2', room_number: 'Lt 1 no 7', start_date: '2025-06-04', price: 900000 },
  { name: 'FAHRUL', room_number: 'Lt 1 no 3', start_date: '2026-01-03', price: 850000 },
  { name: 'TEGAR', room_number: 'lt 1 no 6', start_date: '2026-08-12', price: 850000 },
  { name: 'DIMAS', room_number: 'lt 1 no 1', start_date: '2026-05-04', price: 900000 },
  { name: 'DICKYS', room_number: 'lt 1 no 4', start_date: '2026-08-03', price: 900000 },
  { name: 'ANGGA SARAGIH', room_number: 'lt 1 no 5', start_date: '2026-04-01', price: 900000 },
  { name: 'BARIQ', room_number: 'lt 1 no 2', start_date: '2026-08-26', price: 850000 },
  { name: 'MICHAEL', room_number: 'LT 2 KM B', start_date: '2026-05-25', price: 1050000 },
  { name: 'ERIK MANURUNG', room_number: 'LT 2 KM C', start_date: '2026-06-03', price: 900000 },
  { name: 'ALDO', room_number: 'LT 2 KM F', start_date: '2026-01-30', price: 700000 },
  { name: 'MAULANA', room_number: 'LT 2 KM D', start_date: '2026-04-07', price: 900000 },
  { name: 'IZZA (AC)', room_number: 'LT 3 no P', start_date: '2026-07-14', price: 1400000 },
  { name: 'BILAL', room_number: 'LT 3 no O', start_date: '2026-04-04', price: 900000 },
  { name: 'DUTIYA PUTTA', room_number: 'LT 3 no N', start_date: '2026-03-29', price: 1000000 },
  { name: 'BOWO', room_number: 'LT 3 no M', start_date: '2026-04-07', price: 900000 },
];

function todayLocal() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function dayInMonth(fromIso, day) {
  const [y, m] = fromIso.split('-').map(Number);
  const lastDay = new Date(y, m, 0).getDate();
  const clamped = Math.min(day, lastDay);
  return `${y}-${String(m).padStart(2, '0')}-${String(clamped).padStart(2, '0')}`;
}

function periodOf(iso) {
  return iso.slice(0, 7);
}

function fail(msg) {
  console.error('ERROR:', msg);
  process.exit(1);
}

async function resolveOwnerId() {
  const { data, error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
    filter: BERLY_OWNER_EMAIL,
  });
  if (error) fail(`cari owner ${BERLY_OWNER_EMAIL}: ${error.message}`);
  const u = data?.users?.find((u) => u.email?.toLowerCase() === BERLY_OWNER_EMAIL);
  if (!u) fail(`owner ${BERLY_OWNER_EMAIL} tidak ditemukan. Jalankan migrasi 0004 dulu.`);
  return u.id;
}

async function main() {
  const ownerId = await resolveOwnerId();
  const today = todayLocal();
  const duePayments = berlyTenants.map((t) => dayInMonth(today, Number(t.start_date.slice(8, 10))));
  const whatsapp = (i) => `081234567${String(i + 1).padStart(2, '0')}`;

  // settings (1 baris milik owner)
  const { error: sErr } = await supabase.from('settings').upsert({ id: ownerId, owner_id: ownerId, ...SETTINGS }, { onConflict: 'id' });
  if (sErr) fail(`upsert settings: ${sErr.message}`);
  console.log(`settings: upsert (owner ${ownerId})`);

  // rooms (upsert)
  for (const r of berlyRooms) {
    const { error } = await supabase.from('rooms').upsert({ ...r, owner_id: ownerId }, { onConflict: 'owner_id,room_number' });
    if (error) fail(`upsert room ${r.room_number}: ${error.message}`);
  }
  console.log(`rooms: ${berlyRooms.length} upsert`);

  // bersihkan data lama Berly utk idempotensi (payments -> tenants)
  const roomList = berlyRooms.map((r) => r.room_number);
  await supabase.from('payments').delete().eq('owner_id', ownerId).in('room_number', roomList);
  await supabase.from('tenants').delete().eq('owner_id', ownerId).in('room_number', roomList);

  // tenants + payments (semua belum bayar, jatuh tempo = tanggal-N bulan ini)
  const insertedTenantIds = [];
  for (let i = 0; i < berlyTenants.length; i++) {
    const t = berlyTenants[i];
    const due = duePayments[i];
    const { data: tenant, error: terr } = await supabase
      .from('tenants')
      .insert({
        name: t.name,
        room_number: t.room_number,
        whatsapp: whatsapp(i),
        price: t.price,
        start_date: t.start_date,
        due_date: due,
        payment_status: 'belum_bayar',
        owner_id: ownerId,
      })
      .select('tenant_id')
      .single();
    if (terr) fail(`insert tenant ${t.name}: ${terr.message}`);
    insertedTenantIds.push(tenant.tenant_id);

    const { error: perr } = await supabase.from('payments').insert({
      tenant_name: t.name,
      room_number: t.room_number,
      period: periodOf(due),
      amount: t.price,
      due_date: due,
      paid_at: null,
      method: null,
      status: due === today ? 'jatuh_tempo' : 'belum_bayar',
      owner_id: ownerId,
    });
    if (perr) fail(`insert payment ${t.name}: ${perr.message}`);
  }
  console.log(`tenants+payments: ${berlyTenants.length} (id: ${insertedTenantIds[0]} ... ${insertedTenantIds[insertedTenantIds.length - 1]})`);

  // verifikasi singkat (milik owner)
  const { count: cRooms } = await supabase.from('rooms').select('*', { count: 'exact', head: true }).eq('owner_id', ownerId);
  const { count: cTen } = await supabase.from('tenants').select('*', { count: 'exact', head: true }).eq('owner_id', ownerId);
  const { count: cPay } = await supabase.from('payments').select('*', { count: 'exact', head: true }).eq('owner_id', ownerId);
  console.log(`verifikasi: rooms=${cRooms}, tenants=${cTen}, payments=${cPay}`);
  console.log('MIGRASI SELESAI.');
}

main().catch((e) => {
  console.error('FATAL:', e);
  process.exit(1);
});
export interface BerlyTenantSeed {
  name: string;
  room_number: string;
  start_date: string;
  price: number;
}

export interface BerlyRoomSeed {
  room_number: string;
  price: number;
  status: 'terisi' | 'kosong';
  remark?: string;
}

export const berlyTenants: BerlyTenantSeed[] = [
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

export const berlyRooms: BerlyRoomSeed[] = [
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
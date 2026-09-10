export type PaymentStatus = 'sudah_bayar' | 'belum_bayar' | 'jatuh_tempo' | 'terlambat';
export type Bucket = 'terlambat' | 'hari_ini' | 'h3';
export type KosType = 'campur' | 'putra' | 'putri';

export interface KosSettings {
  nama_kos: string;
  nama_pemilik: string;
  whatsapp_kos: string;
  alamat: string;
  tipe_kos: KosType;
  kosong_otomatis: boolean;
  tagihan_duitku: boolean;
  program_duitku: string;
  bank: string;
  logo_url?: string | null;
  dare_tanggal?: boolean;
}

export interface Stats {
  total_kamar: number;
  kamar_terisi: number;
  kamar_kosong: number;
  penghuni_aktif: number;
  sudah_bayar: number;
  belum_bayar: number;
  jatuh_tempo_hari_ini: number;
  akan_jatuh_tempo: number;
  terlambat: number;
  pendapatan_bulan_ini: number;
  total_default: number;
}

export interface RecentPayment {
  id: string;
  tenant_name: string;
  room_number: string;
  paid_date: string;
  paid_amount: number;
  status: PaymentStatus;
}

export interface DashboardData {
  today: string;
  stats: Stats;
  action_items: ActionItem[];
  recent_payments: RecentPayment[];
}

export interface Room {
  room_number: string;
  status: 'terisi' | 'kosong' | 'perbaikan';
  remark?: string | null;
  payment_status: PaymentStatus | null;
  tenant_name: string | null;
  tenant_id?: string | null;
  price: number;
  due_date: string | null;
  duration_days: number | null;
  days_to_due: number | null;
  payment_id: string | null;
}

export interface Tenant {
  tenant_id: string;
  name: string;
  room_number: string;
  whatsapp: string;
  price: number;
  start_date: string;
  due_date: string;
  payment_status: PaymentStatus | null;
  days_to_due?: number | null;
  status?: 'aktif' | 'kamar_perbaikan' | 'tagihan_sudah_bayar' | 'tagihan_belum_bayar' | 'tagihan_jatuh_tempo' | 'tagihan_terlambat';
  active?: boolean;
}

export interface Payment {
  payment_id: string;
  tenant_name: string;
  room_number: string;
  period: string;
  amount: number;
  due_date: string;
  paid_at: string | null;
  method: string | null;
  status: PaymentStatus;
  payment_method?: string | null;
}

export interface ActionItem {
  payment_id: string;
  tenant_name: string;
  room_number: string;
  whatsapp: string;
  amount: number;
  due_date: string;
  days_to_due: number;
  bucket: Bucket;
}
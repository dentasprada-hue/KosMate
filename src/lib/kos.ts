import { StatusColors, type StatusName } from '@/constants/theme';
import type { Bucket, PaymentStatus } from './types';

export function rupiah(n?: number | null): string {
  const v = Number(n ?? 0);
  return 'Rp ' + v.toLocaleString('id-ID');
}

const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const BULAN_PENDEK = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

export function parseISO(iso: string | null | undefined): Date {
  if (!iso) return new Date();
  const d = new Date(iso);
  return isNaN(d.getTime()) ? new Date() : d;
}

export function tanggalPanjang(iso?: string | null): string {
  const d = parseISO(iso);
  return `${HARI[d.getDay()]}, ${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

export function tanggalPendek(iso?: string | null): string {
  const d = parseISO(iso);
  return `${d.getDate()} ${BULAN_PENDEK[d.getMonth()]} ${d.getFullYear()}`;
}

export function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function labelPeriode(period: string): string {
  const [y, m] = period.split('-').map(Number);
  if (!y || !m) return period;
  return `${BULAN[m - 1]} ${y}`;
}

export function addDays(iso: string, days: number): string {
  const d = parseISO(iso);
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function periodOf(iso: string): string {
  return iso.slice(0, 7);
}

export function dayOfMonth(iso: string): number {
  return parseISO(iso).getDate();
}

export function addMonthKeepDay(iso: string, months: number): string {
  const d = parseISO(iso);
  const day = d.getDate();
  const target = new Date(d.getFullYear(), d.getMonth() + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(day, lastDay));
  return `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}-${String(target.getDate()).padStart(2, '0')}`;
}

export function dayInMonth(fromIso: string, day: number): string {
  const d = parseISO(fromIso);
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const clamped = Math.min(day, lastDay);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(clamped).padStart(2, '0')}`;
}

export function daysBetween(fromIso: string, toIso: string): number {
  const from = new Date(fromIso).setHours(0, 0, 0, 0);
  const to = new Date(toIso).setHours(0, 0, 0, 0);
  return Math.round((to - from) / 86400000);
}

export const STATUS_META: Record<PaymentStatus, { label: string; color: StatusName; dot: string }> = {
  sudah_bayar: { label: 'Sudah Bayar', color: 'sudah_bayar', dot: StatusColors.sudah_bayar.dot },
  belum_bayar: { label: 'Belum Bayar', color: 'belum_bayar', dot: StatusColors.belum_bayar.dot },
  jatuh_tempo: { label: 'Jatuh Tempo', color: 'jatuh_tempo', dot: StatusColors.jatuh_tempo.dot },
  terlambat: { label: 'Terlambat', color: 'terlambat', dot: StatusColors.terlambat.dot },
};

export function isUnpaid(status?: PaymentStatus | null): boolean {
  return status === 'belum_bayar' || status === 'jatuh_tempo';
}

export function isPaidLate(paidAt?: string | null, dueDate?: string | null): boolean {
  return !!paidAt && !!dueDate && paidAt > dueDate;
}

export function pembayaranMeta(p: { status: PaymentStatus; paid_at?: string | null; due_date?: string | null }): { label: string; color: StatusName } {
  if (p.paid_at) {
    if (isPaidLate(p.paid_at, p.due_date)) return { label: 'Sudah Bayar (Telat)', color: 'sudah_bayar' };
    return { label: 'Sudah Bayar', color: 'sudah_bayar' };
  }
  if (p.due_date && p.due_date < todayIso()) return { label: 'Terlambat', color: 'terlambat' };
  const meta = STATUS_META[p.status];
  return { label: meta.label, color: meta.color };
}

export const ROOM_STATUS_META: Record<'terisi' | 'kosong' | 'perbaikan', { label: string; color: StatusName }> = {
  terisi: { label: 'Terisi', color: 'terisi' },
  kosong: { label: 'Kosong', color: 'kosong' },
  perbaikan: { label: 'Perbaikan', color: 'perbaikan' },
};

export const ROOM_PAYMENT_META: Record<PaymentStatus, { label: string; color: StatusName }> = {
  sudah_bayar: { label: 'Sudah Bayar', color: 'sudah_bayar' },
  belum_bayar: { label: 'Belum Bayar', color: 'belum_bayar' },
  jatuh_tempo: { label: 'Jatuh Tempo', color: 'jatuh_tempo' },
  terlambat: { label: 'Terlambat', color: 'terlambat' },
};

export const BUCKET_META: Record<Bucket, { emoji: string; title: string; desc: string; ring: string; dot: string; bg: string }> = {
  terlambat: { emoji: '🔴', title: 'Terlambat', desc: 'Jatuh tempo sudah lewat', ring: StatusColors.terlambat.ring, dot: StatusColors.terlambat.dot, bg: StatusColors.terlambat.bg },
  hari_ini: { emoji: '🟠', title: 'Jatuh tempo hari ini', desc: 'Harus bayar hari ini', ring: StatusColors.jatuh_tempo.ring, dot: StatusColors.jatuh_tempo.dot, bg: StatusColors.jatuh_tempo.bg },
  h3: { emoji: '🟡', title: '3 hari lagi', desc: 'Segera ingatkan penghuni', ring: StatusColors.belum_bayar.ring, dot: StatusColors.belum_bayar.dot, bg: StatusColors.belum_bayar.bg },
};

export const BUCKET_ORDER: Bucket[] = ['terlambat', 'hari_ini', 'h3'];

export function keteranganHari(days?: number | null): string {
  if (days === null || days === undefined) return '';
  if (days === 0) return 'jatuh tempo hari ini';
  if (days === 1) return 'besok jatuh tempo';
  if (days < 0) return `terlambat ${Math.abs(days)} hari`;
  return `sisa ${days} hari`;
}

export function pesanReminder(opts: { name: string; amount: number; dueDate: string; days?: number | null; kos?: string; owner?: string }): string {
  const kos = opts.kos ?? 'KosMate';
  const owner = opts.owner ?? 'Pemilik Kos';
  const due = tanggalPanjang(opts.dueDate);
  const lines = [
    `Halo *${opts.name}*,`,
    '',
    `Mohon maaf mengganggu. Ini pengingat untuk pembayaran kos di *${kos}*.`,
    '',
    `Tagihan sewa: *${rupiah(opts.amount)}*`,
    `Jatuh tempo: *${due}*`,
  ];
  if (opts.days !== null && opts.days !== undefined && opts.days < 0) {
    lines.push(`Sudah terlambat ${Math.abs(opts.days)} hari. Yuk segera diselesaikan ya.`);
  }
  lines.push('', 'Terima kasih,', owner);
  return lines.join('\n');
}

export function waLink(phone: string, message: string): string {
  const p = phone.replace(/[^0-9]/g, '');
  const normalized = p.startsWith('62') ? p : p.startsWith('0') ? '62' + p.slice(1) : p;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

export function normalizePhone(phone: string): string {
  const p = phone.replace(/[^0-9]/g, '');
  return p.startsWith('62') ? p : p.startsWith('0') ? '62' + p.slice(1) : p;
}
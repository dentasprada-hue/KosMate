import type { ActionItem, DashboardData, KosSettings, Payment, PaymentStatus, RecentPayment, Room, Stats, Tenant } from './types';
import { addDays, addMonthKeepDay, daysBetween, dayInMonth, dayOfMonth, isPaidLate, periodOf, todayIso } from './kos';
import { berlyRooms, berlyTenants } from './berly-data';

export interface MockDatabase {
  settings: KosSettings;
  rooms: Room[];
  tenants: Tenant[];
  payments: Payment[];
}

const NOW = new Date();

function currentPeriod(): string {
  return `${NOW.getFullYear()}-${String(NOW.getMonth() + 1).padStart(2, '0')}`;
}

export const mockSettings: KosSettings = {
  nama_kos: 'Berly Kost',
  nama_pemilik: 'Berly',
  whatsapp_kos: '081234567890',
  alamat: 'Berly Kost',
  tipe_kos: 'campur',
  kosong_otomatis: false,
  tagihan_duitku: false,
  program_duitku: '2090',
  bank: '',
  logo_url: null,
  dare_tanggal: false,
};

function phoneFor(i: number): string {
  return `081234567${String(i + 1).padStart(2, '0')}`;
}

/**
 * Jatuh tempo mengikuti "tanggal" masuk penghuni.
 * Contoh masuk 3 Feb => tagihan pertama jatuh tempo 3 Mar,
 * setelah dibayar otomatis jatuh tempo berikutnya 3 Apr.
 */
function buildTenants(): Tenant[] {
  const today = todayIso();
  return berlyTenants.map((b, i) => {
    const curDue = dayInMonth(today, dayOfMonth(b.start_date));
    const sit = i % 5;
    let due: string;
    let status: PaymentStatus;
    if (sit === 2 || sit === 3) {
      status = 'belum_bayar';
      due = sit === 3 && curDue >= today ? addMonthKeepDay(curDue, -1) : curDue;
    } else {
      status = sit === 1 ? 'terlambat' : 'sudah_bayar';
      due = addMonthKeepDay(curDue, 1);
    }
    return {
      tenant_id: `t_${i + 1}`,
      name: b.name,
      room_number: b.room_number,
      whatsapp: phoneFor(i),
      price: b.price,
      start_date: b.start_date,
      due_date: due,
      payment_status: status,
      days_to_due: daysBetween(today, due),
    };
  });
}

function buildPayments(tenants: Tenant[]): Payment[] {
  const today = todayIso();
  const list: Payment[] = [];
  for (let i = 0; i < tenants.length; i++) {
    const t = tenants[i];
    const sit = i % 5;
    const curDue = dayInMonth(today, dayOfMonth(t.start_date));
    const paid = sit !== 2 && sit !== 3;

    if (paid) {
      const late = sit === 1;
      const paidAt = late ? addDays(curDue, 2 + (i % 4)) : addDays(curDue, -(2 + (i % 4)));
      list.push({
        payment_id: `p_${i + 1}_c`,
        tenant_name: t.name,
        room_number: t.room_number,
        period: periodOf(curDue),
        amount: t.price,
        due_date: curDue,
        paid_at: paidAt,
        method: late ? 'Transfer' : 'Tunai',
        status: 'sudah_bayar',
      });
    } else {
      const owed = sit === 3 && curDue >= today ? addMonthKeepDay(curDue, -1) : curDue;
      list.push({
        payment_id: `p_${i + 1}_c`,
        tenant_name: t.name,
        room_number: t.room_number,
        period: periodOf(owed),
        amount: t.price,
        due_date: owed,
        paid_at: null,
        method: null,
        status: owed === today ? 'jatuh_tempo' : 'belum_bayar',
      });
    }

    const prevDue = addMonthKeepDay(curDue, -1);
    const prevLate = i % 3 === 0;
    list.push({
      payment_id: `p_${i + 1}_p`,
      tenant_name: t.name,
      room_number: t.room_number,
      period: periodOf(prevDue),
      amount: t.price,
      due_date: prevDue,
      paid_at: prevLate ? addDays(prevDue, 3) : addDays(prevDue, -2),
      method: 'Transfer',
      status: 'sudah_bayar',
    });

    const prev2Due = addMonthKeepDay(curDue, -2);
    const prev2Late = i % 4 === 3;
    list.push({
      payment_id: `p_${i + 1}_p2`,
      tenant_name: t.name,
      room_number: t.room_number,
      period: periodOf(prev2Due),
      amount: t.price,
      due_date: prev2Due,
      paid_at: prev2Late ? addDays(prev2Due, 2) : addDays(prev2Due, -3),
      method: 'Tunai',
      status: 'sudah_bayar',
    });
  }
  return list;
}

function buildRooms(tenants: Tenant[]): Room[] {
  const byRoom = new Map(tenants.map((t) => [t.room_number, t]));
  return berlyRooms.map((s) => {
    const t = byRoom.get(s.room_number);
    if (t) {
      return {
        room_number: s.room_number,
        status: 'terisi',
        payment_status: t.payment_status,
        tenant_name: t.name,
        tenant_id: t.tenant_id,
        price: s.price,
        remark: s.remark ?? null,
        due_date: t.due_date,
        duration_days: daysBetween(t.start_date, t.due_date) - 30,
        days_to_due: t.days_to_due ?? null,
        payment_id: `p_${(t.tenant_id ?? '').replace('t_', '')}_c`,
      };
    }
    return {
      room_number: s.room_number,
      status: s.status,
      payment_status: null,
      tenant_name: null,
      tenant_id: null,
      price: s.price,
      remark: s.remark ?? null,
      due_date: null,
      duration_days: null,
      days_to_due: null,
      payment_id: null,
    };
  });
}

export function buildMockDatabase(): MockDatabase {
  const tenants = buildTenants();
  const payments = buildPayments(tenants);
  const rooms = buildRooms(tenants);
  return { settings: mockSettings, rooms, tenants, payments };
}

export function computeStats(db: MockDatabase, today = todayIso()): Stats {
  const occupied = db.rooms.filter((r) => r.status === 'terisi');
  const unpaid = db.tenants.filter((t) => t.payment_status === 'belum_bayar' || t.payment_status === 'jatuh_tempo');
  const paidThisMonth = db.payments.filter((p) => p.status === 'sudah_bayar' && !!p.paid_at && p.paid_at.startsWith(currentPeriod()));
  const unpaidDefault = unpaid.reduce((s, t) => s + t.price, 0);
  const dueToday = unpaid.filter((t) => t.due_date === today);
  const upcoming = unpaid.filter((t) => t.due_date > today && t.due_date <= addDays(today, 7));
  return {
    total_kamar: db.rooms.length,
    kamar_terisi: occupied.length,
    kamar_kosong: db.rooms.filter((r) => r.status === 'kosong').length,
    penghuni_aktif: db.tenants.length,
    sudah_bayar: db.tenants.filter((t) => t.payment_status === 'sudah_bayar').length,
    belum_bayar: unpaid.length,
    jatuh_tempo_hari_ini: dueToday.length,
    akan_jatuh_tempo: upcoming.length,
    terlambat: db.tenants.filter((t) => t.payment_status === 'terlambat').length,
    pendapatan_bulan_ini: paidThisMonth.reduce((s, p) => s + p.amount, 0),
    total_default: unpaidDefault,
  };
}

export function computeRecentPayments(db: MockDatabase): RecentPayment[] {
  return db.payments
    .filter((p) => p.status === 'sudah_bayar' && p.paid_at)
    .sort((a, b) => (b.paid_at ?? '').localeCompare(a.paid_at ?? ''))
    .slice(0, 8)
    .map((p) => ({ id: p.payment_id, tenant_name: p.tenant_name, room_number: p.room_number, paid_date: p.paid_at ?? '', paid_amount: p.amount, status: p.status }));
}

export function buildDashboardData(db: MockDatabase): DashboardData {
  const today = todayIso();
  return {
    today,
    stats: computeStats(db, today),
    action_items: computeReminders(db, today).slice(0, 6),
    recent_payments: computeRecentPayments(db),
  };
}

export function computeReminders(db: MockDatabase, today = todayIso()): ActionItem[] {
  const byRoom = new Map(db.tenants.map((t) => [t.room_number, t]));
  const items: ActionItem[] = [];
  for (const p of db.payments) {
    if (p.status === 'sudah_bayar') continue;
    const t = byRoom.get(p.room_number);
    const days = daysBetween(today, p.due_date);
    let bucket: ActionItem['bucket'];
    if (days < 0) bucket = 'terlambat';
    else if (days === 0) bucket = 'hari_ini';
    else if (days <= 3) bucket = 'h3';
    else continue;
    items.push({ payment_id: p.payment_id, tenant_name: p.tenant_name, room_number: p.room_number, whatsapp: t?.whatsapp ?? '', amount: p.amount, due_date: p.due_date, days_to_due: days, bucket });
  }
  items.sort((a, b) => a.days_to_due - b.days_to_due);
  return items;
}

export function findActivePayment(db: MockDatabase, tenant: Tenant): Payment | undefined {
  return db.payments.find((p) => p.room_number === tenant.room_number && p.tenant_name === tenant.name && !p.paid_at);
}

export function isPaidLateStatus(p: Payment): boolean {
  return isPaidLate(p.paid_at, p.due_date);
}
import { IS_DEMO, supabase } from './supabase';
import type { ActionItem, DashboardData, KosSettings, Payment, Room, Stats, Tenant } from './types';
import { buildDashboardData, buildMockDatabase, computeRecentPayments, computeReminders, computeStats, mockSettings, type MockDatabase } from './mock';
import { addMonthKeepDay, daysBetween, periodOf, todayIso } from './kos';
import { loadStoredDb, storeDb } from './persist';

let db: MockDatabase | null = null;

function getDb(): MockDatabase {
  if (!db) {
    const stored = loadStoredDb<MockDatabase>();
    if (stored && stored.settings && Array.isArray(stored.rooms) && Array.isArray(stored.tenants) && Array.isArray(stored.payments)) {
      db = stored;
    } else {
      db = buildMockDatabase();
    }
  }
  return db;
}

function persistDb(): void {
  if (db) storeDb(db);
}

const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms));

function throwErr(error: { message: string } | null): never {
  throw new Error(error?.message ?? 'Terjadi kesalahan');
}

async function currentUserId(): Promise<string | null> {
  const { data } = await supabase()!.auth.getUser();
  return data.user?.id ?? null;
}

function toDb(row: { settings?: KosSettings; rooms?: Room[]; tenants?: Tenant[]; payments?: Payment[] }): MockDatabase {
  return {
    settings: row.settings ?? mockSettings,
    rooms: (row.rooms ?? []) as Room[],
    tenants: (row.tenants ?? []) as Tenant[],
    payments: (row.payments ?? []) as Payment[],
  };
}

async function liveTables(): Promise<MockDatabase> {
  const uid = await currentUserId();
  if (!uid) return toDb({ settings: mockSettings });
  const [settingsRes, roomsRes, tenantsRes, paymentsRes] = await Promise.all([
    supabase()!.from('settings').select('*').eq('id', uid).maybeSingle(),
    supabase()!.from('rooms').select('*'),
    supabase()!.from('tenants').select('*'),
    supabase()!.from('payments').select('*'),
  ]);
  if (settingsRes.error) throwErr(settingsRes.error);
  if (roomsRes.error) throwErr(roomsRes.error);
  if (tenantsRes.error) throwErr(tenantsRes.error);
  if (paymentsRes.error) throwErr(paymentsRes.error);
  return toDb({ settings: settingsRes.data ?? undefined, rooms: roomsRes.data ?? [], tenants: tenantsRes.data ?? [], payments: paymentsRes.data ?? [] });
}

function enrichRooms(rooms: Room[], tenants: Tenant[], payments: Payment[]): Room[] {
  const byRoom = new Map(tenants.map((t) => [t.room_number, t]));
  const today = todayIso();
  return rooms.map((r) => {
    const t = byRoom.get(r.room_number);
    if (t) {
      const activePay = payments.find((p) => p.room_number === t.room_number && p.tenant_name === t.name && !p.paid_at);
      return {
        room_number: r.room_number,
        status: 'terisi',
        payment_status: t.payment_status,
        tenant_name: t.name,
        tenant_id: t.tenant_id,
        price: Number(r.price),
        remark: r.remark ?? null,
        due_date: t.due_date,
        duration_days: daysBetween(t.start_date, t.due_date) - 30,
        days_to_due: daysBetween(today, t.due_date),
        payment_id: activePay?.payment_id ? String(activePay.payment_id) : null,
      };
    }
    return {
      room_number: r.room_number,
      status: r.status,
      payment_status: null,
      tenant_name: null,
      tenant_id: null,
      price: Number(r.price),
      remark: r.remark ?? null,
      due_date: null,
      duration_days: null,
      days_to_due: null,
      payment_id: null,
    };
  });
}

async function getSettings(): Promise<KosSettings> {
  if (IS_DEMO) {
    await delay();
    return getDb().settings;
  }
  const uid = await currentUserId();
  if (!uid) return mockSettings;
  const { data, error } = await supabase()!.from('settings').select('*').eq('id', uid).maybeSingle();
  if (error) return throwErr(error);
  return (data ?? mockSettings) as KosSettings;
}

async function updateSettings(patch: Partial<KosSettings> & { nama_kos?: string; nama_pemilik?: string }): Promise<KosSettings> {
  if (IS_DEMO) {
    await delay();
    getDb().settings = { ...getDb().settings, ...patch };
    persistDb();
    return getDb().settings;
  }
  const uid = await currentUserId();
  if (!uid) return mockSettings;
  const { data: rows } = await supabase()!.from('settings').select('id').eq('id', uid).limit(1);
  await delay(0);
  if (rows?.[0]) {
    const { data, error } = await supabase()!.from('settings').update(patch).eq('id', uid).select().single();
    if (error) return throwErr(error);
    return data as KosSettings;
  }
  const { data, error } = await supabase()!.from('settings').insert({ id: uid, owner_id: uid, ...mockSettings, ...patch }).select().single();
  if (error) return throwErr(error);
  return data as KosSettings;
}

async function getStats(): Promise<Stats> {
  if (IS_DEMO) {
    await delay();
    return computeStats(getDb());
  }
  return computeStats(await liveTables());
}

async function getDashboard(): Promise<DashboardData> {
  if (IS_DEMO) {
    await delay();
    return buildDashboardData(getDb());
  }
  const db = await liveTables();
  return {
    today: todayIso(),
    stats: computeStats(db),
    action_items: computeReminders(db).slice(0, 6),
    recent_payments: computeRecentPayments(db),
  };
}

async function getRooms(): Promise<Room[]> {
  if (IS_DEMO) {
    await delay();
    return getDb().rooms;
  }
  const { data, error } = await supabase()!.from('rooms').select('*');
  if (error) return throwErr(error);
  const db = await liveTables();
  return enrichRooms(data ?? [], db.tenants, db.payments);
}

async function getTenants(): Promise<Tenant[]> {
  if (IS_DEMO) {
    await delay();
    return getDb().tenants;
  }
  const { data, error } = await supabase()!.from('tenants').select('*');
  if (error) return throwErr(error);
  return (data ?? []) as Tenant[];
}

async function getPayments(period?: string): Promise<Payment[]> {
  if (IS_DEMO) {
    await delay();
    const list = getDb().payments;
    if (!period || period === 'semua') return [...list].sort((a, b) => b.period.localeCompare(a.period));
    return list.filter((p) => p.period === period);
  }
  let q = supabase()!.from('payments').select('*');
  if (period && period !== 'semua') q = q.eq('period', period);
  const { data, error } = await q.order('due_date', { ascending: false });
  if (error) return throwErr(error);
  return (data ?? []) as Payment[];
}

async function getPeriods(): Promise<string[]> {
  if (IS_DEMO) {
    await delay(200);
    const set = new Set(getDb().payments.map((p) => p.period));
    return [...set].sort((a, b) => b.localeCompare(a));
  }
  const { data, error } = await supabase()!.from('payments').select('period');
  if (error) return throwErr(error);
  return [...new Set((data ?? []).map((r) => r.period))].sort((a, b) => b.localeCompare(a));
}

async function getReminders(): Promise<ActionItem[]> {
  if (IS_DEMO) {
    await delay();
    return computeReminders(getDb());
  }
  const [payRes, tenRes] = await Promise.all([
    supabase()!.from('payments').select('*').in('status', ['belum_bayar', 'jatuh_tempo', 'terlambat']),
    supabase()!.from('tenants').select('*'),
  ]);
  if (payRes.error) return throwErr(payRes.error);
  if (tenRes.error) return throwErr(tenRes.error);
  return computeReminders(toDb({ tenants: (tenRes.data ?? []) as Tenant[], payments: (payRes.data ?? []) as Payment[] }));
}

type TenantInput = Omit<Tenant, 'tenant_id' | 'payment_status'>;

type RoomInput = { room_number: string; price: number; status: 'kosong' | 'perbaikan' };

async function addRoom(input: RoomInput): Promise<Room> {
  if (IS_DEMO) {
    await delay();
    if (getDb().rooms.some((r) => r.room_number === input.room_number)) {
      throw new Error('Nomor kamar sudah digunakan.');
    }
    const room: Room = { ...input, payment_status: null, tenant_name: null, tenant_id: null, due_date: null, duration_days: null, days_to_due: null, payment_id: null };
    getDb().rooms.push(room);
    persistDb();
    return room;
  }
  const { data, error } = await supabase()!.from('rooms').insert({ room_number: input.room_number, price: input.price, status: input.status }).select().single();
  if (error) return throwErr(error);
  return {
    ...(data as Room),
    payment_status: null,
    tenant_name: null,
    tenant_id: null,
    due_date: null,
    duration_days: null,
    days_to_due: null,
    payment_id: null,
  };
}

async function addTenant(input: TenantInput): Promise<Tenant> {
  if (IS_DEMO) {
    await delay();
    const tenant: Tenant = { ...input, tenant_id: `t_${Date.now()}`, payment_status: 'belum_bayar', days_to_due: daysBetween(todayIso(), input.due_date) };
    getDb().tenants.push(tenant);
    getDb().payments.push({
      payment_id: `p_${tenant.tenant_id}`,
      tenant_name: input.name,
      room_number: input.room_number,
      period: periodOf(input.due_date),
      amount: input.price,
      due_date: input.due_date,
      paid_at: null,
      method: null,
      status: input.due_date === todayIso() ? 'jatuh_tempo' : 'belum_bayar',
    });
    getDb().rooms = getDb().rooms.map((r) => (r.room_number === input.room_number ? { ...r, status: 'terisi', tenant_name: input.name, price: input.price, due_date: input.due_date, payment_status: 'belum_bayar', tenant_id: tenant.tenant_id } : r));
    persistDb();
    return tenant;
  }
  const { data: created, error } = await supabase()!.from('tenants').insert(input).select().single();
  if (error) return throwErr(error);
  const tenant = created as Tenant;
  const due = input.due_date;
  const { error: pErr } = await supabase()!
    .from('payments')
    .upsert(
      {
        tenant_name: input.name,
        room_number: input.room_number,
        period: periodOf(due),
        amount: Number(input.price),
        due_date: due,
        paid_at: null,
        method: null,
        status: due === todayIso() ? 'jatuh_tempo' : 'belum_bayar',
      },
      { onConflict: 'owner_id,room_number,period' },
    );
  if (pErr) return throwErr(pErr);
  const { error: rErr } = await supabase()!.from('rooms').update({ status: 'terisi' }).eq('room_number', input.room_number);
  if (rErr) return throwErr(rErr);
  return tenant;
}

async function updateTenant(tenantId: string, patch: Partial<TenantInput>): Promise<Tenant> {
  if (IS_DEMO) {
    await delay();
    const i = getDb().tenants.findIndex((t) => t.tenant_id === tenantId);
    if (i < 0) throw new Error('Penghuni tidak ditemukan');
    const prev = getDb().tenants[i];
    const merged = { ...prev, ...patch, days_to_due: patch.due_date ? daysBetween(todayIso(), patch.due_date) : prev.days_to_due };
    getDb().tenants[i] = merged;
    const unpaid = getDb().payments.find((p) => p.room_number === merged.room_number && p.tenant_name === merged.name && !p.paid_at);
    if (unpaid && patch.due_date) {
      unpaid.due_date = patch.due_date;
      unpaid.amount = Number(patch.price ?? merged.price);
      unpaid.period = periodOf(patch.due_date);
    }
    getDb().rooms = getDb().rooms.map((r) => (r.room_number === merged.room_number ? { ...r, status: 'terisi', tenant_name: merged.name, price: merged.price, due_date: merged.due_date, payment_status: merged.payment_status, tenant_id: merged.tenant_id } : r));
    persistDb();
    return merged;
  }
  const { data, error } = await supabase()!.from('tenants').update(patch).eq('tenant_id', tenantId).select().single();
  if (error) return throwErr(error);
  const merged = data as Tenant;
  if (patch.due_date || patch.price || patch.room_number || patch.name) {
    const { error: pErr } = await supabase()!
      .from('payments')
      .upsert(
        {
          tenant_name: merged.name,
          room_number: merged.room_number,
          period: periodOf(merged.due_date),
          amount: Number(patch.price ?? merged.price),
          due_date: merged.due_date,
          paid_at: null,
          method: null,
          status: merged.due_date === todayIso() ? 'jatuh_tempo' : 'belum_bayar',
        },
        { onConflict: 'owner_id,room_number,period' },
      );
    if (pErr) return throwErr(pErr);
  }
  const { error: rErr } = await supabase()!.from('rooms').update({ status: 'terisi' }).eq('room_number', merged.room_number);
  if (rErr) return throwErr(rErr);
  return merged;
}

async function deleteTenant(tenantId: string): Promise<void> {
  if (IS_DEMO) {
    await delay();
    const t = getDb().tenants.find((x) => x.tenant_id === tenantId);
    if (t) {
      getDb().rooms = getDb().rooms.map((r) => (r.room_number === t.room_number ? { ...r, status: 'kosong', tenant_name: null, payment_status: null, due_date: null } : r));
    }
    getDb().tenants = getDb().tenants.filter((x) => x.tenant_id !== tenantId);
    persistDb();
    return;
  }
  const { data: rows } = await supabase()!.from('tenants').select('room_number, name').eq('tenant_id', tenantId);
  const t = rows?.[0];
  if (t) {
    const { error: pErr } = await supabase()!.from('payments').delete().eq('room_number', t.room_number).eq('tenant_name', t.name);
    if (pErr) return throwErr(pErr);
  }
  const { error } = await supabase()!.from('tenants').delete().eq('tenant_id', tenantId);
  if (error) return throwErr(error);
  if (t) {
    const { error: rErr } = await supabase()!.from('rooms').update({ status: 'kosong' }).eq('room_number', t.room_number);
    if (rErr) return throwErr(rErr);
  }
}

async function markPaid(paymentId: string, opts?: { method?: string; date?: string }): Promise<void> {
  if (IS_DEMO) {
    await delay();
    const today = opts?.date ?? todayIso();
    const p = getDb().payments.find((x) => x.payment_id === paymentId);
    if (p) {
      p.status = 'sudah_bayar';
      p.paid_at = today;
      p.method = opts?.method ?? 'Tunai';

      const nextDue = addMonthKeepDay(p.due_date, 1);
      const nextPeriod = periodOf(nextDue);
      const existing = getDb().payments.find((x) => x.room_number === p.room_number && x.tenant_name === p.tenant_name && x.period === nextPeriod);
      if (existing) {
        existing.due_date = nextDue;
        existing.amount = p.amount;
        existing.status = 'belum_bayar';
        existing.paid_at = null;
        existing.method = null;
      } else {
        getDb().payments.push({
          payment_id: `p_${nextPeriod}_${p.room_number.replace(/[^a-zA-Z0-9]/g, '')}`,
          tenant_name: p.tenant_name,
          room_number: p.room_number,
          period: nextPeriod,
          amount: p.amount,
          due_date: nextDue,
          paid_at: null,
          method: null,
          status: 'belum_bayar',
        });
      }

      const tenant = getDb().tenants.find((t) => t.room_number === p.room_number && t.name === p.tenant_name);
      if (tenant) {
        tenant.due_date = nextDue;
        tenant.payment_status = 'belum_bayar';
        tenant.days_to_due = daysBetween(today, nextDue);
      }
      getDb().rooms = getDb().rooms.map((r) => (r.room_number === p.room_number ? { ...r, due_date: nextDue, payment_status: 'belum_bayar' } : r));
    }
    persistDb();
    return;
  }
  const { data: rows } = await supabase()!.from('payments').select('*').eq('payment_id', paymentId);
  const p = rows?.[0] as Payment | undefined;
  if (!p) throwErr({ message: 'Pembayaran tidak ditemukan' });

  const paidOn = opts?.date ?? todayIso();
  const method = opts?.method ?? 'Tunai';

  const { error: uErr } = await supabase()!.from('payments').update({ status: 'sudah_bayar', paid_at: paidOn, method }).eq('payment_id', paymentId);
  if (uErr) return throwErr(uErr);

  const nextDue = addMonthKeepDay(String(p.due_date), 1);
  const nextPeriod = periodOf(nextDue);
  const { error: nErr } = await supabase()!
    .from('payments')
    .upsert(
      {
        tenant_name: p.tenant_name,
        room_number: p.room_number,
        period: nextPeriod,
        amount: Number(p.amount),
        due_date: nextDue,
        paid_at: null,
        method: null,
        status: 'belum_bayar',
      },
      { onConflict: 'owner_id,room_number,period' },
    );
  if (nErr) return throwErr(nErr);

  const { error: tErr } = await supabase()!
    .from('tenants')
    .update({ due_date: nextDue, payment_status: 'belum_bayar' })
    .eq('room_number', p.room_number)
    .eq('name', p.tenant_name);
  if (tErr) return throwErr(tErr);
}

async function updateRoomStatus(roomNumber: string, status: Room['status']): Promise<void> {
  if (IS_DEMO) {
    await delay();
    getDb().rooms = getDb().rooms.map((r) => {
      if (r.room_number !== roomNumber) return r;
      if (status === 'terisi') return r;
      return { ...r, status, tenant_name: null, payment_status: null, due_date: null, tenant_id: null };
    });
    persistDb();
    return;
  }
  const { error } = await supabase()!.from('rooms').update({ status }).eq('room_number', roomNumber);
  if (error) return throwErr(error);
}

async function updateRoom(roomNumber: string, patch: Partial<Omit<RoomInput, 'room_number'>>): Promise<Room> {
  if (IS_DEMO) {
    await delay();
    const i = getDb().rooms.findIndex((r) => r.room_number === roomNumber);
    if (i < 0) throw new Error('Kamar tidak ditemukan');
    const room = { ...getDb().rooms[i], ...patch };
    getDb().rooms[i] = room;
    persistDb();
    return room;
  }
  const { data, error } = await supabase()!.from('rooms').update(patch).eq('room_number', roomNumber).select().single();
  if (error) return throwErr(error);
  return {
    ...(data as Room),
    payment_status: null,
    tenant_name: null,
    tenant_id: null,
    due_date: null,
    duration_days: null,
    days_to_due: null,
    payment_id: null,
  };
}

async function deleteRoom(roomNumber: string): Promise<void> {
  if (IS_DEMO) {
    await delay();
    getDb().rooms = getDb().rooms.filter((r) => r.room_number !== roomNumber);
    getDb().payments = getDb().payments.filter((p) => p.room_number !== roomNumber);
    persistDb();
    return;
  }
  const { data: occ } = await supabase()!.from('tenants').select('tenant_id').eq('room_number', roomNumber).limit(1);
  if (occ && occ.length) throw new Error('Kamar masih terisi penghuni. Hapus penghuni dulu.');
  await supabase()!.from('payments').delete().eq('room_number', roomNumber);
  const { error } = await supabase()!.from('rooms').delete().eq('room_number', roomNumber);
  if (error) return throwErr(error);
}

export const api = {
  getSettings,
  updateSettings,
  getStats,
  getDashboard,
  getRooms,
  getTenants,
  getPayments,
  getPeriods,
  getReminders,
  addTenant,
  updateTenant,
  deleteTenant,
  addRoom,
  markPaid,
  updateRoomStatus,
  updateRoom,
  deleteRoom,
};

export function isDemoMode(): boolean {
  return IS_DEMO;
}
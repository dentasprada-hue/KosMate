import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IS_DEMO } from '@/lib/supabase';
import type { Payment } from '@/lib/types';

export type NotificationsModule = typeof import('expo-notifications');

let cachedModule: NotificationsModule | null | undefined;
function notifications(): NotificationsModule | null {
  if (cachedModule !== undefined) return cachedModule;
  try {
    cachedModule = require('expo-notifications') as NotificationsModule;
  } catch {
    cachedModule = null;
  }
  return cachedModule;
}

export const CHANNEL_ID = 'jatuh-tempo';
const DEDUPE_PREFIX = 'kosmate.notif.due.v3.';
const NOTIF_HOUR = 8;

export const NOTIF_URL_PAYMENTS = '/(tabs)/payments?filter=jatuh_tempo';

function isNative() {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

export function configureNotifications(): void {
  const N = notifications();
  if (!isNative() || IS_DEMO || !N) return;
  N.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
  if (Platform.OS === 'android') {
    N.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Jatuh Tempo Pembayaran',
      importance: N.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    }).catch(() => {});
  }
}

export async function ensureNotificationPermission(): Promise<boolean> {
  const N = notifications();
  if (!isNative() || IS_DEMO || !N) return false;
  try {
    const current = await N.getPermissionsAsync();
    if (current.granted) return true;
    if (current.ios?.status === N.IosAuthorizationStatus.PROVISIONAL) return true;
    if (current.ios?.status === N.IosAuthorizationStatus.DENIED || current.status === 'denied') return false;
    const req = await N.requestPermissionsAsync();
    return !!req.granted;
  } catch {
    return false;
  }
}

async function dedupeKey(paymentId: string, today: string): Promise<string> {
  return `${DEDUPE_PREFIX}${paymentId}.${today}`;
}

async function alreadyNotified(paymentId: string, today: string): Promise<boolean> {
  try {
    const v = await AsyncStorage.getItem(await dedupeKey(paymentId, today));
    return v === '1';
  } catch {
    return false;
  }
}

async function markNotified(paymentId: string, today: string): Promise<void> {
  try {
    await AsyncStorage.setItem(await dedupeKey(paymentId, today), '1');
  } catch {
    // abaikan
  }
}

function summaryBody(dueToday: Payment[]): string {
  if (dueToday.length === 1) {
    const p = dueToday[0];
    return `${p.tenant_name} — Kamar ${p.room_number} (${new Intl.NumberFormat('id-ID').format(Number(p.amount))} rupiah)`;
  }
  const names = dueToday.map((p) => p.tenant_name).slice(0, 5).join(', ');
  const extra = dueToday.length > 5 ? `, +${dueToday.length - 5} lainnya` : '';
  return `${dueToday.length} penghuni jatuh tempo hari ini: ${names}${extra}`;
}

export async function syncDueNotifications(payments: Payment[]): Promise<void> {
  const N = notifications();
  if (!isNative() || IS_DEMO || !N) {
    console.log('[KosMate] syncDueNotifications: SKIP gate', { isNative: isNative(), IS_DEMO, hasModule: !!N });
    return;
  }
  const allowed = await ensureNotificationPermission();
  if (!allowed) {
    console.log('[KosMate] syncDueNotifications: SKIP permission ditolak');
    return;
  }

  const today = new Date();
  const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const unpaid = payments.filter((p) => p.status !== 'sudah_bayar' && !p.paid_at);
  const dueToday = unpaid.filter((p) => p.due_date === todayIso);
  const future = unpaid.filter((p) => !!p.due_date && p.due_date > todayIso);
  console.log('[KosMate] syncDueNotifications: data', { payments: payments.length, unpaid: unpaid.length, dueToday: dueToday.length, future: future.length, todayIso });

  // jadwal ulang semua notifikasi (cancel semua, lalu isi ulang dari data terkini).
  await N.cancelAllScheduledNotificationsAsync();

  const summaryContent = {
    title: dueToday.length === 1 ? 'Penghuni jatuh tempo hari ini' : `${dueToday.length} penghuni jatuh tempo hari ini`,
    body: summaryBody(dueToday),
    data: { url: NOTIF_URL_PAYMENTS },
  };

  // 1) MASA DEPAN: DATE trigger 08:00 lewat AlarmManager (fire bahkan saat app mati).
  for (const p of future) {
    const [y, m, d] = p.due_date.split('-').map(Number);
    const fire = new Date(y, m - 1, d, NOTIF_HOUR, 0, 0);
    await N.scheduleNotificationAsync({
      content: {
        title: 'Jatuh tempo hari ini',
        body: `${p.tenant_name} — Kamar ${p.room_number} • sewa ${new Intl.NumberFormat('id-ID').format(Number(p.amount))} rupiah`,
        data: { url: NOTIF_URL_PAYMENTS },
      },
      trigger: {
        type: N.SchedulableTriggerInputTypes.DATE,
        date: fire,
        channelId: CHANNEL_ID,
      },
    }).catch(() => {});
  }

  if (dueToday.length > 0) {
    // 2) HARI INI (sebelum 08:00): pasang DATE 08:00 via AlarmManager sebagai jaminan
    //    kalau app ditutup — alarm tetap nyala. Di-re-add setiap sync (bukan dedup),
    //    karena cancelAll di atas menghapus semua jadwal.
    const today8 = new Date(today.getFullYear(), today.getMonth(), today.getDate(), NOTIF_HOUR, 0, 0);
    if (today.getTime() < today8.getTime()) {
      await N.scheduleNotificationAsync({
        content: summaryContent,
        trigger: {
          type: N.SchedulableTriggerInputTypes.DATE,
          date: today8,
          channelId: CHANNEL_ID,
        },
      });
      console.log('[KosMate] ringkasan jatuh tempo DIJADWALKAN 08:00 (AlarmManager)');
    }

    // 3) HARI INI: trigger null = langsung ter-posting saat app buka (dedup 1x/hari).
    const allNotified = [];
    for (const p of dueToday) allNotified.push(await alreadyNotified(p.payment_id, todayIso));
    console.log('[KosMate] syncDueNotifications:', { dueToday: dueToday.length, allNotified }, 'besok-notif-summary');
    if (!allNotified.every(Boolean)) {
      await N.scheduleNotificationAsync({
        content: summaryContent,
        trigger: null,
      });
      console.log('[KosMate] ringkasan jatuh tempo LANGSUNG ter-posting');
      for (const p of dueToday) await markNotified(p.payment_id, todayIso);
    }
  }
}
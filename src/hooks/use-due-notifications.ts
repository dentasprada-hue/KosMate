import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { api } from '@/lib/api';
import { subscribeRealtime } from '@/lib/realtime';
import { supabase } from '@/lib/supabase';
import { configureNotifications, ensureNotificationPermission, syncDueNotifications } from '@/lib/notifications';

export function useDueNotifications(): void {
  const running = useRef(false);
  const activeRef = useRef(AppState.currentState);

  useEffect(() => {
    let cancelled = false;

    configureNotifications();
    ensureNotificationPermission().catch(() => {});

    const resync = async () => {
      if (running.current) return;
      running.current = true;
      try {
        const client = supabase();
        const { data: u } = client ? await client.auth.getUser() : { data: { user: null } };
        console.log('[KosMate] useDueNotifications: resync mulai', { user: u.user?.email ?? u.user?.id ?? 'null' });
      } catch {
        console.log('[KosMate] useDueNotifications: resync mulai (user tidak terbaca)');
      }
      try {
        const payments = await api.getPayments();
        console.log('[KosMate] useDueNotifications: getPayments OK', payments.length, 'baris');
        if (!cancelled) await syncDueNotifications(payments);
      } catch (e) {
        console.log('[KosMate] useDueNotifications: getPayments GAGAL', (e as Error)?.message);
      } finally {
        running.current = false;
      }
    };

    resync();

    const onState = (next: AppStateStatus) => {
      if (activeRef.current.match(/inactive|background/) && next === 'active') {
        resync();
      }
      activeRef.current = next;
    };
    const sub = AppState.addEventListener('change', onState);

    const unsub = subscribeRealtime(() => {
      resync();
    });

    return () => {
      cancelled = true;
      sub.remove();
      unsub();
    };
  }, []);
}
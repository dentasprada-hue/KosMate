import { useEffect } from 'react';
import { IS_DEMO, supabase } from './supabase';

type RefreshListener = () => void;

const listeners = new Set<RefreshListener>();
let channel: ReturnType<NonNullable<ReturnType<typeof supabase>>['channel']> | null = null;
let polling: ReturnType<typeof setInterval> | null = null;

const POLL_MS = 60000;

function notify() {
  for (const fn of [...listeners]) {
    try {
      fn();
    } catch {
      // abaikan error per-listener
    }
  }
}

function startPolling() {
  if (polling || IS_DEMO) return;
  polling = setInterval(notify, POLL_MS);
}

function stopPolling() {
  if (polling) {
    clearInterval(polling);
    polling = null;
  }
}

function ensureChannel() {
  const client = supabase();
  if (IS_DEMO || !client || channel) return;
  channel = client
    .channel('kosmate-realtime')
    .on('postgres_changes', { event: '*', schema: 'public' }, () => notify())
    .subscribe();
  startPolling();
}

function teardownChannel() {
  const client = supabase();
  const ch = channel;
  channel = null;
  if (client && ch) {
    client.removeChannel(ch).catch(() => {});
  }
}

export function subscribeRealtime(refresh: RefreshListener): () => void {
  if (IS_DEMO) return () => {};
  listeners.add(refresh);
  ensureChannel();
  return () => {
    listeners.delete(refresh);
    if (listeners.size === 0) {
      stopPolling();
      teardownChannel();
    }
  };
}

export function useLiveRefresh(refresh: RefreshListener | null): void {
  useEffect(() => {
    if (!refresh) return;
    return subscribeRealtime(refresh);
  }, [refresh]);
}
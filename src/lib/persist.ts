import { Platform } from 'react-native';

const KEY = 'kosmate.demo.db.v4';

export function loadStoredDb<T>(): T | null {
  if (Platform.OS !== 'web' || typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function storeDb<T>(value: T): void {
  if (Platform.OS !== 'web' || typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    // storage penuh / mode private mode: abaikan
  }
}

export function clearStoredDb(): void {
  if (Platform.OS !== 'web' || typeof localStorage === 'undefined') return;
  try {
    localStorage.removeItem(KEY);
  } catch {
    // abaikan
  }
}
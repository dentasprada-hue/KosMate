import { Linking, Platform } from 'react-native';
import * as Application from 'expo-application';
import * as IntentLauncher from 'expo-intent-launcher';
import { IS_DEMO } from '@/lib/supabase';
import { CHANNEL_ID, type NotificationsModule } from '@/lib/notifications';

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

function isNative() {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

export type NotificationPermissionState = 'granted' | 'denied' | 'undetermined' | 'unavailable';

export async function getNotificationPermissionState(): Promise<NotificationPermissionState> {
  const N = notifications();
  if (!isNative() || IS_DEMO || !N) return 'unavailable';
  try {
    const current = await N.getPermissionsAsync();
    if (current.granted) return 'granted';
    if (current.ios?.status === N.IosAuthorizationStatus.PROVISIONAL) return 'granted';
    if (current.ios?.status === N.IosAuthorizationStatus.DENIED || current.status === 'denied') return 'denied';
    return 'undetermined';
  } catch {
    return 'unavailable';
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  const N = notifications();
  if (!isNative() || IS_DEMO || !N) return false;
  try {
    const current = await N.getPermissionsAsync();
    if (current.granted) return true;
    if (current.ios?.status === N.IosAuthorizationStatus.PROVISIONAL) return true;
    const req = await N.requestPermissionsAsync();
    return !!req.granted;
  } catch {
    return false;
  }
}

export async function openBatteryOptimizationSettings(): Promise<boolean> {
  if (Platform.OS !== 'android' || IS_DEMO) return false;
  try {
    const pkg = Application.applicationId;
    await IntentLauncher.startActivityAsync(
      IntentLauncher.ActivityAction.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS,
      { data: `package:${pkg}` }
    );
    return true;
  } catch {
    try {
      await IntentLauncher.startActivityAsync(
        IntentLauncher.ActivityAction.IGNORE_BATTERY_OPTIMIZATION_SETTINGS
      );
      return true;
    } catch {
      return false;
    }
  }
}

export function openAppSettings(): void {
  Linking.openSettings().catch(() => {});
}

export async function sendTestNotification(): Promise<boolean> {
  const N = notifications();
  if (!isNative() || IS_DEMO || !N) return false;
  const allowed = await requestNotificationPermission();
  if (!allowed) return false;
  try {
    console.log('[KosMate] sendTestNotification: posting immediate...');
    await N.scheduleNotificationAsync({
      content: {
        title: 'Notifikasi KosMate berfungsi',
        body: 'Ini notifikasi uji — kamu bisa kembali ke aplikasi sekarang.',
        data: { url: '/', test: true },
      },
      trigger: null,
    });
    console.log('[KosMate] sendTestNotification: posted OK');
    return true;
  } catch (e) {
    console.error('[KosMate] sendTestNotification error:', e);
    return false;
  }
}

export async function openNotificationSettings(): Promise<boolean> {
  if (Platform.OS !== 'android' || IS_DEMO) return false;
  try {
    const pkg = Application.applicationId;
    await IntentLauncher.startActivityAsync(
      IntentLauncher.ActivityAction.APP_NOTIFICATION_SETTINGS,
      { extra: { 'android.provider.extra.APP_PACKAGE': pkg } }
    );
    return true;
  } catch {
    openAppSettings();
    return true;
  }
}
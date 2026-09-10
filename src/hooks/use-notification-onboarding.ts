import { useEffect, useRef } from 'react';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getNotificationPermissionState,
  openBatteryOptimizationSettings,
  requestNotificationPermission,
} from '@/lib/device-permissions';

const ONBOARDED_KEY = 'kosmate.notif.onboarded.v1';

export function useNotificationOnboarding(): void {
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') return;

    (async () => {
      try {
        const state = await getNotificationPermissionState();
        if (state === 'undetermined') {
          await new Promise<void>((resolve) => {
            Alert.alert(
              'Izinkan Notifikasi',
              'KosMate akan mengingatkan kamu saat ada penghuni yang jatuh tempo pembayaran.',
              [
                { text: 'Nanti', style: 'cancel', onPress: () => resolve() },
                {
                  text: 'Izinkan',
                  onPress: async () => {
                    await requestNotificationPermission();
                    resolve();
                  },
                },
              ],
            );
          });
        }

        if (Platform.OS !== 'android') return;

        const done = await AsyncStorage.getItem(ONBOARDED_KEY);
        if (done !== '1') {
          await AsyncStorage.setItem(ONBOARDED_KEY, '1');
          await new Promise<void>((resolve) => {
            Alert.alert(
              'Izinkan Akses Baterai Tanpa Batas',
              'Supaya notifikasi tetap muncul saat HP dalam mode hemat baterai, izinkan KosMate berjalan di latar belakang tanpa batasan baterai.',
              [
                { text: 'Nanti', style: 'cancel', onPress: () => resolve() },
                {
                  text: 'Matikan Penghemat Baterai',
                  onPress: async () => {
                    await openBatteryOptimizationSettings();
                    resolve();
                  },
                },
              ],
            );
          });
        }
      } catch {
        // abaikan kegagalan pada perangkat yang tidak mendukung
      }
    })();
  }, []);
}
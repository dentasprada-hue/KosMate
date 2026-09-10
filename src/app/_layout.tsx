import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import type { Notification } from 'expo-notifications';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from '@/context/app-context';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { useKosMateFonts } from '@/hooks/use-kosmate-fonts';
import { useNotificationOnboarding } from '@/hooks/use-notification-onboarding';
import { ToastProvider } from '@/components/ui/toast';
import { AUTH_ENABLED } from '@/lib/supabase';
import { Colors } from '@/constants/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useKosMateFonts();

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppProvider>
          <ToastProvider>
            <StatusBar style="dark" />
            <AuthGate />
            <NotificationObserver />
            <NotificationOnboarding />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: Colors.background },
                animation: 'fade',
              }}
            >
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="tenants/[id]" />
              <Stack.Screen name="rooms/[id]" />
              <Stack.Screen name="payments/[id]" />
              <Stack.Screen name="invoice/[id]" />
              <Stack.Screen name="admin" />
              <Stack.Screen name="more/settings" />
              <Stack.Screen name="more/report" />
            </Stack>
          </ToastProvider>
        </AppProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

function NotificationOnboarding() {
  useNotificationOnboarding();
  return null;
}

function NotificationObserver() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user || Platform.OS === 'web') return;

    let N: typeof import('expo-notifications') | null = null;
    try {
      N = require('expo-notifications');
    } catch {
      N = null;
    }
    if (!N) return;

    const redirect = (notification: Notification) => {
      const url = notification.request.content.data?.url;
      if (typeof url === 'string') {
        router.push(url as never);
      }
    };

    const resp = N.getLastNotificationResponse();
    if (resp?.notification) redirect(resp.notification);

    const sub = N.addNotificationResponseReceivedListener((resp) => redirect(resp.notification));
    return () => sub.remove();
  }, [user]);

  return null;
}

function AuthGate() {
  const { user, role, loading, roleLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading || roleLoading) return;
    const inAuthGroup = segments[0] === '(auth)';
    const inAdmin = segments[0] === 'admin';

    if (!AUTH_ENABLED) {
      if (inAuthGroup) router.replace('/(tabs)');
      return;
    }
    if (!user) {
      if (!inAuthGroup) router.replace('/(auth)/login');
      return;
    }
    if (role === 'admin') {
      if (!inAdmin) router.replace('/admin');
      return;
    }
    if (inAdmin || inAuthGroup) router.replace('/(tabs)');
  }, [loading, roleLoading, user, role, segments]);

  return null;
}
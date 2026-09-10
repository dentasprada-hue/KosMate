import { router, Tabs } from 'expo-router';
import { BellRing, Building2, Home, MoreHorizontal, Users, Wallet } from 'lucide-react-native';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { Colors, FontFamily } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useDueNotifications } from '@/hooks/use-due-notifications';

function PillIcon({ icon: Icon, color, focused }: { icon: any; color: string; focused: boolean }) {
  return (
    <View style={[styles.pill, focused ? { backgroundColor: '#D1FAE5' } : { backgroundColor: 'transparent' }]}>
      <Icon size={22} color={color} strokeWidth={focused ? 2.4 : 2} />
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { user, role, roleLoading } = useAuth();

  useDueNotifications();

  useEffect(() => {
    if (role === 'admin') router.replace('/admin');
  }, [role]);

  if (role === 'admin') return null;

  if (user && roleLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: '#94A3B8',
        tabBarLabelStyle: { fontFamily: FontFamily.semibold, fontSize: 10, marginTop: 1 },
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: 'rgba(15,23,42,0.06)',
          borderTopWidth: 1,
          height: 64 + insets.bottom,
          paddingTop: 6,
          paddingBottom: Math.max(6, insets.bottom),
          shadowColor: '#0F172A',
          shadowOpacity: 0.08,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: -4 },
          elevation: 12,
        },
        tabBarHideOnKeyboard: true,
      }}
      backBehavior="history"
    >
      <Tabs.Screen name="index" options={{ title: 'Dashboard', tabBarIcon: ({ color, size, focused }) => <PillIcon icon={Home} color={color as string} focused={!!focused} /> }} />
      <Tabs.Screen name="rooms" options={{ title: 'Kamar', tabBarIcon: ({ color, size, focused }) => <PillIcon icon={Building2} color={color as string} focused={!!focused} /> }} />
      <Tabs.Screen name="tenants" options={{ title: 'Penghuni', tabBarIcon: ({ color, size, focused }) => <PillIcon icon={Users} color={color as string} focused={!!focused} /> }} />
      <Tabs.Screen name="payments" options={{ title: 'Bayar', tabBarIcon: ({ color, size, focused }) => <PillIcon icon={Wallet} color={color as string} focused={!!focused} /> }} />
      <Tabs.Screen name="reminder" options={{ title: 'Reminder', tabBarIcon: ({ color, size, focused }) => <PillIcon icon={BellRing} color={color as string} focused={!!focused} /> }} />
      <Tabs.Screen name="more" options={{ title: 'Lainnya', tabBarIcon: ({ color, size, focused }) => <PillIcon icon={MoreHorizontal} color={color as string} focused={!!focused} /> }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  pill: {
    width: 40,
    height: 30,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
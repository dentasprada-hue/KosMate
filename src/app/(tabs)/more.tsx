import { router } from 'expo-router';
import { BarChart3, LogOut, Settings, ShieldCheck } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { Screen, PressableRow } from '@/components/screen';
import { Colors, FontFamily, Radius, Spacing } from '@/constants/theme';
import { useApp } from '@/context/app-context';
import { useAuth } from '@/context/auth-context';
import { isDemoMode } from '@/lib/api';
import { supabase } from '@/lib/supabase';

export default function MoreScreen() {
  const { settings } = useApp();
  const { role } = useAuth();

  const logout = async () => {
    const s = supabase();
    if (s) await s.auth.signOut();
    router.replace('/(auth)/login');
  };

  return (
    <Screen title="Lainnya" subtitle="Pengaturan, laporan & akun" contentContainerStyle={{ gap: Spacing.lg }}>
      {settings ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md }}>
          <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: '#059669', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontFamily: FontFamily.extrabold, fontSize: 20, color: '#FFFFFF' }}>{(settings.nama_kos ?? 'K').charAt(0)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: FontFamily.bold, fontSize: 16, color: Colors.foreground }}>{settings.nama_kos}</Text>
            <Text style={{ fontFamily: FontFamily.regular, fontSize: 13, color: Colors.mutedForeground }}>
              {settings.nama_pemilik || (isDemoMode() ? 'Mode Demo' : 'Pemilik Kos')}
            </Text>
          </View>
        </View>
      ) : null}

      {role === 'admin' ? (
        <View>
          <PressableRow roundedTop roundedBottom leftIcon={<IconBox bg="#0F172A"><ShieldCheck size={18} color="#fff" /></IconBox>} title="Admin" subtitle="Buat akun & daftar pemilik kos" right={<Chev />} onPress={() => router.push('/admin')} />
        </View>
      ) : null}

      <View>
        <PressableRow roundedTop leftIcon={<IconBox bg="#7C3AED"><BarChart3 size={18} color="#fff" /></IconBox>} title="Laporan" subtitle="Ringkasan pemasukan bulanan" right={<Chev />} onPress={() => router.push('/more/report')} />
        <PressableRow roundedBottom leftIcon={<IconBox bg="#D97706"><Settings size={18} color="#fff" /></IconBox>} title="Pengaturan" subtitle="Profil kos, WhatsApp, integrasi" right={<Chev />} onPress={() => router.push('/more/settings')} />
      </View>

      <PressableRow
        roundedTop
        roundedBottom
        leftIcon={<IconBox bg="#FFE4E6"><LogOut size={18} color="#BE123C" /></IconBox>}
        title="Keluar"
        subtitle="Logout dari akun"
        onPress={logout}
      />
    </Screen>
  );
}

function IconBox({ children, bg }: { children: React.ReactNode; bg: string }) {
  return <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>{children}</View>;
}

function Chev() {
  return <Text style={{ color: Colors.mutedForeground, fontFamily: FontFamily.regular, fontSize: 18 }}>›</Text>;
}
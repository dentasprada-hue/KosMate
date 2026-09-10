import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { Link, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form';
import { Colors, FontFamily, Radius, Spacing } from '@/constants/theme';
import { AUTH_ENABLED, supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/toast';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!AUTH_ENABLED) router.replace('/(tabs)');
  }, []);

  const submit = async () => {
    if (!AUTH_ENABLED || !supabase()) {
      router.replace('/(tabs)');
      return;
    }
    if (!email || !password) {
      toast('Email dan kata sandi wajib diisi', 'error');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase()!.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.replace('/(tabs)');
    } catch (e: any) {
      toast(e?.message ?? 'Gagal masuk', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#FFFFFF' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: Spacing.xl }} keyboardShouldPersistTaps="handled">
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Image
              source={require('../../../assets/images/logo-banner.jpg')}
              style={{ width: 80, height: 80, borderRadius: 40 }}
              resizeMode="cover"
            />
          </View>
          <Text style={styles.logoTitle}>KosMate</Text>
          <Text style={styles.logoSubtitle}>Kelola kos, pembayaran & pengingat dalam satu aplikasi.</Text>
        </View>

        <FormField label="Email" required>
          <Input autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} placeholder="nama@email.com" />
        </FormField>
        <FormField label="Kata Sandi" required>
          <Input
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            rightElement={
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} accessibilityLabel={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}>
                {showPassword ? <EyeOff size={20} color={Colors.mutedForeground} /> : <Eye size={20} color={Colors.mutedForeground} />}
              </TouchableOpacity>
            }
          />
        </FormField>

        <Button loading={loading} onPress={submit} size="lg" style={{ borderRadius: Radius.md }}>
          Masuk
        </Button>

        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.lg }}>
          <Text style={{ color: Colors.mutedForeground, fontFamily: FontFamily.regular, fontSize: 14, textAlign: 'center' }}>
            Akun dibuat oleh admin KosMate.
          </Text>
        </View>

        {AUTH_ENABLED ? (
          <View style={{ marginTop: Spacing.xl, padding: Spacing.md, backgroundColor: '#ECFDF5', borderRadius: Radius.md, borderWidth: 1, borderColor: '#A7F3D0' }}>
            <Text style={{ fontFamily: FontFamily.medium, fontSize: 12, color: '#065F46', textAlign: 'center', lineHeight: 18 }}>
              Masuk dengan akun pemilik kos untuk melanjutkan.
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  logoTitle: {
    fontFamily: FontFamily.extrabold,
    fontSize: 32,
    color: Colors.foreground,
    marginTop: Spacing.lg,
    letterSpacing: -0.5,
  },
  logoSubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    color: Colors.mutedForeground,
    marginTop: 4,
    textAlign: 'center',
    maxWidth: 280,
  },
});
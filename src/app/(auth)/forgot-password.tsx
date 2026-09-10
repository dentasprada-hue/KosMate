import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form';
import { Colors, FontFamily, Radius, Spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/toast';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const submit = async () => {
    if (!email) {
      toast('Masukkan email terlebih dahulu', 'error');
      return;
    }
    setLoading(true);
    if (!supabase()) {
      toast('Demo aktif — reset kata sandi tidak tersedia');
      setLoading(false);
      return;
    }
    try {
      const { error } = await supabase()!.auth.resetPasswordForEmail(email, { redirectTo: 'kosmate://login' });
      if (error) throw error;
      setSent(true);
    } catch (e: any) {
      toast(e?.message ?? 'Gagal mengirim email', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#FFFFFF' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: Spacing.xl }} keyboardShouldPersistTaps="handled">
        <Text style={{ fontFamily: FontFamily.extrabold, fontSize: 28, color: Colors.foreground, marginBottom: 4 }}>Atur Ulang Kata Sandi</Text>
        <Text style={{ fontFamily: FontFamily.regular, fontSize: 14, color: Colors.mutedForeground, marginBottom: Spacing.xl }}>
          Masukkan email yang terdaftar. Kami akan mengirimkan link untuk mengatur ulang kata sandi.
        </Text>

        {sent ? (
          <View style={{ padding: Spacing.lg, backgroundColor: '#ECFDF5', borderRadius: Radius.md, borderWidth: 1, borderColor: '#A7F3D0', marginBottom: Spacing.lg }}>
            <Text style={{ fontFamily: FontFamily.semibold, fontSize: 14, color: '#065F46', textAlign: 'center', lineHeight: 20 }}>
              Link atur ulang kata sandi telah dikirim ke email Anda. Silakan cek inbox atau spam.
            </Text>
          </View>
        ) : (
          <>
            <FormField label="Email" required>
              <Input autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} placeholder="nama@email.com" />
            </FormField>
            <Button loading={loading} onPress={submit} size="lg" style={{ borderRadius: Radius.md, marginTop: Spacing.md }}>
              Kirim Link Reset
            </Button>
          </>
        )}

        <Button variant="ghost" onPress={() => router.back()} style={{ marginTop: Spacing.lg, alignSelf: 'center' }}>
          <Text style={{ color: Colors.primary, fontFamily: FontFamily.semibold, fontSize: 14 }}>Kembali ke masuk</Text>
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
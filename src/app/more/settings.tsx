import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField, RadioGroup } from '@/components/ui/form';
import { Colors, FontFamily, Radius, Spacing } from '@/constants/theme';
import { useApp } from '@/context/app-context';
import { useToast } from '@/components/ui/toast';

export default function SettingsScreen() {
  const { settings, updateSettings } = useApp();
  const { toast } = useToast();
  const [namaKos, setNamaKos] = useState(settings?.nama_kos ?? '');
  const [namaPemilik, setNamaPemilik] = useState(settings?.nama_pemilik ?? '');
  const [whatsapp, setWhatsapp] = useState(settings?.whatsapp_kos ?? '');
  const [alamat, setAlamat] = useState(settings?.alamat ?? '');
  const [tipe, setTipe] = useState(settings?.tipe_kos ?? 'campur');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await updateSettings({ nama_kos: namaKos, nama_pemilik: namaPemilik, whatsapp_kos: whatsapp, alamat, tipe_kos: tipe as any });
      toast('Pengaturan disimpan', 'success');
    } catch (e: any) {
      toast(e?.message ?? 'Gagal menyimpan', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.background }} contentContainerStyle={{ padding: Spacing.lg, gap: Spacing.lg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md }}>
        <Button variant="ghost" size="iconSm" onPress={() => router.back()}><ArrowLeft size={20} color={Colors.foreground} /></Button>
        <Text style={{ fontFamily: FontFamily.extrabold, fontSize: 22, color: Colors.foreground }}>Pengaturan</Text>
      </View>

      <View style={{ backgroundColor: Colors.card, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border, padding: Spacing.lg, gap: 4 }}>
        <Text style={{ fontFamily: FontFamily.bold, fontSize: 14, color: Colors.foreground, marginBottom: 12 }}>Profil Kos</Text>
        <FormField label="Nama Kos">
          <Input value={namaKos} onChangeText={setNamaKos} placeholder="contoh: Kos Bu Rina" />
        </FormField>
        <FormField label="Nama Pemilik">
          <Input value={namaPemilik} onChangeText={setNamaPemilik} placeholder="contoh: Rina Wati" />
        </FormField>
        <FormField label="Nomor WhatsApp Kos">
          <Input keyboardType="phone-pad" value={whatsapp} onChangeText={setWhatsapp} placeholder="08xxxxxxxxxx" />
        </FormField>
        <FormField label="Alamat Kos">
          <Input value={alamat} onChangeText={setAlamat} placeholder="Jl. ... Kota ..." multiline />
        </FormField>
        <FormField label="Tipe Kos" hint="Digunakan sebagai filter penghuni berdasarkan jenis kelamin.">
          <RadioGroup options={[{ value: 'campur', label: 'Campur' }, { value: 'putra', label: 'Khusus Putra' }, { value: 'putri', label: 'Khusus Putri' }]} value={tipe} onChange={(v) => setTipe(v as 'campur' | 'putra' | 'putri')} />
        </FormField>
      </View>

      <Button loading={saving} onPress={save} size="lg">Simpan Pengaturan</Button>
    </ScrollView>
  );
}
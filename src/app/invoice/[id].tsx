import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, FileText } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Spacing, Colors, FontFamily } from '@/constants/theme';
import { useApp } from '@/context/app-context';
import { rupiah, tanggalPanjang } from '@/lib/kos';

export default function InvoiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { settings } = useApp();

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg + 4 }}>
        <Button variant="ghost" size="iconSm" onPress={() => router.back()}><ArrowLeft size={20} color={Colors.foreground} /></Button>
        <Text style={{ fontFamily: FontFamily.extrabold, fontSize: 22, color: Colors.foreground }}>Invoice</Text>
      </View>

      <View style={{ padding: Spacing.lg, gap: Spacing.lg }}>
        <Card style={{ alignItems: 'center', gap: Spacing.md, padding: Spacing.xl }}>
          <View style={{ width: 56, height: 56, borderRadius: 14, backgroundColor: '#E0F2FE', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={24} color="#0369A1" />
          </View>
          <Text style={{ fontFamily: FontFamily.bold, fontSize: 18, color: Colors.foreground }}>Invoice #{id ?? '—'}</Text>
          <Text style={{ fontFamily: FontFamily.regular, fontSize: 14, color: Colors.mutedForeground, textAlign: 'center', lineHeight: 20 }}>
            Invoice dibuat saat pembayaran dikonfirmasi. Salin kode ini untuk referensi jika ada kendala.
          </Text>
        </Card>

        <Card style={{ gap: Spacing.md }}>
          <Row label="Kos" value={settings?.nama_kos ?? 'KosMate'} />
          <Row label="Tipe" value="Sewa Bulanan" />
          <Row label="Jumlah" value={rupiah(1000000)} />
          <Row label="Tanggal" value={tanggalPanjang(new Date().toISOString())} />
          <Row label="Status" value="Menunggu" />
        </Card>

        <Text style={{ fontFamily: FontFamily.regular, fontSize: 12, color: Colors.mutedForeground, textAlign: 'center', lineHeight: 18 }}>
          Terima kasih telah menggunakan KosMate.
        </Text>
      </View>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Text style={{ fontFamily: FontFamily.regular, fontSize: 14, color: Colors.mutedForeground }}>{label}</Text>
      <Text style={{ fontFamily: FontFamily.semibold, fontSize: 14, color: Colors.foreground }}>{value}</Text>
    </View>
  );
}
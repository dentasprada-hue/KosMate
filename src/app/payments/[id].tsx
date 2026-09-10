import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { MarkPaidDialog } from '@/components/mark-paid-dialog';
import { Spacing, Colors, FontFamily } from '@/constants/theme';
import { useAsyncData } from '@/hooks/use-async-data';
import { api } from '@/lib/api';
import { labelPeriode, pembayaranMeta, rupiah, tanggalPanjang } from '@/lib/kos';
import type { Payment } from '@/lib/types';

export default function PaymentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: payments, loading, reload } = useAsyncData<Payment[]>(() => api.getPayments('semua'));
  const [showMark, setShowMark] = useState(false);

  const payment = (payments ?? []).find((p) => p.payment_id === id);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg + 4 }}>
        <Button variant="ghost" size="iconSm" onPress={() => router.back()}><ArrowLeft size={20} color={Colors.foreground} /></Button>
        <Text style={{ fontFamily: FontFamily.extrabold, fontSize: 22, color: Colors.foreground }}>Detail Pembayaran</Text>
      </View>

      {!loading && payment ? (
        <View style={{ padding: Spacing.lg, gap: Spacing.lg }}>
          <Card style={{ gap: Spacing.md, padding: Spacing.xl }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontFamily: FontFamily.bold, fontSize: 16, color: Colors.foreground }}>{payment.tenant_name}</Text>
              <StatusBadge status={pembayaranMeta(payment).color} label={pembayaranMeta(payment).label} />
            </View>
            <Text style={{ fontFamily: FontFamily.extrabold, fontSize: 28, color: Colors.foreground, letterSpacing: -0.5 }}>{rupiah(payment.amount)}</Text>
            <View style={{ borderTopWidth: 1, borderTopColor: Colors.borderSubtle, paddingTop: Spacing.md, gap: Spacing.md }}>
              <Row label="Kamar" value={payment.room_number} />
              <Row label="Periode" value={labelPeriode(payment.period)} />
              <Row label="Jatuh Tempo" value={tanggalPanjang(payment.due_date)} />
              <Row label="Bayar" value={payment.paid_at ? tanggalPanjang(payment.paid_at) : 'Belum dibayar'} />
              <Row label="Metode" value={payment.method ?? '—'} />
            </View>
          </Card>

          {payment.status !== 'sudah_bayar' ? (
            <Button onPress={() => setShowMark(true)} size="lg"><Check size={18} color="#fff" /> Tandai Lunas</Button>
          ) : null}
        </View>
      ) : null}

      <MarkPaidDialog payment={payment ?? null} visible={showMark} onClose={() => setShowMark(false)} onDone={() => { setShowMark(false); reload(); }} />
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
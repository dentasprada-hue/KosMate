import { router } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';
import { ArrowLeft, TrendingDown, TrendingUp } from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Radius, Spacing, Colors, FontFamily } from '@/constants/theme';
import { useAsyncData } from '@/hooks/use-async-data';
import { api } from '@/lib/api';
import { labelPeriode, rupiah } from '@/lib/kos';
import type { Payment } from '@/lib/types';

export default function ReportScreen() {
  const { data: payments, loading } = useAsyncData<Payment[]>(() => api.getPayments('semua'));

  if (loading && !payments) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  const byMonth = new Map<string, { collected: number; defaulted: number; count: number }>();
  for (const p of payments ?? []) {
    const key = p.period;
    const cur = byMonth.get(key) ?? { collected: 0, defaulted: 0, count: 0 };
    cur.collected += p.status === 'sudah_bayar' ? p.amount : 0;
    cur.defaulted += p.status !== 'sudah_bayar' ? p.amount : 0;
    cur.count += 1;
    byMonth.set(key, cur);
  }
  const months = [...byMonth.entries()].sort((a, b) => b[0].localeCompare(a[0])).slice(0, 6);
  const totalCollected = [...byMonth.values()].reduce((s, m) => s + m.collected, 0);

  const max = Math.max(1, ...months.map(([, m]) => m.collected));

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg + 4 }}>
        <Button variant="ghost" size="iconSm" onPress={() => router.back()}><ArrowLeft size={20} color={Colors.foreground} /></Button>
        <Text style={{ fontFamily: FontFamily.extrabold, fontSize: 22, color: Colors.foreground }}>Laporan</Text>
      </View>

      <View style={{ padding: Spacing.lg, gap: Spacing.lg }}>
        <Card style={{ gap: 8 }}>
          <Text style={{ fontFamily: FontFamily.bold, fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.4, color: Colors.mutedForeground }}>Total Terkumpul</Text>
          <Text style={{ fontFamily: FontFamily.extrabold, fontSize: 28, color: Colors.foreground, letterSpacing: -0.5 }}>{rupiah(totalCollected)}</Text>
          <Text style={{ fontFamily: FontFamily.regular, fontSize: 13, color: Colors.mutedForeground }}>dari {months.reduce((s, [, m]) => s + m.count, 0)} tagihan</Text>
        </Card>

        <Text style={{ fontFamily: FontFamily.bold, fontSize: 16, color: Colors.foreground }}>Rekap per Bulan</Text>
        <View style={{ gap: Spacing.md }}>
          {months.map(([period, m]) => {
            const pct = Math.round((m.collected / max) * 100);
            return (
              <Card key={period} style={{ gap: Spacing.md }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontFamily: FontFamily.bold, fontSize: 14, color: Colors.foreground }}>{labelPeriode(period)}</Text>
                  <Text style={{ fontFamily: FontFamily.extrabold, fontSize: 15, color: Colors.foreground }}>{rupiah(m.collected)}</Text>
                </View>
                <View style={{ height: 8, borderRadius: Radius.full, backgroundColor: '#E2E8F0', overflow: 'hidden' }}>
                  <View style={{ width: `${pct}%`, height: '100%', borderRadius: Radius.full, backgroundColor: '#059669' }} />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <TrendingUp size={13} color="#059669" />
                    <Text style={{ fontFamily: FontFamily.medium, fontSize: 12, color: '#065F46' }}>Lunas {rupiah(m.collected)}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <TrendingDown size={13} color="#BE123C" />
                    <Text style={{ fontFamily: FontFamily.medium, fontSize: 12, color: '#BE123C' }}>Belum {rupiah(m.defaulted)}</Text>
                  </View>
                </View>
              </Card>
            );
          })}
          {months.length === 0 ? (
            <Text style={{ fontFamily: FontFamily.regular, fontSize: 14, color: Colors.mutedForeground, textAlign: 'center', paddingVertical: 20 }}>Belum ada data pembayaran.</Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}
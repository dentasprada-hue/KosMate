import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, MessageCircle } from 'lucide-react-native';
import { Linking, Text, View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { Spacing, Colors, FontFamily } from '@/constants/theme';
import { useApp } from '@/context/app-context';
import { useAsyncData } from '@/hooks/use-async-data';
import { api } from '@/lib/api';
import { daysBetween, isUnpaid, keteranganHari, labelPeriode, pesanReminder, rupiah, STATUS_META, todayIso, tanggalPanjang, tanggalPendek, waLink } from '@/lib/kos';
import type { Payment, Tenant } from '@/lib/types';

export default function TenantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: tenants, loading } = useAsyncData<Tenant[]>(api.getTenants);
  const { data: payments } = useAsyncData(api.getPayments);
  const { settings } = useApp();

  const tenant = (tenants ?? []).find((t) => t.tenant_id === id);
  const history = (payments ?? [])
    .filter((p) => tenant && p.room_number === tenant.room_number && p.tenant_name === tenant.name)
    .sort((a, b) => b.period.localeCompare(a.period));

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg + 4 }}>
        <Button variant="ghost" size="iconSm" onPress={() => router.back()}><ArrowLeft size={20} color={Colors.foreground} /></Button>
        <Text style={{ fontFamily: FontFamily.extrabold, fontSize: 22, color: Colors.foreground }}>Detail Penghuni</Text>
      </View>

      {!loading && tenant ? (
        <View style={{ padding: Spacing.lg, gap: Spacing.lg }}>
          <Card style={{ alignItems: 'center', gap: Spacing.md, padding: Spacing.xl }}>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#059669', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontFamily: FontFamily.extrabold, fontSize: 28, color: '#FFFFFF' }}>{tenant.name.charAt(0)}</Text>
            </View>
            <View style={{ alignItems: 'center', gap: 4 }}>
              <Text style={{ fontFamily: FontFamily.bold, fontSize: 20, color: Colors.foreground }}>{tenant.name}</Text>
              <Text style={{ fontFamily: FontFamily.regular, fontSize: 14, color: Colors.mutedForeground }}>Kamar {tenant.room_number}</Text>
            </View>
            {tenant.payment_status && tenant.payment_status !== 'belum_bayar' ? <StatusBadge status={STATUS_META[tenant.payment_status].color} label={STATUS_META[tenant.payment_status].label} /> : null}
          </Card>

          <Card style={{ gap: Spacing.lg }}>
            <Row label="Sewa per Bulan" value={rupiah(tenant.price)} />
            <Row label="Nomor WhatsApp" value={tenant.whatsapp} />
            <Row label="Tanggal Masuk" value={tanggalPanjang(tenant.start_date)} />
            <Row label="Jatuh Tempo" value={tanggalPanjang(tenant.due_date)} />
            <Row label="Sisa Waktu" value={keteranganHari(daysBetween(todayIso(), tenant.due_date)) || '–'} />
          </Card>

          <View>
            <Text style={{ fontFamily: FontFamily.bold, fontSize: 17, color: Colors.foreground, marginBottom: Spacing.md }}>Riwayat Pembayaran</Text>
            <Card style={{ padding: 0, gap: 0 }}>
              {history.length === 0 ? (
                <Text style={{ fontFamily: FontFamily.regular, fontSize: 14, color: Colors.mutedForeground, textAlign: 'center', padding: 24 }}>Belum ada riwayat pembayaran.</Text>
              ) : (
                history.map((p) => <PaymentRow key={p.payment_id} p={p} />)
              )}
            </Card>
          </View>

          {isUnpaid(tenant.payment_status) ? (
            <Button
              variant="whatsapp"
              size="lg"
              onPress={() => {
                const msg = pesanReminder({ name: tenant.name, amount: tenant.price, dueDate: tenant.due_date, days: daysBetween(todayIso(), tenant.due_date), kos: settings?.nama_kos, owner: settings?.nama_pemilik });
                Linking.openURL(waLink(tenant.whatsapp, msg)).catch(() => {});
              }}
            >
              <MessageCircle size={18} color="#fff" fill="#fff" /> Ingatkan via WhatsApp
            </Button>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

function PaymentRow({ p }: { p: Payment }) {
  const isPaid = p.status === 'sudah_bayar';
  const late = isPaid && !!p.paid_at && p.paid_at > p.due_date;
  const badge = late
    ? { status: 'terlambat' as const, label: 'Terlambat' }
    : isPaid
      ? { status: 'sudah_bayar' as const, label: 'Sudah Bayar' }
      : { status: p.status, label: STATUS_META[p.status]?.label ?? p.status };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border }}>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontFamily: FontFamily.semibold, fontSize: 14, color: Colors.foreground }}>{labelPeriode(p.period)}</Text>
        <Text style={{ fontFamily: FontFamily.regular, fontSize: 12, color: Colors.mutedForeground, marginTop: 2 }}>
          Jatuh tempo {tanggalPendek(p.due_date)}
        </Text>
        {p.paid_at ? (
          <Text style={{ fontFamily: FontFamily.regular, fontSize: 12, color: Colors.mutedForeground, marginTop: 1 }}>
            Dibayar {tanggalPendek(p.paid_at)}
            {p.method ? ` • ${p.method}` : ''}
          </Text>
        ) : null}
      </View>
      <View style={{ alignItems: 'flex-end', gap: 4 }}>
        <Text style={{ fontFamily: FontFamily.monoBold, fontSize: 13, color: Colors.foreground }}>{rupiah(p.amount)}</Text>
        <StatusBadge status={badge.status} label={badge.label} fallback="kosong" />
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
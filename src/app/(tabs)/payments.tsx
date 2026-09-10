import { useMemo, useState } from 'react';
import { ActivityIndicator, DimensionValue, Linking, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Check, FileDown, MessageCircle } from 'lucide-react-native';
import { Screen } from '@/components/screen';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChipFilter } from '@/components/ui/chips';
import { DatePicker } from '@/components/ui/date-picker';
import { MarkPaidDialog } from '@/components/mark-paid-dialog';
import { Colors, FontFamily, Spacing } from '@/constants/theme';
import { useApp } from '@/context/app-context';
import { useAsyncData } from '@/hooks/use-async-data';
import { useToast } from '@/components/ui/toast';
import { api } from '@/lib/api';
import { exportExcel } from '@/lib/excel';
import { daysBetween, isUnpaid, labelPeriode, pesanReminder, pembayaranMeta, rupiah, tanggalPanjang, tanggalPendek, todayIso, waLink } from '@/lib/kos';
import type { Payment, Tenant } from '@/lib/types';

type PaymentFilter = 'semua' | 'sudah_bayar' | 'belum_bayar' | 'jatuh_tempo' | 'terlambat';

const FILTERS: { value: PaymentFilter; label: string }[] = [
  { value: 'semua', label: 'Semua' },
  { value: 'sudah_bayar', label: 'Sudah Bayar' },
  { value: 'belum_bayar', label: 'Belum Bayar' },
  { value: 'jatuh_tempo', label: 'Jatuh Tempo' },
  { value: 'terlambat', label: 'Terlambat' },
];

function firstDayOfMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

function lastDayOfMonth(): string {
  const d = new Date();
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return `${last.getFullYear()}-${String(last.getMonth() + 1).padStart(2, '0')}-${String(last.getDate()).padStart(2, '0')}`;
}

function initialFilter(param: string | string[] | undefined): PaymentFilter {
  const v = Array.isArray(param) ? param[0] : param;
  return (FILTERS.find((f) => f.value === v)?.value ?? 'semua') as PaymentFilter;
}

export default function PaymentsScreen() {
  const params = useLocalSearchParams<{ filter?: string }>();
  const [dateFrom, setDateFrom] = useState(firstDayOfMonth);
  const [dateTo, setDateTo] = useState(lastDayOfMonth);
  const [filter, setFilter] = useState<PaymentFilter>(() => initialFilter(params.filter));
  const { data: allPayments, loading, reload } = useAsyncData<Payment[]>(api.getPayments);
  const { data: tenants } = useAsyncData<Tenant[]>(api.getTenants);
  const { settings } = useApp();
  const { toast } = useToast();
  const [marking, setMarking] = useState<Payment | null>(null);

  const openWa = (p: Payment) => {
    const tenant = (tenants ?? []).find((t) => t.room_number === p.room_number && t.name === p.tenant_name);
    const phone = tenant?.whatsapp ?? '';
    if (!phone) {
      toast('Nomor WA penghuni tidak ditemukan', 'error');
      return;
    }
    const msg = pesanReminder({
      name: p.tenant_name,
      amount: p.amount,
      dueDate: p.due_date,
      days: daysBetween(todayIso(), p.due_date),
      kos: settings?.nama_kos,
      owner: settings?.nama_pemilik,
    });
    Linking.openURL(waLink(phone, msg)).catch(() => {});
  };

  const rangePayments = useMemo(() => {
    const list = allPayments ?? [];
    const from = dateFrom.trim();
    const to = dateTo.trim();
    if (!from || !to) return list;
    return list.filter((p) => p.due_date >= from && p.due_date <= to);
  }, [allPayments, dateFrom, dateTo]);

  const isPaid = (p: Payment) => p.status === 'sudah_bayar';
  const isUnpaidOverdue = (p: Payment) => !p.paid_at && !!p.due_date && p.due_date < todayIso();

  const filtered = useMemo(() => {
    switch (filter) {
      case 'sudah_bayar':
        return rangePayments.filter((p) => isPaid(p));
      case 'belum_bayar':
        return rangePayments.filter((p) => p.status === 'belum_bayar' && !isUnpaidOverdue(p));
      case 'jatuh_tempo':
        return rangePayments.filter((p) => !p.paid_at && !p.status?.startsWith('sudah') && p.due_date === todayIso());
      case 'terlambat':
        return rangePayments.filter((p) => isUnpaidOverdue(p));
      default:
        return rangePayments;
    }
  }, [rangePayments, filter]);

  const stats = useMemo(() => {
    const list = rangePayments;
    const paid = list.filter(isPaid);
    return {
      terkumpul: paid.reduce((s, p) => s + p.amount, 0),
      totalTagihan: list.reduce((s, p) => s + p.amount, 0),
      lunas: paid.length,
      belumLunas: list.length - paid.length,
    };
  }, [rangePayments]);

  const subtitle = dateFrom && dateTo ? `${tanggalPendek(dateFrom)} — ${tanggalPendek(dateTo)}` : 'Semua periode';

  const handleExport = async () => {
    const list = filtered;
    try {
      await exportExcel({
        fileName: `laporan-pembayaran-${dateFrom}_sampai_${dateTo}`,
        sheetName: 'Pembayaran',
        title: `${settings?.nama_kos ?? 'KosMate'} — Laporan Pembayaran`,
        subtitle: `Dibuat ${tanggalPanjang(todayIso())} • ${list.length} pembayaran`,
        columns: [
          { header: 'Penghuni', key: 'penghuni', width: 22 },
          { header: 'No. Kamar', key: 'kamar', width: 11 },
          { header: 'Periode', key: 'periode', width: 16 },
          { header: 'Jumlah (Rp)', key: 'jumlah', width: 14 },
          { header: 'Status', key: 'status', width: 16 },
          { header: 'Jatuh Tempo', key: 'jatuh_tempo', width: 14 },
          { header: 'Tanggal Bayar', key: 'bayar', width: 14 },
          { header: 'Metode', key: 'metode', width: 12 },
        ],
        rows: list.map((p) => {
          return {
            penghuni: p.tenant_name,
            kamar: p.room_number,
            periode: labelPeriode(p.period),
            jumlah: p.amount,
            status: pembayaranMeta(p).label,
            jatuh_tempo: tanggalPendek(p.due_date),
            bayar: p.paid_at ? tanggalPendek(p.paid_at) : '',
            metode: p.method ?? '',
          };
        }),
        summary: [
          { label: 'Periode', value: `${tanggalPendek(dateFrom)} s/d ${tanggalPendek(dateTo)}` },
          { label: 'Terkumpul', value: rupiah(stats.terkumpul) },
          { label: 'Total Tagihan', value: rupiah(stats.totalTagihan) },
          { label: 'Lunas', value: String(stats.lunas) },
          { label: 'Belum Lunas', value: String(stats.belumLunas) },
        ],
      });
      toast('Laporan pembayaran diunduh', 'success');
    } catch (e: any) {
      toast(e?.message ?? 'Gagal mengunduh laporan', 'error');
    }
  };

  return (
    <Screen
      title="Pembayaran"
      subtitle={subtitle}
      contentContainerStyle={{ gap: Spacing.md }}
      headerRight={
        <Button size="sm" variant="outline" onPress={handleExport}>
          <FileDown size={14} color={Colors.primary} /> Excel
        </Button>
      }
    >
      <Card style={{ flexDirection: 'row', gap: Spacing.md }}>
        <View style={{ flex: 1 }}>
          <DatePicker value={dateFrom} onChange={setDateFrom} placeholder="Dari tanggal" />
        </View>
        <View style={{ flex: 1 }}>
          <DatePicker value={dateTo} onChange={setDateTo} placeholder="Sampai tanggal" />
        </View>
      </Card>

      <ChipFilter value={filter} onChange={setFilter} options={FILTERS} wrap />

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 4 }}>
        <StatBlock label="Terkumpul" value={rupiah(stats.terkumpul)} color={Colors.primary} width="47%" />
        <StatBlock label="Total Tagihan" value={rupiah(stats.totalTagihan)} color="#DC2626" width="47%" />
        <StatBlock label="Lunas" value={String(stats.lunas)} color="#059669" width="47%" />
        <StatBlock label="Belum Lunas" value={String(stats.belumLunas)} color="#DC2626" width="47%" />
      </View>

      {loading && !allPayments ? (
        <View style={{ alignItems: 'center', paddingVertical: 40 }}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      ) : (
        <View style={{ gap: Spacing.md }}>
          {filtered.map((p) => {
            const meta = pembayaranMeta(p);
            return (
              <Card key={p.payment_id} style={{ gap: Spacing.sm }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: Spacing.md }}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ fontFamily: FontFamily.bold, fontSize: 15, color: Colors.foreground }} numberOfLines={1}>{p.tenant_name}</Text>
                    <Text style={{ fontFamily: FontFamily.regular, fontSize: 13, color: Colors.mutedForeground, marginTop: 2 }}>
                      Kamar {p.room_number} • {rupiah(p.amount)}
                    </Text>
                    <Text style={{ fontFamily: FontFamily.regular, fontSize: 12, color: Colors.mutedForeground, marginTop: 2 }}>
                      Tempo {tanggalPendek(p.due_date)}
                      {p.paid_at ? ` • Bayar ${tanggalPendek(p.paid_at)}${p.method ? ` (${p.method})` : ''}` : ''}
                    </Text>
                  </View>
                  <StatusBadge status={meta.color} label={meta.label} />
                </View>
                {isUnpaid(p.status) ? (
                  <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
                    <Button size="sm" variant="whatsapp" style={{ flex: 1 }} onPress={() => openWa(p)}>
                      <MessageCircle size={14} color="#fff" fill="#fff" /> WA
                    </Button>
                    <Button size="sm" variant="primary" style={{ flex: 1 }} onPress={() => setMarking(p)}>
                      <Check size={14} color="#fff" /> Tandai Bayar
                    </Button>
                  </View>
                ) : null}
              </Card>
            );
          })}
          {filtered.length === 0 ? (
            <Text style={{ color: Colors.mutedForeground, fontFamily: FontFamily.regular, fontSize: 14, textAlign: 'center', paddingVertical: 30 }}>Tidak ada pembayaran pada rentang tanggal ini.</Text>
          ) : null}
        </View>
      )}

      <MarkPaidDialog payment={marking} visible={!!marking} onClose={() => setMarking(null)} onDone={() => { setMarking(null); reload(); }} />
    </Screen>
  );
}

function StatBlock({ label, value, color, width }: { label: string; value: string; color: string; width?: DimensionValue }) {
  return (
    <Card style={{ width, flexGrow: 1, padding: 16 }}>
      <Text style={{ fontFamily: FontFamily.semibold, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.9, color: Colors.mutedForeground }}>{label}</Text>
      <Text style={{ fontFamily: FontFamily.monoBold, fontSize: 18, letterSpacing: -0.4, color, marginTop: 6 }} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
    </Card>
  );
}
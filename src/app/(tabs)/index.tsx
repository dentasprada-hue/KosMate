import { router, useFocusEffect } from 'expo-router';
import { AlertTriangle, CalendarClock, CalendarDays, CheckCircle2, Clock, DoorClosed, DoorOpen, Plus, Wallet } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { Screen } from '@/components/screen';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KpiCard, type KpiTone } from '@/components/ui/kpi-card';
import { StatusBadge } from '@/components/ui/badge';
import { ReminderButton } from '@/components/reminder-button';
import { TenantFormDialog, type TenantFormValues } from '@/components/tenant-form';
import { RoomFormDialog, type RoomFormValues } from '@/components/room-form';
import { Colors, FontFamily, Radius, Spacing } from '@/constants/theme';
import { useApp } from '@/context/app-context';
import { useAsyncData } from '@/hooks/use-async-data';
import { useToast } from '@/components/ui/toast';
import { api } from '@/lib/api';
import { BUCKET_META, keteranganHari, rupiah, tanggalPanjang, tanggalPendek } from '@/lib/kos';
import type { ActionItem, DashboardData } from '@/lib/types';

export default function DashboardScreen() {
  const { data, loading, reload } = useAsyncData<DashboardData>(api.getDashboard);
  const { data: rooms, reload: reloadRooms } = useAsyncData(api.getRooms);
  const { toast } = useToast();
  const [tenantForm, setTenantForm] = useState(false);
  const [roomForm, setRoomForm] = useState(false);
  const s = data?.stats;
  const urgent = data?.action_items ?? [];
  const recent = data?.recent_payments ?? [];

  useFocusEffect(
    useCallback(() => {
      reload();
      reloadRooms();
    }, [reload, reloadRooms])
  );

  const handleAddTenant = async (values: TenantFormValues) => {
    await api.addTenant({ ...values, price: Number(values.price) });
    toast('Penghuni ditambahkan', 'success');
    setTenantForm(false);
    reload();
    reloadRooms();
  };

  const handleAddRoom = async (values: RoomFormValues) => {
    await api.addRoom({ ...values, price: Number(values.price) });
    toast('Kamar ditambahkan', 'success');
    setRoomForm(false);
    reload();
    reloadRooms();
  };

  const kpis: { label: string; value: string; tone: KpiTone; icon: React.ReactNode }[] = [
    { label: 'Total Kamar', value: s ? String(s.total_kamar) : '—', tone: 'slate', icon: <DoorClosed size={16} color="#334155" /> },
    { label: 'Kamar Terisi', value: s ? String(s.kamar_terisi) : '—', tone: 'blue', icon: <DoorClosed size={16} color="#1D4ED8" /> },
    { label: 'Kamar Kosong', value: s ? String(s.kamar_kosong) : '—', tone: 'slate', icon: <DoorOpen size={16} color="#475569" /> },
    { label: 'Sudah Bayar', value: s ? String(s.sudah_bayar) : '—', tone: 'emerald', icon: <CheckCircle2 size={16} color="#047857" /> },
    { label: 'Belum Bayar', value: s ? String(s.belum_bayar) : '—', tone: 'amber', icon: <Clock size={16} color="#B45309" /> },
    { label: 'Jatuh Tempo Hari Ini', value: s ? String(s.jatuh_tempo_hari_ini) : '—', tone: 'orange', icon: <CalendarDays size={16} color="#C2410C" /> },
    { label: 'Akan Jatuh Tempo', value: s ? String(s.akan_jatuh_tempo) : '—', tone: 'sky', icon: <CalendarClock size={16} color="#0369A1" /> },
    { label: 'Terlambat', value: s ? String(s.terlambat) : '—', tone: 'rose', icon: <AlertTriangle size={16} color="#BE123C" /> },
  ];

  return (
    <Screen
      title="Dashboard"
      subtitle={data ? `Hari ini, ${tanggalPanjang(data.today)}` : 'Ringkasan kondisi kos Anda'}
      headerRight={
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button size="sm" variant="outline" onPress={() => setRoomForm(true)}>
            <Plus size={14} color={Colors.primary} /> Kamar
          </Button>
          <Button size="sm" variant="primary" onPress={() => setTenantForm(true)}>
            <Plus size={14} color="#fff" /> Penghuni
          </Button>
        </View>
      }
      contentContainerStyle={{ gap: 0 }}
    >
      {loading && !data ? (
        <View style={{ alignItems: 'center', paddingVertical: 60 }}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      ) : (
        <>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {kpis.map((k) => (
              <View key={k.label} style={{ width: '47%', flexGrow: 1 }}>
                <KpiCard label={k.label} value={k.value} tone={k.tone} icon={k.icon} />
              </View>
            ))}
          </View>

          <Card variant="elevated" style={{ marginTop: 16, padding: 20, backgroundColor: '#047857', borderColor: '#03694E' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 40, height: 40, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' }}>
                <Wallet size={20} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: FontFamily.semibold, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.9, color: '#A7F3D0' }}>
                  Total Pendapatan Bulan Ini
                </Text>
                <Text style={{ fontFamily: FontFamily.monoBold, fontSize: 24, letterSpacing: -0.6, color: '#FFFFFF', marginTop: 2 }}>
                  {s ? rupiah(s.pendapatan_bulan_ini) : '—'}
                </Text>
              </View>
            </View>
          </Card>

          <View style={{ marginTop: 20, gap: 20 }}>
            <Card style={{ padding: 0, overflow: 'hidden' }}>
              <CardHeader title="Perlu Ditindaklanjuti" subtitle="Terlambat, hari ini, H-3 & H-7" actionLabel="Lihat semua" onAction={() => router.push('/(tabs)/reminder')} />
              <View>
                {urgent.length === 0 ? (
                  <Text style={{ paddingVertical: 32, textAlign: 'center', fontFamily: FontFamily.regular, fontSize: 14, color: Colors.mutedForeground }}>
                    Tidak ada tagihan mendesak. 🎉
                  </Text>
                ) : (
                  urgent.map((it) => <ActionRow key={it.payment_id} it={it} />)
                )}
              </View>
            </Card>

            <Card style={{ padding: 0, overflow: 'hidden' }}>
              <CardHeader title="Pembayaran Terbaru" subtitle={`${recent.length} transaksi terakhir`} actionLabel="Lihat semua" onAction={() => router.push('/(tabs)/payments')} />
              <View>
                {recent.length === 0 ? (
                  <Text style={{ paddingVertical: 32, textAlign: 'center', fontFamily: FontFamily.regular, fontSize: 14, color: Colors.mutedForeground }}>
                    Belum ada pembayaran tercatat.
                  </Text>
                ) : (
                  recent.map((p) => (
                    <View key={p.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border, borderColor: Colors.border }}>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={{ fontFamily: FontFamily.bold, fontSize: 14, color: Colors.foreground }} numberOfLines={1}>{p.tenant_name}</Text>
                        <Text style={{ fontFamily: FontFamily.regular, fontSize: 12, color: Colors.mutedForeground, marginTop: 1 }}>
                          Kamar {p.room_number} • {tanggalPendek(p.paid_date)}
                        </Text>
                      </View>
                      <View style={{ alignItems: 'flex-end', gap: 4 }}>
                        <Text style={{ fontFamily: FontFamily.monoBold, fontSize: 13, color: Colors.foreground }}>{rupiah(p.paid_amount)}</Text>
                        <StatusBadge status={p.status === 'sudah_bayar' ? 'sudah_bayar' : 'terlambat'} label="Sudah Bayar" />
                      </View>
                    </View>
                  ))
                )}
              </View>
            </Card>
          </View>
        </>
      )}

      <TenantFormDialog visible={tenantForm} onClose={() => setTenantForm(false)} onSubmit={handleAddTenant} rooms={rooms ?? []} submitLabel="Tambah Penghuni" />
      <RoomFormDialog visible={roomForm} onClose={() => setRoomForm(false)} onSubmit={handleAddRoom} />
    </Screen>
  );
}

function CardHeader({ title, subtitle, actionLabel, onAction }: { title: string; subtitle: string; actionLabel: string; onAction: () => void }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: Colors.border, paddingHorizontal: 20, paddingVertical: 16 }}>
      <View>
        <Text style={{ fontFamily: FontFamily.bold, fontSize: 16, color: Colors.foreground }}>{title}</Text>
        <Text style={{ fontFamily: FontFamily.regular, fontSize: 12, color: Colors.mutedForeground, marginTop: 1 }}>{subtitle}</Text>
      </View>
      <Button size="sm" variant="outline" onPress={onAction}>{actionLabel}</Button>
    </View>
  );
}

function ActionRow({ it }: { it: ActionItem }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.border }}>
      <Text style={{ fontSize: 18 }}>{BUCKET_META[it.bucket].emoji}</Text>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontFamily: FontFamily.bold, fontSize: 14, color: Colors.foreground }} numberOfLines={1}>{it.tenant_name}</Text>
        <Text style={{ fontFamily: FontFamily.regular, fontSize: 12, color: Colors.mutedForeground, marginTop: 1 }}>
          Kamar {it.room_number} • {rupiah(it.amount)} • {keteranganHari(it.days_to_due)}
        </Text>
      </View>
      <ReminderButton name={it.tenant_name} whatsapp={it.whatsapp} amount={it.amount} dueDate={it.due_date} days={it.days_to_due} compact />
    </View>
  );
}
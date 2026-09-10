import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Linking, Text, View } from 'react-native';
import { Eye, FileDown, MessageCircle, Pencil, Plus, Trash2 } from 'lucide-react-native';
import { Screen } from '@/components/screen';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { TenantFormDialog, type TenantFormValues } from '@/components/tenant-form';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Colors, FontFamily, Spacing } from '@/constants/theme';
import { useApp } from '@/context/app-context';
import { useAsyncData } from '@/hooks/use-async-data';
import { useToast } from '@/components/ui/toast';
import { api } from '@/lib/api';
import { exportExcel } from '@/lib/excel';
import { daysBetween, isUnpaid, keteranganHari, pesanReminder, rupiah, STATUS_META, todayIso, tanggalPanjang, waLink } from '@/lib/kos';
import type { Tenant } from '@/lib/types';

export default function TenantsScreen() {
  const { data: tenants, loading, reload } = useAsyncData<Tenant[]>(api.getTenants);
  const { data: rooms } = useAsyncData(api.getRooms);
  const { settings } = useApp();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Tenant | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Tenant | null>(null);
  const [query, setQuery] = useState('');

  const filtered = (tenants ?? []).filter((t) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return t.name.toLowerCase().includes(q) || t.room_number.toLowerCase().includes(q) || t.whatsapp.toLowerCase().includes(q);
  });

  const handleSubmit = async (values: TenantFormValues) => {
    if (editing) {
      await api.updateTenant(editing.tenant_id, { ...values, price: Number(values.price) });
      toast(`${values.name} diperbarui`, 'success');
    } else {
      await api.addTenant({ ...values, price: Number(values.price) });
      toast(`${values.name} ditambahkan`, 'success');
    }
    reload();
    setEditing(null);
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    await api.deleteTenant(confirmDelete.tenant_id);
    toast(`${confirmDelete.name} dihapus`, 'success');
    setConfirmDelete(null);
    reload();
  };

  const handleExport = async () => {
    const list = filtered;
    try {
      await exportExcel({
        fileName: `laporan-penghuni-${todayIso()}`,
        sheetName: 'Penghuni',
        title: `${settings?.nama_kos ?? 'KosMate'} — Laporan Penghuni`,
        subtitle: `Dibuat ${tanggalPanjang(todayIso())} • ${list.length} penghuni`,
        columns: [
          { header: 'Nama', key: 'nama', width: 22 },
          { header: 'No. Kamar', key: 'kamar', width: 11 },
          { header: 'No. WhatsApp', key: 'wa', width: 17 },
          { header: 'Sewa per Bulan (Rp)', key: 'sewa', width: 18 },
          { header: 'Status Pembayaran', key: 'status', width: 18 },
          { header: 'Tanggal Masuk', key: 'masuk', width: 15 },
          { header: 'Jatuh Tempo', key: 'jatuh_tempo', width: 15 },
          { header: 'Sisa Hari', key: 'sisa', width: 12 },
        ],
        rows: list.map((t) => ({
          nama: t.name,
          kamar: t.room_number,
          wa: t.whatsapp,
          sewa: t.price,
          status: t.payment_status && t.payment_status !== 'belum_bayar' ? STATUS_META[t.payment_status].label : '—',
          masuk: tanggalPanjang(t.start_date),
          jatuh_tempo: tanggalPanjang(t.due_date),
          sisa: keteranganHari(daysBetween(todayIso(), t.due_date)) ?? '',
        })),
      });
      toast('Laporan penghuni diunduh', 'success');
    } catch (e: any) {
      toast(e?.message ?? 'Gagal mengunduh laporan', 'error');
    }
  };

  return (
    <Screen
      title="Penghuni"
      subtitle={tenants ? `${tenants.length} penghuni aktif` : 'Daftar penghuni kos'}
      contentContainerStyle={{ gap: 12 }}
      headerRight={
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button size="sm" variant="outline" onPress={handleExport}>
            <FileDown size={14} color={Colors.primary} /> Excel
          </Button>
          <Button
            size="sm"
            variant="primary"
            onPress={() => {
              setEditing(null);
              setShowForm(true);
            }}
          >
            <Plus size={14} color="#fff" /> Tambah
          </Button>
        </View>
      }
    >
      {loading && !tenants ? (
        <View style={{ alignItems: 'center', paddingVertical: 40 }}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      ) : (
        <>
          <Input value={query} onChangeText={setQuery} placeholder="Cari nama, kamar, atau nomor WA" autoCapitalize="none" />
          {filtered.map((t) => {
            const meta = t.payment_status && t.payment_status !== 'belum_bayar' ? STATUS_META[t.payment_status] : null;
            return (
            <Card key={t.tenant_id} style={{ padding: Spacing.lg, gap: 0 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md }}>
                <Text style={{ fontFamily: FontFamily.bold, fontSize: 15, color: Colors.foreground, flex: 1, minWidth: 0 }} numberOfLines={1}>
                  {t.name}
                </Text>
                {meta ? <StatusBadge status={meta.color} label={meta.label} /> : null}
              </View>

              <Text style={{ fontFamily: FontFamily.regular, fontSize: 13, color: Colors.mutedForeground, marginTop: 2 }}>
                Kamar {t.room_number} • {t.whatsapp}
              </Text>
              <Text style={{ fontFamily: FontFamily.extrabold, fontSize: 18, color: Colors.foreground, marginTop: 10 }}>{rupiah(t.price)}</Text>
              <Text style={{ fontFamily: FontFamily.regular, fontSize: 13, color: Colors.mutedForeground, marginTop: 2 }}>
                Jatuh tempo {tanggalPanjang(t.due_date)} • {keteranganHari(daysBetween(todayIso(), t.due_date))}
              </Text>

              <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.lg }}>
                <Button size="sm" variant="outline" style={{ flex: 1 }} onPress={() => router.push(`/tenants/${t.tenant_id}`)}>
                  <Eye size={14} color={Colors.primary} /> Detail
                </Button>
                <Button size="sm" variant="outline" style={{ flex: 1 }} onPress={() => openEdit(t)}>
                  <Pencil size={14} color={Colors.primary} /> Edit
                </Button>
                <Button size="sm" variant="outlineDanger" style={{ flex: 1 }} onPress={() => setConfirmDelete(t)}>
                  <Trash2 size={14} color="#DC2626" /> Hapus
                </Button>
                {isUnpaid(t.payment_status) ? (
                  <Button
                    size="sm"
                    variant="whatsapp"
                    style={{ flex: 1 }}
                    onPress={() => {
                      const msg = pesanReminder({ name: t.name, amount: t.price, dueDate: t.due_date, days: daysBetween(todayIso(), t.due_date), kos: settings?.nama_kos, owner: settings?.nama_pemilik });
                      Linking.openURL(waLink(t.whatsapp, msg)).catch(() => {});
                    }}
                  >
                    <MessageCircle size={14} color="#fff" fill="#fff" /> WA
                  </Button>
                ) : null}
              </View>
            </Card>
          );
          })}
          {filtered.length === 0 ? (
            <Text style={{ color: Colors.mutedForeground, fontFamily: FontFamily.regular, fontSize: 14, textAlign: 'center', paddingVertical: 30 }}>Tidak ada penghuni.</Text>
          ) : null}
        </>
      )}

      <TenantFormDialog visible={showForm} onClose={() => { setShowForm(false); setEditing(null); }} onSubmit={handleSubmit} initial={editing} rooms={rooms ?? []} submitLabel={editing ? 'Simpan Perubahan' : 'Tambah Penghuni'} />

      <Dialog
        visible={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Hapus Penghuni"
        description={confirmDelete ? `Yakin ingin menghapus ${confirmDelete.name}? Kamar ${confirmDelete.room_number} akan dikosongkan.` : ''}
        footer={
          <>
            <Button variant="outline" onPress={() => setConfirmDelete(null)}>Batal</Button>
            <Button variant="destructive" onPress={handleDelete}>Hapus</Button>
          </>
        }
      />
    </Screen>
  );

  function openEdit(t: Tenant) {
    setEditing(t);
    setShowForm(true);
  }
}
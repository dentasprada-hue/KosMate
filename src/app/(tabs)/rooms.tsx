import { useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { FileDown, Plus } from 'lucide-react-native';
import { Screen } from '@/components/screen';
import { ChipFilter } from '@/components/ui/chips';
import { RoomCard } from '@/components/room-card';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { RoomFormDialog, type RoomFormValues } from '@/components/room-form';
import { Colors } from '@/constants/theme';
import { useApp } from '@/context/app-context';
import { useAsyncData } from '@/hooks/use-async-data';
import { useToast } from '@/components/ui/toast';
import { api } from '@/lib/api';
import { exportExcel } from '@/lib/excel';
import { ROOM_STATUS_META, STATUS_META, tanggalPanjang, tanggalPendek, todayIso } from '@/lib/kos';
import type { Room } from '@/lib/types';

type RoomFilter = 'semua' | 'terisi' | 'kosong';

const FILTERS: { value: RoomFilter; label: string }[] = [
  { value: 'semua', label: 'Semua' },
  { value: 'terisi', label: 'Terisi' },
  { value: 'kosong', label: 'Kosong' },
];

export default function RoomsScreen() {
  const { data: rooms, loading, reload } = useAsyncData<Room[]>(api.getRooms);
  const { settings } = useApp();
  const { toast } = useToast();
  const [filter, setFilter] = useState<RoomFilter>('semua');
  const [form, setForm] = useState(false);
  const [editRoom, setEditRoom] = useState<Room | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Room | null>(null);

  const handleAddRoom = async (values: RoomFormValues) => {
    await api.addRoom({ ...values, price: Number(values.price) });
    toast('Kamar ditambahkan', 'success');
    setForm(false);
    reload();
  };

  const handleEditSave = async (values: RoomFormValues) => {
    if (!editRoom) return;
    const patch: Partial<{ price: number; status: 'kosong' | 'perbaikan' }> = { price: Number(values.price) };
    if (editRoom.status !== 'terisi') patch.status = values.status;
    await api.updateRoom(editRoom.room_number, patch);
    toast('Kamar diperbarui', 'success');
    setEditRoom(null);
    reload();
  };

  const handleDeleteRoom = async () => {
    if (!deleteTarget) return;
    try {
      await api.deleteRoom(deleteTarget.room_number);
      toast('Kamar dihapus', 'success');
      setDeleteTarget(null);
      reload();
    } catch (e: any) {
      toast(e?.message ?? 'Gagal menghapus kamar', 'error');
      setDeleteTarget(null);
    }
  };

  const handleExport = async () => {
    const list = filtered ?? [];
    try {
      await exportExcel({
        fileName: `laporan-kamar-${todayIso()}`,
        sheetName: 'Kamar',
        title: `${settings?.nama_kos ?? 'KosMate'} — Laporan Kamar`,
        subtitle: `Dibuat ${tanggalPanjang(todayIso())} • ${list.length} kamar`,
        columns: [
          { header: 'No. Kamar', key: 'kamar', width: 10 },
          { header: 'Status Kamar', key: 'status', width: 14 },
          { header: 'Penghuni', key: 'penghuni', width: 22 },
          { header: 'Sewa per Bulan (Rp)', key: 'sewa', width: 17 },
          { header: 'Status Pembayaran', key: 'pembayaran', width: 18 },
          { header: 'Jatuh Tempo', key: 'jatuh_tempo', width: 14 },
          { header: 'Keterangan', key: 'ket', width: 14 },
        ],
        rows: list.map((r) => ({
          kamar: r.room_number,
          status: ROOM_STATUS_META[r.status]?.label ?? r.status,
          penghuni: r.tenant_name ?? '',
          sewa: r.price,
          pembayaran: r.payment_status && r.payment_status !== 'belum_bayar' ? STATUS_META[r.payment_status].label : '—',
          jatuh_tempo: r.due_date ? tanggalPendek(r.due_date) : '',
          ket: r.remark ?? '',
        })),
      });
      toast('Laporan kamar diunduh', 'success');
    } catch (e: any) {
      toast(e?.message ?? 'Gagal mengunduh laporan', 'error');
    }
  };

  const counts = {
    semua: rooms?.length ?? 0,
    terisi: rooms?.filter((r) => r.status === 'terisi').length ?? 0,
    kosong: rooms?.filter((r) => r.status === 'kosong').length ?? 0,
  };

  const filtered = rooms?.filter((r) => {
    if (filter === 'semua') return true;
    return r.status === filter;
  });

  return (
    <Screen
      title="Kamar"
      subtitle={counts.semua ? `${counts.semua} kamar • ${counts.terisi} terisi • ${counts.kosong} kosong` : 'Kelola kamar kos'}
      contentContainerStyle={{ gap: 14 }}
      headerRight={
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button size="sm" variant="outline" onPress={handleExport}>
            <FileDown size={14} color={Colors.primary} /> Excel
          </Button>
          <Button size="sm" variant="outline" onPress={() => setForm(true)}>
            <Plus size={14} color={Colors.primary} /> Kamar
          </Button>
        </View>
      }
    >
      <ChipFilter value={filter} onChange={setFilter} options={FILTERS} />

      {loading && !rooms ? (
        <View style={{ alignItems: 'center', paddingVertical: 40 }}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      ) : (
        <View style={{ gap: 12 }}>
          {(filtered ?? []).map((r) => (
            <RoomCard key={r.room_number} room={r} onEdit={setEditRoom} onDelete={setDeleteTarget} />
          ))}
          {filtered?.length === 0 ? (
            <Text style={{ color: Colors.mutedForeground, fontFamily: 'PlusJakartaSans-Regular', fontSize: 14, textAlign: 'center', width: '100%', paddingVertical: 30 }}>
              Tidak ada kamar pada filter ini.
            </Text>
          ) : null}
        </View>
      )}

      <RoomFormDialog visible={form} onClose={() => setForm(false)} onSubmit={handleAddRoom} />

      <RoomFormDialog
        visible={!!editRoom}
        onClose={() => setEditRoom(null)}
        onSubmit={handleEditSave}
        initial={editRoom ? { room_number: editRoom.room_number, price: String(editRoom.price), status: editRoom.status === 'terisi' ? 'kosong' : editRoom.status } : null}
        submitLabel="Simpan Perubahan"
      />

      <Dialog
        visible={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Hapus Kamar"
        description={deleteTarget ? `Yakin ingin menghapus kamar ${deleteTarget.room_number}?` : ''}
        footer={
          <>
            <Button variant="outline" onPress={() => setDeleteTarget(null)}>Batal</Button>
            <Button variant="destructive" onPress={handleDeleteRoom}>Hapus</Button>
          </>
        }
      />
    </Screen>
  );
}
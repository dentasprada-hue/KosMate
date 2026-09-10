import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Hammer, Home as HomeIcon } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { Spacing, Colors, FontFamily } from '@/constants/theme';
import { useAsyncData } from '@/hooks/use-async-data';
import { useToast } from '@/components/ui/toast';
import { api } from '@/lib/api';
import { ROOM_STATUS_META, rupiah, tanggalPanjang } from '@/lib/kos';
import type { Room } from '@/lib/types';

export default function RoomDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: rooms, loading, reload } = useAsyncData<Room[]>(api.getRooms);
  const { toast } = useToast();

  const room = (rooms ?? []).find((r) => r.room_number === id);

  const setStatus = async (status: Room['status']) => {
    if (!room) return;
    try {
      await api.updateRoomStatus(room.room_number, status);
      toast(status === 'perbaikan' ? 'Kamar ditandai perbaikan' : 'Kamar dikosongkan', 'success');
      reload();
    } catch (e: any) {
      toast(e?.message ?? 'Gagal mengubah status', 'error');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg + 4 }}>
        <Button variant="ghost" size="iconSm" onPress={() => router.back()}><ArrowLeft size={20} color={Colors.foreground} /></Button>
        <Text style={{ fontFamily: FontFamily.extrabold, fontSize: 22, color: Colors.foreground }}>Kamar {id}</Text>
      </View>

      {!loading && room ? (
        <View style={{ padding: Spacing.lg, gap: Spacing.lg }}>
          <Card style={{ gap: Spacing.md, padding: Spacing.xl }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontFamily: FontFamily.extrabold, fontSize: 24, color: Colors.foreground }}>Kamar {room.room_number}</Text>
              <StatusBadge status={ROOM_STATUS_META[room.status].color} label={ROOM_STATUS_META[room.status].label} />
            </View>
            <View style={{ borderTopWidth: 1, borderTopColor: Colors.borderSubtle, paddingTop: Spacing.md, gap: Spacing.md }}>
              <Row label="Harga Sewa" value={rupiah(room.price)} />
              <Row label="Penghuni" value={room.tenant_name ?? '—'} />
              <Row label="Jatuh Tempo" value={room.due_date ? tanggalPanjang(room.due_date) : '—'} />
              {room.remark ? <Row label="Keterangan" value={room.remark} /> : null}
            </View>
          </Card>

          {room.status !== 'perbaikan' ? (
            <Button variant="outline" size="lg" onPress={() => setStatus('perbaikan')}>
              <Hammer size={16} color={Colors.mutedForeground} /> Tandai Dalam Perbaikan
            </Button>
          ) : null}
          {room.status !== 'kosong' ? (
            <Button variant="outline" size="lg" onPress={() => setStatus('kosong')}>
              <HomeIcon size={16} color={Colors.mutedForeground} /> Kosongkan Kamar
            </Button>
          ) : null}
        </View>
      ) : null}
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
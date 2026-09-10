import { router } from 'expo-router';
import { DoorClosed, DoorOpen, Eye, Hammer, Pencil, Trash2 } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { StatusBadge } from './ui/badge';
import { Colors, FontFamily, Spacing } from '@/constants/theme';
import { ROOM_PAYMENT_META, ROOM_STATUS_META, rupiah, tanggalPanjang } from '@/lib/kos';
import type { Room } from '@/lib/types';

const ROOM_ICON = { terisi: DoorClosed, kosong: DoorOpen, perbaikan: Hammer } as const;
const ROOM_TINT = {
  terisi: { bg: '#D1FAE5', text: '#047857' },
  kosong: { bg: '#F1F5F9', text: '#475569' },
  perbaikan: { bg: '#FFEDD5', text: '#C2410C' },
} as const;

interface RoomCardProps {
  room: Room;
  onEdit?: (room: Room) => void;
  onDelete?: (room: Room) => void;
}

export function RoomCard({ room, onEdit, onDelete }: RoomCardProps) {
  const statusMeta = ROOM_STATUS_META[room.status];
  const statusColors = ROOM_TINT[room.status];
  const Icon = ROOM_ICON[room.status];

  return (
    <Card style={{ padding: 0, gap: 0 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.lg }}>
        <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: statusColors.bg, alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={20} color={statusColors.text} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontFamily: FontFamily.bold, fontSize: 16, color: Colors.foreground }}>Kamar {room.room_number}</Text>
          <Text style={{ fontFamily: FontFamily.regular, fontSize: 13, color: Colors.mutedForeground, marginTop: 1 }}>{rupiah(room.price)} / bulan</Text>
          {room.remark ? (
            <Text style={{ fontFamily: FontFamily.semibold, fontSize: 12, color: '#B45309', marginTop: 1, textTransform: 'uppercase', letterSpacing: 0.6 }}>{room.remark}</Text>
          ) : null}
        </View>
        <StatusBadge status={statusMeta.color} label={statusMeta.label} />
      </View>

      {room.status === 'terisi' ? (
        <View style={{ borderTopWidth: 1, borderTopColor: Colors.border, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, gap: Spacing.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md }}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontFamily: FontFamily.semibold, fontSize: 14, color: Colors.foreground }} numberOfLines={1}>{room.tenant_name}</Text>
              <Text style={{ fontFamily: FontFamily.regular, fontSize: 12, color: Colors.mutedForeground, marginTop: 2 }}>
                Jatuh tempo {room.due_date ? tanggalPanjang(room.due_date) : '–'}
              </Text>
            </View>
            {room.payment_status && room.payment_status !== 'belum_bayar' ? (
              <StatusBadge status={ROOM_PAYMENT_META[room.payment_status].color} label={ROOM_PAYMENT_META[room.payment_status].label} fallback="kosong" />
            ) : null}
          </View>
          <ActionRow room={room} onEdit={onEdit} onDelete={onDelete} />
        </View>
      ) : (
        <View style={{ borderTopWidth: 1, borderTopColor: Colors.border, padding: Spacing.lg, gap: Spacing.sm }}>
          <ActionRow room={room} onEdit={onEdit} onDelete={onDelete} />
        </View>
      )}
    </Card>
  );
}

function ActionRow({ room, onEdit, onDelete }: { room: Room; onEdit?: (room: Room) => void; onDelete?: (room: Room) => void }) {
  return (
    <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
      <Button size="sm" variant="outline" style={{ flex: 1 }} onPress={() => router.push(`/rooms/${room.room_number}`)}>
        <Eye size={14} color={Colors.primary} /> Lihat
      </Button>
      {onEdit ? (
        <Button size="sm" variant="outline" style={{ flex: 1 }} onPress={() => onEdit(room)}>
          <Pencil size={14} color={Colors.primary} /> Edit
        </Button>
      ) : null}
      {onDelete ? (
        <Button size="sm" variant="outlineDanger" style={{ flex: 1 }} onPress={() => onDelete(room)}>
          <Trash2 size={14} color="#DC2626" /> Hapus
        </Button>
      ) : null}
    </View>
  );
}
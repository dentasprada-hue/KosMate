import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { Dialog } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { FormField } from './ui/form';
import { DatePicker } from './ui/date-picker';
import { Select } from './ui/select';
import { Card } from './ui/card';
import { Colors, FontFamily, Radius } from '@/constants/theme';
import { addMonthKeepDay } from '@/lib/kos';
import type { Room, Tenant } from '@/lib/types';

function localDate(iso: string): string {
  return iso.slice(0, 10);
}

function toIso(input: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input)) return null;
  return input;
}

function formatRupiah(digits: string): string {
  const d = digits.replace(/\D/g, '');
  if (!d) return '';
  return d.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export interface TenantFormValues {
  name: string;
  room_number: string;
  whatsapp: string;
  price: string;
  start_date: string;
  due_date: string;
}

interface TenantFormDialogProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: TenantFormValues) => Promise<void>;
  initial?: Tenant | null;
  rooms: Room[];
  submitLabel?: string;
}

export function TenantFormDialog({ visible, onClose, onSubmit, initial, rooms, submitLabel = 'Simpan' }: TenantFormDialogProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [roomNumber, setRoomNumber] = useState(initial?.room_number ?? '');
  const [whatsapp, setWhatsapp] = useState(initial?.whatsapp ?? '');
  const [price, setPrice] = useState(initial ? String(initial.price) : '');
  const [startDate, setStartDate] = useState(initial ? localDate(initial.start_date) : localDate(new Date().toISOString()));
  const [dueDate, setDueDate] = useState(initial ? localDate(initial.due_date) : '');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!visible) return;
    setName(initial?.name ?? '');
    setRoomNumber(initial?.room_number ?? '');
    setWhatsapp(initial?.whatsapp ?? '');
    setPrice(initial ? String(initial.price) : '');
    const start = initial ? localDate(initial.start_date) : localDate(new Date().toISOString());
    setStartDate(start);
    setDueDate(initial ? localDate(initial.due_date) : addMonthKeepDay(start, 1));
    setErr('');
    setSaving(false);
  }, [visible, initial]);

  const occupiedRooms = new Set(rooms.filter((r) => r.status === 'terisi').map((r) => r.room_number));
  const availableRooms = rooms.filter((r) => {
    const canOccupy = initial ? r.room_number === initial.room_number || !occupiedRooms.has(r.room_number) : !occupiedRooms.has(r.room_number);
    const notSpecial = r.remark ? r.room_number === initial?.room_number : true;
    return canOccupy && notSpecial;
  });

  const selectedRoom = rooms.find((r) => r.room_number === roomNumber);

  const roomOptions = availableRooms.map((r) => ({ value: r.room_number, label: `Kamar ${r.room_number} • ${r.price ? 'Rp ' + r.price.toLocaleString('id-ID') : ''}` }));

  const handleRoomChange = (v: string) => {
    setRoomNumber(v);
    const room = rooms.find((r) => r.room_number === v);
    if (room && typeof room.price === 'number' && room.price > 0) setPrice(String(room.price));
  };

  const handleStartChange = (v: string) => {
    setStartDate(v);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return;
    setDueDate(addMonthKeepDay(v, 1));
  };

  const submit = async () => {
    setErr('');
    if (!name || !roomNumber || !whatsapp || !price || !startDate || !dueDate) {
      setErr('Semua kolom wajib diisi.');
      return;
    }
    setSaving(true);
    try {
      const start = toIso(startDate);
      const due = toIso(dueDate);
      if (!start || !due) {
        setErr('Format tanggal salah. Gunakan YYYY-MM-DD.');
        setSaving(false);
        return;
      }
      await onSubmit({ name, room_number: roomNumber, whatsapp, price, start_date: start, due_date: due });
      onClose();
    } catch (e: any) {
      setErr(e?.message ?? 'Gagal menyimpan data');
      setSaving(false);
    }
  };

  return (
    <Dialog
      visible={visible}
      onClose={onClose}
      title={initial ? 'Ubah Penghuni' : 'Tambah Penghuni'}
      description="Data penghuni dan jadwal pembayaran"
    >
      <Card style={{ gap: 4, borderWidth: 0, padding: 0 }}>
        <FormField label="Nama Lengkap" required>
          <Input value={name} onChangeText={setName} placeholder="contoh: Budi Santoso" />
        </FormField>
        <FormField label="Kamar" required hint={selectedRoom?.remark ? `Kamar ini ditandai (${selectedRoom.remark})` : undefined}>
          {roomOptions.length ? (
            <Select value={roomNumber} onChange={handleRoomChange} placeholder="Pilih kamar" options={roomOptions} />
          ) : (
            <Text style={{ color: '#B45309', fontFamily: FontFamily.medium, fontSize: 13, backgroundColor: '#FEF3C7', padding: 12, borderRadius: Radius.md }}>Tidak ada kamar kosong. Masukkan data kamar terlebih dahulu.</Text>
          )}
        </FormField>
        <FormField label="Nomor WhatsApp" required>
          <Input keyboardType="phone-pad" value={whatsapp} onChangeText={setWhatsapp} placeholder="08xxxxxxxxxx" />
        </FormField>
        <FormField label="Sewa per Bulan" required hint="Digit ribuan otomatis diberi titik (mis. 750.000).">
          <Input keyboardType="numeric" value={formatRupiah(price)} onChangeText={(v) => setPrice(v.replace(/\D/g, ''))} placeholder="contoh: 750.000" />
        </FormField>
        <FormField label="Tanggal Mulai" required hint="Jatuh tempo otomatis mengikuti tanggal masuk.">
          <DatePicker value={startDate} onChange={handleStartChange} placeholder="Pilih tanggal mulai" />
        </FormField>
        <FormField label="Tanggal Jatuh Tempo" required hint="Otomatis = tanggal mulai + 1 bulan. Tidak bisa diubah.">
          <Input value={dueDate} editable={false} autoCapitalize="none" style={{ color: Colors.mutedForeground, backgroundColor: '#F1F5F4' }} />
        </FormField>
        {err ? (
          <Text style={{ color: Colors.destructive, fontFamily: FontFamily.medium, fontSize: 13, marginBottom: 8 }}>{err}</Text>
        ) : null}
        <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
          <Button variant="outline" onPress={onClose}>Batal</Button>
          <Button loading={saving} onPress={submit}>{submitLabel}</Button>
        </View>
      </Card>
    </Dialog>
  );
}
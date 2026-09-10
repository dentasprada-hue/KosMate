import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { Dialog } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { FormField, RadioGroup } from './ui/form';
import { Card } from './ui/card';
import { Colors, FontFamily } from '@/constants/theme';

export interface RoomFormValues {
  room_number: string;
  price: string;
  status: 'kosong' | 'perbaikan';
}

interface RoomFormDialogProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: RoomFormValues) => Promise<void>;
  submitLabel?: string;
  initial?: { room_number?: string; price?: string; status?: 'kosong' | 'perbaikan' } | null;
}

function formatRupiah(digits: string): string {
  const d = digits.replace(/\D/g, '');
  if (!d) return '';
  return d.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function RoomFormDialog({ visible, onClose, onSubmit, submitLabel = 'Tambah Kamar', initial }: RoomFormDialogProps) {
  const [roomNumber, setRoomNumber] = useState('');
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState<'kosong' | 'perbaikan'>('kosong');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!visible) return;
    setRoomNumber(initial?.room_number ?? '');
    setPrice(initial?.price ?? '');
    setStatus(initial?.status ?? 'kosong');
    setErr('');
    setSaving(false);
  }, [visible, initial]);

  const normalizedRoom = roomNumber.trim().toLowerCase().replace(/\s+/g, ' ');
  const isExhoust = normalizedRoom === 'lt 2 km k';

  const submit = async () => {
    setErr('');
    if (!roomNumber.trim() || !price.trim()) {
      setErr('Nomor kamar dan harga sewa wajib diisi.');
      return;
    }
    const amount = Number(price.replace(/[^0-9]/g, ''));
    if (!amount || amount <= 0) {
      setErr('Harga sewa harus angka lebih dari 0.');
      return;
    }
    setSaving(true);
    try {
      await onSubmit({ room_number: roomNumber.trim(), price: String(amount), status });
      setRoomNumber('');
      setPrice('');
      setStatus('kosong');
      onClose();
    } catch (e: any) {
      setErr(e?.message ?? 'Gagal menyimpan kamar');
      setSaving(false);
    }
  };

  return (
    <Dialog visible={visible} onClose={onClose} title={initial ? 'Ubah Kamar' : 'Tambah Kamar'} description={initial ? 'Ubah data kamar di kos' : 'Data kamar baru di kos'}>
      <Card style={{ gap: 4, borderWidth: 0, padding: 0 }}>
        <FormField label="Nomor Kamar" required hint={isExhoust ? 'Kamar ini dikenal sebagai (EXHOUST)' : undefined}>
          <Input value={roomNumber} onChangeText={setRoomNumber} placeholder="contoh: 201" autoCapitalize="none" editable={!initial} />
        </FormField>
        <FormField label="Sewa per Bulan">
          <Input keyboardType="numeric" value={formatRupiah(price)} onChangeText={(v) => setPrice(v.replace(/\D/g, ''))} placeholder="contoh: 700.000" />
        </FormField>
        <FormField label="Status">
          <RadioGroup
            options={[
              { value: 'kosong', label: 'Kosong' },
              { value: 'perbaikan', label: 'Perbaikan' },
            ]}
            value={status}
            onChange={(v) => setStatus(v as 'kosong' | 'perbaikan')}
          />
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
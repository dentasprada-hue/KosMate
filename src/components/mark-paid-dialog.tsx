import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { Button } from './ui/button';
import { Dialog } from './ui/dialog';
import { DatePicker } from './ui/date-picker';
import { Select } from './ui/select';
import { FormField } from './ui/form';
import { Colors, FontFamily } from '@/constants/theme';
import { useToast } from '@/components/ui/toast';
import { api } from '@/lib/api';
import { todayIso } from '@/lib/kos';
import type { Payment } from '@/lib/types';

interface MarkPaidDialogProps {
  payment: Payment | null;
  visible: boolean;
  onClose: () => void;
  onDone: () => void;
}

const METHOD_OPTIONS = [
  { value: 'Tunai', label: 'Tunai' },
  { value: 'Transfer', label: 'Transfer' },
];

export function MarkPaidDialog({ payment, visible, onClose, onDone }: MarkPaidDialogProps) {
  const [paidDate, setPaidDate] = useState(todayIso());
  const [method, setMethod] = useState('Tunai');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (visible) {
      setPaidDate(todayIso());
      setMethod('Tunai');
      setSaving(false);
    }
  }, [visible]);

  const confirm = async () => {
    if (!payment) return;
    setSaving(true);
    try {
      await api.markPaid(payment.payment_id, { date: paidDate, method });
      toast('Pembayaran ditandai lunas', 'success');
      onClose();
      onDone();
    } catch (e: any) {
      toast(e?.message ?? 'Gagal', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      visible={visible && !!payment}
      onClose={onClose}
      title="Tandai Lunas"
      description={payment ? `${payment.tenant_name} — ${payment.room_number}` : undefined}
    >
      <View style={{ gap: 14 }}>
        <Text style={{ fontFamily: FontFamily.regular, fontSize: 14, color: Colors.mutedForeground, lineHeight: 20 }}>
          Pilih tanggal penghuni benar-benar membayar dan metode pembayarannya.
        </Text>
        <FormField label="Tanggal Bayar" required hint="Tanggal saat penghuni membayar.">
          <DatePicker value={paidDate} onChange={setPaidDate} placeholder="Pilih tanggal bayar" />
        </FormField>
        <FormField label="Metode Pembayaran" required>
          <Select value={method} onChange={setMethod} options={METHOD_OPTIONS} placeholder="Pilih metode" />
        </FormField>
        <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'flex-end', marginTop: 6 }}>
          <Button variant="outline" onPress={onClose}>Batal</Button>
          <Button loading={saving} onPress={confirm}>
            <Check size={14} color="#fff" /> Ya, Lunas
          </Button>
        </View>
      </View>
    </Dialog>
  );
}
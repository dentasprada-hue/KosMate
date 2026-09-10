import { ActivityIndicator, Text, View } from 'react-native';
import { Copy } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { Screen } from '@/components/screen';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReminderButton } from '@/components/reminder-button';
import { Colors, FontFamily, Spacing } from '@/constants/theme';
import { useApp } from '@/context/app-context';
import { useAsyncData } from '@/hooks/use-async-data';
import { useToast } from '@/components/ui/toast';
import { api } from '@/lib/api';
import { BUCKET_META, BUCKET_ORDER, keteranganHari, pesanReminder, rupiah, tanggalPanjang } from '@/lib/kos';
import type { ActionItem, Bucket } from '@/lib/types';

export default function ReminderScreen() {
  const { data: items, loading, error } = useAsyncData<ActionItem[]>(api.getReminders);
  const { settings } = useApp();
  const { toast } = useToast();

  const copy = async (it: ActionItem) => {
    const text = pesanReminder({ name: it.tenant_name, amount: it.amount, dueDate: it.due_date, days: it.days_to_due, kos: settings?.nama_kos, owner: settings?.nama_pemilik });
    await Clipboard.setStringAsync(text);
    toast('Pesan disalin', 'success');
  };

  const list = items ?? [];

  return (
    <Screen
      title="Reminder Pembayaran"
      subtitle={`${list.length} penghuni perlu diingatkan`}
      contentContainerStyle={{ gap: Spacing.lg }}
    >
      {error ? (
        <Card style={{ borderColor: '#FCD34D', backgroundColor: '#FFFBEB', padding: 16, borderWidth: 1, marginBottom: 8 }}>
          <Text style={{ color: '#78350F', fontFamily: FontFamily.medium, fontSize: 13 }}>Data reminder belum bisa dimuat.</Text>
        </Card>
      ) : null}

      {loading && !items ? (
        <View style={{ alignItems: 'center', paddingVertical: 40 }}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      ) : (
        <View style={{ gap: Spacing.lg }}>
          {BUCKET_ORDER.map((bucket: Bucket) => {
            const meta = BUCKET_META[bucket];
            const group = list.filter((i) => i.bucket === bucket);
            return (
              <Card key={bucket} style={{ padding: 0, overflow: 'hidden' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Text style={{ fontSize: 18 }}>{meta.emoji}</Text>
                    <View>
                      <Text style={{ fontFamily: FontFamily.extrabold, fontSize: 14, color: Colors.foreground }}>{meta.title}</Text>
                      <Text style={{ fontFamily: FontFamily.regular, fontSize: 12, color: Colors.mutedForeground }}>{meta.desc}</Text>
                    </View>
                  </View>
                  <Text style={{ fontFamily: FontFamily.bold, fontSize: 12, color: Colors.foreground, backgroundColor: '#FFFFFF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, shadowColor: Colors.shadow, shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 }}>
                    {group.length}
                  </Text>
                </View>
                <View style={{ backgroundColor: 'rgba(255,255,255,0.6)' }}>
                  {group.length === 0 ? (
                    <Text style={{ padding: 20, fontFamily: FontFamily.regular, fontSize: 14, color: Colors.mutedForeground }}>Tidak ada penghuni pada kelompok ini.</Text>
                  ) : (
                    group.map((it) => (
                      <View key={it.payment_id} style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: 'rgba(0,0,0,0.04)' }}>
                        <View style={{ minWidth: 0, flex: 1 }}>
                          <Text style={{ fontFamily: FontFamily.bold, fontSize: 14, color: Colors.foreground }} numberOfLines={1}>{it.tenant_name}</Text>
                          <Text style={{ fontFamily: FontFamily.regular, fontSize: 12, color: Colors.mutedForeground }}>
                            Kamar {it.room_number} • {it.whatsapp}
                          </Text>
                          <Text style={{ fontFamily: FontFamily.regular, fontSize: 12, color: Colors.mutedForeground }}>
                            {rupiah(it.amount)} • tempo {tanggalPanjang(it.due_date)} • {keteranganHari(it.days_to_due)}
                          </Text>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                          <Button size="sm" variant="outline" onPress={() => copy(it)}>
                            <Copy size={14} color={Colors.mutedForeground} /> Salin
                          </Button>
                          <ReminderButton name={it.tenant_name} whatsapp={it.whatsapp} amount={it.amount} dueDate={it.due_date} days={it.days_to_due} label="Kirim" compact />
                        </View>
                      </View>
                    ))
                  )}
                </View>
              </Card>
            );
          })}
        </View>
      )}
    </Screen>
  );
}
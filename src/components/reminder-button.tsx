import { Linking, Pressable, Text } from 'react-native';
import { MessageCircle } from 'lucide-react-native';
import { Colors, FontFamily, Radius, Spacing } from '@/constants/theme';
import { pesanReminder, waLink } from '@/lib/kos';
import { useApp } from '@/context/app-context';

interface ReminderButtonProps {
  name: string;
  whatsapp: string;
  amount?: number;
  dueDate?: string;
  days?: number | null;
  label?: string;
  compact?: boolean;
  onOpen?: () => void;
}

export function ReminderButton({ name, whatsapp, amount, dueDate, days, label = 'Reminder', compact, onOpen }: ReminderButtonProps) {
  const { settings } = useApp();
  const message = pesanReminder({ name, amount: amount ?? 0, dueDate: dueDate ?? '', days, kos: settings?.nama_kos ?? 'KosMate', owner: settings?.nama_pemilik ?? 'Pemilik Kos' });

  const open = () => {
    onOpen?.();
    Linking.openURL(waLink(whatsapp, message)).catch(() => {});
  };

  return (
    <Pressable
      onPress={open}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        backgroundColor: Colors.whatsapp,
        height: compact ? 34 : 44,
        paddingHorizontal: compact ? 12 : Spacing.lg,
        borderRadius: Radius.md,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <MessageCircle size={compact ? 16 : 18} color="#FFFFFF" fill="#FFFFFF" />
      <Text style={{ color: '#FFFFFF', fontFamily: FontFamily.semibold, fontSize: compact ? 13 : 15 }}>{label}</Text>
    </Pressable>
  );
}
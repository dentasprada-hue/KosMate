import { Text, View, type ViewProps } from 'react-native';
import { FontFamily, Radius, type StatusName } from '@/constants/theme';
import { StatusColors } from '@/constants/theme';

export function StatusBadge({ status, label, fallback = 'kosong' }: { status: StatusName; label?: string; fallback?: StatusName }) {
  const c = StatusColors[status] ?? StatusColors[fallback];
  return (
    <View style={{ alignSelf: 'flex-start', backgroundColor: c.bg, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: c.dot }} />
      <Text style={{ color: c.text, fontFamily: FontFamily.semibold, fontSize: 12 }}>{label ?? status}</Text>
    </View>
  );
}

export function BadgeChip({ children, bg = '#F1F5F9', text = '#334155', style, ...props }: ViewProps & { bg?: string; text?: string; children: React.ReactNode }) {
  return (
    <View style={[{ alignSelf: 'flex-start', backgroundColor: bg, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4 }, style]} {...props}>
      <Text style={{ color: text, fontFamily: FontFamily.bold, fontSize: 12 }}>{children}</Text>
    </View>
  );
}
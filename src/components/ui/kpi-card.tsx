import { Text, View } from 'react-native';
import { Card } from './card';
import { Colors, FontFamily } from '@/constants/theme';

export type KpiTone = 'slate' | 'blue' | 'emerald' | 'amber' | 'orange' | 'sky' | 'rose' | 'violet';

const TONES: Record<KpiTone, { bg: string; text: string }> = {
  slate: { bg: '#F1F5F9', text: '#334155' },
  blue: { bg: '#DBEAFE', text: '#1D4ED8' },
  emerald: { bg: '#D1FAE5', text: '#047857' },
  amber: { bg: '#FEF3C7', text: '#B45309' },
  orange: { bg: '#FFEDD5', text: '#C2410C' },
  sky: { bg: '#E0F2FE', text: '#0369A1' },
  rose: { bg: '#FFE4E6', text: '#BE123C' },
  violet: { bg: '#EDE9FE', text: '#6D28D9' },
};

interface KpiCardProps {
  label: string;
  value: string;
  tone?: KpiTone;
  icon?: React.ReactNode;
}

export function KpiCard({ label, value, tone = 'slate', icon }: KpiCardProps) {
  const c = TONES[tone];
  return (
    <Card style={{ padding: 16, gap: 0 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <Text style={{ fontFamily: FontFamily.semibold, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.9, color: Colors.mutedForeground, flex: 1 }}>
          {label}
        </Text>
        {icon ? (
          <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: c.bg, alignItems: 'center', justifyContent: 'center' }}>{icon}</View>
        ) : null}
      </View>
      <Text style={{ fontFamily: FontFamily.extrabold, fontSize: 24, letterSpacing: -0.6, color: Colors.foreground, marginTop: 8 }}>{value}</Text>
    </Card>
  );
}
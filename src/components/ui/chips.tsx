import { Pressable, ScrollView, Text, View } from 'react-native';
import { Colors, FontFamily, Radius, Spacing } from '@/constants/theme';

interface ChipOption<T extends string> {
  value: T | 'semua';
  label: string;
}

export function ChipFilter<T extends string>({ value, onChange, options, emojiPrefix, wrap }: { value: T | 'semua'; onChange: (v: T | 'semua') => void; options: ChipOption<T>[]; emojiPrefix?: Partial<Record<string, string>>; wrap?: boolean }) {
  const pills = options.map((opt) => {
    const active = value === opt.value;
    return (
      <Pressable
        key={opt.value}
        onPress={() => onChange(opt.value)}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 7, borderRadius: Radius.full, borderWidth: 1, borderColor: active ? Colors.primary : Colors.border, backgroundColor: active ? Colors.primary : Colors.card }}
      >
        {emojiPrefix?.[opt.value] ? <Text style={{ fontSize: 13 }}>{emojiPrefix[opt.value]}</Text> : null}
        <Text style={{ color: active ? Colors.primaryForeground : Colors.mutedForeground, fontFamily: FontFamily.semibold, fontSize: 13 }}>{opt.label}</Text>
      </Pressable>
    );
  });

  if (wrap) {
    return <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm }}>{pills}</View>;
  }
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.sm, paddingVertical: 2 }}>
      {pills}
    </ScrollView>
  );
}

export function Segmented<T extends string>({ value, onChange, options, style }: { value: T; onChange: (v: T) => void; options: T[]; style?: View['props']['style'] }) {
  return (
    <View style={[{ flexDirection: 'row', backgroundColor: Colors.muted, borderRadius: Radius.md, padding: 3 }, style]}>
      {options.map((opt) => {
        const active = value === opt;
        return (
          <Pressable key={opt} onPress={() => onChange(opt)} style={{ flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: Radius.md, backgroundColor: active ? Colors.card : 'transparent', shadowColor: Colors.shadow, shadowOffset: active ? { width: 0, height: 1 } : { width: 0, height: 0 }, shadowOpacity: active ? 0.08 : 0, shadowRadius: 2, elevation: active ? 1 : 0 }}>
            <Text style={{ color: active ? Colors.foreground : Colors.mutedForeground, fontFamily: FontFamily.semibold, fontSize: 13 }}>{opt}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
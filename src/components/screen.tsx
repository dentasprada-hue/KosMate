import { ScrollView, Text, TouchableOpacity, View, type ScrollViewProps } from 'react-native';
import { Colors, FontFamily, Radius, Spacing } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenProps extends ScrollViewProps {
  title?: string;
  subtitle?: string;
  headerRight?: React.ReactNode;
  header?: React.ReactNode;
  stickyFooter?: React.ReactNode;
}

export function Screen({ title, subtitle, headerRight, header, stickyFooter, children, contentContainerStyle, ...props }: ScreenProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      {header ?? (
        <View style={{ paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg + 6, paddingBottom: Spacing.md, flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md }}>
          <View style={{ flex: 1 }}>
            {title ? <Text style={{ fontFamily: FontFamily.extrabold, fontSize: 26, color: Colors.foreground, letterSpacing: -0.8 }}>{title}</Text> : null}
            {subtitle ? <Text style={{ fontFamily: FontFamily.regular, fontSize: 13.5, color: Colors.mutedForeground, marginTop: 3 }}>{subtitle}</Text> : null}
          </View>
          {headerRight ? <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>{headerRight}</View> : null}
        </View>
      )}
      <ScrollView
        contentContainerStyle={[{ paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxxl + 48 }, contentContainerStyle]}
        showsVerticalScrollIndicator={false}
        {...props}
      >
        {children}
      </ScrollView>
      {stickyFooter ? (
        <View style={{ paddingHorizontal: Spacing.lg, paddingTop: Spacing.md - 4, paddingBottom: insets.bottom + Spacing.md, backgroundColor: Colors.background }}>{stickyFooter}</View>
      ) : null}
    </View>
  );
}

export function ViewAllLink({ label = 'Lihat semua', onPress }: { label?: string; onPress?: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
      <Text style={{ color: Colors.primary, fontFamily: FontFamily.semibold, fontSize: 13 }}>{label}</Text>
    </TouchableOpacity>
  );
}

export function SectionHeader({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md }}>
      <Text style={{ fontFamily: FontFamily.bold, fontSize: 17, color: Colors.foreground, letterSpacing: -0.3 }}>{title}</Text>
      {right}
    </View>
  );
}

export function PressableRow({ onPress, leftIcon, title, subtitle, right, roundedTop, roundedBottom }: { onPress?: () => void; leftIcon?: React.ReactNode; title: string; subtitle?: string; right?: React.ReactNode; roundedTop?: boolean; roundedBottom?: boolean }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        backgroundColor: Colors.card,
        padding: Spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        borderWidth: 1,
        borderBottomWidth: roundedTop ? 1 : 0.5,
        borderColor: Colors.border,
        borderTopLeftRadius: roundedTop ? Radius.xl : 0,
        borderTopRightRadius: roundedTop ? Radius.xl : 0,
        borderBottomLeftRadius: roundedBottom ? Radius.xl : 0,
        borderBottomRightRadius: roundedBottom ? Radius.xl : 0,
      }}
    >
      {leftIcon}
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: FontFamily.semibold, fontSize: 15, color: Colors.foreground }}>{title}</Text>
        {subtitle ? <Text style={{ fontFamily: FontFamily.regular, fontSize: 13, color: Colors.mutedForeground, marginTop: 2 }}>{subtitle}</Text> : null}
      </View>
      {right}
    </TouchableOpacity>
  );
}
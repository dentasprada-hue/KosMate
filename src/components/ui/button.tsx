import { ActivityIndicator, Pressable, Text, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import { Colors, FontFamily, Radius, Shadow, Spacing } from '@/constants/theme';

export type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'secondary' | 'destructive' | 'whatsapp' | 'outlineDanger';
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon' | 'iconSm';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  label?: string;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const VARIANTS: Record<ButtonVariant, ViewStyle> = {
  primary: { backgroundColor: Colors.primary, ...Shadow.sm, borderWidth: 0 },
  outline: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border },
  ghost: { backgroundColor: 'transparent' },
  secondary: { backgroundColor: Colors.muted },
  destructive: { backgroundColor: Colors.destructive },
  whatsapp: { backgroundColor: Colors.whatsapp },
  outlineDanger: { backgroundColor: Colors.card, borderWidth: 1, borderColor: '#FECACA' },
};

const SIZES: Record<ButtonSize, ViewStyle> = {
  default: { height: 46, paddingHorizontal: Spacing.lg },
  sm: { height: 36, paddingHorizontal: Spacing.md },
  lg: { height: 54, paddingHorizontal: Spacing.xl },
  icon: { height: 46, width: 46 },
  iconSm: { height: 34, width: 34 },
};

const TEXTS: Record<ButtonVariant, { color: string; weight?: string }> = {
  primary: { color: Colors.primaryForeground },
  outline: { color: Colors.foreground },
  ghost: { color: Colors.primary },
  secondary: { color: Colors.foreground },
  destructive: { color: Colors.primaryForeground },
  whatsapp: { color: '#FFFFFF' },
  outlineDanger: { color: '#DC2626' },
};

export function Button({ variant = 'primary', size = 'default', loading, disabled, icon, label, children, style, ...props }: ButtonProps) {
  const textStyle = TEXTS[variant];
  return (
    <Pressable
      disabled={disabled || loading}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: Spacing.sm,
          borderRadius: Radius.md,
        },
        VARIANTS[variant],
        SIZES[size],
        (pressed || disabled) && { opacity: pressed ? 0.85 : disabled ? 0.5 : 1 },
        style as ViewStyle,
      ]}
      {...props}
    >
      {loading ? <ActivityIndicator color={textStyle.color} size="small" /> : icon}
      {(label ?? children) ? <Text style={{ color: textStyle.color, fontFamily: FontFamily.semibold, fontSize: size === 'sm' ? 13 : 15, letterSpacing: 0.1 }}>{label ?? children}</Text> : null}
    </Pressable>
  );
}
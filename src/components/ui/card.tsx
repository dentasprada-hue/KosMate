import { View, type ViewProps } from 'react-native';
import { Colors, Radius, Shadow, Spacing } from '@/constants/theme';

interface CardProps extends ViewProps {
  variant?: 'elevated' | 'flat';
}

const BASE = { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border };

export function Card({ variant = 'flat', style, children, ...props }: CardProps) {
  const v = variant === 'elevated' ? { ...Shadow.sm, borderColor: 'rgba(15,23,42,0.05)' } : null;
  return (
    <View style={[BASE, v, style]} {...props}>
      {children}
    </View>
  );
}
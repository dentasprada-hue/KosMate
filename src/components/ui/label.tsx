import { Text, type TextProps } from 'react-native';
import { Colors, FontFamily } from '@/constants/theme';

export function Label({ children, style, ...props }: TextProps) {
  return (
    <Text style={[{ color: Colors.mutedForeground, fontFamily: FontFamily.medium, fontSize: 13, marginBottom: 6 }, style]} {...props}>
      {children}
    </Text>
  );
}
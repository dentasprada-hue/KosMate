import { Modal as RNModal, Pressable, Text, View, type ViewStyle } from 'react-native';
import { Colors, FontFamily, Radius, Spacing } from '@/constants/theme';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  width?: number;
  contentStyle?: ViewStyle;
}

export function Dialog({ visible, onClose, title, description, children, footer, width = 480, contentStyle }: ModalProps) {
  return (
    <RNModal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(15,23,42,0.4)', justifyContent: 'center', alignItems: 'center', padding: Spacing.lg }} onPress={onClose}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={[
            { width: '100%', maxWidth: width, backgroundColor: Colors.card, borderRadius: Radius.xl, padding: Spacing.xl, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 12 },
            contentStyle,
          ]}
        >
          {title ? <Text style={{ fontFamily: FontFamily.extrabold, fontSize: 19, color: Colors.foreground }}>{title}</Text> : null}
          {description ? <Text style={{ fontFamily: FontFamily.regular, fontSize: 14, color: Colors.mutedForeground, marginTop: 4 }}>{description}</Text> : null}
          <View style={{ marginTop: Spacing.md }}>{children}</View>
          {footer ? <View style={{ marginTop: Spacing.lg, flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.sm }}>{footer}</View> : null}
        </Pressable>
      </Pressable>
    </RNModal>
  );
}
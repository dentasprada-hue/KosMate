import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { Colors, FontFamily, Radius } from '@/constants/theme';

interface InputProps extends TextInputProps {
  error?: boolean;
  rightElement?: React.ReactNode;
}

export function Input(props: InputProps) {
  const { error, style, rightElement, ...rest } = props;
  return (
    <View style={styles.container}>
      <TextInput
        placeholderTextColor={Colors.mutedForeground}
        style={[
          styles.input,
          { fontFamily: FontFamily.regular, borderColor: error ? Colors.destructive : Colors.border },
          style,
        ]}
        {...rest}
      />
      {rightElement && <View style={styles.rightElement}>{rightElement}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  input: {
    flex: 1,
    height: 46,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    fontSize: 15,
    color: Colors.foreground,
    backgroundColor: 'transparent',
    fontFamily: FontFamily.regular,
  },
  rightElement: {
    position: 'absolute',
    right: 12,
    paddingVertical: 8,
  },
});
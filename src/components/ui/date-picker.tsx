import { useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors, FontFamily, Radius } from '@/constants/theme';

function parseDate(iso: string): Date {
  if (!iso) return new Date();
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

function toIso(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function formatDate(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${d} ${months[(m || 1) - 1]} ${y}`;
}

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
}

export function DatePicker({ value, onChange, placeholder = 'Pilih tanggal' }: DatePickerProps) {
  const [show, setShow] = useState(false);
  const date = parseDate(value);

  if (Platform.OS === 'web') {
    return (
      <Pressable
        onPress={() => {
          const input = document.createElement('input');
          input.type = 'date';
          input.value = value;
          input.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;opacity:0;cursor:pointer;z-index:9999;';
          document.body.appendChild(input);
          input.click();
          input.addEventListener('change', (e) => {
            const val = (e.target as HTMLInputElement).value;
            if (val) onChange(val);
            if (document.body.contains(input)) document.body.removeChild(input);
          });
          input.addEventListener('blur', () => {
            setTimeout(() => { if (document.body.contains(input)) document.body.removeChild(input); }, 200);
          });
        }}
        style={{ height: 46, borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: 14, backgroundColor: 'transparent', borderColor: Colors.border, justifyContent: 'center' }}
      >
        <Text style={{ fontFamily: FontFamily.regular, fontSize: 15, color: value ? Colors.foreground : Colors.mutedForeground }}>
          {value ? formatDate(value) : placeholder}
        </Text>
      </Pressable>
    );
  }

  return (
    <View>
      <Pressable
        onPress={() => setShow(true)}
        style={{ height: 46, borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: 14, backgroundColor: 'transparent', borderColor: Colors.border, justifyContent: 'center' }}
      >
        <Text style={{ fontFamily: FontFamily.regular, fontSize: 15, color: value ? Colors.foreground : Colors.mutedForeground }}>
          {value ? formatDate(value) : placeholder}
        </Text>
      </Pressable>
      {show ? (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onValueChange={(_event, selected?: Date) => {
            setShow(false);
            if (selected) onChange(toIso(selected));
          }}
          onDismiss={() => setShow(false)}
        />
      ) : null}
    </View>
  );
}
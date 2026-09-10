import { Text, TouchableOpacity, View } from 'react-native';
import { FontFamily } from '@/constants/theme';

interface FormFieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}

export function FormField({ label, required, children, hint }: FormFieldProps) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ fontFamily: FontFamily.semibold, fontSize: 13, color: '#111827', marginBottom: 6 }}>
        {label}
        {required ? <Text style={{ color: '#DC2626' }}> *</Text> : null}
      </Text>
      {children}
      {hint ? <Text style={{ fontFamily: FontFamily.regular, fontSize: 12, color: '#6B7280', marginTop: 4 }}>{hint}</Text> : null}
    </View>
  );
}

interface RadioOption {
  value: string;
  label: string;
}

export function RadioGroup({ options, value, onChange }: { options: RadioOption[]; value?: string; onChange: (v: string) => void }) {
  return (
    <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <TouchableOpacity
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              borderWidth: 1.5,
              borderColor: active ? '#059669' : '#E5E7EB',
              backgroundColor: active ? '#ECFDF5' : '#FFFFFF',
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderRadius: 10,
            }}
          >
            <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: active ? '#059669' : '#D1D5DB', alignItems: 'center', justifyContent: 'center' }}>
              {active ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#059669' }} /> : null}
            </View>
            <Text style={{ fontFamily: FontFamily.medium, fontSize: 14, color: '#111827' }}>{opt.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
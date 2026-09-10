import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Check, ChevronDown } from 'lucide-react-native';
import { Colors, FontFamily, Radius, Spacing } from '@/constants/theme';
import { Dialog } from './dialog';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value?: string;
  placeholder?: string;
  options: SelectOption[];
  onChange: (value: string) => void;
}

export function Select({ value, placeholder = 'Pilih...', options, onChange }: SelectProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);
  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={{ height: 48, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'transparent' }}
      >
        <Text style={{ color: selected ? Colors.foreground : Colors.mutedForeground, fontFamily: FontFamily.regular, fontSize: 15 }}>{selected?.label ?? placeholder}</Text>
        <ChevronDown size={18} color={Colors.mutedForeground} />
      </Pressable>
      <Dialog visible={open} onClose={() => setOpen(false)} title={placeholder}>
        <ScrollView style={{ maxHeight: 320 }} showsVerticalScrollIndicator={false}>
          {options.map((opt) => {
            const active = opt.value === value;
            return (
              <Pressable
                key={opt.value}
                onPress={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 13, paddingHorizontal: 4, borderBottomWidth: 0.5, borderBottomColor: Colors.borderSubtle }}
              >
                <Text style={{ color: active ? Colors.primary : Colors.foreground, fontFamily: FontFamily.medium, fontSize: 15 }}>{opt.label}</Text>
                {active ? <Check size={18} color={Colors.primary} /> : null}
              </Pressable>
            );
          })}
        </ScrollView>
      </Dialog>
    </>
  );
}

export function SelectPicker({ valueLabel, placeholder, options, onPick }: { valueLabel?: string | null; placeholder: string; options: SelectOption[]; onPick: (v: string) => void }) {
  return (
    <SelectShell valueLabel={valueLabel} placeholder={placeholder} options={options} onPick={onPick} />
  );
}

function SelectShell({ valueLabel, placeholder, options, onPick }: { valueLabel?: string | null; placeholder: string; options: SelectOption[]; onPick: (v: string) => void }) {
  return null;
}
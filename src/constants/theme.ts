import { Platform } from 'react-native';

export const Colors = {
  background: '#F6F8F7',
  card: '#FFFFFF',
  border: '#E2E8F0',
  borderSubtle: 'rgba(15,23,42,0.06)',
  foreground: '#0F172A',
  muted: '#F1F5F9',
  mutedForeground: '#64748B',
  primary: '#059669',
  primaryHover: '#047857',
  primaryForeground: '#FFFFFF',
  destructive: '#E11D48',
  whatsapp: '#25D366',
  whatsappDark: '#128C7E',
  sidebar: '#0F172A',
  shadow: '#0F172A',
  ring: '#A7F3D0',
} as const;

export const Shadow = {
  sm: {
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  lg: {
    shadowColor: '#0F172A',
    shadowOpacity: 0.14,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
} as const;

export type StatusName = 'sudah_bayar' | 'belum_bayar' | 'jatuh_tempo' | 'terlambat' | 'terisi' | 'kosong' | 'perbaikan' | 'masa_sewa' | 'masa_sewa_aktif';

export const StatusColors: Record<StatusName, { bg: string; text: string; dot: string; ring: string }> = {
  sudah_bayar: { bg: '#D1FAE5', text: '#047857', dot: '#059669', ring: '#A7F3D0' },
  belum_bayar: { bg: '#FEF3C7', text: '#B45309', dot: '#D97706', ring: '#FDE68A' },
  jatuh_tempo: { bg: '#FFEDD5', text: '#C2410C', dot: '#EA580C', ring: '#FDBA74' },
  terlambat: { bg: '#FFE4E6', text: '#BE123C', dot: '#E11D48', ring: '#FDA4AF' },
  terisi: { bg: '#D1FAE5', text: '#047857', dot: '#059669', ring: '#A7F3D0' },
  kosong: { bg: '#F1F5F9', text: '#475569', dot: '#94A3B8', ring: '#E2E8F0' },
  perbaikan: { bg: '#FFEDD5', text: '#C2410C', dot: '#EA580C', ring: '#FDBA74' },
  masa_sewa: { bg: '#DBEAFE', text: '#1D4ED8', dot: '#2563EB', ring: '#93C5FD' },
  masa_sewa_aktif: { bg: '#DBEAFE', text: '#1D4ED8', dot: '#2563EB', ring: '#93C5FD' },
};

export const KpiColors = {
  emerald: { bg: '#D1FAE5', text: '#047857' },
  slate: { bg: '#E2E8F0', text: '#334155' },
  amber: { bg: '#FEF3C7', text: '#B45309' },
  blue: { bg: '#DBEAFE', text: '#1D4ED8' },
  rose: { bg: '#FFE4E6', text: '#BE123C' },
  violet: { bg: '#EDE9FE', text: '#6D28D9' },
  sky: { bg: '#E0F2FE', text: '#0369A1' },
  lime: { bg: '#ECFCCB', text: '#3F6212' },
} as const;

export const Font = {
  sans: Platform.select({
    ios: 'PlusJakartaSans-Regular',
    android: 'PlusJakartaSans-Regular',
    default: 'sans-serif',
  }),
  sansMedium: Platform.select({
    ios: 'PlusJakartaSans-Medium',
    android: 'PlusJakartaSans-Medium',
    default: 'sans-serif-medium',
  }),
  sansSemiBold: Platform.select({
    ios: 'PlusJakartaSans-SemiBold',
    android: 'PlusJakartaSans-SemiBold',
    default: 'sans-serif-medium',
  }),
  sansBold: Platform.select({
    ios: 'PlusJakartaSans-Bold',
    android: 'PlusJakartaSans-Bold',
    default: 'sans-serif',
  }),
  sansExtraBold: Platform.select({
    ios: 'PlusJakartaSans-ExtraBold',
    android: 'PlusJakartaSans-ExtraBold',
    default: 'sans-serif',
  }),
  mono: Platform.select({
    ios: 'JetBrainsMono-Bold',
    android: 'JetBrainsMono-Bold',
    default: 'monospace',
  }),
} as const;

export const FontFamily = {
  regular: 'PlusJakartaSans-Regular' as const,
  medium: 'PlusJakartaSans-Medium' as const,
  semibold: 'PlusJakartaSans-SemiBold' as const,
  bold: 'PlusJakartaSans-Bold' as const,
  extrabold: 'PlusJakartaSans-ExtraBold' as const,
  monoBold: 'JetBrainsMono-Bold' as const,
};

export const Radius = {
  sm: 8,
  md: 10,
  lg: 16,
  xl: 20,
  full: 999,
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const CardStyle = {
  backgroundColor: Colors.card,
  borderColor: Colors.border,
  borderWidth: 1,
  borderRadius: Radius.xl,
  padding: Spacing.lg,
  ...Shadow.sm,
} as const;
export const Colors = {
  light: {
    background: '#FFFFFF',
    surface: '#F3F4F6',
    surfaceAlt: '#F9FAFB',
    border: '#E5E7EB',
    text: '#111827',
    textSecondary: '#4B5563',
    textFaint: '#9CA3AF',
    accent: '#0F766E',
    accentSoft: '#CCFBF1',
    onAccent: '#FFFFFF',
    danger: '#B91C1C',
    dangerSoft: '#FEE2E2',
    warning: '#C2410C',
    warningSoft: '#FFEDD5',
    success: '#15803D',
    successSoft: '#DCFCE7',
    info: '#1D4ED8',
    infoSoft: '#DBEAFE',
    unread: '#F0FDFA',
  },
  dark: {
    background: '#0B0F14',
    surface: '#161B22',
    surfaceAlt: '#11161C',
    border: '#262D36',
    text: '#F3F4F6',
    textSecondary: '#A1A8B3',
    textFaint: '#6B7280',
    accent: '#2DD4BF',
    accentSoft: '#134E4A',
    onAccent: '#0B0F14',
    danger: '#F87171',
    dangerSoft: '#3F1D1D',
    warning: '#FB923C',
    warningSoft: '#3F2A1D',
    success: '#4ADE80',
    successSoft: '#14361F',
    info: '#60A5FA',
    infoSoft: '#1E2A47',
    unread: '#0F2321',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light;
export type Theme = { readonly [K in ThemeColor]: string };

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

export const MaxContentWidth = 720;

export const PriorityColors: Record<string, { color: string; soft: string; label: string }> = {
  urgent: { color: '#B91C1C', soft: '#FEE2E2', label: 'Urgent' },
  high: { color: '#C2410C', soft: '#FFEDD5', label: 'High' },
  medium: { color: '#A16207', soft: '#FEF3C7', label: 'Medium' },
  low: { color: '#6B7280', soft: '#F3F4F6', label: 'Low' },
  none: { color: '#9CA3AF', soft: '#F3F4F6', label: 'No priority' },
};

export const ProjectColors = ['#1D4ED8', '#7C3AED', '#0F766E', '#BE185D', '#C2410C', '#15803D', '#A16207', '#4B5563'];

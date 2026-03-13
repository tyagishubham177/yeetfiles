import { Platform } from 'react-native';

export const colors = {
  canvas: '#F7F4ED',
  ink: '#101418',
  mutedInk: '#5E6875',
  stage: '#0E1525',
  stageCard: '#182238',
  surface: '#FFFFFF',
  surfaceMuted: '#EEF2F6',
  outline: '#D7DEE7',
  keep: '#2EC27E',
  delete: '#E76F51',
  skip: '#708090',
  progress: '#3C91E6',
  highlight: '#F3B43F',
  overlay: 'rgba(8, 12, 20, 0.68)',
  scrim: 'rgba(6, 8, 14, 0.72)',
  stageGlow: 'rgba(60, 145, 230, 0.18)',
  cardGlass: 'rgba(12, 18, 32, 0.42)',
  white: '#FFFFFF',
  dangerText: '#7A1F12',
} as const;

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 20,
  xl: 28,
  xxl: 40,
} as const;

export const radius = {
  sm: 12,
  md: 18,
  lg: 28,
  pill: 999,
} as const;

export const typography = {
  display: 'SpaceGrotesk_700Bold',
  heading: 'SpaceGrotesk_600SemiBold',
  body: 'DMSans_400Regular',
  medium: 'DMSans_500Medium',
  bold: 'DMSans_700Bold',
} as const;

export const shadows = {
  card: Platform.select({
    android: {
      elevation: 16,
    },
    default: {
      shadowColor: '#06101C',
      shadowOpacity: 0.22,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 16 },
    },
  }),
  floating: Platform.select({
    android: {
      elevation: 10,
    },
    default: {
      shadowColor: '#08111D',
      shadowOpacity: 0.18,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 10 },
    },
  }),
} as const;

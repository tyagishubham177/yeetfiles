import { Platform } from 'react-native';

export const lightColors = {
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

export const darkColors = {
  canvas: '#0E131B',
  ink: '#F4F7FB',
  mutedInk: '#AAB4C0',
  stage: '#070B12',
  stageCard: '#101826',
  surface: '#151C27',
  surfaceMuted: '#212A38',
  outline: '#2F3948',
  keep: '#32C888',
  delete: '#F08269',
  skip: '#7C8CA0',
  progress: '#61A8F4',
  highlight: '#F3B43F',
  overlay: 'rgba(4, 7, 12, 0.76)',
  scrim: 'rgba(3, 5, 10, 0.8)',
  stageGlow: 'rgba(97, 168, 244, 0.14)',
  cardGlass: 'rgba(255, 255, 255, 0.06)',
  white: '#F9FAFB',
  dangerText: '#FFD3C7',
} as const;

export const nightColors = {
  canvas: '#090C12',
  ink: '#F2F5F8',
  mutedInk: '#98A4B1',
  stage: '#02050A',
  stageCard: '#0A1018',
  surface: '#111720',
  surfaceMuted: '#1A2230',
  outline: '#263142',
  keep: '#2AB977',
  delete: '#DD7359',
  skip: '#75859A',
  progress: '#4C97E8',
  highlight: '#D9A23B',
  overlay: 'rgba(1, 3, 8, 0.84)',
  scrim: 'rgba(0, 1, 4, 0.86)',
  stageGlow: 'rgba(76, 151, 232, 0.08)',
  cardGlass: 'rgba(255, 255, 255, 0.04)',
  white: '#F5F7FA',
  dangerText: '#F6C7BB',
} as const;

export const colors = lightColors;

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

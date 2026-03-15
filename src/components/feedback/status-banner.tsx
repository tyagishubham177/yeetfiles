import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { radius, spacing, typography } from '../../constants/ui-tokens';
import { useAppTheme } from '../../lib/theme';
import { useAppStore } from '../../store/app-store';

type StatusBannerProps = {
  message: string;
  tone?: 'info' | 'success' | 'error';
};

const TONE_ICONS = {
  info: 'ℹ',
  success: '✓',
  error: '!',
} as const;

export function StatusBanner({ message, tone = 'info' }: StatusBannerProps) {
  const { colors, isDark } = useAppTheme();
  const animationsEnabled = useAppStore((state) => state.settings.animationsEnabled);

  const palette =
    tone === 'error'
      ? {
          backgroundColor: isDark ? 'rgba(221,115,89,0.12)' : '#FFF0EA',
          borderColor: isDark ? 'rgba(221,115,89,0.18)' : '#F4C7B9',
          iconBg: isDark ? 'rgba(221,115,89,0.2)' : 'rgba(231,111,81,0.15)',
          iconColor: isDark ? '#DD7359' : '#E76F51',
        }
      : tone === 'success'
        ? {
            backgroundColor: isDark ? 'rgba(42,185,119,0.12)' : '#ECFBF3',
            borderColor: isDark ? 'rgba(42,185,119,0.18)' : '#BEE8CE',
            iconBg: isDark ? 'rgba(42,185,119,0.2)' : 'rgba(46,194,126,0.15)',
            iconColor: isDark ? '#2AB977' : '#2EC27E',
          }
        : {
            backgroundColor: isDark ? 'rgba(97,168,244,0.12)' : '#EAF2FA',
            borderColor: isDark ? 'rgba(97,168,244,0.2)' : '#C8DCF5',
            iconBg: isDark ? 'rgba(97,168,244,0.2)' : 'rgba(60,145,230,0.15)',
            iconColor: isDark ? '#61A8F4' : '#3C91E6',
          };

  return (
    <Animated.View
      entering={animationsEnabled ? FadeIn.duration(250) : undefined}
      exiting={animationsEnabled ? FadeOut.duration(200) : undefined}
      style={[styles.wrap, { backgroundColor: palette.backgroundColor, borderColor: palette.borderColor }]}
    >
      <View style={[styles.iconWrap, { backgroundColor: palette.iconBg }]}>
        <Text style={[styles.icon, { color: palette.iconColor }]}>{TONE_ICONS[tone]}</Text>
      </View>
      <Text style={[styles.message, { color: colors.ink }]}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontFamily: typography.bold,
    fontSize: 13,
  },
  message: {
    flex: 1,
    fontFamily: typography.medium,
    fontSize: 14,
    lineHeight: 21,
  },
});

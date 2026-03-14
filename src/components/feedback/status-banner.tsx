import { StyleSheet, Text, View } from 'react-native';

import { radius, spacing, typography } from '../../constants/ui-tokens';
import { useAppTheme } from '../../lib/theme';

type StatusBannerProps = {
  message: string;
  tone?: 'info' | 'success' | 'error';
};

export function StatusBanner({ message, tone = 'info' }: StatusBannerProps) {
  const { colors, isDark } = useAppTheme();

  const palette =
    tone === 'error'
      ? {
          backgroundColor: isDark ? 'rgba(221,115,89,0.12)' : '#FFF0EA',
          borderColor: isDark ? 'rgba(221,115,89,0.18)' : '#F4C7B9',
        }
      : tone === 'success'
        ? {
            backgroundColor: isDark ? 'rgba(42,185,119,0.12)' : '#ECFBF3',
            borderColor: isDark ? 'rgba(42,185,119,0.18)' : '#BEE8CE',
          }
        : {
            backgroundColor: isDark ? 'rgba(97,168,244,0.12)' : '#EAF2FA',
            borderColor: isDark ? 'rgba(97,168,244,0.2)' : '#C8DCF5',
          };

  return (
    <View style={[styles.wrap, palette]}>
      <Text style={[styles.message, { color: colors.ink }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  message: {
    fontFamily: typography.medium,
    fontSize: 14,
    lineHeight: 21,
  },
});

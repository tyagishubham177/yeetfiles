import { StyleSheet, Text, View } from 'react-native';

import { radius, spacing, typography } from '../../constants/ui-tokens';
import { useAppTheme } from '../../lib/theme';
import type { MilestoneEvent } from '../../types/app-state';

type MilestoneBannerProps = {
  milestone: MilestoneEvent;
};

export function MilestoneBanner({ milestone }: MilestoneBannerProps) {
  const { colors, isNightMode } = useAppTheme();

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: isNightMode ? 'rgba(217,162,59,0.12)' : 'rgba(243,180,63,0.18)',
          borderColor: isNightMode ? 'rgba(217,162,59,0.18)' : 'rgba(243,180,63,0.28)',
        },
      ]}
    >
      <Text style={[styles.eyebrow, { color: colors.highlight }]}>{milestone.count} decisions</Text>
      <Text style={[styles.title, { color: colors.white }]}>{milestone.title}</Text>
      <Text style={[styles.body, { color: isNightMode ? 'rgba(245,247,250,0.74)' : 'rgba(249,250,251,0.82)' }]}>{milestone.body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
    gap: 4,
  },
  eyebrow: {
    fontFamily: typography.medium,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    fontFamily: typography.display,
    fontSize: 22,
  },
  body: {
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 22,
  },
});

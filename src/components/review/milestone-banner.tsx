import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../../constants/ui-tokens';
import type { MilestoneEvent } from '../../types/app-state';

type MilestoneBannerProps = {
  milestone: MilestoneEvent;
};

export function MilestoneBanner({ milestone }: MilestoneBannerProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.eyebrow}>{milestone.count} decisions</Text>
      <Text style={styles.title}>{milestone.title}</Text>
      <Text style={styles.body}>{milestone.body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.md,
    backgroundColor: 'rgba(243,180,63,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(243,180,63,0.28)',
    padding: spacing.md,
    gap: 4,
  },
  eyebrow: {
    color: colors.highlight,
    fontFamily: typography.medium,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    color: colors.white,
    fontFamily: typography.display,
    fontSize: 22,
  },
  body: {
    color: 'rgba(249,250,251,0.82)',
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 22,
  },
});

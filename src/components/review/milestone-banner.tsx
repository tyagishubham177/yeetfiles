import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  SlideInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { radius, spacing, typography } from '../../constants/ui-tokens';
import { useAppTheme } from '../../lib/theme';
import { useAppStore } from '../../store/app-store';
import type { MilestoneEvent } from '../../types/app-state';

type MilestoneBannerProps = {
  milestone: MilestoneEvent;
};

export function MilestoneBanner({ milestone }: MilestoneBannerProps) {
  const { colors, isNightMode } = useAppTheme();
  const animationsEnabled = useAppStore((state) => state.settings.animationsEnabled);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (!animationsEnabled) return;
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 800, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
  }, [animationsEnabled, pulseScale]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  return (
    <Animated.View
      entering={animationsEnabled ? SlideInUp.duration(400).springify() : undefined}
      style={[
        styles.wrap,
        {
          backgroundColor: isNightMode ? 'rgba(217,162,59,0.12)' : 'rgba(243,180,63,0.18)',
          borderColor: isNightMode ? 'rgba(217,162,59,0.18)' : 'rgba(243,180,63,0.28)',
        },
      ]}
    >
      {/* Celebration accent line */}
      <View style={[styles.accentLine, { backgroundColor: colors.highlight }]} />
      <View style={styles.contentRow}>
        <Animated.View style={[styles.badge, { backgroundColor: colors.highlight }, pulseStyle]}>
          <Text style={styles.badgeText}>🏆</Text>
        </Animated.View>
        <View style={styles.textContent}>
          <Text style={[styles.eyebrow, { color: colors.highlight }]}>{milestone.count} decisions</Text>
          <Text style={[styles.title, { color: colors.white }]}>{milestone.title}</Text>
          <Text style={[styles.body, { color: isNightMode ? 'rgba(245,247,250,0.74)' : 'rgba(249,250,251,0.82)' }]}>{milestone.body}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
    overflow: 'hidden',
  },
  accentLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    borderTopLeftRadius: radius.md,
    borderTopRightRadius: radius.md,
  },
  contentRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 18,
  },
  textContent: {
    flex: 1,
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

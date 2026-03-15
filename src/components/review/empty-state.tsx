import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { spacing, typography } from '../../constants/ui-tokens';
import { useAppTheme } from '../../lib/theme';
import { useAppStore } from '../../store/app-store';
import { Button } from '../ui/button';

type EmptyStateProps = {
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ title, body, actionLabel, onAction }: EmptyStateProps) {
  const { colors, isNightMode } = useAppTheme();
  const animationsEnabled = useAppStore((state) => state.settings.animationsEnabled);
  const orbFloat = useSharedValue(0);

  useEffect(() => {
    if (!animationsEnabled) return;
    orbFloat.value = withRepeat(
      withSequence(
        withTiming(6, { duration: 2400, easing: Easing.inOut(Easing.sin) }),
        withTiming(-6, { duration: 2400, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
  }, [animationsEnabled, orbFloat]);

  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: orbFloat.value }],
  }));

  return (
    <View style={styles.wrap}>
      {/* Decorative ambient orb */}
      <Animated.View
        style={[
          styles.decorOrb,
          { backgroundColor: isNightMode ? 'rgba(217,162,59,0.08)' : 'rgba(243,180,63,0.14)' },
          orbStyle,
        ]}
      />
      <View style={[styles.iconWrap, { backgroundColor: isNightMode ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.1)' }]}>
        <Text style={styles.iconEmoji}>📭</Text>
      </View>
      <Text style={[styles.title, { color: colors.white }]}>{title}</Text>
      <Text style={[styles.body, { color: isNightMode ? 'rgba(245,247,250,0.76)' : 'rgba(249,250,251,0.82)' }]}>{body}</Text>
      {actionLabel && onAction ? <Button label={actionLabel} onPress={onAction} variant="secondary" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  decorOrb: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    top: '10%',
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  iconEmoji: {
    fontSize: 28,
  },
  title: {
    fontFamily: typography.display,
    fontSize: 28,
    textAlign: 'center',
  },
  body: {
    fontFamily: typography.body,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
});

import { ActivityIndicator, Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { radius, spacing, typography } from '../../constants/ui-tokens';
import { useAppTheme } from '../../lib/theme';
import { useAppStore } from '../../store/app-store';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  loadingLabel?: string;
  compact?: boolean;
  style?: ViewStyle;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  loadingLabel,
  compact = false,
  style,
}: ButtonProps) {
  const soundEnabled = useAppStore((state) => state.settings.soundEnabled);
  const animationsEnabled = useAppStore((state) => state.settings.animationsEnabled);
  const { colors, isDark } = useAppTheme();
  const resolvedDisabled = disabled || loading;
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  const labelColor =
    variant === 'primary'
      ? colors.onAction
      : variant === 'danger'
        ? colors.white
        : variant === 'ghost' && isDark
          ? colors.progress
          : colors.ink;

  const handlePressIn = () => {
    if (resolvedDisabled || !animationsEnabled) return;
    scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
    glowOpacity.value = withTiming(1, { duration: 120 });
  };

  const handlePressOut = () => {
    if (!animationsEnabled) return;
    scale.value = withSpring(1, { damping: 12, stiffness: 300 });
    glowOpacity.value = withTiming(0, { duration: 200 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const bgColor =
    variant === 'primary'
      ? colors.action
      : variant === 'secondary'
        ? colors.surfaceMuted
        : variant === 'danger'
          ? colors.delete
          : 'transparent';

  return (
    <AnimatedPressable
      accessibilityRole="button"
      android_disableSound={!soundEnabled}
      disabled={resolvedDisabled}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.base,
        compact && styles.compact,
        { backgroundColor: bgColor },
        variant === 'primary' && isDark && styles.primaryDark,
        variant === 'ghost' && styles.ghost,
        resolvedDisabled && styles.disabled,
        animatedStyle,
        style,
      ]}
    >
      {/* Inner glow on press for primary */}
      {variant === 'primary' ? (
        <Animated.View
          pointerEvents="none"
          style={[styles.innerGlow, { backgroundColor: isDark ? colors.accentGradientStart : colors.accentGradientStart }, glowStyle]}
        />
      ) : null}
      <View style={styles.content}>
        {loading ? <ActivityIndicator color={labelColor} size="small" /> : null}
        <Text style={[styles.label, { color: labelColor }]}>{loading ? loadingLabel ?? label : label}</Text>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 56,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    overflow: 'hidden',
  },
  compact: {
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  primaryDark: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.45,
  },
  label: {
    fontFamily: typography.bold,
    fontSize: 16,
    letterSpacing: 0.2,
  },
  innerGlow: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0,
    borderRadius: radius.pill,
  },
});

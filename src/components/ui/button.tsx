import { ActivityIndicator, Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { radius, spacing, typography } from '../../constants/ui-tokens';
import { useAppTheme } from '../../lib/theme';
import { useAppStore } from '../../store/app-store';

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
  const labelColor =
    variant === 'primary'
      ? colors.onAction
      : variant === 'danger'
        ? colors.white
        : variant === 'ghost' && isDark
          ? colors.progress
          : colors.ink;

  return (
    <Pressable
      accessibilityRole="button"
      android_disableSound={!soundEnabled}
      disabled={resolvedDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        compact && styles.compact,
        variant === 'primary' && { backgroundColor: colors.action },
        variant === 'secondary' && { backgroundColor: colors.surfaceMuted },
        variant === 'danger' && { backgroundColor: colors.delete },
        variant === 'ghost' && styles.ghost,
        pressed && !resolvedDisabled && animationsEnabled && styles.pressed,
        resolvedDisabled && styles.disabled,
        style,
      ]}
    >
      <View style={styles.content}>
        {loading ? <ActivityIndicator color={labelColor} size="small" /> : null}
        <Text style={[styles.label, { color: labelColor }]}>{loading ? loadingLabel ?? label : label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 56,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  compact: {
    minHeight: 44,
    paddingHorizontal: spacing.md,
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
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.45,
  },
  label: {
    fontFamily: typography.bold,
    fontSize: 16,
  },
});

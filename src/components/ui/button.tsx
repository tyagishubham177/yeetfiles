import { Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';

import { radius, spacing, typography } from '../../constants/ui-tokens';
import { useAppTheme } from '../../lib/theme';
import { useAppStore } from '../../store/app-store';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  disabled?: boolean;
  compact?: boolean;
  style?: ViewStyle;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  compact = false,
  style,
}: ButtonProps) {
  const soundEnabled = useAppStore((state) => state.settings.soundEnabled);
  const animationsEnabled = useAppStore((state) => state.settings.animationsEnabled);
  const { colors, isDark } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      android_disableSound={!soundEnabled}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        compact && styles.compact,
        variant === 'primary' && { backgroundColor: colors.ink },
        variant === 'secondary' && { backgroundColor: colors.surfaceMuted },
        variant === 'danger' && { backgroundColor: colors.delete },
        variant === 'ghost' && styles.ghost,
        pressed && !disabled && animationsEnabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          { color: variant === 'secondary' || variant === 'ghost' ? colors.ink : colors.white },
          variant === 'ghost' && isDark && { color: colors.progress },
        ]}
      >
        {label}
      </Text>
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

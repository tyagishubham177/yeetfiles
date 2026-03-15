import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';

import { radius, shadows, spacing, typography } from '../../constants/ui-tokens';
import { useAppTheme } from '../../lib/theme';
import { useAppStore } from '../../store/app-store';
import type { UndoEntry } from '../../types/app-state';

type UndoToastProps = {
  entry: UndoEntry;
  onUndo: () => void;
  tone?: 'dark' | 'light';
};

export function UndoToast({ entry, onUndo, tone = 'dark' }: UndoToastProps) {
  const { colors, isNightMode } = useAppTheme();
  const animationsEnabled = useAppStore((state) => state.settings.animationsEnabled);
  const lightTone = tone === 'light';

  const actionIcon = entry.action === 'keep' ? '✓' : '↻';
  const actionColor = entry.action === 'keep' ? colors.keep : colors.skip;

  return (
    <Animated.View
      entering={animationsEnabled ? FadeInDown.duration(300).springify() : undefined}
      exiting={animationsEnabled ? FadeOutDown.duration(200) : undefined}
      style={[
        styles.wrap,
        lightTone ? { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outline } : { backgroundColor: isNightMode ? 'rgba(2,5,10,0.94)' : 'rgba(8,12,20,0.92)' },
      ]}
    >
      <View style={[styles.actionIndicator, { backgroundColor: lightTone ? `${actionColor}18` : `${actionColor}22` }]}>
        <Text style={[styles.actionIcon, { color: actionColor }]}>{actionIcon}</Text>
      </View>
      <View style={styles.copy}>
        <Text style={[styles.title, { color: lightTone ? colors.ink : colors.white }]}>
          {entry.action === 'keep' ? 'Kept for now' : 'Skipped for later'}
        </Text>
        <Text style={[styles.body, { color: lightTone ? colors.mutedInk : isNightMode ? 'rgba(245,247,250,0.68)' : 'rgba(249,250,251,0.74)' }]} numberOfLines={1}>
          Undo returns {entry.fileName} to the stack.
        </Text>
      </View>
      <Pressable accessibilityRole="button" onPress={onUndo} style={({ pressed }) => [styles.button, { backgroundColor: lightTone ? colors.surfaceMuted : 'rgba(255,255,255,0.1)' }, pressed && styles.buttonPressed]}>
        <Text style={[styles.buttonLabel, { color: lightTone ? colors.ink : colors.highlight }]}>Undo</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingLeft: spacing.sm,
    paddingRight: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    ...(shadows.floating as object),
  },
  actionIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    fontFamily: typography.bold,
    fontSize: 16,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: typography.bold,
    fontSize: 14,
  },
  body: {
    fontFamily: typography.body,
    fontSize: 13,
  },
  button: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
  buttonLabel: {
    fontFamily: typography.bold,
    fontSize: 14,
    letterSpacing: 0.3,
  },
});

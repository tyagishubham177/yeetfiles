import { Pressable, StyleSheet, Text, View } from 'react-native';

import { radius, shadows, spacing, typography } from '../../constants/ui-tokens';
import { useAppTheme } from '../../lib/theme';
import type { UndoEntry } from '../../types/app-state';

type UndoToastProps = {
  entry: UndoEntry;
  onUndo: () => void;
  tone?: 'dark' | 'light';
};

export function UndoToast({ entry, onUndo, tone = 'dark' }: UndoToastProps) {
  const { colors, isNightMode } = useAppTheme();
  const lightTone = tone === 'light';

  return (
    <View
      style={[
        styles.wrap,
        lightTone ? { backgroundColor: colors.surface } : { backgroundColor: isNightMode ? 'rgba(2,5,10,0.94)' : 'rgba(8,12,20,0.92)' },
      ]}
    >
      <View style={styles.copy}>
        <Text style={[styles.title, { color: lightTone ? colors.ink : colors.white }]}>
          {entry.action === 'keep' ? 'Kept for now' : 'Skipped for later'}
        </Text>
        <Text style={[styles.body, { color: lightTone ? colors.mutedInk : isNightMode ? 'rgba(245,247,250,0.68)' : 'rgba(249,250,251,0.74)' }]} numberOfLines={1}>
          Undo returns {entry.fileName} to the stack.
        </Text>
      </View>
      <Pressable accessibilityRole="button" onPress={onUndo} style={[styles.button, { backgroundColor: lightTone ? colors.surfaceMuted : 'rgba(255,255,255,0.1)' }]}>
        <Text style={[styles.buttonLabel, { color: lightTone ? colors.ink : colors.highlight }]}>Undo</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    ...(shadows.floating as object),
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
  buttonLabel: {
    fontFamily: typography.bold,
    fontSize: 14,
  },
});

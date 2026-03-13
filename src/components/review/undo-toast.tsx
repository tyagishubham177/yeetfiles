import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, shadows, spacing, typography } from '../../constants/ui-tokens';
import type { UndoEntry } from '../../types/app-state';

type UndoToastProps = {
  entry: UndoEntry;
  onUndo: () => void;
  tone?: 'dark' | 'light';
};

export function UndoToast({ entry, onUndo, tone = 'dark' }: UndoToastProps) {
  const lightTone = tone === 'light';

  return (
    <View style={[styles.wrap, lightTone ? styles.wrapLight : styles.wrapDark]}>
      <View style={styles.copy}>
        <Text style={[styles.title, lightTone && styles.titleLight]}>
          {entry.action === 'keep' ? 'Kept for now' : 'Skipped for later'}
        </Text>
        <Text style={[styles.body, lightTone && styles.bodyLight]} numberOfLines={1}>
          Undo returns {entry.fileName} to the stack.
        </Text>
      </View>
      <Pressable accessibilityRole="button" onPress={onUndo} style={[styles.button, lightTone && styles.buttonLight]}>
        <Text style={[styles.buttonLabel, lightTone && styles.buttonLabelLight]}>Undo</Text>
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
  wrapDark: {
    backgroundColor: 'rgba(8,12,20,0.92)',
  },
  wrapLight: {
    backgroundColor: colors.surface,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: colors.white,
    fontFamily: typography.bold,
    fontSize: 14,
  },
  titleLight: {
    color: colors.ink,
  },
  body: {
    color: 'rgba(249,250,251,0.74)',
    fontFamily: typography.body,
    fontSize: 13,
  },
  bodyLight: {
    color: colors.mutedInk,
  },
  button: {
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  buttonLight: {
    backgroundColor: colors.surfaceMuted,
  },
  buttonLabel: {
    color: colors.highlight,
    fontFamily: typography.bold,
    fontSize: 14,
  },
  buttonLabelLight: {
    color: colors.ink,
  },
});

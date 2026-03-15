import { Pressable, StyleSheet, Text, View } from 'react-native';

import { spacing, typography } from '../../constants/ui-tokens';
import { useAppTheme } from '../../lib/theme';
import { Button } from '../ui/button';

type ActionDockProps = {
  onKeep: () => void;
  onDelete: () => void;
  onSkip: () => void;
  onUndo?: () => void;
  undoCount?: number;
  disabled?: boolean;
};

export function ActionDock({ onKeep, onDelete, onSkip, onUndo, undoCount = 0, disabled = false }: ActionDockProps) {
  const { colors, isNightMode } = useAppTheme();

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: isNightMode ? 'rgba(2,5,10,0.92)' : 'rgba(8,12,20,0.9)',
          borderColor: isNightMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.1)',
        },
      ]}
    >
      <View style={styles.row}>
        <Button label="Delete" onPress={onDelete} variant="danger" disabled={disabled} style={styles.grow} />
        <Button label="Keep" onPress={onKeep} disabled={disabled} style={styles.grow} />
      </View>
      <View style={styles.secondaryRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Skip this photo for later"
          disabled={disabled}
          onPress={onSkip}
          style={({ pressed }) => pressed && !disabled && styles.linkPressed}
        >
          <Text style={[styles.skip, { color: isNightMode ? 'rgba(245,247,250,0.78)' : 'rgba(249,250,251,0.86)' }, disabled && styles.skipDisabled]}>
            Skip for now
          </Text>
        </Pressable>
        {onUndo && undoCount > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Undo one of the last ${undoCount} safe actions`}
            disabled={disabled}
            onPress={onUndo}
            style={({ pressed }) => pressed && !disabled && styles.linkPressed}
          >
            <Text style={[styles.undo, { color: colors.highlight }, disabled && styles.skipDisabled]}>
              Undo ({undoCount})
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 28,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  grow: {
    flex: 1,
  },
  secondaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skip: {
    fontFamily: typography.medium,
    fontSize: 15,
    paddingVertical: spacing.xs,
  },
  undo: {
    fontFamily: typography.bold,
    fontSize: 15,
    paddingVertical: spacing.xs,
  },
  linkPressed: {
    opacity: 0.72,
  },
  skipDisabled: {
    opacity: 0.5,
  },
});

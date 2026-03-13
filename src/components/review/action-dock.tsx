import { StyleSheet, Text, View } from 'react-native';

import { spacing, typography } from '../../constants/ui-tokens';
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
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Button label="Delete" onPress={onDelete} variant="danger" disabled={disabled} style={styles.grow} />
        <Button label="Keep" onPress={onKeep} disabled={disabled} style={styles.grow} />
      </View>
      <View style={styles.secondaryRow}>
        <Text accessibilityRole="button" onPress={disabled ? undefined : onSkip} style={[styles.skip, disabled && styles.skipDisabled]}>
          Skip for now
        </Text>
        {onUndo && undoCount > 0 ? (
          <Text accessibilityRole="button" onPress={disabled ? undefined : onUndo} style={[styles.undo, disabled && styles.skipDisabled]}>
            Undo ({undoCount})
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
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
    color: 'rgba(249,250,251,0.86)',
    paddingVertical: spacing.xs,
  },
  undo: {
    fontFamily: typography.bold,
    fontSize: 15,
    color: '#F3B43F',
    paddingVertical: spacing.xs,
  },
  skipDisabled: {
    opacity: 0.5,
  },
});

import { StyleSheet, Text, View } from 'react-native';

import { spacing, typography } from '../../constants/ui-tokens';
import { Button } from '../ui/button';

type ActionDockProps = {
  onKeep: () => void;
  onDelete: () => void;
  onSkip: () => void;
  disabled?: boolean;
};

export function ActionDock({ onKeep, onDelete, onSkip, disabled = false }: ActionDockProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Button label="Delete" onPress={onDelete} variant="danger" disabled={disabled} style={styles.grow} />
        <Button label="Keep" onPress={onKeep} disabled={disabled} style={styles.grow} />
      </View>
      <Text accessibilityRole="button" onPress={disabled ? undefined : onSkip} style={[styles.skip, disabled && styles.skipDisabled]}>
        Skip for now
      </Text>
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
  skip: {
    textAlign: 'center',
    fontFamily: typography.medium,
    fontSize: 15,
    color: 'rgba(249,250,251,0.86)',
    paddingVertical: spacing.xs,
  },
  skipDisabled: {
    opacity: 0.5,
  },
});

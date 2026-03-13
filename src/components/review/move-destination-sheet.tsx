import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../../constants/ui-tokens';
import type { MoveTarget } from '../../types/app-state';
import { Button } from '../ui/button';
import { Sheet } from '../ui/sheet';

type MoveDestinationSheetProps = {
  visible: boolean;
  selectedTarget: MoveTarget | null;
  recentTargets: MoveTarget[];
  isMoving: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onPickTarget: () => void;
  onSelectRecentTarget: (target: MoveTarget) => void;
  onConfirmMove: () => void;
};

export function MoveDestinationSheet({
  visible,
  selectedTarget,
  recentTargets,
  isMoving,
  errorMessage,
  onClose,
  onPickTarget,
  onSelectRecentTarget,
  onConfirmMove,
}: MoveDestinationSheetProps) {
  return (
    <Sheet visible={visible} onClose={onClose}>
      <Text style={styles.title}>Move photo</Text>
      <Text style={styles.body}>Pick a destination folder first, then confirm the move explicitly.</Text>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Selected destination</Text>
        <View style={styles.targetCard}>
          <Text style={styles.targetValue}>{selectedTarget?.label ?? 'No folder selected yet'}</Text>
        </View>
        <Button label="Choose folder" onPress={onPickTarget} variant="secondary" />
      </View>

      {recentTargets.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Recent destinations</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentRow}>
            {recentTargets.map((target) => {
              const selected = selectedTarget?.uri === target.uri;

              return (
                <Pressable
                  key={target.uri}
                  accessibilityRole="button"
                  onPress={() => onSelectRecentTarget(target)}
                  style={[styles.recentChip, selected && styles.recentChipSelected]}
                >
                  <Text style={[styles.recentChipLabel, selected && styles.recentChipLabelSelected]}>{target.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : null}

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      <View style={styles.actions}>
        <Button label="Back" onPress={onClose} variant="ghost" />
        <Button
          label={isMoving ? 'Moving...' : 'Confirm move'}
          onPress={onConfirmMove}
          disabled={!selectedTarget || isMoving}
        />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.ink,
    fontFamily: typography.display,
    fontSize: 28,
  },
  body: {
    color: colors.mutedInk,
    fontFamily: typography.body,
    fontSize: 15,
    lineHeight: 22,
  },
  section: {
    gap: spacing.sm,
  },
  sectionLabel: {
    color: colors.mutedInk,
    fontFamily: typography.medium,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  targetCard: {
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.md,
  },
  targetValue: {
    color: colors.ink,
    fontFamily: typography.bold,
    fontSize: 15,
  },
  recentRow: {
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  recentChip: {
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  recentChipSelected: {
    backgroundColor: '#101418',
  },
  recentChipLabel: {
    color: colors.ink,
    fontFamily: typography.medium,
    fontSize: 13,
  },
  recentChipLabelSelected: {
    color: colors.white,
  },
  errorText: {
    color: colors.delete,
    fontFamily: typography.medium,
    fontSize: 14,
    lineHeight: 21,
  },
  actions: {
    gap: spacing.sm,
  },
});

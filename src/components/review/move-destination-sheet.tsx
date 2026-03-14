import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, radius, spacing, typography } from '../../constants/ui-tokens';
import type { MoveTarget } from '../../types/app-state';
import { Button } from '../ui/button';
import { Sheet } from '../ui/sheet';

type MoveDestinationSheetProps = {
  visible: boolean;
  selectedTarget: MoveTarget | null;
  recentTargets: MoveTarget[];
  availableTargets: MoveTarget[];
  pendingAlbumName: string;
  isLoadingTargets: boolean;
  isMoving: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onPendingAlbumNameChange: (value: string) => void;
  onSelectTarget: (target: MoveTarget) => void;
  onConfirmMove: () => void;
};

export function MoveDestinationSheet({
  visible,
  selectedTarget,
  recentTargets,
  availableTargets,
  pendingAlbumName,
  isLoadingTargets,
  isMoving,
  errorMessage,
  onClose,
  onPendingAlbumNameChange,
  onSelectTarget,
  onConfirmMove,
}: MoveDestinationSheetProps) {
  return (
    <Sheet visible={visible} onClose={onClose}>
      <Text style={styles.title}>Move photo</Text>
      <Text style={styles.body}>Pick an existing gallery album or create a new one, then confirm the move explicitly.</Text>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Selected destination</Text>
        <View style={styles.targetCard}>
          <Text style={styles.targetValue}>{selectedTarget?.label ?? 'No album selected yet'}</Text>
        </View>
      </View>

      {recentTargets.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Recent albums</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {recentTargets.map((target) => {
              const selected = selectedTarget?.albumId
                ? selectedTarget.albumId === target.albumId
                : selectedTarget?.albumName === target.albumName;

              return (
                <Pressable
                  key={`${target.albumId ?? 'new'}-${target.albumName}`}
                  accessibilityRole="button"
                  onPress={() => onSelectTarget(target)}
                  style={[styles.chip, selected && styles.chipSelected]}
                >
                  <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>{target.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Existing albums</Text>
        {isLoadingTargets ? (
          <Text style={styles.helperText}>Loading albums from the media library...</Text>
        ) : (
          <ScrollView style={styles.targetList} contentContainerStyle={styles.targetListContent}>
            {availableTargets.map((target) => {
              const selected = selectedTarget?.albumId === target.albumId;

              return (
                <Pressable
                  key={target.albumId ?? target.albumName}
                  accessibilityRole="button"
                  onPress={() => onSelectTarget(target)}
                  style={[styles.targetOption, selected && styles.targetOptionSelected]}
                >
                  <Text style={[styles.targetOptionLabel, selected && styles.targetOptionLabelSelected]}>{target.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Or create a new album</Text>
        <TextInput
          placeholder="New album name"
          placeholderTextColor="#8792A2"
          value={pendingAlbumName}
          onChangeText={onPendingAlbumNameChange}
          style={styles.input}
        />
        <Button
          label="Use new album"
          variant="secondary"
          onPress={() =>
            onSelectTarget({
              albumName: pendingAlbumName.trim(),
              label: pendingAlbumName.trim() || 'New album',
              isNew: true,
            })
          }
          disabled={!pendingAlbumName.trim()}
        />
      </View>

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      <View style={styles.actions}>
        <Button label="Back" onPress={onClose} variant="ghost" />
        <Button label={isMoving ? 'Moving...' : 'Confirm move'} onPress={onConfirmMove} disabled={!selectedTarget || isMoving} />
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
  chipRow: {
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  chip: {
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipSelected: {
    backgroundColor: '#101418',
  },
  chipLabel: {
    color: colors.ink,
    fontFamily: typography.medium,
    fontSize: 13,
  },
  chipLabelSelected: {
    color: colors.white,
  },
  targetList: {
    maxHeight: 180,
  },
  targetListContent: {
    gap: spacing.sm,
  },
  targetOption: {
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.md,
  },
  targetOptionSelected: {
    backgroundColor: '#101418',
  },
  targetOptionLabel: {
    color: colors.ink,
    fontFamily: typography.medium,
    fontSize: 14,
  },
  targetOptionLabelSelected: {
    color: colors.white,
  },
  helperText: {
    color: colors.mutedInk,
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 21,
  },
  input: {
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    color: colors.ink,
    fontFamily: typography.body,
    fontSize: 15,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
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

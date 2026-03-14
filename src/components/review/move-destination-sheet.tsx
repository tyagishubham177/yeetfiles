import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { radius, spacing, typography } from '../../constants/ui-tokens';
import { useAppTheme } from '../../lib/theme';
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
  const { colors, isDark } = useAppTheme();

  return (
    <Sheet visible={visible} onClose={onClose}>
      <Text style={[styles.title, { color: colors.ink }]}>Move photo</Text>
      <Text style={[styles.body, { color: colors.mutedInk }]}>Pick an existing gallery album or create a new one, then confirm the move explicitly.</Text>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.mutedInk }]}>Selected destination</Text>
        <View style={[styles.targetCard, { backgroundColor: colors.surfaceMuted }]}>
          <Text style={[styles.targetValue, { color: colors.ink }]}>{selectedTarget?.label ?? 'No album selected yet'}</Text>
        </View>
      </View>

      {recentTargets.length > 0 ? (
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedInk }]}>Recent albums</Text>
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
                  style={({ pressed }) => [
                    styles.chip,
                    {
                      backgroundColor: selected ? colors.action : colors.surfaceMuted,
                      borderColor: selected ? colors.action : isDark ? colors.outline : 'transparent',
                    },
                    pressed && styles.pressedItem,
                  ]}
                >
                  <Text style={[styles.chipLabel, { color: selected ? colors.onAction : colors.ink }]}>{target.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.mutedInk }]}>Existing albums</Text>
        {isLoadingTargets ? (
          <Text style={[styles.helperText, { color: colors.mutedInk }]}>Loading albums from the media library...</Text>
        ) : (
          <ScrollView style={styles.targetList} contentContainerStyle={styles.targetListContent}>
            {availableTargets.map((target) => {
              const selected = selectedTarget?.albumId === target.albumId;

              return (
                <Pressable
                  key={target.albumId ?? target.albumName}
                  accessibilityRole="button"
                  onPress={() => onSelectTarget(target)}
                  style={({ pressed }) => [
                    styles.targetOption,
                    {
                      backgroundColor: selected ? colors.action : colors.surfaceMuted,
                      borderColor: selected ? colors.action : isDark ? colors.outline : 'transparent',
                    },
                    pressed && styles.pressedItem,
                  ]}
                >
                  <Text style={[styles.targetOptionLabel, { color: selected ? colors.onAction : colors.ink }]}>{target.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.mutedInk }]}>Or create a new album</Text>
        <TextInput
          placeholder="New album name"
          placeholderTextColor={colors.mutedInk}
          value={pendingAlbumName}
          onChangeText={onPendingAlbumNameChange}
          style={[styles.input, { backgroundColor: colors.surfaceMuted, color: colors.ink }]}
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

      {errorMessage ? <Text style={[styles.errorText, { color: colors.delete }]}>{errorMessage}</Text> : null}

      <View style={styles.actions}>
        <Button label="Back" onPress={onClose} variant="ghost" />
        <Button label="Confirm move" loading={isMoving} loadingLabel="Moving photo..." onPress={onConfirmMove} disabled={!selectedTarget} />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: typography.display,
    fontSize: 28,
  },
  body: {
    fontFamily: typography.body,
    fontSize: 15,
    lineHeight: 22,
  },
  section: {
    gap: spacing.sm,
  },
  sectionLabel: {
    fontFamily: typography.medium,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  targetCard: {
    borderRadius: radius.md,
    padding: spacing.md,
  },
  targetValue: {
    fontFamily: typography.bold,
    fontSize: 15,
  },
  chipRow: {
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  chip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  pressedItem: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  chipLabel: {
    fontFamily: typography.medium,
    fontSize: 13,
  },
  targetList: {
    maxHeight: 180,
  },
  targetListContent: {
    gap: spacing.sm,
  },
  targetOption: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
  },
  targetOptionLabel: {
    fontFamily: typography.medium,
    fontSize: 14,
  },
  helperText: {
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 21,
  },
  input: {
    borderRadius: radius.md,
    fontFamily: typography.body,
    fontSize: 15,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  errorText: {
    fontFamily: typography.medium,
    fontSize: 14,
    lineHeight: 21,
  },
  actions: {
    gap: spacing.sm,
  },
});

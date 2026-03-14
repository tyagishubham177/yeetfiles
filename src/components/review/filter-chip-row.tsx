import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { colors, radius, spacing, typography } from '../../constants/ui-tokens';
import type { FilterChip, FilterType } from '../../types/file-item';

type FilterChipRowProps = {
  activeFilter: FilterType;
  chips: FilterChip[];
  onSelect: (filter: FilterType) => void;
};

export function FilterChipRow({ activeFilter, chips, onSelect }: FilterChipRowProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {chips.map((chip) => {
        const selected = chip.id === activeFilter;

        return (
          <Pressable
            key={chip.id}
            accessibilityRole="button"
            onPress={() => onSelect(chip.id)}
            style={[styles.chip, selected && styles.chipSelected]}
          >
            <Text style={[styles.label, selected && styles.labelSelected]}>
              {chip.label} ({chip.count})
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  chip: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  chipSelected: {
    backgroundColor: colors.highlight,
    borderColor: 'rgba(243,180,63,0.4)',
  },
  label: {
    color: 'rgba(249,250,251,0.84)',
    fontFamily: typography.medium,
    fontSize: 13,
  },
  labelSelected: {
    color: colors.ink,
  },
});

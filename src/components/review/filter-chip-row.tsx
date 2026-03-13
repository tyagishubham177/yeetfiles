import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { colors, radius, spacing, typography } from '../../constants/ui-tokens';
import { getFilterLabel } from '../../store/app-store';
import type { FilterType } from '../../types/file-item';

type FilterChipRowProps = {
  activeFilter: FilterType;
  counts: Record<FilterType, number>;
  onSelect: (filter: FilterType) => void;
};

const FILTERS: FilterType[] = ['all', 'screenshots', 'camera', 'downloads', 'other'];

export function FilterChipRow({ activeFilter, counts, onSelect }: FilterChipRowProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {FILTERS.map((filter) => {
        const selected = filter === activeFilter;

        return (
          <Pressable
            key={filter}
            accessibilityRole="button"
            onPress={() => onSelect(filter)}
            style={[styles.chip, selected && styles.chipSelected]}
          >
            <Text style={[styles.label, selected && styles.labelSelected]}>
              {getFilterLabel(filter)} ({counts[filter] ?? 0})
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

import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { radius, spacing, typography } from '../../constants/ui-tokens';
import { useAppTheme } from '../../lib/theme';
import type { FilterChip, FilterType } from '../../types/file-item';

type FilterChipRowProps = {
  activeFilter: FilterType;
  chips: FilterChip[];
  onSelect: (filter: FilterType) => void;
};

export function FilterChipRow({ activeFilter, chips, onSelect }: FilterChipRowProps) {
  const { colors, isNightMode } = useAppTheme();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {chips.map((chip) => {
        const selected = chip.id === activeFilter;
        const disabled = Boolean(chip.disabled);

        return (
          <Pressable
            key={chip.id}
            accessibilityRole="button"
            disabled={disabled}
            onPress={() => onSelect(chip.id)}
            style={({ pressed }) => [
              styles.chip,
              {
                backgroundColor: disabled
                  ? isNightMode
                    ? 'rgba(255,255,255,0.02)'
                    : 'rgba(255,255,255,0.04)'
                  : isNightMode
                    ? 'rgba(255,255,255,0.05)'
                    : 'rgba(255,255,255,0.08)',
                borderColor: disabled
                  ? 'transparent'
                  : isNightMode
                    ? 'rgba(255,255,255,0.06)'
                    : 'rgba(255,255,255,0.08)',
              },
              selected && {
                backgroundColor: colors.highlight,
                borderColor: isNightMode ? 'rgba(217,162,59,0.38)' : 'rgba(243,180,63,0.4)',
              },
              pressed && !disabled && styles.pressedChip,
            ]}
          >
            <Text
              style={[
                styles.label,
                {
                  color: disabled
                    ? isNightMode
                      ? 'rgba(245,247,250,0.34)'
                      : 'rgba(249,250,251,0.4)'
                    : selected
                      ? colors.ink
                      : isNightMode
                        ? 'rgba(245,247,250,0.82)'
                        : 'rgba(249,250,251,0.84)',
                },
              ]}
            >
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
    borderWidth: 1,
  },
  pressedChip: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  label: {
    fontFamily: typography.medium,
    fontSize: 13,
  },
});

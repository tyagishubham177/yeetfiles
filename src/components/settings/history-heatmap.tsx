import { Pressable, StyleSheet, Text, View } from 'react-native';

import { spacing, typography } from '../../constants/ui-tokens';
import { formatDayLabel, formatWeekdayLabel } from '../../lib/format';
import { getRecentDateKeys } from '../../lib/time';
import { useAppTheme } from '../../lib/theme';
import type { DailyHistoryEntry } from '../../types/app-state';

type HistoryHeatmapProps = {
  historyByDay: Record<string, DailyHistoryEntry>;
  selectedDateKey: string | null;
  onSelectDateKey: (value: string) => void;
  days?: number;
};

function getActivityLevel(entry: DailyHistoryEntry | undefined) {
  const reviewedCount = entry?.reviewedCount ?? 0;

  if (reviewedCount >= 20) {
    return 4;
  }

  if (reviewedCount >= 10) {
    return 3;
  }

  if (reviewedCount >= 5) {
    return 2;
  }

  if (reviewedCount > 0) {
    return 1;
  }

  return 0;
}

export function HistoryHeatmap({ historyByDay, selectedDateKey, onSelectDateKey, days = 90 }: HistoryHeatmapProps) {
  const { colors, isDark } = useAppTheme();
  const dateKeys = getRecentDateKeys(days);
  const weekdayLabels = dateKeys.slice(0, 7).map((dateKey) => formatWeekdayLabel(dateKey));

  return (
    <View style={styles.wrap}>
      <View style={styles.weekdayRow}>
        {weekdayLabels.map((label, index) => (
          <Text key={`${label}-${index}`} style={[styles.weekdayLabel, { color: colors.mutedInk }]}>
            {label.slice(0, 1)}
          </Text>
        ))}
      </View>
      <View style={styles.grid}>
        {dateKeys.map((dateKey) => {
          const entry = historyByDay[dateKey];
          const activityLevel = getActivityLevel(entry);
          const selected = selectedDateKey === dateKey;
          const backgroundColor =
            activityLevel === 0
              ? colors.surfaceMuted
              : activityLevel === 1
                ? isDark
                  ? 'rgba(76,151,232,0.18)'
                  : 'rgba(60,145,230,0.18)'
                : activityLevel === 2
                  ? isDark
                    ? 'rgba(76,151,232,0.3)'
                    : 'rgba(60,145,230,0.3)'
                  : activityLevel === 3
                    ? isDark
                      ? 'rgba(42,185,119,0.34)'
                      : 'rgba(46,194,126,0.34)'
                    : isDark
                      ? 'rgba(217,162,59,0.44)'
                      : 'rgba(243,180,63,0.44)';

          return (
            <Pressable
              key={dateKey}
              accessibilityRole="button"
              accessibilityLabel={`${formatDayLabel(dateKey)}: ${entry?.reviewedCount ?? 0} reviewed`}
              onPress={() => onSelectDateKey(dateKey)}
              style={[
                styles.cell,
                {
                  backgroundColor,
                  borderColor: selected ? colors.action : 'transparent',
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  weekdayLabel: {
    width: 16,
    textAlign: 'center',
    fontFamily: typography.medium,
    fontSize: 11,
    textTransform: 'uppercase',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  cell: {
    width: 16,
    height: 16,
    borderRadius: 5,
    borderWidth: 1,
  },
});
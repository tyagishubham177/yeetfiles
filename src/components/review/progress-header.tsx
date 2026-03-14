import { StyleSheet, Text, View } from 'react-native';

import { radius, spacing, typography } from '../../constants/ui-tokens';
import { formatBytes } from '../../lib/format';
import { useAppTheme } from '../../lib/theme';
import { ProgressRing } from '../ui/progress-ring';

type ProgressHeaderProps = {
  reviewedCount: number;
  remainingCount: number;
  pendingQueueCount: number;
  visibleQueueCount: number;
  storageFreedBytes: number;
  targetCount: number | null;
  sessionLabel: string;
  sortLabel: string;
  newSinceLastScanCount: number;
  isScanning: boolean;
  scanProgressLoaded: number;
  scanProgressTotal: number | null;
};

export function ProgressHeader({
  reviewedCount,
  remainingCount,
  pendingQueueCount,
  visibleQueueCount,
  storageFreedBytes,
  targetCount,
  sessionLabel,
  sortLabel,
  newSinceLastScanCount,
  isScanning,
  scanProgressLoaded,
  scanProgressTotal,
}: ProgressHeaderProps) {
  const { colors, isNightMode } = useAppTheme();
  const progress = targetCount ? reviewedCount / targetCount : 0;
  const scanLabel = scanProgressTotal ? `${scanProgressLoaded}/${scanProgressTotal}` : `${scanProgressLoaded}`;
  const estimatedPhotoCount = storageFreedBytes > 0 ? Math.max(Math.round(storageFreedBytes / 4_000_000), 1) : 0;

  return (
    <View style={[styles.card, { backgroundColor: colors.cardGlass, borderColor: isNightMode ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.09)' }]}>
      <ProgressRing progress={progress} reviewedCount={reviewedCount} />
      <View style={styles.metaWrap}>
        <Text style={[styles.eyebrow, { color: isNightMode ? 'rgba(245,247,250,0.68)' : 'rgba(249,250,251,0.74)' }]}>{sessionLabel}</Text>
        <Text style={[styles.title, { color: colors.white }]}>{remainingCount} left in this pass</Text>
        <Text style={[styles.subtle, { color: isNightMode ? 'rgba(245,247,250,0.76)' : 'rgba(249,250,251,0.78)' }]}>
          {visibleQueueCount} ready right now / {pendingQueueCount} still waiting overall
        </Text>
        {estimatedPhotoCount > 0 ? (
          <Text style={[styles.context, { color: isNightMode ? 'rgba(245,247,250,0.62)' : 'rgba(249,250,251,0.66)' }]}>
            That is roughly room for {estimatedPhotoCount} more average photos.
          </Text>
        ) : null}
        {newSinceLastScanCount > 0 ? (
          <Text style={[styles.context, { color: isNightMode ? 'rgba(245,247,250,0.62)' : 'rgba(249,250,251,0.66)' }]}>
            {newSinceLastScanCount} new photo{newSinceLastScanCount === 1 ? '' : 's'} since the last scan.
          </Text>
        ) : null}
        <View style={styles.statRow}>
          <View style={[styles.statPill, { backgroundColor: isNightMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.08)' }]}>
            <Text style={[styles.statLabel, { color: isNightMode ? 'rgba(245,247,250,0.64)' : 'rgba(249,250,251,0.7)' }]}>Freed</Text>
            <Text style={[styles.statValue, { color: colors.white }]}>{formatBytes(storageFreedBytes)}</Text>
          </View>
          <View style={[styles.statPill, { backgroundColor: isNightMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.08)' }]}>
            <Text style={[styles.statLabel, { color: isNightMode ? 'rgba(245,247,250,0.64)' : 'rgba(249,250,251,0.7)' }]}>Sort</Text>
            <Text style={[styles.statValue, { color: colors.white }]}>{sortLabel}</Text>
          </View>
          {newSinceLastScanCount > 0 ? (
            <View style={[styles.statPill, { backgroundColor: isNightMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.08)' }]}>
              <Text style={[styles.statLabel, { color: isNightMode ? 'rgba(245,247,250,0.64)' : 'rgba(249,250,251,0.7)' }]}>New</Text>
              <Text style={[styles.statValue, { color: colors.white }]}>{newSinceLastScanCount}</Text>
            </View>
          ) : (
            <View style={[styles.statPill, { backgroundColor: isNightMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.08)' }]}>
              <Text style={[styles.statLabel, { color: isNightMode ? 'rgba(245,247,250,0.64)' : 'rgba(249,250,251,0.7)' }]}>Scanning</Text>
              <Text style={[styles.statValue, { color: colors.white }]}>{isScanning ? scanLabel : 'Done'}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  metaWrap: {
    flex: 1,
    gap: 4,
  },
  eyebrow: {
    fontFamily: typography.medium,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    fontFamily: typography.display,
    fontSize: 22,
  },
  subtle: {
    fontFamily: typography.body,
    fontSize: 14,
  },
  context: {
    fontFamily: typography.body,
    fontSize: 13,
  },
  statRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  statPill: {
    flex: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
  },
  statLabel: {
    fontFamily: typography.medium,
    fontSize: 11,
    textTransform: 'uppercase',
  },
  statValue: {
    fontFamily: typography.bold,
    fontSize: 14,
  },
});

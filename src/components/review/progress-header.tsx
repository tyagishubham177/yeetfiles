import { StyleSheet, Text, View } from 'react-native';

import { radius, spacing, typography } from '../../constants/ui-tokens';
import { formatBytes } from '../../lib/format';
import { useAppTheme } from '../../lib/theme';
import { ProgressRing } from '../ui/progress-ring';

type ProgressHeaderProps = {
  reviewedCount: number;
  remainingCount: number | null;
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
  const isInfiniteSession = targetCount === null;
  const progress = targetCount ? reviewedCount / targetCount : 0;
  const scanLabel = scanProgressTotal
    ? `${scanProgressLoaded}/${scanProgressTotal}`
    : `${scanProgressLoaded}`;
  const estimatedPhotoCount =
    storageFreedBytes > 0 ? Math.max(Math.round(storageFreedBytes / 4_000_000), 1) : 0;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.cardGlass,
          borderColor: isNightMode ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.09)',
        },
      ]}
    >
      {/* Subtle top accent glow */}
      <View
        style={[
          styles.topGlow,
          { backgroundColor: isNightMode ? 'rgba(76,151,232,0.06)' : 'rgba(60,145,230,0.08)' },
        ]}
      />
      <ProgressRing progress={progress} reviewedCount={reviewedCount} />
      <View style={styles.metaWrap}>
        <View style={styles.eyebrowRow}>
          <View
            style={[styles.liveDot, { backgroundColor: isNightMode ? '#4C97E8' : '#3C91E6' }]}
          />
          <Text
            style={[
              styles.eyebrow,
              { color: isNightMode ? 'rgba(245,247,250,0.68)' : 'rgba(249,250,251,0.74)' },
            ]}
          >
            {sessionLabel}
          </Text>
        </View>
        <Text style={[styles.title, { color: colors.white }]}>
          {isInfiniteSession
            ? `${reviewedCount} reviewed in this run`
            : `${remainingCount ?? 0} left in this pass`}
        </Text>
        <Text
          style={[
            styles.subtle,
            { color: isNightMode ? 'rgba(245,247,250,0.76)' : 'rgba(249,250,251,0.78)' },
          ]}
        >
          {visibleQueueCount} ready now · {pendingQueueCount} waiting
        </Text>
        {isInfiniteSession ? (
          <Text
            style={[
              styles.context,
              { color: isNightMode ? 'rgba(245,247,250,0.62)' : 'rgba(249,250,251,0.66)' },
            ]}
          >
            Swipe as short or as long as you want, then terminate for stats.
          </Text>
        ) : null}
        {estimatedPhotoCount > 0 ? (
          <Text
            style={[
              styles.context,
              { color: isNightMode ? 'rgba(245,247,250,0.62)' : 'rgba(249,250,251,0.66)' },
            ]}
          >
            Room for ~{estimatedPhotoCount} more average photos.
          </Text>
        ) : null}
        {newSinceLastScanCount > 0 ? (
          <Text
            style={[
              styles.context,
              { color: isNightMode ? 'rgba(245,247,250,0.62)' : 'rgba(249,250,251,0.66)' },
            ]}
          >
            {newSinceLastScanCount} new photo{newSinceLastScanCount === 1 ? '' : 's'} since the last
            scan.
          </Text>
        ) : null}
        <View style={styles.statRow}>
          <View
            style={[
              styles.statPill,
              {
                backgroundColor: isNightMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.08)',
              },
            ]}
          >
            <Text
              style={[
                styles.statLabel,
                { color: isNightMode ? 'rgba(245,247,250,0.64)' : 'rgba(249,250,251,0.7)' },
              ]}
            >
              Freed
            </Text>
            <Text
              style={[
                styles.statValue,
                {
                  color:
                    storageFreedBytes > 0 ? (isNightMode ? '#2AB977' : '#32C888') : colors.white,
                },
              ]}
            >
              {formatBytes(storageFreedBytes)}
            </Text>
          </View>
          <View
            style={[
              styles.statPill,
              {
                backgroundColor: isNightMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.08)',
              },
            ]}
          >
            <Text
              style={[
                styles.statLabel,
                { color: isNightMode ? 'rgba(245,247,250,0.64)' : 'rgba(249,250,251,0.7)' },
              ]}
            >
              Sort
            </Text>
            <Text style={[styles.statValue, { color: colors.white }]}>{sortLabel}</Text>
          </View>
          {newSinceLastScanCount > 0 ? (
            <View
              style={[
                styles.statPill,
                { backgroundColor: isNightMode ? 'rgba(217,162,59,0.1)' : 'rgba(243,180,63,0.14)' },
              ]}
            >
              <Text
                style={[
                  styles.statLabel,
                  { color: isNightMode ? 'rgba(245,247,250,0.64)' : 'rgba(249,250,251,0.7)' },
                ]}
              >
                New
              </Text>
              <Text style={[styles.statValue, { color: colors.highlight }]}>
                {newSinceLastScanCount}
              </Text>
            </View>
          ) : (
            <View
              style={[
                styles.statPill,
                {
                  backgroundColor: isNightMode
                    ? 'rgba(255,255,255,0.05)'
                    : 'rgba(255,255,255,0.08)',
                },
              ]}
            >
              <Text
                style={[
                  styles.statLabel,
                  { color: isNightMode ? 'rgba(245,247,250,0.64)' : 'rgba(249,250,251,0.7)' },
                ]}
              >
                Scanning
              </Text>
              <Text style={[styles.statValue, { color: colors.white }]}>
                {isScanning ? scanLabel : 'Done'}
              </Text>
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
    overflow: 'hidden',
  },
  topGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
  },
  metaWrap: {
    flex: 1,
    gap: 4,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
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

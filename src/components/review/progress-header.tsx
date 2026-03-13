import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../../constants/ui-tokens';
import { formatBytes } from '../../lib/format';
import { ProgressRing } from '../ui/progress-ring';

type ProgressHeaderProps = {
  reviewedCount: number;
  remainingCount: number;
  pendingQueueCount: number;
  storageFreedBytes: number;
  targetCount: number | null;
  isScanning: boolean;
  scanProgressLoaded: number;
  scanProgressTotal: number | null;
};

export function ProgressHeader({
  reviewedCount,
  remainingCount,
  pendingQueueCount,
  storageFreedBytes,
  targetCount,
  isScanning,
  scanProgressLoaded,
  scanProgressTotal,
}: ProgressHeaderProps) {
  const progress = targetCount ? reviewedCount / targetCount : 0;
  const scanLabel = scanProgressTotal ? `${scanProgressLoaded}/${scanProgressTotal}` : `${scanProgressLoaded}`;

  return (
    <View style={styles.card}>
      <ProgressRing progress={progress} reviewedCount={reviewedCount} />
      <View style={styles.metaWrap}>
        <Text style={styles.eyebrow}>Quick 10</Text>
        <Text style={styles.title}>{remainingCount} left in this pass</Text>
        <Text style={styles.subtle}>{pendingQueueCount} photos still waiting in queue</Text>
        <View style={styles.statRow}>
          <View style={styles.statPill}>
            <Text style={styles.statLabel}>Freed</Text>
            <Text style={styles.statValue}>{formatBytes(storageFreedBytes)}</Text>
          </View>
          <View style={styles.statPill}>
            <Text style={styles.statLabel}>Scanning</Text>
            <Text style={styles.statValue}>{isScanning ? scanLabel : 'Done'}</Text>
          </View>
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
    backgroundColor: colors.cardGlass,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
  },
  metaWrap: {
    flex: 1,
    gap: 4,
  },
  eyebrow: {
    color: 'rgba(249,250,251,0.74)',
    fontFamily: typography.medium,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    color: colors.white,
    fontFamily: typography.display,
    fontSize: 22,
  },
  subtle: {
    color: 'rgba(249,250,251,0.78)',
    fontFamily: typography.body,
    fontSize: 14,
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
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  statLabel: {
    color: 'rgba(249,250,251,0.7)',
    fontFamily: typography.medium,
    fontSize: 11,
    textTransform: 'uppercase',
  },
  statValue: {
    color: colors.white,
    fontFamily: typography.bold,
    fontSize: 14,
  },
});

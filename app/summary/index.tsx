import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../src/components/ui/button';
import { ROUTES } from '../../src/constants/routes';
import { colors, radius, spacing, typography } from '../../src/constants/ui-tokens';
import { formatBytes, formatDuration } from '../../src/lib/format';
import { useAppStore } from '../../src/store/app-store';

export default function SummaryScreen() {
  const router = useRouter();
  const summary = useAppStore((state) => state.sessionSummary);
  const beginQuickSession = useAppStore((state) => state.beginQuickSession);
  const dismissSummary = useAppStore((state) => state.dismissSummary);

  useEffect(() => {
    if (!summary) {
      router.replace(ROUTES.queue);
    }
  }, [router, summary]);

  if (!summary) {
    return null;
  }

  const continueCleaning = () => {
    dismissSummary();
    beginQuickSession(true);
    router.replace(ROUTES.queue);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.banner}>
        <Text style={styles.eyebrow}>Quick 10 complete</Text>
        <Text style={styles.title}>{summary.reviewedCount} decisions made</Text>
        <Text style={styles.subtitle}>You kept the loop moving and freed real space without guessing.</Text>
      </View>

      <View style={styles.grid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Freed</Text>
          <Text style={styles.statValue}>{formatBytes(summary.storageFreedBytes)}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Time</Text>
          <Text style={styles.statValue}>{formatDuration(summary.durationMs)}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Kept</Text>
          <Text style={styles.statValue}>{summary.keptCount}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Deleted</Text>
          <Text style={styles.statValue}>{summary.deletedCount}</Text>
        </View>
        <View style={styles.statCardWide}>
          <Text style={styles.statLabel}>Skipped for later</Text>
          <Text style={styles.statValue}>{summary.skippedCount}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Button label="Continue cleaning" onPress={continueCleaning} />
        <Button label="Back to welcome" onPress={() => router.replace(ROUTES.welcome)} variant="secondary" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.canvas,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    justifyContent: 'space-between',
  },
  banner: {
    paddingTop: spacing.xxl,
    gap: spacing.md,
  },
  eyebrow: {
    color: colors.progress,
    fontFamily: typography.medium,
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    color: colors.ink,
    fontFamily: typography.display,
    fontSize: 42,
    lineHeight: 48,
  },
  subtitle: {
    color: colors.mutedInk,
    fontFamily: typography.body,
    fontSize: 17,
    lineHeight: 26,
  },
  grid: {
    gap: spacing.sm,
  },
  statCard: {
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    gap: 6,
  },
  statCardWide: {
    borderRadius: radius.lg,
    backgroundColor: '#EAF2FA',
    padding: spacing.lg,
    gap: 6,
  },
  statLabel: {
    color: colors.mutedInk,
    fontFamily: typography.medium,
    fontSize: 13,
    textTransform: 'uppercase',
  },
  statValue: {
    color: colors.ink,
    fontFamily: typography.display,
    fontSize: 28,
  },
  actions: {
    gap: spacing.sm,
  },
});

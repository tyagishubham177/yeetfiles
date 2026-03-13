import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { UndoToast } from '../../src/components/review/undo-toast';
import { Button } from '../../src/components/ui/button';
import { ROUTES } from '../../src/constants/routes';
import { colors, radius, spacing, typography } from '../../src/constants/ui-tokens';
import { formatBytes, formatDuration } from '../../src/lib/format';
import { getQuickSessionLabel, selectTopUndoEntry, useAppStore } from '../../src/store/app-store';

export default function SummaryScreen() {
  const router = useRouter();
  const summary = useAppStore((state) => state.sessionSummary);
  const currentFileId = useAppStore((state) => state.currentFileId);
  const beginQuickSession = useAppStore((state) => state.beginQuickSession);
  const requestRescan = useAppStore((state) => state.requestRescan);
  const dismissSummary = useAppStore((state) => state.dismissSummary);
  const undoLastAction = useAppStore((state) => state.undoLastAction);
  const topUndoEntry = useAppStore(selectTopUndoEntry);

  useEffect(() => {
    if (!summary) {
      router.replace(ROUTES.queue);
    }
  }, [router, summary]);

  if (!summary) {
    return null;
  }

  const paceCopy =
    summary.reviewedCount >= 25
      ? 'That was a real cleanup sprint, not just a couple of taps.'
      : summary.reviewedCount >= 10
        ? 'You finished a full pass without the loop slowing down.'
        : 'You kept the session moving and stayed in control.';

  const continueCleaning = () => {
    dismissSummary();

    if (currentFileId) {
      beginQuickSession((summary.targetCount as 10 | 25 | 50 | null) ?? 10, true);
    } else {
      requestRescan();
    }

    router.replace(ROUTES.queue);
  };

  const restartGame = () => {
    dismissSummary();
    requestRescan();
    router.replace(ROUTES.queue);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.banner}>
          <Text style={styles.eyebrow}>{getQuickSessionLabel((summary.targetCount as 10 | 25 | 50 | null) ?? 10)} complete</Text>
          <Text style={styles.title}>{summary.reviewedCount} decisions made</Text>
          <Text style={styles.subtitle}>{paceCopy}</Text>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatLabel}>Storage recovered</Text>
            <Text style={styles.heroStatValue}>{formatBytes(summary.storageFreedBytes)}</Text>
          </View>
        </View>

        <View style={styles.grid}>
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
          <Button label="Start fresh scan" onPress={restartGame} variant="secondary" />
          <Button label="Back to welcome" onPress={() => router.replace(ROUTES.welcome)} variant="ghost" />
        </View>

        {topUndoEntry ? (
          <UndoToast
            entry={topUndoEntry}
            onUndo={() => {
              undoLastAction();
              router.replace(ROUTES.queue);
            }}
            tone="light"
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    justifyContent: 'space-between',
    gap: spacing.xl,
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
  heroStat: {
    borderRadius: radius.lg,
    backgroundColor: '#101418',
    padding: spacing.lg,
    gap: 6,
  },
  heroStatLabel: {
    color: 'rgba(249,250,251,0.72)',
    fontFamily: typography.medium,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroStatValue: {
    color: colors.white,
    fontFamily: typography.display,
    fontSize: 36,
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

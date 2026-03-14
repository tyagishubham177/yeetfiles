import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { UndoToast } from '../../src/components/review/undo-toast';
import { Button } from '../../src/components/ui/button';
import { ROUTES } from '../../src/constants/routes';
import { radius, spacing, typography } from '../../src/constants/ui-tokens';
import { triggerInteractionFeedback } from '../../src/features/feedback/interaction-feedback';
import { formatBytes, formatDuration } from '../../src/lib/format';
import { useAppTheme } from '../../src/lib/theme';
import { getQuickSessionLabel, selectNewSinceLastScanCount, selectTopUndoEntry, useAppStore } from '../../src/store/app-store';

export default function SummaryScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const summary = useAppStore((state) => state.sessionSummary);
  const currentFileId = useAppStore((state) => state.currentFileId);
  const scanState = useAppStore((state) => state.scanState);
  const scanMode = useAppStore((state) => state.scanMode);
  const lastRescanSummary = useAppStore((state) => state.lastRescanSummary);
  const newSinceLastScanCount = useAppStore(selectNewSinceLastScanCount);
  const beginQuickSession = useAppStore((state) => state.beginQuickSession);
  const requestRescan = useAppStore((state) => state.requestRescan);
  const dismissSummary = useAppStore((state) => state.dismissSummary);
  const undoLastAction = useAppStore((state) => state.undoLastAction);
  const topUndoEntry = useAppStore(selectTopUndoEntry);
  const hapticsEnabled = useAppStore((state) => state.settings.hapticsEnabled);

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
      requestRescan({ resetSession: true });
    }

    router.replace(ROUTES.queue);
  };

  const restartGame = () => {
    dismissSummary();
    requestRescan({ resetSession: true });
    router.replace(ROUTES.queue);
  };

  const handleUndo = () => {
    undoLastAction();
    triggerInteractionFeedback('undo', hapticsEnabled);
    router.replace(ROUTES.queue);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.canvas }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.banner}>
          <Text style={[styles.eyebrow, { color: colors.progress }]}>{getQuickSessionLabel((summary.targetCount as 10 | 25 | 50 | null) ?? 10)} complete</Text>
          <Text style={[styles.title, { color: colors.ink }]}>{summary.reviewedCount} decisions made</Text>
          <Text style={[styles.subtitle, { color: colors.mutedInk }]}>{paceCopy}</Text>
          <View style={[styles.heroStat, { backgroundColor: isDark ? colors.stageCard : '#101418' }]}>
            <Text style={styles.heroStatLabel}>Storage recovered</Text>
            <Text style={[styles.heroStatValue, { color: colors.white }]}>{formatBytes(summary.storageFreedBytes)}</Text>
          </View>
        </View>

        <View style={styles.grid}>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: isDark ? colors.outline : 'transparent' }]}>
            <Text style={[styles.statLabel, { color: colors.mutedInk }]}>Time</Text>
            <Text style={[styles.statValue, { color: colors.ink }]}>{formatDuration(summary.durationMs)}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: isDark ? colors.outline : 'transparent' }]}>
            <Text style={[styles.statLabel, { color: colors.mutedInk }]}>Kept</Text>
            <Text style={[styles.statValue, { color: colors.ink }]}>{summary.keptCount}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: isDark ? colors.outline : 'transparent' }]}>
            <Text style={[styles.statLabel, { color: colors.mutedInk }]}>Deleted</Text>
            <Text style={[styles.statValue, { color: colors.ink }]}>{summary.deletedCount}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: isDark ? colors.outline : 'transparent' }]}>
            <Text style={[styles.statLabel, { color: colors.mutedInk }]}>Moved</Text>
            <Text style={[styles.statValue, { color: colors.ink }]}>{summary.movedCount}</Text>
          </View>
          <View style={[styles.statCardWide, { backgroundColor: isDark ? colors.surfaceMuted : '#EAF2FA' }]}>
            <Text style={[styles.statLabel, { color: colors.mutedInk }]}>Skipped for later</Text>
            <Text style={[styles.statValue, { color: colors.ink }]}>{summary.skippedCount}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Button label="Continue cleaning" onPress={continueCleaning} />
          <Button
            label={scanState === 'scanning' && scanMode === 'rescan' ? 'Re-scanning photos...' : 'Check for new photos'}
            onPress={restartGame}
            variant="secondary"
            disabled={scanState === 'scanning' && scanMode === 'rescan'}
          />
          <Button label="Back to welcome" onPress={() => router.replace(ROUTES.welcome)} variant="ghost" />
        </View>

        <View style={[styles.rescanCard, { backgroundColor: isDark ? colors.surfaceMuted : '#EEF4FB' }]}>
          <Text style={[styles.rescanTitle, { color: colors.ink }]}>Re-scan lane</Text>
          <Text style={[styles.rescanBody, { color: colors.ink }]}>
            {newSinceLastScanCount > 0
              ? `${newSinceLastScanCount} photo${newSinceLastScanCount === 1 ? '' : 's'} are still marked new since the last scan.`
              : 'Check the library again after you add new photos outside the app.'}
          </Text>
          {lastRescanSummary ? (
            <Text style={[styles.rescanHint, { color: colors.mutedInk }]}>
              Last re-scan added {lastRescanSummary.newFileCount} new and kept {lastRescanSummary.protectedReviewedCount} reviewed item{lastRescanSummary.protectedReviewedCount === 1 ? '' : 's'} out of the queue.
            </Text>
          ) : null}
        </View>

        {topUndoEntry ? <UndoToast entry={topUndoEntry} onUndo={handleUndo} tone="light" /> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
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
    fontFamily: typography.medium,
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    fontFamily: typography.display,
    fontSize: 42,
    lineHeight: 48,
  },
  subtitle: {
    fontFamily: typography.body,
    fontSize: 17,
    lineHeight: 26,
  },
  heroStat: {
    borderRadius: radius.lg,
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
    fontFamily: typography.display,
    fontSize: 36,
  },
  grid: {
    gap: spacing.sm,
  },
  statCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    gap: 6,
  },
  statCardWide: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: 6,
  },
  statLabel: {
    fontFamily: typography.medium,
    fontSize: 13,
    textTransform: 'uppercase',
  },
  statValue: {
    fontFamily: typography.display,
    fontSize: 28,
  },
  actions: {
    gap: spacing.sm,
  },
  rescanCard: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: 6,
  },
  rescanTitle: {
    fontFamily: typography.bold,
    fontSize: 15,
    textTransform: 'uppercase',
  },
  rescanBody: {
    fontFamily: typography.body,
    fontSize: 15,
    lineHeight: 23,
  },
  rescanHint: {
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 22,
  },
});

import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { UndoToast } from '../../src/components/review/undo-toast';
import { Button } from '../../src/components/ui/button';
import { ROUTES } from '../../src/constants/routes';
import { radius, shadows, spacing, typography } from '../../src/constants/ui-tokens';
import { triggerInteractionFeedback } from '../../src/features/feedback/interaction-feedback';
import { formatBytes, formatDuration } from '../../src/lib/format';
import { useAppTheme } from '../../src/lib/theme';
import {
  getQuickSessionLabel,
  selectNewSinceLastScanCount,
  selectTopUndoEntry,
  useAppStore,
} from '../../src/store/app-store';

type ThemeColors = ReturnType<typeof useAppTheme>['colors'];

function AnimatedCounter({
  value,
  label,
  delay = 0,
  colors,
  isDark,
}: {
  value: number;
  label: string;
  delay?: number;
  colors: ThemeColors;
  isDark: boolean;
}) {
  const animationsEnabled = useAppStore((state) => state.settings.animationsEnabled);
  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (animationsEnabled) {
      opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
      scale.value = withDelay(delay, withSpring(1, { damping: 12, stiffness: 200 }));
    } else {
      opacity.value = 1;
      scale.value = 1;
    }
  }, [animationsEnabled, delay, opacity, scale]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.statCard,
        { backgroundColor: colors.surface, borderColor: isDark ? colors.outline : 'transparent' },
        animStyle,
      ]}
    >
      <Text style={[styles.statLabel, { color: colors.mutedInk }]}>{label}</Text>
      <Text style={[styles.statValue, { color: colors.ink }]}>{value}</Text>
    </Animated.View>
  );
}

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
  const animationsEnabled = useAppStore((state) => state.settings.animationsEnabled);

  // Celebration orb animation
  const orbPulse = useSharedValue(1);

  useEffect(() => {
    if (!summary) {
      router.replace(ROUTES.queue);
    }
  }, [router, summary]);

  useEffect(() => {
    if (!animationsEnabled) return;
    orbPulse.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, [animationsEnabled, orbPulse]);

  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: orbPulse.value }],
  }));

  if (!summary) {
    return null;
  }

  const paceCopy =
    summary.reviewedCount >= 25
      ? 'That was a real cleanup sprint, not just a couple of taps.'
      : summary.reviewedCount >= 10
        ? 'You finished a full pass without the loop slowing down.'
        : 'You kept the session moving and stayed in control.';
  const heroLabel = summary.storageFreedBytes > 0 ? 'Storage recovered' : 'Photos organized';
  const heroValue =
    summary.storageFreedBytes > 0
      ? formatBytes(summary.storageFreedBytes)
      : `${summary.reviewedCount}`;

  const continueCleaning = () => {
    dismissSummary();

    if (currentFileId) {
      beginQuickSession(summary.targetCount, true);
    } else {
      requestRescan({ resetSession: true, source: 'settings' });
    }

    router.replace(ROUTES.queue);
  };

  const restartGame = () => {
    dismissSummary();
    requestRescan({ resetSession: true, source: 'settings' });
    router.replace(ROUTES.queue);
  };

  const handleUndo = () => {
    undoLastAction('undo');
    void triggerInteractionFeedback('undo', hapticsEnabled);
    router.replace(ROUTES.queue);
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.canvas }]}
      edges={['top', 'left', 'right']}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Background celebration orbs */}
        <Animated.View
          style={[
            styles.celebrationOrb,
            { backgroundColor: isDark ? 'rgba(243,180,63,0.08)' : 'rgba(243,180,63,0.14)' },
            orbStyle,
          ]}
        />
        <Animated.View
          style={[
            styles.celebrationOrbB,
            { backgroundColor: isDark ? 'rgba(97,168,244,0.06)' : 'rgba(60,145,230,0.1)' },
          ]}
        />

        <Animated.View
          entering={animationsEnabled ? FadeInDown.duration(600).delay(100) : undefined}
          style={styles.banner}
        >
          <View style={[styles.celebrationBadge, { backgroundColor: colors.highlight }]}>
            <Text style={styles.celebrationBadgeIcon}>✨</Text>
            <Text style={styles.celebrationBadgeLabel}>Session wrapped</Text>
          </View>
          <Text style={[styles.eyebrow, { color: colors.progress }]}>
            {getQuickSessionLabel(summary.targetCount)} complete
          </Text>
          <Text style={[styles.title, { color: colors.ink }]}>
            {summary.reviewedCount} decisions{'\n'}made
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedInk }]}>{paceCopy}</Text>
          <Text style={[styles.paceMeta, { color: colors.mutedInk }]}>
            Time: {formatDuration(summary.durationMs)}
          </Text>

          <Animated.View
            entering={animationsEnabled ? FadeInUp.duration(500).delay(400) : undefined}
            style={[styles.heroStat, { backgroundColor: isDark ? colors.stageCard : '#101418' }]}
          >
            <View style={styles.heroStatHeader}>
              <Text style={styles.heroStatLabel}>{heroLabel}</Text>
              <View
                style={[
                  styles.heroStatBadge,
                  { backgroundColor: isDark ? 'rgba(50,200,136,0.2)' : 'rgba(46,194,126,0.2)' },
                ]}
              >
                <Text style={[styles.heroStatBadgeText, { color: isDark ? '#32C888' : '#2EC27E' }]}>
                  ↑
                </Text>
              </View>
            </View>
            <Text style={[styles.heroStatValue, { color: colors.white }]}>{heroValue}</Text>
          </Animated.View>
        </Animated.View>

        <View style={styles.grid}>
          <AnimatedCounter
            value={summary.keptCount}
            label="Kept"
            delay={200}
            colors={colors}
            isDark={isDark}
          />
          <AnimatedCounter
            value={summary.deletedCount}
            label="Deleted"
            delay={300}
            colors={colors}
            isDark={isDark}
          />
          <AnimatedCounter
            value={summary.movedCount}
            label="Moved"
            delay={400}
            colors={colors}
            isDark={isDark}
          />
          <AnimatedCounter
            value={summary.skippedCount}
            label="Skipped"
            delay={500}
            colors={colors}
            isDark={isDark}
          />
        </View>

        <Animated.View
          entering={animationsEnabled ? FadeInUp.duration(500).delay(600) : undefined}
          style={styles.actions}
        >
          <Button label="Continue cleaning" onPress={continueCleaning} />
          <Button
            label={
              scanState === 'scanning' && scanMode === 'rescan'
                ? 'Re-scanning photos...'
                : 'Check for new photos'
            }
            onPress={restartGame}
            variant="secondary"
            disabled={scanState === 'scanning' && scanMode === 'rescan'}
          />
          <Button
            label="Back to welcome"
            onPress={() => router.replace(ROUTES.welcome)}
            variant="ghost"
          />
        </Animated.View>

        <Animated.View
          entering={animationsEnabled ? FadeInUp.duration(500).delay(700) : undefined}
          style={[
            styles.rescanCard,
            {
              backgroundColor: isDark ? colors.surfaceMuted : '#EEF4FB',
              borderColor: isDark ? colors.outline : 'transparent',
            },
          ]}
        >
          <View style={styles.rescanHeader}>
            <View style={[styles.rescanDot, { backgroundColor: colors.progress }]} />
            <Text style={[styles.rescanTitle, { color: colors.ink }]}>Re-scan lane</Text>
          </View>
          <Text style={[styles.rescanBody, { color: colors.ink }]}>
            {newSinceLastScanCount > 0
              ? `${newSinceLastScanCount} photo${newSinceLastScanCount === 1 ? '' : 's'} are still marked new since the last scan.`
              : 'Check the library again after you add new photos outside the app.'}
          </Text>
          {lastRescanSummary ? (
            <Text style={[styles.rescanHint, { color: colors.mutedInk }]}>
              Last re-scan added {lastRescanSummary.newFileCount} new and kept{' '}
              {lastRescanSummary.protectedReviewedCount} reviewed item
              {lastRescanSummary.protectedReviewedCount === 1 ? '' : 's'} out of the queue.
            </Text>
          ) : null}
        </Animated.View>

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
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    justifyContent: 'space-between',
    gap: spacing.xl,
  },
  celebrationOrb: {
    position: 'absolute',
    top: 60,
    right: -20,
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  celebrationOrbB: {
    position: 'absolute',
    top: 180,
    left: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  banner: {
    paddingTop: spacing.xxl,
    gap: spacing.md,
  },
  celebrationBadge: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  celebrationBadgeIcon: {
    fontSize: 14,
  },
  celebrationBadgeLabel: {
    color: '#08111D',
    fontFamily: typography.bold,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  eyebrow: {
    fontFamily: typography.medium,
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    fontFamily: typography.display,
    fontSize: 40,
    lineHeight: 46,
  },
  subtitle: {
    fontFamily: typography.body,
    fontSize: 17,
    lineHeight: 26,
  },
  paceMeta: {
    fontFamily: typography.medium,
    fontSize: 14,
  },
  heroStat: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: 8,
    ...(shadows.premium as object),
  },
  heroStatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroStatLabel: {
    color: 'rgba(249,250,251,0.72)',
    fontFamily: typography.medium,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroStatBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroStatBadgeText: {
    fontFamily: typography.bold,
    fontSize: 14,
  },
  heroStatValue: {
    fontFamily: typography.display,
    fontSize: 36,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statCard: {
    flexBasis: '48%',
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    gap: 6,
  },
  statLabel: {
    fontFamily: typography.medium,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
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
    borderWidth: 1,
    padding: spacing.lg,
    gap: 8,
  },
  rescanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  rescanDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  rescanTitle: {
    fontFamily: typography.bold,
    fontSize: 15,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
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

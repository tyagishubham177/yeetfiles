import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppLogo } from '../src/components/branding/app-logo';
import { StatusBanner } from '../src/components/feedback/status-banner';
import { Button } from '../src/components/ui/button';
import { ROUTES } from '../src/constants/routes';
import { radius, shadows, spacing, typography } from '../src/constants/ui-tokens';
import {
  requestMediaPermissionState,
  MEDIA_PERMISSION_BLOCKED_HELP,
} from '../src/features/permissions/permission-service';
import { formatBytes, formatDuration } from '../src/lib/format';
import { useAppTheme } from '../src/lib/theme';
import { getQuickSessionLabel, useAppStore } from '../src/store/app-store';
import type { QuickSessionTarget } from '../src/types/file-item';

type SessionOption = {
  target: QuickSessionTarget | null;
  display: string;
  label: string;
  hint: string;
};

const SESSION_OPTIONS: SessionOption[] = [
  { target: 10, display: '10', label: 'photos', hint: '~2 min' },
  { target: 20, display: '20', label: 'photos', hint: '~4 min' },
  { target: 50, display: '50', label: 'photos', hint: '~10 min' },
  { target: null, display: 'Infinite', label: 'open run', hint: 'terminate anytime' },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function WelcomeScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const currentFileId = useAppStore((state) => state.currentFileId);
  const lowStorageWarning = useAppStore((state) => state.lowStorageWarning);
  const beginQuickSession = useAppStore((state) => state.beginQuickSession);
  const requestRescan = useAppStore((state) => state.requestRescan);
  const setPermissionState = useAppStore((state) => state.setPermissionState);
  const sessionSummary = useAppStore((state) => state.sessionSummary);
  const targetCount = useAppStore((state) => state.targetCount);
  const lastCompletedScanAt = useAppStore((state) => state.lastCompletedScanAt);
  const hasCompletedOnboarding = useAppStore((state) => state.settings.hasCompletedOnboarding);
  const animationsEnabled = useAppStore((state) => state.settings.animationsEnabled);
  const initialSelectedTarget =
    targetCount === null || targetCount === 10 || targetCount === 20 || targetCount === 50
      ? targetCount
      : 10;
  const [busy, setBusy] = useState(false);
  const [launchMessage, setLaunchMessage] = useState<string | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<QuickSessionTarget | null>(
    initialSelectedTarget,
  );

  // Ambient orb animations
  const orbAFloatY = useSharedValue(0);
  const orbBFloatY = useSharedValue(0);

  useEffect(() => {
    if (!animationsEnabled) return;
    orbAFloatY.value = withRepeat(
      withSequence(
        withTiming(8, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
        withTiming(-8, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    orbBFloatY.value = withDelay(
      1200,
      withRepeat(
        withSequence(
          withTiming(-6, { duration: 2800, easing: Easing.inOut(Easing.sin) }),
          withTiming(6, { duration: 2800, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      ),
    );
  }, [animationsEnabled, orbAFloatY, orbBFloatY]);

  const orbAStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: orbAFloatY.value }],
  }));

  const orbBStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: orbBFloatY.value }],
  }));

  const dashboardLabel = useMemo(() => getQuickSessionLabel(selectedTarget), [selectedTarget]);

  const goToQueue = async (nextTarget: QuickSessionTarget | null) => {
    setBusy(true);
    setLaunchMessage('Checking photo access and warming up a fresh session...');

    try {
      if (!currentFileId) {
        requestRescan({ resetSession: true });
      }

      beginQuickSession(nextTarget, true);

      const permissionState = await requestMediaPermissionState();
      setPermissionState(permissionState);

      if (permissionState === 'blocked') {
        setLaunchMessage('Photo access is blocked, so YeetFiles will guide you to settings next.');
        Alert.alert('Media permission blocked', MEDIA_PERMISSION_BLOCKED_HELP);
      } else {
        setLaunchMessage('Fresh session ready. Taking you into the queue...');
      }

      router.replace(ROUTES.queue);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.canvas }]}
      edges={['top', 'left', 'right']}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroWrap}>
          {/* Floating ambient orbs */}
          <Animated.View
            style={[
              styles.heroOrbA,
              { backgroundColor: isDark ? 'rgba(97,168,244,0.14)' : 'rgba(60,145,230,0.16)' },
              orbAStyle,
            ]}
          />
          <Animated.View
            style={[
              styles.heroOrbB,
              { backgroundColor: isDark ? 'rgba(243,180,63,0.12)' : 'rgba(243,180,63,0.22)' },
              orbBStyle,
            ]}
          />
          {/* Third subtle orb */}
          <Animated.View
            style={[
              styles.heroOrbC,
              { backgroundColor: isDark ? 'rgba(50,200,136,0.08)' : 'rgba(46,194,126,0.12)' },
              orbAStyle,
            ]}
          />

          <Animated.View
            entering={animationsEnabled ? FadeInDown.duration(500).delay(100) : undefined}
            style={styles.logoWrap}
          >
            <AppLogo size={76} />
          </Animated.View>
          <Animated.Text
            entering={animationsEnabled ? FadeInDown.duration(500).delay(200) : undefined}
            style={[styles.brand, { color: colors.mutedInk }]}
          >
            YeetFiles
          </Animated.Text>
          <Animated.Text
            entering={animationsEnabled ? FadeInDown.duration(600).delay(300) : undefined}
            style={[styles.title, { color: colors.ink }]}
          >
            Short cleanup sessions{'\n'}should feel like{'\n'}
            <Text style={[styles.titleHighlight, { color: colors.progress }]}>momentum</Text>, not
            admin.
          </Animated.Text>
          <Animated.Text
            entering={animationsEnabled ? FadeInDown.duration(500).delay(450) : undefined}
            style={[styles.subtitle, { color: colors.mutedInk }]}
          >
            Pick a short burst or go infinite, then keep every delete honest.
          </Animated.Text>
        </View>

        <Animated.View
          entering={animationsEnabled ? FadeInUp.duration(600).delay(550) : undefined}
          style={[
            styles.panel,
            {
              backgroundColor: isDark ? colors.surface : colors.surface,
              borderColor: isDark ? colors.outline : colors.glassBorder,
            },
          ]}
        >
          <Text style={[styles.panelTitle, { color: colors.ink }]}>
            {hasCompletedOnboarding ? 'Return for another pass' : 'Choose your cleanup lane'}
          </Text>
          <Text style={[styles.panelBody, { color: colors.mutedInk }]}>
            Photos only. Local only. Short bursts stay fast, and infinite runs stay open until you
            terminate them for stats.
          </Text>

          {lowStorageWarning ? (
            <View
              style={[
                styles.warningCard,
                {
                  backgroundColor: isDark ? 'rgba(240,130,105,0.1)' : '#FFF0EA',
                  borderColor: isDark ? 'rgba(240,130,105,0.16)' : '#F4C7B9',
                },
              ]}
            >
              <View style={styles.warningIcon}>
                <Text style={styles.warningIconText}>⚠</Text>
              </View>
              <View style={styles.warningContent}>
                <Text style={[styles.warningTitle, { color: colors.ink }]}>
                  Storage is getting tight
                </Text>
                <Text style={[styles.warningBody, { color: colors.mutedInk }]}>
                  Only about {formatBytes(lowStorageWarning.freeBytes)} free right now. YeetFiles
                  can help you clear space before Android starts feeling cramped.
                </Text>
              </View>
            </View>
          ) : null}

          <View style={styles.sessionChoiceGrid}>
            {SESSION_OPTIONS.map((option) => {
              const selected = option.target === selectedTarget;
              const isInfinite = option.target === null;

              return (
                <AnimatedPressable
                  key={option.target ?? 'infinite'}
                  accessibilityRole="button"
                  onPress={() => setSelectedTarget(option.target)}
                  style={[
                    styles.sessionChip,
                    {
                      backgroundColor: selected
                        ? isDark
                          ? 'rgba(97,168,244,0.12)'
                          : 'rgba(60,145,230,0.08)'
                        : colors.surfaceMuted,
                      borderColor: selected
                        ? isDark
                          ? colors.progress
                          : colors.accentGradientStart
                        : isDark
                          ? colors.outline
                          : 'transparent',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.sessionChipCount,
                      isInfinite ? styles.sessionChipCountLong : null,
                      { color: selected ? colors.progress : colors.ink },
                    ]}
                  >
                    {option.display}
                  </Text>
                  <Text
                    style={[
                      styles.sessionChipLabel,
                      { color: selected ? colors.progress : colors.ink },
                    ]}
                  >
                    {option.label}
                  </Text>
                  <Text
                    style={[
                      styles.sessionChipSubtle,
                      { color: selected ? colors.progress : colors.mutedInk },
                    ]}
                  >
                    {option.hint}
                  </Text>
                </AnimatedPressable>
              );
            })}
          </View>

          {sessionSummary ? (
            <View
              style={[
                styles.lastSession,
                {
                  backgroundColor: isDark ? colors.surfaceMuted : '#F0F4FA',
                  borderColor: isDark ? colors.outline : 'transparent',
                },
              ]}
            >
              <View style={styles.lastSessionHeader}>
                <View style={[styles.lastSessionDot, { backgroundColor: colors.keep }]} />
                <Text style={[styles.lastSessionTitle, { color: colors.ink }]}>Last pass</Text>
              </View>
              <Text style={[styles.lastSessionBody, { color: colors.mutedInk }]}>
                {sessionSummary.reviewedCount} reviewed /{' '}
                {formatBytes(sessionSummary.storageFreedBytes)} freed /{' '}
                {formatDuration(sessionSummary.durationMs)}
              </Text>
              {lastCompletedScanAt ? (
                <Text style={[styles.lastSessionHint, { color: colors.mutedInk }]}>
                  Queue refreshed recently, so you can jump back in fast.
                </Text>
              ) : null}
            </View>
          ) : null}

          <View style={styles.actionStack}>
            <Button
              label={`Start ${dashboardLabel}`}
              loading={busy}
              loadingLabel="Checking permissions..."
              onPress={() => void goToQueue(selectedTarget)}
            />
          </View>

          {launchMessage ? <StatusBanner message={launchMessage} /> : null}

          <View
            style={[
              styles.trustNote,
              { borderTopColor: isDark ? colors.outline : colors.glassBorder },
            ]}
          >
            <View style={styles.trustHeader}>
              <View
                style={[
                  styles.trustShield,
                  { backgroundColor: isDark ? 'rgba(97,168,244,0.12)' : 'rgba(60,145,230,0.08)' },
                ]}
              >
                <Text style={[styles.trustShieldIcon, { color: colors.progress }]}>✦</Text>
              </View>
              <Text style={[styles.trustTitle, { color: colors.ink }]}>Trust note</Text>
            </View>
            <Text style={[styles.trustBody, { color: colors.mutedInk }]}>
              No cloud upload. No hidden deletes. Your earlier keep, skip, and delete decisions now
              stay durable across app restarts unless you explicitly run a clean rebuild.
            </Text>
          </View>
        </Animated.View>
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
  heroWrap: {
    paddingTop: spacing.xxl,
    gap: spacing.md,
  },
  heroOrbA: {
    position: 'absolute',
    top: 16,
    right: -20,
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  heroOrbB: {
    position: 'absolute',
    top: 100,
    left: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  heroOrbC: {
    position: 'absolute',
    top: 200,
    right: 40,
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  brand: {
    fontFamily: typography.medium,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  logoWrap: {
    marginBottom: spacing.xs,
  },
  title: {
    fontFamily: typography.display,
    fontSize: 40,
    lineHeight: 48,
    maxWidth: '95%',
  },
  titleHighlight: {
    fontFamily: typography.display,
    fontSize: 40,
    lineHeight: 48,
  },
  subtitle: {
    fontFamily: typography.body,
    fontSize: 17,
    lineHeight: 26,
    maxWidth: '92%',
  },
  panel: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.xl,
    gap: spacing.md,
    ...(shadows.premium as object),
  },
  panelTitle: {
    fontFamily: typography.display,
    fontSize: 26,
    lineHeight: 34,
  },
  panelBody: {
    fontFamily: typography.body,
    fontSize: 15,
    lineHeight: 24,
  },
  warningCard: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.sm,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  warningIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningIconText: {
    fontSize: 16,
  },
  warningContent: {
    flex: 1,
    gap: 4,
  },
  warningTitle: {
    fontFamily: typography.bold,
    fontSize: 15,
  },
  warningBody: {
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 22,
  },
  sessionChoiceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  sessionChip: {
    flexBasis: '48%',
    borderRadius: radius.md,
    borderWidth: 1.5,
    padding: spacing.md,
    gap: 2,
    alignItems: 'center',
  },
  sessionChipCount: {
    fontFamily: typography.display,
    fontSize: 28,
    lineHeight: 34,
  },
  sessionChipCountLong: {
    fontSize: 22,
    lineHeight: 28,
  },
  sessionChipLabel: {
    fontFamily: typography.medium,
    fontSize: 13,
  },
  sessionChipSubtle: {
    fontFamily: typography.medium,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 2,
  },
  lastSession: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
    gap: 6,
  },
  lastSessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  lastSessionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  lastSessionTitle: {
    fontFamily: typography.bold,
    fontSize: 14,
  },
  lastSessionBody: {
    fontFamily: typography.body,
    fontSize: 14,
  },
  lastSessionHint: {
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 20,
  },
  actionStack: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  trustNote: {
    borderTopWidth: 1,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  trustHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  trustShield: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trustShieldIcon: {
    fontSize: 12,
  },
  trustTitle: {
    fontFamily: typography.bold,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  trustBody: {
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 22,
  },
});

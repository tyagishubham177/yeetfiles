import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppLogo } from '../src/components/branding/app-logo';
import { StatusBanner } from '../src/components/feedback/status-banner';
import { Button } from '../src/components/ui/button';
import { ROUTES } from '../src/constants/routes';
import { radius, spacing, typography } from '../src/constants/ui-tokens';
import { requestMediaPermissionState, MEDIA_PERMISSION_BLOCKED_HELP } from '../src/features/permissions/permission-service';
import { formatBytes, formatDuration } from '../src/lib/format';
import { useAppTheme } from '../src/lib/theme';
import { getQuickSessionLabel, useAppStore } from '../src/store/app-store';
import type { QuickSessionTarget } from '../src/types/file-item';

const SESSION_OPTIONS: QuickSessionTarget[] = [10, 25, 50];

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
  const [busy, setBusy] = useState(false);
  const [launchMessage, setLaunchMessage] = useState<string | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<QuickSessionTarget>((targetCount as QuickSessionTarget | null) ?? 10);

  const dashboardLabel = useMemo(() => getQuickSessionLabel(selectedTarget), [selectedTarget]);

  const goToQueue = async (nextTarget: QuickSessionTarget) => {
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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.canvas }]} edges={['top', 'left', 'right']}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroWrap}>
          <View style={[styles.heroOrbA, { backgroundColor: isDark ? 'rgba(217,162,59,0.16)' : 'rgba(243,180,63,0.28)' }]} />
          <View style={[styles.heroOrbB, { backgroundColor: isDark ? 'rgba(97,168,244,0.14)' : 'rgba(60,145,230,0.18)' }]} />
          <View style={styles.logoWrap}>
            <AppLogo size={76} />
          </View>
          <Text style={[styles.brand, { color: colors.ink }]}>YeetFiles</Text>
          <Text style={[styles.title, { color: colors.ink }]}>Short cleanup sessions should feel like momentum, not admin.</Text>
          <Text style={[styles.subtitle, { color: colors.mutedInk }]}>
            Pick a session length, start with one card, and keep every delete honest.
          </Text>
        </View>

        <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: isDark ? colors.outline : 'transparent' }]}>
          <Text style={[styles.panelTitle, { color: colors.ink }]}>{hasCompletedOnboarding ? 'Return for another pass' : 'Choose your quick session'}</Text>
          <Text style={[styles.panelBody, { color: colors.mutedInk }]}>Photos only. Local only. Undo stays honest by covering safe review actions only.</Text>
          {lowStorageWarning ? (
            <View style={[styles.warningCard, { backgroundColor: isDark ? 'rgba(240,130,105,0.1)' : '#FFF0EA', borderColor: isDark ? 'rgba(240,130,105,0.16)' : '#F4C7B9' }]}>
              <Text style={[styles.warningTitle, { color: colors.ink }]}>Storage is getting tight</Text>
              <Text style={[styles.warningBody, { color: colors.mutedInk }]}>Only about {formatBytes(lowStorageWarning.freeBytes)} free right now. YeetFiles can help you clear space before Android starts feeling cramped.</Text>
            </View>
          ) : null}
          <View style={styles.sessionChoiceRow}>
            {SESSION_OPTIONS.map((option) => {
              const selected = option === selectedTarget;

              return (
                <Pressable
                  key={option}
                  accessibilityRole="button"
                  onPress={() => setSelectedTarget(option)}
                  style={({ pressed }) => [
                    styles.sessionChip,
                    {
                      backgroundColor: colors.surfaceMuted,
                      borderColor: selected ? colors.highlight : isDark ? colors.outline : 'transparent',
                    },
                    pressed && styles.pressedCard,
                  ]}
                >
                  <Text style={[styles.sessionChipLabel, { color: colors.ink }]}>{getQuickSessionLabel(option)}</Text>
                  <Text style={[styles.sessionChipSubtle, { color: colors.mutedInk }]}>
                    {option === 10 ? '2 min' : option === 25 ? '5 min' : '10 min'}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {sessionSummary ? (
            <View style={[styles.lastSession, { backgroundColor: colors.surfaceMuted }]}>
              <Text style={[styles.lastSessionTitle, { color: colors.ink }]}>Last pass</Text>
              <Text style={[styles.lastSessionBody, { color: colors.mutedInk }]}>
                {sessionSummary.reviewedCount} reviewed / {formatBytes(sessionSummary.storageFreedBytes)} freed / {formatDuration(sessionSummary.durationMs)}
              </Text>
              {lastCompletedScanAt ? <Text style={[styles.lastSessionHint, { color: colors.mutedInk }]}>Queue refreshed recently, so you can jump back in fast.</Text> : null}
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
          <View style={[styles.trustNote, { borderTopColor: colors.outline }]}>
            <Text style={[styles.trustTitle, { color: colors.ink }]}>Trust note</Text>
            <Text style={[styles.trustBody, { color: colors.mutedInk }]}>
              No cloud upload. No hidden deletes. Your earlier keep, skip, and delete decisions now stay durable across app restarts unless you explicitly run a clean rebuild.
            </Text>
          </View>
        </View>
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
    top: 24,
    right: 18,
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  heroOrbB: {
    position: 'absolute',
    top: 78,
    left: 12,
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  brand: {
    fontFamily: typography.medium,
    fontSize: 15,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  logoWrap: {
    marginBottom: spacing.xs,
  },
  title: {
    fontFamily: typography.display,
    fontSize: 44,
    lineHeight: 50,
    maxWidth: '92%',
  },
  subtitle: {
    fontFamily: typography.body,
    fontSize: 18,
    lineHeight: 28,
    maxWidth: '92%',
  },
  panel: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.xl,
    gap: spacing.md,
    shadowColor: '#08111D',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 14 },
    elevation: 8,
  },
  panelTitle: {
    fontFamily: typography.display,
    fontSize: 28,
  },
  panelBody: {
    fontFamily: typography.body,
    fontSize: 16,
    lineHeight: 24,
  },
  warningCard: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
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
  sessionChoiceRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  sessionChip: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
    gap: 4,
  },
  pressedCard: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  sessionChipLabel: {
    fontFamily: typography.bold,
    fontSize: 16,
  },
  sessionChipSubtle: {
    fontFamily: typography.medium,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  lastSession: {
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 4,
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
    gap: 4,
  },
  trustTitle: {
    fontFamily: typography.bold,
    fontSize: 13,
    textTransform: 'uppercase',
  },
  trustBody: {
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 22,
  },
});

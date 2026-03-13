import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../src/components/ui/button';
import { ROUTES } from '../src/constants/routes';
import { colors, radius, spacing, typography } from '../src/constants/ui-tokens';
import { requestMediaPermissionState, MEDIA_PERMISSION_BLOCKED_HELP } from '../src/features/permissions/permission-service';
import { formatBytes, formatDuration } from '../src/lib/format';
import { getQuickSessionLabel, selectResumeAvailable, useAppStore } from '../src/store/app-store';
import type { QuickSessionTarget } from '../src/types/file-item';

const SESSION_OPTIONS: QuickSessionTarget[] = [10, 25, 50];

export default function WelcomeScreen() {
  const router = useRouter();
  const resumeAvailable = useAppStore(selectResumeAvailable);
  const currentFileId = useAppStore((state) => state.currentFileId);
  const beginQuickSession = useAppStore((state) => state.beginQuickSession);
  const requestRescan = useAppStore((state) => state.requestRescan);
  const setPermissionState = useAppStore((state) => state.setPermissionState);
  const sessionSummary = useAppStore((state) => state.sessionSummary);
  const targetCount = useAppStore((state) => state.targetCount);
  const lastCompletedScanAt = useAppStore((state) => state.lastCompletedScanAt);
  const hasCompletedOnboarding = useAppStore((state) => state.settings.hasCompletedOnboarding);
  const [busy, setBusy] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<QuickSessionTarget>((targetCount as QuickSessionTarget | null) ?? 10);

  const dashboardLabel = useMemo(() => getQuickSessionLabel(selectedTarget), [selectedTarget]);

  const goToQueue = async (resetProgress: boolean, nextTarget: QuickSessionTarget) => {
    setBusy(true);

    try {
      if (resetProgress && !currentFileId) {
        requestRescan();
      }

      beginQuickSession(nextTarget, resetProgress);

      const permissionState = await requestMediaPermissionState();
      setPermissionState(permissionState);

      if (permissionState === 'blocked') {
        Alert.alert('Media permission blocked', MEDIA_PERMISSION_BLOCKED_HELP);
      }

      router.replace(ROUTES.queue);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroWrap}>
          <View style={styles.heroOrbA} />
          <View style={styles.heroOrbB} />
          <Text style={styles.brand}>FileSwipe</Text>
          <Text style={styles.title}>Short cleanup sessions should feel like momentum, not admin.</Text>
          <Text style={styles.subtitle}>
            Pick a session length, start with one card, and keep every delete honest.
          </Text>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>{hasCompletedOnboarding ? 'Return for another pass' : 'Choose your quick session'}</Text>
          <Text style={styles.panelBody}>Photos only. Local only. Undo stays honest by covering safe review actions only.</Text>
          <View style={styles.sessionChoiceRow}>
            {SESSION_OPTIONS.map((option) => {
              const selected = option === selectedTarget;

              return (
                <Pressable
                  key={option}
                  accessibilityRole="button"
                  onPress={() => setSelectedTarget(option)}
                  style={[styles.sessionChip, selected && styles.sessionChipSelected]}
                >
                  <Text style={[styles.sessionChipLabel, selected && styles.sessionChipLabelSelected]}>{getQuickSessionLabel(option)}</Text>
                  <Text style={[styles.sessionChipSubtle, selected && styles.sessionChipSubtleSelected]}>
                    {option === 10 ? '2 min' : option === 25 ? '5 min' : '10 min'}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {sessionSummary ? (
            <View style={styles.lastSession}>
              <Text style={styles.lastSessionTitle}>Last pass</Text>
              <Text style={styles.lastSessionBody}>
                {sessionSummary.reviewedCount} reviewed / {formatBytes(sessionSummary.storageFreedBytes)} freed / {formatDuration(sessionSummary.durationMs)}
              </Text>
              {lastCompletedScanAt ? <Text style={styles.lastSessionHint}>Queue refreshed recently, so you can jump back in fast.</Text> : null}
            </View>
          ) : null}
          <View style={styles.actionStack}>
            <Button label={busy ? 'Starting...' : `Start ${dashboardLabel}`} onPress={() => void goToQueue(true, selectedTarget)} disabled={busy} />
            {resumeAvailable ? (
              <Button label={`Resume ${getQuickSessionLabel((targetCount as QuickSessionTarget | null) ?? selectedTarget)}`} onPress={() => void goToQueue(false, selectedTarget)} variant="secondary" disabled={busy} />
            ) : null}
          </View>
          <View style={styles.trustNote}>
            <Text style={styles.trustTitle}>Trust note</Text>
            <Text style={styles.trustBody}>No cloud upload. No silent deletes. Queue, filters, and your quick-session target come back after restart.</Text>
          </View>
        </View>
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
    backgroundColor: 'rgba(243,180,63,0.28)',
  },
  heroOrbB: {
    position: 'absolute',
    top: 78,
    left: 12,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(60,145,230,0.18)',
  },
  brand: {
    color: colors.ink,
    fontFamily: typography.medium,
    fontSize: 15,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  title: {
    color: colors.ink,
    fontFamily: typography.display,
    fontSize: 44,
    lineHeight: 50,
    maxWidth: '92%',
  },
  subtitle: {
    color: colors.mutedInk,
    fontFamily: typography.body,
    fontSize: 18,
    lineHeight: 28,
    maxWidth: '92%',
  },
  panel: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.md,
    shadowColor: '#08111D',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 14 },
    elevation: 8,
  },
  panelTitle: {
    color: colors.ink,
    fontFamily: typography.display,
    fontSize: 28,
  },
  panelBody: {
    color: colors.mutedInk,
    fontFamily: typography.body,
    fontSize: 16,
    lineHeight: 24,
  },
  sessionChoiceRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  sessionChip: {
    flex: 1,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.md,
    gap: 4,
  },
  sessionChipSelected: {
    backgroundColor: '#101418',
  },
  sessionChipLabel: {
    color: colors.ink,
    fontFamily: typography.bold,
    fontSize: 16,
  },
  sessionChipLabelSelected: {
    color: colors.white,
  },
  sessionChipSubtle: {
    color: colors.mutedInk,
    fontFamily: typography.medium,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  sessionChipSubtleSelected: {
    color: 'rgba(249,250,251,0.72)',
  },
  lastSession: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 4,
  },
  lastSessionTitle: {
    color: colors.ink,
    fontFamily: typography.bold,
    fontSize: 14,
  },
  lastSessionBody: {
    color: colors.mutedInk,
    fontFamily: typography.body,
    fontSize: 14,
  },
  lastSessionHint: {
    color: colors.mutedInk,
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
    borderTopColor: colors.outline,
    paddingTop: spacing.md,
    gap: 4,
  },
  trustTitle: {
    color: colors.ink,
    fontFamily: typography.bold,
    fontSize: 13,
    textTransform: 'uppercase',
  },
  trustBody: {
    color: colors.mutedInk,
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 22,
  },
});

import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../src/components/ui/button';
import { ROUTES } from '../src/constants/routes';
import { colors, radius, spacing, typography } from '../src/constants/ui-tokens';
import { requestMediaPermissionState, MEDIA_PERMISSION_BLOCKED_HELP } from '../src/features/permissions/permission-service';
import { formatBytes, formatDuration } from '../src/lib/format';
import { selectResumeAvailable, useAppStore } from '../src/store/app-store';

export default function WelcomeScreen() {
  const router = useRouter();
  const resumeAvailable = useAppStore(selectResumeAvailable);
  const beginQuickSession = useAppStore((state) => state.beginQuickSession);
  const setPermissionState = useAppStore((state) => state.setPermissionState);
  const sessionSummary = useAppStore((state) => state.sessionSummary);
  const [busy, setBusy] = useState(false);

  const goToQueue = async (resetProgress: boolean) => {
    setBusy(true);

    try {
      beginQuickSession(resetProgress);
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
      <View style={styles.heroWrap}>
        <View style={styles.heroOrbA} />
        <View style={styles.heroOrbB} />
        <Text style={styles.brand}>FileSwipe</Text>
        <Text style={styles.title}>Your photo cleanup should feel like momentum, not admin.</Text>
        <Text style={styles.subtitle}>
          Start with one card, make one decision, and keep every delete honest.
        </Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Phase 0 quick pass</Text>
        <Text style={styles.panelBody}>Photos only. Local only. Every delete asks first.</Text>
        {sessionSummary ? (
          <View style={styles.lastSession}>
            <Text style={styles.lastSessionTitle}>Last pass</Text>
            <Text style={styles.lastSessionBody}>
              {sessionSummary.reviewedCount} reviewed · {formatBytes(sessionSummary.storageFreedBytes)} freed · {formatDuration(sessionSummary.durationMs)}
            </Text>
          </View>
        ) : null}
        <View style={styles.actionStack}>
          <Button label={busy ? 'Starting...' : 'Start cleaning'} onPress={() => void goToQueue(true)} disabled={busy} />
          {resumeAvailable ? (
            <Button label="Resume session" onPress={() => void goToQueue(false)} variant="secondary" disabled={busy} />
          ) : null}
        </View>
        <View style={styles.trustNote}>
          <Text style={styles.trustTitle}>Trust note</Text>
          <Text style={styles.trustBody}>No cloud upload. No silent deletes. Queue state comes back after restart.</Text>
        </View>
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

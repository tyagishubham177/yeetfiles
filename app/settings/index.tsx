import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Share, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../src/components/ui/button';
import { ROUTES } from '../../src/constants/routes';
import { colors, radius, spacing, typography } from '../../src/constants/ui-tokens';
import { exportDebugSnapshot } from '../../src/features/diagnostics/export-service';
import { useAppStore } from '../../src/store/app-store';
import type { PersistedAppState } from '../../src/types/app-state';

function SettingRow({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: () => void;
}) {
  return (
    <View style={styles.settingRow}>
      <Text style={styles.settingLabel}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} trackColor={{ true: colors.progress }} />
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const settings = useAppStore((state) => state.settings);
  const filesById = useAppStore((state) => state.filesById);
  const queueOrder = useAppStore((state) => state.queueOrder);
  const actionLogs = useAppStore((state) => state.actionLogs);
  const analyticsEvents = useAppStore((state) => state.analyticsEvents);
  const toggleSetting = useAppStore((state) => state.toggleSetting);
  const requestRescan = useAppStore((state) => state.requestRescan);
  const resetApp = useAppStore((state) => state.resetApp);
  const [isExporting, setIsExporting] = useState(false);

  const exportLocalData = async () => {
    setIsExporting(true);

    try {
      const {
        hasHydrated: _hasHydrated,
        scanNonce: _scanNonce,
        setHasHydrated: _setHasHydrated,
        setPermissionState: _setPermissionState,
        beginQuickSession: _beginQuickSession,
        setActiveFilter: _setActiveFilter,
        setSortMode: _setSortMode,
        beginScan: _beginScan,
        receiveScanChunk: _receiveScanChunk,
        completeScan: _completeScan,
        failScan: _failScan,
        keepCurrentFile: _keepCurrentFile,
        skipCurrentFile: _skipCurrentFile,
        undoLastAction: _undoLastAction,
        pruneExpiredUndoEntries: _pruneExpiredUndoEntries,
        dismissMilestone: _dismissMilestone,
        commitDeleteSuccess: _commitDeleteSuccess,
        recordDeleteFailure: _recordDeleteFailure,
        recordPreviewOpen: _recordPreviewOpen,
        requestRescan: _requestRescan,
        toggleSetting: _toggleSetting,
        resetApp: _resetApp,
        dismissSummary: _dismissSummary,
        ...persistedState
      } = useAppStore.getState();

      const exportFile = exportDebugSnapshot(persistedState as PersistedAppState);

      await Share.share({
        title: 'FileSwipe debug export',
        message: 'FileSwipe local debug export',
        url: exportFile.uri,
      });
    } catch {
      Alert.alert('Export failed', 'We could not create or share the local debug export.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Settings</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backLink}>Back</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <SettingRow label="Haptics" value={settings.hapticsEnabled} onValueChange={() => toggleSetting('hapticsEnabled')} />
          <SettingRow label="Animations" value={settings.animationsEnabled} onValueChange={() => toggleSetting('animationsEnabled')} />
          <SettingRow label="Follow system theme" value={settings.followSystemTheme} onValueChange={() => toggleSetting('followSystemTheme')} />
          <SettingRow label="Gesture hints" value={settings.showGestureHints} onValueChange={() => toggleSetting('showGestureHints')} />
          <SettingRow label="Debug logging" value={settings.debugLoggingEnabled} onValueChange={() => toggleSetting('debugLoggingEnabled')} />
          <Text style={styles.sectionHint}>
            When this is off, detailed local debug logs are cleared and new reproduction logs stop accumulating.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Session and data</Text>
          <Button label="Re-scan photos" onPress={() => { requestRescan(); router.replace(ROUTES.queue); }} />
          <Button
            label="Clear local session data"
            variant="danger"
            onPress={() => {
              Alert.alert('Clear local state?', 'This removes your saved queue, history, and current session from this device.', [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Clear',
                  style: 'destructive',
                  onPress: () => {
                    void resetApp().then(() => {
                      router.replace(ROUTES.welcome);
                    });
                  },
                },
              ]);
            }}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Diagnostics</Text>
          <Text style={styles.diagnosticLine}>{Object.keys(filesById).length} files cached in the current local snapshot</Text>
          <Text style={styles.diagnosticLine}>{queueOrder.length} queue positions tracked locally</Text>
          <Text style={styles.diagnosticLine}>{analyticsEvents.length} analytics events stored locally</Text>
          <Text style={styles.diagnosticLine}>{actionLogs.length} action log entries stored locally</Text>
          <Button
            label={isExporting ? 'Preparing export...' : 'Export local debug data'}
            onPress={() => void exportLocalData()}
            variant="secondary"
            disabled={isExporting}
          />
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
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: colors.ink,
    fontFamily: typography.display,
    fontSize: 34,
  },
  backLink: {
    color: colors.progress,
    fontFamily: typography.medium,
    fontSize: 15,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  sectionTitle: {
    color: colors.ink,
    fontFamily: typography.display,
    fontSize: 24,
  },
  sectionHint: {
    color: colors.mutedInk,
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 22,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    color: colors.ink,
    fontFamily: typography.body,
    fontSize: 16,
  },
  diagnosticLine: {
    color: colors.mutedInk,
    fontFamily: typography.body,
    fontSize: 15,
  },
});

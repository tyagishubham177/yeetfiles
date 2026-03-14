import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Share, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../src/components/ui/button';
import { ROUTES } from '../../src/constants/routes';
import { radius, spacing, typography } from '../../src/constants/ui-tokens';
import { exportDebugSnapshot } from '../../src/features/diagnostics/export-service';
import { requestNotificationPermissionStateAsync } from '../../src/features/notifications/notification-service';
import { formatBytes, formatDateTime } from '../../src/lib/format';
import { useAppTheme } from '../../src/lib/theme';
import { selectNewSinceLastScanCount, useAppStore } from '../../src/store/app-store';
import type { NightModePreference, PersistedAppState } from '../../src/types/app-state';

function SettingRow({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: () => void;
}) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.settingRow}>
      <Text style={[styles.settingLabel, { color: colors.ink }]}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} trackColor={{ true: colors.progress }} />
    </View>
  );
}

function NightModePicker({
  value,
  onChange,
}: {
  value: NightModePreference;
  onChange: (value: NightModePreference) => void;
}) {
  const { colors, isDark } = useAppTheme();

  return (
    <View style={styles.modeRow}>
      {(['off', 'auto', 'on'] as NightModePreference[]).map((option) => {
        const selected = option === value;

        return (
          <Pressable
            key={option}
            accessibilityRole="button"
            onPress={() => onChange(option)}
            style={[
              styles.modeChip,
              {
                backgroundColor: selected ? colors.ink : colors.surfaceMuted,
                borderColor: selected ? colors.ink : isDark ? colors.outline : 'transparent',
              },
            ]}
          >
            <Text style={[styles.modeChipLabel, { color: selected ? colors.white : colors.ink }]}>{option === 'off' ? 'Off' : option === 'auto' ? 'Auto' : 'On'}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, isDark, isNightMode } = useAppTheme();
  const settings = useAppStore((state) => state.settings);
  const filesById = useAppStore((state) => state.filesById);
  const queueOrder = useAppStore((state) => state.queueOrder);
  const actionLogs = useAppStore((state) => state.actionLogs);
  const analyticsEvents = useAppStore((state) => state.analyticsEvents);
  const recentMoveTargets = useAppStore((state) => state.recentMoveTargets);
  const scanState = useAppStore((state) => state.scanState);
  const scanMode = useAppStore((state) => state.scanMode);
  const lastCompletedScanAt = useAppStore((state) => state.lastCompletedScanAt);
  const lastRescanSummary = useAppStore((state) => state.lastRescanSummary);
  const lowStorageWarning = useAppStore((state) => state.lowStorageWarning);
  const lastStorageCheckAt = useAppStore((state) => state.lastStorageCheckAt);
  const notificationPermissionState = useAppStore((state) => state.notificationPermissionState);
  const newSinceLastScanCount = useAppStore(selectNewSinceLastScanCount);
  const toggleSetting = useAppStore((state) => state.toggleSetting);
  const setNightModePreference = useAppStore((state) => state.setNightModePreference);
  const setNotificationPermissionState = useAppStore((state) => state.setNotificationPermissionState);
  const requestRescan = useAppStore((state) => state.requestRescan);
  const resetOnboarding = useAppStore((state) => state.resetOnboarding);
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
        setNotificationPermissionState: _setNotificationPermissionState,
        beginQuickSession: _beginQuickSession,
        setActiveFilter: _setActiveFilter,
        setSortMode: _setSortMode,
        setNightModePreference: _setNightModePreference,
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
        commitMoveSuccess: _commitMoveSuccess,
        recordDeleteFailure: _recordDeleteFailure,
        recordMoveFailure: _recordMoveFailure,
        recordPreviewOpen: _recordPreviewOpen,
        requestRescan: _requestRescan,
        toggleSetting: _toggleSetting,
        markGestureTutorialSeen: _markGestureTutorialSeen,
        setStorageWarning: _setStorageWarning,
        recordLowStorageNotificationSent: _recordLowStorageNotificationSent,
        resetOnboarding: _resetOnboarding,
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

  const toggleNotificationSetting = async (key: 'weeklySummaryNotificationsEnabled' | 'storageAlertsEnabled') => {
    if (settings[key]) {
      toggleSetting(key);
      return;
    }

    const permissionState = await requestNotificationPermissionStateAsync().catch(() => 'blocked' as const);
    setNotificationPermissionState(permissionState);

    if (permissionState !== 'granted') {
      Alert.alert(
        'Notifications are still off',
        permissionState === 'blocked'
          ? 'FileSwipe cannot schedule reminders until notifications are allowed in system settings.'
          : 'FileSwipe only turns reminders on after Android notification permission is granted.'
      );
      return;
    }

    toggleSetting(key);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.canvas }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: colors.ink }]}>Settings</Text>
          <Pressable android_disableSound={!settings.soundEnabled} onPress={() => router.back()}>
            <Text style={[styles.backLink, { color: colors.progress }]}>Back</Text>
          </Pressable>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: isDark ? colors.outline : 'transparent' }]}>
          <Text style={[styles.sectionTitle, { color: colors.ink }]}>Preferences</Text>
          <SettingRow label="Haptics" value={settings.hapticsEnabled} onValueChange={() => toggleSetting('hapticsEnabled')} />
          <SettingRow label="Touch sounds" value={settings.soundEnabled} onValueChange={() => toggleSetting('soundEnabled')} />
          <SettingRow label="Animations" value={settings.animationsEnabled} onValueChange={() => toggleSetting('animationsEnabled')} />
          <SettingRow label="Follow system theme" value={settings.followSystemTheme} onValueChange={() => toggleSetting('followSystemTheme')} />
          <SettingRow label="Gesture hints" value={settings.showGestureHints} onValueChange={() => toggleSetting('showGestureHints')} />
          <SettingRow label="Debug logging" value={settings.debugLoggingEnabled} onValueChange={() => toggleSetting('debugLoggingEnabled')} />
          <Text style={[styles.sectionHint, { color: colors.mutedInk }]}>
            Haptics, touch sounds, and motion apply immediately. Turning off debug logging clears detailed local logs and stops new reproduction logs from accumulating.
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: isDark ? colors.outline : 'transparent' }]}>
          <Text style={[styles.sectionTitle, { color: colors.ink }]}>Theme and low light</Text>
          <NightModePicker value={settings.nightModePreference} onChange={setNightModePreference} />
          <Text style={[styles.sectionHint, { color: colors.mutedInk }]}>
            Night mode pushes the queue into a dimmer ultra-dark look. `Auto` follows late-evening hours or Android dark appearance.
          </Text>
          <Text style={[styles.sectionHint, { color: colors.mutedInk }]}>Current appearance: {isNightMode ? 'Night mode active' : isDark ? 'Dark theme active' : 'Light theme active'}</Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: isDark ? colors.outline : 'transparent' }]}>
          <Text style={[styles.sectionTitle, { color: colors.ink }]}>Notifications</Text>
          <SettingRow
            label="Weekly summary reminder"
            value={settings.weeklySummaryNotificationsEnabled}
            onValueChange={() => void toggleNotificationSetting('weeklySummaryNotificationsEnabled')}
          />
          <SettingRow
            label="Low-storage alerts"
            value={settings.storageAlertsEnabled}
            onValueChange={() => void toggleNotificationSetting('storageAlertsEnabled')}
          />
          <Text style={[styles.sectionHint, { color: colors.mutedInk }]}>Permission status: {notificationPermissionState}</Text>
          <Text style={[styles.sectionHint, { color: colors.mutedInk }]}>
            Weekly reminders stay low-volume. Storage alerts are factual and only fire when the device is genuinely running low.
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: isDark ? colors.outline : 'transparent' }]}>
          <Text style={[styles.sectionTitle, { color: colors.ink }]}>Session and data</Text>
          <Button
            label={scanState === 'scanning' && scanMode === 'rescan' ? 'Re-scanning photos...' : 'Re-scan photos'}
            onPress={() => {
              requestRescan();
              router.replace(ROUTES.queue);
            }}
            disabled={scanState === 'scanning' && scanMode === 'rescan'}
          />
          <Text style={[styles.sectionHint, { color: colors.mutedInk }]}>
            Re-scan checks the library again, adds only unmatched photos, and keeps already reviewed items from re-entering as duplicates.
          </Text>
          {lastRescanSummary ? (
            <Text style={[styles.sectionHint, { color: colors.mutedInk }]}>
              Last re-scan: {lastRescanSummary.newFileCount} new, {lastRescanSummary.matchedFileCount} matched, {lastRescanSummary.protectedReviewedCount} reviewed protected.
            </Text>
          ) : null}
          <Button
            label="Reset onboarding"
            variant="secondary"
            onPress={() => {
              resetOnboarding();
              router.replace(ROUTES.welcome);
            }}
          />
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: isDark ? colors.outline : 'transparent' }]}>
          <Text style={[styles.sectionTitle, { color: colors.ink }]}>Debug and diagnostics</Text>
          <Button
            label={isExporting ? 'Preparing export...' : 'Export local debug data'}
            onPress={() => void exportLocalData()}
            variant="secondary"
            disabled={isExporting}
          />
          <Text style={[styles.diagnosticLine, { color: colors.mutedInk }]}>{Object.keys(filesById).length} files cached in the current local snapshot</Text>
          <Text style={[styles.diagnosticLine, { color: colors.mutedInk }]}>{queueOrder.length} queue positions tracked locally</Text>
          <Text style={[styles.diagnosticLine, { color: colors.mutedInk }]}>{newSinceLastScanCount} photos currently marked new since last scan</Text>
          <Text style={[styles.diagnosticLine, { color: colors.mutedInk }]}>{analyticsEvents.length} analytics events stored locally</Text>
          <Text style={[styles.diagnosticLine, { color: colors.mutedInk }]}>{actionLogs.length} action log entries stored locally</Text>
          <Text style={[styles.diagnosticLine, { color: colors.mutedInk }]}>{recentMoveTargets.length} recent move destinations stored locally</Text>
          <Text style={[styles.diagnosticLine, { color: colors.mutedInk }]}>Last completed scan: {formatDateTime(lastCompletedScanAt)}</Text>
          <Text style={[styles.diagnosticLine, { color: colors.mutedInk }]}>Last storage check: {formatDateTime(lastStorageCheckAt)}</Text>
          {lowStorageWarning ? (
            <Text style={[styles.diagnosticLine, { color: colors.delete }]}>
              Low-storage warning active: {formatBytes(lowStorageWarning.freeBytes)} free, threshold {formatBytes(lowStorageWarning.thresholdBytes)}.
            </Text>
          ) : null}
        </View>

        <View style={[styles.section, styles.dangerSection, { backgroundColor: colors.surface, borderColor: isDark ? colors.delete : 'rgba(231,111,81,0.22)' }]}>
          <Text style={[styles.sectionTitle, { color: colors.ink }]}>Danger zone</Text>
          <Text style={[styles.sectionHint, { color: colors.mutedInk }]}>Clearing local data removes the saved queue, recent history, and current session from this device only.</Text>
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
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
    fontFamily: typography.display,
    fontSize: 34,
  },
  backLink: {
    fontFamily: typography.medium,
    fontSize: 15,
  },
  section: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  sectionTitle: {
    fontFamily: typography.display,
    fontSize: 24,
  },
  sectionHint: {
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
    fontFamily: typography.body,
    fontSize: 16,
  },
  modeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modeChip: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  modeChipLabel: {
    fontFamily: typography.bold,
    fontSize: 14,
    textTransform: 'uppercase',
  },
  diagnosticLine: {
    fontFamily: typography.body,
    fontSize: 15,
  },
  dangerSection: {},
});

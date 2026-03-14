import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Alert, AppState, Pressable, ScrollView, Share, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StatusBanner } from '../../src/components/feedback/status-banner';
import { Button } from '../../src/components/ui/button';
import { ROUTES } from '../../src/constants/routes';
import { radius, spacing, typography } from '../../src/constants/ui-tokens';
import { exportDebugSnapshot } from '../../src/features/diagnostics/export-service';
import {
  canManageMediaAsync,
  hasNativeDirectDeleteSupport,
  presentManageMediaPermissionPickerAsync,
  supportsManageMediaAccess,
} from '../../src/features/file-ops/manage-media-service';
import { requestNotificationPermissionStateAsync } from '../../src/features/notifications/notification-service';
import { formatBytes, formatDateTime } from '../../src/lib/format';
import { useAppTheme } from '../../src/lib/theme';
import { selectNewSinceLastScanCount, useAppStore } from '../../src/store/app-store';
import type { NightModePreference, PersistedAppState } from '../../src/types/app-state';

function SettingRow({
  label,
  value,
  onValueChange,
  disabled = false,
}: {
  label: string;
  value: boolean;
  onValueChange: () => void;
  disabled?: boolean;
}) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.settingRow, disabled && styles.settingRowDisabled]}>
      <Text style={[styles.settingLabel, { color: colors.ink }]}>{label}</Text>
      <Switch disabled={disabled} value={value} onValueChange={onValueChange} trackColor={{ true: colors.progress }} />
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
            style={({ pressed }) => [
              styles.modeChip,
              {
                backgroundColor: selected ? colors.action : colors.surfaceMuted,
                borderColor: selected ? colors.action : isDark ? colors.outline : 'transparent',
              },
              pressed && styles.pressedChip,
            ]}
          >
            <Text style={[styles.modeChipLabel, { color: selected ? colors.onAction : colors.ink }]}>{option === 'off' ? 'Off' : option === 'auto' ? 'Auto' : 'On'}</Text>
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
  const [isCheckingManageMedia, setIsCheckingManageMedia] = useState(false);
  const [hasManageMediaAccess, setHasManageMediaAccess] = useState(false);
  const [busyNotificationKey, setBusyNotificationKey] = useState<'weeklySummaryNotificationsEnabled' | 'storageAlertsEnabled' | null>(null);
  const [statusFeedback, setStatusFeedback] = useState<{ tone: 'info' | 'success' | 'error'; message: string } | null>(null);
  const nativeDirectDeleteReady = hasNativeDirectDeleteSupport();

  const refreshManageMediaState = async (showFeedback = false) => {
    if (!supportsManageMediaAccess()) {
      return;
    }

    setIsCheckingManageMedia(true);

    try {
      const granted = await canManageMediaAsync();
      setHasManageMediaAccess(granted);

      if (showFeedback) {
        setStatusFeedback({
          tone: granted && nativeDirectDeleteReady ? 'success' : 'info',
          message:
            granted && nativeDirectDeleteReady
              ? 'Direct delete is ready in this build.'
              : granted
                ? 'Access is granted, but this installed build is still missing the native direct-delete bridge.'
                : 'Android confirmation popup is still active for deletes.',
        });
      }
    } finally {
      setIsCheckingManageMedia(false);
    }
  };

  useEffect(() => {
    if (!supportsManageMediaAccess()) {
      return;
    }

    let active = true;

    const refreshManageMediaStateSilently = async () => {
      const granted = await canManageMediaAsync();
      if (active) {
        setHasManageMediaAccess(granted);
      }
    };

    void refreshManageMediaStateSilently();

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        void refreshManageMediaStateSilently();
      }
    });

    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!statusFeedback) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setStatusFeedback(null);
    }, 3600);

    return () => clearTimeout(timeoutId);
  }, [statusFeedback]);

  const exportLocalData = async () => {
    setIsExporting(true);
    setStatusFeedback({
      tone: 'info',
      message: 'Packaging the current device snapshot for sharing...',
    });

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
        title: 'YeetFiles debug export',
        message: 'YeetFiles local debug export',
        url: exportFile.uri,
      });
      setStatusFeedback({
        tone: 'success',
        message: 'Debug export prepared. The native share sheet should be open now.',
      });
    } catch {
      setStatusFeedback({
        tone: 'error',
        message: 'We could not create or share the local debug export.',
      });
      Alert.alert('Export failed', 'We could not create or share the local debug export.');
    } finally {
      setIsExporting(false);
    }
  };

  const toggleNotificationSetting = async (key: 'weeklySummaryNotificationsEnabled' | 'storageAlertsEnabled') => {
    if (settings[key]) {
      toggleSetting(key);
      setStatusFeedback({
        tone: 'success',
        message: key === 'weeklySummaryNotificationsEnabled' ? 'Weekly reminder turned off.' : 'Low-storage alerts turned off.',
      });
      return;
    }

    setBusyNotificationKey(key);
    setStatusFeedback({
      tone: 'info',
      message: 'Checking Android notification permission...',
    });

    const permissionState = await requestNotificationPermissionStateAsync().catch(() => 'blocked' as const);
    setNotificationPermissionState(permissionState);

    if (permissionState !== 'granted') {
      setStatusFeedback({
        tone: 'error',
        message:
          permissionState === 'blocked'
            ? 'Notifications are blocked in system settings right now.'
            : 'Notification permission was not granted yet.',
      });
      Alert.alert(
        'Notifications are still off',
        permissionState === 'blocked'
          ? 'YeetFiles cannot schedule reminders until notifications are allowed in system settings.'
          : 'YeetFiles only turns reminders on after Android notification permission is granted.'
      );
      setBusyNotificationKey(null);
      return;
    }

    toggleSetting(key);
    setStatusFeedback({
      tone: 'success',
      message: key === 'weeklySummaryNotificationsEnabled' ? 'Weekly reminder turned on.' : 'Low-storage alerts turned on.',
    });
    setBusyNotificationKey(null);
  };

  const enableDirectDelete = async () => {
    if (!supportsManageMediaAccess()) {
      Alert.alert('Android 12+ only', 'Direct delete without the system popup needs Android 12 or newer.');
      return;
    }

    setIsCheckingManageMedia(true);
    setStatusFeedback({
      tone: 'info',
      message: 'Opening Android media access so YeetFiles can delete without the extra popup...',
    });

    try {
      const launched = await presentManageMediaPermissionPickerAsync();

      if (!launched) {
        setStatusFeedback({
          tone: 'error',
          message: 'We could not open the Android media access screen.',
        });
        Alert.alert('Open failed', 'We could not open the Android media access screen.');
        return;
      }

      setStatusFeedback({
        tone: 'info',
        message: 'Grant the Android media access permission, then come back here.',
      });
    } finally {
      setIsCheckingManageMedia(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.canvas }]} edges={['top', 'left', 'right']}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: colors.ink }]}>Settings</Text>
          <Pressable android_disableSound={!settings.soundEnabled} onPress={() => router.back()} style={({ pressed }) => pressed && styles.linkPressed}>
            <Text style={[styles.backLink, { color: colors.progress }]}>Back</Text>
          </Pressable>
        </View>
        {statusFeedback ? <StatusBanner message={statusFeedback.message} tone={statusFeedback.tone} /> : null}

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
            disabled={busyNotificationKey !== null}
          />
          <SettingRow
            label="Low-storage alerts"
            value={settings.storageAlertsEnabled}
            onValueChange={() => void toggleNotificationSetting('storageAlertsEnabled')}
            disabled={busyNotificationKey !== null}
          />
          <Text style={[styles.sectionHint, { color: colors.mutedInk }]}>Permission status: {notificationPermissionState}</Text>
          <Text style={[styles.sectionHint, { color: colors.mutedInk }]}>
            Weekly reminders stay low-volume. Storage alerts are factual and only fire when the device is genuinely running low.
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: isDark ? colors.outline : 'transparent' }]}>
          <Text style={[styles.sectionTitle, { color: colors.ink }]}>Session and data</Text>
          <Button
            label="Re-scan photos"
            loading={scanState === 'scanning' && scanMode === 'rescan'}
            loadingLabel="Re-scanning photos..."
            onPress={() => {
              setStatusFeedback({
                tone: 'info',
                message: 'Fresh queue requested. YeetFiles will scan in the background.',
              });
              requestRescan();
              router.replace(ROUTES.queue);
            }}
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

        {supportsManageMediaAccess() ? (
          <View style={[styles.section, { backgroundColor: colors.surface, borderColor: isDark ? colors.outline : 'transparent' }]}>
            <Text style={[styles.sectionTitle, { color: colors.ink }]}>Direct delete</Text>
            <Text style={[styles.sectionHint, { color: colors.mutedInk }]}>
              Android 12+ can grant YeetFiles special media-management access so photo deletes stop showing the extra system confirmation every time.
            </Text>
            <Text style={[styles.sectionHint, { color: hasManageMediaAccess ? colors.progress : colors.mutedInk }]}>
              Status: {hasManageMediaAccess ? 'Direct delete access granted' : 'Still using Android confirmation popup'}
            </Text>
            <Text style={[styles.sectionHint, { color: nativeDirectDeleteReady ? colors.progress : colors.mutedInk }]}>
              Native delete engine: {nativeDirectDeleteReady ? 'Installed in this build' : 'Missing from this build'}
            </Text>
            <Button
              label={hasManageMediaAccess ? 'Review direct delete access' : 'Enable direct delete'}
              variant="secondary"
              loading={isCheckingManageMedia}
              loadingLabel="Opening Android settings..."
              onPress={() => void enableDirectDelete()}
            />
            <Button
              label="Refresh direct delete status"
              variant="secondary"
              loading={isCheckingManageMedia}
              loadingLabel="Refreshing..."
              onPress={() => void refreshManageMediaState(true)}
            />
            <Text style={[styles.sectionHint, { color: colors.mutedInk }]}>
              This is Android special access, not the normal photo permission. After granting it once, YeetFiles should be able to delete without the per-photo popup.
            </Text>
            {!nativeDirectDeleteReady ? (
              <Text style={[styles.sectionHint, { color: colors.delete }]}>
                This install does not include the native direct-delete bridge yet. A fresh dev build install is required because Fast Refresh cannot add native Android code.
              </Text>
            ) : null}
          </View>
        ) : null}

        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: isDark ? colors.outline : 'transparent' }]}>
          <Text style={[styles.sectionTitle, { color: colors.ink }]}>Debug and diagnostics</Text>
          <Button
            label="Export local debug data"
            loading={isExporting}
            loadingLabel="Preparing export..."
            onPress={() => void exportLocalData()}
            variant="secondary"
          />
          <Text style={[styles.diagnosticLine, { color: colors.mutedInk }]}>{Object.keys(filesById).length} files cached in the current in-memory snapshot</Text>
          <Text style={[styles.diagnosticLine, { color: colors.mutedInk }]}>{queueOrder.length} queue positions active in this pass</Text>
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
          <Text style={[styles.sectionHint, { color: colors.mutedInk }]}>Clearing local data removes your saved preferences, debug history, and current in-memory session from this device only.</Text>
          <Button
            label="Clear local session data"
            variant="danger"
            onPress={() => {
              Alert.alert('Clear local state?', 'This removes your saved preferences, history, and current session from this device.', [
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
    paddingTop: spacing.md,
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
  settingRowDisabled: {
    opacity: 0.55,
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
  pressedChip: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  modeChipLabel: {
    fontFamily: typography.bold,
    fontSize: 14,
    textTransform: 'uppercase',
  },
  linkPressed: {
    opacity: 0.72,
  },
  diagnosticLine: {
    fontFamily: typography.body,
    fontSize: 15,
  },
  dangerSection: {},
});

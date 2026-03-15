import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Alert, AppState, Pressable, ScrollView, Share, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StatusBanner } from '../../src/components/feedback/status-banner';
import { HistoryHeatmap } from '../../src/components/settings/history-heatmap';
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
import { formatBytes, formatDateTime, formatDayLabel } from '../../src/lib/format';
import { useAppTheme } from '../../src/lib/theme';
import { getPersistedAppStateSnapshot } from '../../src/store/exportable-state';
import { selectNewSinceLastScanCount, useAppStore } from '../../src/store/app-store';
import type { NightModePreference } from '../../src/types/app-state';

function SettingRow({
  label,
  description,
  value,
  onValueChange,
  disabled = false,
}: {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: () => void;
  disabled?: boolean;
}) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.settingRow, disabled && styles.settingRowDisabled]}>
      <View style={styles.settingCopy}>
        <Text style={[styles.settingLabel, { color: colors.ink }]}>{label}</Text>
        {description ? <Text style={[styles.settingDescription, { color: colors.mutedInk }]}>{description}</Text> : null}
      </View>
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

function ThemePreviewCard() {
  const { colors, isDark } = useAppTheme();

  return (
    <View style={[styles.themePreviewCard, { backgroundColor: colors.stageCard, borderColor: isDark ? colors.outline : 'transparent' }]}>
      <View style={styles.themePreviewHeader}>
        <Text style={[styles.themePreviewTitle, { color: colors.white }]}>Live theme preview</Text>
        <View style={[styles.themePreviewPill, { backgroundColor: colors.highlight }]}>
          <Text style={styles.themePreviewPillLabel}>Queue</Text>
        </View>
      </View>
      <View style={[styles.themePreviewSurface, { backgroundColor: colors.cardGlass }]}>
        <Text style={[styles.themePreviewSurfaceTitle, { color: colors.white }]}>12 left in this pass</Text>
        <Text style={[styles.themePreviewSurfaceBody, { color: isDark ? 'rgba(245,247,250,0.72)' : 'rgba(249,250,251,0.78)' }]}>
          Theme changes update the queue cards, glass surfaces, and text contrast instantly.
        </Text>
      </View>
      <View style={styles.themePreviewSwatches}>
        <View style={[styles.themePreviewSwatch, { backgroundColor: colors.keep }]} />
        <View style={[styles.themePreviewSwatch, { backgroundColor: colors.highlight }]} />
        <View style={[styles.themePreviewSwatch, { backgroundColor: colors.delete }]} />
      </View>
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
  const historyByDay = useAppStore((state) => state.historyByDay);
  const recentSessionSummaries = useAppStore((state) => state.recentSessionSummaries);
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
  const [selectedHistoryDateKey, setSelectedHistoryDateKey] = useState<string | null>(null);
  const nativeDirectDeleteReady = hasNativeDirectDeleteSupport();
  const historySummary = useMemo(() => {
    const entries = Object.values(historyByDay);

    return entries.reduce(
      (summary, entry) => ({
        reviewedCount: summary.reviewedCount + entry.reviewedCount,
        deletedCount: summary.deletedCount + entry.deletedCount,
        sessionsCompleted: summary.sessionsCompleted + entry.sessionsCompleted,
        storageRecoveredBytes: summary.storageRecoveredBytes + entry.storageRecoveredBytes,
      }),
      {
        reviewedCount: 0,
        deletedCount: 0,
        sessionsCompleted: 0,
        storageRecoveredBytes: 0,
      }
    );
  }, [historyByDay]);
  const fallbackHistoryDateKey = recentSessionSummaries[0]?.completedAt.slice(0, 10) ?? null;
  const selectedHistoryEntry = historyByDay[selectedHistoryDateKey ?? fallbackHistoryDateKey ?? ''];

  useEffect(() => {
    if (!selectedHistoryDateKey && fallbackHistoryDateKey) {
      setSelectedHistoryDateKey(fallbackHistoryDateKey);
    }
  }, [fallbackHistoryDateKey, selectedHistoryDateKey]);

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
      const exportFile = exportDebugSnapshot(getPersistedAppStateSnapshot(useAppStore.getState()));

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
          <SettingRow
            label="Haptics"
            description="Swipe thresholds, undo, and review actions feel tactile."
            value={settings.hapticsEnabled}
            onValueChange={() => toggleSetting('hapticsEnabled')}
          />
          <SettingRow
            label="Touch sounds"
            description="Keeps button presses audible if you want stronger feedback."
            value={settings.soundEnabled}
            onValueChange={() => toggleSetting('soundEnabled')}
          />
          <SettingRow
            label="Animations"
            description="Controls queue motion, preview transitions, and celebration moments."
            value={settings.animationsEnabled}
            onValueChange={() => toggleSetting('animationsEnabled')}
          />
          <SettingRow
            label="Follow system theme"
            description="Lets YeetFiles respect Android light and dark appearance."
            value={settings.followSystemTheme}
            onValueChange={() => toggleSetting('followSystemTheme')}
          />
          <SettingRow
            label="Gesture hints"
            description="Shows the in-card keep and delete hints while you are still learning the flow."
            value={settings.showGestureHints}
            onValueChange={() => toggleSetting('showGestureHints')}
          />
          <SettingRow
            label="Debug logging"
            description="Stores local reproduction logs for support and diagnostics exports."
            value={settings.debugLoggingEnabled}
            onValueChange={() => toggleSetting('debugLoggingEnabled')}
          />
          <Text style={[styles.sectionHint, { color: colors.mutedInk }]}>
            Haptics, touch sounds, and motion apply immediately. Turning off debug logging clears detailed local logs and stops new reproduction logs from accumulating.
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: isDark ? colors.outline : 'transparent' }]}>
          <Text style={[styles.sectionTitle, { color: colors.ink }]}>Theme and low light</Text>
          <NightModePicker value={settings.nightModePreference} onChange={setNightModePreference} />
          <ThemePreviewCard />
          <Text style={[styles.sectionHint, { color: colors.mutedInk }]}>
            Night mode pushes the queue into a dimmer ultra-dark look. `Auto` follows late-evening hours or Android dark appearance.
          </Text>
          <Text style={[styles.sectionHint, { color: colors.mutedInk }]}>Current appearance: {isNightMode ? 'Night mode active' : isDark ? 'Dark theme active' : 'Light theme active'}</Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: isDark ? colors.outline : 'transparent' }]}>
          <Text style={[styles.sectionTitle, { color: colors.ink }]}>Notifications</Text>
          <SettingRow
            label="Weekly summary reminder"
            description="A gentle nudge to come back for another short cleanup pass."
            value={settings.weeklySummaryNotificationsEnabled}
            onValueChange={() => void toggleNotificationSetting('weeklySummaryNotificationsEnabled')}
            disabled={busyNotificationKey !== null}
          />
          <SettingRow
            label="Low-storage alerts"
            description="Warns you when device storage is genuinely getting tight."
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
              requestRescan({
                source: 'settings',
              });
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
            label="Clean rebuild review state"
            variant="secondary"
            onPress={() => {
              Alert.alert(
                'Clean rebuild review state?',
                'This keeps your long-term history, but clears the current per-photo review state and rebuilds the queue from the device library.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Rebuild',
                    style: 'destructive',
                    onPress: () => {
                      setStatusFeedback({
                        tone: 'info',
                        message: 'Clean rebuild requested. YeetFiles is rebuilding from scratch.',
                      });
                      requestRescan({
                        resetSession: true,
                        clearReviewState: true,
                        source: 'settings',
                      });
                      router.replace(ROUTES.queue);
                    },
                  },
                ]
              );
            }}
          />
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
          <Text style={[styles.sectionTitle, { color: colors.ink }]}>Last 90 days</Text>
          <Text style={[styles.sectionHint, { color: colors.mutedInk }]}>
            Durable review history now survives app restarts. Tap a day to inspect the cleanup work that happened.
          </Text>
          <HistoryHeatmap historyByDay={historyByDay} selectedDateKey={selectedHistoryDateKey} onSelectDateKey={setSelectedHistoryDateKey} />
          <View style={styles.historySummaryGrid}>
            <View style={[styles.historySummaryCard, { backgroundColor: colors.surfaceMuted }]}>
              <Text style={[styles.historySummaryLabel, { color: colors.mutedInk }]}>Reviewed</Text>
              <Text style={[styles.historySummaryValue, { color: colors.ink }]}>{historySummary.reviewedCount}</Text>
            </View>
            <View style={[styles.historySummaryCard, { backgroundColor: colors.surfaceMuted }]}>
              <Text style={[styles.historySummaryLabel, { color: colors.mutedInk }]}>Deleted</Text>
              <Text style={[styles.historySummaryValue, { color: colors.ink }]}>{historySummary.deletedCount}</Text>
            </View>
            <View style={[styles.historySummaryCard, { backgroundColor: colors.surfaceMuted }]}>
              <Text style={[styles.historySummaryLabel, { color: colors.mutedInk }]}>Sessions</Text>
              <Text style={[styles.historySummaryValue, { color: colors.ink }]}>{historySummary.sessionsCompleted}</Text>
            </View>
            <View style={[styles.historySummaryCard, { backgroundColor: colors.surfaceMuted }]}>
              <Text style={[styles.historySummaryLabel, { color: colors.mutedInk }]}>Recovered</Text>
              <Text style={[styles.historySummaryValue, { color: colors.ink }]}>{formatBytes(historySummary.storageRecoveredBytes)}</Text>
            </View>
          </View>
          {selectedHistoryEntry ? (
            <View style={[styles.historyDetailCard, { backgroundColor: colors.surfaceMuted }]}>
              <Text style={[styles.historyDetailTitle, { color: colors.ink }]}>{formatDayLabel(selectedHistoryEntry.dateKey)}</Text>
              <Text style={[styles.sectionHint, { color: colors.mutedInk }]}>
                {selectedHistoryEntry.reviewedCount} reviewed, {selectedHistoryEntry.deletedCount} deleted, {selectedHistoryEntry.sessionsCompleted} sessions completed, {formatBytes(selectedHistoryEntry.storageRecoveredBytes)} recovered.
              </Text>
            </View>
          ) : null}
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
    gap: spacing.md,
  },
  settingRowDisabled: {
    opacity: 0.55,
  },
  settingCopy: {
    flex: 1,
    gap: 2,
  },
  settingLabel: {
    fontFamily: typography.body,
    fontSize: 16,
  },
  settingDescription: {
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 20,
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
  themePreviewCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.md,
  },
  themePreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  themePreviewTitle: {
    fontFamily: typography.bold,
    fontSize: 15,
  },
  themePreviewPill: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  themePreviewPillLabel: {
    color: '#08111D',
    fontFamily: typography.bold,
    fontSize: 11,
    textTransform: 'uppercase',
  },
  themePreviewSurface: {
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 4,
  },
  themePreviewSurfaceTitle: {
    fontFamily: typography.bold,
    fontSize: 16,
  },
  themePreviewSurfaceBody: {
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 20,
  },
  themePreviewSwatches: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  themePreviewSwatch: {
    flex: 1,
    height: 16,
    borderRadius: radius.pill,
  },
  historySummaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  historySummaryCard: {
    flexBasis: '48%',
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 4,
  },
  historySummaryLabel: {
    fontFamily: typography.medium,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  historySummaryValue: {
    fontFamily: typography.display,
    fontSize: 22,
  },
  historyDetailCard: {
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 4,
  },
  historyDetailTitle: {
    fontFamily: typography.bold,
    fontSize: 16,
  },
  dangerSection: {},
});

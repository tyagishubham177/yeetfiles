import { AppState, Alert } from 'react-native';
import { useEffect, useRef } from 'react';

import { checkDeviceStorageAsync } from '../features/device-health/storage-service';
import { sendLowStorageNotificationAsync } from '../features/notifications/notification-service';
import { getMediaPermissionState } from '../features/permissions/permission-service';
import { nowIso } from '../lib/time';
import { useAppStore } from '../store/app-store';

const LOW_STORAGE_NOTIFICATION_COOLDOWN_MS = 18 * 60 * 60 * 1000;

export function useAppHealthMonitor() {
  const permissionState = useAppStore((state) => state.permissionState);
  const notificationPermissionState = useAppStore((state) => state.notificationPermissionState);
  const lowStorageWarning = useAppStore((state) => state.lowStorageWarning);
  const storageAlertsEnabled = useAppStore((state) => state.settings.storageAlertsEnabled);
  const lastLowStorageNotificationAt = useAppStore((state) => state.lastLowStorageNotificationAt);
  const setPermissionState = useAppStore((state) => state.setPermissionState);
  const setStorageWarning = useAppStore((state) => state.setStorageWarning);
  const recordLowStorageNotificationSent = useAppStore((state) => state.recordLowStorageNotificationSent);
  const lastPromptedRef = useRef<string | null>(null);

  useEffect(() => {
    let active = true;

    async function refreshAppHealth() {
      const nextPermissionState = await getMediaPermissionState().catch(() => 'blocked' as const);
      if (active && nextPermissionState !== permissionState) {
        setPermissionState(nextPermissionState);
      }

      const storage = await checkDeviceStorageAsync().catch(() => null);
      if (!active || !storage) {
        return;
      }

      if (!storage.belowThreshold) {
        lastPromptedRef.current = null;
        setStorageWarning(null);
        return;
      }

      const warning = {
        freeBytes: storage.freeBytes,
        totalBytes: storage.totalBytes,
        thresholdBytes: storage.thresholdBytes,
        detectedAt: nowIso(),
      };

      setStorageWarning(warning);

      if (!lowStorageWarning && lastPromptedRef.current !== 'shown') {
        lastPromptedRef.current = 'shown';
        Alert.alert(
          'Storage is getting tight',
          `YeetFiles only spotted about ${Math.round(storage.freeBytes / (1024 * 1024))} MB free on this device. A short cleanup pass can help before storage gets critical.`
        );
      }

      const lastNotificationAt = lastLowStorageNotificationAt ? Date.parse(lastLowStorageNotificationAt) : 0;
      const cooldownExpired = Date.now() - lastNotificationAt >= LOW_STORAGE_NOTIFICATION_COOLDOWN_MS;

      if (storageAlertsEnabled && notificationPermissionState === 'granted' && cooldownExpired) {
        await sendLowStorageNotificationAsync(storage.freeBytes, storage.thresholdBytes).catch(() => null);
        recordLowStorageNotificationSent();
      }
    }

    void refreshAppHealth();

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        void refreshAppHealth();
      }
    });

    return () => {
      active = false;
      subscription.remove();
    };
  }, [
    lastLowStorageNotificationAt,
    lowStorageWarning,
    notificationPermissionState,
    permissionState,
    recordLowStorageNotificationSent,
    setPermissionState,
    setStorageWarning,
    storageAlertsEnabled,
  ]);

  return lowStorageWarning;
}

import { useEffect } from 'react';

import {
  configureNotificationPresentation,
  getNotificationPermissionStateAsync,
  syncWeeklySummaryNotificationAsync,
} from '../features/notifications/notification-service';
import { useAppStore } from '../store/app-store';

export function useNotificationSync() {
  const notificationPermissionState = useAppStore((state) => state.notificationPermissionState);
  const sessionSummary = useAppStore((state) => state.sessionSummary);
  const weeklySummaryNotificationsEnabled = useAppStore((state) => state.settings.weeklySummaryNotificationsEnabled);
  const setNotificationPermissionState = useAppStore((state) => state.setNotificationPermissionState);

  useEffect(() => {
    configureNotificationPresentation();

    void (async () => {
      const nextPermissionState = await getNotificationPermissionStateAsync().catch(() => 'blocked' as const);
      if (nextPermissionState !== notificationPermissionState) {
        setNotificationPermissionState(nextPermissionState);
      }
    })();
  }, [notificationPermissionState, setNotificationPermissionState]);

  useEffect(() => {
    void syncWeeklySummaryNotificationAsync(weeklySummaryNotificationsEnabled, sessionSummary);
  }, [sessionSummary, weeklySummaryNotificationsEnabled]);
}

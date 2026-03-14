import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

import type { NotificationPermissionState, SessionSummary } from '../../types/app-state';

const YEETFILES_NOTIFICATION_CHANNEL = 'yeetfiles-reminders';
const WEEKLY_SUMMARY_NOTIFICATION_ID = 'yeetfiles-weekly-summary';
const LOW_STORAGE_NOTIFICATION_ID = 'yeetfiles-low-storage';

let handlerConfigured = false;

function toNotificationPermissionState(status: Notifications.NotificationPermissionsStatus): NotificationPermissionState {
  if (status.granted) {
    return 'granted';
  }

  if (status.canAskAgain === false) {
    return 'blocked';
  }

  return 'denied';
}

function buildWeeklySummaryBody(summary: SessionSummary | null): string {
  if (!summary) {
    return 'Open YeetFiles for a short cleanup pass and keep the queue moving.';
  }

  if (summary.deletedCount > 0) {
    return `Last time you cleared ${summary.reviewedCount} items and freed ${Math.round(summary.storageFreedBytes / (1024 * 1024))} MB. Ready for another quick pass?`;
  }

  return `Last time you reviewed ${summary.reviewedCount} items. Drop back in for another quick cleanup session.`;
}

export function configureNotificationPresentation() {
  if (handlerConfigured) {
    return;
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
      priority: Notifications.AndroidNotificationPriority.DEFAULT,
    }),
  });

  handlerConfigured = true;
}

export async function ensureNotificationChannelAsync() {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync(YEETFILES_NOTIFICATION_CHANNEL, {
    name: 'YeetFiles reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 120],
    lightColor: '#3C91E6',
    sound: null,
  });
}

export async function getNotificationPermissionStateAsync(): Promise<NotificationPermissionState> {
  const status = await Notifications.getPermissionsAsync();
  return toNotificationPermissionState(status);
}

export async function requestNotificationPermissionStateAsync(): Promise<NotificationPermissionState> {
  const status = await Notifications.requestPermissionsAsync();
  return toNotificationPermissionState(status);
}

export async function syncWeeklySummaryNotificationAsync(enabled: boolean, summary: SessionSummary | null) {
  await Notifications.cancelScheduledNotificationAsync(WEEKLY_SUMMARY_NOTIFICATION_ID).catch(() => null);

  if (!enabled) {
    return;
  }

  await ensureNotificationChannelAsync();
  const permissionState = await getNotificationPermissionStateAsync();

  if (permissionState !== 'granted') {
    return;
  }

  await Notifications.scheduleNotificationAsync({
    identifier: WEEKLY_SUMMARY_NOTIFICATION_ID,
    content: {
      title: 'Ready for a quick cleanup pass?',
      body: buildWeeklySummaryBody(summary),
      data: {
        kind: 'weekly-summary',
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: 1,
      hour: 19,
      minute: 0,
      channelId: YEETFILES_NOTIFICATION_CHANNEL,
    },
  });
}

export async function sendLowStorageNotificationAsync(freeBytes: number, thresholdBytes: number) {
  await ensureNotificationChannelAsync();

  await Notifications.scheduleNotificationAsync({
    identifier: LOW_STORAGE_NOTIFICATION_ID,
    content: {
      title: 'Storage is getting tight',
      body: `YeetFiles noticed about ${Math.round(freeBytes / (1024 * 1024))} MB free. A short cleanup pass can help before storage gets critical.`,
      data: {
        kind: 'low-storage',
        freeBytes,
        thresholdBytes,
      },
    },
    trigger: null,
  });
}

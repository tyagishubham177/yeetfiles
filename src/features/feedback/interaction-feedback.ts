import * as Haptics from 'expo-haptics';

type FeedbackKind =
  | 'keep'
  | 'skip'
  | 'delete_success'
  | 'delete_failure'
  | 'move_success'
  | 'move_failure'
  | 'undo'
  | 'preview_open'
  | 'swipe_threshold'
  | 'swipe_commit';

export async function triggerInteractionFeedback(kind: FeedbackKind, enabled: boolean) {
  if (!enabled) {
    return;
  }

  try {
    if (kind === 'delete_failure' || kind === 'move_failure') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (kind === 'delete_success') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return;
    }

    if (kind === 'swipe_commit') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      return;
    }

    if (kind === 'move_success' || kind === 'undo') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return;
    }

    if (kind === 'swipe_threshold') {
      await Haptics.selectionAsync();
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
  } catch {
    return;
  }
}

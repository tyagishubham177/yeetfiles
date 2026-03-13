import { Vibration } from 'react-native';

type FeedbackKind = 'keep' | 'skip' | 'delete_success' | 'delete_failure' | 'move_success' | 'move_failure' | 'undo' | 'preview_open';

const FEEDBACK_PATTERNS: Record<FeedbackKind, number | number[]> = {
  keep: 12,
  skip: 10,
  delete_success: [0, 20, 30, 12],
  delete_failure: [0, 34, 36, 34],
  move_success: [0, 16, 26, 16],
  move_failure: [0, 28, 28, 20],
  undo: [0, 10, 24, 10],
  preview_open: 8,
};

export function triggerInteractionFeedback(kind: FeedbackKind, enabled: boolean) {
  if (!enabled) {
    return;
  }

  Vibration.vibrate(FEEDBACK_PATTERNS[kind]);
}

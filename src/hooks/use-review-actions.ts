import { useState } from 'react';

import { deleteFileItem } from '../features/file-ops/delete-service';
import { moveFileItem } from '../features/file-ops/move-service';
import { triggerInteractionFeedback } from '../features/feedback/interaction-feedback';
import { selectCurrentFile, useAppStore } from '../store/app-store';
import type { MoveTarget } from '../types/app-state';

export function useReviewActions() {
  const currentFile = useAppStore(selectCurrentFile);
  const hapticsEnabled = useAppStore((state) => state.settings.hapticsEnabled);
  const keepCurrentFile = useAppStore((state) => state.keepCurrentFile);
  const skipCurrentFile = useAppStore((state) => state.skipCurrentFile);
  const commitDeleteSuccess = useAppStore((state) => state.commitDeleteSuccess);
  const recordDeleteFailure = useAppStore((state) => state.recordDeleteFailure);
  const commitMoveSuccess = useAppStore((state) => state.commitMoveSuccess);
  const recordMoveFailure = useAppStore((state) => state.recordMoveFailure);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMoving, setIsMoving] = useState(false);

  return {
    currentFile,
    isDeleting,
    isMoving,
    keepCurrent: (source: 'swipe' | 'dock' | 'modal' = 'dock') => {
      keepCurrentFile(source);
      void triggerInteractionFeedback(source === 'swipe' ? 'swipe_commit' : 'keep', hapticsEnabled);
    },
    skipCurrent: (source: 'swipe' | 'dock' | 'modal' = 'dock') => {
      skipCurrentFile(source);
      void triggerInteractionFeedback(source === 'swipe' ? 'swipe_commit' : 'skip', hapticsEnabled);
    },
    deleteCurrent: async (source: 'swipe' | 'dock' | 'modal' = 'dock') => {
      if (!currentFile || isDeleting || isMoving) {
        return { ok: false as const, message: 'No active photo to delete.', errorCode: 'missing_current_file' };
      }

      setIsDeleting(true);

      try {
        const result = await deleteFileItem(currentFile);

        if (!result.ok) {
          recordDeleteFailure(currentFile.id, result.errorCode, result.message, source);
          void triggerInteractionFeedback('delete_failure', hapticsEnabled);
          return { ok: false as const, message: result.message, errorCode: result.errorCode };
        }

        commitDeleteSuccess(currentFile.id, currentFile.sizeBytes, source);
        void triggerInteractionFeedback(source === 'swipe' ? 'swipe_commit' : 'delete_success', hapticsEnabled);
        return { ok: true as const };
      } finally {
        setIsDeleting(false);
      }
    },
    moveCurrent: async (target: MoveTarget, source: 'secondary' = 'secondary') => {
      if (!currentFile || isDeleting || isMoving) {
        return { ok: false as const, message: 'No active photo to move.' };
      }

      setIsMoving(true);

      try {
        const result = await moveFileItem(currentFile, target);

        if (!result.ok) {
          recordMoveFailure(currentFile.id, result.errorCode, result.message, source);
          void triggerInteractionFeedback('move_failure', hapticsEnabled);
          return { ok: false as const, message: result.message, errorCode: result.errorCode };
        }

        commitMoveSuccess(currentFile.id, result.target, source);
        void triggerInteractionFeedback('move_success', hapticsEnabled);
        return {
          ok: true as const,
          target: result.target,
        };
      } finally {
        setIsMoving(false);
      }
    },
  };
}

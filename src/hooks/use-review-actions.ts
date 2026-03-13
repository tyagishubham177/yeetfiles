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
    keepCurrent: () => {
      keepCurrentFile();
      triggerInteractionFeedback('keep', hapticsEnabled);
    },
    skipCurrent: () => {
      skipCurrentFile();
      triggerInteractionFeedback('skip', hapticsEnabled);
    },
    deleteCurrent: async () => {
      if (!currentFile || isDeleting || isMoving) {
        return { ok: false as const, message: 'No active photo to delete.' };
      }

      setIsDeleting(true);

      try {
        const result = await deleteFileItem(currentFile);

        if (!result.ok) {
          recordDeleteFailure(currentFile.id, result.errorCode, result.message);
          triggerInteractionFeedback('delete_failure', hapticsEnabled);
          return { ok: false as const, message: result.message };
        }

        commitDeleteSuccess(currentFile.id, currentFile.sizeBytes);
        triggerInteractionFeedback('delete_success', hapticsEnabled);
        return { ok: true as const };
      } finally {
        setIsDeleting(false);
      }
    },
    moveCurrent: async (target: MoveTarget) => {
      if (!currentFile || isDeleting || isMoving) {
        return { ok: false as const, message: 'No active photo to move.' };
      }

      setIsMoving(true);

      try {
        const result = await moveFileItem(currentFile, target);

        if (!result.ok) {
          recordMoveFailure(currentFile.id, result.errorCode, result.message);
          triggerInteractionFeedback('move_failure', hapticsEnabled);
          return { ok: false as const, message: result.message, errorCode: result.errorCode };
        }

        commitMoveSuccess(currentFile.id, result.nextUri, result.target, result.finalName);
        triggerInteractionFeedback('move_success', hapticsEnabled);
        return {
          ok: true as const,
          target: result.target,
          finalName: result.finalName,
        };
      } finally {
        setIsMoving(false);
      }
    },
  };
}

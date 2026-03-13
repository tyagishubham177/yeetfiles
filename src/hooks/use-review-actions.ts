import { useState } from 'react';

import { deleteFileItem } from '../features/file-ops/delete-service';
import { selectCurrentFile, useAppStore } from '../store/app-store';

export function useReviewActions() {
  const currentFile = useAppStore(selectCurrentFile);
  const keepCurrentFile = useAppStore((state) => state.keepCurrentFile);
  const skipCurrentFile = useAppStore((state) => state.skipCurrentFile);
  const commitDeleteSuccess = useAppStore((state) => state.commitDeleteSuccess);
  const recordDeleteFailure = useAppStore((state) => state.recordDeleteFailure);
  const [isDeleting, setIsDeleting] = useState(false);

  return {
    currentFile,
    isDeleting,
    keepCurrent: () => keepCurrentFile(),
    skipCurrent: () => skipCurrentFile(),
    deleteCurrent: async () => {
      if (!currentFile || isDeleting) {
        return { ok: false as const, message: 'No active photo to delete.' };
      }

      setIsDeleting(true);

      try {
        const result = await deleteFileItem(currentFile);

        if (!result.ok) {
          recordDeleteFailure(currentFile.id, result.errorCode, result.message);
          return { ok: false as const, message: result.message };
        }

        commitDeleteSuccess(currentFile.id, currentFile.sizeBytes);
        return { ok: true as const };
      } finally {
        setIsDeleting(false);
      }
    },
  };
}

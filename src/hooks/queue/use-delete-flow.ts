import { useCallback } from 'react';
import { Alert } from 'react-native';

type StatusFeedback = { tone: 'info' | 'success' | 'error'; message: string } | null;

type UseDeleteFlowArgs = {
  busy: boolean;
  currentFileId: string | null | undefined;
  deleteCurrent: (source?: 'swipe' | 'dock' | 'modal') => Promise<
    | { ok: true }
    | {
        ok: false;
        message: string;
        errorCode: string;
      }
  >;
  onStatusChange: (value: StatusFeedback) => void;
};

export function useDeleteFlow({ busy, currentFileId, deleteCurrent, onStatusChange }: UseDeleteFlowArgs) {
  const requestDelete = useCallback(
    async (source: 'swipe' | 'dock' | 'modal' = 'dock') => {
      if (!currentFileId || busy) {
        return;
      }

      onStatusChange({
        tone: 'info',
        message: 'Sending the delete request...',
      });

      const result = await deleteCurrent(source);

      if (!result.ok) {
        if (result.errorCode === 'delete_cancelled') {
          onStatusChange({
            tone: 'info',
            message: 'Delete cancelled. The photo stayed in the queue.',
          });
          return;
        }

        onStatusChange({
          tone: 'error',
          message: `Delete failed: ${result.message}`,
        });
        Alert.alert('Delete failed', result.message);
        return;
      }

      onStatusChange({
        tone: 'success',
        message: 'Photo deleted. Session stats are updated.',
      });
    },
    [busy, currentFileId, deleteCurrent, onStatusChange],
  );

  return {
    requestDelete,
  };
}
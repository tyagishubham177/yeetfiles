import { useCallback, useState } from 'react';

import { getMoveTargets } from '../../features/file-ops/move-service';
import type { MoveTarget } from '../../types/app-state';

type StatusFeedback = { tone: 'info' | 'success' | 'error'; message: string } | null;

type UseMoveFlowArgs = {
  moveCurrent: (target: MoveTarget, source?: 'secondary') => Promise<
    | {
        ok: true;
        target: MoveTarget;
      }
    | {
        ok: false;
        message: string;
        errorCode?: string;
      }
  >;
  onStatusChange: (value: StatusFeedback) => void;
};

export function useMoveFlow({ moveCurrent, onStatusChange }: UseMoveFlowArgs) {
  const [moveSheetOpen, setMoveSheetOpen] = useState(false);
  const [selectedMoveTarget, setSelectedMoveTarget] = useState<MoveTarget | null>(null);
  const [availableMoveTargets, setAvailableMoveTargets] = useState<MoveTarget[]>([]);
  const [pendingAlbumName, setPendingAlbumName] = useState('');
  const [loadingMoveTargets, setLoadingMoveTargets] = useState(false);
  const [moveErrorMessage, setMoveErrorMessage] = useState<string | null>(null);

  const loadMoveTargets = useCallback(async () => {
    setLoadingMoveTargets(true);
    onStatusChange({
      tone: 'info',
      message: 'Loading albums from your media library...',
    });

    try {
      const targets = await getMoveTargets();
      setAvailableMoveTargets(targets);
      onStatusChange({
        tone: 'success',
        message: targets.length > 0 ? 'Albums ready. Pick a destination.' : 'No albums found yet. You can create a new one below.',
      });
    } catch {
      setMoveErrorMessage('We could not load the media-library albums. Try again.');
      onStatusChange({
        tone: 'error',
        message: 'We could not load the media-library albums. Try again.',
      });
    } finally {
      setLoadingMoveTargets(false);
    }
  }, [onStatusChange]);

  const openMoveFlow = useCallback(() => {
    setMoveErrorMessage(null);
    setPendingAlbumName('');
    setMoveSheetOpen(true);
    void loadMoveTargets();
  }, [loadMoveTargets]);

  const closeMoveFlow = useCallback(() => {
    setMoveSheetOpen(false);
  }, []);

  const confirmMove = useCallback(async () => {
    if (!selectedMoveTarget) {
      setMoveErrorMessage('Choose a destination folder before confirming the move.');
      onStatusChange({
        tone: 'error',
        message: 'Choose a destination folder before confirming the move.',
      });
      return;
    }

    onStatusChange({
      tone: 'info',
      message: `Moving photo to ${selectedMoveTarget.label}...`,
    });
    const result = await moveCurrent(selectedMoveTarget, 'secondary');

    if (!result.ok) {
      setMoveErrorMessage(result.message);
      onStatusChange({
        tone: 'error',
        message: `Move failed: ${result.message}`,
      });
      return;
    }

    setMoveErrorMessage(null);
    setMoveSheetOpen(false);
    setSelectedMoveTarget(result.target);
    setPendingAlbumName('');
    onStatusChange({
      tone: 'success',
      message: `Moved to ${result.target.label}`,
    });
  }, [moveCurrent, onStatusChange, selectedMoveTarget]);

  return {
    moveSheetOpen,
    selectedMoveTarget,
    setSelectedMoveTarget,
    availableMoveTargets,
    pendingAlbumName,
    setPendingAlbumName,
    loadingMoveTargets,
    moveErrorMessage,
    openMoveFlow,
    closeMoveFlow,
    confirmMove,
    setMoveErrorMessage,
  };
}
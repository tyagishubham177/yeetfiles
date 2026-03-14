import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useShallow } from 'zustand/react/shallow';

import { ActionDock } from '../../src/components/review/action-dock';
import { EmptyState } from '../../src/components/review/empty-state';
import { FileCard } from '../../src/components/review/file-card';
import { FilterChipRow } from '../../src/components/review/filter-chip-row';
import { MilestoneBanner } from '../../src/components/review/milestone-banner';
import { MoveDestinationSheet } from '../../src/components/review/move-destination-sheet';
import { PhotoPreviewModal } from '../../src/components/review/photo-preview-modal';
import { PermissionPanel } from '../../src/components/review/permission-panel';
import { ProgressHeader } from '../../src/components/review/progress-header';
import { SecondaryActionsSheet } from '../../src/components/review/secondary-actions-sheet';
import { UndoToast } from '../../src/components/review/undo-toast';
import { Button } from '../../src/components/ui/button';
import { Sheet } from '../../src/components/ui/sheet';
import { ROUTES } from '../../src/constants/routes';
import { colors, radius, spacing, typography } from '../../src/constants/ui-tokens';
import { triggerInteractionFeedback } from '../../src/features/feedback/interaction-feedback';
import { getMoveTargets } from '../../src/features/file-ops/move-service';
import { requestMediaPermissionState, MEDIA_PERMISSION_BLOCKED_HELP } from '../../src/features/permissions/permission-service';
import { useReviewActions } from '../../src/hooks/use-review-actions';
import { useScanBootstrap } from '../../src/hooks/use-scan-bootstrap';
import { formatBytes, formatCompactDate, formatDateTime } from '../../src/lib/format';
import {
  getActiveFilterLabel,
  getQuickSessionLabel,
  getSortLabel,
  selectCurrentFile,
  selectFilterChips,
  selectNewSinceLastScanCount,
  selectNextStackItems,
  selectPendingQueueCount,
  selectTopUndoEntry,
  selectVisibleQueueCount,
  useAppStore,
} from '../../src/store/app-store';
import type { MoveTarget } from '../../src/types/app-state';
import type { FilterType, SortMode } from '../../src/types/file-item';

const SORT_OPTIONS: SortMode[] = ['oldest_first', 'newest_first', 'largest_first', 'random'];

export default function QueueScreen() {
  const router = useRouter();
  useScanBootstrap();

  const currentFile = useAppStore(selectCurrentFile);
  const nextItems = useAppStore(useShallow(selectNextStackItems));
  const permissionState = useAppStore((state) => state.permissionState);
  const sessionStats = useAppStore((state) => state.sessionStats);
  const sessionSummary = useAppStore((state) => state.sessionSummary);
  const scanState = useAppStore((state) => state.scanState);
  const scanMode = useAppStore((state) => state.scanMode);
  const scanProgressLoaded = useAppStore((state) => state.scanProgressLoaded);
  const scanProgressTotal = useAppStore((state) => state.scanProgressTotal);
  const currentScanNewFileCount = useAppStore((state) => state.currentScanNewFileCount);
  const scanError = useAppStore((state) => state.scanError);
  const lastRescanSummary = useAppStore((state) => state.lastRescanSummary);
  const targetCount = useAppStore((state) => state.targetCount);
  const activeFilter = useAppStore((state) => state.activeFilter);
  const sortMode = useAppStore((state) => state.sortMode);
  const activeMilestone = useAppStore((state) => state.activeMilestone);
  const pendingQueueCount = useAppStore(selectPendingQueueCount);
  const visibleQueueCount = useAppStore(selectVisibleQueueCount);
  const newSinceLastScanCount = useAppStore(selectNewSinceLastScanCount);
  const filterChips = useAppStore(useShallow(selectFilterChips));
  const topUndoEntry = useAppStore(selectTopUndoEntry);
  const undoEntries = useAppStore((state) => state.undoEntries);
  const setPermissionState = useAppStore((state) => state.setPermissionState);
  const setActiveFilter = useAppStore((state) => state.setActiveFilter);
  const setSortMode = useAppStore((state) => state.setSortMode);
  const undoLastAction = useAppStore((state) => state.undoLastAction);
  const pruneExpiredUndoEntries = useAppStore((state) => state.pruneExpiredUndoEntries);
  const dismissMilestone = useAppStore((state) => state.dismissMilestone);
  const requestRescan = useAppStore((state) => state.requestRescan);
  const recordPreviewOpen = useAppStore((state) => state.recordPreviewOpen);
  const recentMoveTargets = useAppStore((state) => state.recentMoveTargets);
  const settings = useAppStore((state) => state.settings);
  const { keepCurrent, skipCurrent, deleteCurrent, moveCurrent, isDeleting, isMoving } = useReviewActions();

  const [previewOpen, setPreviewOpen] = useState(false);
  const [deleteSheetOpen, setDeleteSheetOpen] = useState(false);
  const [secondaryActionsOpen, setSecondaryActionsOpen] = useState(false);
  const [moveSheetOpen, setMoveSheetOpen] = useState(false);
  const [selectedMoveTarget, setSelectedMoveTarget] = useState<MoveTarget | null>(null);
  const [availableMoveTargets, setAvailableMoveTargets] = useState<MoveTarget[]>([]);
  const [pendingAlbumName, setPendingAlbumName] = useState('');
  const [loadingMoveTargets, setLoadingMoveTargets] = useState(false);
  const [moveErrorMessage, setMoveErrorMessage] = useState<string | null>(null);
  const [secondaryFeedback, setSecondaryFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (sessionSummary) {
      router.replace(ROUTES.summary);
    }
  }, [router, sessionSummary]);

  const remainingCount = useMemo(() => {
    if (!targetCount) {
      return 0;
    }

    return Math.max(targetCount - sessionStats.reviewedCount, 0);
  }, [sessionStats.reviewedCount, targetCount]);

  const scanProgressRatio = useMemo(() => {
    if (!scanProgressTotal || scanProgressTotal <= 0) {
      return 0.08;
    }

    return Math.min(Math.max(scanProgressLoaded / scanProgressTotal, 0.08), 1);
  }, [scanProgressLoaded, scanProgressTotal]);

  const scanProgressLabel = useMemo(() => {
    if (scanProgressTotal) {
      return `${scanProgressLoaded} of ${scanProgressTotal} photos checked`;
    }

    if (scanProgressLoaded > 0) {
      return `${scanProgressLoaded} photos checked so far`;
    }

    return 'Preparing your photo scan';
  }, [scanProgressLoaded, scanProgressTotal]);

  const blocked = permissionState === 'blocked';
  const permissionMissing = permissionState === 'denied' || permissionState === 'blocked';
  const sessionLabel = getQuickSessionLabel((targetCount as 10 | 25 | 50 | null) ?? 10);
  const sortLabel = getSortLabel(sortMode);
  const filterEmpty = !currentFile && visibleQueueCount === 0 && pendingQueueCount > 0 && activeFilter !== 'all';
  const activeFilterLabel = useAppStore((state) => getActiveFilterLabel(state));
  const rescanStatusLabel =
    scanMode === 'rescan' && scanState === 'scanning'
      ? currentScanNewFileCount > 0
        ? `${currentScanNewFileCount} new found so far`
        : 'Checking for new photos'
      : null;

  useEffect(() => {
    if (!topUndoEntry) {
      return;
    }

    const timeoutId = setTimeout(() => {
      pruneExpiredUndoEntries();
    }, 5200);

    return () => clearTimeout(timeoutId);
  }, [pruneExpiredUndoEntries, topUndoEntry]);

  useEffect(() => {
    if (!activeMilestone) {
      return;
    }

    const timeoutId = setTimeout(() => {
      dismissMilestone();
    }, 2400);

    return () => clearTimeout(timeoutId);
  }, [activeMilestone, dismissMilestone]);

  useEffect(() => {
    if (!secondaryFeedback) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setSecondaryFeedback(null);
    }, 3200);

    return () => clearTimeout(timeoutId);
  }, [secondaryFeedback]);

  const retryPermission = async () => {
    const nextPermissionState = await requestMediaPermissionState();
    setPermissionState(nextPermissionState);

    if (nextPermissionState === 'blocked') {
      Alert.alert('Media permission blocked', MEDIA_PERMISSION_BLOCKED_HELP);
    }
  };

  const confirmDelete = async () => {
    const result = await deleteCurrent();
    setDeleteSheetOpen(false);

    if (!result.ok) {
      Alert.alert('Delete failed', result.message);
    }
  };

  const openPreview = () => {
    if (!currentFile) {
      return;
    }

    recordPreviewOpen(currentFile.id);
    triggerInteractionFeedback('preview_open', settings.hapticsEnabled);
    setPreviewOpen(true);
  };

  const handlePreviewKeep = () => {
    setPreviewOpen(false);
    keepCurrent();
  };

  const handlePreviewSkip = () => {
    setPreviewOpen(false);
    skipCurrent();
  };

  const handlePreviewDelete = () => {
    setPreviewOpen(false);
    setDeleteSheetOpen(true);
  };

  const shareCurrent = async () => {
    if (!currentFile) {
      return;
    }

    try {
      await Share.share({
        title: currentFile.name,
        message: currentFile.name,
        url: currentFile.uri,
      });
    } catch {
      Alert.alert('Share unavailable', 'We could not open the native share sheet for this photo.');
    }
  };

  const openSecondaryActions = () => {
    if (!currentFile || isDeleting || isMoving) {
      return;
    }

    setSecondaryActionsOpen(true);
  };

  const loadMoveTargets = async () => {
    setLoadingMoveTargets(true);

    try {
      const targets = await getMoveTargets();
      setAvailableMoveTargets(targets);
    } catch {
      setMoveErrorMessage('We could not load the media-library albums. Try again.');
    } finally {
      setLoadingMoveTargets(false);
    }
  };

  const confirmMove = async () => {
    if (!selectedMoveTarget) {
      setMoveErrorMessage('Choose a destination folder before confirming the move.');
      return;
    }

    const result = await moveCurrent(selectedMoveTarget);

    if (!result.ok) {
      setMoveErrorMessage(result.message);
      setSecondaryFeedback({
        tone: 'error',
        message: `Move failed: ${result.message}`,
      });
      return;
    }

    setMoveErrorMessage(null);
    setMoveSheetOpen(false);
    setSecondaryActionsOpen(false);
    setSelectedMoveTarget(result.target);
    setPendingAlbumName('');
    setSecondaryFeedback({
      tone: 'success',
      message: `Moved to ${result.target.label}`,
    });
  };

  const openMoveFlow = () => {
    setSecondaryActionsOpen(false);
    setMoveErrorMessage(null);
    setPendingAlbumName('');
    setMoveSheetOpen(true);
    void loadMoveTargets();
  };

  const handleUndo = () => {
    undoLastAction();
    triggerInteractionFeedback('undo', settings.hapticsEnabled);
  };

  const busy = isDeleting || isMoving;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="light" />
      <View style={styles.backgroundGlowA} />
      <View style={styles.backgroundGlowB} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.queueTitle}>Queue</Text>
          <Pressable android_disableSound={!settings.soundEnabled} onPress={() => router.push(ROUTES.settings)}>
            <Text style={styles.settingsLink}>Settings</Text>
          </Pressable>
        </View>

        <ProgressHeader
          reviewedCount={sessionStats.reviewedCount}
          remainingCount={remainingCount}
          pendingQueueCount={pendingQueueCount}
          visibleQueueCount={visibleQueueCount}
          storageFreedBytes={sessionStats.storageFreedBytes}
          targetCount={targetCount}
          sessionLabel={sessionLabel}
          sortLabel={sortLabel}
          newSinceLastScanCount={newSinceLastScanCount}
          isScanning={scanState === 'scanning'}
          scanProgressLoaded={scanProgressLoaded}
          scanProgressTotal={scanProgressTotal}
        />

        <FilterChipRow activeFilter={activeFilter} chips={filterChips} onSelect={(filter) => setActiveFilter(filter)} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortRow}>
          {SORT_OPTIONS.map((option) => {
            const selected = option === sortMode;

            return (
              <Pressable
                key={option}
                accessibilityRole="button"
                android_disableSound={!settings.soundEnabled}
                onPress={() => setSortMode(option)}
                style={[styles.sortChip, selected && styles.sortChipSelected]}
              >
                <Text style={[styles.sortChipLabel, selected && styles.sortChipLabelSelected]}>{getSortLabel(option)}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {activeMilestone ? <MilestoneBanner milestone={activeMilestone} /> : null}

        {permissionMissing ? (
          <PermissionPanel blocked={blocked} onRetry={() => void retryPermission()} onOpenSettings={() => void Linking.openSettings()} />
        ) : currentFile ? (
          <>
            <View style={styles.scanRow}>
              <Text style={styles.scanText}>
                {scanState === 'scanning'
                  ? scanMode === 'rescan'
                    ? `Re-scanning in background${scanProgressTotal ? ` / ${scanProgressLoaded}/${scanProgressTotal}` : ` / ${scanProgressLoaded}`}`
                    : `Scanning in background${scanProgressTotal ? ` / ${scanProgressLoaded}/${scanProgressTotal}` : ` / ${scanProgressLoaded}`}`
                  : newSinceLastScanCount > 0
                    ? `${newSinceLastScanCount} new since last scan`
                    : 'Queue is live'}
              </Text>
              {scanError ? <Text style={styles.scanError}>{scanError}</Text> : null}
            </View>
            {rescanStatusLabel ? (
              <View style={styles.rescanInfoCard}>
                <Text style={styles.rescanInfoTitle}>{rescanStatusLabel}</Text>
                <Text style={styles.rescanInfoBody}>Known photos stay matched to their earlier review state while this pass runs.</Text>
              </View>
            ) : null}
            {!rescanStatusLabel && lastRescanSummary ? (
              <View style={styles.rescanInfoCard}>
                <Text style={styles.rescanInfoTitle}>
                  Last re-scan added {lastRescanSummary.newFileCount} new photo{lastRescanSummary.newFileCount === 1 ? '' : 's'}
                </Text>
                <Text style={styles.rescanInfoBody}>
                  {lastRescanSummary.protectedReviewedCount} reviewed item{lastRescanSummary.protectedReviewedCount === 1 ? '' : 's'} stayed protected. {formatDateTime(lastRescanSummary.completedAt)}
                </Text>
              </View>
            ) : null}
            {secondaryFeedback ? (
              <View style={[styles.secondaryFeedbackCard, secondaryFeedback.tone === 'error' && styles.secondaryFeedbackCardError]}>
                <Text style={styles.secondaryFeedbackText}>{secondaryFeedback.message}</Text>
              </View>
            ) : null}
            <View style={styles.cardWrap}>
              <FileCard
                current={currentFile}
                nextItems={nextItems}
                disabled={busy}
                showHints={settings.showGestureHints && sessionStats.reviewedCount < 3}
                onPress={openPreview}
                onKeepGesture={keepCurrent}
                onDeleteGesture={() => setDeleteSheetOpen(true)}
                onOpenSecondaryActions={openSecondaryActions}
              />
            </View>
            <ActionDock
              onDelete={() => setDeleteSheetOpen(true)}
              onKeep={keepCurrent}
              onSkip={skipCurrent}
              onUndo={topUndoEntry ? handleUndo : undefined}
              undoCount={undoEntries.length}
              disabled={busy}
            />
          </>
        ) : filterEmpty ? (
          <View style={styles.emptyWrap}>
            <EmptyState
              title={`No ${activeFilterLabel.toLowerCase()} cards left`}
              body="Try another filter or switch back to all photos to keep the session moving."
              actionLabel="Show all photos"
              onAction={() => setActiveFilter('all' as FilterType)}
            />
          </View>
        ) : scanState === 'scanning' ? (
          <View style={styles.emptyWrap}>
            <View style={styles.scanLoadingCard}>
              <Text style={styles.scanLoadingEyebrow}>{scanMode === 'rescan' ? 'Re-scan in progress' : 'Scan in progress'}</Text>
              <Text style={styles.scanLoadingTitle}>{scanProgressLabel}</Text>
              <Text style={styles.scanLoadingBody}>
                {scanMode === 'rescan'
                  ? 'We are checking the library again and only adding photos we have not already matched.'
                  : 'We are building your queue now. As soon as the first photo is ready, it will replace this panel.'}
              </Text>
              <View style={styles.scanProgressTrack}>
                <View style={[styles.scanProgressFill, { width: `${scanProgressRatio * 100}%` }]} />
              </View>
              <Text style={styles.scanLoadingHint}>
                {scanProgressTotal ? `${Math.round(scanProgressRatio * 100)}% complete` : 'This can take longer on larger libraries.'}
              </Text>
              <View style={styles.scanLoadingActions}>
                <Button label="Restart scan" onPress={requestRescan} variant="secondary" />
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.emptyWrap}>
            <EmptyState title="No photo cards ready yet" body="Try a fresh scan, then come back into the queue." actionLabel="Scan again" onAction={requestRescan} />
          </View>
        )}
      </ScrollView>

      {topUndoEntry ? (
        <View style={styles.undoToastWrap}>
          <UndoToast entry={topUndoEntry} onUndo={handleUndo} />
        </View>
      ) : null}

      <Sheet visible={deleteSheetOpen} onClose={() => setDeleteSheetOpen(false)}>
        <Text style={styles.sheetTitle}>Delete this photo permanently?</Text>
        <Text style={styles.sheetBody}>
          This action only runs after you confirm it. Your storage-freed score updates only if the delete actually succeeds.
        </Text>
        {currentFile ? (
          <View style={styles.sheetContext}>
            <Text style={styles.sheetContextTitle}>{currentFile.name}</Text>
            <Text style={styles.sheetContextBody}>
              {formatCompactDate(currentFile.createdAt)} / {formatBytes(currentFile.sizeBytes)}
            </Text>
          </View>
        ) : null}
        <View style={styles.sheetActions}>
          <Button label="Cancel" onPress={() => setDeleteSheetOpen(false)} variant="secondary" />
          <Button label={isDeleting ? 'Deleting...' : 'Delete permanently'} onPress={() => void confirmDelete()} variant="danger" disabled={busy} />
        </View>
      </Sheet>

      <SecondaryActionsSheet
        visible={secondaryActionsOpen}
        fileName={currentFile?.name}
        onClose={() => setSecondaryActionsOpen(false)}
        onMove={openMoveFlow}
        onShare={() => {
          setSecondaryActionsOpen(false);
          void shareCurrent();
        }}
      />

      <MoveDestinationSheet
        visible={moveSheetOpen}
        selectedTarget={selectedMoveTarget}
        recentTargets={recentMoveTargets}
        availableTargets={availableMoveTargets}
        pendingAlbumName={pendingAlbumName}
        isLoadingTargets={loadingMoveTargets}
        isMoving={isMoving}
        errorMessage={moveErrorMessage}
        onClose={() => setMoveSheetOpen(false)}
        onPendingAlbumNameChange={setPendingAlbumName}
        onSelectTarget={(target) => {
          setSelectedMoveTarget(target);
          setPendingAlbumName(target.isNew ? target.albumName : '');
          setMoveErrorMessage(null);
        }}
        onConfirmMove={() => void confirmMove()}
      />

      <PhotoPreviewModal
        visible={previewOpen}
        file={currentFile}
        isDeleting={isDeleting}
        animationsEnabled={settings.animationsEnabled}
        soundEnabled={settings.soundEnabled}
        onClose={() => setPreviewOpen(false)}
        onKeep={handlePreviewKeep}
        onSkip={handlePreviewSkip}
        onDelete={handlePreviewDelete}
        onShare={() => void shareCurrent()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.stage,
  },
  backgroundGlowA: {
    position: 'absolute',
    top: 40,
    right: -30,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: colors.stageGlow,
  },
  backgroundGlowB: {
    position: 'absolute',
    bottom: 120,
    left: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(243,180,63,0.1)',
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
    minHeight: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  queueTitle: {
    color: colors.white,
    fontFamily: typography.display,
    fontSize: 34,
  },
  settingsLink: {
    color: 'rgba(249,250,251,0.84)',
    fontFamily: typography.medium,
    fontSize: 15,
  },
  scanRow: {
    minHeight: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  scanText: {
    color: 'rgba(249,250,251,0.78)',
    fontFamily: typography.body,
    fontSize: 14,
  },
  scanError: {
    color: '#FFC2B4',
    fontFamily: typography.medium,
    fontSize: 13,
  },
  rescanInfoCard: {
    borderRadius: radius.md,
    backgroundColor: 'rgba(243,180,63,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(243,180,63,0.28)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 4,
  },
  rescanInfoTitle: {
    color: colors.white,
    fontFamily: typography.bold,
    fontSize: 14,
  },
  rescanInfoBody: {
    color: 'rgba(249,250,251,0.8)',
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 20,
  },
  secondaryFeedbackCard: {
    borderRadius: radius.md,
    backgroundColor: 'rgba(46,194,126,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(46,194,126,0.3)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  secondaryFeedbackCardError: {
    backgroundColor: 'rgba(231,111,81,0.16)',
    borderColor: 'rgba(231,111,81,0.3)',
  },
  secondaryFeedbackText: {
    color: colors.white,
    fontFamily: typography.medium,
    fontSize: 14,
    lineHeight: 21,
  },
  cardWrap: {
    flex: 1,
    minHeight: 460,
  },
  emptyWrap: {
    flex: 1,
    minHeight: 500,
    justifyContent: 'center',
  },
  scanLoadingCard: {
    borderRadius: radius.lg,
    backgroundColor: colors.cardGlass,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    padding: spacing.xl,
    gap: spacing.md,
  },
  scanLoadingEyebrow: {
    color: 'rgba(249,250,251,0.7)',
    fontFamily: typography.medium,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  scanLoadingTitle: {
    color: colors.white,
    fontFamily: typography.display,
    fontSize: 30,
    lineHeight: 36,
  },
  scanLoadingBody: {
    color: 'rgba(249,250,251,0.82)',
    fontFamily: typography.body,
    fontSize: 16,
    lineHeight: 24,
  },
  scanProgressTrack: {
    height: 10,
    borderRadius: radius.pill,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  scanProgressFill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: '#F3B43F',
  },
  scanLoadingHint: {
    color: 'rgba(249,250,251,0.7)',
    fontFamily: typography.medium,
    fontSize: 13,
  },
  scanLoadingActions: {
    marginTop: spacing.xs,
  },
  sortRow: {
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  sortChip: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  sortChipSelected: {
    backgroundColor: 'rgba(60,145,230,0.28)',
  },
  sortChipLabel: {
    color: 'rgba(249,250,251,0.78)',
    fontFamily: typography.medium,
    fontSize: 13,
  },
  sortChipLabelSelected: {
    color: colors.white,
  },
  undoToastWrap: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  sheetTitle: {
    color: colors.ink,
    fontFamily: typography.display,
    fontSize: 28,
  },
  sheetBody: {
    color: colors.mutedInk,
    fontFamily: typography.body,
    fontSize: 16,
    lineHeight: 24,
  },
  sheetContext: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 4,
  },
  sheetContextTitle: {
    color: colors.ink,
    fontFamily: typography.bold,
    fontSize: 15,
  },
  sheetContextBody: {
    color: colors.mutedInk,
    fontFamily: typography.body,
    fontSize: 14,
  },
  sheetActions: {
    gap: spacing.sm,
  },
});

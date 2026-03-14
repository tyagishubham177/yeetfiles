import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Image, Linking, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useShallow } from 'zustand/react/shallow';

import { ActionDock } from '../../src/components/review/action-dock';
import { EmptyState } from '../../src/components/review/empty-state';
import { FileCard } from '../../src/components/review/file-card';
import { FilterChipRow } from '../../src/components/review/filter-chip-row';
import { GestureTutorialCard } from '../../src/components/review/gesture-tutorial-card';
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
import { useAppTheme } from '../../src/lib/theme';
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

const SORT_OPTIONS: SortMode[] = ['smart', 'oldest_first', 'newest_first', 'largest_first', 'random'];

export default function QueueScreen() {
  const router = useRouter();
  useScanBootstrap();
  const { colors, isNightMode } = useAppTheme();

  const currentFile = useAppStore(selectCurrentFile);
  const nextItems = useAppStore(useShallow(selectNextStackItems));
  const permissionState = useAppStore((state) => state.permissionState);
  const lowStorageWarning = useAppStore((state) => state.lowStorageWarning);
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
  const markGestureTutorialSeen = useAppStore((state) => state.markGestureTutorialSeen);
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
  const showTutorialCard = Boolean(currentFile && !settings.hasSeenGestureTutorial && sessionStats.reviewedCount === 0);
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

  useEffect(() => {
    const uris = [currentFile?.previewUri, ...nextItems.map((item) => item.previewUri)].filter(Boolean) as string[];

    uris.forEach((uri) => {
      void Image.prefetch(uri).catch(() => null);
    });
  }, [currentFile?.previewUri, nextItems]);

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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.stage }]} edges={['top', 'bottom']}>
      <StatusBar style="light" />
      <View style={[styles.backgroundGlowA, { backgroundColor: colors.stageGlow }]} />
      <View style={[styles.backgroundGlowB, { backgroundColor: isNightMode ? 'rgba(217,162,59,0.05)' : 'rgba(243,180,63,0.1)' }]} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={[styles.queueTitle, { color: colors.white }]}>Queue</Text>
          <Pressable android_disableSound={!settings.soundEnabled} onPress={() => router.push(ROUTES.settings)}>
            <Text style={[styles.settingsLink, { color: isNightMode ? 'rgba(245,247,250,0.78)' : 'rgba(249,250,251,0.84)' }]}>Settings</Text>
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
                style={[
                  styles.sortChip,
                  { backgroundColor: isNightMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.06)' },
                  selected && { backgroundColor: isNightMode ? 'rgba(76,151,232,0.2)' : 'rgba(60,145,230,0.28)' },
                ]}
              >
                <Text style={[styles.sortChipLabel, { color: selected ? colors.white : isNightMode ? 'rgba(245,247,250,0.72)' : 'rgba(249,250,251,0.78)' }]}>
                  {getSortLabel(option)}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {activeMilestone ? <MilestoneBanner milestone={activeMilestone} /> : null}
        {lowStorageWarning ? (
          <View
            style={[
              styles.rescanInfoCard,
              {
                backgroundColor: isNightMode ? 'rgba(221,115,89,0.12)' : 'rgba(231,111,81,0.14)',
                borderColor: isNightMode ? 'rgba(221,115,89,0.18)' : 'rgba(231,111,81,0.22)',
              },
            ]}
          >
            <Text style={[styles.rescanInfoTitle, { color: colors.white }]}>Storage is getting tight</Text>
            <Text style={[styles.rescanInfoBody, { color: isNightMode ? 'rgba(245,247,250,0.76)' : 'rgba(249,250,251,0.8)' }]}>
              About {formatBytes(lowStorageWarning.freeBytes)} free right now. This is a good time for a short cleanup pass.
            </Text>
          </View>
        ) : null}

        {permissionMissing ? (
          <PermissionPanel blocked={blocked} onRetry={() => void retryPermission()} onOpenSettings={() => void Linking.openSettings()} />
        ) : currentFile ? (
          <>
            <View style={styles.scanRow}>
              <Text style={[styles.scanText, { color: isNightMode ? 'rgba(245,247,250,0.72)' : 'rgba(249,250,251,0.78)' }]}>
                {scanState === 'scanning'
                  ? scanMode === 'rescan'
                    ? `Re-scanning in background${scanProgressTotal ? ` / ${scanProgressLoaded}/${scanProgressTotal}` : ` / ${scanProgressLoaded}`}`
                    : `Scanning in background${scanProgressTotal ? ` / ${scanProgressLoaded}/${scanProgressTotal}` : ` / ${scanProgressLoaded}`}`
                  : newSinceLastScanCount > 0
                    ? `${newSinceLastScanCount} new since last scan`
                    : 'Queue is live'}
              </Text>
              {scanError ? <Text style={[styles.scanError, { color: isNightMode ? '#F2C3B8' : '#FFC2B4' }]}>{scanError}</Text> : null}
            </View>
            {rescanStatusLabel ? (
              <View
                style={[
                  styles.rescanInfoCard,
                  {
                    backgroundColor: isNightMode ? 'rgba(217,162,59,0.1)' : 'rgba(243,180,63,0.14)',
                    borderColor: isNightMode ? 'rgba(217,162,59,0.18)' : 'rgba(243,180,63,0.28)',
                  },
                ]}
              >
                <Text style={[styles.rescanInfoTitle, { color: colors.white }]}>{rescanStatusLabel}</Text>
                <Text style={[styles.rescanInfoBody, { color: isNightMode ? 'rgba(245,247,250,0.76)' : 'rgba(249,250,251,0.8)' }]}>
                  Known photos stay matched to their earlier review state while this pass runs.
                </Text>
              </View>
            ) : null}
            {!rescanStatusLabel && lastRescanSummary ? (
              <View
                style={[
                  styles.rescanInfoCard,
                  {
                    backgroundColor: isNightMode ? 'rgba(217,162,59,0.1)' : 'rgba(243,180,63,0.14)',
                    borderColor: isNightMode ? 'rgba(217,162,59,0.18)' : 'rgba(243,180,63,0.28)',
                  },
                ]}
              >
                <Text style={[styles.rescanInfoTitle, { color: colors.white }]}>
                  Last re-scan added {lastRescanSummary.newFileCount} new photo{lastRescanSummary.newFileCount === 1 ? '' : 's'}
                </Text>
                <Text style={[styles.rescanInfoBody, { color: isNightMode ? 'rgba(245,247,250,0.76)' : 'rgba(249,250,251,0.8)' }]}>
                  {lastRescanSummary.protectedReviewedCount} reviewed item{lastRescanSummary.protectedReviewedCount === 1 ? '' : 's'} stayed protected. {formatDateTime(lastRescanSummary.completedAt)}
                </Text>
              </View>
            ) : null}
            {secondaryFeedback ? (
              <View
                style={[
                  styles.secondaryFeedbackCard,
                  secondaryFeedback.tone === 'error'
                    ? {
                        backgroundColor: isNightMode ? 'rgba(221,115,89,0.12)' : 'rgba(231,111,81,0.16)',
                        borderColor: isNightMode ? 'rgba(221,115,89,0.18)' : 'rgba(231,111,81,0.3)',
                      }
                    : {
                        backgroundColor: isNightMode ? 'rgba(42,185,119,0.12)' : 'rgba(46,194,126,0.16)',
                        borderColor: isNightMode ? 'rgba(42,185,119,0.18)' : 'rgba(46,194,126,0.3)',
                      },
                ]}
              >
                <Text style={[styles.secondaryFeedbackText, { color: colors.white }]}>{secondaryFeedback.message}</Text>
              </View>
            ) : null}
            <View style={styles.cardWrap}>
              {showTutorialCard ? (
                <GestureTutorialCard onContinue={markGestureTutorialSeen} />
              ) : (
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
              )}
            </View>
            {showTutorialCard ? null : (
              <ActionDock
                onDelete={() => setDeleteSheetOpen(true)}
                onKeep={keepCurrent}
                onSkip={skipCurrent}
                onUndo={topUndoEntry ? handleUndo : undefined}
                undoCount={undoEntries.length}
                disabled={busy}
              />
            )}
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
            <View
              style={[
                styles.scanLoadingCard,
                {
                  backgroundColor: colors.cardGlass,
                  borderColor: isNightMode ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.09)',
                },
              ]}
            >
              <Text style={[styles.scanLoadingEyebrow, { color: isNightMode ? 'rgba(245,247,250,0.66)' : 'rgba(249,250,251,0.7)' }]}>
                {scanMode === 'rescan' ? 'Re-scan in progress' : 'Scan in progress'}
              </Text>
              <Text style={[styles.scanLoadingTitle, { color: colors.white }]}>{scanProgressLabel}</Text>
              <Text style={[styles.scanLoadingBody, { color: isNightMode ? 'rgba(245,247,250,0.76)' : 'rgba(249,250,251,0.82)' }]}>
                {scanMode === 'rescan'
                  ? 'We are checking the library again and only adding photos we have not already matched.'
                  : 'We are building your queue now. As soon as the first photo is ready, it will replace this panel.'}
              </Text>
              <View style={[styles.scanProgressTrack, { backgroundColor: isNightMode ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.08)' }]}>
                <View style={[styles.scanProgressFill, { width: `${scanProgressRatio * 100}%`, backgroundColor: colors.highlight }]} />
              </View>
              <Text style={[styles.scanLoadingHint, { color: isNightMode ? 'rgba(245,247,250,0.64)' : 'rgba(249,250,251,0.7)' }]}>
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
        <Text style={[styles.sheetTitle, { color: colors.ink }]}>Delete this photo permanently?</Text>
        <Text style={[styles.sheetBody, { color: colors.mutedInk }]}>
          This action only runs after you confirm it. Your storage-freed score updates only if the delete actually succeeds.
        </Text>
        {currentFile ? (
          <View style={[styles.sheetContext, { backgroundColor: colors.surfaceMuted }]}>
            <Text style={[styles.sheetContextTitle, { color: colors.ink }]}>{currentFile.name}</Text>
            <Text style={[styles.sheetContextBody, { color: colors.mutedInk }]}>
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
  },
  backgroundGlowA: {
    position: 'absolute',
    top: 40,
    right: -30,
    width: 180,
    height: 180,
    borderRadius: 90,
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
    fontFamily: typography.display,
    fontSize: 34,
  },
  settingsLink: {
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
    fontFamily: typography.body,
    fontSize: 14,
  },
  scanError: {
    fontFamily: typography.medium,
    fontSize: 13,
  },
  rescanInfoCard: {
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 4,
  },
  rescanInfoTitle: {
    fontFamily: typography.bold,
    fontSize: 14,
  },
  rescanInfoBody: {
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 20,
  },
  secondaryFeedbackCard: {
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  secondaryFeedbackText: {
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
    borderWidth: 1,
    padding: spacing.xl,
    gap: spacing.md,
  },
  scanLoadingEyebrow: {
    fontFamily: typography.medium,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  scanLoadingTitle: {
    fontFamily: typography.display,
    fontSize: 30,
    lineHeight: 36,
  },
  scanLoadingBody: {
    fontFamily: typography.body,
    fontSize: 16,
    lineHeight: 24,
  },
  scanProgressTrack: {
    height: 10,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  scanProgressFill: {
    height: '100%',
    borderRadius: radius.pill,
  },
  scanLoadingHint: {
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
  },
  sortChipLabel: {
    fontFamily: typography.medium,
    fontSize: 13,
  },
  undoToastWrap: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  sheetTitle: {
    fontFamily: typography.display,
    fontSize: 28,
  },
  sheetBody: {
    fontFamily: typography.body,
    fontSize: 16,
    lineHeight: 24,
  },
  sheetContext: {
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 4,
  },
  sheetContextTitle: {
    fontFamily: typography.bold,
    fontSize: 15,
  },
  sheetContextBody: {
    fontFamily: typography.body,
    fontSize: 14,
  },
  sheetActions: {
    gap: spacing.sm,
  },
});

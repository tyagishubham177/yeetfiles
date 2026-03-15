import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Image, Linking, Pressable, RefreshControl, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useShallow } from 'zustand/react/shallow';

import { QueueErrorBoundary } from '../../src/components/feedback/queue-error-boundary';
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
import { StatusBanner } from '../../src/components/feedback/status-banner';
import { Button } from '../../src/components/ui/button';
import { ROUTES } from '../../src/constants/routes';
import { radius, spacing, typography } from '../../src/constants/ui-tokens';
import { triggerInteractionFeedback } from '../../src/features/feedback/interaction-feedback';
import { requestMediaPermissionState, MEDIA_PERMISSION_BLOCKED_HELP } from '../../src/features/permissions/permission-service';
import { useDeleteFlow } from '../../src/hooks/queue/use-delete-flow';
import { useDirectDeleteStatus } from '../../src/hooks/queue/use-direct-delete-status';
import { useMoveFlow } from '../../src/hooks/queue/use-move-flow';
import { useScanProgress } from '../../src/hooks/queue/use-scan-progress';
import { useReviewActions } from '../../src/hooks/use-review-actions';
import { useScanBootstrap } from '../../src/hooks/use-scan-bootstrap';
import { formatBytes, formatDateTime } from '../../src/lib/format';
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
import type { FilterType, SortMode } from '../../src/types/file-item';

const SORT_OPTIONS: SortMode[] = ['random', 'largest_first', 'oldest_first', 'newest_first'];

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
  const lastCompletedScanAt = useAppStore((state) => state.lastCompletedScanAt);
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
  const [secondaryActionsOpen, setSecondaryActionsOpen] = useState(false);
  const [isCheckingPermission, setIsCheckingPermission] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<{ tone: 'info' | 'success' | 'error'; message: string } | null>(null);
  const directDeleteStatus = useDirectDeleteStatus();
  const { scanProgressRatio, scanProgressLabel } = useScanProgress(scanProgressLoaded, scanProgressTotal);
  const {
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
  } = useMoveFlow({
    moveCurrent,
    onStatusChange: setStatusFeedback,
  });
  const { requestDelete } = useDeleteFlow({
    busy: isDeleting || isMoving,
    currentFileId: currentFile?.id,
    deleteCurrent,
    onStatusChange: setStatusFeedback,
  });

  useEffect(() => {
    if (sessionSummary) {
      router.replace(ROUTES.summary);
    }
  }, [router, sessionSummary]);

  useEffect(() => {
    if (sortMode === 'smart') {
      setSortMode('random');
    }
  }, [setSortMode, sortMode]);

  const remainingCount = useMemo(() => {
    if (!targetCount) {
      return 0;
    }

    return Math.max(targetCount - sessionStats.reviewedCount, 0);
  }, [sessionStats.reviewedCount, targetCount]);

  const blocked = permissionState === 'blocked';
  const permissionMissing = permissionState === 'denied' || permissionState === 'blocked';
  const sessionLabel = getQuickSessionLabel((targetCount as 10 | 25 | 50 | null) ?? 10);
  const sortLabel = getSortLabel(sortMode);
  const filterEmpty = !currentFile && visibleQueueCount === 0 && pendingQueueCount > 0 && activeFilter !== 'all';
  const libraryEmpty = !currentFile && pendingQueueCount === 0 && scanState !== 'scanning' && Boolean(lastCompletedScanAt);
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
    if (!statusFeedback) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setStatusFeedback(null);
    }, 3200);

    return () => clearTimeout(timeoutId);
  }, [statusFeedback]);

  useEffect(() => {
    const uris = [currentFile?.previewUri, ...nextItems.map((item) => item.previewUri)].filter(Boolean) as string[];

    uris.forEach((uri) => {
      void Image.prefetch(uri).catch(() => null);
    });
  }, [currentFile?.previewUri, nextItems]);

  const retryPermission = async () => {
    setIsCheckingPermission(true);
    setStatusFeedback({
      tone: 'info',
      message: 'Checking photo access and preparing a fresh queue...',
    });

    try {
      const nextPermissionState = await requestMediaPermissionState();
      setPermissionState(nextPermissionState);

      if (nextPermissionState === 'blocked') {
        setStatusFeedback({
          tone: 'error',
          message: 'Photo access is blocked in system settings right now.',
        });
        Alert.alert('Media permission blocked', MEDIA_PERMISSION_BLOCKED_HELP);
        return;
      }

      setStatusFeedback({
        tone: 'success',
        message: 'Photo access granted. YeetFiles is building the queue now.',
      });
    } finally {
      setIsCheckingPermission(false);
    }
  };

  const openPreview = () => {
    if (!currentFile) {
      return;
    }

    recordPreviewOpen(currentFile.id, 'modal');
    void triggerInteractionFeedback('preview_open', settings.hapticsEnabled);
    setPreviewOpen(true);
  };

  const handlePreviewKeep = () => {
    setPreviewOpen(false);
    keepCurrent('modal');
  };

  const handlePreviewSkip = () => {
    setPreviewOpen(false);
    skipCurrent('modal');
  };

  const handlePreviewDelete = () => {
    void requestDelete('modal');
  };

  const shareCurrent = async () => {
    if (!currentFile || isSharing) {
      return;
    }

    setIsSharing(true);
    setStatusFeedback({
      tone: 'info',
      message: 'Opening the native share sheet...',
    });

    try {
      await Share.share({
        title: currentFile.name,
        message: currentFile.name,
        url: currentFile.uri,
      });
      setStatusFeedback({
        tone: 'success',
        message: 'Share sheet opened.',
      });
    } catch {
      setStatusFeedback({
        tone: 'error',
        message: 'We could not open the native share sheet for this photo.',
      });
      Alert.alert('Share unavailable', 'We could not open the native share sheet for this photo.');
    } finally {
      setIsSharing(false);
    }
  };

  const openSecondaryActions = () => {
    if (!currentFile || isDeleting || isMoving) {
      return;
    }

    setSecondaryActionsOpen(true);
  };

  const openSecondaryMoveFlow = () => {
    setSecondaryActionsOpen(false);
    openMoveFlow();
  };

  const handleUndo = () => {
    undoLastAction('undo');
    void triggerInteractionFeedback('undo', settings.hapticsEnabled);
    setStatusFeedback({
      tone: 'success',
      message: 'Last safe action undone.',
    });
  };

  const busy = isDeleting || isMoving;
  const handleRescanRequest = () => {
    setStatusFeedback({
      tone: 'info',
      message: 'Fresh scan queued. YeetFiles is rebuilding the queue in the background.',
    });
    requestRescan({
      source: 'settings',
    });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.stage }]} edges={['top', 'bottom']}>
      <StatusBar style="light" />
      <View style={[styles.backgroundGlowA, { backgroundColor: colors.stageGlow }]} />
      <View style={[styles.backgroundGlowB, { backgroundColor: isNightMode ? 'rgba(217,162,59,0.05)' : 'rgba(243,180,63,0.1)' }]} />
      <ScrollView
        contentContainerStyle={[styles.content, !showTutorialCard && currentFile ? styles.contentWithFooter : null]}
        refreshControl={
          <RefreshControl
            refreshing={scanState === 'scanning' && scanMode === 'rescan'}
            onRefresh={handleRescanRequest}
            tintColor={colors.highlight}
          />
        }
      >
        <View style={styles.headerRow}>
          <Text style={[styles.queueTitle, { color: colors.white }]}>Queue</Text>
          <Pressable
            android_disableSound={!settings.soundEnabled}
            onPress={() => router.push(ROUTES.settings)}
            style={({ pressed }) => pressed && styles.linkPressed}
          >
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
                style={({ pressed }) => [
                  styles.sortChip,
                  { backgroundColor: isNightMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.06)' },
                  selected && { backgroundColor: isNightMode ? 'rgba(76,151,232,0.2)' : 'rgba(60,145,230,0.28)' },
                  pressed && styles.pressedChip,
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
        {statusFeedback ? <StatusBanner message={statusFeedback.message} tone={statusFeedback.tone} /> : null}

        <QueueErrorBoundary>
          {permissionMissing ? (
            <PermissionPanel blocked={blocked} isRetrying={isCheckingPermission} onRetry={() => void retryPermission()} onOpenSettings={() => void Linking.openSettings()} />
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
              {directDeleteStatus !== 'unavailable' ? (
                <Pressable
                  android_disableSound={!settings.soundEnabled}
                  onPress={() => router.push(ROUTES.settings)}
                  style={({ pressed }) => [
                    styles.directDeleteBanner,
                    {
                      backgroundColor:
                        directDeleteStatus === 'ready'
                          ? isNightMode
                            ? 'rgba(76,151,232,0.14)'
                            : 'rgba(60,145,230,0.18)'
                          : isNightMode
                            ? 'rgba(221,115,89,0.12)'
                            : 'rgba(231,111,81,0.14)',
                      borderColor:
                        directDeleteStatus === 'ready'
                          ? isNightMode
                            ? 'rgba(76,151,232,0.24)'
                            : 'rgba(60,145,230,0.28)'
                          : isNightMode
                            ? 'rgba(221,115,89,0.2)'
                            : 'rgba(231,111,81,0.22)',
                    },
                    pressed && styles.linkPressed,
                  ]}
                >
                  <Text style={[styles.rescanInfoTitle, { color: colors.white }]}>
                    {directDeleteStatus === 'ready' ? 'Direct delete is active' : 'Android delete popup is still active'}
                  </Text>
                  <Text style={[styles.rescanInfoBody, { color: isNightMode ? 'rgba(245,247,250,0.76)' : 'rgba(249,250,251,0.8)' }]}>
                    {directDeleteStatus === 'ready'
                      ? 'Deletes should go straight through without the extra confirmation.'
                      : 'Open Settings to check special access or confirm this build includes the native delete engine.'}
                  </Text>
                </Pressable>
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
                    onKeepGesture={() => keepCurrent('swipe')}
                    onDeleteGesture={() => void requestDelete('swipe')}
                    onOpenSecondaryActions={openSecondaryActions}
                  />
                )}
              </View>
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
                  <Button label="Restart scan" onPress={handleRescanRequest} variant="secondary" />
                </View>
              </View>
            </View>
          ) : libraryEmpty ? (
            <View style={styles.emptyWrap}>
              <EmptyState
                title="No photos found right now"
                body="Your library looks clear or currently unavailable. Pull to refresh later if you add new photos outside the app."
                actionLabel="Open Settings"
                onAction={() => router.push(ROUTES.settings)}
              />
            </View>
          ) : (
            <View style={styles.emptyWrap}>
              <EmptyState title="No photo cards ready yet" body="Try a fresh scan, then come back into the queue." actionLabel="Scan again" onAction={handleRescanRequest} />
            </View>
          )}
        </QueueErrorBoundary>
      </ScrollView>

      {topUndoEntry ? (
        <View style={[styles.undoToastWrap, currentFile && !showTutorialCard ? styles.undoToastWithDock : null]}>
          <UndoToast entry={topUndoEntry} onUndo={handleUndo} />
        </View>
      ) : null}

      {currentFile && !showTutorialCard ? (
        <View style={styles.footerDock}>
          <ActionDock
            onDelete={() => void requestDelete('dock')}
            onKeep={() => keepCurrent('dock')}
            onSkip={() => skipCurrent('dock')}
            onUndo={topUndoEntry ? handleUndo : undefined}
            undoCount={undoEntries.length}
            disabled={busy}
          />
        </View>
      ) : null}

      <SecondaryActionsSheet
        visible={secondaryActionsOpen}
        fileName={currentFile?.name}
        onClose={() => setSecondaryActionsOpen(false)}
        onMove={openSecondaryMoveFlow}
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
        onClose={() => closeMoveFlow()}
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
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    gap: spacing.md,
    minHeight: '100%',
  },
  contentWithFooter: {
    paddingBottom: 176,
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
  linkPressed: {
    opacity: 0.72,
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
  directDeleteBanner: {
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 4,
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
  pressedChip: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  sortChipLabel: {
    fontFamily: typography.medium,
    fontSize: 13,
  },
  undoToastWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  undoToastWithDock: {
    bottom: 116,
  },
  footerDock: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.md,
  },
});

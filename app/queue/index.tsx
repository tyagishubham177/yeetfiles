import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionDock } from '../../src/components/review/action-dock';
import { EmptyState } from '../../src/components/review/empty-state';
import { FileCard } from '../../src/components/review/file-card';
import { PermissionPanel } from '../../src/components/review/permission-panel';
import { ProgressHeader } from '../../src/components/review/progress-header';
import { Button } from '../../src/components/ui/button';
import { Sheet } from '../../src/components/ui/sheet';
import { ROUTES } from '../../src/constants/routes';
import { colors, radius, spacing, typography } from '../../src/constants/ui-tokens';
import { requestMediaPermissionState } from '../../src/features/permissions/permission-service';
import { useReviewActions } from '../../src/hooks/use-review-actions';
import { useScanBootstrap } from '../../src/hooks/use-scan-bootstrap';
import { formatBytes, formatCompactDate } from '../../src/lib/format';
import { selectCurrentFile, selectNextStackItems, selectPendingQueueCount, useAppStore } from '../../src/store/app-store';

export default function QueueScreen() {
  const router = useRouter();
  useScanBootstrap();

  const currentFile = useAppStore(selectCurrentFile);
  const nextItems = useAppStore(selectNextStackItems);
  const pendingQueueCount = useAppStore(selectPendingQueueCount);
  const permissionState = useAppStore((state) => state.permissionState);
  const sessionStats = useAppStore((state) => state.sessionStats);
  const sessionSummary = useAppStore((state) => state.sessionSummary);
  const scanState = useAppStore((state) => state.scanState);
  const scanProgressLoaded = useAppStore((state) => state.scanProgressLoaded);
  const scanProgressTotal = useAppStore((state) => state.scanProgressTotal);
  const scanError = useAppStore((state) => state.scanError);
  const targetCount = useAppStore((state) => state.targetCount);
  const setPermissionState = useAppStore((state) => state.setPermissionState);
  const requestRescan = useAppStore((state) => state.requestRescan);
  const recordPreviewOpen = useAppStore((state) => state.recordPreviewOpen);
  const settings = useAppStore((state) => state.settings);
  const { keepCurrent, skipCurrent, deleteCurrent, isDeleting } = useReviewActions();

  const [previewOpen, setPreviewOpen] = useState(false);
  const [deleteSheetOpen, setDeleteSheetOpen] = useState(false);

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

  const blocked = permissionState === 'blocked';
  const permissionMissing = permissionState === 'denied' || permissionState === 'blocked';

  const retryPermission = async () => {
    const nextPermissionState = await requestMediaPermissionState();
    setPermissionState(nextPermissionState);
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
    setPreviewOpen(true);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="light" />
      <View style={styles.backgroundGlowA} />
      <View style={styles.backgroundGlowB} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.queueTitle}>Queue</Text>
          <Pressable onPress={() => router.push(ROUTES.settings)}>
            <Text style={styles.settingsLink}>Settings</Text>
          </Pressable>
        </View>

        <ProgressHeader
          reviewedCount={sessionStats.reviewedCount}
          remainingCount={remainingCount}
          pendingQueueCount={pendingQueueCount}
          storageFreedBytes={sessionStats.storageFreedBytes}
          targetCount={targetCount}
          isScanning={scanState === 'scanning'}
          scanProgressLoaded={scanProgressLoaded}
          scanProgressTotal={scanProgressTotal}
        />

        {permissionMissing ? (
          <PermissionPanel blocked={blocked} onRetry={() => void retryPermission()} onOpenSettings={() => void Linking.openSettings()} />
        ) : currentFile ? (
          <>
            <View style={styles.scanRow}>
              <Text style={styles.scanText}>
                {scanState === 'scanning'
                  ? `Scanning in background${scanProgressTotal ? ` · ${scanProgressLoaded}/${scanProgressTotal}` : ` · ${scanProgressLoaded}`}`
                  : 'Queue is live'}
              </Text>
              {scanError ? <Text style={styles.scanError}>{scanError}</Text> : null}
            </View>
            <View style={styles.cardWrap}>
              <FileCard
                current={currentFile}
                nextItems={nextItems}
                disabled={isDeleting}
                showHints={settings.showGestureHints && sessionStats.reviewedCount < 3}
                onPress={openPreview}
                onKeepGesture={keepCurrent}
                onDeleteGesture={() => setDeleteSheetOpen(true)}
              />
            </View>
            <ActionDock onDelete={() => setDeleteSheetOpen(true)} onKeep={keepCurrent} onSkip={skipCurrent} disabled={isDeleting} />
          </>
        ) : scanState === 'scanning' ? (
          <View style={styles.emptyWrap}>
            <EmptyState
              title="Pulling in your first cards"
              body="The first real photo should appear before the full scan ends. Keep this screen open for a few seconds."
            />
          </View>
        ) : (
          <View style={styles.emptyWrap}>
            <EmptyState title="No photo cards ready yet" body="Try a fresh scan, then come back into the queue." actionLabel="Scan again" onAction={requestRescan} />
          </View>
        )}
      </ScrollView>

      <Sheet visible={deleteSheetOpen} onClose={() => setDeleteSheetOpen(false)}>
        <Text style={styles.sheetTitle}>Delete this photo permanently?</Text>
        <Text style={styles.sheetBody}>
          This action only runs after you confirm it. Your storage-freed score updates only if the delete actually succeeds.
        </Text>
        {currentFile ? (
          <View style={styles.sheetContext}>
            <Text style={styles.sheetContextTitle}>{currentFile.name}</Text>
            <Text style={styles.sheetContextBody}>
              {formatCompactDate(currentFile.createdAt)} · {formatBytes(currentFile.sizeBytes)}
            </Text>
          </View>
        ) : null}
        <View style={styles.sheetActions}>
          <Button label="Cancel" onPress={() => setDeleteSheetOpen(false)} variant="secondary" />
          <Button label={isDeleting ? 'Deleting...' : 'Delete permanently'} onPress={() => void confirmDelete()} variant="danger" disabled={isDeleting} />
        </View>
      </Sheet>

      <Modal visible={previewOpen} animationType="fade" onRequestClose={() => setPreviewOpen(false)}>
        <View style={styles.previewWrap}>
          <SafeAreaView style={styles.previewSafeArea}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewTitle}>Preview</Text>
              <Pressable onPress={() => setPreviewOpen(false)}>
                <Text style={styles.previewClose}>Close</Text>
              </Pressable>
            </View>
            {currentFile ? (
              <>
                <View style={styles.previewCard}>
                  <FileCard
                    current={currentFile}
                    nextItems={[]}
                    disabled
                    showHints={false}
                    onPress={() => undefined}
                    onKeepGesture={() => undefined}
                    onDeleteGesture={() => undefined}
                  />
                </View>
                <View style={styles.previewMetaCard}>
                  <Text style={styles.previewMetaTitle}>{currentFile.name}</Text>
                  <Text style={styles.previewMetaBody}>{formatCompactDate(currentFile.createdAt)}</Text>
                  <Text style={styles.previewMetaBody}>{formatBytes(currentFile.sizeBytes)}</Text>
                </View>
              </>
            ) : null}
          </SafeAreaView>
        </View>
      </Modal>
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
  cardWrap: {
    flex: 1,
    minHeight: 460,
  },
  emptyWrap: {
    flex: 1,
    minHeight: 500,
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
  previewWrap: {
    flex: 1,
    backgroundColor: colors.stage,
  },
  previewSafeArea: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewTitle: {
    color: colors.white,
    fontFamily: typography.display,
    fontSize: 30,
  },
  previewClose: {
    color: 'rgba(249,250,251,0.84)',
    fontFamily: typography.medium,
    fontSize: 15,
  },
  previewCard: {
    flex: 1,
    minHeight: 420,
  },
  previewMetaCard: {
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: spacing.md,
    gap: 4,
  },
  previewMetaTitle: {
    color: colors.white,
    fontFamily: typography.bold,
    fontSize: 16,
  },
  previewMetaBody: {
    color: 'rgba(249,250,251,0.82)',
    fontFamily: typography.body,
    fontSize: 14,
  },
});

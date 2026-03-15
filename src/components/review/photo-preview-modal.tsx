import { Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { radius, spacing, typography } from '../../constants/ui-tokens';
import { formatBytes, formatDateTime, formatDimensions, formatPathContext, formatRelativeDate } from '../../lib/format';
import { useAppTheme } from '../../lib/theme';
import type { FileItem } from '../../types/file-item';
import { Button } from '../ui/button';
import { ZoomablePreviewImage } from './zoomable-preview-image';

type PhotoPreviewModalProps = {
  visible: boolean;
  file: FileItem | null;
  isDeleting: boolean;
  animationsEnabled: boolean;
  soundEnabled: boolean;
  onClose: () => void;
  onKeep: () => void;
  onSkip: () => void;
  onDelete: () => void;
  onShare: () => void;
};

type MetaRowProps = {
  label: string;
  value: string;
};

function MetaRow({ label, value }: MetaRowProps) {
  const { colors, isNightMode } = useAppTheme();

  return (
    <View style={styles.metaRow}>
      <Text style={[styles.metaLabel, { color: isNightMode ? 'rgba(245,247,250,0.7)' : 'rgba(249,250,251,0.72)' }]}>{label}</Text>
      <Text style={[styles.metaValue, { color: colors.white }]}>{value}</Text>
    </View>
  );
}

function OverlayChip({ label }: { label: string }) {
  return (
    <View style={styles.overlayChip}>
      <Text style={styles.overlayChipLabel}>{label}</Text>
    </View>
  );
}

export function PhotoPreviewModal({
  visible,
  file,
  isDeleting,
  animationsEnabled,
  soundEnabled,
  onClose,
  onKeep,
  onSkip,
  onDelete,
  onShare,
}: PhotoPreviewModalProps) {
  const { height, width } = useWindowDimensions();
  const { colors, isDark, isNightMode } = useAppTheme();
  const imageHeight = Math.max(260, Math.min(height * 0.42, width * 1.05, 420));

  return (
    <Modal visible={visible} animationType={animationsEnabled ? 'fade' : 'none'} onRequestClose={onClose}>
      <View style={[styles.wrap, { backgroundColor: colors.stage }]}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={[styles.eyebrow, { color: isNightMode ? 'rgba(245,247,250,0.7)' : 'rgba(249,250,251,0.74)' }]}>Full preview</Text>
              <Text style={[styles.title, { color: colors.white }]}>Inspect before you decide</Text>
            </View>
            <Pressable android_disableSound={!soundEnabled} onPress={onClose} style={({ pressed }) => pressed && styles.linkPressed}>
              <Text style={[styles.closeLink, { color: isNightMode ? 'rgba(245,247,250,0.84)' : 'rgba(249,250,251,0.84)' }]}>Close</Text>
            </Pressable>
          </View>

          {file ? (
            <View style={styles.content}>
              <View
                style={[
                  styles.imageCard,
                  {
                    height: imageHeight,
                    backgroundColor: isNightMode ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.06)',
                  },
                ]}
              >
                <View style={styles.overlayStackLeft}>
                  <OverlayChip label={file.albumTitle ?? 'Library'} />
                  {file.isNewSinceLastScan ? <OverlayChip label="New since last scan" /> : null}
                </View>
                <View style={styles.overlayStackRight}>
                  <OverlayChip label={formatBytes(file.sizeBytes)} />
                  <OverlayChip label={formatRelativeDate(file.createdAt)} />
                </View>
                <ZoomablePreviewImage uri={file.previewUri} height={imageHeight - spacing.md * 2} onDismiss={onClose} />
              </View>

              <ScrollView
                style={styles.detailScroll}
                contentContainerStyle={styles.detailContent}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled
                bounces={false}
              >
                <View
                  style={[
                    styles.metaCard,
                    {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.09)',
                    },
                  ]}
                >
                  <View style={styles.metaHeader}>
                    <Text style={[styles.fileName, { color: colors.white }]}>{file.name}</Text>
                    <Text
                      style={[
                        styles.bucket,
                        {
                          color: colors.white,
                          backgroundColor: isNightMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.12)',
                        },
                      ]}
                    >
                      {file.bucketType}
                    </Text>
                  </View>

                  <MetaRow label="Album" value={file.albumTitle ?? 'Other'} />
                  <MetaRow label="Captured" value={formatDateTime(file.createdAt)} />
                  <MetaRow label="Modified" value={formatDateTime(file.modifiedAt)} />
                  <MetaRow label="Dimensions" value={formatDimensions(file.width, file.height)} />
                  <MetaRow label="Size" value={formatBytes(file.sizeBytes)} />
                  <MetaRow label="Type" value={file.mimeType || 'Unknown'} />
                  <MetaRow label="Path context" value={formatPathContext(file.uri)} />
                </View>

                <View
                  style={[
                    styles.actionCard,
                    {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.09)',
                    },
                  ]}
                >
                  <Text style={[styles.actionTitle, { color: colors.white }]}>Preview actions</Text>
                  <View style={styles.actionGrid}>
                    <Button label="Keep" onPress={onKeep} compact style={styles.actionButton} />
                    <Button label="Skip" onPress={onSkip} variant="secondary" compact style={styles.actionButton} />
                    <Button label="Share" onPress={onShare} variant="secondary" compact style={styles.actionButton} />
                    <Button
                      label="Delete"
                      loading={isDeleting}
                      loadingLabel="Deleting..."
                      onPress={onDelete}
                      variant="danger"
                      compact
                      style={styles.actionButton}
                    />
                  </View>
                  <Text style={[styles.actionHint, { color: isNightMode ? 'rgba(245,247,250,0.74)' : 'rgba(249,250,251,0.78)' }]}>
                    Swipe down to dismiss. Pinch to zoom. Delete still falls back honestly if Android popup-free delete is unavailable.
                  </Text>
                </View>
              </ScrollView>
            </View>
          ) : null}
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: spacing.sm,
  },
  headerCopy: {
    flex: 1,
    gap: 2,
    paddingRight: spacing.md,
  },
  eyebrow: {
    fontFamily: typography.medium,
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: typography.display,
    fontSize: 30,
    lineHeight: 34,
  },
  closeLink: {
    fontFamily: typography.medium,
    fontSize: 15,
    paddingVertical: spacing.xs,
  },
  linkPressed: {
    opacity: 0.72,
  },
  content: {
    flex: 1,
    gap: spacing.md,
  },
  imageCard: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  overlayStackLeft: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    gap: spacing.xs,
    zIndex: 2,
  },
  overlayStackRight: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    gap: spacing.xs,
    alignItems: 'flex-end',
    zIndex: 2,
  },
  overlayChip: {
    borderRadius: radius.pill,
    backgroundColor: 'rgba(8,12,20,0.58)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  overlayChipLabel: {
    color: '#FFFFFF',
    fontFamily: typography.bold,
    fontSize: 12,
  },
  detailScroll: {
    flex: 1,
    minHeight: 0,
  },
  detailContent: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  metaCard: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  metaHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  fileName: {
    flex: 1,
    fontFamily: typography.bold,
    fontSize: 18,
  },
  bucket: {
    fontFamily: typography.medium,
    fontSize: 12,
    textTransform: 'capitalize',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  metaRow: {
    gap: 4,
  },
  metaLabel: {
    fontFamily: typography.medium,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  metaValue: {
    fontFamily: typography.body,
    fontSize: 15,
    lineHeight: 22,
  },
  actionCard: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  actionTitle: {
    fontFamily: typography.display,
    fontSize: 24,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  actionButton: {
    minWidth: 128,
    flexGrow: 1,
  },
  actionHint: {
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 22,
  },
});

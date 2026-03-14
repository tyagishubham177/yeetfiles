import { Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing, typography } from '../../constants/ui-tokens';
import { formatBytes, formatDateTime, formatDimensions, formatPathContext } from '../../lib/format';
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
  return (
    <View style={styles.metaRow}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
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
  const imageHeight = Math.max(240, Math.min(height * 0.38, width * 1.05, 360));

  return (
    <Modal visible={visible} animationType={animationsEnabled ? 'fade' : 'none'} onRequestClose={onClose}>
      <View style={styles.wrap}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.eyebrow}>Full preview</Text>
              <Text style={styles.title}>Inspect before you decide</Text>
            </View>
            <Pressable android_disableSound={!soundEnabled} onPress={onClose} style={({ pressed }) => pressed && styles.linkPressed}>
              <Text style={styles.closeLink}>Close</Text>
            </Pressable>
          </View>

          {file ? (
            <View style={styles.content}>
              <View style={[styles.imageCard, { height: imageHeight }]}>
                <ZoomablePreviewImage uri={file.previewUri} height={imageHeight - spacing.md * 2} />
              </View>

              <ScrollView
                style={styles.detailScroll}
                contentContainerStyle={styles.detailContent}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled
                bounces={false}
              >
                <View style={styles.metaCard}>
                  <View style={styles.metaHeader}>
                    <Text style={styles.fileName}>{file.name}</Text>
                    <Text style={styles.bucket}>{file.bucketType}</Text>
                  </View>

                  <MetaRow label="Album" value={file.albumTitle ?? 'Other'} />
                  <MetaRow label="Captured" value={formatDateTime(file.createdAt)} />
                  <MetaRow label="Modified" value={formatDateTime(file.modifiedAt)} />
                  <MetaRow label="Dimensions" value={formatDimensions(file.width, file.height)} />
                  <MetaRow label="Size" value={formatBytes(file.sizeBytes)} />
                  <MetaRow label="Type" value={file.mimeType || 'Unknown'} />
                  <MetaRow label="Path context" value={formatPathContext(file.uri)} />
                </View>

                <View style={styles.actionCard}>
                  <Text style={styles.actionTitle}>Preview actions</Text>
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
                  <Text style={styles.actionHint}>The queue will stay in the same place until you take an action.</Text>
                  <Text style={styles.zoomHint}>Pinch to zoom and drag when zoomed in.</Text>
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
    backgroundColor: colors.stage,
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
    color: 'rgba(249,250,251,0.7)',
    fontFamily: typography.medium,
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.white,
    fontFamily: typography.display,
    fontSize: 30,
    lineHeight: 34,
  },
  closeLink: {
    color: 'rgba(249,250,251,0.84)',
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
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
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
    backgroundColor: 'rgba(255,255,255,0.08)',
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
    color: colors.white,
    fontFamily: typography.bold,
    fontSize: 18,
  },
  bucket: {
    color: colors.white,
    fontFamily: typography.medium,
    fontSize: 12,
    textTransform: 'capitalize',
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  metaRow: {
    gap: 4,
  },
  metaLabel: {
    color: 'rgba(249,250,251,0.7)',
    fontFamily: typography.medium,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  metaValue: {
    color: colors.white,
    fontFamily: typography.body,
    fontSize: 15,
    lineHeight: 22,
  },
  actionCard: {
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: spacing.lg,
    gap: spacing.md,
  },
  actionTitle: {
    color: colors.white,
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
    color: 'rgba(249,250,251,0.72)',
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 22,
  },
  zoomHint: {
    color: 'rgba(249,250,251,0.6)',
    fontFamily: typography.medium,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
});

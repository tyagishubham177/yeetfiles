import { Modal, Pressable, StyleSheet, View } from 'react-native';
import type { PropsWithChildren } from 'react';

import { radius, spacing } from '../../constants/ui-tokens';
import { useAppTheme } from '../../lib/theme';

type SheetProps = PropsWithChildren<{
  visible: boolean;
  onClose: () => void;
}>;

export function Sheet({ visible, onClose, children }: SheetProps) {
  const { colors, isNightMode } = useAppTheme();

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: colors.scrim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.sheet, { backgroundColor: colors.surface, borderTopWidth: isNightMode ? 1 : 0, borderColor: colors.outline }]}>
          {/* Drag handle indicator */}
          <View style={styles.handleWrap}>
            <View style={[styles.handle, { backgroundColor: isNightMode ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.12)' }]} />
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  handleWrap: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
});

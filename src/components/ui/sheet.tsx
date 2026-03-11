import { Modal, Pressable, StyleSheet, View } from 'react-native';
import type { PropsWithChildren } from 'react';

import { colors, radius, spacing } from '../../constants/ui-tokens';

type SheetProps = PropsWithChildren<{
  visible: boolean;
  onClose: () => void;
}>;

export function Sheet({ visible, onClose, children }: SheetProps) {
  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>{children}</View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colors.scrim,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
});

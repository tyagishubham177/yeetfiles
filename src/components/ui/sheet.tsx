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
        <View style={[styles.sheet, { backgroundColor: colors.surface, borderTopWidth: isNightMode ? 1 : 0, borderColor: colors.outline }]}>{children}</View>
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
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
});

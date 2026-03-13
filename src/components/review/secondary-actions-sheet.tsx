import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../../constants/ui-tokens';
import { Button } from '../ui/button';
import { Sheet } from '../ui/sheet';

type SecondaryActionsSheetProps = {
  visible: boolean;
  fileName?: string;
  onClose: () => void;
  onMove: () => void;
  onShare: () => void;
};

export function SecondaryActionsSheet({ visible, fileName, onClose, onMove, onShare }: SecondaryActionsSheetProps) {
  return (
    <Sheet visible={visible} onClose={onClose}>
      <Text style={styles.title}>Secondary actions</Text>
      <Text style={styles.body}>
        Move and share stay here so the main queue keeps `Keep` and `Delete` fast.
      </Text>
      {fileName ? (
        <View style={styles.contextCard}>
          <Text style={styles.contextLabel}>Current photo</Text>
          <Text style={styles.contextValue}>{fileName}</Text>
        </View>
      ) : null}
      <Button label="Move photo" onPress={onMove} variant="secondary" />
      <Button label="Share photo" onPress={onShare} variant="secondary" />
      <Pressable accessibilityRole="button" onPress={onClose} style={styles.closeLinkWrap}>
        <Text style={styles.closeLink}>Back to queue</Text>
      </Pressable>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.ink,
    fontFamily: typography.display,
    fontSize: 28,
  },
  body: {
    color: colors.mutedInk,
    fontFamily: typography.body,
    fontSize: 15,
    lineHeight: 22,
  },
  contextCard: {
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.md,
    gap: 4,
  },
  contextLabel: {
    color: colors.mutedInk,
    fontFamily: typography.medium,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  contextValue: {
    color: colors.ink,
    fontFamily: typography.bold,
    fontSize: 15,
  },
  closeLinkWrap: {
    alignSelf: 'center',
    paddingTop: spacing.xs,
  },
  closeLink: {
    color: colors.progress,
    fontFamily: typography.medium,
    fontSize: 15,
  },
});

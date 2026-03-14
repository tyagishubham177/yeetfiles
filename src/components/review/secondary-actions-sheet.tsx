import { Pressable, StyleSheet, Text, View } from 'react-native';

import { radius, spacing, typography } from '../../constants/ui-tokens';
import { useAppTheme } from '../../lib/theme';
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
  const { colors } = useAppTheme();

  return (
    <Sheet visible={visible} onClose={onClose}>
      <Text style={[styles.title, { color: colors.ink }]}>Secondary actions</Text>
      <Text style={[styles.body, { color: colors.mutedInk }]}>
        Move and share stay here so the main queue keeps `Keep` and `Delete` fast.
      </Text>
      {fileName ? (
        <View style={[styles.contextCard, { backgroundColor: colors.surfaceMuted }]}>
          <Text style={[styles.contextLabel, { color: colors.mutedInk }]}>Current photo</Text>
          <Text style={[styles.contextValue, { color: colors.ink }]}>{fileName}</Text>
        </View>
      ) : null}
      <Button label="Move to album" onPress={onMove} variant="secondary" />
      <Button label="Share photo" onPress={onShare} variant="secondary" />
      <Pressable accessibilityRole="button" onPress={onClose} style={styles.closeLinkWrap}>
        <Text style={[styles.closeLink, { color: colors.progress }]}>Back to queue</Text>
      </Pressable>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: typography.display,
    fontSize: 28,
  },
  body: {
    fontFamily: typography.body,
    fontSize: 15,
    lineHeight: 22,
  },
  contextCard: {
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 4,
  },
  contextLabel: {
    fontFamily: typography.medium,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  contextValue: {
    fontFamily: typography.bold,
    fontSize: 15,
  },
  closeLinkWrap: {
    alignSelf: 'center',
    paddingTop: spacing.xs,
  },
  closeLink: {
    fontFamily: typography.medium,
    fontSize: 15,
  },
});

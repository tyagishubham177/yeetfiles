import { StyleSheet, Text, View } from 'react-native';

import { radius, spacing, typography } from '../../constants/ui-tokens';
import { useAppTheme } from '../../lib/theme';
import { Button } from '../ui/button';

type GestureTutorialCardProps = {
  onContinue: () => void;
};

export function GestureTutorialCard({ onContinue }: GestureTutorialCardProps) {
  const { colors, isNightMode } = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isNightMode ? 'rgba(255,255,255,0.05)' : colors.cardGlass,
          borderColor: isNightMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.1)',
        },
      ]}
    >
      <Text style={[styles.eyebrow, { color: colors.highlight }]}>First swipe guide</Text>
      <Text style={[styles.title, { color: colors.white }]}>Three moves. No hidden tricks.</Text>
      <View style={styles.ruleList}>
        <Text style={[styles.rule, { color: colors.white }]}>Swipe right or tap `Keep` to hold onto a photo.</Text>
        <Text style={[styles.rule, { color: colors.white }]}>Swipe left or tap `Delete` to remove a photo. Android may still confirm unless direct delete access is enabled.</Text>
        <Text style={[styles.rule, { color: colors.white }]}>Use `Skip` when you want the photo to come back later.</Text>
      </View>
      <Text style={[styles.hint, { color: isNightMode ? 'rgba(245,247,250,0.72)' : 'rgba(249,250,251,0.78)' }]}>
        Tap the photo to inspect it closely, or long-press for slower secondary actions like move and share.
      </Text>
      <Button label="Start with real photos" onPress={onContinue} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 460,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.xl,
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
  eyebrow: {
    fontFamily: typography.medium,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    fontFamily: typography.display,
    fontSize: 34,
    lineHeight: 40,
  },
  ruleList: {
    gap: spacing.sm,
  },
  rule: {
    fontFamily: typography.body,
    fontSize: 17,
    lineHeight: 25,
  },
  hint: {
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 22,
  },
});

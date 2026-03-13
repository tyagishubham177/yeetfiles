import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '../../constants/ui-tokens';
import { Button } from '../ui/button';

type ErrorViewProps = {
  message?: string;
  onRetry: () => void;
};

export function ErrorView({ message, onRetry }: ErrorViewProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Something broke mid-swipe</Text>
      <Text style={styles.body}>{message ?? 'A recoverable error interrupted the session.'}</Text>
      <Button label="Try again" onPress={onRetry} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.canvas,
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  title: {
    color: colors.ink,
    fontFamily: typography.display,
    fontSize: 32,
  },
  body: {
    color: colors.mutedInk,
    fontFamily: typography.body,
    fontSize: 16,
    lineHeight: 24,
  },
});

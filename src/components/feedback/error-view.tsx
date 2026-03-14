import { StyleSheet, Text, View } from 'react-native';

import { spacing, typography } from '../../constants/ui-tokens';
import { useAppTheme } from '../../lib/theme';
import { Button } from '../ui/button';

type ErrorViewProps = {
  message?: string;
  onRetry: () => void;
};

export function ErrorView({ message, onRetry }: ErrorViewProps) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.wrap, { backgroundColor: colors.canvas }]}>
      <Text style={[styles.title, { color: colors.ink }]}>Something broke mid-swipe</Text>
      <Text style={[styles.body, { color: colors.mutedInk }]}>{message ?? 'A recoverable error interrupted the session.'}</Text>
      <Button label="Try again" onPress={onRetry} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  title: {
    fontFamily: typography.display,
    fontSize: 32,
  },
  body: {
    fontFamily: typography.body,
    fontSize: 16,
    lineHeight: 24,
  },
});

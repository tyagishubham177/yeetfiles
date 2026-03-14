import { StyleSheet, Text, View } from 'react-native';

import { spacing, typography } from '../../constants/ui-tokens';
import { useAppTheme } from '../../lib/theme';
import { Button } from '../ui/button';

type EmptyStateProps = {
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ title, body, actionLabel, onAction }: EmptyStateProps) {
  const { colors, isNightMode } = useAppTheme();

  return (
    <View style={styles.wrap}>
      <Text style={[styles.title, { color: colors.white }]}>{title}</Text>
      <Text style={[styles.body, { color: isNightMode ? 'rgba(245,247,250,0.76)' : 'rgba(249,250,251,0.82)' }]}>{body}</Text>
      {actionLabel && onAction ? <Button label={actionLabel} onPress={onAction} variant="secondary" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  title: {
    fontFamily: typography.display,
    fontSize: 28,
    textAlign: 'center',
  },
  body: {
    fontFamily: typography.body,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
});

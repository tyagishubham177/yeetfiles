import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '../../constants/ui-tokens';
import { Button } from '../ui/button';

type EmptyStateProps = {
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ title, body, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
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
    color: colors.white,
    fontFamily: typography.display,
    fontSize: 28,
    textAlign: 'center',
  },
  body: {
    color: 'rgba(249,250,251,0.82)',
    fontFamily: typography.body,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
});

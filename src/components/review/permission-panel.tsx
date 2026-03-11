import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../../constants/ui-tokens';
import { Button } from '../ui/button';

type PermissionPanelProps = {
  blocked: boolean;
  onRetry: () => void;
  onOpenSettings: () => void;
};

export function PermissionPanel({ blocked, onRetry, onOpenSettings }: PermissionPanelProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Photos permission is needed</Text>
      <Text style={styles.body}>
        FileSwipe stays local and only reviews your photos on-device. Without access, we cannot build the queue.
      </Text>
      <View style={styles.actions}>
        <Button label={blocked ? 'Open settings' : 'Try again'} onPress={blocked ? onOpenSettings : onRetry} />
        {!blocked ? <Button label="Settings" onPress={onOpenSettings} variant="secondary" /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.xxl,
    padding: spacing.lg,
    gap: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.cardGlass,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
  },
  title: {
    color: colors.white,
    fontFamily: typography.display,
    fontSize: 28,
  },
  body: {
    color: 'rgba(249,250,251,0.82)',
    fontFamily: typography.body,
    fontSize: 16,
    lineHeight: 24,
  },
  actions: {
    gap: spacing.sm,
  },
});

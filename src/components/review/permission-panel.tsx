import { StyleSheet, Text, View } from 'react-native';

import { radius, spacing, typography } from '../../constants/ui-tokens';
import { useAppTheme } from '../../lib/theme';
import { Button } from '../ui/button';

type PermissionPanelProps = {
  blocked: boolean;
  isRetrying?: boolean;
  onRetry: () => void;
  onOpenSettings: () => void;
};

export function PermissionPanel({ blocked, isRetrying = false, onRetry, onOpenSettings }: PermissionPanelProps) {
  const { colors, isNightMode } = useAppTheme();

  return (
    <View style={[styles.wrap, { backgroundColor: colors.cardGlass, borderColor: isNightMode ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.09)' }]}>
      <Text style={[styles.title, { color: colors.white }]}>Photos permission is needed</Text>
      <Text style={[styles.body, { color: isNightMode ? 'rgba(245,247,250,0.76)' : 'rgba(249,250,251,0.82)' }]}>
        FileSwipe stays local and only reviews your photos on-device. Without access, we cannot build the queue.
      </Text>
      {blocked ? (
        <Text style={[styles.note, { color: isNightMode ? '#F2C3B8' : '#FFD7C7' }]}>
          If this is Expo Go on Android, that environment now blocks full media-library access. Use a development build for the real photo flow.
        </Text>
      ) : null}
      <View style={styles.actions}>
        <Button
          label={blocked ? 'Open settings' : 'Try again'}
          loading={!blocked && isRetrying}
          loadingLabel="Checking access..."
          onPress={blocked ? onOpenSettings : onRetry}
        />
        {!blocked ? <Button label="Settings" onPress={onOpenSettings} variant="secondary" disabled={isRetrying} /> : null}
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
    borderWidth: 1,
  },
  title: {
    fontFamily: typography.display,
    fontSize: 28,
  },
  body: {
    fontFamily: typography.body,
    fontSize: 16,
    lineHeight: 24,
  },
  note: {
    fontFamily: typography.medium,
    fontSize: 14,
    lineHeight: 22,
  },
  actions: {
    gap: spacing.sm,
  },
});

import { useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../src/components/ui/button';
import { ROUTES } from '../../src/constants/routes';
import { colors, radius, spacing, typography } from '../../src/constants/ui-tokens';
import { useAppStore } from '../../src/store/app-store';

function SettingRow({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: () => void;
}) {
  return (
    <View style={styles.settingRow}>
      <Text style={styles.settingLabel}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} trackColor={{ true: colors.progress }} />
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const settings = useAppStore((state) => state.settings);
  const actionLogs = useAppStore((state) => state.actionLogs);
  const analyticsEvents = useAppStore((state) => state.analyticsEvents);
  const toggleSetting = useAppStore((state) => state.toggleSetting);
  const requestRescan = useAppStore((state) => state.requestRescan);
  const resetApp = useAppStore((state) => state.resetApp);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Settings</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backLink}>Back</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <SettingRow label="Haptics" value={settings.hapticsEnabled} onValueChange={() => toggleSetting('hapticsEnabled')} />
          <SettingRow label="Animations" value={settings.animationsEnabled} onValueChange={() => toggleSetting('animationsEnabled')} />
          <SettingRow label="Follow system theme" value={settings.followSystemTheme} onValueChange={() => toggleSetting('followSystemTheme')} />
          <SettingRow label="Gesture hints" value={settings.showGestureHints} onValueChange={() => toggleSetting('showGestureHints')} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Session and data</Text>
          <Button label="Re-scan photos" onPress={() => { requestRescan(); router.replace(ROUTES.queue); }} />
          <Button
            label="Clear local session data"
            variant="danger"
            onPress={() => {
              Alert.alert('Clear local state?', 'This removes your saved queue, history, and current session from this device.', [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Clear',
                  style: 'destructive',
                  onPress: () => {
                    void resetApp().then(() => {
                      router.replace(ROUTES.welcome);
                    });
                  },
                },
              ]);
            }}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Diagnostics</Text>
          <Text style={styles.diagnosticLine}>{analyticsEvents.length} analytics events stored locally</Text>
          <Text style={styles.diagnosticLine}>{actionLogs.length} action log entries stored locally</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: colors.ink,
    fontFamily: typography.display,
    fontSize: 34,
  },
  backLink: {
    color: colors.progress,
    fontFamily: typography.medium,
    fontSize: 15,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  sectionTitle: {
    color: colors.ink,
    fontFamily: typography.display,
    fontSize: 24,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    color: colors.ink,
    fontFamily: typography.body,
    fontSize: 16,
  },
  diagnosticLine: {
    color: colors.mutedInk,
    fontFamily: typography.body,
    fontSize: 15,
  },
});

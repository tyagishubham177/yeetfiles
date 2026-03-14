import { DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { SpaceGrotesk_600SemiBold, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import { useFonts } from 'expo-font';
import { Stack, type ErrorBoundaryProps } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ErrorView } from '../src/components/feedback/error-view';
import { typography } from '../src/constants/ui-tokens';
import { useAppHealthMonitor } from '../src/hooks/use-app-health-monitor';
import { useNotificationSync } from '../src/hooks/use-notification-sync';
import { useAppTheme } from '../src/lib/theme';
import { useAppStore } from '../src/store/app-store';

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return <ErrorView message={error.message} onRetry={retry} />;
}

export default function RootLayout() {
  const hasHydrated = useAppStore((state) => state.hasHydrated);
  const { colors } = useAppTheme();
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
  });

  useNotificationSync();
  useAppHealthMonitor();

  if (!fontsLoaded || !hasHydrated) {
    return (
      <View style={[styles.bootWrap, { backgroundColor: colors.canvas }]}>
        <Text style={[styles.bootTitle, { color: colors.ink }]}>FileSwipe</Text>
        <Text style={[styles.bootBody, { color: colors.mutedInk }]}>Loading your cleanup workspace...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.canvas } }} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  bootWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  bootTitle: {
    fontFamily: typography.display,
    fontSize: 34,
  },
  bootBody: {
    fontFamily: typography.body,
    fontSize: 16,
  },
});

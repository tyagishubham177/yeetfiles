import { DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { SpaceGrotesk_600SemiBold, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import { useFonts } from 'expo-font';
import { Stack, type ErrorBoundaryProps } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ErrorView } from '../src/components/feedback/error-view';
import { useAppHealthMonitor } from '../src/hooks/use-app-health-monitor';
import { useNotificationSync } from '../src/hooks/use-notification-sync';
import { useAppTheme } from '../src/lib/theme';
import { useAppStore } from '../src/store/app-store';

void SplashScreen.preventAutoHideAsync().catch(() => {});

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

  useEffect(() => {
    if (fontsLoaded && hasHydrated) {
      void SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, hasHydrated]);

  if (!fontsLoaded || !hasHydrated) {
    return null;
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
});
import { DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { SpaceGrotesk_600SemiBold, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import { useFonts } from 'expo-font';
import { Stack, type ErrorBoundaryProps } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ErrorView } from '../src/components/feedback/error-view';
import { colors, typography } from '../src/constants/ui-tokens';
import { useAppStore } from '../src/store/app-store';

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return <ErrorView message={error.message} onRetry={retry} />;
}

export default function RootLayout() {
  const hasHydrated = useAppStore((state) => state.hasHydrated);
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
  });

  if (!fontsLoaded || !hasHydrated) {
    return (
      <View style={styles.bootWrap}>
        <Text style={styles.bootTitle}>FileSwipe</Text>
        <Text style={styles.bootBody}>Restoring your local queue...</Text>
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
    backgroundColor: colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  bootTitle: {
    color: colors.ink,
    fontFamily: typography.display,
    fontSize: 34,
  },
  bootBody: {
    color: colors.mutedInk,
    fontFamily: typography.body,
    fontSize: 16,
  },
});

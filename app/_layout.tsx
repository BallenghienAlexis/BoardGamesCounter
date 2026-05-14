import { useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';
import { GameProvider } from '@/src/contexts/GameContext';
import { ThemeProvider } from '@/src/contexts/ThemeContext';
import { SkullKingProvider } from '@/src/contexts/SkullKingContext';
import { PlayersProvider } from '@/src/contexts/PlayersContext';
import { StatsProvider } from '@/src/contexts/StatsContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    SystemUI.setBackgroundColorAsync('#0F1419');
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  if (fontError) {
    throw fontError;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <PlayersProvider>
          <GameProvider>
            <SkullKingProvider>
              <StatsProvider>
                <StatusBar />
                <Stack
                  screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: '#0F1419' },
                  }}
                >
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen name="skull-king/[gameId]" />
                  <Stack.Screen
                    name="[gameId]"
                    options={{
                      animation: 'default',
                    }}
                  />
                </Stack>
              </StatsProvider>
            </SkullKingProvider>
          </GameProvider>
        </PlayersProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

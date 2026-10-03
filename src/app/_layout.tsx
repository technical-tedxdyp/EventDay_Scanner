import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '@/utils/theme';
import { AnalyticsProvider } from '@/hooks/useAnalytics';

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    SpaceGrotesk: require('../../assets/fonts/SpaceGrotesk-VariableFont_wght.ttf'),
    VT323: require('../../assets/fonts/VT323-Regular.ttf'),
  });

  if (fontError) throw fontError;
  if (!fontsLoaded) return null;

  return (
    <AnalyticsProvider>
      <View style={styles.root}>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: COLORS.background },
            animation: 'fade',
          }}
        />
      </View>
    </AnalyticsProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});

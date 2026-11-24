import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider, useApp } from './AppContext';
import { MainTabs } from './navigation';
import { OnboardingScreen } from '../features/onboarding/OnboardingScreen';
import { colors } from '../ui/theme';

function Gate() {
  const { ready, settings, loadError, refresh } = useApp();
  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }
  if (loadError) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg, padding: 24 }}>
        <Text style={{ color: colors.ink, fontSize: 18, textAlign: 'center', marginBottom: 12 }}>{loadError}</Text>
        <Pressable onPress={() => void refresh()} accessibilityLabel="Try opening your plan again">
          <Text style={{ color: colors.accent, fontWeight: '600' }}>Try again</Text>
        </Pressable>
      </View>
    );
  }
  if (!settings.onboarded) return <OnboardingScreen />;
  return <MainTabs />;
}

export function AppRoot() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="dark" />
        <Gate />
      </AppProvider>
    </SafeAreaProvider>
  );
}

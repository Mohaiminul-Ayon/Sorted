import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider, useApp } from './AppContext';
import { MainTabs } from './navigation';
import { OnboardingScreen } from '../features/onboarding/OnboardingScreen';
import { colors } from '../ui/theme';

function Gate() {
  const { ready, settings } = useApp();
  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.accent} />
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

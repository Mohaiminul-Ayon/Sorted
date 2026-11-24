import { Platform } from 'react-native';
import { enableScreens } from 'react-native-screens';
import { ShareIntentProvider } from './src/features/capture/shareIntent';
import { AppRoot } from './src/shell/AppRoot';

if (Platform.OS === 'web') {
  enableScreens(false);
}

export default function App() {
  return (
    <ShareIntentProvider>
      <AppRoot />
    </ShareIntentProvider>
  );
}

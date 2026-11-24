import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../features/home/HomeScreen';
import { InboxScreen } from '../features/inbox/InboxScreen';
import { ProjectsScreen } from '../features/projects/ProjectsScreen';
import { ReviewScreen } from '../features/review/ReviewScreen';
import { SettingsScreen } from '../features/settings/SettingsScreen';
import { colors } from '../ui/theme';

const Tab = createBottomTabNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.bg, card: colors.paper, text: colors.ink, primary: colors.accent, border: colors.calm },
};

export function MainTabs() {
  return (
    <NavigationContainer theme={navTheme}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.muted,
          tabBarStyle: { minHeight: 56 },
        }}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Inbox" component={InboxScreen} />
        <Tab.Screen name="Projects" component={ProjectsScreen} />
        <Tab.Screen name="Review" component={ReviewScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

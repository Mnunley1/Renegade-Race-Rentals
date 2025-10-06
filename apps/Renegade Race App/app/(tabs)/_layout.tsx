import { useAuth } from '@clerk/clerk-expo';
import { Redirect, Tabs, usePathname } from 'expo-router';
import { MessageCircle, Plus, Search, User, Users } from 'lucide-react-native';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CORAL_COLOR = '#FF5A5F';
const GRAY_COLOR = '#6b7280';
const INDEX_PATHS = [
  '/index',
  '/driver-team-matching',
  '/add-listing',
  '/messages',
  '/profile',
];

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { isSignedIn, isLoaded } = useAuth();
  const pathname = usePathname();
  const isIndexPage = INDEX_PATHS.some((path) => pathname.endsWith(path));
  const showTabBar = isIndexPage;

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: CORAL_COLOR,
        tabBarInactiveTintColor: GRAY_COLOR,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarStyle: [
          showTabBar ? { display: 'flex' } : { display: 'none' },
          styles.tabBar,
          {
            paddingBottom: insets.bottom,
            height: 60 + insets.bottom,
          },
        ],
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Explore',
          tabBarIcon: ({ size, color }) => <Search size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="driver-team-matching"
        options={{
          title: 'Match',
          tabBarIcon: ({ size, color }) => <Users size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="add-listing"
        options={{
          title: 'List Car',
          tabBarIcon: ({ size, color }) => <Plus size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ size, color }) => (
            <MessageCircle size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerShown: false,
          tabBarIcon: ({ size, color }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 8,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
});

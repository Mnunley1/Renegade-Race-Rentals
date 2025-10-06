import { useAuth } from '@clerk/clerk-expo';
import { router, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

export function AuthGuard() {
  const { isSignedIn, isLoaded } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (!isLoaded) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (isSignedIn && inAuthGroup) {
      // User is signed in but on auth screen, redirect to main app
      router.replace('/(tabs)');
    } else if (!isSignedIn && !inAuthGroup) {
      // User is not signed in but on main app, redirect to auth
      router.replace('/(auth)/login');
    }
  }, [isSignedIn, isLoaded, segments]);

  // Show loading indicator while checking auth state
  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return null;
}

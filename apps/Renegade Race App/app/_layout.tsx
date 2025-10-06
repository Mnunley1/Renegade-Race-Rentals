import { clerkToken } from '@/lib/cache';
import { convex } from '@/lib/convex';
import { StripeProvider, publishableKey } from '@/lib/stripe';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import * as NavigationBar from 'expo-navigation-bar';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Toaster } from 'sonner-native';

// Prevent auto-hide as early as possible (outside the component)
SplashScreen.preventAutoHideAsync().catch(console.warn);

// Set the animation options. This is optional.
SplashScreen.setOptions({
  duration: 500,
  fade: true,
});

// Custom hook to track app readiness
function useAppReady() {
  const [isReady, setIsReady] = useState(false);
  const [convexReady, setConvexReady] = useState(false);
  const [clerkReady, setClerkReady] = useState(false);
  const [fontsReady, setFontsReady] = useState(false);
  const [splashHidden, setSplashHidden] = useState(false);
  const [appContentReady, setAppContentReady] = useState(false);

  useEffect(() => {
    // Initialize Convex connection
    const initConvex = async () => {
      try {
        // Convex client is ready when it's instantiated
        // We can check if it's properly configured
        if (convex) {
          console.log('Convex client ready');
          setConvexReady(true);
        }
      } catch (error) {
        console.warn('Convex initialization error:', error);
        // Still mark as ready to prevent infinite loading
        setConvexReady(true);
      }
    };

    initConvex();
  }, []);

  useEffect(() => {
    // Load fonts if needed
    const loadFonts = async () => {
      try {
        // If you have custom fonts, load them here
        // await Font.loadAsync({
        //   'CustomFont': require('./assets/fonts/CustomFont.ttf'),
        // });

        // For now, mark fonts as ready immediately
        console.log('Fonts ready');
        setFontsReady(true);
      } catch (error) {
        console.warn('Font loading error:', error);
        setFontsReady(true); // Still mark as ready to prevent infinite loading
      }
    };

    loadFonts();
  }, []);

  useEffect(() => {
    // Set a minimum delay to ensure smooth UX
    const minDelay = new Promise((resolve) => setTimeout(resolve, 3000));

    // Wait for all critical resources
    const waitForResources = Promise.all([
      minDelay,
      new Promise((resolve) => {
        if (convexReady && clerkReady && fontsReady) {
          console.log('All resources ready:', {
            convexReady,
            clerkReady,
            fontsReady,
          });
          resolve(true);
        } else {
          console.log('Waiting for resources:', {
            convexReady,
            clerkReady,
            fontsReady,
          });
          // Set up listeners for when resources become ready
          const checkReady = () => {
            if (convexReady && clerkReady && fontsReady) {
              console.log('All resources ready:', {
                convexReady,
                clerkReady,
                fontsReady,
              });
              resolve(true);
            }
          };

          // Check every 100ms
          const interval = setInterval(checkReady, 100);

          // Cleanup interval after 10 seconds to prevent infinite waiting
          setTimeout(() => {
            clearInterval(interval);
            console.log('Timeout reached, forcing ready state');
            resolve(true);
          }, 10000);
        }
      }),
    ]);

    waitForResources
      .then(() => {
        // Add a small delay to ensure everything is properly initialized
        setTimeout(() => {
          console.log('Setting app content ready');
          setAppContentReady(true);
        }, 500);
      })
      .catch((error) => {
        console.warn('Error during app initialization:', error);
        // Still mark as ready to prevent infinite loading
        setAppContentReady(true);
      });
  }, [convexReady, clerkReady, fontsReady]);

  useEffect(() => {
    // Only mark as fully ready when both resources and content are ready
    if (appContentReady) {
      console.log('App fully ready');
      setIsReady(true);
    }
  }, [appContentReady]);

  return { isReady, setClerkReady, splashHidden, setSplashHidden };
}

// Fallback loading screen component
function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#FF5A5F" />
    </View>
  );
}

export default function RootLayout() {
  const { isReady, setClerkReady, splashHidden, setSplashHidden } =
    useAppReady();

  useEffect(() => {
    if (Platform.OS === 'android') {
      SystemUI.setBackgroundColorAsync('#ffffff');
      const setupNavigationBar = async () => {
        try {
          await NavigationBar.setBackgroundColorAsync('#ffffff');
          await NavigationBar.setButtonStyleAsync('dark');
          await NavigationBar.setBehaviorAsync('overlay-swipe');

          // Force refresh by hiding and showing
          await NavigationBar.setVisibilityAsync('hidden');
          setTimeout(async () => {
            await NavigationBar.setVisibilityAsync('visible');
          }, 100);
        } catch (error) {
          console.log('Navigation bar setup error:', error);
        }
      };

      setupNavigationBar();
    }
  }, []);

  useEffect(() => {
    if (isReady) {
      // Hide the splash screen once the app is ready
      console.log('App ready, hiding splash screen');
      SplashScreen.hideAsync().then(() => {
        setSplashHidden(true);
      });
    }
  }, [isReady, setSplashHidden]);

  // Show loading screen if splash is hidden but app isn't ready
  if (splashHidden && !isReady) {
    return <LoadingScreen />;
  }

  // All hooks are called before this return!
  if (!isReady) {
    // Return a minimal loading view while splash screen is still visible
    return <LoadingScreen />;
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.container}>
        <ClerkProvider
          tokenCache={clerkToken}
          publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
        >
          <StripeProvider publishableKey={publishableKey}>
            <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
              <AppContent setClerkReady={setClerkReady} />
            </ConvexProviderWithClerk>
          </StripeProvider>
        </ClerkProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

// Separate component to handle Clerk auth state
function AppContent({
  setClerkReady,
}: {
  setClerkReady: (ready: boolean) => void;
}) {
  const { isLoaded } = useAuth();

  useEffect(() => {
    if (isLoaded) {
      console.log('Clerk auth ready');
      setClerkReady(true);
    }
  }, [isLoaded, setClerkReady]);

  return (
    <>
      <Slot />
      <StatusBar style="dark" hidden={false} translucent={false} />
      <Toaster theme="light" />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff', // White background for the loading screen
  },
});

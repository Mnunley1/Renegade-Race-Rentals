import { useAuth } from '@clerk/clerk-expo';

export function useConvexAuth() {
  try {
    const { isSignedIn, userId } = useAuth();
    return {
      isSignedIn,
      userId,
    };
  } catch (error) {
    console.log('Auth context not available:', error);
    return {
      isSignedIn: false,
      userId: null,
    };
  }
}

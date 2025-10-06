import { tokenCache } from '@clerk/clerk-expo/token-cache';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const createTokenCache = (): typeof tokenCache => {
  return {
    getToken: async (key: string) => {
      try {
        const item = await SecureStore.getItemAsync(key);
        if (item) {
          console.log(`Key was used 🔐 \n`);
        } else {
          console.log('No values stored under key');
        }
        return item;
      } catch (error) {
        console.error('secure store get item error: ', error);
        await SecureStore.deleteItemAsync(key);
        return null;
      }
    },
    saveToken: (key: string, token: string) => {
      return SecureStore.setItemAsync(key, token);
    },
  };
};

// SecureStore is not supported on the web
// https://github.com/expo/expo/issues/7744#issuecomment-611093485
export const clerkToken =
  Platform.OS !== 'web' ? createTokenCache() : undefined;

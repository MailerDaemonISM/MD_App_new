import { ClerkProvider } from '@clerk/clerk-expo';
import { Stack } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

// Needed for Clerk session storage
const tokenCache = {
  getToken: (key) => SecureStore.getItemAsync(key),
  saveToken: (key, value) => SecureStore.setItemAsync(key, value),
};

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey="pk_test_YWRlcXVhdGUtcGFuZ29saW4tNzYuY2xlcmsuYWNjb3VudHMuZGV2JA" tokenCache={tokenCache}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="sign-up" options={{ title: 'Sign Up' }} />
        <Stack.Screen name="home" options={{ title: 'Home' }} />
      </Stack>
    </ClerkProvider>
  );
}

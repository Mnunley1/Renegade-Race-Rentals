import { Stack } from 'expo-router';
import * as React from 'react';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="chat"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}

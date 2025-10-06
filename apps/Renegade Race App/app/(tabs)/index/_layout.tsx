import { Stack } from 'expo-router';
import * as React from 'react';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
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
        name="car-detail"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="vehicle-availability"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}

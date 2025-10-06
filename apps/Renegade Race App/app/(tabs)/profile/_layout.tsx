import { Stack } from 'expo-router';
import * as React from 'react';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: 'Back',
        headerShown: false,
        animation: 'slide_from_right',
      }}
      initialRouteName="index"
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="edit-profile"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="host-dashboard"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="guest-dashboard"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="rental-completion-form"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="owner-return-review"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="help-center"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="reviews"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}

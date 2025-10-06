import { Stack } from 'expo-router';

export default function DriverTeamMatchingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Driver-Team Matching',
        }}
      />
      <Stack.Screen
        name="team-detail"
        options={{
          title: 'Team Details',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="driver-detail"
        options={{
          title: 'Driver Profile',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="create-team"
        options={{
          title: 'Create Team',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="create-driver-profile"
        options={{
          title: 'Create Driver Profile',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}

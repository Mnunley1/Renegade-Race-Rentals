import { router } from 'expo-router';
import { Car, Key } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

export default function OnboardingScreen() {
  const [selectedRole, setSelectedRole] = useState<
    'driver' | 'owner' | 'both' | null
  >(null);

  const handleContinue = async () => {
    if (!selectedRole) {
      toast.error('Please select a role');
      return;
    }

    // TODO: Save role to Convex user profile
    console.log('Selected role:', selectedRole);
    toast.success(`Welcome! You're set up as a ${selectedRole}`);
    router.replace('/(tabs)');
  };

  const handleSkip = () => {
    toast.info('You can set your role later in settings');
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to TrackRent</Text>
          <Text style={styles.subtitle}>
            Choose how you'd like to get started. You can always change this
            later.
          </Text>
        </View>

        {/* Role Selection */}
        <View style={styles.roleSelection}>
          {/* Driver Option */}
          <Pressable
            style={[
              styles.roleOption,
              selectedRole === 'driver' && styles.roleOptionActive,
            ]}
            onPress={() => setSelectedRole('driver')}
          >
            <View style={styles.roleContent}>
              <View
                style={[
                  styles.roleIcon,
                  selectedRole === 'driver' && styles.roleIconActive,
                ]}
              >
                <Car
                  size={32}
                  color={selectedRole === 'driver' ? '#FF5A5F' : '#6b7280'}
                />
              </View>
              <Text
                style={[
                  styles.roleTitle,
                  selectedRole === 'driver' && styles.roleTitleActive,
                ]}
              >
                I want to rent cars
              </Text>
              <Text style={styles.roleDescription}>
                Find and rent high-performance cars for your track days. Browse
                listings, connect with owners, and hit the track.
              </Text>
            </View>
          </Pressable>

          {/* Owner Option */}
          <Pressable
            style={[
              styles.roleOption,
              selectedRole === 'owner' && styles.roleOptionActive,
            ]}
            onPress={() => setSelectedRole('owner')}
          >
            <View style={styles.roleContent}>
              <View
                style={[
                  styles.roleIcon,
                  selectedRole === 'owner' && styles.roleIconActive,
                ]}
              >
                <Key
                  size={32}
                  color={selectedRole === 'owner' ? '#FF5A5F' : '#6b7280'}
                />
              </View>
              <Text
                style={[
                  styles.roleTitle,
                  selectedRole === 'owner' && styles.roleTitleActive,
                ]}
              >
                I want to list my car
              </Text>
              <Text style={styles.roleDescription}>
                Share your track car with fellow enthusiasts and earn money.
                List your vehicle and connect with qualified drivers.
              </Text>
            </View>
          </Pressable>

          {/* Both Option */}
          <Pressable
            style={[
              styles.roleOption,
              selectedRole === 'both' && styles.roleOptionActive,
            ]}
            onPress={() => setSelectedRole('both')}
          >
            <View style={styles.roleContent}>
              <View
                style={[
                  styles.roleIcon,
                  selectedRole === 'both' && styles.roleIconActive,
                ]}
              >
                <View style={styles.bothIconContainer}>
                  <Car
                    size={20}
                    color={selectedRole === 'both' ? '#FF5A5F' : '#6b7280'}
                  />
                  <Key
                    size={20}
                    color={selectedRole === 'both' ? '#FF5A5F' : '#6b7280'}
                  />
                </View>
              </View>
              <Text
                style={[
                  styles.roleTitle,
                  selectedRole === 'both' && styles.roleTitleActive,
                ]}
              >
                Both renter and owner
              </Text>
              <Text style={styles.roleDescription}>
                Rent cars for your track days and list your own vehicles to earn
                money when you're not using them.
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Continue Button */}
        <View style={styles.buttonContainer}>
          <Pressable
            style={[
              styles.continueButton,
              !selectedRole && styles.continueButtonDisabled,
            ]}
            onPress={handleContinue}
            disabled={!selectedRole}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </Pressable>

          <Pressable style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 28,
  },
  roleSelection: {
    flex: 1,
    gap: 24,
  },
  roleOption: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  roleOptionActive: {
    borderColor: '#FF5A5F',
    backgroundColor: '#fef2f2',
  },
  roleContent: {
    alignItems: 'center',
  },
  roleIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    backgroundColor: '#f3f4f6',
  },
  roleIconActive: {
    backgroundColor: '#fecaca',
  },
  bothIconContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#111827',
  },
  roleTitleActive: {
    color: '#7f1d1d',
  },
  roleDescription: {
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    paddingTop: 32,
  },
  continueButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#FF5A5F',
  },
  continueButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  continueButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 18,
  },
  skipButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
  skipButtonText: {
    textAlign: 'center',
    color: '#6b7280',
  },
});

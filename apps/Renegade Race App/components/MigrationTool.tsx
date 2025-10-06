import { api } from '@/convex/_generated/api';
import { useMutation } from 'convex/react';
import React from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';

export default function MigrationTool() {
  const migrateVehicleImages = useMutation(api.vehicles.migrateVehicleImages);

  const handleMigration = async () => {
    try {
      const result = await migrateVehicleImages();
      Alert.alert(
        'Migration Complete',
        `Processed ${result.totalImages} images. Updated ${result.migratedImages} images.`,
        [{ text: 'OK' }],
      );
      console.log('Migration result:', result);
    } catch (error) {
      Alert.alert(
        'Migration Failed',
        error instanceof Error ? error.message : 'Unknown error',
      );
      console.error('Migration error:', error);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>
        Vehicle Images Migration Tool
      </Text>
      <Text style={{ marginBottom: 20 }}>
        This tool will fix existing vehicle images that don't have the required
        storageId field.
      </Text>
      <TouchableOpacity
        onPress={handleMigration}
        style={{
          backgroundColor: '#007AFF',
          padding: 15,
          borderRadius: 8,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>
          Run Migration
        </Text>
      </TouchableOpacity>
    </View>
  );
}

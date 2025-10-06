import { api } from '@renegade/convex/_generated/api';
import { Id } from '@renegade/convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import * as ImagePicker from 'expo-image-picker';
import { useConvexAuth } from './useConvexAuth';

export function useUserProfile() {
  const { userId } = useConvexAuth();

  // Queries
  const currentUser = useQuery(api.users.current);

  // Mutations
  const updateProfileImage = useMutation(api.users.updateProfileImage);
  const updateProfile = useMutation(api.users.updateProfile);
  const generateUploadUrl = useMutation(api.vehicles.generateUploadUrl);

  // Upload image to Convex storage
  const uploadToStorage = async (uri: string): Promise<Id<'_storage'>> => {
    try {
      const uploadUrl = await generateUploadUrl();

      // Convert local URI to blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // Upload to Convex
      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        body: blob,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }

      const { storageId } = await uploadResponse.json();
      return storageId;
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('Failed to upload image to storage');
    }
  };

  // Simple upload profile image without complex processing
  const uploadProfileImage = async (uri: string): Promise<Id<'_storage'>> => {
    try {
      // Upload directly to Convex storage without complex processing
      const storageId = await uploadToStorage(uri);
      return storageId;
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('Failed to upload profile image');
    }
  };

  // Pick and update profile image
  const pickAndUpdateProfileImage = async (): Promise<void> => {
    try {
      // Request permissions with iOS-specific handling
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        throw new Error('Permission to access photo library is required!');
      }

      // Launch image picker with iOS-optimized settings
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Square aspect ratio for profile images
        quality: 0.7, // Lower quality for iOS to prevent crashes
        exif: false, // Disable EXIF to prevent crashes
        base64: false, // Don't include base64 to reduce memory usage
        allowsMultipleSelection: false, // Ensure single selection
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];

        if (!asset || !asset.uri) {
          throw new Error('Failed to get image URI');
        }

        // Additional iOS-specific validation
        if (
          asset.width &&
          asset.height &&
          (asset.width > 4000 || asset.height > 4000)
        ) {
          throw new Error('Image is too large. Please select a smaller image.');
        }

        // Upload the image directly
        const storageId = await uploadProfileImage(asset.uri);

        // Update user profile with new image
        await updateProfileImage({
          storageId: storageId,
        });
      }
    } catch (error) {
      console.error('Profile image update error:', error);
      throw error;
    }
  };

  // Update user profile data
  const updateUserProfile = async (profileData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  }) => {
    try {
      const fullName =
        `${profileData.firstName} ${profileData.lastName}`.trim();

      await updateProfile({
        name: fullName,
        email: profileData.email,
        phone: profileData.phone,
      });
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  return {
    currentUser,
    pickAndUpdateProfileImage,
    uploadProfileImage,
    updateUserProfile,
  };
}

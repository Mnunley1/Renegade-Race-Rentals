import { useToast } from '@renegade/ui';
import { useUser } from '@clerk/clerk-react';
import { api } from '@/lib/convex';
import { useMutation, useQuery } from 'convex/react';
import { useCallback, useState } from 'react';

export function useUserProfile() {
  const { user, isSignedIn } = useUser();
  const { success, error } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  // Get current user profile from Convex
  const userProfile = useQuery(api.users.current, {});

  // Mutations
  const updateProfileMutation = useMutation(api.users.updateProfile);
  const updateProfileImageMutation = useMutation(api.users.updateProfileImage);

  // Update profile information
  const updateProfile = useCallback(
    async (profileData: { name: string; email?: string; phone?: string }) => {
      if (!isSignedIn || !user) {
        error(
          'Authentication Required',
          'Please sign in to update your profile'
        );
        return;
      }

      setIsUpdating(true);
      try {
        await updateProfileMutation(profileData);
        success(
          'Profile Updated',
          'Your profile has been updated successfully'
        );
      } catch (err) {
        console.error('Error updating profile:', err);
        const message =
          err instanceof Error ? err.message : 'Failed to update profile';
        error('Update Failed', message);
      } finally {
        setIsUpdating(false);
      }
    },
    [isSignedIn, user, updateProfileMutation, success, error]
  );

  // Update profile image
  const updateProfileImage = useCallback(
    async (storageId: string) => {
      if (!isSignedIn || !user) {
        error(
          'Authentication Required',
          'Please sign in to update your profile image'
        );
        return;
      }

      setIsUpdating(true);
      try {
        await updateProfileImageMutation({ storageId: storageId as any });
        success(
          'Profile Image Updated',
          'Your profile image has been updated successfully'
        );
      } catch (err) {
        console.error('Error updating profile image:', err);
        const message =
          err instanceof Error ? err.message : 'Failed to update profile image';
        error('Update Failed', message);
      } finally {
        setIsUpdating(false);
      }
    },
    [isSignedIn, user, updateProfileImageMutation, success, error]
  );

  return {
    userProfile,
    isUpdating,
    updateProfile,
    updateProfileImage,
    isSignedIn,
  };
}

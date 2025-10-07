import { useToast } from '@/components/ui/toast';
import { useUser } from '@clerk/clerk-react';
import { api } from '@/lib/convex';
import { Id } from '@/lib/convex';
import { useMutation, useQuery } from 'convex/react';
import { useCallback, useState } from 'react';

export function useDriverProfiles() {
  const { user, isSignedIn } = useUser();
  const { success, error } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Queries
  const driverProfiles = useQuery(api.driverProfiles.list, {}) || [];
  const driverProfilesLoading = driverProfiles === undefined;

  // Mutations
  const createDriverProfileMutation = useMutation(api.driverProfiles.create);
  const updateDriverProfileMutation = useMutation(api.driverProfiles.update);

  // Get driver profile by ID
  const getDriverProfileById = useCallback(
    (profileId: Id<'driverProfiles'>) => {
      return useQuery(api.driverProfiles.getById, { profileId });
    },
    []
  );

  // Create a new driver profile
  const createDriverProfile = useCallback(
    async (profileData: {
      bio: string;
      experience: 'beginner' | 'intermediate' | 'advanced' | 'professional';
      licenses: string[];
      preferredCategories: string[];
      availability: string[];
      location: string;
      contactInfo: {
        phone?: string;
        email?: string;
      };
    }) => {
      if (!isSignedIn || !user) {
        error(
          'Authentication Required',
          'Please sign in to create a driver profile'
        );
        return;
      }

      setIsCreating(true);
      try {
        const profileId = await createDriverProfileMutation(profileData);
        success(
          'Profile Created',
          'Your driver profile has been created successfully'
        );
        return profileId;
      } catch (err) {
        console.error('Error creating driver profile:', err);
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to create driver profile';
        error('Creation Failed', message);
        throw err;
      } finally {
        setIsCreating(false);
      }
    },
    [isSignedIn, user, createDriverProfileMutation, success, error]
  );

  // Update driver profile information
  const updateDriverProfile = useCallback(
    async (
      profileId: Id<'driverProfiles'>,
      updates: {
        bio?: string;
        experience?: 'beginner' | 'intermediate' | 'advanced' | 'professional';
        licenses?: string[];
        preferredCategories?: string[];
        availability?: string[];
        location?: string;
        contactInfo?: {
          phone?: string;
          email?: string;
        };
      }
    ) => {
      if (!isSignedIn || !user) {
        error(
          'Authentication Required',
          'Please sign in to update your driver profile'
        );
        return;
      }

      setIsUpdating(true);
      try {
        await updateDriverProfileMutation({ profileId, ...updates });
        success(
          'Profile Updated',
          'Your driver profile has been updated successfully'
        );
      } catch (err) {
        console.error('Error updating driver profile:', err);
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to update driver profile';
        error('Update Failed', message);
        throw err;
      } finally {
        setIsUpdating(false);
      }
    },
    [isSignedIn, user, updateDriverProfileMutation, success, error]
  );

  return {
    driverProfiles,
    driverProfilesLoading,
    getDriverProfileById,
    createDriverProfile,
    updateDriverProfile,
    isCreating,
    isUpdating,
    isSignedIn,
  };
}

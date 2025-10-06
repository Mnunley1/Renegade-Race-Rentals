import { api } from '@renegade/convex/_generated/api';
import { useMutation, useQuery } from 'convex/react';

export const useDriverProfiles = () => {
  const createProfile = useMutation(api.driverProfiles.create);
  const updateProfile = useMutation(api.driverProfiles.update);
  const deleteProfile = useMutation(api.driverProfiles.deleteProfile);
  const getProfileByUser = useQuery(api.driverProfiles.getByUser);

  return {
    createProfile,
    updateProfile,
    deleteProfile,
    getProfileByUser,
  };
};

export const useDriverProfileById = (profileId: string) => {
  return useQuery(
    api.driverProfiles.getById,
    profileId ? { profileId } : 'skip',
  );
};

export const useDriverProfilesList = (filters?: {
  location?: string;
  experience?: 'beginner' | 'intermediate' | 'advanced' | 'professional';
  preferredCategories?: string[];
  availability?: string[];
}) => {
  return useQuery(api.driverProfiles.list, filters || {});
};

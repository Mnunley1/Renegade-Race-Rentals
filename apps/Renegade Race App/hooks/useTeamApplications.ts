import { api } from '@renegade/convex/_generated/api';
import { useMutation, useQuery } from 'convex/react';

export const useTeamApplications = () => {
  const applyToTeam = useMutation(api.teamApplications.apply);
  const updateApplicationStatus = useMutation(
    api.teamApplications.updateStatus,
  );

  return {
    applyToTeam,
    updateApplicationStatus,
  };
};

export const useApplicationsByTeam = (teamId: string) => {
  return useQuery(api.teamApplications.getByTeam, { teamId });
};

export const useApplicationsByDriver = () => {
  return useQuery(api.teamApplications.getByDriver);
};

export const useApplicationsByStatus = (
  status: 'pending' | 'accepted' | 'declined' | 'withdrawn',
) => {
  return useQuery(api.teamApplications.getByStatus, { status });
};

import { api } from '@renegade/convex/_generated/api';
import { useMutation, useQuery } from 'convex/react';

export const useTeams = () => {
  const createTeam = useMutation(api.teams.create);
  const updateTeam = useMutation(api.teams.update);
  const deleteTeam = useMutation(api.teams.deleteTeam);
  const getTeamsByOwner = useQuery(api.teams.getByOwner);

  return {
    createTeam,
    updateTeam,
    deleteTeam,
    getTeamsByOwner,
  };
};

export const useTeamById = (teamId: string) => {
  return useQuery(api.teams.getById, teamId ? { teamId } : 'skip');
};

export const useTeamsList = (filters?: {
  location?: string;
  specialties?: string[];
  availableSeats?: number;
}) => {
  return useQuery(api.teams.list, filters || {});
};

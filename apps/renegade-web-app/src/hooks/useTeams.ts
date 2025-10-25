import { api, Id } from '@/lib/convex';
import { useUser } from '@clerk/clerk-react';
import { useToast } from '@renegade/ui';
import { useMutation, useQuery } from 'convex/react';
import { useCallback, useState } from 'react';

export function useTeams() {
  const { user, isSignedIn } = useUser();
  const { success, error } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Queries
  const teams = useQuery(api.teams.list, {}) || [];
  const teamsLoading = teams === undefined;

  // Mutations
  const createTeamMutation = useMutation(api.teams.create);
  const updateTeamMutation = useMutation(api.teams.update);

  // Note: getTeamById should be called directly in components:
  // const team = useQuery(api.teams.getById, { teamId });

  // Create a new team
  const createTeam = useCallback(
    async (teamData: {
      name: string;
      description: string;
      logoUrl?: string;
      location: string;
      specialties: string[];
      availableSeats: number;
      requirements: string[];
      contactInfo: {
        phone?: string;
        email?: string;
        website?: string;
      };
      socialLinks?: {
        instagram?: string;
        twitter?: string;
        facebook?: string;
        linkedin?: string;
      };
    }) => {
      if (!isSignedIn || !user) {
        error('Authentication Required', 'Please sign in to create a team');
        return;
      }

      setIsCreating(true);
      try {
        const teamId = await createTeamMutation(teamData);
        success(
          'Team Created',
          'Your racing team has been created successfully'
        );
        return teamId;
      } catch (err) {
        console.error('Error creating team:', err);
        const message =
          err instanceof Error ? err.message : 'Failed to create team';
        error('Creation Failed', message);
        throw err;
      } finally {
        setIsCreating(false);
      }
    },
    [isSignedIn, user, createTeamMutation, success, error]
  );

  // Update team information
  const updateTeam = useCallback(
    async (
      teamId: Id<'teams'>,
      updates: {
        name?: string;
        description?: string;
        logoUrl?: string;
        location?: string;
        specialties?: string[];
        availableSeats?: number;
        requirements?: string[];
        contactInfo?: {
          phone?: string;
          email?: string;
          website?: string;
        };
        socialLinks?: {
          instagram?: string;
          twitter?: string;
          facebook?: string;
          linkedin?: string;
        };
      }
    ) => {
      if (!isSignedIn || !user) {
        error('Authentication Required', 'Please sign in to update your team');
        return;
      }

      setIsUpdating(true);
      try {
        await updateTeamMutation({ teamId, ...updates });
        success(
          'Team Updated',
          'Your team information has been updated successfully'
        );
      } catch (err) {
        console.error('Error updating team:', err);
        const message =
          err instanceof Error ? err.message : 'Failed to update team';
        error('Update Failed', message);
        throw err;
      } finally {
        setIsUpdating(false);
      }
    },
    [isSignedIn, user, updateTeamMutation, success, error]
  );

  return {
    teams,
    teamsLoading,
    createTeam,
    updateTeam,
    isCreating,
    isUpdating,
    isSignedIn,
  };
}

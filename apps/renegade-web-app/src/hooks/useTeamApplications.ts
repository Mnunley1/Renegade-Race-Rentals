import { api, Id } from '@/lib/convex';
import { useUser } from '@clerk/clerk-react';
import { useToast } from '@renegade/ui';
import { useMutation, useQuery } from 'convex/react';
import { useCallback, useState } from 'react';

export function useTeamApplications() {
  const { user, isSignedIn } = useUser();
  const { success, error } = useToast();
  const [isApplying, setIsApplying] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Queries
  const applications = useQuery(api.teamApplications.getByDriver, {}) || [];
  const applicationsLoading = applications === undefined;

  // Mutations
  const applyToTeamMutation = useMutation(api.teamApplications.apply);
  const updateApplicationStatusMutation = useMutation(
    api.teamApplications.updateStatus
  );

  // Note: These queries should be called directly in components:
  // const teamApplications = useQuery(api.teamApplications.getByTeam, { teamId });
  // const driverApplications = useQuery(api.teamApplications.getByDriver, {});

  // Apply to a team
  const applyToTeam = useCallback(
    async (applicationData: {
      teamId: Id<'teams'>;
      message: string;
      driverExperience: string;
      preferredDates: string[];
    }) => {
      if (!isSignedIn || !user) {
        error('Authentication Required', 'Please sign in to apply to teams');
        return;
      }

      setIsApplying(true);
      try {
        const applicationId = await applyToTeamMutation(applicationData);
        success(
          'Application Submitted',
          'Your application has been submitted successfully'
        );
        return applicationId;
      } catch (err) {
        console.error('Error applying to team:', err);
        const message =
          err instanceof Error ? err.message : 'Failed to submit application';
        error('Application Failed', message);
        throw err;
      } finally {
        setIsApplying(false);
      }
    },
    [isSignedIn, user, applyToTeamMutation, success, error]
  );

  // Update application status (for team owners)
  const updateApplicationStatus = useCallback(
    async (
      applicationId: Id<'teamApplications'>,
      status: 'accepted' | 'declined' | 'withdrawn'
    ) => {
      if (!isSignedIn || !user) {
        error(
          'Authentication Required',
          'Please sign in to manage applications'
        );
        return;
      }

      setIsUpdating(true);
      try {
        await updateApplicationStatusMutation({ applicationId, status });
        const statusMessage =
          status === 'accepted'
            ? 'accepted'
            : status === 'declined'
              ? 'declined'
              : 'withdrawn';
        success('Application Updated', `Application has been ${statusMessage}`);
      } catch (err) {
        console.error('Error updating application status:', err);
        const message =
          err instanceof Error ? err.message : 'Failed to update application';
        error('Update Failed', message);
        throw err;
      } finally {
        setIsUpdating(false);
      }
    },
    [isSignedIn, user, updateApplicationStatusMutation, success, error]
  );

  return {
    applications,
    applicationsLoading,
    applyToTeam,
    updateApplicationStatus,
    isApplying,
    isUpdating,
    isSignedIn,
  };
}

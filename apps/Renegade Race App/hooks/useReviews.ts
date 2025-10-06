import { api } from '@renegade/convex/_generated/api';
import { Id } from '@renegade/convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { toast } from 'sonner-native';
import { useConvexAuth } from './useConvexAuth';

export function useReviews() {
  const { userId } = useConvexAuth();

  // Queries
  const userReviews = useQuery(
    api.reviews.getByUser,
    userId ? { userId, role: 'reviewed' as const } : 'skip',
  );

  const userReviewStats = useQuery(
    api.reviews.getUserStats,
    userId ? { userId } : 'skip',
  );

  const pendingResponses = useQuery(
    api.reviews.getPendingResponses,
    userId ? { userId } : 'skip',
  );

  // Mutations
  const submitResponse = useMutation(api.reviews.submitResponse);
  const deleteReview = useMutation(api.reviews.deleteReview);

  // Mutation handlers with error handling
  const handleSubmitResponse = async (params: {
    reviewId: Id<'rentalReviews'>;
    response: string;
  }) => {
    try {
      const result = await submitResponse(params);
      toast.success('Response submitted successfully!');
      return result;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to submit response';
      toast.error(message);
      throw error;
    }
  };

  const handleDeleteReview = async (reviewId: Id<'rentalReviews'>) => {
    try {
      const result = await deleteReview({ reviewId });
      toast.success('Review deleted successfully');
      return result;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete review';
      toast.error(message);
      throw error;
    }
  };

  return {
    // Data
    userReviews,
    userReviewStats,
    pendingResponses,
    // Actions
    submitResponse: handleSubmitResponse,
    deleteReview: handleDeleteReview,
  };
}

// Hook for vehicle reviews
export function useVehicleReviews(vehicleId: Id<'vehicles'> | null) {
  const vehicleReviews = useQuery(
    api.reviews.getByVehicle,
    vehicleId ? { vehicleId } : 'skip',
  );

  const vehicleStats = useQuery(
    api.reviews.getVehicleStats,
    vehicleId ? { vehicleId } : 'skip',
  );

  return {
    vehicleReviews,
    vehicleStats,
  };
}

// Hook for user reviews (for viewing other users' reviews)
export function useUserReviews(targetUserId: string | null) {
  const userReviews = useQuery(
    api.reviews.getByUser,
    targetUserId ? { userId: targetUserId, role: 'reviewed' as const } : 'skip',
  );

  const userStats = useQuery(
    api.reviews.getUserStats,
    targetUserId ? { userId: targetUserId } : 'skip',
  );

  return {
    userReviews,
    userStats,
  };
}

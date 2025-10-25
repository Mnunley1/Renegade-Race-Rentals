import { api, Id } from '@/lib/convex';
import { useUser } from '@clerk/clerk-react';
import { useMutation, useQuery } from 'convex/react';

export function useReservations() {
  const { user } = useUser();
  const userId = user?.id;

  // Queries - using the actual function names from Convex
  const upcomingRenterReservations = useQuery(
    api.reservations.getUpcoming,
    userId ? { userId, role: 'renter' as const } : 'skip'
  );

  const upcomingOwnerReservations = useQuery(
    api.reservations.getUpcoming,
    userId ? { userId, role: 'owner' as const } : 'skip'
  );

  const pastRenterReservations = useQuery(
    api.reservations.getByUser,
    userId
      ? { userId, role: 'renter' as const, status: 'completed' as const }
      : 'skip'
  );

  const pastOwnerReservations = useQuery(
    api.reservations.getByUser,
    userId
      ? { userId, role: 'owner' as const, status: 'completed' as const }
      : 'skip'
  );

  // Mutations
  const createReservation = useMutation(api.reservations.create);
  const approveReservation = useMutation(api.reservations.approve);
  const declineReservation = useMutation(api.reservations.decline);
  const cancelReservation = useMutation(api.reservations.cancel);
  const completeReservation = useMutation(api.reservations.complete);

  // Mutation handlers with error handling
  const handleCreateReservation = async (params: {
    vehicleId: Id<'vehicles'>;
    startDate: string;
    endDate: string;
    pickupTime?: string;
    dropoffTime?: string;
    renterMessage?: string;
  }) => {
    try {
      const result = await createReservation(params);
      return result;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create reservation';
      throw new Error(message);
    }
  };

  const handleApproveReservation = async (params: {
    reservationId: Id<'reservations'>;
    ownerMessage?: string;
  }) => {
    try {
      const result = await approveReservation(params);
      return result;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to approve reservation';
      throw new Error(message);
    }
  };

  const handleDeclineReservation = async (params: {
    reservationId: Id<'reservations'>;
    ownerMessage?: string;
  }) => {
    try {
      const result = await declineReservation(params);
      return result;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to decline reservation';
      throw new Error(message);
    }
  };

  const handleCancelReservation = async (params: {
    reservationId: Id<'reservations'>;
    cancellationReason?: string;
  }) => {
    try {
      const result = await cancelReservation(params);
      return result;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to cancel reservation';
      throw new Error(message);
    }
  };

  const handleCompleteReservation = async (
    reservationId: Id<'reservations'>
  ) => {
    try {
      const result = await completeReservation({ reservationId });
      return result;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to complete reservation';
      throw new Error(message);
    }
  };

  return {
    // Data
    upcomingRenterReservations,
    upcomingOwnerReservations,
    pastRenterReservations,
    pastOwnerReservations,

    // Actions
    createReservation: handleCreateReservation,
    approveReservation: handleApproveReservation,
    declineReservation: handleDeclineReservation,
    cancelReservation: handleCancelReservation,
    completeReservation: handleCompleteReservation,
  };
}

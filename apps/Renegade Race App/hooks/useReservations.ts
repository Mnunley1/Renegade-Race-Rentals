import { api } from '@renegade/convex/_generated/api';
import { Id } from '@renegade/convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { toast } from 'sonner-native';
import { useConvexAuth } from './useConvexAuth';

export function useReservations() {
  const { userId } = useConvexAuth();

  // Queries
  const createReservation = useMutation(api.reservations.create);
  const approveReservation = useMutation(api.reservations.approve);
  const declineReservation = useMutation(api.reservations.decline);
  const cancelReservation = useMutation(api.reservations.cancel);
  const completeReservation = useMutation(api.reservations.complete);

  // Get user's reservations as renter
  const renterReservations = useQuery(
    api.reservations.getByUser,
    userId ? { userId, role: 'renter' as const } : 'skip',
  );

  // Get user's reservations as owner
  const ownerReservations = useQuery(
    api.reservations.getByUser,
    userId ? { userId, role: 'owner' as const } : 'skip',
  );

  // Get pending reservations for owner
  const pendingReservations = useQuery(
    api.reservations.getPendingForOwner,
    userId ? { ownerId: userId } : 'skip',
  );

  // Get confirmed reservations for owner
  const confirmedOwnerReservations = useQuery(
    api.reservations.getConfirmedForOwner,
    userId ? { ownerId: userId } : 'skip',
  );

  // Get upcoming reservations
  const upcomingRenterReservations = useQuery(
    api.reservations.getUpcoming,
    userId ? { userId, role: 'renter' as const } : 'skip',
  );

  const upcomingOwnerReservations = useQuery(
    api.reservations.getUpcoming,
    userId ? { userId, role: 'owner' as const } : 'skip',
  );

  // Mutation handlers with error handling
  const handleCreateReservation = async (params: {
    vehicleId: Id<'vehicles'>;
    startDate: string;
    endDate: string;
    renterMessage?: string;
  }) => {
    try {
      const result = await createReservation(params);
      toast.success('Booking request sent successfully!');
      return result;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create reservation';
      toast.error(message);
      throw error;
    }
  };

  const handleApproveReservation = async (params: {
    reservationId: Id<'reservations'>;
    ownerMessage?: string;
  }) => {
    try {
      const result = await approveReservation(params);
      toast.success('Reservation approved!');
      return result;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to approve reservation';
      toast.error(message);
      throw error;
    }
  };

  const handleDeclineReservation = async (params: {
    reservationId: Id<'reservations'>;
    ownerMessage?: string;
  }) => {
    try {
      const result = await declineReservation(params);
      toast.success('Reservation declined');
      return result;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to decline reservation';
      toast.error(message);
      throw error;
    }
  };

  const handleCancelReservation = async (params: {
    reservationId: Id<'reservations'>;
    cancellationReason?: string;
  }) => {
    try {
      const result = await cancelReservation(params);
      toast.success('Reservation cancelled');
      return result;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to cancel reservation';
      toast.error(message);
      throw error;
    }
  };

  const handleCompleteReservation = async (params: {
    reservationId: Id<'reservations'>;
  }) => {
    try {
      const result = await completeReservation(params);
      toast.success('Reservation completed');
      return result;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to complete reservation';
      toast.error(message);
      throw error;
    }
  };

  return {
    // Data
    renterReservations,
    ownerReservations,
    pendingReservations,
    confirmedOwnerReservations,
    upcomingRenterReservations,
    upcomingOwnerReservations,

    // Actions
    createReservation: handleCreateReservation,
    approveReservation: handleApproveReservation,
    declineReservation: handleDeclineReservation,
    cancelReservation: handleCancelReservation,
    completeReservation: handleCompleteReservation,
  };
}

export function useReservationById(id: Id<'reservations'> | null) {
  return useQuery(api.reservations.getById, id ? { id } : 'skip');
}

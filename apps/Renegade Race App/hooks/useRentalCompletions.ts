import { api } from '@renegade/convex/_generated/api';
import { Id } from '@renegade/convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { toast } from 'sonner-native';
import { useConvexAuth } from './useConvexAuth';

export function useRentalCompletions() {
  const { userId } = useConvexAuth();

  // Mutations
  const createCompletion = useMutation(api.rentalCompletions.create);
  const submitRenterReturnForm = useMutation(
    api.rentalCompletions.submitRenterReturnForm,
  );
  const submitOwnerReturnReview = useMutation(
    api.rentalCompletions.submitOwnerReturnReview,
  );
  const submitVehicleVitals = useMutation(
    api.rentalCompletions.submitVehicleVitals,
  );
  const submitReview = useMutation(api.rentalCompletions.submitReview);

  // Queries
  const pendingCompletions = useQuery(
    api.rentalCompletions.getPendingCompletions,
    userId ? { userId } : 'skip',
  );

  const renterCompletions = useQuery(
    api.rentalCompletions.getByUser,
    userId ? { userId, role: 'renter' as const } : 'skip',
  );

  const ownerCompletions = useQuery(
    api.rentalCompletions.getByUser,
    userId ? { userId, role: 'owner' as const } : 'skip',
  );

  // Mutation handlers with error handling
  const handleCreateCompletion = async (reservationId: Id<'reservations'>) => {
    try {
      const result = await createCompletion({ reservationId });
      toast.success('Rental completion process started!');
      return result;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to start completion process';
      toast.error(message);
      throw error;
    }
  };

  const handleSubmitRenterReturnForm = async (params: {
    completionId: Id<'rentalCompletions'>;
    returnDate: string;
    vehicleCondition: 'excellent' | 'good' | 'fair' | 'poor' | 'damaged';
    fuelLevel: 'full' | '3/4' | '1/2' | '1/4' | 'empty';
    mileage: number;
    notes?: string;
    photos: string[];
  }) => {
    try {
      const result = await submitRenterReturnForm(params);
      toast.success('Return form submitted successfully!');
      return result;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to submit return form';
      toast.error(message);
      throw error;
    }
  };

  const handleSubmitOwnerReturnReview = async (params: {
    completionId: Id<'rentalCompletions'>;
    vehicleReceived: boolean;
    conditionMatches: boolean;
    fuelLevelMatches: boolean;
    mileageMatches: boolean;
    damageReported?: string;
    photos: string[];
    notes?: string;
  }) => {
    try {
      const result = await submitOwnerReturnReview(params);
      toast.success('Return review submitted successfully!');
      return result;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to submit return review';
      toast.error(message);
      throw error;
    }
  };

  const handleSubmitVehicleVitals = async (params: {
    completionId: Id<'rentalCompletions'>;
    engineTemp?: number;
    oilPressure?: number;
    oilLevel?: 'full' | '3/4' | '1/2' | '1/4' | 'low';
    coolantLevel?: 'full' | '3/4' | '1/2' | '1/4' | 'low';
    tirePressure?: {
      frontLeft?: number;
      frontRight?: number;
      rearLeft?: number;
      rearRight?: number;
    };
    tireCondition?:
      | 'excellent'
      | 'good'
      | 'fair'
      | 'poor'
      | 'needs_replacement';
    brakePadCondition?:
      | 'excellent'
      | 'good'
      | 'fair'
      | 'poor'
      | 'needs_replacement';
    brakeFluidLevel?: 'full' | '3/4' | '1/2' | '1/4' | 'low';
    bodyCondition?: 'excellent' | 'good' | 'fair' | 'poor' | 'damaged';
    interiorCondition?: 'excellent' | 'good' | 'fair' | 'poor' | 'damaged';
    notes?: string;
  }) => {
    try {
      const result = await submitVehicleVitals(params);
      toast.success('Vehicle vitals submitted successfully!');
      return result;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to submit vehicle vitals';
      toast.error(message);
      throw error;
    }
  };

  const handleSubmitReview = async (params: {
    completionId: Id<'rentalCompletions'>;
    rating: number;
    communication?: number;
    vehicleCondition?: number;
    professionalism?: number;
    overallExperience?: number;
    title: string;
    review: string;
    photos?: string[];
  }) => {
    try {
      const result = await submitReview(params);
      toast.success('Review submitted successfully!');
      return result;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to submit review';
      toast.error(message);
      throw error;
    }
  };

  return {
    // Data
    pendingCompletions,
    renterCompletions,
    ownerCompletions,

    // Actions
    createCompletion: handleCreateCompletion,
    submitRenterReturnForm: handleSubmitRenterReturnForm,
    submitOwnerReturnReview: handleSubmitOwnerReturnReview,
    submitVehicleVitals: handleSubmitVehicleVitals,
    submitReview: handleSubmitReview,
  };
}

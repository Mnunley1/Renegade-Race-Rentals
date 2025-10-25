import { useToast } from '@renegade/ui';
import { api, Id } from '@/lib/convex';
import { useUser } from '@clerk/clerk-react';
import { useMutation, useQuery } from 'convex/react';
import { useCallback, useState } from 'react';

export function useRentalCompletions() {
  const { user, isSignedIn } = useUser();
  const { success, error } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Queries
  const pendingCompletions = useQuery(
    api.rentalCompletions.getPendingCompletions,
    user?.id ? { userId: user.id } : 'skip'
  );

  const userCompletions = useQuery(
    api.rentalCompletions.getByUser,
    user?.id ? { userId: user.id, role: 'renter' as const } : 'skip'
  );

  const ownerCompletions = useQuery(
    api.rentalCompletions.getByUser,
    user?.id ? { userId: user.id, role: 'owner' as const } : 'skip'
  );

  // Mutations
  const createCompletionMutation = useMutation(api.rentalCompletions.create);
  const submitRenterReturnFormMutation = useMutation(
    api.rentalCompletions.submitRenterReturnForm
  );
  const submitOwnerReturnReviewMutation = useMutation(
    api.rentalCompletions.submitOwnerReturnReview
  );
  const submitReviewMutation = useMutation(api.rentalCompletions.submitReview);
  const submitVehicleVitalsMutation = useMutation(
    api.rentalCompletions.submitVehicleVitals
  );

  // Actions
  const createCompletion = useCallback(
    async (reservationId: Id<'reservations'>) => {
      if (!isSignedIn || !user) {
        error(
          'Authentication Required',
          'Please sign in to create rental completion'
        );
        return;
      }

      setIsSubmitting(true);
      try {
        const result = await createCompletionMutation({ reservationId });
        success(
          'Rental Completion Started',
          'Rental completion process has been initiated'
        );
        return result;
      } catch (err) {
        console.error('Error creating rental completion:', err);
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to create rental completion';
        error('Creation Failed', message);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSignedIn, user, createCompletionMutation, success, error]
  );

  const submitRenterReturnForm = useCallback(
    async (params: {
      completionId: Id<'rentalCompletions'>;
      returnDate: string;
      vehicleCondition: 'excellent' | 'good' | 'fair' | 'poor' | 'damaged';
      fuelLevel: 'full' | '3/4' | '1/2' | '1/4' | 'empty';
      mileage: number;
      notes?: string;
      photos: string[];
    }) => {
      if (!isSignedIn || !user) {
        error(
          'Authentication Required',
          'Please sign in to submit return form'
        );
        return;
      }

      setIsSubmitting(true);
      try {
        const result = await submitRenterReturnFormMutation(params);
        success(
          'Return Form Submitted',
          'Your return form has been submitted successfully'
        );
        return result;
      } catch (err) {
        console.error('Error submitting return form:', err);
        const message =
          err instanceof Error ? err.message : 'Failed to submit return form';
        error('Submission Failed', message);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSignedIn, user, submitRenterReturnFormMutation, success, error]
  );

  const submitOwnerReturnReview = useCallback(
    async (params: {
      completionId: Id<'rentalCompletions'>;
      vehicleReceived: boolean;
      conditionMatches: boolean;
      fuelLevelMatches: boolean;
      mileageMatches: boolean;
      damageReported?: string;
      photos: string[];
      notes?: string;
    }) => {
      if (!isSignedIn || !user) {
        error(
          'Authentication Required',
          'Please sign in to submit return review'
        );
        return;
      }

      setIsSubmitting(true);
      try {
        const result = await submitOwnerReturnReviewMutation(params);
        success(
          'Return Review Submitted',
          'Your return review has been submitted successfully'
        );
        return result;
      } catch (err) {
        console.error('Error submitting return review:', err);
        const message =
          err instanceof Error ? err.message : 'Failed to submit return review';
        error('Submission Failed', message);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSignedIn, user, submitOwnerReturnReviewMutation, success, error]
  );

  const submitReview = useCallback(
    async (params: {
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
      if (!isSignedIn || !user) {
        error('Authentication Required', 'Please sign in to submit review');
        return;
      }

      setIsSubmitting(true);
      try {
        const result = await submitReviewMutation(params);
        success(
          'Review Submitted',
          'Your review has been submitted successfully'
        );
        return result;
      } catch (err) {
        console.error('Error submitting review:', err);
        const message =
          err instanceof Error ? err.message : 'Failed to submit review';
        error('Submission Failed', message);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSignedIn, user, submitReviewMutation, success, error]
  );

  const submitVehicleVitals = useCallback(
    async (params: {
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
      if (!isSignedIn || !user) {
        error(
          'Authentication Required',
          'Please sign in to submit vehicle vitals'
        );
        return;
      }

      setIsSubmitting(true);
      try {
        const result = await submitVehicleVitalsMutation(params);
        success(
          'Vehicle Vitals Submitted',
          'Vehicle vitals have been recorded successfully'
        );
        return result;
      } catch (err) {
        console.error('Error submitting vehicle vitals:', err);
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to submit vehicle vitals';
        error('Submission Failed', message);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSignedIn, user, submitVehicleVitalsMutation, success, error]
  );

  return {
    // Data
    pendingCompletions,
    userCompletions,
    ownerCompletions,

    // Actions
    createCompletion,
    submitRenterReturnForm,
    submitOwnerReturnReview,
    submitReview,
    submitVehicleVitals,

    // State
    isSubmitting,
    isSignedIn,
  };
}



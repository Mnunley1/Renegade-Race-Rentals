import { api } from '@renegade/convex/_generated/api';
import { Id } from '@renegade/convex/_generated/dataModel';
import { useAction, useMutation, useQuery } from 'convex/react';
import { useConvexAuth } from './useConvexAuth';

export function usePayments() {
  const { userId } = useConvexAuth();

  const createPaymentIntent = useAction(api.stripe.createPaymentIntent);
  const confirmPayment = useAction(api.stripe.confirmPayment);
  const processRefund = useAction(api.stripe.processRefund);
  const initializePlatformSettings = useMutation(
    api.stripe.initializePlatformSettings,
  );

  const userPayments = useQuery(
    api.stripe.getUserPayments,
    userId ? { userId } : 'skip',
  );

  const handleCreatePayment = async (
    reservationId: Id<'reservations'>,
    amount: number,
  ) => {
    try {
      const result = await createPaymentIntent({
        reservationId,
        amount,
      });
      return result;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  };

  const handleConfirmPayment = async (paymentId: Id<'payments'>) => {
    try {
      const result = await confirmPayment({ paymentId });
      return result;
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  };

  const handleRefund = async (
    paymentId: Id<'payments'>,
    amount?: number,
    reason?: string,
  ) => {
    try {
      const result = await processRefund({ paymentId, amount, reason });
      return result;
    } catch (error) {
      console.error('Error processing refund:', error);
      throw error;
    }
  };

  const initializeSettings = async () => {
    try {
      const result = await initializePlatformSettings({});
      return result;
    } catch (error) {
      console.error('Error initializing platform settings:', error);
      throw error;
    }
  };

  return {
    createPaymentIntent: handleCreatePayment,
    confirmPayment: handleConfirmPayment,
    processRefund: handleRefund,
    initializePlatformSettings: initializeSettings,
    userPayments,
  };
}

import { usePayments } from '@/hooks/usePayments';
import { Id } from '@/lib/convex';
import { formatCurrency } from '@/lib/utils';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@renegade/ui';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { CreditCard, Shield } from 'lucide-react';
import { useState } from 'react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservationId: Id<'reservations'>;
  amount: number;
  onSuccess: () => void;
}

export function PaymentModal({
  isOpen,
  onClose,
  reservationId,
  amount,
  onSuccess,
}: PaymentModalProps) {
  const { createPaymentIntent, confirmPayment } = usePayments();
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    if (!stripe || !elements) {
      setError('Stripe has not loaded yet. Please try again.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Create payment intent
      const { paymentId, clientSecret } = await createPaymentIntent(
        reservationId,
        amount
      );

      // Confirm payment with Stripe
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        setError('Card information is required.');
        return;
      }

      const { error: stripeError, paymentIntent } =
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
          },
        });

      if (stripeError) {
        setError(stripeError.message || 'Payment failed. Please try again.');
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        // Confirm payment in Convex
        const result = await confirmPayment(paymentId);

        if (result.success) {
          onSuccess();
          onClose();
        } else {
          setError(result.error || 'Payment confirmation failed.');
        }
      } else {
        setError('Payment was not successful. Please try again.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center'>
          {/* Overlay */}
          <div
            className='absolute inset-0 bg-black bg-opacity-50'
            onClick={onClose}
          />

          {/* Modal Content */}
          <div className='relative bg-white rounded-lg max-w-md w-full p-6 mx-4 shadow-xl'>
            <div className='flex justify-between items-center mb-4'>
              <div>
                <h2 className='text-2xl font-bold'>Complete Payment</h2>
                <p className='text-sm text-gray-600 mt-1'>
                  Enter your payment details to complete your vehicle rental
                  booking.
                </p>
              </div>
              <button
                onClick={onClose}
                className='text-gray-500 hover:text-gray-700 text-2xl font-bold'
              >
                ×
              </button>
            </div>

            <div className='space-y-6'>
              {/* Payment Amount */}
              <Card>
                <CardContent className='p-4'>
                  <div className='text-center'>
                    <p className='text-2xl font-bold text-gray-900'>
                      {formatCurrency(amount / 100)}
                    </p>
                    <p className='text-sm text-gray-600 mt-1'>
                      Track insurance included
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center'>
                    <CreditCard className='h-5 w-5 mr-2' />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    <div className='p-4 border rounded-lg'>
                      <CardElement
                        options={{
                          style: {
                            base: {
                              fontSize: '16px',
                              color: '#424770',
                              '::placeholder': {
                                color: '#aab7c4',
                              },
                            },
                            invalid: {
                              color: '#9e2146',
                            },
                          },
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Error Message */}
              {error && (
                <div className='p-4 bg-red-50 border border-red-200 rounded-lg'>
                  <p className='text-red-800 text-sm'>{error}</p>
                </div>
              )}

              {/* Payment Button */}
              <Button
                onClick={handlePayment}
                disabled={loading}
                className='w-full'
                size='lg'
              >
                {loading ? (
                  <>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2' />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className='h-4 w-4 mr-2' />
                    Pay Now
                  </>
                )}
              </Button>

              {/* Cancel Button */}
              <Button variant='outline' onClick={onClose} className='w-full'>
                Cancel
              </Button>

              {/* Security Notice */}
              <div className='text-center'>
                <div className='flex items-center justify-center space-x-2 text-sm text-gray-500'>
                  <Shield className='h-4 w-4' />
                  <span>
                    Your payment is processed securely by Stripe. We never store
                    your card details.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

import { Id } from '@renegade/convex/_generated/dataModel';
import { useStripe } from '@stripe/stripe-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  Text,
  View,
} from 'react-native';
import { usePayments } from '../hooks/usePayments';

interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  reservationId: Id<'reservations'>;
  amount: number;
  onSuccess: () => void;
}

export default function PaymentModal({
  visible,
  onClose,
  reservationId,
  amount,
  onSuccess,
}: PaymentModalProps) {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { createPaymentIntent, confirmPayment } = usePayments();
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);

      // Create payment intent
      const { paymentId, clientSecret } = await createPaymentIntent(
        reservationId,
        amount,
      );

      // Initialize payment sheet
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'Renegade Race App',
        allowsDelayedPaymentMethods: true,
      });

      if (initError) {
        Alert.alert('Error', initError.message);
        return;
      }

      // Present payment sheet
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        Alert.alert('Error', presentError.message);
        return;
      }

      // Confirm payment
      const result = await confirmPayment(paymentId);

      if (result.success) {
        Alert.alert('Success', 'Payment completed successfully!');
        onSuccess();
        onClose();
      } else {
        Alert.alert(
          'Error',
          result.error || 'Payment failed. Please try again.',
        );
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Error', 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={{ flex: 1, padding: 20, backgroundColor: 'white' }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
          Complete Payment
        </Text>

        <View style={{ marginBottom: 30 }}>
          <Text style={{ fontSize: 18, marginBottom: 10 }}>
            Amount: ${(amount / 100).toFixed(2)}
          </Text>
          <Text style={{ fontSize: 14, color: '#6b7280' }}>
            Track insurance included
          </Text>
        </View>

        <Pressable
          onPress={handlePayment}
          disabled={loading}
          style={{
            backgroundColor: loading ? '#ccc' : '#FF5A5F',
            padding: 15,
            borderRadius: 8,
            alignItems: 'center',
            marginBottom: 20,
            flexDirection: 'row',
            justifyContent: 'center',
          }}
        >
          {loading && (
            <ActivityIndicator
              color="white"
              size="small"
              style={{ marginRight: 10 }}
            />
          )}
          <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
            {loading ? 'Processing...' : 'Pay Now'}
          </Text>
        </Pressable>

        <Pressable
          onPress={onClose}
          style={{
            padding: 15,
            borderRadius: 8,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#e5e7eb',
          }}
        >
          <Text style={{ color: '#6b7280', fontSize: 16 }}>Cancel</Text>
        </Pressable>

        <View style={{ marginTop: 30 }}>
          <Text style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center' }}>
            Your payment is processed securely by Stripe. We never store your
            card details.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

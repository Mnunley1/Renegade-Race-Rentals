import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Camera, CheckCircle, Star } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

import ReviewModal from '../../../components/ReviewModal';
import { useConvexAuth } from '../../../hooks/useConvexAuth';
import { useRentalCompletions } from '../../../hooks/useRentalCompletions';
import { useReservationById } from '../../../hooks/useReservations';

export default function RentalCompletionForm() {
  const router = useRouter();
  const { id: reservationId } = useLocalSearchParams();
  const { userId } = useConvexAuth();
  const {
    pendingCompletions,
    submitRenterReturnForm,
    submitVehicleVitals,
    submitReview,
  } = useRentalCompletions();

  // Check if the ID is a completion ID or reservation ID
  const isCompletionId = pendingCompletions?.some(
    (c) => c._id === reservationId,
  );

  let reservation: any = null;
  let completion: any = null;

  if (isCompletionId) {
    // If it's a completion ID, find the completion and then the reservation
    completion = pendingCompletions?.find((c) => c._id === reservationId);
    if (completion) {
      // We need to get the reservation data for this completion
      // For now, we'll use the completion data directly
      reservation = {
        _id: completion.reservationId,
        vehicle: completion.vehicle,
        startDate: completion.startDate,
        endDate: completion.endDate,
        // Add other fields as needed
      };
    }
  } else {
    // If it's a reservation ID, get the reservation normally
    reservation = useReservationById(reservationId as any);
  }

  console.log('ID from params:', reservationId);
  console.log('Is completion ID:', isCompletionId);
  console.log('Completion:', completion);
  console.log('Reservation:', reservation);

  const [loading, setLoading] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    returnDate: new Date().toISOString().split('T')[0],
    mileage: '',
    notes: '',
    vehicleCondition: 'excellent',
    fuelLevel: 'full',
    engineTemp: '',
    oilPressure: '',
    oilLevel: 'full',
    coolantLevel: 'full',
    tirePressure: '',
    tireCondition: 'excellent',
    brakeCondition: 'excellent',
    brakeFluid: 'full',
    bodyCondition: 'excellent',
    interiorCondition: 'excellent',
  });

  const handleBack = () => {
    router.back();
  };

  const handleSubmit = async () => {
    if (!reservation || !userId) return;

    // Validate required fields
    if (!formData.mileage.trim()) {
      toast.error('Please enter the current mileage');
      return;
    }

    // Get the completion record - either from the URL or by finding it
    let completion = null;
    if (isCompletionId) {
      completion = pendingCompletions?.find((c) => c._id === reservationId);
    } else {
      // Find the rental completion record for this reservation
      completion = pendingCompletions?.find(
        (c) => c.reservationId === reservation._id,
      );
    }

    console.log('Reservation:', reservation);
    console.log('Pending Completions:', pendingCompletions);
    console.log('Found Completion:', completion);

    if (!completion) {
      toast.error(
        'Rental completion not found. Please start the return process first.',
      );
      return;
    }

    setLoading(true);
    try {
      // Submit the return form
      await submitRenterReturnForm({
        completionId: completion._id,
        returnDate: formData.returnDate,
        mileage: parseInt(formData.mileage),
        notes: formData.notes.trim() || undefined,
        vehicleCondition: formData.vehicleCondition,
        fuelLevel: formData.fuelLevel,
        photos: [], // TODO: Implement photo upload
      });

      // Submit vehicle vitals if provided
      if (
        formData.engineTemp ||
        formData.oilPressure ||
        formData.tirePressure
      ) {
        await submitVehicleVitals({
          completionId: completion._id,
          engineTemp: formData.engineTemp
            ? parseInt(formData.engineTemp)
            : undefined,
          oilPressure: formData.oilPressure
            ? parseInt(formData.oilPressure)
            : undefined,
          oilLevel: formData.oilLevel,
          coolantLevel: formData.coolantLevel,
          tirePressure: formData.tirePressure
            ? {
                frontLeft: parseInt(formData.tirePressure),
                frontRight: parseInt(formData.tirePressure),
                rearLeft: parseInt(formData.tirePressure),
                rearRight: parseInt(formData.tirePressure),
              }
            : undefined,
          tireCondition: formData.tireCondition,
          brakePadCondition: formData.brakeCondition,
          brakeFluidLevel: formData.brakeFluid,
          bodyCondition: formData.bodyCondition,
          interiorCondition: formData.interiorCondition,
        });
      }

      toast.success('Return form submitted successfully!');
      router.back();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to submit return form');
    } finally {
      setLoading(false);
    }
  };

  const renderConditionSelector = (
    label: string,
    value: string,
    options: { value: string; label: string }[],
    onChange: (value: string) => void,
  ) => (
    <View style={styles.formGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.optionGroup}>
        {options.map((option) => (
          <Pressable
            key={option.value}
            style={[
              styles.optionButton,
              value === option.value && styles.optionButtonActive,
            ]}
            onPress={() => onChange(option.value)}
          >
            <Text
              style={[
                styles.optionText,
                value === option.value && styles.optionTextActive,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

  if (!reservation) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF5A5F" />
          <Text style={styles.loadingText}>Loading reservation details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={20} color="#6b7280" />
        </Pressable>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Vehicle Return Form</Text>
          <Text style={styles.headerSubtitle}>
            Complete your vehicle return process
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Vehicle Info */}
        <View style={styles.vehicleInfo}>
          <Text style={styles.sectionTitle}>Vehicle Details</Text>
          <Text style={styles.vehicleTitle}>
            {reservation.vehicle?.year} {reservation.vehicle?.make}{' '}
            {reservation.vehicle?.model}
          </Text>
          <Text style={styles.vehicleDates}>
            Rental Period:{' '}
            {new Date(reservation.startDate).toLocaleDateString()} -{' '}
            {new Date(reservation.endDate).toLocaleDateString()}
          </Text>
        </View>

        {/* Return Form */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Return Information</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Return Date *</Text>
            <TextInput
              style={styles.input}
              value={formData.returnDate}
              onChangeText={(text) =>
                setFormData({ ...formData, returnDate: text })
              }
              placeholder="YYYY-MM-DD"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Current Mileage *</Text>
            <TextInput
              style={styles.input}
              value={formData.mileage}
              onChangeText={(text) =>
                setFormData({ ...formData, mileage: text })
              }
              placeholder="Enter current mileage"
              keyboardType="numeric"
            />
          </View>

          {renderConditionSelector(
            'Vehicle Condition',
            formData.vehicleCondition,
            [
              { value: 'excellent', label: 'Excellent' },
              { value: 'good', label: 'Good' },
              { value: 'fair', label: 'Fair' },
              { value: 'poor', label: 'Poor' },
              { value: 'damaged', label: 'Damaged' },
            ],
            (value) => setFormData({ ...formData, vehicleCondition: value }),
          )}

          {renderConditionSelector(
            'Fuel Level',
            formData.fuelLevel,
            [
              { value: 'full', label: 'Full' },
              { value: '3/4', label: '3/4' },
              { value: '1/2', label: '1/2' },
              { value: '1/4', label: '1/4' },
              { value: 'empty', label: 'Empty' },
            ],
            (value) => setFormData({ ...formData, fuelLevel: value }),
          )}

          <View style={styles.formGroup}>
            <Text style={styles.label}>Additional Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.notes}
              onChangeText={(text) => setFormData({ ...formData, notes: text })}
              placeholder="Any additional notes about the vehicle condition..."
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Photo Upload Placeholder */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Photos (Optional)</Text>
            <Pressable style={styles.photoUploadButton}>
              <Camera size={20} color="#6b7280" />
              <Text style={styles.photoUploadText}>Add Photos</Text>
            </Pressable>
            <Text style={styles.helperText}>
              Take photos of any damage or notable condition issues
            </Text>
          </View>
        </View>

        {/* Vehicle Vitals */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Vehicle Vitals (Optional)</Text>
          <Text style={styles.sectionSubtitle}>
            Track-specific vehicle condition details
          </Text>

          <View style={styles.vitalsGrid}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Engine Temp (°F)</Text>
              <TextInput
                style={styles.input}
                value={formData.engineTemp}
                onChangeText={(text) =>
                  setFormData({ ...formData, engineTemp: text })
                }
                placeholder="180"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Oil Pressure (PSI)</Text>
              <TextInput
                style={styles.input}
                value={formData.oilPressure}
                onChangeText={(text) =>
                  setFormData({ ...formData, oilPressure: text })
                }
                placeholder="45"
                keyboardType="numeric"
              />
            </View>
          </View>

          {renderConditionSelector(
            'Oil Level',
            formData.oilLevel,
            [
              { value: 'full', label: 'Full' },
              { value: '3/4', label: '3/4' },
              { value: '1/2', label: '1/2' },
              { value: '1/4', label: '1/4' },
              { value: 'low', label: 'Low' },
            ],
            (value) => setFormData({ ...formData, oilLevel: value }),
          )}

          {renderConditionSelector(
            'Coolant Level',
            formData.coolantLevel,
            [
              { value: 'full', label: 'Full' },
              { value: '3/4', label: '3/4' },
              { value: '1/2', label: '1/2' },
              { value: '1/4', label: '1/4' },
              { value: 'low', label: 'Low' },
            ],
            (value) => setFormData({ ...formData, coolantLevel: value }),
          )}

          <View style={styles.vitalsGrid}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Tire Pressure (PSI)</Text>
              <TextInput
                style={styles.input}
                value={formData.tirePressure}
                onChangeText={(text) =>
                  setFormData({ ...formData, tirePressure: text })
                }
                placeholder="32"
                keyboardType="numeric"
              />
            </View>
          </View>

          {renderConditionSelector(
            'Tire Condition',
            formData.tireCondition,
            [
              { value: 'excellent', label: 'Excellent' },
              { value: 'good', label: 'Good' },
              { value: 'fair', label: 'Fair' },
              { value: 'poor', label: 'Poor' },
              { value: 'needs_replacement', label: 'Needs Replacement' },
            ],
            (value) => setFormData({ ...formData, tireCondition: value }),
          )}

          {renderConditionSelector(
            'Brake Condition',
            formData.brakeCondition,
            [
              { value: 'excellent', label: 'Excellent' },
              { value: 'good', label: 'Good' },
              { value: 'fair', label: 'Fair' },
              { value: 'poor', label: 'Poor' },
              { value: 'needs_replacement', label: 'Needs Replacement' },
            ],
            (value) => setFormData({ ...formData, brakeCondition: value }),
          )}

          {renderConditionSelector(
            'Brake Fluid',
            formData.brakeFluid,
            [
              { value: 'full', label: 'Full' },
              { value: '3/4', label: '3/4' },
              { value: '1/2', label: '1/2' },
              { value: '1/4', label: '1/4' },
              { value: 'low', label: 'Low' },
            ],
            (value) => setFormData({ ...formData, brakeFluid: value }),
          )}

          {renderConditionSelector(
            'Body Condition',
            formData.bodyCondition,
            [
              { value: 'excellent', label: 'Excellent' },
              { value: 'good', label: 'Good' },
              { value: 'fair', label: 'Fair' },
              { value: 'poor', label: 'Poor' },
              { value: 'damaged', label: 'Damaged' },
            ],
            (value) => setFormData({ ...formData, bodyCondition: value }),
          )}

          {renderConditionSelector(
            'Interior Condition',
            formData.interiorCondition,
            [
              { value: 'excellent', label: 'Excellent' },
              { value: 'good', label: 'Good' },
              { value: 'fair', label: 'Fair' },
              { value: 'poor', label: 'Poor' },
              { value: 'damaged', label: 'Damaged' },
            ],
            (value) => setFormData({ ...formData, interiorCondition: value }),
          )}
        </View>

        {/* Submit Button */}
        <View style={styles.submitSection}>
          <Pressable
            style={[
              styles.submitButton,
              loading && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <CheckCircle size={20} color="#ffffff" />
                <Text style={styles.submitButtonText}>Submit Return Form</Text>
              </>
            )}
          </Pressable>

          {/* Review Button */}
          <Pressable
            style={styles.reviewButton}
            onPress={() => setReviewModalVisible(true)}
          >
            <Star size={20} color="#FF5A5F" />
            <Text style={styles.reviewButtonText}>Write a Review</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Review Modal */}
      <ReviewModal
        visible={reviewModalVisible}
        onClose={() => setReviewModalVisible(false)}
        onSubmit={async (reviewData) => {
          try {
            await submitReview(reviewData);
            setReviewModalVisible(false);
          } catch (error) {
            console.error('Error submitting review:', error);
          }
        }}
        completionId={completion?._id}
        vehicleName={
          reservation?.vehicle?.make + ' ' + reservation?.vehicle?.model
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
  },
  vehicleInfo: {
    backgroundColor: '#ffffff',
    padding: 20,
    margin: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  vehicleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  vehicleDates: {
    fontSize: 14,
    color: '#6b7280',
  },
  formSection: {
    backgroundColor: '#ffffff',
    padding: 20,
    margin: 20,
    marginTop: 0,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
    lineHeight: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  optionGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
  optionButtonActive: {
    backgroundColor: '#FF5A5F',
    borderColor: '#FF5A5F',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  optionTextActive: {
    color: '#ffffff',
  },
  vitalsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  photoUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    borderRadius: 8,
    backgroundColor: '#f9fafb',
  },
  photoUploadText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  helperText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
    lineHeight: 16,
  },
  submitSection: {
    padding: 20,
    paddingBottom: 40,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#FF5A5F',
    shadowColor: '#FF5A5F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#FF5A5F',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginTop: 12,
    gap: 8,
  },
  reviewButtonText: {
    color: '#FF5A5F',
    fontSize: 16,
    fontWeight: '600',
  },
});

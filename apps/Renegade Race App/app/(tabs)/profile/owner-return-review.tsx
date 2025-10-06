import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  AlertTriangle,
  ArrowLeft,
  Camera,
  CheckCircle,
  X,
} from 'lucide-react-native';
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

import { useConvexAuth } from '../../../hooks/useConvexAuth';
import { useRentalCompletions } from '../../../hooks/useRentalCompletions';

export default function OwnerReturnReview() {
  const router = useRouter();
  const { id: completionId } = useLocalSearchParams();
  const { userId } = useConvexAuth();
  const { pendingCompletions, submitOwnerReturnReview } =
    useRentalCompletions();

  // Find the completion record
  const completion = pendingCompletions?.find((c) => c._id === completionId);

  // Get the reservation data from the completion
  const reservation = completion
    ? {
        _id: completion.reservationId,
        vehicle: completion.vehicle,
        startDate: completion.startDate,
        endDate: completion.endDate,
        // Add other fields as needed
      }
    : null;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    vehicleReceived: true,
    conditionMatches: true,
    fuelLevelMatches: true,
    mileageMatches: true,
    damageReported: '',
    notes: '',
    photos: [],
  });

  const handleBack = () => {
    router.back();
  };

  const handleSubmit = async () => {
    if (!reservation || !userId) return;

    // Validate required fields
    if (!formData.vehicleReceived && !formData.damageReported.trim()) {
      toast.error(
        'Please provide details about why the vehicle was not received',
      );
      return;
    }

    setLoading(true);
    try {
      await submitOwnerReturnReview({
        completionId: completionId as any,
        vehicleReceived: formData.vehicleReceived,
        conditionMatches: formData.conditionMatches,
        fuelLevelMatches: formData.fuelLevelMatches,
        mileageMatches: formData.mileageMatches,
        damageReported: formData.damageReported.trim() || undefined,
        notes: formData.notes.trim() || undefined,
        photos: [], // TODO: Implement photo upload
      });

      toast.success('Return review submitted successfully!');
      router.back();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit return review');
    } finally {
      setLoading(false);
    }
  };

  const renderBooleanQuestion = (
    label: string,
    value: boolean,
    onChange: (value: boolean) => void,
    description?: string,
  ) => (
    <View style={styles.formGroup}>
      <Text style={styles.label}>{label}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      <View style={styles.booleanGroup}>
        <Pressable
          style={[
            styles.booleanButton,
            value === true && styles.booleanButtonActive,
          ]}
          onPress={() => onChange(true)}
        >
          <CheckCircle
            size={16}
            color={value === true ? '#ffffff' : '#6b7280'}
          />
          <Text
            style={[
              styles.booleanText,
              value === true && styles.booleanTextActive,
            ]}
          >
            Yes
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.booleanButton,
            value === false && styles.booleanButtonActive,
          ]}
          onPress={() => onChange(false)}
        >
          <X size={16} color={value === false ? '#ffffff' : '#6b7280'} />
          <Text
            style={[
              styles.booleanText,
              value === false && styles.booleanTextActive,
            ]}
          >
            No
          </Text>
        </Pressable>
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
          <Text style={styles.headerTitle}>Vehicle Return Review</Text>
          <Text style={styles.headerSubtitle}>
            Review the returned vehicle condition
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

        {/* Renter's Return Form Summary */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Renter's Return Details</Text>

          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Return Date</Text>
              <Text style={styles.summaryValue}>
                {reservation.returnDate
                  ? new Date(reservation.returnDate).toLocaleDateString()
                  : 'Not specified'}
              </Text>
            </View>

            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Mileage</Text>
              <Text style={styles.summaryValue}>
                {reservation.mileage
                  ? `${reservation.mileage} miles`
                  : 'Not specified'}
              </Text>
            </View>

            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Condition</Text>
              <Text style={styles.summaryValue}>
                {reservation.vehicleCondition
                  ? reservation.vehicleCondition.charAt(0).toUpperCase() +
                    reservation.vehicleCondition.slice(1)
                  : 'Not specified'}
              </Text>
            </View>

            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Fuel Level</Text>
              <Text style={styles.summaryValue}>
                {reservation.fuelLevel
                  ? reservation.fuelLevel.charAt(0).toUpperCase() +
                    reservation.fuelLevel.slice(1)
                  : 'Not specified'}
              </Text>
            </View>
          </View>

          {reservation.notes && (
            <View style={styles.notesSection}>
              <Text style={styles.notesLabel}>Renter's Notes:</Text>
              <Text style={styles.notesText}>{reservation.notes}</Text>
            </View>
          )}

          {/* Photo Placeholder */}
          <View style={styles.photoSection}>
            <Text style={styles.photoLabel}>Photos Submitted:</Text>
            <View style={styles.photoPlaceholder}>
              <Camera size={24} color="#6b7280" />
              <Text style={styles.photoPlaceholderText}>
                {reservation.photos?.length || 0} photos
              </Text>
            </View>
          </View>
        </View>

        {/* Owner's Review Form */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Your Review</Text>
          <Text style={styles.sectionSubtitle}>
            Please review the returned vehicle and confirm the details
          </Text>

          {renderBooleanQuestion(
            'Vehicle Received',
            formData.vehicleReceived,
            (value) => setFormData({ ...formData, vehicleReceived: value }),
            'Did you receive the vehicle back from the renter?',
          )}

          {formData.vehicleReceived && (
            <>
              {renderBooleanQuestion(
                'Condition Matches',
                formData.conditionMatches,
                (value) =>
                  setFormData({ ...formData, conditionMatches: value }),
                'Does the vehicle condition match what the renter reported?',
              )}

              {renderBooleanQuestion(
                'Fuel Level Matches',
                formData.fuelLevelMatches,
                (value) =>
                  setFormData({ ...formData, fuelLevelMatches: value }),
                'Does the fuel level match what the renter reported?',
              )}

              {renderBooleanQuestion(
                'Mileage Matches',
                formData.mileageMatches,
                (value) => setFormData({ ...formData, mileageMatches: value }),
                'Does the mileage match what the renter reported?',
              )}

              {(!formData.conditionMatches ||
                !formData.fuelLevelMatches ||
                !formData.mileageMatches) && (
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Damage/Discrepancy Report *</Text>
                  <Text style={styles.description}>
                    Please describe any damage or discrepancies found
                  </Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={formData.damageReported}
                    onChangeText={(text) =>
                      setFormData({ ...formData, damageReported: text })
                    }
                    placeholder="Describe any damage, discrepancies, or issues found..."
                    multiline
                    numberOfLines={4}
                  />
                </View>
              )}
            </>
          )}

          {!formData.vehicleReceived && (
            <View style={styles.warningSection}>
              <AlertTriangle size={20} color="#dc2626" />
              <Text style={styles.warningText}>
                Warning: Vehicle not received. Please provide detailed
                explanation below.
              </Text>
            </View>
          )}

          <View style={styles.formGroup}>
            <Text style={styles.label}>Additional Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.notes}
              onChangeText={(text) => setFormData({ ...formData, notes: text })}
              placeholder="Any additional notes about the return process..."
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Photo Upload Placeholder */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Your Photos (Optional)</Text>
            <Pressable style={styles.photoUploadButton}>
              <Camera size={20} color="#6b7280" />
              <Text style={styles.photoUploadText}>Add Photos</Text>
            </Pressable>
            <Text style={styles.helperText}>
              Take photos to document any damage or condition issues
            </Text>
          </View>
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
                <Text style={styles.submitButtonText}>Submit Review</Text>
              </>
            )}
          </Pressable>
        </View>
      </ScrollView>
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
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 20,
  },
  summaryItem: {
    flex: 1,
    minWidth: '45%',
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  notesSection: {
    marginBottom: 20,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  notesText: {
    fontSize: 14,
    color: '#111827',
    lineHeight: 20,
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
  },
  photoSection: {
    marginBottom: 20,
  },
  photoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  photoPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  photoPlaceholderText: {
    fontSize: 14,
    color: '#6b7280',
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
  description: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 16,
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
  booleanGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  booleanButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
  booleanButtonActive: {
    backgroundColor: '#FF5A5F',
    borderColor: '#FF5A5F',
  },
  booleanText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  booleanTextActive: {
    color: '#ffffff',
  },
  warningSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
    marginBottom: 20,
  },
  warningText: {
    fontSize: 14,
    color: '#dc2626',
    flex: 1,
    lineHeight: 20,
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
});

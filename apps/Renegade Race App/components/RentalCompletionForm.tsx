import { Id } from '@renegade/convex/_generated/dataModel';
import { Image } from 'expo-image';
import { Camera, CheckCircle, X } from 'lucide-react-native';
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
import { toast } from 'sonner-native';
import { useRentalCompletions } from '../hooks/useRentalCompletions';

interface RentalCompletionFormProps {
  completionId: Id<'rentalCompletions'>;
  vehicleName: string;
  onComplete: () => void;
  onCancel: () => void;
}

export function RentalCompletionForm({
  completionId,
  vehicleName,
  onComplete,
  onCancel,
}: RentalCompletionFormProps) {
  const { submitRenterReturnForm, submitVehicleVitals } =
    useRentalCompletions();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [returnDate, setReturnDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [vehicleCondition, setVehicleCondition] = useState<
    'excellent' | 'good' | 'fair' | 'poor' | 'damaged'
  >('good');
  const [fuelLevel, setFuelLevel] = useState<
    'full' | '3/4' | '1/2' | '1/4' | 'empty'
  >('1/2');
  const [mileage, setMileage] = useState('');
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  // Vehicle vitals state
  const [engineTemp, setEngineTemp] = useState('');
  const [oilPressure, setOilPressure] = useState('');
  const [oilLevel, setOilLevel] = useState<
    'full' | '3/4' | '1/2' | '1/4' | 'low'
  >('1/2');
  const [coolantLevel, setCoolantLevel] = useState<
    'full' | '3/4' | '1/2' | '1/4' | 'low'
  >('1/2');
  const [tirePressure, setTirePressure] = useState({
    frontLeft: '',
    frontRight: '',
    rearLeft: '',
    rearRight: '',
  });
  const [tireCondition, setTireCondition] = useState<
    'excellent' | 'good' | 'fair' | 'poor' | 'needs_replacement'
  >('good');
  const [brakePadCondition, setBrakePadCondition] = useState<
    'excellent' | 'good' | 'fair' | 'poor' | 'needs_replacement'
  >('good');
  const [brakeFluidLevel, setBrakeFluidLevel] = useState<
    'full' | '3/4' | '1/2' | '1/4' | 'low'
  >('1/2');
  const [bodyCondition, setBodyCondition] = useState<
    'excellent' | 'good' | 'fair' | 'poor' | 'damaged'
  >('good');
  const [interiorCondition, setInteriorCondition] = useState<
    'excellent' | 'good' | 'fair' | 'poor' | 'damaged'
  >('good');
  const [vitalsNotes, setVitalsNotes] = useState('');

  const handleAddPhoto = () => {
    // TODO: Implement photo capture/upload
    // For now, we'll simulate adding a photo
    const mockPhotoUrl = `https://picsum.photos/300/200?random=${Date.now()}`;
    setPhotos([...photos, mockPhotoUrl]);
    toast.success('Photo added (mock)');
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!mileage.trim()) {
      toast.error('Please enter the current mileage');
      return;
    }

    if (photos.length === 0) {
      toast.error('Please add at least one photo of the vehicle');
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit return form
      await submitRenterReturnForm({
        completionId,
        returnDate,
        vehicleCondition,
        fuelLevel,
        mileage: parseInt(mileage),
        notes,
        photos,
      });

      // Submit vehicle vitals if any are filled
      const hasVitals =
        engineTemp ||
        oilPressure ||
        vitalsNotes ||
        tirePressure.frontLeft ||
        tirePressure.frontRight ||
        tirePressure.rearLeft ||
        tirePressure.rearRight;

      if (hasVitals) {
        await submitVehicleVitals({
          completionId,
          engineTemp: engineTemp ? parseFloat(engineTemp) : undefined,
          oilPressure: oilPressure ? parseFloat(oilPressure) : undefined,
          oilLevel,
          coolantLevel,
          tirePressure: {
            frontLeft: tirePressure.frontLeft
              ? parseFloat(tirePressure.frontLeft)
              : undefined,
            frontRight: tirePressure.frontRight
              ? parseFloat(tirePressure.frontRight)
              : undefined,
            rearLeft: tirePressure.rearLeft
              ? parseFloat(tirePressure.rearLeft)
              : undefined,
            rearRight: tirePressure.rearRight
              ? parseFloat(tirePressure.rearRight)
              : undefined,
          },
          tireCondition,
          brakePadCondition,
          brakeFluidLevel,
          bodyCondition,
          interiorCondition,
          notes: vitalsNotes,
        });
      }

      toast.success('Return form submitted successfully!');
      onComplete();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderConditionSelector = (
    value: string,
    onChange: (value: any) => void,
    options: { value: string; label: string; color: string }[],
    title: string,
  ) => (
    <View style={styles.conditionSelector}>
      <Text style={styles.conditionTitle}>{title}</Text>
      <View style={styles.conditionOptions}>
        {options.map((option) => (
          <Pressable
            key={option.value}
            style={[
              styles.conditionOption,
              value === option.value && styles.conditionOptionSelected,
            ]}
            onPress={() => onChange(option.value)}
          >
            <Text
              style={[
                styles.conditionOptionText,
                value === option.value && styles.conditionOptionTextSelected,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Vehicle Return Form</Text>
        <Text style={styles.subtitle}>{vehicleName}</Text>
      </View>

      {/* Basic Return Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Return Details</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Return Date</Text>
          <TextInput
            style={styles.input}
            value={returnDate}
            onChangeText={setReturnDate}
            placeholder="YYYY-MM-DD"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Current Mileage</Text>
          <TextInput
            style={styles.input}
            value={mileage}
            onChangeText={setMileage}
            placeholder="Enter current mileage"
            keyboardType="numeric"
          />
        </View>

        {renderConditionSelector(
          vehicleCondition,
          setVehicleCondition,
          [
            { value: 'excellent', label: 'Excellent', color: '#10b981' },
            { value: 'good', label: 'Good', color: '#3b82f6' },
            { value: 'fair', label: 'Fair', color: '#f59e0b' },
            { value: 'poor', label: 'Poor', color: '#ef4444' },
            { value: 'damaged', label: 'Damaged', color: '#dc2626' },
          ],
          'Vehicle Condition',
        )}

        {renderConditionSelector(
          fuelLevel,
          setFuelLevel,
          [
            { value: 'full', label: 'Full', color: '#10b981' },
            { value: '3/4', label: '3/4', color: '#3b82f6' },
            { value: '1/2', label: '1/2', color: '#f59e0b' },
            { value: '1/4', label: '1/4', color: '#f97316' },
            { value: 'empty', label: 'Empty', color: '#ef4444' },
          ],
          'Fuel Level',
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Additional Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Any additional notes about the vehicle condition..."
            multiline
            numberOfLines={3}
          />
        </View>
      </View>

      {/* Vehicle Photos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Vehicle Photos</Text>
        <Text style={styles.sectionSubtitle}>
          Please take photos showing the current condition of the vehicle
        </Text>

        <View style={styles.photoGrid}>
          {photos.map((photo, index) => (
            <View key={index} style={styles.photoContainer}>
              <Image source={{ uri: photo }} style={styles.photo} />
              <Pressable
                style={styles.removePhotoButton}
                onPress={() => handleRemovePhoto(index)}
              >
                <X size={16} color="#ffffff" />
              </Pressable>
            </View>
          ))}

          {photos.length < 6 && (
            <Pressable style={styles.addPhotoButton} onPress={handleAddPhoto}>
              <Camera size={24} color="#6b7280" />
              <Text style={styles.addPhotoText}>Add Photo</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Vehicle Vitals */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Vehicle Vitals (Optional)</Text>
        <Text style={styles.sectionSubtitle}>
          Track important vehicle metrics for your records
        </Text>

        <View style={styles.vitalsGrid}>
          <View style={styles.vitalItem}>
            <Text style={styles.vitalLabel}>Engine Temp (°F)</Text>
            <TextInput
              style={styles.vitalInput}
              value={engineTemp}
              onChangeText={setEngineTemp}
              placeholder="180"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.vitalItem}>
            <Text style={styles.vitalLabel}>Oil Pressure (PSI)</Text>
            <TextInput
              style={styles.vitalInput}
              value={oilPressure}
              onChangeText={setOilPressure}
              placeholder="45"
              keyboardType="numeric"
            />
          </View>
        </View>

        {renderConditionSelector(
          oilLevel,
          setOilLevel,
          [
            { value: 'full', label: 'Full', color: '#10b981' },
            { value: '3/4', label: '3/4', color: '#3b82f6' },
            { value: '1/2', label: '1/2', color: '#f59e0b' },
            { value: '1/4', label: '1/4', color: '#f97316' },
            { value: 'low', label: 'Low', color: '#ef4444' },
          ],
          'Oil Level',
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Vitals Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={vitalsNotes}
            onChangeText={setVitalsNotes}
            placeholder="Any notes about vehicle performance or issues..."
            multiline
            numberOfLines={2}
          />
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <Pressable style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>

        <Pressable
          style={[
            styles.submitButton,
            isSubmitting && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <>
              <CheckCircle size={20} color="#ffffff" />
              <Text style={styles.submitButtonText}>Submit Return Form</Text>
            </>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  section: {
    margin: 20,
    padding: 20,
    backgroundColor: '#ffffff',
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
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
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
    height: 80,
    textAlignVertical: 'top',
  },
  conditionSelector: {
    marginBottom: 20,
  },
  conditionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 12,
  },
  conditionOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  conditionOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
  conditionOptionSelected: {
    backgroundColor: '#FF5A5F',
    borderColor: '#FF5A5F',
  },
  conditionOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  conditionOptionTextSelected: {
    color: '#ffffff',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoContainer: {
    position: 'relative',
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoButton: {
    width: 100,
    height: 100,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
  },
  addPhotoText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  vitalsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  vitalItem: {
    flex: 1,
  },
  vitalLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  vitalInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    paddingBottom: 40,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  submitButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#FF5A5F',
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

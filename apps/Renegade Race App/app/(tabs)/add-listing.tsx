import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { Clock } from 'lucide-react-native';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
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
import { z } from 'zod';
import CustomAlert from '../../components/CustomAlert';
import PhotoManager from '../../components/PhotoManager';
import {
  ProcessedImageData,
  useVehicles,
  VehicleFormData,
} from '../../hooks/useVehicles';

// Form validation schema
const vehicleFormSchema = z.object({
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.string().min(4, 'Valid year is required').max(4),
  dailyRate: z.string().min(1, 'Daily rate is required'),
  horsepower: z.string().optional(),
  transmission: z.string().optional(),
  drivetrain: z.string().optional(),
  engineType: z.string().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  trackId: z.string().min(1, 'Track is required'),
});

type VehicleForm = z.infer<typeof vehicleFormSchema>;

interface PhotoItem {
  uri: string;
  isProcessing: boolean;
  processingProgress: number;
  processedData?: ProcessedImageData;
  isPrimary: boolean;
  order: number;
  error?: string;
}

interface VehicleAddOn {
  name: string;
  price: string;
  description: string;
}

const transmissionTypes = ['Manual', 'Automatic', 'DCT/PDK'];
const drivetrainTypes = ['RWD', 'AWD', 'FWD'];

export default function AddListingScreen() {
  const router = useRouter();
  const { tracks: availableTracks, createVehicleWithImages } = useVehicles();

  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [addOns, setAddOns] = useState<VehicleAddOn[]>([]);
  const [showReviewAlert, setShowReviewAlert] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<VehicleForm>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      make: '',
      model: '',
      year: '',
      dailyRate: '',
      horsepower: '',
      transmission: '',
      drivetrain: '',
      engineType: '',
      description: '',
      trackId: '',
    },
  });

  const availableAmenities = [
    'Racing Helmet',
    'HANS Device',
    'Racing Suit',
    'Track Insurance',
    'Tire Pressure Monitoring',
    'Data Logger',
    'GoPro Mount',
    'Track Support',
  ];

  const toggleAmenity = (amenity: string) => {
    if (amenities.includes(amenity)) {
      setAmenities(amenities.filter((a) => a !== amenity));
    } else {
      setAmenities([...amenities, amenity]);
    }
  };

  const addAddOn = () => {
    setAddOns([...addOns, { name: '', price: '', description: '' }]);
  };

  const removeAddOn = (index: number) => {
    setAddOns(addOns.filter((_, i) => i !== index));
  };

  const updateAddOn = (
    index: number,
    field: keyof VehicleAddOn,
    value: string,
  ) => {
    const updatedAddOns = [...addOns];
    updatedAddOns[index] = { ...updatedAddOns[index], [field]: value };
    setAddOns(updatedAddOns);
  };

  const handleSubmit = async (data: VehicleForm) => {
    if (photos.length === 0) {
      toast.error('Please add at least one photo');
      return;
    }

    if (photos.some((photo) => photo.isProcessing)) {
      toast.error('Please wait for all photos to finish processing');
      return;
    }

    if (photos.some((photo) => photo.error)) {
      toast.error('Please remove photos with errors');
      return;
    }

    setShowReviewAlert(true);
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    setShowReviewAlert(false);

    try {
      const formData = form.getValues();

      // Find the selected track
      const selectedTrack = availableTracks?.find(
        (track) => track._id === formData.trackId,
      );
      if (!selectedTrack) {
        throw new Error('Selected track not found');
      }

      // Prepare add-ons
      const processedAddOns = addOns
        .filter((addOn) => addOn.name.trim() && addOn.price.trim())
        .map((addOn) => ({
          name: addOn.name.trim(),
          price: parseFloat(addOn.price),
          description: addOn.description.trim() || undefined,
          isRequired: false,
        }));

      // Prepare vehicle data
      const vehicleData: VehicleFormData = {
        trackId: selectedTrack._id,
        make: formData.make,
        model: formData.model,
        year: parseInt(formData.year),
        dailyRate: parseFloat(formData.dailyRate),
        description: formData.description,
        horsepower: formData.horsepower
          ? parseInt(formData.horsepower)
          : undefined,
        transmission: formData.transmission || undefined,
        drivetrain: formData.drivetrain || undefined,
        engineType: formData.engineType || undefined,
        amenities,
        addOns: processedAddOns,
      };

      // Get processed image data
      const processedImages = photos
        .filter((photo) => photo.processedData)
        .map((photo) => photo.processedData!);

      // Create vehicle
      await createVehicleWithImages(vehicleData, processedImages);

      // Reset form
      form.reset();
      setPhotos([]);
      setAmenities([]);
      setAddOns([]);

      // Navigate to success or dashboard
      router.push('/(tabs)/profile/host-dashboard');
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to create vehicle listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>List Your Track Car</Text>
          <Text style={styles.subtitle}>
            Share your performance car with fellow enthusiasts
          </Text>
        </View>

        <View style={styles.content}>
          {/* Vehicle Photos */}
          <PhotoManager
            photos={photos}
            onPhotosChange={setPhotos}
            maxPhotos={10}
          />

          {/* Vehicle Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vehicle Details</Text>

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Year *</Text>
                <Controller
                  control={form.control}
                  name="year"
                  render={({
                    field: { onChange, onBlur, value },
                    fieldState: { error },
                  }) => (
                    <>
                      <TextInput
                        style={[
                          styles.textInput,
                          error && styles.textInputError,
                        ]}
                        placeholder="2023"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        keyboardType="numeric"
                      />
                      {error && (
                        <Text style={styles.errorText}>{error.message}</Text>
                      )}
                    </>
                  )}
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Make *</Text>
                <Controller
                  control={form.control}
                  name="make"
                  render={({
                    field: { onChange, onBlur, value },
                    fieldState: { error },
                  }) => (
                    <>
                      <TextInput
                        style={[
                          styles.textInput,
                          error && styles.textInputError,
                        ]}
                        placeholder="e.g., Porsche"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                      />
                      {error && (
                        <Text style={styles.errorText}>{error.message}</Text>
                      )}
                    </>
                  )}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Model *</Text>
                <Controller
                  control={form.control}
                  name="model"
                  render={({
                    field: { onChange, onBlur, value },
                    fieldState: { error },
                  }) => (
                    <>
                      <TextInput
                        style={[
                          styles.textInput,
                          error && styles.textInputError,
                        ]}
                        placeholder="e.g., 911 GT3"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                      />
                      {error && (
                        <Text style={styles.errorText}>{error.message}</Text>
                      )}
                    </>
                  )}
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Engine Type</Text>
                <Controller
                  control={form.control}
                  name="engineType"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g., Flat-6 Naturally Aspirated"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                    />
                  )}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Transmission</Text>
              <Controller
                control={form.control}
                name="transmission"
                render={({ field: { onChange, value } }) => (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.trackOptions}>
                      {transmissionTypes.map((type) => (
                        <Pressable
                          key={type}
                          style={[
                            styles.optionButton,
                            value === type && styles.optionButtonActive,
                          ]}
                          onPress={() => onChange(type)}
                        >
                          <Text
                            style={[
                              styles.optionButtonText,
                              value === type && styles.optionButtonTextActive,
                            ]}
                          >
                            {type}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </ScrollView>
                )}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Drivetrain</Text>
              <Controller
                control={form.control}
                name="drivetrain"
                render={({ field: { onChange, value } }) => (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.trackOptions}>
                      {drivetrainTypes.map((type) => (
                        <Pressable
                          key={type}
                          style={[
                            styles.optionButton,
                            value === type && styles.optionButtonActive,
                          ]}
                          onPress={() => onChange(type)}
                        >
                          <Text
                            style={[
                              styles.optionButtonText,
                              value === type && styles.optionButtonTextActive,
                            ]}
                          >
                            {type}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </ScrollView>
                )}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Horsepower</Text>
              <Controller
                control={form.control}
                name="horsepower"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.textInput}
                    placeholder="500"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="numeric"
                  />
                )}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Track *</Text>
              <Controller
                control={form.control}
                name="trackId"
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => (
                  <>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                    >
                      <View style={styles.trackOptions}>
                        {availableTracks?.map((track) => (
                          <Pressable
                            key={track._id}
                            style={[
                              styles.optionButton,
                              value === track._id && styles.optionButtonActive,
                            ]}
                            onPress={() => onChange(track._id)}
                          >
                            <Text
                              style={[
                                styles.optionButtonText,
                                value === track._id &&
                                  styles.optionButtonTextActive,
                              ]}
                            >
                              {track.name}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    </ScrollView>
                    {error && (
                      <Text style={styles.errorText}>{error.message}</Text>
                    )}
                  </>
                )}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Description *</Text>
              <Controller
                control={form.control}
                name="description"
                render={({
                  field: { onChange, onBlur, value },
                  fieldState: { error },
                }) => (
                  <>
                    <TextInput
                      style={[
                        styles.textInput,
                        styles.textArea,
                        error && styles.textInputError,
                      ]}
                      placeholder="Tell drivers what makes your car special for track use..."
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      multiline
                      textAlignVertical="top"
                    />
                    {error && (
                      <Text style={styles.errorText}>{error.message}</Text>
                    )}
                  </>
                )}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Daily Rate *</Text>
              <Controller
                control={form.control}
                name="dailyRate"
                render={({
                  field: { onChange, onBlur, value },
                  fieldState: { error },
                }) => (
                  <>
                    <TextInput
                      style={[styles.textInput, error && styles.textInputError]}
                      placeholder="850"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="numeric"
                    />
                    {error && (
                      <Text style={styles.errorText}>{error.message}</Text>
                    )}
                  </>
                )}
              />
            </View>
          </View>

          {/* Amenities */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Included Amenities</Text>
            <View style={styles.amenitiesContainer}>
              {availableAmenities.map((amenity) => (
                <Pressable
                  key={amenity}
                  style={[
                    styles.amenityButton,
                    amenities.includes(amenity) && styles.amenityButtonActive,
                  ]}
                  onPress={() => toggleAmenity(amenity)}
                >
                  <Text
                    style={[
                      styles.amenityButtonText,
                      amenities.includes(amenity) &&
                        styles.amenityButtonTextActive,
                    ]}
                  >
                    {amenity}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Vehicle Add-Ons */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vehicle Add-Ons</Text>
            <Text style={styles.sectionSubtitle}>
              Add optional services or upgrades that drivers can purchase
            </Text>

            {addOns.map((addOn, index) => (
              <View key={index} style={styles.addOnItem}>
                <View style={styles.addOnHeader}>
                  <Text style={styles.addOnNumber}>Add-On {index + 1}</Text>
                  <Pressable
                    style={styles.removeAddOnButton}
                    onPress={() => removeAddOn(index)}
                  >
                    <Text style={styles.removeAddOnText}>Remove</Text>
                  </Pressable>
                </View>

                <View style={styles.row}>
                  <View style={styles.halfInput}>
                    <Text style={styles.inputLabel}>Name *</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g., Professional Instructor"
                      value={addOn.name}
                      onChangeText={(value) =>
                        updateAddOn(index, 'name', value)
                      }
                    />
                  </View>
                  <View style={styles.halfInput}>
                    <Text style={styles.inputLabel}>Price ($) *</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="150"
                      value={addOn.price}
                      onChangeText={(value) =>
                        updateAddOn(index, 'price', value)
                      }
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Description</Text>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    placeholder="Brief description of what this add-on includes..."
                    value={addOn.description}
                    onChangeText={(value) =>
                      updateAddOn(index, 'description', value)
                    }
                    multiline
                    textAlignVertical="top"
                  />
                </View>
              </View>
            ))}

            <Pressable style={styles.addAddOnButton} onPress={addAddOn}>
              <Text style={styles.addAddOnText}>+ Add Another Add-On</Text>
            </Pressable>
          </View>

          {/* Submit Button */}
          <Pressable
            style={[
              styles.submitButton,
              isSubmitting && styles.submitButtonDisabled,
            ]}
            onPress={form.handleSubmit(handleSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.submitButtonText}>Submit for Review</Text>
            )}
          </Pressable>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Custom Review Alert */}
      <CustomAlert
        visible={showReviewAlert}
        title="Review Process"
        message="Your vehicle listing will be reviewed by our team before being published. This process typically takes 24-48 hours. Your vehicle will not be visible to other users until it has been approved. You will be notified once your listing is approved and live on the platform."
        icon={<Clock size={32} color="#FF5A5F" />}
        onCancel={() => setShowReviewAlert(false)}
        onConfirm={handleConfirmSubmit}
        confirmText="Submit"
        cancelText="Cancel"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#6b7280',
  },
  content: {
    paddingHorizontal: 24,
    gap: 24,
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  photosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoItem: {
    position: 'relative',
    width: 96,
    height: 96,
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoButton: {
    width: 96,
    height: 96,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  halfInput: {
    flex: 1,
  },
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  textInput: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  textInputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
  textArea: {
    height: 96,
    textAlignVertical: 'top',
  },
  trackOptions: {
    flexDirection: 'row',
    gap: 12,
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
  optionButtonText: {
    fontWeight: '500',
    color: '#374151',
  },
  optionButtonTextActive: {
    color: '#ffffff',
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  amenityButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
  amenityButtonActive: {
    backgroundColor: '#FF5A5F',
    borderColor: '#FF5A5F',
  },
  amenityButtonText: {
    fontWeight: '500',
    color: '#374151',
  },
  amenityButtonTextActive: {
    color: '#ffffff',
  },
  submitButton: {
    backgroundColor: '#FF5A5F',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 18,
  },
  bottomSpacer: {
    height: 24,
  },
  // Add-on styles
  addOnItem: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  addOnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addOnNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  removeAddOnButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#ef4444',
    borderRadius: 6,
  },
  removeAddOnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  addAddOnButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
  },
  addAddOnText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '500',
  },
});

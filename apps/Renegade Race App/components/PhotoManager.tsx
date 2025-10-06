import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { AlertCircle, Minus, Upload } from 'lucide-react-native';
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { toast } from 'sonner-native';
import { ProcessedImageData, useVehicles } from '../hooks/useVehicles';

interface PhotoItem {
  uri: string;
  isProcessing: boolean;
  processingProgress: number;
  processedData?: ProcessedImageData;
  isPrimary: boolean;
  order: number;
  error?: string;
}

interface PhotoManagerProps {
  photos: PhotoItem[];
  onPhotosChange: (photos: PhotoItem[]) => void;
  maxPhotos?: number;
}

export default function PhotoManager({
  photos,
  onPhotosChange,
  maxPhotos = 10,
}: PhotoManagerProps) {
  const { processAndUploadImage } = useVehicles();

  const pickImage = async () => {
    if (photos.length >= maxPhotos) {
      toast.error(`Maximum ${maxPhotos} photos allowed`);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const newPhoto: PhotoItem = {
        uri: result.assets[0].uri,
        isProcessing: true,
        processingProgress: 0,
        order: photos.length,
        isPrimary: photos.length === 0, // First photo is primary
      };

      onPhotosChange([...photos, newPhoto]);

      // Process and upload the image
      handleImageProcessing(newPhoto, photos.length);
    }
  };

  const handleImageProcessing = async (photo: PhotoItem, index: number) => {
    try {
      // Generate filename
      const fileName = `vehicle_${Date.now()}_${index}.jpg`;

      // Process and upload image
      const processedData = await processAndUploadImage(
        photo.uri,
        fileName,
        photo.isPrimary,
        photo.order,
      );

      // Update photo with processed data using functional update
      onPhotosChange((currentPhotos) =>
        currentPhotos.map((p, i) =>
          i === index ? { ...p, processedData, isProcessing: false } : p,
        ),
      );
      toast.success('Photo processed successfully!');
    } catch (error) {
      console.error('Image processing error:', error);

      // Update photo with error using functional update
      onPhotosChange((currentPhotos) =>
        currentPhotos.map((p, i) =>
          i === index
            ? {
                ...p,
                isProcessing: false,
                error: 'Failed to process image',
              }
            : p,
        ),
      );
      toast.error('Failed to process image');
    }
  };

  const removeImage = (index: number) => {
    onPhotosChange((currentPhotos) => {
      const updatedPhotos = currentPhotos.filter((_, i) => i !== index);

      // Reorder remaining photos
      const reorderedPhotos = updatedPhotos.map((photo, i) => ({
        ...photo,
        order: i,
        isPrimary: i === 0, // First photo becomes primary
      }));

      return reorderedPhotos;
    });
  };

  const setPrimaryImage = (index: number) => {
    onPhotosChange((currentPhotos) =>
      currentPhotos.map((photo, i) => ({
        ...photo,
        isPrimary: i === index,
      })),
    );
  };

  const reorderImage = (fromIndex: number, toIndex: number) => {
    onPhotosChange((currentPhotos) => {
      const updatedPhotos = [...currentPhotos];
      const [movedPhoto] = updatedPhotos.splice(fromIndex, 1);
      updatedPhotos.splice(toIndex, 0, movedPhoto);

      // Update order and primary status
      const reorderedPhotos = updatedPhotos.map((photo, i) => ({
        ...photo,
        order: i,
        isPrimary: i === 0,
      }));

      return reorderedPhotos;
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Photos *</Text>
      <Text style={styles.subtitle}>
        Add up to {maxPhotos} photos of your vehicle ({photos.length}/
        {maxPhotos})
      </Text>

      <View style={styles.photosContainer}>
        {photos.map((photo, index) => (
          <View key={index} style={styles.photoItem}>
            {photo.isProcessing ? (
              <View style={styles.processingContainer}>
                <ActivityIndicator size="large" color="#FF5A5F" />
                <Text style={styles.processingText}>Processing...</Text>
              </View>
            ) : photo.error ? (
              <View style={styles.errorContainer}>
                <AlertCircle size={24} color="#ef4444" />
                <Text style={styles.errorText}>Failed to process</Text>
              </View>
            ) : (
              <Image
                source={{ uri: photo.uri }}
                style={styles.photoImage}
                contentFit="cover"
              />
            )}

            {photo.isPrimary && (
              <View style={styles.primaryBadge}>
                <Text style={styles.primaryText}>Primary</Text>
              </View>
            )}

            <Pressable
              style={styles.removeButton}
              onPress={() => removeImage(index)}
            >
              <Minus size={12} color="white" />
            </Pressable>

            {!photo.isProcessing && !photo.error && (
              <Pressable
                style={styles.primaryButton}
                onPress={() => setPrimaryImage(index)}
              >
                <Text style={styles.primaryButtonText}>
                  {photo.isPrimary ? 'Primary' : 'Set Primary'}
                </Text>
              </Pressable>
            )}
          </View>
        ))}

        {photos.length < maxPhotos && (
          <Pressable style={styles.addPhotoButton} onPress={pickImage}>
            <Upload size={20} color="#6b7280" />
            <Text style={styles.addPhotoText}>Add Photo</Text>
          </Pressable>
        )}
      </View>

      {photos.length > 0 && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            • First photo will be the primary image
          </Text>
          <Text style={styles.infoText}>
            • Photos are automatically optimized for different screen sizes
          </Text>
          <Text style={styles.infoText}>
            • Maximum file size: 10MB per photo
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  photosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoItem: {
    position: 'relative',
    width: 120,
    height: 90,
  },
  photoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  processingContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  processingText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  errorContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
  primaryBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: '#FF5A5F',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  primaryText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
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
  primaryButton: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '500',
  },
  addPhotoButton: {
    width: 120,
    height: 90,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
  },
  addPhotoText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  infoContainer: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    gap: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#6b7280',
  },
});

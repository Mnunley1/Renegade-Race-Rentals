import { useToast } from '@/components/ui/toast';
import { useUser } from '@clerk/clerk-react';
import { api } from '@/lib/convex';
import { Id } from '@/lib/convex';
import { useMutation, useQuery } from 'convex/react';
import { useCallback, useState } from 'react';

export interface VehicleFormData {
  trackId: Id<'tracks'>;
  make: string;
  model: string;
  year: number;
  dailyRate: number;
  description: string;
  horsepower?: number;
  transmission?: string;
  drivetrain?: string;
  engineType?: string;
  mileage?: number;
  fuelType?: string;
  color?: string;
  amenities: string[];
  addOns?: Array<{
    name: string;
    price: number;
    description?: string;
    isRequired?: boolean;
  }>;
}

export interface ProcessedImageData {
  storageId: Id<'_storage'>;
  thumbnailStorageId: Id<'_storage'>;
  cardStorageId: Id<'_storage'>;
  detailStorageId: Id<'_storage'>;
  heroStorageId: Id<'_storage'>;
  isPrimary: boolean;
  order: number;
  metadata: {
    fileName: string;
    originalSize: number;
    processedSizes: {
      thumbnail: number;
      card: number;
      detail: number;
      hero: number;
    };
  };
}

export interface PhotoItem {
  file: File;
  preview: string;
  isProcessing: boolean;
  error?: string;
  processedData?: ProcessedImageData;
}

export function useVehicles() {
  const { user, isSignedIn } = useUser();
  const { success, error } = useToast();
  const [isCreating, setIsCreating] = useState(false);

  // Mutations
  const generateUploadUrl = useMutation(api.vehicles.generateUploadUrl);
  const createVehicle = useMutation(api.vehicles.createVehicleWithImages);
  const updateVehicle = useMutation(api.vehicles.update);
  const deleteVehicle = useMutation(api.vehicles.remove);

  // Queries
  const vehicles = useQuery(api.vehicles.getAllWithOptimizedImages, {
    limit: 50,
  });

  const userVehicles = useQuery(
    api.vehicles.getByOwner,
    user?.id ? { ownerId: user.id } : 'skip'
  );

  const tracks = useQuery(api.tracks.getAll);

  // Process image for multiple sizes (simplified for web)
  const processImageForSizes = async (
    file: File
  ): Promise<{
    thumbnail: { blob: Blob; size: number };
    card: { blob: Blob; size: number };
    detail: { blob: Blob; size: number };
    hero: { blob: Blob; size: number };
  }> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        const sizes = {
          thumbnail: { width: 150, height: 150 },
          card: { width: 300, height: 200 },
          detail: { width: 600, height: 400 },
          hero: { width: 1200, height: 800 },
        };

        const results: any = {};

        Object.entries(sizes).forEach(([sizeName, dimensions]) => {
          canvas.width = dimensions.width;
          canvas.height = dimensions.height;

          // Calculate aspect ratio and crop/scale appropriately
          const aspectRatio = img.width / img.height;
          const targetAspectRatio = dimensions.width / dimensions.height;

          let sourceX = 0;
          let sourceY = 0;
          let sourceWidth = img.width;
          let sourceHeight = img.height;

          if (aspectRatio > targetAspectRatio) {
            // Image is wider than target, crop width
            sourceWidth = img.height * targetAspectRatio;
            sourceX = (img.width - sourceWidth) / 2;
          } else {
            // Image is taller than target, crop height
            sourceHeight = img.width / targetAspectRatio;
            sourceY = (img.height - sourceHeight) / 2;
          }

          ctx?.drawImage(
            img,
            sourceX,
            sourceY,
            sourceWidth,
            sourceHeight,
            0,
            0,
            dimensions.width,
            dimensions.height
          );

          canvas.toBlob(
            blob => {
              if (blob) {
                results[sizeName] = { blob, size: blob.size };

                // Check if all sizes are processed
                if (Object.keys(results).length === 4) {
                  resolve(results);
                }
              } else {
                reject(new Error(`Failed to process ${sizeName} image`));
              }
            },
            'image/jpeg',
            0.9
          );
        });
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  // Upload image to Convex storage
  const uploadToStorage = async (blob: Blob): Promise<string> => {
    try {
      const uploadUrl = await generateUploadUrl();

      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        body: blob,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }

      const { storageId } = await uploadResponse.json();
      return storageId;
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('Failed to upload image to storage');
    }
  };

  // Process and upload image with multiple sizes
  const processAndUploadImage = async (
    file: File,
    isPrimary: boolean = false,
    order: number = 0
  ): Promise<ProcessedImageData> => {
    try {
      // Process image for multiple sizes
      const processedImages = await processImageForSizes(file);

      // Upload all versions to Convex
      const uploadPromises = Object.entries(processedImages).map(
        async ([size, processedImage]) => {
          const storageId = await uploadToStorage(processedImage.blob);
          return { size, storageId, sizeInBytes: processedImage.size };
        }
      );

      const uploadResults = await Promise.all(uploadPromises);

      // Create a map of results
      const resultMap = uploadResults.reduce(
        (acc, { size, storageId, sizeInBytes }) => {
          acc[size] = { storageId, sizeInBytes };
          return acc;
        },
        {} as Record<string, { storageId: Id<'_storage'>; sizeInBytes: number }>
      );

      return {
        storageId: resultMap.hero.storageId, // Use hero as primary
        thumbnailStorageId: resultMap.thumbnail.storageId,
        cardStorageId: resultMap.card.storageId,
        detailStorageId: resultMap.detail.storageId,
        heroStorageId: resultMap.hero.storageId,
        isPrimary,
        order,
        metadata: {
          fileName: file.name,
          originalSize: resultMap.hero.sizeInBytes,
          processedSizes: {
            thumbnail: resultMap.thumbnail.sizeInBytes,
            card: resultMap.card.sizeInBytes,
            detail: resultMap.detail.sizeInBytes,
            hero: resultMap.hero.sizeInBytes,
          },
        },
      };
    } catch (error) {
      console.error('Process and upload error:', error);
      throw new Error('Failed to process and upload image');
    }
  };

  // Create vehicle with processed images
  const createVehicleWithImages = useCallback(
    async (
      vehicleData: VehicleFormData,
      processedImages: ProcessedImageData[]
    ) => {
      if (!isSignedIn || !user) {
        error(
          'Authentication Required',
          'Please sign in to create a vehicle listing'
        );
        return;
      }

      setIsCreating(true);
      try {
        const result = await createVehicle({
          ...vehicleData,
          images: processedImages,
        });

        success(
          'Vehicle Listed Successfully!',
          'Your vehicle has been submitted for approval'
        );
        return result;
      } catch (err) {
        console.error('Error creating vehicle:', err);
        const message =
          err instanceof Error ? err.message : 'Failed to create vehicle';
        error('Creation Failed', message);
        throw err;
      } finally {
        setIsCreating(false);
      }
    },
    [isSignedIn, user, createVehicle, success, error]
  );

  // Update vehicle
  const updateVehicleData = useCallback(
    async (vehicleId: Id<'vehicles'>, updates: Partial<VehicleFormData>) => {
      if (!isSignedIn || !user) {
        error('Authentication Required', 'Please sign in to update vehicle');
        return;
      }

      try {
        const result = await updateVehicle({
          id: vehicleId,
          ...updates,
        });

        success(
          'Vehicle Updated Successfully!',
          'Your vehicle has been updated'
        );
        return result;
      } catch (err) {
        console.error('Error updating vehicle:', err);
        const message =
          err instanceof Error ? err.message : 'Failed to update vehicle';
        error('Update Failed', message);
        throw err;
      }
    },
    [isSignedIn, user, updateVehicle, success, error]
  );

  // Delete vehicle
  const deleteVehicleData = useCallback(
    async (vehicleId: Id<'vehicles'>) => {
      if (!isSignedIn || !user) {
        error('Authentication Required', 'Please sign in to delete vehicle');
        return;
      }

      try {
        const result = await deleteVehicle({ id: vehicleId });
        success(
          'Vehicle Deleted Successfully!',
          'Your vehicle has been removed'
        );
        return result;
      } catch (err) {
        console.error('Error deleting vehicle:', err);
        const message =
          err instanceof Error ? err.message : 'Failed to delete vehicle';
        error('Deletion Failed', message);
        throw err;
      }
    },
    [isSignedIn, user, deleteVehicle, success, error]
  );

  return {
    // Data
    vehicles,
    userVehicles,
    tracks,

    // Actions
    processAndUploadImage,
    createVehicleWithImages,
    updateVehicleData,
    deleteVehicleData,
    uploadToStorage,

    // State
    isCreating,
    isSignedIn,
  };
}

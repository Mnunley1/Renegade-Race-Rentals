import { api } from '@renegade/convex/_generated/api';
import { Id } from '@renegade/convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { toast } from 'sonner-native';
import { ImageProcessor } from '../lib/imageProcessor';
import { useConvexAuth } from './useConvexAuth';

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

export function useVehicles() {
  const { userId } = useConvexAuth();

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
    userId ? { ownerId: userId } : 'skip',
  );

  const vehicleById = useQuery(api.vehicles.getById, 'skip');

  const tracks = useQuery(api.tracks.getAll);

  // Upload image to Convex storage
  const uploadToStorage = async (uri: string): Promise<string> => {
    try {
      const uploadUrl = await generateUploadUrl();

      // Convert local URI to blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // Upload to Convex
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
    uri: string,
    fileName: string,
    isPrimary: boolean = false,
    order: number = 0,
  ): Promise<ProcessedImageData> => {
    try {
      // Process image for multiple sizes
      const processedImages = await ImageProcessor.processMultipleSizes(uri);

      // Upload all versions to Convex
      const uploadPromises = Object.entries(processedImages).map(
        async ([size, processedImage]) => {
          const storageId = await uploadToStorage(processedImage.uri);
          return { size, storageId, sizeInBytes: processedImage.size };
        },
      );

      const uploadResults = await Promise.all(uploadPromises);

      // Create a map of results
      const resultMap = uploadResults.reduce(
        (acc, { size, storageId, sizeInBytes }) => {
          acc[size] = { storageId, sizeInBytes };
          return acc;
        },
        {} as Record<
          string,
          { storageId: Id<'_storage'>; sizeInBytes: number }
        >,
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
          fileName,
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
  const createVehicleWithImages = async (
    vehicleData: VehicleFormData,
    processedImages: ProcessedImageData[],
  ) => {
    try {
      const result = await createVehicle({
        ...vehicleData,
        images: processedImages,
      });

      toast.success('Vehicle listed successfully!');
      return result;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create vehicle';
      toast.error(message);
      throw error;
    }
  };

  // Update vehicle
  const updateVehicleData = async (
    vehicleId: Id<'vehicles'>,
    updates: Partial<VehicleFormData>,
  ) => {
    try {
      const result = await updateVehicle({
        id: vehicleId,
        ...updates,
      });

      toast.success('Vehicle updated successfully!');
      return result;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update vehicle';
      toast.error(message);
      throw error;
    }
  };

  // Delete vehicle
  const deleteVehicleData = async (vehicleId: Id<'vehicles'>) => {
    try {
      const result = await deleteVehicle({ id: vehicleId });
      toast.success('Vehicle deleted successfully!');
      return result;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete vehicle';
      toast.error(message);
      throw error;
    }
  };

  return {
    // Data
    vehicles,
    userVehicles,
    vehicleById,
    tracks,

    // Actions
    processAndUploadImage,
    createVehicleWithImages,
    updateVehicleData,
    deleteVehicleData,
    uploadToStorage,
  };
}

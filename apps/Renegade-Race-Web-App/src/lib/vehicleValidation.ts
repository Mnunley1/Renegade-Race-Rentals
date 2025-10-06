import { z } from 'zod';

// Vehicle form validation schema matching mobile app
export const vehicleFormSchema = z.object({
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.string().min(4, 'Valid year is required').max(4),
  dailyRate: z.string().min(1, 'Daily rate is required'),
  horsepower: z.string().optional(),
  transmission: z.string().optional(),
  drivetrain: z.string().optional(),
  engineType: z.string().optional(),
  mileage: z.string().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  trackId: z.string().min(1, 'Track is required'),
});

export type VehicleForm = z.infer<typeof vehicleFormSchema>;

// Available options matching mobile app
export const transmissionTypes = ['Manual', 'Automatic', 'DCT/PDK'];
export const drivetrainTypes = ['RWD', 'AWD', 'FWD'];

export const availableAmenities = [
  'Racing Helmet',
  'HANS Device',
  'Racing Suit',
  'Track Insurance',
  'Tire Pressure Monitoring',
  'Data Logger',
  'GoPro Mount',
  'Track Support',
  'Air Conditioning',
  'Heated Seats',
  'Navigation System',
  'Bluetooth Connectivity',
  'Premium Sound System',
  'Leather Seats',
  'Sport Suspension',
  'Track Mode',
  'Launch Control',
  'Carbon Fiber Parts',
  'Performance Tires',
  'Ceramic Wheels',
];

export interface VehicleAddOn {
  name: string;
  price: string;
  description: string;
}

// Helper function to validate photos
export const validatePhotos = (photos: any[], minPhotos: number = 1) => {
  if (photos.length === 0) {
    return 'Please add at least one photo';
  }

  if (photos.some(photo => photo.isProcessing)) {
    return 'Please wait for all photos to finish processing';
  }

  if (photos.some(photo => photo.error)) {
    return 'Please remove photos with errors';
  }

  return null;
};

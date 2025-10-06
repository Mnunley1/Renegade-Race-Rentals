export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

// Database user type based on Convex schema
export interface DatabaseUser {
  _id: string;
  externalId: string;
  name: string;
  email?: string;
  phone?: string;
  rating?: number;
  totalRentals?: number;
  memberSince?: string;
  profileImage?: string;
  userType?: "driver" | "team" | "both";
  rentalCount: number;
  vehicleCount: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface Rental {
  id: string;
  customerName: string;
  vehicle: string;
  startDate: string;
  endDate: string;
  status: "active" | "completed" | "pending" | "cancelled";
  amount: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalRentals: number;
  status: "active" | "inactive";
  joinDate: string;
}

export interface Vehicle {
  id: string;
  name: string;
  type: string;
  status: "available" | "rented" | "maintenance";
  dailyRate: number;
  location: string;
}

// Extended vehicle type for admin use with Convex data
export interface AdminVehicle {
  _id: string;
  ownerId: string;
  trackId: string;
  make: string;
  model: string;
  year: number;
  dailyRate: number;
  description: string;
  horsepower?: number;
  transmission?: string;
  drivetrain?: string;
  mileage?: number;
  fuelType?: string;
  color?: string;
  amenities: string[];
  isActive: boolean;
  isApproved?: boolean;
  createdAt: number;
  updatedAt: number;
  images: VehicleImage[];
  owner?: DatabaseUser;
  track?: Track;
}

export interface VehicleImage {
  _id: string;
  vehicleId: string;
  storageId?: string;
  thumbnailStorageId?: string;
  cardStorageId?: string;
  detailStorageId?: string;
  heroStorageId?: string;
  imageUrl: string;
  isPrimary: boolean;
  order: number;
  metadata?: {
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

export interface Track {
  _id: string;
  name: string;
  location: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
}

export interface DashboardStats {
  totalRentals: number;
  activeRentals: number;
  totalRevenue: number;
  totalVehicles: number;
}

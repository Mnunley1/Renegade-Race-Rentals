import { api } from '@renegade/convex/_generated/api';
import { Id } from '@renegade/convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { toast } from 'sonner-native';

export function useAvailability(vehicleId: Id<'vehicles'> | null) {
  // Queries
  const availability = useQuery(
    api.availability.getByVehicle,
    vehicleId ? { vehicleId } : 'skip',
  );

  const calendarData = useQuery(
    api.availability.getCalendarData,
    vehicleId
      ? {
          vehicleId,
          year: new Date().getFullYear(),
          month: new Date().getMonth() + 1,
        }
      : 'skip',
  );

  // Mutations
  const blockDate = useMutation(api.availability.blockDate);
  const blockDateRange = useMutation(api.availability.blockDateRange);
  const unblockDate = useMutation(api.availability.unblockDate);
  const unblockDateRange = useMutation(api.availability.unblockDateRange);
  const setDefaultAvailability = useMutation(
    api.availability.setDefaultAvailability,
  );

  // Mutation handlers with error handling
  const handleBlockDate = async (params: {
    date: string;
    reason?: string;
    price?: number;
  }) => {
    if (!vehicleId) return;

    try {
      const result = await blockDate({
        vehicleId,
        ...params,
      });
      toast.success('Date blocked successfully');
      return result;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to block date';
      toast.error(message);
      throw error;
    }
  };

  const handleBlockDateRange = async (params: {
    startDate: string;
    endDate: string;
    reason?: string;
    price?: number;
  }) => {
    if (!vehicleId) return;

    try {
      const result = await blockDateRange({
        vehicleId,
        ...params,
      });
      toast.success('Date range blocked successfully');
      return result;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to block date range';
      toast.error(message);
      throw error;
    }
  };

  const handleUnblockDate = async (params: { date: string }) => {
    if (!vehicleId) return;

    try {
      const result = await unblockDate({
        vehicleId,
        ...params,
      });
      toast.success('Date unblocked successfully');
      return result;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to unblock date';
      toast.error(message);
      throw error;
    }
  };

  const handleUnblockDateRange = async (params: {
    startDate: string;
    endDate: string;
  }) => {
    if (!vehicleId) return;

    try {
      const result = await unblockDateRange({
        vehicleId,
        ...params,
      });
      toast.success('Date range unblocked successfully');
      return result;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to unblock date range';
      toast.error(message);
      throw error;
    }
  };

  const handleSetDefaultAvailability = async (params: {
    startDate: string;
    endDate: string;
    isAvailable: boolean;
  }) => {
    if (!vehicleId) return;

    try {
      const result = await setDefaultAvailability({
        vehicleId,
        ...params,
      });
      toast.success('Default availability set successfully');
      return result;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to set default availability';
      toast.error(message);
      throw error;
    }
  };

  return {
    // Data
    availability,
    calendarData,

    // Actions
    blockDate: handleBlockDate,
    blockDateRange: handleBlockDateRange,
    unblockDate: handleUnblockDate,
    unblockDateRange: handleUnblockDateRange,
    setDefaultAvailability: handleSetDefaultAvailability,
  };
}

export function useAvailabilityCheck(
  vehicleId: Id<'vehicles'> | null,
  startDate: string | null,
  endDate: string | null,
) {
  const checkAvailability = useQuery(
    api.availability.checkAvailability,
    vehicleId && startDate && endDate
      ? { vehicleId, startDate, endDate }
      : 'skip',
  );

  return {
    checkAvailability,
  };
}

import { api } from '@renegade/convex/_generated/api';
import { Id } from '@renegade/convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { useCallback } from 'react';
import { useConvexAuth } from './useConvexAuth';
import { useToasts } from './useToasts';

export function useFavorites() {
  const { userId } = useConvexAuth();
  const { showFavoriteAdded, showFavoriteRemoved, showError } = useToasts();

  // Queries
  const favorites = useQuery(api.favorites.getUserFavorites, {}) || [];
  const favoritesLoading = favorites === undefined;

  // Mutations
  const addToFavoritesMutation = useMutation(api.favorites.addToFavorites);
  const removeFromFavoritesMutation = useMutation(
    api.favorites.removeFromFavorites,
  );
  const toggleFavoriteMutation = useMutation(api.favorites.toggleFavorite);

  // Check if a specific vehicle is favorited
  const isVehicleFavorited = useCallback(
    (vehicleId: Id<'vehicles'>) => {
      return favorites.some((favorite) => favorite?.vehicleId === vehicleId);
    },
    [favorites],
  );

  // Add a vehicle to favorites
  const addToFavorites = useCallback(
    async (vehicleId: Id<'vehicles'>, vehicleName?: string) => {
      if (!userId) {
        showError('Please sign in to add favorites');
        return;
      }

      try {
        await addToFavoritesMutation({ vehicleId });
        showFavoriteAdded(vehicleName || 'Vehicle');
      } catch (error) {
        console.error('Error adding to favorites:', error);
        showError('Failed to add to favorites');
      }
    },
    [userId, addToFavoritesMutation, showFavoriteAdded, showError],
  );

  // Remove a vehicle from favorites
  const removeFromFavorites = useCallback(
    async (vehicleId: Id<'vehicles'>, vehicleName?: string) => {
      if (!userId) {
        showError('Please sign in to manage favorites');
        return;
      }

      try {
        await removeFromFavoritesMutation({ vehicleId });
        showFavoriteRemoved(vehicleName || 'Vehicle');
      } catch (error) {
        console.error('Error removing from favorites:', error);
        showError('Failed to remove from favorites');
      }
    },
    [userId, removeFromFavoritesMutation, showFavoriteRemoved, showError],
  );

  // Toggle favorite status
  const toggleFavorite = useCallback(
    async (vehicleId: Id<'vehicles'>, vehicleName?: string) => {
      if (!userId) {
        showError('Please sign in to manage favorites');
        return;
      }

      try {
        const result = await toggleFavoriteMutation({ vehicleId });
        if (result.action === 'added') {
          showFavoriteAdded(vehicleName || 'Vehicle');
        } else {
          showFavoriteRemoved(vehicleName || 'Vehicle');
        }
      } catch (error) {
        console.error('Error toggling favorite:', error);
        showError('Failed to update favorites');
      }
    },
    [
      userId,
      toggleFavoriteMutation,
      showFavoriteAdded,
      showFavoriteRemoved,
      showError,
    ],
  );

  // Get favorite count
  const getFavoriteCount = useCallback(() => {
    return favorites.length;
  }, [favorites]);

  // Get favorite vehicles
  const getFavoriteVehicles = useCallback(() => {
    return favorites
      .filter((favorite) => favorite !== null)
      .map((favorite) => favorite!.vehicle);
  }, [favorites]);

  return {
    // State
    favorites,
    favoritesLoading,
    favoriteCount: getFavoriteCount(),
    favoriteVehicles: getFavoriteVehicles(),

    // Actions
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isVehicleFavorited,

    // Utilities
    hasFavorites: favorites.length > 0,
  };
}

import { useToast } from '@/components/ui/toast';
import { useUser } from '@clerk/clerk-react';
import { api } from '@renegade/convex/_generated/api';
import { Id } from '@renegade/convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { useCallback } from 'react';

export function useFavorites() {
  const { user, isSignedIn } = useUser();
  const { success, error } = useToast();

  // Queries
  const favorites = useQuery(api.favorites.getUserFavorites, {}) || [];
  const favoritesLoading = favorites === undefined;

  // Mutations
  const addToFavoritesMutation = useMutation(api.favorites.addToFavorites);
  const removeFromFavoritesMutation = useMutation(
    api.favorites.removeFromFavorites
  );
  const toggleFavoriteMutation = useMutation(api.favorites.toggleFavorite);

  // Check if a specific vehicle is favorited
  const isVehicleFavorited = useCallback(
    (vehicleId: Id<'vehicles'>) => {
      return favorites.some(favorite => favorite?.vehicleId === vehicleId);
    },
    [favorites]
  );

  // Add a vehicle to favorites
  const addToFavorites = useCallback(
    async (vehicleId: Id<'vehicles'>, vehicleName?: string) => {
      if (!isSignedIn || !user) {
        error('Authentication Required', 'Please sign in to add favorites');
        return;
      }

      try {
        await addToFavoritesMutation({ vehicleId });
        success(
          'Added to Favorites',
          `${vehicleName || 'Vehicle'} has been added to your favorites`
        );
      } catch (error) {
        console.error('Error adding to favorites:', error);
        const message =
          error instanceof Error ? error.message : 'Failed to add to favorites';
        error('Error', message);
      }
    },
    [isSignedIn, user, addToFavoritesMutation, success, error]
  );

  // Remove a vehicle from favorites
  const removeFromFavorites = useCallback(
    async (vehicleId: Id<'vehicles'>, vehicleName?: string) => {
      if (!isSignedIn || !user) {
        error('Authentication Required', 'Please sign in to manage favorites');
        return;
      }

      try {
        await removeFromFavoritesMutation({ vehicleId });
        success(
          'Removed from Favorites',
          `${vehicleName || 'Vehicle'} has been removed from your favorites`
        );
      } catch (error) {
        console.error('Error removing from favorites:', error);
        const message =
          error instanceof Error
            ? error.message
            : 'Failed to remove from favorites';
        error('Error', message);
      }
    },
    [isSignedIn, user, removeFromFavoritesMutation, success, error]
  );

  // Toggle favorite status
  const toggleFavorite = useCallback(
    async (vehicleId: Id<'vehicles'>, vehicleName?: string) => {
      if (!isSignedIn || !user) {
        error('Authentication Required', 'Please sign in to save favorites');
        return;
      }

      try {
        const result = await toggleFavoriteMutation({ vehicleId });
        if (result.action === 'added') {
          success(
            'Added to Favorites',
            `${vehicleName || 'Vehicle'} has been added to your favorites`
          );
        } else {
          success(
            'Removed from Favorites',
            `${vehicleName || 'Vehicle'} has been removed from your favorites`
          );
        }
      } catch (error) {
        console.error('Error toggling favorite:', error);
        const message =
          error instanceof Error ? error.message : 'Failed to update favorites';
        error('Error', message);
      }
    },
    [isSignedIn, user, toggleFavoriteMutation, success, error]
  );

  return {
    favorites,
    favoritesLoading,
    isVehicleFavorited,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isSignedIn,
  };
}

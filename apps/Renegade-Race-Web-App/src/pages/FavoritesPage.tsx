import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LoginPromptModal } from '@/components/ui/login-prompt-modal';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useFavorites } from '@/hooks/useFavorites';
import { useUser } from '@clerk/clerk-react';
import { api } from '@renegade/convex/_generated/api';
import { useQuery } from 'convex/react';
import {
  ArrowLeft,
  Calendar,
  Car,
  Heart,
  MapPin,
  Search,
  Star,
  Zap,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function FavoritesPage() {
  const { user, isSignedIn } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const { requireAuth, showLoginPrompt, closeLoginPrompt } = useAuthGuard();
  const { favorites, removeFromFavorites } = useFavorites();

  // Fetch user's favorites using the correct Convex function
  const favoritesData = useQuery(api.favorites.getUserFavorites, {});

  if (!isSignedIn || !user) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <Card className='w-full max-w-md'>
          <CardContent className='p-8 text-center'>
            <Heart className='h-16 w-16 text-gray-400 mx-auto mb-4' />
            <h2 className='text-2xl font-bold text-gray-900 mb-2'>
              Sign In Required
            </h2>
            <p className='text-gray-600 mb-6'>
              Please sign in to view your favorite vehicles.
            </p>
            <div className='space-y-3'>
              <Button asChild className='w-full'>
                <Link to='/sign-in'>Sign In</Link>
              </Button>
              <Button asChild variant='outline' className='w-full'>
                <Link to='/sign-up'>Create Account</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleRemoveFavorite = (vehicleId: string, vehicleName: string) => {
    requireAuth(() => {
      removeFromFavorites(vehicleId as any, vehicleName);
    });
  };

  // Filter favorites based on search query
  const filteredFavorites =
    favoritesData?.filter(favorite => {
      if (!favorite || !searchQuery) return true;
      const vehicle = favorite.vehicle;
      const searchLower = searchQuery.toLowerCase();
      return (
        vehicle.make.toLowerCase().includes(searchLower) ||
        vehicle.model.toLowerCase().includes(searchLower) ||
        vehicle.track?.name.toLowerCase().includes(searchLower)
      );
    }) || [];

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container px-4 py-8'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center space-x-4 mb-6'>
            <Button asChild variant='ghost' size='sm'>
              <Link to='/search' className='flex items-center'>
                <ArrowLeft className='h-4 w-4 mr-2' />
                Back to Search
              </Link>
            </Button>
          </div>
          <div className='flex items-center space-x-3'>
            <Heart className='h-8 w-8 text-[#EF1C25]' />
            <h1 className='text-3xl font-bold text-gray-900'>My Favorites</h1>
          </div>
          <p className='text-gray-600 mt-2'>
            Your saved track cars and racing vehicles.
          </p>
        </div>

        {/* Search Bar */}
        {favoritesData && favoritesData.length > 0 && (
          <div className='mb-8'>
            <div className='max-w-md'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
                <input
                  type='text'
                  placeholder='Search your favorites...'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className='w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EF1C25] focus:border-transparent'
                />
              </div>
            </div>
          </div>
        )}

        {/* Favorites Content */}
        {favoritesData === undefined ? (
          // Loading state
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
            {Array.from({ length: 8 }).map((_, index) => (
              <Card key={index} className='overflow-hidden border-0 shadow-sm'>
                <div className='relative aspect-[4/3] overflow-hidden bg-gray-200 animate-pulse'>
                  <div className='w-full h-full flex items-center justify-center'>
                    <Car className='h-8 w-8 text-gray-400' />
                  </div>
                </div>
                <CardContent className='p-5'>
                  <div className='space-y-3'>
                    <div className='h-6 bg-gray-200 rounded animate-pulse'></div>
                    <div className='h-4 bg-gray-200 rounded animate-pulse'></div>
                    <div className='h-4 bg-gray-200 rounded animate-pulse w-3/4'></div>
                    <div className='flex items-center justify-between pt-2'>
                      <div className='h-6 bg-gray-200 rounded animate-pulse w-20'></div>
                      <div className='h-8 bg-gray-200 rounded animate-pulse w-24'></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredFavorites.length === 0 ? (
          // Empty state
          <Card>
            <CardContent className='p-12 text-center'>
              {searchQuery ? (
                <>
                  <Search className='h-16 w-16 text-gray-400 mx-auto mb-4' />
                  <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                    No favorites found
                  </h3>
                  <p className='text-gray-600 mb-6'>
                    No favorites match "{searchQuery}". Try a different search
                    term.
                  </p>
                  <Button variant='outline' onClick={() => setSearchQuery('')}>
                    Clear Search
                  </Button>
                </>
              ) : (
                <>
                  <Heart className='h-16 w-16 text-gray-400 mx-auto mb-4' />
                  <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                    No favorites yet
                  </h3>
                  <p className='text-gray-600 mb-6'>
                    Start exploring track cars and add them to your favorites.
                  </p>
                  <Button asChild>
                    <Link to='/search'>Search Vehicles</Link>
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          // Favorites grid
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
            {filteredFavorites.map(favorite => {
              if (!favorite) return null;
              const vehicle = favorite.vehicle;
              return (
                <Card
                  key={favorite._id}
                  className='group overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-sm'
                >
                  <div className='relative aspect-[4/3] overflow-hidden'>
                    <img
                      src={
                        vehicle.images && vehicle.images.length > 0
                          ? vehicle.images[0].imageUrl
                          : 'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=800'
                      }
                      alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                      className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
                    />
                    <button
                      onClick={() =>
                        handleRemoveFavorite(
                          vehicle._id,
                          `${vehicle.year} ${vehicle.make} ${vehicle.model}`
                        )
                      }
                      className='absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white transition-colors'
                    >
                      <Heart className='h-4 w-4 fill-[#EF1C25] text-[#EF1C25]' />
                    </button>
                    <div className='absolute top-3 left-3'>
                      <Badge className='bg-black/80 text-white border-0'>
                        {vehicle.horsepower} HP
                      </Badge>
                    </div>
                  </div>

                  <CardContent className='p-5'>
                    <div className='space-y-3'>
                      <div className='flex items-center justify-between'>
                        <h3 className='font-semibold text-lg text-gray-900 group-hover:text-[#EF1C25] transition-colors'>
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </h3>
                        <div className='flex items-center space-x-1'>
                          <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
                          <span className='text-sm text-gray-600'>4.9</span>
                        </div>
                      </div>

                      <div className='flex items-center space-x-4 text-sm text-gray-600'>
                        <div className='flex items-center space-x-1'>
                          <Zap className='h-4 w-4' />
                          <span>{vehicle.transmission}</span>
                        </div>
                        <div className='flex items-center space-x-1'>
                          <Calendar className='h-4 w-4' />
                          <span>Available</span>
                        </div>
                      </div>

                      <div className='flex items-center space-x-1 text-sm text-gray-600'>
                        <MapPin className='h-4 w-4' />
                        <span>{vehicle.track?.name || 'Track Location'}</span>
                      </div>

                      <p className='text-sm text-gray-600 line-clamp-2'>
                        {vehicle.description}
                      </p>

                      <div className='flex items-center justify-between pt-2'>
                        <div>
                          <span className='text-2xl font-bold text-gray-900'>
                            {formatCurrency(vehicle.dailyRate)}
                          </span>
                          <span className='text-sm text-gray-600 ml-1'>
                            per day
                          </span>
                        </div>

                        <Button asChild size='sm'>
                          <Link to={`/vehicles}/${vehicle._id}`}>
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Login Prompt Modal */}
        <LoginPromptModal
          isOpen={showLoginPrompt}
          onClose={closeLoginPrompt}
          title='Sign In to Continue'
          message='Please sign in to manage your favorites and view vehicle details.'
        />
      </div>
    </div>
  );
}

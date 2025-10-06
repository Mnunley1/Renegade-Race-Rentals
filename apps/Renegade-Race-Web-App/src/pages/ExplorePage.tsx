import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { LoginPromptModal } from '@/components/ui/login-prompt-modal';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useUser } from '@clerk/clerk-react';
import { api } from '@renegade/convex/_generated/api';
import { useMutation, useQuery } from 'convex/react';
import {
  Calendar,
  Grid,
  Heart,
  List,
  Loader2,
  MapPin,
  Search,
  SlidersHorizontal,
  Star,
  Zap,
} from 'lucide-react';
import { useState } from 'react';

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { requireAuth, showLoginPrompt, closeLoginPrompt } = useAuthGuard();
  const { user } = useUser();

  // Fetch vehicles from Convex
  const vehicles = useQuery(api.vehicles.getAllWithOptimizedImages, {
    limit: 50,
  });

  // Filter vehicles based on search query
  const filteredVehicles = vehicles?.filter(vehicle => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      vehicle.make.toLowerCase().includes(searchLower) ||
      vehicle.model.toLowerCase().includes(searchLower) ||
      vehicle.description.toLowerCase().includes(searchLower) ||
      vehicle.track?.name.toLowerCase().includes(searchLower) ||
      vehicle.track?.location.toLowerCase().includes(searchLower)
    );
  });

  // Favorites mutations
  const addToFavorites = useMutation(api.favorites.addToFavorites);
  const removeFromFavorites = useMutation(api.favorites.removeFromFavorites);
  const toggleFavorite = useMutation(api.favorites.toggleFavorite);

  // Mock data for demonstration (fallback)
  const mockVehicles = [
    {
      _id: '1',
      make: 'Porsche',
      model: '911 GT3',
      year: 2023,
      dailyRate: 899,
      description:
        'Track-focused precision machine with naturally aspirated flat-six engine.',
      horsepower: 502,
      images: [
        'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=800',
      ],
      color: 'Guards Red',
      transmission: 'PDK',
    },
    {
      _id: '2',
      make: 'McLaren',
      model: '720S',
      year: 2022,
      dailyRate: 1299,
      description: 'Supercar with active aerodynamics and twin-turbo V8 power.',
      horsepower: 710,
      images: [
        'https://images.pexels.com/photos/337909/pexels-photo-337909.jpeg?auto=compress&cs=tinysrgb&w=800',
      ],
      color: 'Papaya Orange',
      transmission: 'Automatic',
    },
    {
      _id: '3',
      make: 'Ferrari',
      model: '488 GTB',
      year: 2024,
      dailyRate: 1599,
      description:
        'Italian masterpiece with turbocharged V8 and razor-sharp handling.',
      horsepower: 661,
      images: [
        'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=800',
      ],
      color: 'Rosso Corsa',
      transmission: 'DCT',
    },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const CarCard = ({ vehicle }: { vehicle: any }) => {
    // Check if vehicle is favorited
    const isFavoritedQuery = useQuery(api.favorites.isVehicleFavorited, {
      vehicleId: vehicle._id,
    });

    const handleFavorite = async () => {
      if (!user) {
        requireAuth(() => {});
        return;
      }

      try {
        await toggleFavorite({
          vehicleId: vehicle._id,
        });
      } catch (error) {
        console.error('Error updating favorites:', error);
      }
    };

    return (
      <Card className='group overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-sm'>
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
            onClick={handleFavorite}
            className='absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white transition-colors'
          >
            <Heart
              className={`h-4 w-4 ${isFavoritedQuery ? 'fill-[#EF1C25] text-[#EF1C25]' : 'text-gray-600'}`}
            />
          </button>
          <div className='absolute top-3 left-3'>
            <Badge className='bg-black/80 text-white border-0'>
              {vehicle.horsepower || 'N/A'} HP
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
                <span>{vehicle.transmission || 'N/A'}</span>
              </div>
              <div className='flex items-center space-x-1'>
                <Calendar className='h-4 w-4' />
                <span>Available</span>
              </div>
            </div>

            <p className='text-sm text-gray-600 line-clamp-2'>
              {vehicle.description}
            </p>

            <div className='flex items-center justify-between pt-2'>
              <div>
                <span className='text-2xl font-bold text-gray-900'>
                  {formatCurrency(vehicle.dailyRate)}
                </span>
                <span className='text-sm text-gray-600 ml-1'>per day</span>
              </div>

              <Button
                size='sm'
                onClick={() => {
                  window.location.href = `/vehicles/${vehicle._id}`;
                }}
              >
                View Details
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='bg-white border-b'>
        <div className='container px-4 py-8'>
          <div className='space-y-6'>
            <div className='text-center space-y-2'>
              <h1 className='text-3xl md:text-4xl font-bold text-gray-900'>
                Search Track Cars
              </h1>
              <p className='text-lg text-gray-600'>
                Find high-performance vehicles for your next track day
              </p>
            </div>

            <div className='flex items-center space-x-3 w-full max-w-2xl mx-auto'>
              <div className='relative flex-1'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
                <Input
                  type='text'
                  placeholder='Search by make, model, or location...'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className='pl-10 pr-4 h-12 text-base bg-white border-gray-200 focus:border-[#EF1C25]'
                />
              </div>

              <Button type='submit' size='lg' className='h-12 px-6'>
                Search
              </Button>

              <Button
                type='button'
                variant='outline'
                size='lg'
                className='h-12 px-4 border-gray-200'
              >
                <SlidersHorizontal className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className='container px-4 py-8'>
        <div className='flex items-center justify-between mb-8'>
          <div className='flex items-center space-x-2 text-sm text-gray-600'>
            <MapPin className='h-4 w-4' />
            <span>Showing results nationwide</span>
          </div>

          <div className='flex items-center space-x-2'>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size='sm'
              onClick={() => setViewMode('grid')}
            >
              <Grid className='h-4 w-4' />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size='sm'
              onClick={() => setViewMode('list')}
            >
              <List className='h-4 w-4' />
            </Button>
          </div>
        </div>

        <div
          className={`grid gap-6 ${
            viewMode === 'grid'
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1'
          }`}
        >
          {vehicles === undefined
            ? // Loading state
              Array.from({ length: 8 }).map((_, index) => (
                <Card
                  key={index}
                  className='overflow-hidden border-0 shadow-sm'
                >
                  <div className='relative aspect-[4/3] overflow-hidden bg-gray-200 animate-pulse'>
                    <div className='w-full h-full flex items-center justify-center'>
                      <Loader2 className='h-8 w-8 text-gray-400 animate-spin' />
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
              ))
            : filteredVehicles?.length === 0
              ? // Show mock data as demo when database is empty or no search results
                mockVehicles.map(vehicle => (
                  <div key={vehicle._id} className='fade-in'>
                    <CarCard vehicle={vehicle} />
                  </div>
                ))
              : // Vehicles from database (filtered)
                filteredVehicles?.map(vehicle => (
                  <div key={vehicle._id} className='fade-in'>
                    <CarCard vehicle={vehicle} />
                  </div>
                ))}
        </div>
      </div>

      {/* Login Prompt Modal */}
      <LoginPromptModal
        isOpen={showLoginPrompt}
        onClose={closeLoginPrompt}
        title='Sign In to Continue'
        message='Please sign in to favorite vehicles and view details.'
      />
    </div>
  );
}

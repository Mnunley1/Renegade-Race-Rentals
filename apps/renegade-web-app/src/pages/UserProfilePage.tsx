import { api } from '@/lib/convex';
import { formatCurrency } from '@/lib/utils';
import { useUser } from '@clerk/clerk-react';
import { Badge, Button, Card, CardContent } from '@renegade/ui';
import { useQuery } from 'convex/react';
import {
  ArrowLeft,
  Car,
  CheckCircle,
  Fuel,
  Gauge,
  Heart,
  MapPin,
  MessageCircle,
  Star,
  Users,
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import NotFoundPage from './NotFoundPage';

export default function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user } = useUser();

  // Fetch user data
  const userData = useQuery(
    api.users.getByExternalId,
    userId ? { externalId: userId } : 'skip'
  );

  // Fetch user's vehicles
  const userVehicles = useQuery(
    api.vehicles.getByOwner,
    userId ? { ownerId: userId } : 'skip'
  );

  // Handle message user
  const handleMessageUser = async () => {
    if (!userData || !userVehicles || userVehicles.length === 0) {
      return;
    }

    try {
      // Use the first vehicle to navigate to messages - conversation will be created when first message is sent
      const vehicleId = userVehicles[0]._id;
      navigate(
        `/messages?vehicleId=${vehicleId}&renterId=${user?.id}&ownerId=${userData.externalId}`
      );
    } catch (error) {
      console.error('Failed to navigate to messages:', error);
    }
  };

  if (userData === undefined) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-[#EF1C25] mx-auto mb-4'></div>
          <p className='text-gray-600'>Loading user profile...</p>
        </div>
      </div>
    );
  }

  if (userData === null) {
    return <NotFoundPage />;
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container px-4 py-8'>
        {/* Back Button */}
        <Button
          variant='ghost'
          onClick={() => navigate(-1)}
          className='mb-6 p-0 h-auto text-gray-600 hover:text-gray-900'
        >
          <ArrowLeft className='h-4 w-4 mr-2' />
          Back
        </Button>

        {/* Hero Profile Section */}
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 mb-8'>
          <div className='p-8'>
            <div className='flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8'>
              {/* Profile Image */}
              <div className='flex-shrink-0'>
                <div className='w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center'>
                  {userData.profileImage ? (
                    <img
                      src={userData.profileImage}
                      alt={userData.name}
                      className='w-full h-full rounded-full object-cover'
                    />
                  ) : (
                    <Users className='h-16 w-16 text-gray-400' />
                  )}
                </div>
              </div>

              {/* Profile Info */}
              <div className='flex-1 min-w-0'>
                <div className='flex flex-col md:flex-row md:items-center md:justify-between'>
                  <div className='mb-4 md:mb-0'>
                    <h1 className='text-3xl font-bold text-gray-900 mb-2'>
                      {userData.name}
                    </h1>
                    <div className='flex flex-wrap items-center gap-4 mb-4'>
                      <div className='flex items-center space-x-2'>
                        <Star className='h-5 w-5 fill-yellow-400 text-yellow-400' />
                        <span className='text-lg font-semibold text-gray-900'>
                          {userData.rating?.toFixed(1) || '4.9'}
                        </span>
                        <span className='text-gray-500'>
                          ({userData.totalRentals || 0} trips)
                        </span>
                      </div>
                      {userData.userType && (
                        <Badge className='bg-[#EF1C25] text-white border-0'>
                          <CheckCircle className='h-3 w-3 mr-1' />
                          {userData.userType} verified
                        </Badge>
                      )}
                    </div>
                    <p className='text-gray-600 text-lg'>
                      {userData.userType === 'driver' &&
                        'Professional driver with extensive racing experience.'}
                      {userData.userType === 'team' &&
                        'Racing team offering premium vehicles and track support.'}
                      {userData.userType === 'both' &&
                        'Professional driver and racing team member.'}
                      {!userData.userType &&
                        'Experienced motorsports enthusiast.'}
                    </p>
                  </div>

                  <div className='flex flex-col sm:flex-row gap-3'>
                    <Button onClick={handleMessageUser} size='lg'>
                      <MessageCircle className='h-4 w-4 mr-2' />
                      Contact Host
                    </Button>
                    <Button variant='outline' size='lg'>
                      <Heart className='h-4 w-4 mr-2' />
                      Save Host
                    </Button>
                  </div>
                </div>

                {/* Stats Row */}
                <div className='mt-6 pt-6 border-t border-gray-200'>
                  <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
                    <div className='text-center'>
                      <div className='text-2xl font-bold text-gray-900'>
                        {userData.totalRentals || 0}
                      </div>
                      <div className='text-sm text-gray-500'>Trips</div>
                    </div>
                    <div className='text-center'>
                      <div className='text-2xl font-bold text-gray-900'>
                        {userData.rating?.toFixed(1) || '4.9'}
                      </div>
                      <div className='text-sm text-gray-500'>Rating</div>
                    </div>
                    <div className='text-center'>
                      <div className='text-2xl font-bold text-gray-900'>
                        {userData.memberSince || '2024'}
                      </div>
                      <div className='text-sm text-gray-500'>Member Since</div>
                    </div>
                    <div className='text-center'>
                      <div className='text-2xl font-bold text-gray-900'>
                        {userVehicles?.length || 0}
                      </div>
                      <div className='text-sm text-gray-500'>Vehicles</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicles Section */}
        <div className='mb-8'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-2xl font-bold text-gray-900'>
              {userData.name}'s Vehicles
            </h2>
            <div className='text-sm text-gray-500'>
              {userVehicles?.length || 0} vehicle
              {userVehicles?.length !== 1 ? 's' : ''} available
            </div>
          </div>

          {userVehicles && userVehicles.length > 0 ? (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {userVehicles.map(vehicle => (
                <Card
                  key={vehicle._id}
                  className='overflow-hidden hover:shadow-lg transition-shadow duration-300 border-0 shadow-sm group'
                >
                  <Link to={`/vehicles/${vehicle._id}`}>
                    <div className='aspect-video bg-gray-200 relative overflow-hidden'>
                      {vehicle.images && vehicle.images[0] ? (
                        <img
                          src={vehicle.images[0].url}
                          alt={`${vehicle.make} ${vehicle.model}`}
                          className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
                        />
                      ) : (
                        <div className='w-full h-full flex items-center justify-center'>
                          <Car className='h-12 w-12 text-gray-400' />
                        </div>
                      )}
                      <Badge
                        className={`absolute top-3 right-3 ${
                          vehicle.isApproved
                            ? 'bg-green-500 text-white'
                            : 'bg-yellow-500 text-white'
                        } border-0 shadow-lg`}
                      >
                        {vehicle.isApproved ? 'Available' : 'Pending'}
                      </Badge>
                    </div>
                  </Link>
                  <CardContent className='p-6'>
                    <div className='space-y-3'>
                      <div>
                        <h3 className='font-bold text-xl text-gray-900 mb-1'>
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </h3>
                        <p className='text-gray-600 text-sm line-clamp-2'>
                          {vehicle.description}
                        </p>
                      </div>

                      <div className='flex items-center justify-between text-sm text-gray-600'>
                        <div className='flex items-center space-x-4'>
                          <div className='flex items-center space-x-1'>
                            <Gauge className='h-4 w-4' />
                            <span>{vehicle.horsepower || 'N/A'} HP</span>
                          </div>
                          <div className='flex items-center space-x-1'>
                            <Fuel className='h-4 w-4' />
                            <span>{vehicle.engineType || 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      <div className='flex items-center justify-between pt-3 border-t border-gray-100'>
                        <div className='flex items-center space-x-1 text-gray-600'>
                          <MapPin className='h-4 w-4 text-gray-400' />
                          <span className='text-sm'>
                            {vehicle.track?.name || 'Track'}
                          </span>
                        </div>
                        <div className='text-right'>
                          <div className='text-xl font-bold text-[#EF1C25]'>
                            {formatCurrency(vehicle.dailyRate)}
                          </div>
                          <div className='text-xs text-gray-500'>per day</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className='text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200'>
              <Car className='h-16 w-16 text-gray-300 mx-auto mb-4' />
              <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                No vehicles available
              </h3>
              <p className='text-gray-500 max-w-md mx-auto'>
                This host hasn't listed any vehicles for rent yet. Check back
                later for new listings!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { BookingModal } from '@/components/BookingModal';
import { PaymentModal } from '@/components/PaymentModal';
import { ShareDropdown } from '@/components/ShareDropdown';
import { StripeProvider } from '@/components/providers/StripeProvider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToastContainer, useToast } from '@/components/ui/toast';
import { useFavorites } from '@/hooks/useFavorites';
import { useReservations } from '@/hooks/useReservations';
import { formatCurrency } from '@/lib/utils';
import { useUser } from '@clerk/clerk-react';
import { api } from '@/lib/convex';
import { Id } from '@/lib/convex';
import { useMutation, useQuery } from 'convex/react';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  Fuel,
  Gauge,
  Heart,
  MapPin,
  MessageCircle,
  Settings,
  Shield,
  Star,
  Users,
  Zap,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

export default function VehicleDetailPage() {
  const { id: vehicleId } = useParams<{ id: string }>();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [pendingReservation, setPendingReservation] = useState<{
    id: Id<'reservations'>;
    amount: number;
  } | null>(null);
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const { toasts, removeToast, success, error } = useToast();
  const { isVehicleFavorited, toggleFavorite, isSignedIn } = useFavorites();

  // Fetch vehicle data
  const vehicleData = useQuery(api.vehicles.getById, {
    id: vehicleId as Id<'vehicles'>,
  });

  // Mutations
  const createConversation = useMutation(api.conversations.create);
  const { createReservation } = useReservations();

  // Handle message host
  const handleMessageHost = async () => {
    if (!user || !vehicleData) {
      return;
    }

    try {
      // Get or create conversation
      const conversationId = await createConversation({
        vehicleId: vehicleData._id,
        renterId: user.id,
        ownerId: vehicleData.ownerId,
      });

      // Navigate to messages page with conversation ID
      navigate(`/messages?conversationId=${conversationId}`);
    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  };

  // Handle favorites toggle
  const handleToggleFavorite = () => {
    if (!vehicleData) return;
    const vehicleName = `${vehicleData.year} ${vehicleData.make} ${vehicleData.model}`;
    toggleFavorite(vehicleData._id, vehicleName);
  };

  // Handle booking
  const handleBookNow = () => {
    if (!user) {
      navigate('/sign-in');
      return;
    }
    setBookingModalVisible(true);
  };

  const handleBook = async (
    startDate: string,
    endDate: string,
    message?: string,
    selectedAddOns?: Set<string>
  ) => {
    if (!vehicleData) return;

    try {
      // Create reservation
      const reservationId = await createReservation({
        vehicleId: vehicleData._id,
        startDate,
        endDate,
        renterMessage: message,
      });

      // Calculate total amount (in cents)
      const start = new Date(startDate);
      const end = new Date(endDate);
      const totalDays =
        Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) +
        1;

      const baseAmount = totalDays * vehicleData.dailyRate * 100; // Convert to cents
      const addOnAmount = Array.from(selectedAddOns || new Set()).reduce(
        (total, addOnName) => {
          const addOn = vehicleData.addOns?.find(
            (a: any) => a.name === addOnName
          );
          return total + (addOn?.price || 0) * totalDays * 100; // Convert to cents
        },
        0
      );

      const totalAmount = baseAmount + addOnAmount;

      // Set pending reservation and show payment modal
      setPendingReservation({
        id: reservationId,
        amount: totalAmount,
      });
      setPaymentModalVisible(true);
    } catch (error) {
      console.error('Failed to create reservation:', error);
      error(
        'Booking Failed',
        'Unable to create reservation. Please try again.'
      );
    }
  };

  const handlePaymentSuccess = () => {
    setPaymentModalVisible(false);
    setPendingReservation(null);
    success('Payment Successful!', 'Your booking has been confirmed.');
    // Navigate to booking success page
    navigate('/booking-success');
  };

  const handlePaymentClose = () => {
    setPaymentModalVisible(false);
    setPendingReservation(null);
    // Keep the reservation as pending - user can retry payment later
  };

  // Loading and error states
  if (vehicleData === undefined) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-16 h-16 bg-gray-200 rounded-full animate-pulse mx-auto mb-4'></div>
          <p className='text-gray-600'>Loading vehicle details...</p>
        </div>
      </div>
    );
  }

  if (!vehicleData) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4'>
            <AlertCircle className='h-8 w-8 text-gray-400' />
          </div>
          <h3 className='text-xl font-semibold text-gray-900 mb-2'>
            Vehicle Not Found
          </h3>
          <p className='text-gray-600 mb-6'>
            The vehicle you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to='/search'>Back to Search</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header with back button */}
      <div className='bg-white border-b sticky top-0 z-10'>
        <div className='container px-4 py-4'>
          <div className='flex items-center justify-between'>
            <Button asChild variant='ghost' size='sm'>
              <Link to='/search' className='flex items-center space-x-2'>
                <ArrowLeft className='h-4 w-4' />
                <span>Back to Browse</span>
              </Link>
            </Button>

            <div className='flex items-center space-x-2'>
              <ShareDropdown
                vehicleData={vehicleData}
                vehicleId={vehicleData._id}
                onSuccess={message => success('Success', message)}
                onError={message => error('Error', message)}
              />
              <Button
                variant='outline'
                size='sm'
                onClick={handleToggleFavorite}
                className={
                  isVehicleFavorited(vehicleData?._id)
                    ? 'text-red-500 border-red-500 hover:bg-red-50'
                    : ''
                }
              >
                <Heart
                  className={`h-4 w-4 mr-2 ${isVehicleFavorited(vehicleData?._id) ? 'fill-current' : ''}`}
                />
                {isSignedIn
                  ? isVehicleFavorited(vehicleData?._id)
                    ? 'Saved'
                    : 'Save'
                  : 'Sign in to Save'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className='container px-2 py-8 space-y-8'>
        {/* Sign-in prompt for non-logged-in users */}
        {!user && (
          <Card className='bg-gradient-to-r from-[#FF5A5F] to-[#FF6B70] text-white border-0'>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <h3 className='text-lg font-semibold mb-1'>
                    Ready to book this car?
                  </h3>
                  <p className='text-white/90'>
                    Sign up to book vehicles, save favorites, and contact
                    owners.
                  </p>
                </div>
                <div className='flex space-x-3'>
                  <Button
                    asChild
                    variant='outline'
                    className='bg-white text-[#FF5A5F] hover:bg-gray-100 border-white'
                  >
                    <Link to='/sign-up'>Sign Up</Link>
                  </Button>
                  <Button
                    asChild
                    variant='outline'
                    className='bg-transparent border-white text-white hover:bg-white hover:text-[#FF5A5F]'
                  >
                    <Link to='/sign-in'>Sign In</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Left Column - Images and Basic Info */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Image Gallery */}
            <Card className='overflow-hidden'>
              <div className='aspect-[16/10] relative bg-gray-100'>
                <img
                  src={
                    vehicleData.images && vehicleData.images.length > 0
                      ? vehicleData.images[activeImageIndex]
                      : 'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=1200'
                  }
                  alt={`${vehicleData.year} ${vehicleData.make} ${vehicleData.model}`}
                  className='w-full h-full object-cover'
                />

                {/* Image navigation */}
                {vehicleData.images && vehicleData.images.length > 1 && (
                  <div className='absolute bottom-4 left-4 flex space-x-2'>
                    {vehicleData.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveImageIndex(index)}
                        className={`w-3 h-3 rounded-full ${
                          activeImageIndex === index
                            ? 'bg-white'
                            : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Thumbnail strip */}
              {vehicleData.images && vehicleData.images.length > 1 && (
                <div className='p-4 border-t'>
                  <div className='flex space-x-2 overflow-x-auto'>
                    {vehicleData.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                          activeImageIndex === index
                            ? 'border-[#FF5A5F]'
                            : 'border-gray-200'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`Thumbnail ${index + 1}`}
                          className='w-full h-full object-cover'
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Vehicle Details Tabs */}
            <Tabs defaultValue='specifications' className='w-full'>
              <TabsList className='grid w-full grid-cols-4'>
                <TabsTrigger value='specifications'>Specifications</TabsTrigger>
                <TabsTrigger value='features'>Features</TabsTrigger>
                <TabsTrigger value='location'>Location</TabsTrigger>
                <TabsTrigger value='reviews'>Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value='specifications' className='space-y-6'>
                <Card>
                  <CardContent className='p-6'>
                    <h3 className='text-lg font-semibold mb-4'>
                      Performance Specifications
                    </h3>
                    <div className='grid grid-cols-2 gap-4'>
                      <div className='space-y-3'>
                        <div className='flex items-center space-x-3'>
                          <Zap className='h-5 w-5 text-gray-400' />
                          <div>
                            <p className='text-sm text-gray-600'>Horsepower</p>
                            <p className='font-semibold'>
                              {vehicleData.horsepower} HP
                            </p>
                          </div>
                        </div>
                        <div className='flex items-center space-x-3'>
                          <Settings className='h-5 w-5 text-gray-400' />
                          <div>
                            <p className='text-sm text-gray-600'>
                              Transmission
                            </p>
                            <p className='font-semibold'>
                              {vehicleData.transmission}
                            </p>
                          </div>
                        </div>
                        <div className='flex items-center space-x-3'>
                          <Gauge className='h-5 w-5 text-gray-400' />
                          <div>
                            <p className='text-sm text-gray-600'>Drivetrain</p>
                            <p className='font-semibold'>
                              {vehicleData.drivetrain}
                            </p>
                          </div>
                        </div>
                        <div className='flex items-center space-x-3'>
                          <Fuel className='h-5 w-5 text-gray-400' />
                          <div>
                            <p className='text-sm text-gray-600'>Fuel Type</p>
                            <p className='font-semibold'>
                              {vehicleData.fuelType || 'Premium'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className='space-y-3'>
                        <div className='flex items-center space-x-3'>
                          <Clock className='h-5 w-5 text-gray-400' />
                          <div>
                            <p className='text-sm text-gray-600'>Year</p>
                            <p className='font-semibold'>{vehicleData.year}</p>
                          </div>
                        </div>
                        <div className='flex items-center space-x-3'>
                          <Gauge className='h-5 w-5 text-gray-400' />
                          <div>
                            <p className='text-sm text-gray-600'>Mileage</p>
                            <p className='font-semibold'>
                              {vehicleData.mileage.toLocaleString()} mi
                            </p>
                          </div>
                        </div>
                        <div className='flex items-center space-x-3'>
                          <div className='h-5 w-5 bg-gray-400 rounded-full'></div>
                          <div>
                            <p className='text-sm text-gray-600'>Color</p>
                            <p className='font-semibold'>
                              {vehicleData.color || 'Multiple'}
                            </p>
                          </div>
                        </div>
                        <div className='flex items-center space-x-3'>
                          <CheckCircle className='h-5 w-5 text-green-500' />
                          <div>
                            <p className='text-sm text-gray-600'>Status</p>
                            <p className='font-semibold text-green-600'>
                              Available
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className='p-6'>
                    <h3 className='text-lg font-semibold mb-4'>Description</h3>
                    <p className='text-gray-700 leading-relaxed'>
                      {vehicleData.description}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value='features' className='space-y-6'>
                <Card>
                  <CardContent className='p-6'>
                    <h3 className='text-lg font-semibold mb-4'>
                      Amenities & Features
                    </h3>
                    {vehicleData.amenities &&
                    vehicleData.amenities.length > 0 ? (
                      <div className='grid grid-cols-2 gap-3'>
                        {vehicleData.amenities.map((amenity, index) => (
                          <div
                            key={index}
                            className='flex items-center space-x-2'
                          >
                            <CheckCircle className='h-4 w-4 text-green-500' />
                            <span className='text-sm text-gray-700'>
                              {amenity}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className='text-gray-600'>
                        No specific amenities listed.
                      </p>
                    )}
                  </CardContent>
                </Card>

                {vehicleData.addOns && vehicleData.addOns.length > 0 && (
                  <Card>
                    <CardContent className='p-6'>
                      <h3 className='text-lg font-semibold mb-4'>
                        Available Add-ons
                      </h3>
                      <div className='space-y-3'>
                        {vehicleData.addOns.map((addon, index) => (
                          <div
                            key={index}
                            className='flex items-center justify-between p-3 border rounded-lg'
                          >
                            <div>
                              <p className='font-medium'>{addon.name}</p>
                              <p className='text-sm text-gray-600'>
                                {addon.description}
                              </p>
                            </div>
                            <div className='text-right'>
                              <p className='font-semibold'>
                                {formatCurrency(addon.price)}
                              </p>
                              <Badge
                                variant={
                                  addon.isRequired ? 'default' : 'secondary'
                                }
                              >
                                {addon.isRequired ? 'Required' : 'Optional'}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value='location' className='space-y-6'>
                <Card>
                  <CardContent className='p-6'>
                    <h3 className='text-lg font-semibold mb-4'>
                      Track Location
                    </h3>
                    {vehicleData.track ? (
                      <div className='space-y-4'>
                        <div className='flex items-center space-x-3'>
                          <MapPin className='h-5 w-5 text-gray-400' />
                          <div>
                            <p className='font-medium'>
                              {vehicleData.track.name}
                            </p>
                            <p className='text-gray-600'>
                              {vehicleData.track.location}
                            </p>
                          </div>
                        </div>
                        <p className='text-gray-700'>
                          {vehicleData.track.description}
                        </p>
                      </div>
                    ) : (
                      <p className='text-gray-600'>
                        Track information not available.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value='reviews' className='space-y-6'>
                <Card>
                  <CardContent className='p-6'>
                    <div className='text-center py-8'>
                      <Star className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                      <h3 className='text-lg font-semibold mb-2'>
                        No Reviews Yet
                      </h3>
                      <p className='text-gray-600'>
                        This vehicle hasn't been reviewed yet. Be the first to
                        rent and review!
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Booking & Owner Info */}
          <div className='space-y-6'>
            {/* Pricing Card */}
            <Card className='sticky top-24'>
              <CardContent className='p-6'>
                <div className='space-y-4'>
                  <div className='text-center'>
                    <span className='text-3xl font-bold text-gray-900'>
                      {formatCurrency(vehicleData.dailyRate)}
                    </span>
                    <span className='text-gray-600 ml-2'>per day</span>
                  </div>

                  {user ? (
                    <Button
                      className='w-full'
                      size='lg'
                      onClick={handleBookNow}
                    >
                      <Calendar className='h-4 w-4 mr-2' />
                      Book Vehicle
                    </Button>
                  ) : (
                    <Button variant='outline' className='w-full' asChild>
                      <Link to='/sign-in' className='flex items-center'>
                        <MessageCircle className='h-4 w-4 mr-2' />
                        Sign in to Book
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Owner Card */}
            <Card>
              <CardContent className='p-6'>
                <h3 className='text-lg font-semibold mb-4'>Meet Your Host</h3>
                {vehicleData.owner ? (
                  <div className='space-y-4'>
                    <Link
                      to={`/users/${vehicleData.owner.externalId}`}
                      className='flex items-center space-x-3 hover:bg-gray-50 p-2 rounded-lg transition-colors'
                    >
                      <div className='w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center'>
                        {vehicleData.owner.profileImage ? (
                          <img
                            src={vehicleData.owner.profileImage}
                            alt={vehicleData.owner.name}
                            className='w-full h-full rounded-full'
                          />
                        ) : (
                          <Users className='h-6 w-6 text-gray-400' />
                        )}
                      </div>
                      <div>
                        <p className='font-medium hover:text-blue-600 transition-colors'>
                          {vehicleData.owner.name}
                        </p>
                        <div className='flex items-center space-x-1'>
                          <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
                          <span className='text-sm text-gray-600'>
                            {vehicleData.owner.rating?.toFixed(1) || '4.9'} •{' '}
                            {vehicleData.owner.totalRentals} rentals
                          </span>
                        </div>
                      </div>
                    </Link>

                    <div className='space-y-2 text-sm text-gray-600'>
                      <div className='flex items-center space-x-2'>
                        <Shield className='h-4 w-4' />
                        <span>{vehicleData.owner.userType} verified</span>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <Clock className='h-4 w-4' />
                        <span>
                          Member since {vehicleData.owner.memberSince}
                        </span>
                      </div>
                    </div>

                    {user ? (
                      <Button
                        variant='outline'
                        className='w-full'
                        onClick={handleMessageHost}
                      >
                        <MessageCircle className='h-4 w-4 mr-2' />
                        Message Host
                      </Button>
                    ) : (
                      <Button variant='outline' className='w-full' asChild>
                        <Link to='/sign-in' className='flex items-center'>
                          <MessageCircle className='h-4 w-4 mr-2' />
                          Sign in to Message Host
                        </Link>
                      </Button>
                    )}
                  </div>
                ) : (
                  <p className='text-gray-600'>
                    Owner information not available.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Safety Information */}
            <Card>
              <CardContent className='p-6'>
                <h3 className='text-lg font-semibold mb-4'>Safety & Trust</h3>
                <div className='space-y-3 text-sm'>
                  <div className='flex items-center space-x-2'>
                    <CheckCircle className='h-4 w-4 text-green-500' />
                    <span>Vehicle inspected and approved</span>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <CheckCircle className='h-4 w-4 text-green-500' />
                    <span>Insurance coverage included</span>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <CheckCircle className='h-4 w-4 text-green-500' />
                    <span>24/7 roadside assistance</span>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <CheckCircle className='h-4 w-4 text-green-500' />
                    <span>Secure payment processing</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={bookingModalVisible}
        onClose={() => setBookingModalVisible(false)}
        vehicle={vehicleData}
        onBook={handleBook}
      />

      {/* Payment Modal */}
      {pendingReservation && (
        <StripeProvider>
          <PaymentModal
            isOpen={paymentModalVisible}
            onClose={handlePaymentClose}
            reservationId={pendingReservation.id}
            amount={pendingReservation.amount}
            onSuccess={handlePaymentSuccess}
          />
        </StripeProvider>
      )}

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

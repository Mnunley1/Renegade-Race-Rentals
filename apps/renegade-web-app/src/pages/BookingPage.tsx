import { DateTimePicker } from '@/components/DateTimePicker';
import { useReservations } from '@/hooks/useReservations';
import { api } from '@/lib/convex';
import { calculateDays, formatCurrency } from '@/lib/utils';
import { useUser } from '@clerk/clerk-react';
import { Id } from '@renegade/backend/convex/_generated/dataModel';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  useToast,
} from '@renegade/ui';
import { useQuery } from 'convex/react';
import { Check, Clock, DollarSign, MessageSquare, User } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function BookingPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { success, error } = useToast();
  const { createReservation } = useReservations();
  const { id: vehicleId } = useParams<{ id: string }>();

  // Fetch vehicle data
  const vehicle = useQuery(api.vehicles.getById, {
    id: vehicleId as Id<'vehicles'>,
  });

  // State for booking form
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [startTime, setStartTime] = useState('10:30');
  const [endTime, setEndTime] = useState('12:30');
  const [selectedAddOns, setSelectedAddOns] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  // Calculate totals
  const totalDays =
    startDate && endDate
      ? calculateDays(startDate.toISOString(), endDate.toISOString())
      : 0;

  const addOnsTotal = Array.from(selectedAddOns).reduce((total, addOnName) => {
    const addOn = vehicle?.addOns?.find(
      (a: { name: string; price: number }) => a.name === addOnName
    );
    return total + (addOn?.price || 0) * totalDays;
  }, 0);

  const totalAmount = (vehicle?.dailyRate || 0) * totalDays + addOnsTotal;

  const toggleAddOn = (addOnName: string) => {
    const newSelectedAddOns = new Set(selectedAddOns);
    if (newSelectedAddOns.has(addOnName)) {
      newSelectedAddOns.delete(addOnName);
    } else {
      newSelectedAddOns.add(addOnName);
    }
    setSelectedAddOns(newSelectedAddOns);
  };

  const resetSelection = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setSelectedAddOns(new Set());
    setStartTime('10:30');
    setEndTime('12:30');
  };

  const handleBook = async () => {
    if (!startDate || !endDate || !user) {
      return;
    }

    setLoading(true);
    try {
      await createReservation({
        vehicleId: vehicleId as Id<'vehicles'>,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        pickupTime: startTime,
        dropoffTime: endTime,
        renterMessage: Array.from(selectedAddOns).join(', '),
      });

      success('Booking created successfully! Redirecting to payment...');

      // Navigate to payment page or show payment modal
      setTimeout(() => {
        navigate(`/vehicle/${vehicleId}/payment`);
      }, 1000);
    } catch (err) {
      error('Failed to create booking. Please try again.');
      console.error('Booking error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!vehicle) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-[#EF1C25] mx-auto mb-4'></div>
          <p className='text-gray-600'>Loading vehicle details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white border-b'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>
                Book {vehicle.year} {vehicle.make} {vehicle.model}
              </h1>
              <p className='text-gray-600 mt-1'>
                Complete your booking details below
              </p>
            </div>
            <Button
              variant='outline'
              onClick={() => navigate(`/vehicles/${vehicleId}`)}
            >
              Back to Vehicle
            </Button>
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Left Column - Booking Form */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Date and Time Selection */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Clock className='h-5 w-5 mr-2' />
                  Select Dates & Times
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DateTimePicker
                  startDate={startDate}
                  endDate={endDate}
                  startTime={startTime}
                  endTime={endTime}
                  onStartDateChange={setStartDate}
                  onEndDateChange={setEndDate}
                  onStartTimeChange={setStartTime}
                  onEndTimeChange={setEndTime}
                />
              </CardContent>
            </Card>

            {/* Add-ons */}
            {vehicle?.addOns && vehicle.addOns.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Add-ons</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-3'>
                    {vehicle.addOns.map((addOn: any) => (
                      <div
                        key={addOn.name}
                        className='flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50'
                        onClick={() => toggleAddOn(addOn.name)}
                      >
                        <div className='flex items-center space-x-3'>
                          <div
                            className={`
                              w-4 h-4 border-2 rounded flex items-center justify-center
                              ${selectedAddOns.has(addOn.name) ? 'bg-[#EF1C25] border-[#EF1C25]' : 'border-gray-300'}
                            `}
                          >
                            {selectedAddOns.has(addOn.name) && (
                              <Check className='h-3 w-3 text-white' />
                            )}
                          </div>
                          <div>
                            <p className='font-medium'>{addOn.name}</p>
                            <p className='text-sm text-gray-600'>
                              {addOn.description}
                            </p>
                          </div>
                        </div>
                        <div className='text-right'>
                          <p className='font-medium'>
                            {formatCurrency(addOn.price)}
                          </p>
                          <p className='text-sm text-gray-600'>per day</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Summary */}
          <div className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <div className='flex justify-between'>
                    <span>
                      {formatCurrency(vehicle?.dailyRate || 0)} × {totalDays}{' '}
                      days
                    </span>
                    <span>
                      {formatCurrency((vehicle?.dailyRate || 0) * totalDays)}
                    </span>
                  </div>

                  {selectedAddOns.size > 0 && (
                    <>
                      {Array.from(selectedAddOns).map(addOnName => {
                        const addOn = vehicle?.addOns?.find(
                          (a: any) => a.name === addOnName
                        );
                        return (
                          <div
                            key={addOnName}
                            className='flex justify-between text-sm text-gray-600'
                          >
                            <span>
                              {addOnName} × {totalDays} days
                            </span>
                            <span>
                              {formatCurrency((addOn?.price || 0) * totalDays)}
                            </span>
                          </div>
                        );
                      })}
                    </>
                  )}

                  <div className='border-t pt-2'>
                    <div className='flex justify-between font-bold text-lg'>
                      <span>Total</span>
                      <span>{formatCurrency(totalAmount)}</span>
                    </div>
                  </div>
                </div>

                <div className='space-y-2'>
                  <Button
                    onClick={handleBook}
                    disabled={!startDate || !endDate || loading}
                    className='w-full'
                    size='lg'
                  >
                    {loading ? (
                      <>
                        <Clock className='h-4 w-4 mr-2 animate-spin' />
                        Processing...
                      </>
                    ) : (
                      <>
                        <DollarSign className='h-4 w-4 mr-2' />
                        Continue to Payment
                      </>
                    )}
                  </Button>

                  <Button
                    variant='outline'
                    onClick={resetSelection}
                    className='w-full'
                  >
                    Reset Selection
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Message Owner Section */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <User className='h-5 w-5 mr-2' />
                  Contact Owner
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <p className='text-sm text-gray-600'>
                    Have questions about this vehicle? Contact the owner
                    directly.
                  </p>
                  <Button
                    variant='outline'
                    className='w-full'
                    onClick={() => {
                      // Navigate to messages or open message modal
                      navigate(`/messages?vehicleId=${vehicleId}`);
                    }}
                  >
                    <MessageSquare className='h-4 w-4 mr-2' />
                    Message Owner
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

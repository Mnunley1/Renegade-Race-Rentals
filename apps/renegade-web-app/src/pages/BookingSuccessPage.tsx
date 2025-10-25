import { Button } from '@renegade/ui';
import { Card, CardContent } from '@renegade/ui';
import { Calendar, CheckCircle, Clock, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function BookingSuccessPage() {
  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
      <Card className='max-w-md w-full'>
        <CardContent className='p-8 text-center'>
          <div className='mb-6'>
            <CheckCircle className='h-16 w-16 text-green-500 mx-auto mb-4' />
            <h1 className='text-2xl font-bold text-gray-900 mb-2'>
              Booking Confirmed!
            </h1>
            <p className='text-gray-600'>
              Your vehicle booking has been successfully confirmed. You'll
              receive a confirmation email shortly.
            </p>
          </div>

          <div className='space-y-4 mb-8'>
            <div className='flex items-center space-x-3 text-left'>
              <Calendar className='h-5 w-5 text-blue-500' />
              <div>
                <p className='font-medium'>Booking Details</p>
                <p className='text-sm text-gray-600'>
                  Check your dashboard for full details
                </p>
              </div>
            </div>

            <div className='flex items-center space-x-3 text-left'>
              <MapPin className='h-5 w-5 text-blue-500' />
              <div>
                <p className='font-medium'>Track Location</p>
                <p className='text-sm text-gray-600'>
                  Directions will be provided
                </p>
              </div>
            </div>

            <div className='flex items-center space-x-3 text-left'>
              <Clock className='h-5 w-5 text-blue-500' />
              <div>
                <p className='font-medium'>Pickup Time</p>
                <p className='text-sm text-gray-600'>
                  Contact host for specific timing
                </p>
              </div>
            </div>
          </div>

          <div className='space-y-3'>
            <Button asChild className='w-full'>
              <Link to='/dashboard'>View My Bookings</Link>
            </Button>

            <Button variant='outline' asChild className='w-full'>
              <Link to='/search'>Browse More Vehicles</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

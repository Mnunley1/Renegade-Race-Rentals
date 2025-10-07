import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@clerk/clerk-react';
import { api } from '@/lib/convex';
import { useQuery } from 'convex/react';
import {
  ArrowLeft,
  Calendar,
  Car,
  Clock,
  DollarSign,
  Filter,
  Star,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function RentalHistoryPage() {
  const { user, isSignedIn } = useUser();
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'
  >('all');

  // Fetch user's rental history
  const rentals = useQuery(api.reservations.getByUser, {
    userId: user?.id || '',
    role: 'renter' as const,
  });

  if (!isSignedIn || !user) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <Card className='w-full max-w-md'>
          <CardContent className='p-8 text-center'>
            <Calendar className='h-16 w-16 text-gray-400 mx-auto mb-4' />
            <h2 className='text-2xl font-bold text-gray-900 mb-4'>
              Sign In Required
            </h2>
            <p className='text-gray-600 mb-6'>
              Please sign in to view your rental history.
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      confirmed: { color: 'bg-green-100 text-green-800', label: 'Confirmed' },
      completed: { color: 'bg-blue-100 text-blue-800', label: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return <Badge className={`${config.color} border-0`}>{config.label}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    const iconConfig = {
      pending: Clock,
      confirmed: Calendar,
      completed: Star,
      cancelled: Clock,
    };

    const Icon = iconConfig[status as keyof typeof iconConfig] || Clock;
    return <Icon className='h-4 w-4' />;
  };

  // Filter rentals based on status
  const filteredRentals =
    rentals?.filter(rental => {
      if (statusFilter === 'all') return true;
      return rental.status === statusFilter;
    }) || [];

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container px-4 py-8'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center space-x-4 mb-6'>
            <Button asChild variant='ghost' size='sm'>
              <Link to='/dashboard' className='flex items-center'>
                <ArrowLeft className='h-4 w-4 mr-2' />
                Back to Dashboard
              </Link>
            </Button>
          </div>
          <div className='flex items-center space-x-3'>
            <Calendar className='h-8 w-8 text-[#EF1C25]' />
            <h1 className='text-3xl font-bold text-gray-900'>Rental History</h1>
          </div>
          <p className='text-gray-600 mt-2'>
            View and manage your track car rental bookings.
          </p>
        </div>

        {/* Filter Controls */}
        <div className='mb-8'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <Filter className='h-5 w-5 mr-2' />
                Filter Rentals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex flex-wrap gap-2'>
                {[
                  { key: 'all', label: 'All Rentals' },
                  { key: 'pending', label: 'Pending' },
                  { key: 'confirmed', label: 'Confirmed' },
                  { key: 'completed', label: 'Completed' },
                  { key: 'cancelled', label: 'Cancelled' },
                ].map(filter => (
                  <Button
                    key={filter.key}
                    variant={
                      statusFilter === filter.key ? 'default' : 'outline'
                    }
                    size='sm'
                    onClick={() => setStatusFilter(filter.key as any)}
                  >
                    {filter.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rentals List */}
        {(rentals || []).length === 0 ? (
          // Empty state
          <Card>
            <CardContent className='p-12 text-center'>
              <Calendar className='h-16 w-16 text-gray-400 mx-auto mb-4' />
              <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                No rentals found
              </h3>
              <p className='text-gray-600 mb-6'>
                {statusFilter === 'all'
                  ? "You haven't made any rentals yet. Start exploring to find your perfect track car!"
                  : `No ${statusFilter} rentals found.`}
              </p>
              <Button asChild>
                <Link to='/search'>Search Cars</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          // Rentals grid
          <div className='space-y-4'>
            {filteredRentals.map(rental => (
              <Card
                key={rental._id}
                className='hover:shadow-lg transition-shadow'
              >
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between mb-4'>
                    <div className='flex items-center space-x-4'>
                      <div className='w-16 h-16 bg-[#EF1C25]/10 rounded-xl flex items-center justify-center'>
                        <Car className='h-8 w-8 text-[#EF1C25]' />
                      </div>
                      <div>
                        <h3 className='text-lg font-semibold text-gray-900'>
                          {rental.vehicle?.year} {rental.vehicle?.make}{' '}
                          {rental.vehicle?.model}
                        </h3>
                        <p className='text-sm text-gray-600'>
                          Rental #{rental._id}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(rental.status)}
                  </div>

                  <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-4'>
                    <div className='flex items-center space-x-2 text-sm text-gray-600'>
                      <Calendar className='h-4 w-4' />
                      <span>{formatDate(rental.startDate)}</span>
                    </div>
                    <div className='flex items-center space-x-2 text-sm text-gray-600'>
                      <Calendar className='h-4 w-4' />
                      <span>{formatDate(rental.endDate)}</span>
                    </div>
                    <div className='flex items-center space-x-2 text-sm text-gray-600'>
                      <Clock className='h-4 w-4' />
                      <span>
                        {rental.totalDays} day
                        {rental.totalDays !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className='flex items-center space-x-2 text-sm text-gray-600'>
                      <DollarSign className='h-4 w-4' />
                      <span>{formatCurrency(rental.totalAmount)}</span>
                    </div>
                  </div>

                  {rental.renterMessage && (
                    <div className='bg-gray-50 rounded-lg p-3 mb-4'>
                      <p className='text-sm text-gray-700'>
                        {rental.renterMessage}
                      </p>
                    </div>
                  )}

                  <div className='flex items-center justify-between'>
                    <div className='text-sm text-gray-500'>
                      Booking Rate:{' '}
                      {formatCurrency(rental.vehicle?.dailyRate || 0)}
                      /day
                    </div>
                    <div className='space-x-2'>
                      <Button asChild variant='outline' size='sm'>
                        <Link
                          to={
                            rental.vehicle?._id
                              ? `/vehicles/${rental.vehicle._id}`
                              : '#'
                          }
                        >
                          View Details
                        </Link>
                      </Button>
                      {rental.status === 'completed' && (
                        <Button variant='outline' size='sm'>
                          Leave Review
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

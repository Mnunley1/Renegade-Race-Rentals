import { useRentalCompletions } from '@/hooks/useRentalCompletions';
import { api } from '@/lib/convex';
import { useUser } from '@clerk/clerk-react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@renegade/ui';
import { useQuery } from 'convex/react';
import { AlertCircle, Car, CheckCircle, Clock, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PendingActionsWidgetProps {
  className?: string;
}

export function PendingActionsWidget({ className }: PendingActionsWidgetProps) {
  const { user, isSignedIn } = useUser();
  const { pendingCompletions } = useRentalCompletions();

  // Get pending reservations for owners
  const pendingReservations = useQuery(
    api.reservations.getByUser,
    user?.id
      ? { userId: user.id, role: 'owner' as const, status: 'pending' as const }
      : 'skip'
  );

  // Get confirmed reservations that need completion
  const _confirmedReservations = useQuery(
    api.reservations.getByUser,
    user?.id
      ? {
          userId: user.id,
          role: 'owner' as const,
          status: 'confirmed' as const,
        }
      : 'skip'
  );

  // Get completed rentals that need reviews
  const completedRentals = useQuery(
    api.reservations.getByUser,
    user?.id
      ? {
          userId: user.id,
          role: 'renter' as const,
          status: 'completed' as const,
        }
      : 'skip'
  );

  const completedOwnerRentals = useQuery(
    api.reservations.getByUser,
    user?.id
      ? {
          userId: user.id,
          role: 'owner' as const,
          status: 'completed' as const,
        }
      : 'skip'
  );

  if (!isSignedIn || !user) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Count pending actions
  const pendingReservationCount = pendingReservations?.length || 0;
  const pendingCompletionCount = pendingCompletions?.length || 0;
  const pendingReviewCount =
    (completedRentals?.length || 0) + (completedOwnerRentals?.length || 0);

  const totalPendingActions =
    pendingReservationCount + pendingCompletionCount + pendingReviewCount;

  if (totalPendingActions === 0) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <AlertCircle className='h-5 w-5 text-orange-600' />
          Pending Actions
          <Badge variant='secondary'>{totalPendingActions}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Pending Reservations to Approve */}
        {pendingReservationCount > 0 && (
          <div className='border-l-4 border-l-yellow-500 pl-4'>
            <div className='flex items-center justify-between mb-2'>
              <div className='flex items-center gap-2'>
                <Clock className='h-4 w-4 text-yellow-600' />
                <span className='font-medium text-sm'>
                  Reservations to Approve
                </span>
                <Badge variant='secondary' className='text-xs'>
                  {pendingReservationCount}
                </Badge>
              </div>
              <Button asChild variant='outline' size='sm'>
                <Link to='/dashboard?tab=rentals'>View All</Link>
              </Button>
            </div>
            <div className='space-y-2'>
              {pendingReservations?.slice(0, 2).map(reservation => (
                <div key={reservation._id} className='text-sm'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <span className='font-medium'>
                        {reservation.vehicle?.year} {reservation.vehicle?.make}{' '}
                        {reservation.vehicle?.model}
                      </span>
                      <span className='text-gray-600 ml-2'>
                        • {formatDate(reservation.startDate)} -{' '}
                        {formatDate(reservation.endDate)}
                      </span>
                    </div>
                    <span className='text-green-600 font-medium'>
                      {formatCurrency(reservation.totalAmount)}
                    </span>
                  </div>
                  <div className='text-gray-500 text-xs'>
                    From {reservation.renter?.name || 'Unknown Renter'}
                  </div>
                </div>
              ))}
              {pendingReservationCount > 2 && (
                <div className='text-xs text-gray-500'>
                  +{pendingReservationCount - 2} more reservations
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pending Completions */}
        {pendingCompletionCount > 0 && (
          <div className='border-l-4 border-l-blue-500 pl-4'>
            <div className='flex items-center justify-between mb-2'>
              <div className='flex items-center gap-2'>
                <Car className='h-4 w-4 text-blue-600' />
                <span className='font-medium text-sm'>Rental Completions</span>
                <Badge variant='secondary' className='text-xs'>
                  {pendingCompletionCount}
                </Badge>
              </div>
              <Button asChild variant='outline' size='sm'>
                <Link to='/rental-history'>View All</Link>
              </Button>
            </div>
            <div className='space-y-2'>
              {pendingCompletions?.slice(0, 2).map(completion => (
                <div key={completion._id} className='text-sm'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <span className='font-medium'>
                        {completion.vehicle?.year} {completion.vehicle?.make}{' '}
                        {completion.vehicle?.model}
                      </span>
                      <span className='text-gray-600 ml-2'>
                        • {formatDate(completion.reservation?.endDate)}
                      </span>
                    </div>
                    <Badge
                      variant={
                        completion.status === 'pending_renter'
                          ? 'secondary'
                          : 'default'
                      }
                      className='text-xs'
                    >
                      {completion.status === 'pending_renter'
                        ? 'Return Form'
                        : 'Owner Review'}
                    </Badge>
                  </div>
                  <div className='text-gray-500 text-xs'>
                    {completion.status === 'pending_renter'
                      ? 'Waiting for renter to submit return form'
                      : 'Waiting for owner to review return'}
                  </div>
                </div>
              ))}
              {pendingCompletionCount > 2 && (
                <div className='text-xs text-gray-500'>
                  +{pendingCompletionCount - 2} more completions
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pending Reviews */}
        {pendingReviewCount > 0 && (
          <div className='border-l-4 border-l-purple-500 pl-4'>
            <div className='flex items-center justify-between mb-2'>
              <div className='flex items-center gap-2'>
                <Star className='h-4 w-4 text-purple-600' />
                <span className='font-medium text-sm'>Reviews to Submit</span>
                <Badge variant='secondary' className='text-xs'>
                  {pendingReviewCount}
                </Badge>
              </div>
              <Button asChild variant='outline' size='sm'>
                <Link to='/rental-history'>View All</Link>
              </Button>
            </div>
            <div className='space-y-2'>
              {[...(completedRentals || []), ...(completedOwnerRentals || [])]
                .slice(0, 2)
                .map(rental => (
                  <div key={rental._id} className='text-sm'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <span className='font-medium'>
                          {rental.vehicle?.year} {rental.vehicle?.make}{' '}
                          {rental.vehicle?.model}
                        </span>
                        <span className='text-gray-600 ml-2'>
                          • {formatDate(rental.endDate)}
                        </span>
                      </div>
                      <Button asChild variant='outline' size='sm'>
                        <Link to={`/review/${rental._id}`}>
                          <Star className='h-3 w-3 mr-1' />
                          Review
                        </Link>
                      </Button>
                    </div>
                    <div className='text-gray-500 text-xs'>
                      {rental.renterId === user.id
                        ? `Review ${rental.owner?.name || 'the owner'}`
                        : `Review ${rental.renter?.name || 'the renter'}`}
                    </div>
                  </div>
                ))}
              {pendingReviewCount > 2 && (
                <div className='text-xs text-gray-500'>
                  +{pendingReviewCount - 2} more reviews
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className='pt-4 border-t'>
          <div className='flex gap-2'>
            {pendingReservationCount > 0 && (
              <Button asChild variant='outline' size='sm' className='flex-1'>
                <Link to='/dashboard?tab=rentals'>
                  <CheckCircle className='h-4 w-4 mr-2' />
                  Approve Reservations
                </Link>
              </Button>
            )}
            {pendingCompletionCount > 0 && (
              <Button asChild variant='outline' size='sm' className='flex-1'>
                <Link to='/rental-history'>
                  <Car className='h-4 w-4 mr-2' />
                  Complete Rentals
                </Link>
              </Button>
            )}
            {pendingReviewCount > 0 && (
              <Button asChild variant='outline' size='sm' className='flex-1'>
                <Link to='/rental-history'>
                  <Star className='h-4 w-4 mr-2' />
                  Leave Reviews
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

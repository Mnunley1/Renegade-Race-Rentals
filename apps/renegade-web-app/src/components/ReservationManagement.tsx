import { Badge } from '@renegade/ui';
import { Button } from '@renegade/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@renegade/ui';
import { Textarea } from '@renegade/ui';
import { useToast } from '@renegade/ui';
import { useReservations } from '@/hooks/useReservations';
import { api } from '@/lib/convex';
import { useUser } from '@clerk/clerk-react';
import { useQuery } from 'convex/react';
import {
  Calendar,
  Car,
  Check,
  Clock,
  MessageSquare,
  User,
  X,
} from 'lucide-react';
import { useState } from 'react';

interface ReservationManagementProps {
  className?: string;
}

export function ReservationManagement({
  className,
}: ReservationManagementProps) {
  const { user } = useUser();
  const { success, error } = useToast();
  const { approveReservation, declineReservation } = useReservations();

  const [processingId, setProcessingId] = useState<string | null>(null);
  const [declineMessage, setDeclineMessage] = useState<Record<string, string>>(
    {}
  );
  const [showDeclineForm, setShowDeclineForm] = useState<
    Record<string, boolean>
  >({});

  // Get pending reservations for the current user (as owner)
  const pendingReservations = useQuery(
    api.reservations.getByUser,
    user?.id
      ? { userId: user.id, role: 'owner' as const, status: 'pending' as const }
      : 'skip'
  );

  // Get confirmed reservations
  const confirmedReservations = useQuery(
    api.reservations.getByUser,
    user?.id
      ? {
          userId: user.id,
          role: 'owner' as const,
          status: 'confirmed' as const,
        }
      : 'skip'
  );

  const handleApprove = async (
    reservationId: string,
    ownerMessage?: string
  ) => {
    if (!user) return;

    setProcessingId(reservationId);
    try {
      await approveReservation({
        reservationId: reservationId as any,
        ownerMessage,
      });
      success(
        'Reservation Approved',
        'The reservation has been approved successfully.'
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to approve reservation';
      error('Approval Failed', message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (reservationId: string) => {
    if (!user) return;

    const message = declineMessage[reservationId]?.trim();
    setProcessingId(reservationId);
    try {
      await declineReservation({
        reservationId: reservationId as any,
        ownerMessage: message || undefined,
      });
      success('Reservation Declined', 'The reservation has been declined.');
      setDeclineMessage(prev => ({ ...prev, [reservationId]: '' }));
      setShowDeclineForm(prev => ({ ...prev, [reservationId]: false }));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to decline reservation';
      error('Decline Failed', message);
    } finally {
      setProcessingId(null);
    }
  };

  const toggleDeclineForm = (reservationId: string) => {
    setShowDeclineForm(prev => ({
      ...prev,
      [reservationId]: !prev[reservationId],
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!user) {
    return (
      <Card className={className}>
        <CardContent className='p-6 text-center'>
          <p className='text-gray-600'>
            Please sign in to manage reservations.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Pending Reservations */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Clock className='h-5 w-5' />
            Pending Reservations
            {pendingReservations && pendingReservations.length > 0 && (
              <Badge variant='secondary'>{pendingReservations.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingReservations === undefined ? (
            <div className='text-center py-8'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
              <p className='text-gray-600 mt-2'>Loading reservations...</p>
            </div>
          ) : pendingReservations.length === 0 ? (
            <div className='text-center py-8'>
              <Clock className='h-12 w-12 text-gray-400 mx-auto mb-4' />
              <p className='text-gray-600'>No pending reservations</p>
            </div>
          ) : (
            <div className='space-y-4'>
              {pendingReservations.map(reservation => (
                <Card
                  key={reservation._id}
                  className='border-l-4 border-l-yellow-500'
                >
                  <CardContent className='p-4'>
                    <div className='flex items-start justify-between'>
                      <div className='flex-1'>
                        <div className='flex items-center gap-3 mb-3'>
                          <Car className='h-5 w-5 text-gray-600' />
                          <div>
                            <h3 className='font-semibold'>
                              {reservation.vehicle?.year}{' '}
                              {reservation.vehicle?.make}{' '}
                              {reservation.vehicle?.model}
                            </h3>
                            <p className='text-sm text-gray-600'>
                              {formatCurrency(reservation.dailyRate)}/day •{' '}
                              {reservation.totalDays} days
                            </p>
                          </div>
                        </div>

                        <div className='grid grid-cols-2 gap-4 mb-3'>
                          <div className='flex items-center gap-2'>
                            <Calendar className='h-4 w-4 text-gray-500' />
                            <span className='text-sm'>
                              {formatDate(reservation.startDate)} -{' '}
                              {formatDate(reservation.endDate)}
                            </span>
                          </div>
                          <div className='flex items-center gap-2'>
                            <User className='h-4 w-4 text-gray-500' />
                            <span className='text-sm'>
                              {reservation.renter?.name || 'Unknown Renter'}
                            </span>
                          </div>
                        </div>

                        <div className='flex items-center gap-2 mb-3'>
                          <span className='text-lg font-bold text-green-600'>
                            Total: {formatCurrency(reservation.totalAmount)}
                          </span>
                        </div>

                        {reservation.renterMessage && (
                          <div className='bg-gray-50 rounded-lg p-3 mb-3'>
                            <div className='flex items-center gap-2 mb-1'>
                              <MessageSquare className='h-4 w-4 text-gray-500' />
                              <span className='text-sm font-medium text-gray-700'>
                                Renter Message:
                              </span>
                            </div>
                            <p className='text-sm text-gray-600'>
                              {reservation.renterMessage}
                            </p>
                          </div>
                        )}

                        {showDeclineForm[reservation._id] && (
                          <div className='bg-red-50 border border-red-200 rounded-lg p-3 mb-3'>
                            <label className='block text-sm font-medium text-red-700 mb-2'>
                              Reason for declining (optional):
                            </label>
                            <Textarea
                              value={declineMessage[reservation._id] || ''}
                              onChange={e =>
                                setDeclineMessage(prev => ({
                                  ...prev,
                                  [reservation._id]: e.target.value,
                                }))
                              }
                              placeholder="Let the renter know why you're declining..."
                              className='min-h-[80px]'
                            />
                          </div>
                        )}
                      </div>

                      <div className='flex flex-col gap-2 ml-4'>
                        <Button
                          onClick={() => handleApprove(reservation._id)}
                          disabled={processingId === reservation._id}
                          className='bg-green-600 hover:bg-green-700'
                        >
                          {processingId === reservation._id ? (
                            <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                          ) : (
                            <Check className='h-4 w-4 mr-2' />
                          )}
                          Approve
                        </Button>

                        {!showDeclineForm[reservation._id] ? (
                          <Button
                            variant='outline'
                            onClick={() => toggleDeclineForm(reservation._id)}
                            disabled={processingId === reservation._id}
                          >
                            <X className='h-4 w-4 mr-2' />
                            Decline
                          </Button>
                        ) : (
                          <div className='flex gap-2'>
                            <Button
                              variant='destructive'
                              onClick={() => handleDecline(reservation._id)}
                              disabled={processingId === reservation._id}
                              size='sm'
                            >
                              {processingId === reservation._id ? (
                                <div className='animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1'></div>
                              ) : (
                                <X className='h-3 w-3 mr-1' />
                              )}
                              Confirm Decline
                            </Button>
                            <Button
                              variant='outline'
                              onClick={() => toggleDeclineForm(reservation._id)}
                              disabled={processingId === reservation._id}
                              size='sm'
                            >
                              Cancel
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmed Reservations */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Check className='h-5 w-5 text-green-600' />
            Confirmed Reservations
            {confirmedReservations && confirmedReservations.length > 0 && (
              <Badge variant='secondary'>{confirmedReservations.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {confirmedReservations === undefined ? (
            <div className='text-center py-8'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
              <p className='text-gray-600 mt-2'>Loading reservations...</p>
            </div>
          ) : confirmedReservations.length === 0 ? (
            <div className='text-center py-8'>
              <Check className='h-12 w-12 text-gray-400 mx-auto mb-4' />
              <p className='text-gray-600'>No confirmed reservations</p>
            </div>
          ) : (
            <div className='space-y-4'>
              {confirmedReservations.map(reservation => (
                <Card
                  key={reservation._id}
                  className='border-l-4 border-l-green-500'
                >
                  <CardContent className='p-4'>
                    <div className='flex items-start justify-between'>
                      <div className='flex-1'>
                        <div className='flex items-center gap-3 mb-3'>
                          <Car className='h-5 w-5 text-gray-600' />
                          <div>
                            <h3 className='font-semibold'>
                              {reservation.vehicle?.year}{' '}
                              {reservation.vehicle?.make}{' '}
                              {reservation.vehicle?.model}
                            </h3>
                            <p className='text-sm text-gray-600'>
                              {formatCurrency(reservation.dailyRate)}/day •{' '}
                              {reservation.totalDays} days
                            </p>
                          </div>
                        </div>

                        <div className='grid grid-cols-2 gap-4 mb-3'>
                          <div className='flex items-center gap-2'>
                            <Calendar className='h-4 w-4 text-gray-500' />
                            <span className='text-sm'>
                              {formatDate(reservation.startDate)} -{' '}
                              {formatDate(reservation.endDate)}
                            </span>
                          </div>
                          <div className='flex items-center gap-2'>
                            <User className='h-4 w-4 text-gray-500' />
                            <span className='text-sm'>
                              {reservation.renter?.name || 'Unknown Renter'}
                            </span>
                          </div>
                        </div>

                        <div className='flex items-center gap-2'>
                          <span className='text-lg font-bold text-green-600'>
                            Total: {formatCurrency(reservation.totalAmount)}
                          </span>
                          <Badge className='bg-green-100 text-green-700'>
                            {reservation.paymentStatus === 'paid'
                              ? 'Paid'
                              : 'Payment Pending'}
                          </Badge>
                        </div>

                        {reservation.ownerMessage && (
                          <div className='bg-green-50 rounded-lg p-3 mt-3'>
                            <div className='flex items-center gap-2 mb-1'>
                              <MessageSquare className='h-4 w-4 text-green-600' />
                              <span className='text-sm font-medium text-green-700'>
                                Your Message:
                              </span>
                            </div>
                            <p className='text-sm text-green-600'>
                              {reservation.ownerMessage}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className='flex flex-col gap-2 ml-4'>
                        <Button variant='outline' size='sm'>
                          <MessageSquare className='h-4 w-4 mr-2' />
                          Message Renter
                        </Button>
                        <Button variant='outline' size='sm'>
                          <Calendar className='h-4 w-4 mr-2' />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}



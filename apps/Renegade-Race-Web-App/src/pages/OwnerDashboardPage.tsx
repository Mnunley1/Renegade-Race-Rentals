import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToastContainer, useToast } from '@/components/ui/toast';
import { useReservations } from '@/hooks/useReservations';
import { useVehicles } from '@/hooks/useVehicles';
import { useUser } from '@clerk/clerk-react';
import { api } from '@/lib/convex';
import { useQuery } from 'convex/react';
import {
  Calendar,
  Car,
  Clock,
  DollarSign,
  MessageSquare,
  PlusCircle,
  Star,
  TrendingUp,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function OwnerDashboardPage() {
  const { user, isSignedIn } = useUser();
  const navigate = useNavigate();
  const { toasts, removeToast } = useToast();
  const [activeTab, setActiveTab] = useState('rentals');

  // Data hooks
  const { userVehicles } = useVehicles();
  const { upcomingOwnerReservations, pastOwnerReservations } =
    useReservations();

  // Get pending reservations (status === 'pending')
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

  if (!isSignedIn || !user) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <Card className='w-full max-w-md'>
          <CardContent className='p-8 text-center'>
            <Car className='h-16 w-16 text-gray-400 mx-auto mb-4' />
            <h2 className='text-2xl font-bold text-gray-900 mb-2'>
              Sign In Required
            </h2>
            <p className='text-gray-600 mb-6'>
              Please sign in to access your owner dashboard.
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

  // Calculate statistics
  const totalVehicles = userVehicles?.length || 0;
  const approvedVehicles = userVehicles?.filter(v => v.isApproved).length || 0;
  const pendingCount = pendingReservations?.length || 0;
  const activeRentals = confirmedReservations?.length || 0;
  const completedRentals = pastOwnerReservations?.length || 0;

  // Calculate total earnings (simplified - would need actual payment data)
  const totalEarnings = completedRentals * 200; // Example calculation

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container px-4 py-8 max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center justify-between mb-6'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>
                Owner Dashboard
              </h1>
              <p className='text-gray-600 mt-1'>
                Manage your vehicle rental business
              </p>
            </div>
            <Button asChild>
              <Link to='/list-vehicle'>
                <PlusCircle className='h-4 w-4 mr-2' />
                Add Vehicle
              </Link>
            </Button>
          </div>

          {/* Quick Stats */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>
                      Pending Requests
                    </p>
                    <p className='text-3xl font-bold text-gray-900 mt-2'>
                      {pendingCount}
                    </p>
                  </div>
                  <div className='h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center'>
                    <Clock className='h-6 w-6 text-yellow-600' />
                  </div>
                </div>
                {pendingCount > 0 && (
                  <Badge className='mt-3 bg-yellow-100 text-yellow-700 border-0'>
                    Action Required
                  </Badge>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>
                      Active Rentals
                    </p>
                    <p className='text-3xl font-bold text-gray-900 mt-2'>
                      {activeRentals}
                    </p>
                  </div>
                  <div className='h-12 w-12 rounded-full bg-green-100 flex items-center justify-center'>
                    <Car className='h-6 w-6 text-green-600' />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>
                      Total Vehicles
                    </p>
                    <p className='text-3xl font-bold text-gray-900 mt-2'>
                      {totalVehicles}
                    </p>
                  </div>
                  <div className='h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center'>
                    <Calendar className='h-6 w-6 text-blue-600' />
                  </div>
                </div>
                <p className='text-sm text-gray-600 mt-3'>
                  {approvedVehicles} approved
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>
                      Total Earnings
                    </p>
                    <p className='text-3xl font-bold text-gray-900 mt-2'>
                      ${totalEarnings.toLocaleString()}
                    </p>
                  </div>
                  <div className='h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center'>
                    <DollarSign className='h-6 w-6 text-purple-600' />
                  </div>
                </div>
                <div className='flex items-center mt-3'>
                  <TrendingUp className='h-4 w-4 text-green-600 mr-1' />
                  <span className='text-sm text-green-600'>
                    +12% this month
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className='space-y-6'
        >
          <TabsList className='grid w-full grid-cols-5'>
            <TabsTrigger value='rentals'>
              <Calendar className='h-4 w-4 mr-2' />
              Rentals
            </TabsTrigger>
            <TabsTrigger value='vehicles'>
              <Car className='h-4 w-4 mr-2' />
              Vehicles
            </TabsTrigger>
            <TabsTrigger value='reviews'>
              <Star className='h-4 w-4 mr-2' />
              Reviews
            </TabsTrigger>
            <TabsTrigger value='financial'>
              <DollarSign className='h-4 w-4 mr-2' />
              Financial
            </TabsTrigger>
            <TabsTrigger value='messages'>
              <MessageSquare className='h-4 w-4 mr-2' />
              Messages
            </TabsTrigger>
          </TabsList>

          {/* Active Rentals Tab */}
          <TabsContent value='rentals'>
            <Card>
              <CardHeader>
                <CardTitle>Active Rentals Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-gray-600'>
                  Rental management interface coming soon. This will include:
                </p>
                <ul className='list-disc list-inside mt-4 space-y-2 text-gray-600'>
                  <li>Approve/decline pending rental requests</li>
                  <li>View active rental details</li>
                  <li>Manage rental completions and returns</li>
                  <li>Message renters directly</li>
                </ul>
                <Button asChild className='mt-6'>
                  <Link to='/rental-history'>View All Rentals</Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vehicles Tab */}
          <TabsContent value='vehicles'>
            <Card>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <CardTitle>My Vehicles</CardTitle>
                  <Button asChild>
                    <Link to='/list-vehicle'>
                      <PlusCircle className='h-4 w-4 mr-2' />
                      Add Vehicle
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {userVehicles && userVehicles.length > 0 ? (
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {userVehicles.map((vehicle: any) => (
                      <Card key={vehicle._id} className='overflow-hidden'>
                        <CardContent className='p-0'>
                          <div className='aspect-video bg-gray-200 relative'>
                            {vehicle.images && vehicle.images[0] ? (
                              <img
                                src={vehicle.images[0]}
                                alt={`${vehicle.make} ${vehicle.model}`}
                                className='w-full h-full object-cover'
                              />
                            ) : (
                              <div className='w-full h-full flex items-center justify-center'>
                                <Car className='h-12 w-12 text-gray-400' />
                              </div>
                            )}
                            <Badge
                              className={`absolute top-2 right-2 ${
                                vehicle.isApproved
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              } border-0`}
                            >
                              {vehicle.isApproved ? 'Approved' : 'Pending'}
                            </Badge>
                          </div>
                          <div className='p-4'>
                            <h3 className='font-semibold text-lg'>
                              {vehicle.year} {vehicle.make} {vehicle.model}
                            </h3>
                            <p className='text-sm text-gray-600 mt-1'>
                              ${vehicle.dailyRate}/day
                            </p>
                            <div className='flex gap-2 mt-4'>
                              <Button
                                variant='outline'
                                size='sm'
                                className='flex-1'
                              >
                                Edit
                              </Button>
                              <Button
                                variant='outline'
                                size='sm'
                                className='flex-1'
                              >
                                Availability
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className='text-center py-12'>
                    <Car className='h-16 w-16 text-gray-400 mx-auto mb-4' />
                    <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                      No vehicles yet
                    </h3>
                    <p className='text-gray-600 mb-6'>
                      Start earning by listing your first vehicle
                    </p>
                    <Button asChild>
                      <Link to='/list-vehicle'>
                        <PlusCircle className='h-4 w-4 mr-2' />
                        Add Your First Vehicle
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value='reviews'>
            <Card>
              <CardHeader>
                <CardTitle>Reviews & Disputes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-gray-600'>
                  Review management interface coming soon. This will include:
                </p>
                <ul className='list-disc list-inside mt-4 space-y-2 text-gray-600'>
                  <li>View and respond to renter reviews</li>
                  <li>Leave reviews for renters</li>
                  <li>File and manage disputes</li>
                  <li>View review analytics and trends</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value='financial'>
            <Card>
              <CardHeader>
                <CardTitle>Financial Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
                  <div>
                    <p className='text-sm text-gray-600'>This Month</p>
                    <p className='text-2xl font-bold text-gray-900 mt-1'>
                      ${totalEarnings.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-600'>Platform Fee (10%)</p>
                    <p className='text-2xl font-bold text-gray-900 mt-1'>
                      ${(totalEarnings * 0.1).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-600'>Net Income</p>
                    <p className='text-2xl font-bold text-green-600 mt-1'>
                      ${(totalEarnings * 0.9).toLocaleString()}
                    </p>
                  </div>
                </div>
                <Button asChild variant='outline'>
                  <Link to='/billing'>View Billing History</Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value='messages'>
            <Card>
              <CardHeader>
                <CardTitle>Messages & Communication</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-gray-600 mb-6'>
                  Manage all your conversations with renters in one place.
                </p>
                <Button asChild>
                  <Link to='/messages'>
                    <MessageSquare className='h-4 w-4 mr-2' />
                    Go to Messages
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

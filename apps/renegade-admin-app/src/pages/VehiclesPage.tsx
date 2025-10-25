import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { AdminVehicle } from '@/types';
import { api } from '@renegade/convex/_generated/api';
import { Id } from '@renegade/convex/_generated/dataModel';
import { ColumnDef } from '@tanstack/react-table';
import { useMutation, useQuery } from 'convex/react';
import {
  Calendar,
  Car,
  CheckCircle,
  Clock,
  DollarSign,
  Eye,
  Fuel,
  Gauge,
  MapPin,
  Palette,
  Plus,
  Settings,
  User,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const getApprovalStatusColor = (isApproved: boolean | undefined) => {
  if (isApproved === true) {
    return 'bg-green-100 text-green-800 hover:bg-green-200';
  } else if (isApproved === false) {
    return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
  }
  return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
};

const getApprovalStatusText = (isApproved: boolean | undefined) => {
  if (isApproved === true) return 'Approved';
  if (isApproved === false) return 'Pending';
  return 'Unknown';
};

// Vehicle Detail Modal Component
function VehicleDetailModal({ vehicle }: { vehicle: AdminVehicle }) {
  const [isOpen, setIsOpen] = useState(false);
  const primaryImage =
    vehicle.images.find(img => img.isPrimary) || vehicle.images[0];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' size='sm'>
          <Eye className='h-4 w-4 mr-2' />
          View Details
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-2xl font-bold'>
            {vehicle.make} {vehicle.model} ({vehicle.year})
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Vehicle Image */}
          {primaryImage && (
            <div className='aspect-video w-full overflow-hidden rounded-lg'>
              <img
                src={primaryImage.imageUrl}
                alt={`${vehicle.make} ${vehicle.model}`}
                className='w-full h-full object-cover'
              />
            </div>
          )}

          {/* Vehicle Information Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className='text-lg flex items-center gap-2'>
                  <Car className='h-5 w-5' />
                  Vehicle Information
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='flex items-center gap-2'>
                  <Calendar className='h-4 w-4 text-gray-500' />
                  <span className='font-medium'>Year:</span>
                  <span>{vehicle.year}</span>
                </div>
                <div className='flex items-center gap-2'>
                  <DollarSign className='h-4 w-4 text-gray-500' />
                  <span className='font-medium'>Daily Rate:</span>
                  <span className='text-green-600 font-semibold'>
                    {formatCurrency(vehicle.dailyRate)}
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <MapPin className='h-4 w-4 text-gray-500' />
                  <span className='font-medium'>Track:</span>
                  <span>{vehicle.track?.name || 'Unknown'}</span>
                </div>
                <div className='flex items-center gap-2'>
                  <User className='h-4 w-4 text-gray-500' />
                  <span className='font-medium'>Owner:</span>
                  <span>{vehicle.owner?.name || 'Unknown'}</span>
                </div>
              </CardContent>
            </Card>

            {/* Technical Specs */}
            <Card>
              <CardHeader>
                <CardTitle className='text-lg flex items-center gap-2'>
                  <Settings className='h-5 w-5' />
                  Technical Specifications
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                {vehicle.horsepower && (
                  <div className='flex items-center gap-2'>
                    <Gauge className='h-4 w-4 text-gray-500' />
                    <span className='font-medium'>Horsepower:</span>
                    <span>{vehicle.horsepower} HP</span>
                  </div>
                )}
                {vehicle.transmission && (
                  <div className='flex items-center gap-2'>
                    <Settings className='h-4 w-4 text-gray-500' />
                    <span className='font-medium'>Transmission:</span>
                    <span>{vehicle.transmission}</span>
                  </div>
                )}
                {vehicle.drivetrain && (
                  <div className='flex items-center gap-2'>
                    <Car className='h-4 w-4 text-gray-500' />
                    <span className='font-medium'>Drivetrain:</span>
                    <span>{vehicle.drivetrain}</span>
                  </div>
                )}
                {vehicle.mileage && (
                  <div className='flex items-center gap-2'>
                    <Gauge className='h-4 w-4 text-gray-500' />
                    <span className='font-medium'>Mileage:</span>
                    <span>{vehicle.mileage.toLocaleString()} miles</span>
                  </div>
                )}
                {vehicle.fuelType && (
                  <div className='flex items-center gap-2'>
                    <Fuel className='h-4 w-4 text-gray-500' />
                    <span className='font-medium'>Fuel Type:</span>
                    <span>{vehicle.fuelType}</span>
                  </div>
                )}
                {vehicle.color && (
                  <div className='flex items-center gap-2'>
                    <Palette className='h-4 w-4 text-gray-500' />
                    <span className='font-medium'>Color:</span>
                    <span>{vehicle.color}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-gray-700 leading-relaxed'>
                {vehicle.description}
              </p>
            </CardContent>
          </Card>

          {/* Amenities */}
          {vehicle.amenities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='flex flex-wrap gap-2'>
                  {vehicle.amenities.map((amenity, index) => (
                    <Badge key={index} variant='outline'>
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Approval Status */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Approval Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex items-center gap-2'>
                <Badge
                  className={getApprovalStatusColor(vehicle.isApproved)}
                  variant='secondary'
                >
                  {getApprovalStatusText(vehicle.isApproved)}
                </Badge>
                <span className='text-sm text-gray-500'>
                  Created: {new Date(vehicle.createdAt).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function VehiclesPage() {
  const [activeTab, setActiveTab] = useState('all');

  // Fetch vehicles data
  const allVehicles = useQuery(api.vehicles.getAllVehiclesForAdmin, {
    showOnlyPending: false,
  });
  const pendingVehicles = useQuery(api.vehicles.getAllVehiclesForAdmin, {
    showOnlyPending: true,
  });

  // Mutations for approval actions
  const approveVehicle = useMutation(api.vehicles.approveVehicle);
  const rejectVehicle = useMutation(api.vehicles.rejectVehicle);

  const handleApprove = async (vehicleId: Id<'vehicles'>) => {
    try {
      await approveVehicle({ vehicleId });
      toast({
        title: 'Vehicle Approved',
        description: 'The vehicle has been approved successfully.',
      });
    } catch (_error) {
      toast({
        title: 'Error',
        description: 'Failed to approve vehicle. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (vehicleId: Id<'vehicles'>) => {
    try {
      await rejectVehicle({ vehicleId });
      toast({
        title: 'Vehicle Rejected',
        description: 'The vehicle has been rejected.',
      });
    } catch (_error) {
      toast({
        title: 'Error',
        description: 'Failed to reject vehicle. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const columns: ColumnDef<AdminVehicle>[] = [
    {
      accessorKey: '_id',
      header: 'Vehicle ID',
      cell: ({ row }) => (
        <div className='font-medium text-sm'>
          {row.getValue('_id').slice(-8)}
        </div>
      ),
    },
    {
      accessorKey: 'make',
      header: 'Vehicle',
      cell: ({ row }) => (
        <div className='font-medium'>
          {row.getValue('make')} {row.original.model} ({row.original.year})
        </div>
      ),
    },
    {
      accessorKey: 'dailyRate',
      header: 'Daily Rate',
      cell: ({ row }) => (
        <div className='flex items-center gap-2 font-medium text-green-600'>
          <DollarSign className='h-4 w-4' />
          {formatCurrency(row.getValue('dailyRate'))}
        </div>
      ),
    },
    {
      accessorKey: 'track',
      header: 'Track',
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <MapPin className='h-4 w-4 text-gray-500' />
          <span>{row.original.track?.name || 'Unknown'}</span>
        </div>
      ),
    },
    {
      accessorKey: 'owner',
      header: 'Owner',
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <User className='h-4 w-4 text-gray-500' />
          <span>{row.original.owner?.name || 'Unknown'}</span>
        </div>
      ),
    },
    {
      accessorKey: 'isApproved',
      header: 'Status',
      cell: ({ row }) => {
        const isApproved = row.getValue('isApproved') as boolean | undefined;
        return (
          <Badge
            className={getApprovalStatusColor(isApproved)}
            variant='secondary'
          >
            {getApprovalStatusText(isApproved)}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const vehicle = row.original;
        const isApproved = vehicle.isApproved;

        return (
          <div className='flex items-center gap-2'>
            <VehicleDetailModal vehicle={vehicle} />
            {isApproved === false && (
              <>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handleApprove(vehicle._id)}
                  className='text-green-600 hover:text-green-700 hover:bg-green-50'
                >
                  <CheckCircle className='h-4 w-4 mr-1' />
                  Approve
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handleReject(vehicle._id)}
                  className='text-red-600 hover:text-red-700 hover:bg-red-50'
                >
                  <XCircle className='h-4 w-4 mr-1' />
                  Reject
                </Button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  const stats = {
    total: allVehicles?.length || 0,
    approved: allVehicles?.filter(v => v.isApproved === true).length || 0,
    pending: allVehicles?.filter(v => v.isApproved === false).length || 0,
    active: allVehicles?.filter(v => v.isActive).length || 0,
  };

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-3xl font-bold text-gray-900'>
            Vehicle Management
          </h2>
          <p className='text-gray-600 mt-1'>
            Review and manage all vehicles in the system
          </p>
        </div>
        <Button className='bg-red-600 hover:bg-red-700'>
          <Plus className='h-4 w-4 mr-2' />
          Add Vehicle
        </Button>
      </div>

      {/* Stats Cards */}
      <div className='grid gap-6 md:grid-cols-4'>
        <Card className='bg-white shadow-sm'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600'>
              Total Vehicles
            </CardTitle>
            <Car className='h-5 w-5 text-blue-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-gray-900'>
              {stats.total}
            </div>
            <p className='text-xs text-gray-500'>All vehicles</p>
          </CardContent>
        </Card>

        <Card className='bg-white shadow-sm'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600'>
              Approved
            </CardTitle>
            <CheckCircle className='h-5 w-5 text-green-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600'>
              {stats.approved}
            </div>
            <p className='text-xs text-gray-500'>Ready for rental</p>
          </CardContent>
        </Card>

        <Card className='bg-white shadow-sm'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600'>
              Pending Review
            </CardTitle>
            <Clock className='h-5 w-5 text-yellow-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-yellow-600'>
              {stats.pending}
            </div>
            <p className='text-xs text-gray-500'>Awaiting approval</p>
          </CardContent>
        </Card>

        <Card className='bg-white shadow-sm'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600'>
              Active
            </CardTitle>
            <div className='h-3 w-3 bg-blue-500 rounded-full' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-blue-600'>
              {stats.active}
            </div>
            <p className='text-xs text-gray-500'>In system</p>
          </CardContent>
        </Card>
      </div>

      {/* Vehicles Table with Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Car className='h-5 w-5' />
            Vehicle Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className='grid w-full grid-cols-3'>
              <TabsTrigger value='all'>
                All Vehicles ({stats.total})
              </TabsTrigger>
              <TabsTrigger value='pending'>
                Pending Review ({stats.pending})
              </TabsTrigger>
              <TabsTrigger value='approved'>
                Approved ({stats.approved})
              </TabsTrigger>
            </TabsList>

            <TabsContent value='all' className='mt-6'>
              <DataTable
                columns={columns}
                data={allVehicles || []}
                searchKey='make'
                searchPlaceholder='Search by make, model...'
              />
            </TabsContent>

            <TabsContent value='pending' className='mt-6'>
              <DataTable
                columns={columns}
                data={pendingVehicles || []}
                searchKey='make'
                searchPlaceholder='Search pending vehicles...'
              />
            </TabsContent>

            <TabsContent value='approved' className='mt-6'>
              <DataTable
                columns={columns}
                data={allVehicles?.filter(v => v.isApproved === true) || []}
                searchKey='make'
                searchPlaceholder='Search approved vehicles...'
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

import { useRentalCompletions } from '@/hooks/useRentalCompletions';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@renegade/ui';
import { AlertCircle, Car, CheckCircle, Upload } from 'lucide-react';
import { useState } from 'react';

interface RentalCompletionFormProps {
  completion: any;
  onSuccess?: () => void;
}

export function RentalCompletionForm({
  completion,
  onSuccess,
}: RentalCompletionFormProps) {
  const { submitRenterReturnForm, submitOwnerReturnReview, isSubmitting } =
    useRentalCompletions();

  // Renter form state
  const [returnDate, setReturnDate] = useState('');
  const [vehicleCondition, setVehicleCondition] = useState<
    'excellent' | 'good' | 'fair' | 'poor' | 'damaged'
  >('good');
  const [fuelLevel, setFuelLevel] = useState<
    'full' | '3/4' | '1/2' | '1/4' | 'empty'
  >('full');
  const [mileage, setMileage] = useState('');
  const [notes, setNotes] = useState('');
  const [photos, _setPhotos] = useState<string[]>([]);

  // Owner form state
  const [vehicleReceived, setVehicleReceived] = useState(false);
  const [conditionMatches, setConditionMatches] = useState(false);
  const [fuelLevelMatches, setFuelLevelMatches] = useState(false);
  const [mileageMatches, setMileageMatches] = useState(false);
  const [damageReported, setDamageReported] = useState('');
  const [ownerNotes, setOwnerNotes] = useState('');
  const [ownerPhotos, _setOwnerPhotos] = useState<string[]>([]);

  const handleRenterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!returnDate || !mileage) {
      return;
    }

    try {
      await submitRenterReturnForm({
        completionId: completion._id,
        returnDate,
        vehicleCondition,
        fuelLevel,
        mileage: parseInt(mileage),
        notes: notes.trim() || undefined,
        photos,
      });
      onSuccess?.();
    } catch (_error) {
      // Error handling is done in the hook
    }
  };

  const handleOwnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!vehicleReceived) {
      return;
    }

    try {
      await submitOwnerReturnReview({
        completionId: completion._id,
        vehicleReceived,
        conditionMatches,
        fuelLevelMatches,
        mileageMatches,
        damageReported: damageReported.trim() || undefined,
        photos: ownerPhotos,
        notes: ownerNotes.trim() || undefined,
      });
      onSuccess?.();
    } catch (_error) {
      // Error handling is done in the hook
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
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

  // Determine if current user is renter or owner
  const isRenter = completion.renterId === completion.currentUserId;
  const isOwner = completion.ownerId === completion.currentUserId;

  // Show renter return form
  if (isRenter && completion.status === 'pending_renter') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Car className='h-5 w-5' />
            Return Vehicle
          </CardTitle>
          <p className='text-sm text-gray-600'>
            Please complete the return form for your rental period ending{' '}
            {formatDate(completion.reservation?.endDate)}.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRenterSubmit} className='space-y-6'>
            {/* Rental Details */}
            <div className='bg-gray-50 rounded-lg p-4'>
              <h3 className='font-medium mb-2'>Rental Details</h3>
              <div className='grid grid-cols-2 gap-4 text-sm'>
                <div>
                  <span className='text-gray-600'>Vehicle:</span>
                  <p className='font-medium'>
                    {completion.vehicle?.year} {completion.vehicle?.make}{' '}
                    {completion.vehicle?.model}
                  </p>
                </div>
                <div>
                  <span className='text-gray-600'>Rental Period:</span>
                  <p className='font-medium'>
                    {formatDate(completion.reservation?.startDate)} -{' '}
                    {formatDate(completion.reservation?.endDate)}
                  </p>
                </div>
                <div>
                  <span className='text-gray-600'>Total Amount:</span>
                  <p className='font-medium'>
                    {formatCurrency(completion.reservation?.totalAmount || 0)}
                  </p>
                </div>
                <div>
                  <span className='text-gray-600'>Owner:</span>
                  <p className='font-medium'>
                    {completion.owner?.name || 'Unknown'}
                  </p>
                </div>
              </div>
            </div>

            {/* Return Date */}
            <div>
              <Label htmlFor='returnDate'>Return Date *</Label>
              <Input
                id='returnDate'
                type='date'
                value={returnDate}
                onChange={e => setReturnDate(e.target.value)}
                required
                min={completion.reservation?.startDate}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Vehicle Condition */}
            <div>
              <Label>Vehicle Condition *</Label>
              <Select
                value={vehicleCondition}
                onValueChange={(value: any) => setVehicleCondition(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select condition' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='excellent'>
                    Excellent - Like new, no issues
                  </SelectItem>
                  <SelectItem value='good'>
                    Good - Minor wear, fully functional
                  </SelectItem>
                  <SelectItem value='fair'>
                    Fair - Some wear, but acceptable
                  </SelectItem>
                  <SelectItem value='poor'>
                    Poor - Significant wear or issues
                  </SelectItem>
                  <SelectItem value='damaged'>
                    Damaged - Requires repair
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Fuel Level */}
            <div>
              <Label>Fuel Level *</Label>
              <Select
                value={fuelLevel}
                onValueChange={(value: any) => setFuelLevel(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select fuel level' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='full'>Full Tank</SelectItem>
                  <SelectItem value='3/4'>3/4 Tank</SelectItem>
                  <SelectItem value='1/2'>Half Tank</SelectItem>
                  <SelectItem value='1/4'>1/4 Tank</SelectItem>
                  <SelectItem value='empty'>Empty/Reserve</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Mileage */}
            <div>
              <Label htmlFor='mileage'>Current Mileage *</Label>
              <Input
                id='mileage'
                type='number'
                value={mileage}
                onChange={e => setMileage(e.target.value)}
                placeholder='Enter current odometer reading'
                required
                min='0'
              />
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor='notes'>Additional Notes</Label>
              <Textarea
                id='notes'
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder='Any additional information about the vehicle condition or return...'
                rows={3}
              />
            </div>

            {/* Photo Upload Placeholder */}
            <div>
              <Label>Return Photos (Optional)</Label>
              <div className='border-2 border-dashed border-gray-300 rounded-lg p-6 text-center'>
                <Upload className='h-8 w-8 text-gray-400 mx-auto mb-2' />
                <p className='text-sm text-gray-600'>
                  Photo upload functionality coming soon
                </p>
              </div>
            </div>

            <Button type='submit' disabled={isSubmitting} className='w-full'>
              {isSubmitting ? (
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
              ) : (
                <CheckCircle className='h-4 w-4 mr-2' />
              )}
              Submit Return Form
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  // Show owner review form
  if (isOwner && completion.status === 'pending_owner') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <CheckCircle className='h-5 w-5' />
            Review Vehicle Return
          </CardTitle>
          <p className='text-sm text-gray-600'>
            Please review the vehicle return submitted by{' '}
            {completion.renter?.name || 'the renter'}.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleOwnerSubmit} className='space-y-6'>
            {/* Renter's Return Form */}
            <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
              <h3 className='font-medium mb-3 text-blue-900'>
                Renter's Return Information
              </h3>
              <div className='grid grid-cols-2 gap-4 text-sm'>
                <div>
                  <span className='text-blue-700'>Return Date:</span>
                  <p className='font-medium text-blue-900'>
                    {formatDate(completion.renterReturnForm?.returnDate)}
                  </p>
                </div>
                <div>
                  <span className='text-blue-700'>Vehicle Condition:</span>
                  <p className='font-medium text-blue-900 capitalize'>
                    {completion.renterReturnForm?.vehicleCondition}
                  </p>
                </div>
                <div>
                  <span className='text-blue-700'>Fuel Level:</span>
                  <p className='font-medium text-blue-900'>
                    {completion.renterReturnForm?.fuelLevel}
                  </p>
                </div>
                <div>
                  <span className='text-blue-700'>Mileage:</span>
                  <p className='font-medium text-blue-900'>
                    {completion.renterReturnForm?.mileage?.toLocaleString()}{' '}
                    miles
                  </p>
                </div>
              </div>
              {completion.renterReturnForm?.notes && (
                <div className='mt-3'>
                  <span className='text-blue-700 text-sm'>Notes:</span>
                  <p className='text-blue-900 text-sm mt-1'>
                    {completion.renterReturnForm.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Owner Confirmation */}
            <div className='space-y-4'>
              <div className='flex items-center space-x-2'>
                <input
                  type='checkbox'
                  id='vehicleReceived'
                  checked={vehicleReceived}
                  onChange={e => setVehicleReceived(e.target.checked)}
                  className='rounded border-gray-300'
                />
                <Label
                  htmlFor='vehicleReceived'
                  className='text-sm font-medium'
                >
                  I have received the vehicle
                </Label>
              </div>

              {vehicleReceived && (
                <>
                  <div className='flex items-center space-x-2'>
                    <input
                      type='checkbox'
                      id='conditionMatches'
                      checked={conditionMatches}
                      onChange={e => setConditionMatches(e.target.checked)}
                      className='rounded border-gray-300'
                    />
                    <Label htmlFor='conditionMatches' className='text-sm'>
                      Vehicle condition matches renter's description
                    </Label>
                  </div>

                  <div className='flex items-center space-x-2'>
                    <input
                      type='checkbox'
                      id='fuelLevelMatches'
                      checked={fuelLevelMatches}
                      onChange={e => setFuelLevelMatches(e.target.checked)}
                      className='rounded border-gray-300'
                    />
                    <Label htmlFor='fuelLevelMatches' className='text-sm'>
                      Fuel level matches renter's report
                    </Label>
                  </div>

                  <div className='flex items-center space-x-2'>
                    <input
                      type='checkbox'
                      id='mileageMatches'
                      checked={mileageMatches}
                      onChange={e => setMileageMatches(e.target.checked)}
                      className='rounded border-gray-300'
                    />
                    <Label htmlFor='mileageMatches' className='text-sm'>
                      Mileage reading is accurate
                    </Label>
                  </div>
                </>
              )}
            </div>

            {/* Damage Report */}
            {(!conditionMatches || !fuelLevelMatches || !mileageMatches) && (
              <div>
                <Label htmlFor='damageReported'>
                  Damage or Discrepancy Report
                </Label>
                <Textarea
                  id='damageReported'
                  value={damageReported}
                  onChange={e => setDamageReported(e.target.value)}
                  placeholder='Describe any damage, discrepancies, or issues found...'
                  rows={3}
                />
              </div>
            )}

            {/* Owner Notes */}
            <div>
              <Label htmlFor='ownerNotes'>Additional Notes</Label>
              <Textarea
                id='ownerNotes'
                value={ownerNotes}
                onChange={e => setOwnerNotes(e.target.value)}
                placeholder='Any additional comments about the return...'
                rows={3}
              />
            </div>

            {/* Photo Upload Placeholder */}
            <div>
              <Label>Verification Photos (Optional)</Label>
              <div className='border-2 border-dashed border-gray-300 rounded-lg p-6 text-center'>
                <Upload className='h-8 w-8 text-gray-400 mx-auto mb-2' />
                <p className='text-sm text-gray-600'>
                  Photo upload functionality coming soon
                </p>
              </div>
            </div>

            <Button
              type='submit'
              disabled={isSubmitting || !vehicleReceived}
              className='w-full'
            >
              {isSubmitting ? (
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
              ) : (
                <CheckCircle className='h-4 w-4 mr-2' />
              )}
              Complete Rental Return
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  // Show completion status
  if (completion.status === 'completed') {
    return (
      <Card>
        <CardContent className='p-6 text-center'>
          <CheckCircle className='h-12 w-12 text-green-600 mx-auto mb-4' />
          <h3 className='text-lg font-semibold text-green-900 mb-2'>
            Rental Completed
          </h3>
          <p className='text-gray-600'>
            This rental has been successfully completed. You can now leave a
            review.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Show waiting state
  return (
    <Card>
      <CardContent className='p-6 text-center'>
        <AlertCircle className='h-12 w-12 text-yellow-600 mx-auto mb-4' />
        <h3 className='text-lg font-semibold text-yellow-900 mb-2'>
          Waiting for Action
        </h3>
        <p className='text-gray-600'>
          {isRenter
            ? 'Waiting for the owner to review your return.'
            : 'Waiting for the renter to submit their return form.'}
        </p>
      </CardContent>
    </Card>
  );
}

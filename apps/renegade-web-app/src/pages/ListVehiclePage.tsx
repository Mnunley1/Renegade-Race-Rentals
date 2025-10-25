import PhotoManager from '@/components/PhotoManager';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { PhotoItem, useVehicles } from '@/hooks/useVehicles';
import {
  VehicleAddOn,
  VehicleForm,
  availableAmenities,
  drivetrainTypes,
  transmissionTypes,
  validatePhotos,
  vehicleFormSchema,
} from '@/lib/vehicleValidation';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Textarea,
} from '@renegade/ui';
import {
  ArrowLeft,
  Calendar,
  Car,
  Cog,
  DollarSign,
  Gauge,
  MapPin,
  Plus,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';

export default function ListVehiclePage() {
  const navigate = useNavigate();
  const { requireAuth } = useAuthGuard();
  const { tracks, createVehicleWithImages, isCreating } = useVehicles();

  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [addOns, setAddOns] = useState<VehicleAddOn[]>([]);
  const [showReviewAlert, setShowReviewAlert] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<VehicleForm>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      make: '',
      model: '',
      year: '',
      dailyRate: '',
      horsepower: '',
      transmission: '',
      drivetrain: '',
      engineType: '',
      mileage: '',
      description: '',
      trackId: '',
    },
  });

  const toggleAmenity = (amenity: string) => {
    if (amenities.includes(amenity)) {
      setAmenities(amenities.filter(a => a !== amenity));
    } else {
      setAmenities([...amenities, amenity]);
    }
  };

  const addAddOn = () => {
    setAddOns([...addOns, { name: '', price: '', description: '' }]);
  };

  const removeAddOn = (index: number) => {
    setAddOns(addOns.filter((_, i) => i !== index));
  };

  const updateAddOn = (
    index: number,
    field: keyof VehicleAddOn,
    value: string
  ) => {
    const updatedAddOns = [...addOns];
    updatedAddOns[index][field] = value;
    setAddOns(updatedAddOns);
  };

  const handleSubmit = async () => {
    requireAuth(() => {
      // Validate photos
      const photoError = validatePhotos(photos);
      if (photoError) {
        alert(photoError);
        return;
      }

      setShowReviewAlert(true);
    });
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    setShowReviewAlert(false);

    try {
      const formData = form.getValues();

      // Find the selected track
      const selectedTrack = tracks?.find(
        track => track._id === formData.trackId
      );
      if (!selectedTrack) {
        throw new Error('Selected track not found');
      }

      // Prepare add-ons
      const processedAddOns = addOns
        .filter(addOn => addOn.name.trim() && addOn.price.trim())
        .map(addOn => ({
          name: addOn.name.trim(),
          price: parseFloat(addOn.price),
          description: addOn.description.trim() || undefined,
          isRequired: false,
        }));

      // Prepare vehicle data
      const vehicleData = {
        trackId: selectedTrack._id,
        make: formData.make,
        model: formData.model,
        year: parseInt(formData.year),
        dailyRate: parseFloat(formData.dailyRate),
        description: formData.description,
        horsepower: formData.horsepower
          ? parseInt(formData.horsepower)
          : undefined,
        transmission: formData.transmission || undefined,
        drivetrain: formData.drivetrain || undefined,
        engineType: formData.engineType || undefined,
        mileage: formData.mileage ? parseInt(formData.mileage) : undefined,
        amenities,
        addOns: processedAddOns,
      };

      // Get processed image data
      const processedImages = photos
        .filter(photo => photo.processedData)
        .map(photo => photo.processedData!);

      // Create vehicle
      await createVehicleWithImages(vehicleData, processedImages);

      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating vehicle:', error);
      alert(
        error instanceof Error ? error.message : 'Failed to create vehicle'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container mx-auto px-4 py-8'>
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
            <Car className='h-8 w-8 text-[#EF1C25]' />
            <h1 className='text-3xl font-bold text-gray-900'>
              List Your Vehicle
            </h1>
          </div>
          <p className='text-gray-600 mt-2'>
            Share your track car with the racing community and start earning.
          </p>
        </div>

        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
            {/* Main Form */}
            <div className='lg:col-span-2 space-y-8'>
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Vehicle Information</CardTitle>
                </CardHeader>
                <CardContent className='space-y-6'>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <div>
                      <Label htmlFor='make'>Make *</Label>
                      <Controller
                        name='make'
                        control={form.control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder='e.g., Porsche'
                            className='mt-1'
                          />
                        )}
                      />
                      {form.formState.errors.make && (
                        <p className='text-red-500 text-sm mt-1'>
                          {form.formState.errors.make.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor='model'>Model *</Label>
                      <Controller
                        name='model'
                        control={form.control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder='e.g., 911 GT3'
                            className='mt-1'
                          />
                        )}
                      />
                      {form.formState.errors.model && (
                        <p className='text-red-500 text-sm mt-1'>
                          {form.formState.errors.model.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor='year'>Year *</Label>
                      <Controller
                        name='year'
                        control={form.control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type='number'
                            min='1990'
                            max='2024'
                            placeholder='2023'
                            className='mt-1'
                          />
                        )}
                      />
                      {form.formState.errors.year && (
                        <p className='text-red-500 text-sm mt-1'>
                          {form.formState.errors.year.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor='description'>Description *</Label>
                    <Controller
                      name='description'
                      control={form.control}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          rows={4}
                          placeholder='Describe your vehicle, its condition, and what makes it special...'
                          className='mt-1'
                        />
                      )}
                    />
                    {form.formState.errors.description && (
                      <p className='text-red-500 text-sm mt-1'>
                        {form.formState.errors.description.message}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Pricing & Location */}
              <Card>
                <CardHeader>
                  <CardTitle>Pricing & Location</CardTitle>
                </CardHeader>
                <CardContent className='space-y-6'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <Label htmlFor='dailyRate'>Daily Rate *</Label>
                      <div className='relative mt-1'>
                        <DollarSign className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
                        <Controller
                          name='dailyRate'
                          control={form.control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              type='number'
                              min='1'
                              placeholder='899'
                              className='pl-10'
                            />
                          )}
                        />
                      </div>
                      {form.formState.errors.dailyRate && (
                        <p className='text-red-500 text-sm mt-1'>
                          {form.formState.errors.dailyRate.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor='trackId'>Track Location *</Label>
                      <div className='relative mt-1'>
                        <MapPin className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
                        <Controller
                          name='trackId'
                          control={form.control}
                          render={({ field }) => (
                            <select
                              {...field}
                              className='w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EF1C25] focus:border-transparent bg-white'
                            >
                              <option value=''>Select a track</option>
                              {tracks?.map(track => (
                                <option key={track._id} value={track._id}>
                                  {track.name} - {track.location}
                                </option>
                              ))}
                            </select>
                          )}
                        />
                      </div>
                      {form.formState.errors.trackId && (
                        <p className='text-red-500 text-sm mt-1'>
                          {form.formState.errors.trackId.message}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Specifications */}
              <Card>
                <CardHeader>
                  <CardTitle>Specifications</CardTitle>
                </CardHeader>
                <CardContent className='space-y-6'>
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                    <div>
                      <Label htmlFor='horsepower'>Horsepower</Label>
                      <div className='relative mt-1'>
                        <Gauge className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
                        <Controller
                          name='horsepower'
                          control={form.control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              type='number'
                              min='1'
                              placeholder='502'
                              className='pl-10'
                            />
                          )}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor='transmission'>Transmission</Label>
                      <div className='relative mt-1'>
                        <Cog className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
                        <Controller
                          name='transmission'
                          control={form.control}
                          render={({ field }) => (
                            <select
                              {...field}
                              className='w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EF1C25] focus:border-transparent bg-white'
                            >
                              <option value=''>Select transmission</option>
                              {transmissionTypes.map(type => (
                                <option key={type} value={type}>
                                  {type}
                                </option>
                              ))}
                            </select>
                          )}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor='drivetrain'>Drivetrain</Label>
                      <Controller
                        name='drivetrain'
                        control={form.control}
                        render={({ field }) => (
                          <select
                            {...field}
                            className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EF1C25] focus:border-transparent bg-white mt-1'
                          >
                            <option value=''>Select drivetrain</option>
                            {drivetrainTypes.map(type => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                        )}
                      />
                    </div>
                    <div>
                      <Label htmlFor='mileage'>Mileage</Label>
                      <div className='relative mt-1'>
                        <Calendar className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
                        <Controller
                          name='mileage'
                          control={form.control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              type='number'
                              min='1'
                              placeholder='15000'
                              className='pl-10'
                            />
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Amenities */}
              <Card>
                <CardHeader>
                  <CardTitle>Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3'>
                    {availableAmenities.map(amenity => (
                      <button
                        key={amenity}
                        type='button'
                        onClick={() => toggleAmenity(amenity)}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                          amenities.includes(amenity)
                            ? 'border-[#EF1C25] bg-[#EF1C25]/5 text-[#EF1C25]'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className='text-sm font-medium'>{amenity}</span>
                        {amenities.includes(amenity) && (
                          <div className='w-2 h-2 rounded-full bg-[#EF1C25]'></div>
                        )}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Add-ons */}
              <Card>
                <CardHeader>
                  <CardTitle>Add-ons (Optional)</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  {addOns.map((addOn, index) => (
                    <div
                      key={index}
                      className='grid grid-cols-1 md:grid-cols-4 gap-4 items-end'
                    >
                      <div>
                        <Label>Name</Label>
                        <Input
                          value={addOn.name}
                          onChange={e =>
                            updateAddOn(index, 'name', e.target.value)
                          }
                          placeholder='e.g., Track Insurance'
                          className='mt-1'
                        />
                      </div>
                      <div>
                        <Label>Price</Label>
                        <Input
                          value={addOn.price}
                          onChange={e =>
                            updateAddOn(index, 'price', e.target.value)
                          }
                          placeholder='50'
                          type='number'
                          className='mt-1'
                        />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Input
                          value={addOn.description}
                          onChange={e =>
                            updateAddOn(index, 'description', e.target.value)
                          }
                          placeholder='Optional description'
                          className='mt-1'
                        />
                      </div>
                      <div>
                        <Button
                          type='button'
                          variant='outline'
                          size='sm'
                          onClick={() => removeAddOn(index)}
                          className='w-full'
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button
                    type='button'
                    variant='outline'
                    onClick={addAddOn}
                    className='w-full'
                  >
                    <Plus className='h-4 w-4 mr-2' />
                    Add Add-on
                  </Button>
                </CardContent>
              </Card>

              {/* Photos */}
              <PhotoManager
                photos={photos}
                onPhotosChange={setPhotos}
                maxPhotos={10}
              />
            </div>

            {/* Sidebar */}
            <div className='lg:col-span-1'>
              <Card>
                <CardHeader>
                  <CardTitle>Listing Summary</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-gray-600'>Vehicle</span>
                    <span className='font-semibold'>
                      {form.watch('year') &&
                      form.watch('make') &&
                      form.watch('model')
                        ? `${form.watch('year')} ${form.watch('make')} ${form.watch('model')}`
                        : 'Not specified'}
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-gray-600'>Daily Rate</span>
                    <span className='font-semibold text-[#EF1C25]'>
                      ${form.watch('dailyRate') || '0'}
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-gray-600'>Horsepower</span>
                    <span className='font-semibold'>
                      {form.watch('horsepower')
                        ? `${form.watch('horsepower')} HP`
                        : 'Not specified'}
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-gray-600'>Amenities</span>
                    <span className='font-semibold'>{amenities.length}</span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-gray-600'>Photos</span>
                    <span className='font-semibold'>{photos.length}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className='mt-6'>
                <CardHeader>
                  <CardTitle>Tips for Success</CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <div className='flex items-start space-x-3'>
                    <div className='w-2 h-2 rounded-full bg-[#EF1C25] mt-2'></div>
                    <p className='text-sm text-gray-600'>
                      Include high-quality photos showing different angles
                    </p>
                  </div>
                  <div className='flex items-start space-x-3'>
                    <div className='w-2 h-2 rounded-full bg-[#EF1C25] mt-2'></div>
                    <p className='text-sm text-gray-600'>
                      Write a detailed description of your vehicle's condition
                    </p>
                  </div>
                  <div className='flex items-start space-x-3'>
                    <div className='w-2 h-2 rounded-full bg-[#EF1C25] mt-2'></div>
                    <p className='text-sm text-gray-600'>
                      Set competitive pricing based on similar vehicles
                    </p>
                  </div>
                  <div className='flex items-start space-x-3'>
                    <div className='w-2 h-2 rounded-full bg-[#EF1C25] mt-2'></div>
                    <p className='text-sm text-gray-600'>
                      Be responsive to booking requests and messages
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Submit Button */}
          <div className='mt-8 flex justify-end space-x-4'>
            <Button
              type='button'
              variant='outline'
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={isSubmitting || isCreating}>
              {isSubmitting || isCreating
                ? 'Creating Listing...'
                : 'Create Listing'}
            </Button>
          </div>
        </form>

        {/* Review Alert Modal */}
        {showReviewAlert && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
            <div className='bg-white rounded-lg p-6 w-full max-w-md'>
              <h3 className='text-lg font-semibold mb-4'>
                Review Your Listing
              </h3>
              <div className='space-y-4'>
                <p className='text-gray-600'>
                  Please review your vehicle information before submitting. Once
                  submitted, your listing will be reviewed for approval.
                </p>
                <div className='flex gap-3'>
                  <Button
                    onClick={handleConfirmSubmit}
                    disabled={isSubmitting}
                    className='flex-1'
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Listing'}
                  </Button>
                  <Button
                    variant='outline'
                    onClick={() => setShowReviewAlert(false)}
                    className='flex-1'
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

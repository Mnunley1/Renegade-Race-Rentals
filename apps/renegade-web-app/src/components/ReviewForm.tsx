import { useRentalCompletions } from '@/hooks/useRentalCompletions';
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
import { CheckCircle, Star, Upload } from 'lucide-react';
import { useState } from 'react';

interface ReviewFormProps {
  completion: any;
  reviewType: 'renter_to_owner' | 'owner_to_renter';
  onSuccess?: () => void;
}

export function ReviewForm({
  completion,
  reviewType,
  onSuccess,
}: ReviewFormProps) {
  const { submitReview, isSubmitting } = useRentalCompletions();

  const [rating, setRating] = useState(5);
  const [communication, setCommunication] = useState(5);
  const [vehicleCondition, setVehicleCondition] = useState(5);
  const [professionalism, setProfessionalism] = useState(5);
  const [overallExperience, setOverallExperience] = useState(5);
  const [title, setTitle] = useState('');
  const [review, setReview] = useState('');
  const [photos, _setPhotos] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !review.trim()) {
      return;
    }

    try {
      await submitReview({
        completionId: completion._id,
        rating,
        communication,
        vehicleCondition,
        professionalism,
        overallExperience,
        title: title.trim(),
        review: review.trim(),
        photos: photos.length > 0 ? photos : undefined,
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

  const StarRating = ({
    value,
    onChange,
    label,
  }: {
    value: number;
    onChange: (value: number) => void;
    label: string;
  }) => (
    <div className='space-y-2'>
      <Label className='text-sm font-medium'>{label}</Label>
      <div className='flex items-center gap-1'>
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type='button'
            onClick={() => onChange(star)}
            className={`p-1 rounded transition-colors ${
              star <= value
                ? 'text-yellow-400 hover:text-yellow-500'
                : 'text-gray-300 hover:text-gray-400'
            }`}
          >
            <Star className='h-6 w-6 fill-current' />
          </button>
        ))}
        <span className='ml-2 text-sm text-gray-600'>({value}/5)</span>
      </div>
    </div>
  );

  const isRenterReview = reviewType === 'renter_to_owner';
  const reviewedUser = isRenterReview ? completion.owner : completion.renter;
  const reviewedUserName = reviewedUser?.name || 'Unknown User';

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Star className='h-5 w-5' />
          Leave a Review
        </CardTitle>
        <p className='text-sm text-gray-600'>
          Share your experience with {reviewedUserName} for this rental.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-6'>
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
                <span className='text-gray-600'>
                  {isRenterReview ? 'Vehicle Owner:' : 'Renter:'}
                </span>
                <p className='font-medium'>{reviewedUserName}</p>
              </div>
            </div>
          </div>

          {/* Overall Rating */}
          <StarRating
            value={rating}
            onChange={setRating}
            label='Overall Rating *'
          />

          {/* Category Ratings */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <StarRating
              value={communication}
              onChange={setCommunication}
              label='Communication'
            />
            <StarRating
              value={vehicleCondition}
              onChange={setVehicleCondition}
              label={isRenterReview ? 'Vehicle Condition' : 'Renter Care'}
            />
            <StarRating
              value={professionalism}
              onChange={setProfessionalism}
              label='Professionalism'
            />
            <StarRating
              value={overallExperience}
              onChange={setOverallExperience}
              label='Overall Experience'
            />
          </div>

          {/* Review Title */}
          <div>
            <Label htmlFor='title'>Review Title *</Label>
            <Input
              id='title'
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder='Give your review a title...'
              required
              maxLength={100}
            />
            <p className='text-xs text-gray-500 mt-1'>
              {title.length}/100 characters
            </p>
          </div>

          {/* Review Text */}
          <div>
            <Label htmlFor='review'>Your Review *</Label>
            <Textarea
              id='review'
              value={review}
              onChange={e => setReview(e.target.value)}
              placeholder={`Share your experience with ${reviewedUserName}. What went well? What could be improved?`}
              rows={6}
              required
              maxLength={1000}
            />
            <p className='text-xs text-gray-500 mt-1'>
              {review.length}/1000 characters
            </p>
          </div>

          {/* Photo Upload Placeholder */}
          <div>
            <Label>Photos (Optional)</Label>
            <div className='border-2 border-dashed border-gray-300 rounded-lg p-6 text-center'>
              <Upload className='h-8 w-8 text-gray-400 mx-auto mb-2' />
              <p className='text-sm text-gray-600'>
                Photo upload functionality coming soon
              </p>
              <p className='text-xs text-gray-500 mt-1'>
                Add photos to support your review (vehicle condition,
                experience, etc.)
              </p>
            </div>
          </div>

          {/* Review Guidelines */}
          <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
            <h4 className='font-medium text-blue-900 mb-2'>
              Review Guidelines
            </h4>
            <ul className='text-sm text-blue-800 space-y-1'>
              <li>• Be honest and constructive in your feedback</li>
              <li>• Focus on the rental experience and communication</li>
              <li>• Avoid personal attacks or inappropriate content</li>
              <li>• Your review will be visible to other users</li>
            </ul>
          </div>

          <Button type='submit' disabled={isSubmitting} className='w-full'>
            {isSubmitting ? (
              <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
            ) : (
              <CheckCircle className='h-4 w-4 mr-2' />
            )}
            Submit Review
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

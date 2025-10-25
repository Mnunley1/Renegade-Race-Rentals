import { ReviewForm } from '@/components/ReviewForm';
import { useRentalCompletions } from '@/hooks/useRentalCompletions';
import { api } from '@/lib/convex';
import { useUser } from '@clerk/clerk-react';
import { Button, Card, CardContent } from '@renegade/ui';
import { useQuery } from 'convex/react';
import { ArrowLeft, CheckCircle, Star } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

export default function ReviewPage() {
  const { user, isSignedIn } = useUser();
  const navigate = useNavigate();
  const { completionId } = useParams<{ completionId: string }>();

  const { _userCompletions, _ownerCompletions } = useRentalCompletions();

  // Get the specific completion
  const completion = useQuery(
    api.rentalCompletions.getById,
    completionId ? { id: completionId as any } : 'skip'
  );

  // Check if user has already submitted a review for this completion
  const existingReview = useQuery(
    api.reviews.getByUser,
    user?.id && completion
      ? {
          userId: user.id,
          role: 'reviewer' as const,
        }
      : 'skip'
  );

  if (!isSignedIn || !user) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <Card className='w-full max-w-md'>
          <CardContent className='p-8 text-center'>
            <Star className='h-16 w-16 text-gray-400 mx-auto mb-4' />
            <h2 className='text-2xl font-bold text-gray-900 mb-2'>
              Sign In Required
            </h2>
            <p className='text-gray-600 mb-6'>
              Please sign in to leave a review.
            </p>
            <Button onClick={() => navigate('/sign-in')}>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!completionId) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <Card className='w-full max-w-md'>
          <CardContent className='p-8 text-center'>
            <Star className='h-16 w-16 text-gray-400 mx-auto mb-4' />
            <h2 className='text-2xl font-bold text-gray-900 mb-2'>
              Invalid Review Link
            </h2>
            <p className='text-gray-600 mb-6'>
              The review link is invalid or expired.
            </p>
            <Button onClick={() => navigate('/rental-history')}>
              View Rental History
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (completion === undefined) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>Loading rental details...</p>
        </div>
      </div>
    );
  }

  if (!completion) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <Card className='w-full max-w-md'>
          <CardContent className='p-8 text-center'>
            <Star className='h-16 w-16 text-gray-400 mx-auto mb-4' />
            <h2 className='text-2xl font-bold text-gray-900 mb-2'>
              Rental Not Found
            </h2>
            <p className='text-gray-600 mb-6'>
              The rental completion could not be found.
            </p>
            <Button onClick={() => navigate('/rental-history')}>
              View Rental History
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if rental is completed
  if (completion.status !== 'completed') {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <Card className='w-full max-w-md'>
          <CardContent className='p-8 text-center'>
            <Star className='h-16 w-16 text-gray-400 mx-auto mb-4' />
            <h2 className='text-2xl font-bold text-gray-900 mb-2'>
              Rental Not Completed
            </h2>
            <p className='text-gray-600 mb-6'>
              You can only leave a review after the rental has been completed.
            </p>
            <Button onClick={() => navigate('/rental-history')}>
              View Rental History
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if user is part of this rental
  const isRenter = completion.renterId === user.id;
  const isOwner = completion.ownerId === user.id;

  if (!isRenter && !isOwner) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <Card className='w-full max-w-md'>
          <CardContent className='p-8 text-center'>
            <Star className='h-16 w-16 text-gray-400 mx-auto mb-4' />
            <h2 className='text-2xl font-bold text-gray-900 mb-2'>
              Access Denied
            </h2>
            <p className='text-gray-600 mb-6'>
              You can only leave reviews for rentals you participated in.
            </p>
            <Button onClick={() => navigate('/rental-history')}>
              View Rental History
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if user has already submitted a review
  const userHasReviewed = existingReview?.some(
    review => review.rentalCompletionId === completion._id
  );

  if (userHasReviewed) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <Card className='w-full max-w-md'>
          <CardContent className='p-8 text-center'>
            <CheckCircle className='h-16 w-16 text-green-600 mx-auto mb-4' />
            <h2 className='text-2xl font-bold text-gray-900 mb-2'>
              Review Already Submitted
            </h2>
            <p className='text-gray-600 mb-6'>
              You have already submitted a review for this rental.
            </p>
            <div className='space-y-3'>
              <Button
                onClick={() => navigate('/rental-history')}
                className='w-full'
              >
                View Rental History
              </Button>
              <Button
                variant='outline'
                onClick={() => navigate('/dashboard')}
                className='w-full'
              >
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const reviewType = isRenter ? 'renter_to_owner' : 'owner_to_renter';
  const reviewedUser = isRenter ? completion.owner : completion.renter;
  const reviewedUserName = reviewedUser?.name || 'Unknown User';

  const handleReviewSuccess = () => {
    navigate('/rental-history', {
      state: {
        message: 'Review submitted successfully!',
        type: 'success',
      },
    });
  };

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-8'>
          <Button
            variant='ghost'
            onClick={() => navigate('/rental-history')}
            className='mb-4'
          >
            <ArrowLeft className='h-4 w-4 mr-2' />
            Back to Rental History
          </Button>

          <div className='text-center'>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>
              Leave a Review
            </h1>
            <p className='text-lg text-gray-600'>
              Share your experience with {reviewedUserName}
            </p>
          </div>
        </div>

        {/* Review Form */}
        <div className='max-w-2xl mx-auto'>
          <ReviewForm
            completion={completion}
            reviewType={reviewType}
            onSuccess={handleReviewSuccess}
          />
        </div>
      </div>
    </div>
  );
}

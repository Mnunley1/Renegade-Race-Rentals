import { Button } from '@renegade/ui';
import { Car, Home, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className='min-h-[60vh] flex items-center justify-center px-4'>
      <div className='text-center max-w-md mx-auto'>
        {/* 404 Icon */}
        <div className='mb-8'>
          <Car className='h-24 w-24 text-[#FF5A5F] mx-auto mb-4 opacity-60' />
          <h1 className='text-6xl font-bold text-gray-900 mb-2'>404</h1>
          <h2 className='text-2xl font-semibold text-gray-700 mb-4'>
            Page Not Found
          </h2>
          <p className='text-gray-600 mb-8'>
            Looks like you've taken a wrong turn. The page you're looking for
            doesn't exist or has been moved.
          </p>
        </div>

        {/* Action Buttons */}
        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
          <Button asChild size='lg'>
            <Link to='/' className='flex items-center gap-2'>
              <Home className='h-4 w-4' />
              Go Home
            </Link>
          </Button>
          <Button asChild variant='outline' size='lg'>
            <Link to='/search' className='flex items-center gap-2'>
              <Search className='h-4 w-4' />
              Browse Cars
            </Link>
          </Button>
        </div>

        {/* Additional Help */}
        <div className='mt-12 text-sm text-gray-500'>
          <p>
            Need help? Check out our{' '}
            <Link to='/help-center' className='text-[#FF5A5F] hover:underline'>
              Help Center
            </Link>{' '}
            or{' '}
            <Link to='/contact' className='text-[#FF5A5F] hover:underline'>
              contact support
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}



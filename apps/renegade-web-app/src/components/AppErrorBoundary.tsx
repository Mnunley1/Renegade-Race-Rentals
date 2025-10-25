import NotFoundPage from '@/pages/NotFoundPage';
import { Button } from '@renegade/ui';
import { AlertCircle, Home, RefreshCw } from 'lucide-react';
import { ErrorBoundary } from 'react-error-boundary';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  const handleGoHome = () => {
    window.location.href = '/';
  };
  console.log(error);

  if (error.message === 'NOT_FOUND') {
    return <NotFoundPage />;
  }

  return (
    <div className='min-h-[60vh] flex items-center justify-center px-4'>
      <div className='text-center max-w-md mx-auto'>
        {/* Error Icon */}
        <div className='mb-8'>
          <AlertCircle className='h-24 w-24 text-red-500 mx-auto mb-4' />
          <h1 className='text-6xl font-bold text-gray-900 mb-2'>Oops!</h1>
          <h2 className='text-2xl font-semibold text-gray-700 mb-4'>
            Something went wrong
          </h2>
          <p className='text-gray-600 mb-8'>
            We encountered an unexpected error. Please try again later.
          </p>
        </div>

        {/* Action Buttons */}
        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
          <Button
            onClick={resetErrorBoundary}
            size='lg'
            className='flex items-center gap-2'
          >
            <RefreshCw className='h-4 w-4' />
            Try Again
          </Button>
          <Button
            onClick={handleGoHome}
            variant='outline'
            size='lg'
            className='flex items-center gap-2'
          >
            <Home className='h-4 w-4' />
            Go Home
          </Button>
        </div>

        {/* Additional Help */}
        <div className='mt-12 text-sm text-gray-500'>
          <p>
            Need help? Check out our{' '}
            <button
              onClick={() => (window.location.href = '/help-center')}
              className='text-[#FF5A5F] hover:underline cursor-pointer'
            >
              Help Center
            </button>{' '}
            or{' '}
            <button
              onClick={() => (window.location.href = '/contact')}
              className='text-[#FF5A5F] hover:underline cursor-pointer'
            >
              contact support
            </button>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

interface AppErrorBoundaryProps {
  children: React.ReactNode;
}

export function AppErrorBoundary({ children }: AppErrorBoundaryProps) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        // Log error to console in development
        if (process.env.NODE_ENV === 'development') {
          console.error('Error caught by boundary:', error, errorInfo);
        }
        // In production, you might want to send this to an error reporting service
        // like Sentry, LogRocket, etc.
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useSignIn } from '@clerk/clerk-react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// Import the logo
import Logo from '@/assets/logos/logo.png';

export default function SignInPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setIsLoading(true);
    setError('');

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        navigate('/search');
      } else {
        console.log(result);
      }
    } catch (err: any) {
      console.error('Error:', err.errors[0].longMessage);
      setError(err.errors[0].longMessage || 'An error occurred during sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Background Pattern */}
      <div className='absolute inset-0 opacity-5'>
        <div className='absolute top-20 left-10 w-32 h-32 rounded-full bg-[#EF1C25] blur-3xl' />
        <div className='absolute bottom-20 right-10 w-48 h-48 rounded-full bg-[#EF1C25] blur-3xl' />
      </div>

      <div className='relative container px-4 py-24'>
        {/* Logo */}
        <div className='flex justify-center mb-8'>
          <Link
            to='/'
            className='flex items-center space-x-3 text-gray-900 hover:text-[#EF1C25] transition-colors'
          >
            <img
              src={Logo}
              alt='Renegade Race Logo'
              className='h-16 w-16 rounded-full object-cover'
            />
            <span className='text-2xl font-bold'>Renegade</span>
          </Link>
        </div>

        <div className='max-w-md mx-auto'>
          {/* Header */}
          <div className='text-center mb-8'>
            <Badge className='bg-[#EF1C25] text-white border-0 px-4 py-2 text-sm mb-4'>
              Welcome Back
            </Badge>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>
              Sign In to Your Account
            </h1>
            <p className='text-gray-600'>
              Access your track car rentals and racing community
            </p>
          </div>

          {/* Sign In Form */}
          <Card className='border-0 shadow-2xl bg-white/95 backdrop-blur'>
            <CardContent className='p-8'>
              <form onSubmit={handleSubmit} className='space-y-6'>
                {/* Email Field */}
                <div className='space-y-2'>
                  <label
                    htmlFor='email'
                    className='text-sm font-medium text-gray-700'
                  >
                    Email Address
                  </label>
                  <Input
                    id='email'
                    type='email'
                    placeholder='Enter your email'
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    disabled={isLoading || !isLoaded}
                    className='h-12'
                  />
                </div>

                {/* Password Field */}
                <div className='space-y-2'>
                  <label
                    htmlFor='password'
                    className='text-sm font-medium text-gray-700'
                  >
                    Password
                  </label>
                  <div className='relative'>
                    <Input
                      id='password'
                      type={showPassword ? 'text' : 'password'}
                      placeholder='Enter your password'
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      disabled={isLoading || !isLoaded}
                      className='h-12 pr-10'
                    />
                    <button
                      type='button'
                      onClick={() => setShowPassword(!showPassword)}
                      className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600'
                    >
                      {showPassword ? (
                        <EyeOff className='h-5 w-5' />
                      ) : (
                        <Eye className='h-5 w-5' />
                      )}
                    </button>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className='bg-red-50 border border-red-200 rounded-lg p-3'>
                    <p className='text-sm text-red-600'>{error}</p>
                  </div>
                )}

                {/* Sign In Button */}
                <Button
                  type='submit'
                  className='w-full h-12 text-lg'
                  disabled={isLoading || !isLoaded}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Signing In...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>

                {/* Forgot Password */}
                <div className='text-center'>
                  <Link
                    to='/forgot-password'
                    className='text-sm text-[#EF1C25] hover:underline'
                  >
                    Forgot your password?
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className='text-center mt-8'>
            <p className='text-gray-600'>
              Don't have an account?{' '}
              <Link
                to='/sign-up'
                className='text-[#EF1C25] font-medium hover:underline'
              >
                Join Renegade Race
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

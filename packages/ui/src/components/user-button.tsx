import { Button } from '@/components/button';
import { Card, CardContent } from '@/components/card';
import { useClerk, useUser } from '@clerk/clerk-react';
import {
  Calendar,
  ChevronDown,
  CreditCard,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings,
  Star,
  User,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface UserButtonProps {
  hasVehicles?: boolean;
}

export function UserButton({ hasVehicles = false }: UserButtonProps) {
  const { user, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
      setIsOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!isSignedIn || !user) {
    return null;
  }

  const userInitials =
    user.firstName && user.lastName
      ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
      : user.emailAddresses[0]?.emailAddress[0]?.toUpperCase() || 'U';

  const displayName =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.emailAddresses[0]?.emailAddress || 'User';

  return (
    <div className='relative' ref={dropdownRef}>
      {/* User Button */}
      <Button
        variant='ghost'
        size='sm'
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center space-x-2 h-10 px-3 hover:bg-gray-100 rounded-xl'
      >
        {/* Avatar */}
        <div className='w-8 h-8 rounded-full bg-[#EF1C25] flex items-center justify-center text-white text-sm font-medium'>
          {user.imageUrl ? (
            <img
              src={user.imageUrl}
              alt={displayName}
              className='w-8 h-8 rounded-full object-cover'
            />
          ) : (
            userInitials
          )}
        </div>

        {/* Name */}
        <span className='hidden md:block text-sm font-medium text-gray-700'>
          {displayName}
        </span>

        {/* Chevron */}
        <ChevronDown
          className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <Card className='absolute right-0 top-12 w-64 border-0 shadow-xl bg-white z-50'>
          <CardContent className='p-2'>
            {/* User Info Header */}
            <div className='px-3 py-3 border-b border-gray-100'>
              <div className='flex items-center space-x-3'>
                <div className='w-10 h-10 rounded-full bg-[#EF1C25] flex items-center justify-center text-white font-medium'>
                  {user.imageUrl ? (
                    <img
                      src={user.imageUrl}
                      alt={displayName}
                      className='w-10 h-10 rounded-full object-cover'
                    />
                  ) : (
                    userInitials
                  )}
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-semibold text-gray-900 truncate'>
                    {displayName}
                  </p>
                  <p className='text-xs text-gray-500 truncate'>
                    {user.emailAddresses[0]?.emailAddress}
                  </p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className='py-2'>
              {/* Main Navigation */}
              <div className='px-3 py-2'>
                <h4 className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2'>
                  Main
                </h4>
                <Link
                  to='/profile'
                  onClick={() => setIsOpen(false)}
                  className='flex items-center space-x-3 px-0 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors'
                >
                  <User className='h-4 w-4' />
                  <span>Profile</span>
                </Link>
              </div>

              {/* Owner Dashboard - Only show if user has vehicles */}
              {hasVehicles && (
                <div className='px-3 py-2'>
                  <h4 className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2'>
                    Owner Tools
                  </h4>
                  <Link
                    to='/dashboard'
                    onClick={() => setIsOpen(false)}
                    className='flex items-center space-x-3 px-0 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors'
                  >
                    <LayoutDashboard className='h-4 w-4' />
                    <span>Owner Dashboard</span>
                  </Link>
                </div>
              )}

              {/* Rental & Activity */}
              <div className='px-3 py-2'>
                <h4 className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2'>
                  Rental & Activity
                </h4>
                <Link
                  to='/rental-history'
                  onClick={() => setIsOpen(false)}
                  className='flex items-center space-x-3 px-0 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors'
                >
                  <Calendar className='h-4 w-4' />
                  <span>Rental History</span>
                </Link>

                <Link
                  to='/favorites'
                  onClick={() => setIsOpen(false)}
                  className='flex items-center space-x-3 px-0 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors'
                >
                  <Star className='h-4 w-4' />
                  <span>Favorites</span>
                </Link>

                <Link
                  to='/messages'
                  onClick={() => setIsOpen(false)}
                  className='flex items-center space-x-3 px-0 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors'
                >
                  <MessageSquare className='h-4 w-4' />
                  <span>Messages</span>
                </Link>
              </div>

              {/* Account & Support */}
              <div className='px-3 py-2 border-t border-gray-100'>
                <h4 className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 pt-2'>
                  Account & Support
                </h4>
                <Link
                  to='/billing'
                  onClick={() => setIsOpen(false)}
                  className='flex items-center space-x-3 px-0 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors'
                >
                  <CreditCard className='h-4 w-4' />
                  <span>Billing</span>
                </Link>

                <Link
                  to='/settings'
                  onClick={() => setIsOpen(false)}
                  className='flex items-center space-x-3 px-0 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors'
                >
                  <Settings className='h-4 w-4' />
                  <span>Settings</span>
                </Link>

                <Link
                  to='/help-center'
                  onClick={() => setIsOpen(false)}
                  className='flex items-center space-x-3 px-0 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors'
                >
                  <HelpCircle className='h-4 w-4' />
                  <span>Help Center</span>
                </Link>
              </div>
            </div>

            {/* Sign Out */}
            <div className='border-t border-gray-100 pt-2'>
              <button
                onClick={handleSignOut}
                className='flex items-center space-x-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full'
              >
                <LogOut className='h-4 w-4' />
                <span>Sign Out</span>
              </button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

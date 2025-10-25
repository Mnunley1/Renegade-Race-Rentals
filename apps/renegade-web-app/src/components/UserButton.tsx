import { useVehicles } from '@/hooks/useVehicles';
import { useClerk, useUser } from '@clerk/clerk-react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@renegade/ui';
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
import { Link, useNavigate } from 'react-router-dom';

export function UserButton() {
  const { user, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();

  // Check if user has vehicles
  const { userVehicles } = useVehicles();
  const hasVehicles = userVehicles && userVehicles.length > 0;

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!isSignedIn || !user) {
    return (
      <div className='flex items-center space-x-2'>
        <Link to='/sign-in'>
          <Button variant='ghost' size='sm'>
            Sign In
          </Button>
        </Link>
        <Link to='/sign-up'>
          <Button size='sm'>Sign Up</Button>
        </Link>
      </div>
    );
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='sm'
          className='flex items-center space-x-2 h-10 px-3 hover:bg-gray-100 rounded-xl'
        >
          {/* Avatar */}
          <Avatar className='w-8 h-8'>
            <AvatarImage src={user.imageUrl} alt={displayName} />
            <AvatarFallback className='bg-[#EF1C25] text-white text-sm font-medium'>
              {userInitials}
            </AvatarFallback>
          </Avatar>

          {/* Name */}
          <span className='hidden md:block text-sm font-medium text-gray-700'>
            {displayName}
          </span>

          {/* Chevron */}
          <ChevronDown className='h-4 w-4 text-gray-500' />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className='w-64 bg-white border shadow-lg'
        align='end'
      >
        {/* User Info Header */}
        <DropdownMenuLabel className='px-3 py-3'>
          <div className='flex items-center space-x-3'>
            <Avatar className='w-10 h-10'>
              <AvatarImage src={user.imageUrl} alt={displayName} />
              <AvatarFallback className='bg-[#EF1C25] text-white font-medium'>
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-semibold text-gray-900 truncate'>
                {displayName}
              </p>
              <p className='text-xs text-gray-500 truncate'>
                {user.emailAddresses[0]?.emailAddress}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Main Navigation */}
        <div className='px-3 py-2'>
          <p className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2'>
            Main
          </p>
          <DropdownMenuItem asChild>
            <Link
              to='/profile'
              className='flex items-center space-x-3 px-0 py-2'
            >
              <User className='h-4 w-4' />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
        </div>

        {/* Owner Dashboard - Only show if user has vehicles */}
        {hasVehicles && (
          <>
            <DropdownMenuSeparator />
            <div className='px-3 py-2'>
              <p className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2'>
                Owner Tools
              </p>
              <DropdownMenuItem asChild>
                <Link
                  to='/dashboard'
                  className='flex items-center space-x-3 px-0 py-2'
                >
                  <LayoutDashboard className='h-4 w-4' />
                  <span>Owner Dashboard</span>
                </Link>
              </DropdownMenuItem>
            </div>
          </>
        )}

        <DropdownMenuSeparator />

        {/* Rental & Activity */}
        <div className='px-3 py-2'>
          <p className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2'>
            Rental & Activity
          </p>
          <DropdownMenuItem asChild>
            <Link
              to='/rental-history'
              className='flex items-center space-x-3 px-0 py-2'
            >
              <Calendar className='h-4 w-4' />
              <span>Rental History</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              to='/favorites'
              className='flex items-center space-x-3 px-0 py-2'
            >
              <Star className='h-4 w-4' />
              <span>Favorites</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              to='/messages'
              className='flex items-center space-x-3 px-0 py-2'
            >
              <MessageSquare className='h-4 w-4' />
              <span>Messages</span>
            </Link>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator />

        {/* Account & Support */}
        <div className='px-3 py-2'>
          <p className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2'>
            Account & Support
          </p>
          <DropdownMenuItem asChild>
            <Link
              to='/billing'
              className='flex items-center space-x-3 px-0 py-2'
            >
              <CreditCard className='h-4 w-4' />
              <span>Billing</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              to='/settings'
              className='flex items-center space-x-3 px-0 py-2'
            >
              <Settings className='h-4 w-4' />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              to='/help-center'
              className='flex items-center space-x-3 px-0 py-2'
            >
              <HelpCircle className='h-4 w-4' />
              <span>Help Center</span>
            </Link>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator />

        {/* Sign Out */}
        <DropdownMenuItem
          onClick={handleSignOut}
          className='flex items-center space-x-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 focus:bg-red-50'
        >
          <LogOut className='h-4 w-4' />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

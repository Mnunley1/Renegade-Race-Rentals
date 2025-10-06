import { ImageUpload } from '@/components/ImageUpload';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ToastContainer, useToast } from '@/components/ui/toast';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useUser } from '@clerk/clerk-react';
import { Edit, Save, User, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function ProfilePage() {
  const { user, isSignedIn } = useUser();
  const { userProfile, isUpdating, updateProfile, updateProfileImage } =
    useUserProfile();
  const { toasts, removeToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
  });

  // Update form data when userProfile changes
  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        bio: '', // Bio is not in the current schema, but keeping for future
      });
    }
  }, [userProfile]);

  // Handle form input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle form submission
  const handleSaveProfile = async () => {
    try {
      await updateProfile({
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  // Handle cancel editing
  const handleCancelEdit = () => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        bio: '',
      });
    }
    setIsEditing(false);
  };

  // Handle profile image change
  const handleImageChange = async (url: string, storageId?: string) => {
    try {
      if (storageId) {
        await updateProfileImage(storageId);
      }
    } catch (error) {
      console.error('Failed to update profile image:', error);
    }
  };

  if (!isSignedIn || !user) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <Card className='w-full max-w-md'>
          <CardContent className='p-8 text-center'>
            <User className='h-16 w-16 text-gray-400 mx-auto mb-4' />
            <h2 className='text-2xl font-bold text-gray-900 mb-2'>
              Sign In Required
            </h2>
            <p className='text-gray-600 mb-6'>
              Please sign in to view your profile.
            </p>
            <div className='space-y-3'>
              <Button asChild className='w-full'>
                <Link to='/sign-in'>Sign In</Link>
              </Button>
              <Button asChild variant='outline' className='w-full'>
                <Link to='/sign-up'>Create Account</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Use Convex user data if available, fallback to Clerk data
  const displayName =
    userProfile?.name ||
    (user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.emailAddresses[0]?.emailAddress) ||
    'User';

  const userEmail =
    userProfile?.email || user.emailAddresses[0]?.emailAddress || '';

  const userInitials = userProfile?.name
    ? userProfile.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
    : user.firstName && user.lastName
      ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
      : userEmail[0]?.toUpperCase() || 'U';

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container px-4 py-8'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center space-x-4 mb-6'>
            <div className='w-20 h-20 rounded-full bg-[#EF1C25] flex items-center justify-center text-white text-2xl font-bold'>
              {userProfile?.profileImage || user.imageUrl ? (
                <img
                  src={userProfile?.profileImage || user.imageUrl}
                  alt={displayName}
                  className='w-20 h-20 rounded-full object-cover'
                />
              ) : (
                userInitials
              )}
            </div>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>
                {displayName}
              </h1>
              <p className='text-gray-600'>{userEmail}</p>
              <div className='flex items-center space-x-2 mt-2'>
                <Badge className='bg-[#EF1C25] text-white border-0'>
                  {userProfile?.memberSince || user.createdAt
                    ? `Member since ${userProfile?.memberSince || new Date(user.createdAt).getFullYear()}`
                    : 'Member'}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Profile Information */}
          <div className='lg:col-span-2'>
            <Card>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <CardTitle>Profile Information</CardTitle>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      isEditing ? handleCancelEdit() : setIsEditing(true)
                    }
                    disabled={isUpdating}
                  >
                    {isEditing ? (
                      <>
                        <X className='h-4 w-4 mr-2' />
                        Cancel
                      </>
                    ) : (
                      <>
                        <Edit className='h-4 w-4 mr-2' />
                        Edit
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className='space-y-6'>
                {/* Profile Photo */}
                <div className='flex items-center space-x-4'>
                  <ImageUpload
                    currentImage={userProfile?.profileImage || user.imageUrl}
                    onImageChange={handleImageChange}
                    size='md'
                    disabled={isUpdating}
                  />
                </div>

                {/* Personal Information */}
                <div>
                  <label className='text-sm font-medium text-gray-700 mb-2 block'>
                    Full Name
                  </label>
                  {isEditing ? (
                    <Input
                      value={formData.name}
                      onChange={e => handleInputChange('name', e.target.value)}
                      placeholder='Enter your full name'
                    />
                  ) : (
                    <p className='text-gray-900'>
                      {userProfile?.name || 'Not provided'}
                    </p>
                  )}
                </div>

                <div>
                  <label className='text-sm font-medium text-gray-700 mb-2 block'>
                    Email Address
                  </label>
                  {isEditing ? (
                    <Input
                      value={formData.email}
                      onChange={e => handleInputChange('email', e.target.value)}
                      placeholder='Enter email address'
                      type='email'
                    />
                  ) : (
                    <p className='text-gray-900'>
                      {userProfile?.email || userEmail}
                    </p>
                  )}
                </div>

                <div>
                  <label className='text-sm font-medium text-gray-700 mb-2 block'>
                    Phone Number
                  </label>
                  {isEditing ? (
                    <Input
                      value={formData.phone}
                      onChange={e => handleInputChange('phone', e.target.value)}
                      placeholder='Enter phone number'
                      type='tel'
                    />
                  ) : (
                    <p className='text-gray-900'>
                      {userProfile?.phone || 'Not provided'}
                    </p>
                  )}
                </div>

                <div>
                  <label className='text-sm font-medium text-gray-700 mb-2 block'>
                    Bio
                  </label>
                  {isEditing ? (
                    <textarea
                      value={formData.bio}
                      onChange={e => handleInputChange('bio', e.target.value)}
                      className='w-full p-3 border border-gray-200 rounded-xl resize-none'
                      rows={4}
                      placeholder='Tell us about yourself...'
                    />
                  ) : (
                    <p className='text-gray-900'>No bio provided</p>
                  )}
                </div>

                {isEditing && (
                  <div className='flex justify-end space-x-3'>
                    <Button
                      variant='outline'
                      onClick={handleCancelEdit}
                      disabled={isUpdating}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSaveProfile} disabled={isUpdating}>
                      <Save className='h-4 w-4 mr-2' />
                      {isUpdating ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Stats Sidebar */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-gray-600'>Member Since</span>
                  <span className='font-semibold'>
                    {userProfile?.memberSince ||
                      (user.createdAt
                        ? new Date(user.createdAt).getFullYear()
                        : 'N/A')}
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-gray-600'>Rating</span>
                  <div className='flex items-center space-x-1'>
                    <span className='font-semibold'>
                      {userProfile?.rating?.toFixed(1) || '4.9'}
                    </span>
                  </div>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-gray-600'>Total Rentals</span>
                  <span className='font-semibold'>
                    {userProfile?.totalRentals || 0}
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-gray-600'>User Type</span>
                  <span className='font-semibold'>
                    {userProfile?.userType || 'Driver'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className='mt-6'>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <Button asChild className='w-full'>
                  <Link to='/dashboard'>View Dashboard</Link>
                </Button>
                <Button asChild variant='outline' className='w-full'>
                  <Link to='/settings'>Account Settings</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

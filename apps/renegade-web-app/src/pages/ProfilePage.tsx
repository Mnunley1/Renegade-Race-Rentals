import { ImageUpload } from '@/components/ImageUpload';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useUser } from '@clerk/clerk-react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  ToastContainer,
  useToast,
} from '@renegade/ui';
import {
  Calendar,
  Car,
  Edit,
  FileText,
  Mail,
  Phone,
  Save,
  Star,
  User,
  UserCircle,
  X,
} from 'lucide-react';
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
              <h1 className='text-3xl font-bold text-gray-900 font-display'>
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
            <Card className='shadow-lg border-0 bg-gradient-to-br from-white to-gray-50'>
              <CardHeader className='pb-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-3'>
                    <div className='p-2 bg-[#EF1C25]/10 rounded-lg'>
                      <UserCircle className='h-5 w-5 text-[#EF1C25]' />
                    </div>
                    <CardTitle className='text-xl font-semibold text-gray-900'>
                      Profile Information
                    </CardTitle>
                  </div>
                  <Button
                    variant={isEditing ? 'destructive' : 'outline'}
                    size='sm'
                    onClick={() =>
                      isEditing ? handleCancelEdit() : setIsEditing(true)
                    }
                    disabled={isUpdating}
                    className='transition-all duration-200 hover:scale-105'
                  >
                    {isEditing ? (
                      <>
                        <X className='h-4 w-4 mr-2' />
                        Cancel
                      </>
                    ) : (
                      <>
                        <Edit className='h-4 w-4 mr-2' />
                        Edit Profile
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className='space-y-8'>
                {/* Profile Photo Section */}
                <div className='flex items-center space-x-6 p-4 bg-white rounded-xl border border-gray-100 shadow-sm'>
                  <div className='flex-shrink-0'>
                    <ImageUpload
                      currentImage={userProfile?.profileImage || user.imageUrl}
                      onImageChange={handleImageChange}
                      size='lg'
                      disabled={isUpdating}
                    />
                  </div>
                  <div className='flex-1'>
                    <h3 className='text-lg font-semibold text-gray-900 mb-1'>
                      Profile Photo
                    </h3>
                    <p className='text-sm text-gray-600'>
                      Click to upload a new profile picture
                    </p>
                  </div>
                </div>

                {/* Personal Information Grid */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  {/* Full Name */}
                  <div className='space-y-3'>
                    <label className='flex items-center space-x-2 text-sm font-semibold text-gray-700'>
                      <User className='h-4 w-4 text-[#EF1C25]' />
                      <span>Full Name</span>
                    </label>
                    {isEditing ? (
                      <Input
                        value={formData.name}
                        onChange={e =>
                          handleInputChange('name', e.target.value)
                        }
                        placeholder='Enter your full name'
                        className='border-gray-200 focus:border-[#EF1C25] focus:ring-[#EF1C25]/20'
                      />
                    ) : (
                      <div className='p-3 bg-gray-50 rounded-lg border border-gray-100'>
                        <p className='text-gray-900 font-medium'>
                          {userProfile?.name || 'Not provided'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Email Address */}
                  <div className='space-y-3'>
                    <label className='flex items-center space-x-2 text-sm font-semibold text-gray-700'>
                      <Mail className='h-4 w-4 text-[#EF1C25]' />
                      <span>Email Address</span>
                    </label>
                    {isEditing ? (
                      <Input
                        value={formData.email}
                        onChange={e =>
                          handleInputChange('email', e.target.value)
                        }
                        placeholder='Enter email address'
                        type='email'
                        className='border-gray-200 focus:border-[#EF1C25] focus:ring-[#EF1C25]/20'
                      />
                    ) : (
                      <div className='p-3 bg-gray-50 rounded-lg border border-gray-100'>
                        <p className='text-gray-900 font-medium'>
                          {userProfile?.email || userEmail}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div className='space-y-3'>
                    <label className='flex items-center space-x-2 text-sm font-semibold text-gray-700'>
                      <Phone className='h-4 w-4 text-[#EF1C25]' />
                      <span>Phone Number</span>
                    </label>
                    {isEditing ? (
                      <Input
                        value={formData.phone}
                        onChange={e =>
                          handleInputChange('phone', e.target.value)
                        }
                        placeholder='Enter phone number'
                        type='tel'
                        className='border-gray-200 focus:border-[#EF1C25] focus:ring-[#EF1C25]/20'
                      />
                    ) : (
                      <div className='p-3 bg-gray-50 rounded-lg border border-gray-100'>
                        <p className='text-gray-900 font-medium'>
                          {userProfile?.phone || 'Not provided'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* User Type */}
                  <div className='space-y-3'>
                    <label className='flex items-center space-x-2 text-sm font-semibold text-gray-700'>
                      <Car className='h-4 w-4 text-[#EF1C25]' />
                      <span>User Type</span>
                    </label>
                    <div className='p-3 bg-gray-50 rounded-lg border border-gray-100'>
                      <Badge
                        variant='secondary'
                        className='bg-[#EF1C25]/10 text-[#EF1C25] border-0 font-medium'
                      >
                        {userProfile?.userType || 'Driver'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Bio Section */}
                <div className='space-y-3'>
                  <label className='flex items-center space-x-2 text-sm font-semibold text-gray-700'>
                    <FileText className='h-4 w-4 text-[#EF1C25]' />
                    <span>Bio</span>
                  </label>
                  {isEditing ? (
                    <textarea
                      value={formData.bio}
                      onChange={e => handleInputChange('bio', e.target.value)}
                      className='w-full p-4 border border-gray-200 rounded-xl resize-none focus:border-[#EF1C25] focus:ring-[#EF1C25]/20 transition-colors'
                      rows={4}
                      placeholder='Tell us about yourself, your racing experience, or what you love about track days...'
                    />
                  ) : (
                    <div className='p-4 bg-gray-50 rounded-xl border border-gray-100 min-h-[100px]'>
                      <p className='text-gray-600 italic'>
                        {formData.bio ||
                          'No bio provided. Click edit to add a personal bio.'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className='flex justify-end space-x-3 pt-4 border-t border-gray-100'>
                    <Button
                      variant='outline'
                      onClick={handleCancelEdit}
                      disabled={isUpdating}
                      className='px-6'
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveProfile}
                      disabled={isUpdating}
                      className='px-6 bg-[#EF1C25] hover:bg-[#EF1C25]/90'
                    >
                      <Save className='h-4 w-4 mr-2' />
                      {isUpdating ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Stats Sidebar */}
          <div className='space-y-6'>
            {/* Statistics Card */}
            <Card className='shadow-lg border-0 bg-gradient-to-br from-white to-gray-50'>
              <CardHeader className='pb-4'>
                <div className='flex items-center space-x-3'>
                  <div className='p-2 bg-[#EF1C25]/10 rounded-lg'>
                    <Star className='h-5 w-5 text-[#EF1C25]' />
                  </div>
                  <CardTitle className='text-lg font-semibold text-gray-900'>
                    Statistics
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100'>
                    <div className='flex items-center space-x-3'>
                      <Calendar className='h-4 w-4 text-[#EF1C25]' />
                      <span className='text-sm font-medium text-gray-700'>
                        Member Since
                      </span>
                    </div>
                    <span className='font-semibold text-gray-900'>
                      {userProfile?.memberSince ||
                        (user.createdAt
                          ? new Date(user.createdAt).getFullYear()
                          : 'N/A')}
                    </span>
                  </div>

                  <div className='flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100'>
                    <div className='flex items-center space-x-3'>
                      <Star className='h-4 w-4 text-[#EF1C25]' />
                      <span className='text-sm font-medium text-gray-700'>
                        Rating
                      </span>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <span className='font-semibold text-gray-900'>
                        {userProfile?.rating?.toFixed(1) || '4.9'}
                      </span>
                      <div className='flex text-yellow-400'>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className='h-3 w-3 fill-current' />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className='flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100'>
                    <div className='flex items-center space-x-3'>
                      <Car className='h-4 w-4 text-[#EF1C25]' />
                      <span className='text-sm font-medium text-gray-700'>
                        Total Rentals
                      </span>
                    </div>
                    <span className='font-semibold text-gray-900'>
                      {userProfile?.totalRentals || 0}
                    </span>
                  </div>

                  <div className='flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100'>
                    <div className='flex items-center space-x-3'>
                      <User className='h-4 w-4 text-[#EF1C25]' />
                      <span className='text-sm font-medium text-gray-700'>
                        User Type
                      </span>
                    </div>
                    <Badge
                      variant='secondary'
                      className='bg-[#EF1C25]/10 text-[#EF1C25] border-0 font-medium'
                    >
                      {userProfile?.userType || 'Driver'}
                    </Badge>
                  </div>
                </div>
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

import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useDriverProfiles } from '@/hooks/useDriverProfiles';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  LoginPromptModal,
  Textarea,
} from '@renegade/ui';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function CreateDriverProfilePage() {
  const navigate = useNavigate();
  const { requireAuth, showLoginPrompt, closeLoginPrompt } = useAuthGuard();
  const { createDriverProfile, isCreating } = useDriverProfiles();

  const [formData, setFormData] = useState({
    bio: '',
    experience: 'beginner' as
      | 'beginner'
      | 'intermediate'
      | 'advanced'
      | 'professional',
    licenses: [] as string[],
    preferredCategories: [] as string[],
    availability: [] as string[],
    location: '',
    contactInfo: {
      phone: '',
      email: '',
    },
  });

  const [newLicense, setNewLicense] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newAvailability, setNewAvailability] = useState('');

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as { [key: string]: string }),
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const addLicense = () => {
    if (newLicense.trim() && !formData.licenses.includes(newLicense.trim())) {
      setFormData(prev => ({
        ...prev,
        licenses: [...prev.licenses, newLicense.trim()],
      }));
      setNewLicense('');
    }
  };

  const removeLicense = (license: string) => {
    setFormData(prev => ({
      ...prev,
      licenses: prev.licenses.filter(l => l !== license),
    }));
  };

  const addCategory = () => {
    if (
      newCategory.trim() &&
      !formData.preferredCategories.includes(newCategory.trim())
    ) {
      setFormData(prev => ({
        ...prev,
        preferredCategories: [...prev.preferredCategories, newCategory.trim()],
      }));
      setNewCategory('');
    }
  };

  const removeCategory = (category: string) => {
    setFormData(prev => ({
      ...prev,
      preferredCategories: prev.preferredCategories.filter(c => c !== category),
    }));
  };

  const addAvailability = () => {
    if (
      newAvailability.trim() &&
      !formData.availability.includes(newAvailability.trim())
    ) {
      setFormData(prev => ({
        ...prev,
        availability: [...prev.availability, newAvailability.trim()],
      }));
      setNewAvailability('');
    }
  };

  const removeAvailability = (availability: string) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.filter(a => a !== availability),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    requireAuth(async () => {
      try {
        await createDriverProfile({
          bio: formData.bio,
          experience: formData.experience,
          licenses: formData.licenses,
          preferredCategories: formData.preferredCategories,
          availability: formData.availability,
          location: formData.location,
          contactInfo: {
            phone: formData.contactInfo.phone || undefined,
            email: formData.contactInfo.email || undefined,
          },
        });

        navigate('/motorsports');
      } catch (error) {
        console.error('Error creating driver profile:', error);
      }
    });
  };

  return (
    <div className='container px-4 py-8 max-w-4xl'>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center space-x-4'>
          <Button variant='ghost' size='sm' asChild>
            <Link to='/motorsports'>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Back to Motorsports
            </Link>
          </Button>
        </div>

        <div className='text-center space-y-2'>
          <h1 className='text-3xl font-bold text-gray-900 font-display'>
            Create Driver Profile
          </h1>
          <p className='text-gray-600'>
            Showcase your racing experience and connect with teams
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Driver Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className='space-y-6'>
              {/* Basic Information */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='location'>Location *</Label>
                  <Input
                    id='location'
                    value={formData.location}
                    onChange={e =>
                      handleInputChange('location', e.target.value)
                    }
                    placeholder='City, State'
                    required
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='experience'>Experience Level *</Label>
                  <select
                    id='experience'
                    value={formData.experience}
                    onChange={e =>
                      handleInputChange('experience', e.target.value)
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-md'
                    required
                  >
                    <option value='beginner'>Beginner</option>
                    <option value='intermediate'>Intermediate</option>
                    <option value='advanced'>Advanced</option>
                    <option value='professional'>Professional</option>
                  </select>
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='bio'>Biography *</Label>
                <Textarea
                  id='bio'
                  value={formData.bio}
                  onChange={e => handleInputChange('bio', e.target.value)}
                  placeholder='Tell us about your racing background, achievements, and what you bring to a team'
                  rows={4}
                  required
                />
              </div>

              {/* Licenses */}
              <div className='space-y-2'>
                <Label>Racing Licenses & Certifications</Label>
                <div className='flex flex-wrap gap-2 mb-2'>
                  {formData.licenses.map((license, index) => (
                    <Badge
                      key={index}
                      variant='secondary'
                      className='flex items-center gap-1'
                    >
                      {license}
                      <X
                        className='h-3 w-3 cursor-pointer'
                        onClick={() => removeLicense(license)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className='flex gap-2'>
                  <Input
                    value={newLicense}
                    onChange={e => setNewLicense(e.target.value)}
                    placeholder='Add license (e.g., SCCA, NASA, FIA)'
                    onKeyPress={e =>
                      e.key === 'Enter' && (e.preventDefault(), addLicense())
                    }
                  />
                  <Button type='button' onClick={addLicense} size='sm'>
                    <Plus className='h-4 w-4' />
                  </Button>
                </div>
              </div>

              {/* Preferred Categories */}
              <div className='space-y-2'>
                <Label>Preferred Racing Categories</Label>
                <div className='flex flex-wrap gap-2 mb-2'>
                  {formData.preferredCategories.map((category, index) => (
                    <Badge
                      key={index}
                      variant='outline'
                      className='flex items-center gap-1'
                    >
                      {category}
                      <X
                        className='h-3 w-3 cursor-pointer'
                        onClick={() => removeCategory(category)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className='flex gap-2'>
                  <Input
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    placeholder='Add category (e.g., GT3, Formula, Endurance)'
                    onKeyPress={e =>
                      e.key === 'Enter' && (e.preventDefault(), addCategory())
                    }
                  />
                  <Button type='button' onClick={addCategory} size='sm'>
                    <Plus className='h-4 w-4' />
                  </Button>
                </div>
              </div>

              {/* Availability */}
              <div className='space-y-2'>
                <Label>Availability</Label>
                <div className='flex flex-wrap gap-2 mb-2'>
                  {formData.availability.map((availability, index) => (
                    <Badge
                      key={index}
                      variant='secondary'
                      className='flex items-center gap-1'
                    >
                      {availability}
                      <X
                        className='h-3 w-3 cursor-pointer'
                        onClick={() => removeAvailability(availability)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className='flex gap-2'>
                  <Input
                    value={newAvailability}
                    onChange={e => setNewAvailability(e.target.value)}
                    placeholder='Add availability (e.g., weekends, weekdays, evenings)'
                    onKeyPress={e =>
                      e.key === 'Enter' &&
                      (e.preventDefault(), addAvailability())
                    }
                  />
                  <Button type='button' onClick={addAvailability} size='sm'>
                    <Plus className='h-4 w-4' />
                  </Button>
                </div>
              </div>

              {/* Contact Information */}
              <div className='space-y-4'>
                <h3 className='text-lg font-medium'>Contact Information</h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='phone'>Phone</Label>
                    <Input
                      id='phone'
                      value={formData.contactInfo.phone}
                      onChange={e =>
                        handleInputChange('contactInfo.phone', e.target.value)
                      }
                      placeholder='(555) 123-4567'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='email'>Email</Label>
                    <Input
                      id='email'
                      type='email'
                      value={formData.contactInfo.email}
                      onChange={e =>
                        handleInputChange('contactInfo.email', e.target.value)
                      }
                      placeholder='driver@example.com'
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className='flex justify-end space-x-4'>
                <Button type='button' variant='outline' asChild>
                  <Link to='/motorsports'>Cancel</Link>
                </Button>
                <Button type='submit' disabled={isCreating}>
                  {isCreating ? 'Creating Profile...' : 'Create Profile'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Login Prompt Modal */}
      <LoginPromptModal
        isOpen={showLoginPrompt}
        onClose={closeLoginPrompt}
        title='Sign In to Create Driver Profile'
        message='Please sign in to create a driver profile and connect with racing teams.'
      />
    </div>
  );
}

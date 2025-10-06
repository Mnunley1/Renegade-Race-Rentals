import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useTeams } from '@/hooks/useTeams';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function CreateTeamPage() {
  const navigate = useNavigate();
  const { requireAuth } = useAuthGuard();
  const { createTeam, isCreating } = useTeams();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logoUrl: '',
    location: '',
    specialties: [] as string[],
    availableSeats: 1,
    requirements: [] as string[],
    contactInfo: {
      phone: '',
      email: '',
      website: '',
    },
    socialLinks: {
      instagram: '',
      twitter: '',
      facebook: '',
      linkedin: '',
    },
  });

  const [newSpecialty, setNewSpecialty] = useState('');
  const [newRequirement, setNewRequirement] = useState('');

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
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

  const addSpecialty = () => {
    if (
      newSpecialty.trim() &&
      !formData.specialties.includes(newSpecialty.trim())
    ) {
      setFormData(prev => ({
        ...prev,
        specialties: [...prev.specialties, newSpecialty.trim()],
      }));
      setNewSpecialty('');
    }
  };

  const removeSpecialty = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter(s => s !== specialty),
    }));
  };

  const addRequirement = () => {
    if (
      newRequirement.trim() &&
      !formData.requirements.includes(newRequirement.trim())
    ) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()],
      }));
      setNewRequirement('');
    }
  };

  const removeRequirement = (requirement: string) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter(r => r !== requirement),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    requireAuth(async () => {
      try {
        await createTeam({
          name: formData.name,
          description: formData.description,
          logoUrl: formData.logoUrl || undefined,
          location: formData.location,
          specialties: formData.specialties,
          availableSeats: formData.availableSeats,
          requirements: formData.requirements,
          contactInfo: {
            phone: formData.contactInfo.phone || undefined,
            email: formData.contactInfo.email || undefined,
            website: formData.contactInfo.website || undefined,
          },
          socialLinks: {
            instagram: formData.socialLinks.instagram || undefined,
            twitter: formData.socialLinks.twitter || undefined,
            facebook: formData.socialLinks.facebook || undefined,
            linkedin: formData.socialLinks.linkedin || undefined,
          },
        });

        navigate('/motorsports');
      } catch (error) {
        console.error('Error creating team:', error);
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
          <h1 className='text-3xl font-bold text-gray-900'>
            Create Racing Team
          </h1>
          <p className='text-gray-600'>
            Build your racing team profile to attract talented drivers
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Team Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className='space-y-6'>
              {/* Basic Information */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='name'>Team Name *</Label>
                  <Input
                    id='name'
                    value={formData.name}
                    onChange={e => handleInputChange('name', e.target.value)}
                    placeholder='Enter your team name'
                    required
                  />
                </div>
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
              </div>

              <div className='space-y-2'>
                <Label htmlFor='description'>Description *</Label>
                <Textarea
                  id='description'
                  value={formData.description}
                  onChange={e =>
                    handleInputChange('description', e.target.value)
                  }
                  placeholder='Describe your team, racing philosophy, and what makes you unique'
                  rows={4}
                  required
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='logoUrl'>Logo URL (Optional)</Label>
                <Input
                  id='logoUrl'
                  type='url'
                  value={formData.logoUrl}
                  onChange={e => handleInputChange('logoUrl', e.target.value)}
                  placeholder='https://example.com/logo.png'
                />
              </div>

              {/* Specialties */}
              <div className='space-y-2'>
                <Label>Racing Specialties</Label>
                <div className='flex flex-wrap gap-2 mb-2'>
                  {formData.specialties.map((specialty, index) => (
                    <Badge
                      key={index}
                      variant='secondary'
                      className='flex items-center gap-1'
                    >
                      {specialty}
                      <X
                        className='h-3 w-3 cursor-pointer'
                        onClick={() => removeSpecialty(specialty)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className='flex gap-2'>
                  <Input
                    value={newSpecialty}
                    onChange={e => setNewSpecialty(e.target.value)}
                    placeholder='Add specialty (e.g., GT3, Formula, Endurance)'
                    onKeyPress={e =>
                      e.key === 'Enter' && (e.preventDefault(), addSpecialty())
                    }
                  />
                  <Button type='button' onClick={addSpecialty} size='sm'>
                    <Plus className='h-4 w-4' />
                  </Button>
                </div>
              </div>

              {/* Available Seats */}
              <div className='space-y-2'>
                <Label htmlFor='availableSeats'>Available Seats</Label>
                <Input
                  id='availableSeats'
                  type='number'
                  min='1'
                  value={formData.availableSeats}
                  onChange={e =>
                    handleInputChange(
                      'availableSeats',
                      parseInt(e.target.value)
                    )
                  }
                />
              </div>

              {/* Requirements */}
              <div className='space-y-2'>
                <Label>Driver Requirements</Label>
                <div className='flex flex-wrap gap-2 mb-2'>
                  {formData.requirements.map((requirement, index) => (
                    <Badge
                      key={index}
                      variant='outline'
                      className='flex items-center gap-1'
                    >
                      {requirement}
                      <X
                        className='h-3 w-3 cursor-pointer'
                        onClick={() => removeRequirement(requirement)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className='flex gap-2'>
                  <Input
                    value={newRequirement}
                    onChange={e => setNewRequirement(e.target.value)}
                    placeholder='Add requirement (e.g., SCCA license, 3+ years experience)'
                    onKeyPress={e =>
                      e.key === 'Enter' &&
                      (e.preventDefault(), addRequirement())
                    }
                  />
                  <Button type='button' onClick={addRequirement} size='sm'>
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
                      placeholder='team@example.com'
                    />
                  </div>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='website'>Website</Label>
                  <Input
                    id='website'
                    type='url'
                    value={formData.contactInfo.website}
                    onChange={e =>
                      handleInputChange('contactInfo.website', e.target.value)
                    }
                    placeholder='https://yourteam.com'
                  />
                </div>
              </div>

              {/* Social Links */}
              <div className='space-y-4'>
                <h3 className='text-lg font-medium'>Social Media (Optional)</h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='instagram'>Instagram</Label>
                    <Input
                      id='instagram'
                      value={formData.socialLinks.instagram}
                      onChange={e =>
                        handleInputChange(
                          'socialLinks.instagram',
                          e.target.value
                        )
                      }
                      placeholder='@yourteam'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='twitter'>Twitter</Label>
                    <Input
                      id='twitter'
                      value={formData.socialLinks.twitter}
                      onChange={e =>
                        handleInputChange('socialLinks.twitter', e.target.value)
                      }
                      placeholder='@yourteam'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='facebook'>Facebook</Label>
                    <Input
                      id='facebook'
                      value={formData.socialLinks.facebook}
                      onChange={e =>
                        handleInputChange(
                          'socialLinks.facebook',
                          e.target.value
                        )
                      }
                      placeholder='Your Team Page'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='linkedin'>LinkedIn</Label>
                    <Input
                      id='linkedin'
                      value={formData.socialLinks.linkedin}
                      onChange={e =>
                        handleInputChange(
                          'socialLinks.linkedin',
                          e.target.value
                        )
                      }
                      placeholder='Your Team LinkedIn'
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
                  {isCreating ? 'Creating Team...' : 'Create Team'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

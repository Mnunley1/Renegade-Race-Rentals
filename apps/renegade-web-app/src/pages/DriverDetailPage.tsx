import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useDriverProfiles } from '@/hooks/useDriverProfiles';
import { useTeamApplications } from '@/hooks/useTeamApplications';
import { useTeams } from '@/hooks/useTeams';
import { Id } from '@renegade/backend/convex/_generated/dataModel';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Separator,
} from '@renegade/ui';
import {
  ArrowLeft,
  Clock,
  ExternalLink,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Star,
  Trophy,
  Twitter,
  User,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NotFoundPage from './NotFoundPage';

export default function DriverDetailPage() {
  const { driverId } = useParams<{ driverId: string }>();
  const navigate = useNavigate();
  const { requireAuth } = useAuthGuard();
  const { driverProfiles } = useDriverProfiles();
  const { teams } = useTeams();
  const { applyToTeam, isApplying } = useTeamApplications();

  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [showApplicationModal, setShowApplicationModal] = useState(false);

  // Find the driver profile by ID
  const driverProfile = driverProfiles.find(driver => driver._id === driverId);

  if (!driverProfile) {
    return <NotFoundPage />;
  }

  const handleApplyToTeam = async (teamId: string) => {
    requireAuth(async () => {
      try {
        await applyToTeam({
          teamId: teamId as Id<'teams'>,
          message:
            applicationMessage ||
            `I'm interested in joining your team. I have ${driverProfile.experience} experience and specialize in ${driverProfile.preferredCategories.join(', ')}.`,
          driverExperience: driverProfile.experience,
          preferredDates: driverProfile.availability,
        });
        setShowApplicationModal(false);
        setSelectedTeamId(null);
        setApplicationMessage('');
      } catch (error) {
        console.error('Error applying to team:', error);
      }
    });
  };

  const getExperienceColor = (experience: string) => {
    switch (experience) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-blue-100 text-blue-800';
      case 'advanced':
        return 'bg-purple-100 text-purple-800';
      case 'professional':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container mx-auto px-4 py-8'>
        {/* Header */}
        <div className='mb-8'>
          <Button
            onClick={() => navigate('/motorsports')}
            variant='outline'
            className='mb-6'
          >
            <ArrowLeft className='h-4 w-4 mr-2' />
            Back to Motorsports
          </Button>

          <div className='bg-white rounded-lg shadow-sm p-8'>
            <div className='flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6'>
              {/* Driver Info */}
              <div className='flex-1'>
                <div className='flex items-start gap-6'>
                  <div className='w-24 h-24 rounded-full bg-[#EF1C25] flex items-center justify-center text-white text-2xl font-bold'>
                    <User className='h-12 w-12' />
                  </div>
                  <div className='flex-1'>
                    <h1 className='text-3xl font-bold text-gray-900 mb-2'>
                      Driver Profile
                    </h1>
                    <div className='flex items-center gap-4 mb-4'>
                      <div className='flex items-center text-gray-600'>
                        <MapPin className='h-4 w-4 mr-1' />
                        {driverProfile.location}
                      </div>
                      <Badge
                        className={`${getExperienceColor(driverProfile.experience)} capitalize`}
                      >
                        {driverProfile.experience}
                      </Badge>
                    </div>
                    <p className='text-gray-700 text-lg leading-relaxed'>
                      {driverProfile.bio}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className='lg:w-80'>
                <Card>
                  <CardHeader>
                    <CardTitle className='text-lg'>
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-3'>
                    {driverProfile.contactInfo.email && (
                      <div className='flex items-center gap-2'>
                        <Mail className='h-4 w-4 text-gray-500' />
                        <span className='text-sm'>
                          {driverProfile.contactInfo.email}
                        </span>
                      </div>
                    )}
                    {driverProfile.contactInfo.phone && (
                      <div className='flex items-center gap-2'>
                        <Phone className='h-4 w-4 text-gray-500' />
                        <span className='text-sm'>
                          {driverProfile.contactInfo.phone}
                        </span>
                      </div>
                    )}
                    {driverProfile.socialLinks && (
                      <div className='pt-2'>
                        <Separator className='mb-3' />
                        <div className='flex gap-2'>
                          {driverProfile.socialLinks.instagram && (
                            <a
                              href={`https://instagram.com/${driverProfile.socialLinks.instagram.replace('@', '')}`}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='p-2 rounded-md hover:bg-gray-100 transition-colors'
                            >
                              <Instagram className='h-4 w-4 text-pink-600' />
                            </a>
                          )}
                          {driverProfile.socialLinks.twitter && (
                            <a
                              href={`https://twitter.com/${driverProfile.socialLinks.twitter.replace('@', '')}`}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='p-2 rounded-md hover:bg-gray-100 transition-colors'
                            >
                              <Twitter className='h-4 w-4 text-blue-500' />
                            </a>
                          )}
                          {driverProfile.socialLinks.linkedin && (
                            <a
                              href={driverProfile.socialLinks.linkedin}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='p-2 rounded-md hover:bg-gray-100 transition-colors'
                            >
                              <Linkedin className='h-4 w-4 text-blue-700' />
                            </a>
                          )}
                          {driverProfile.socialLinks.website && (
                            <a
                              href={driverProfile.socialLinks.website}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='p-2 rounded-md hover:bg-gray-100 transition-colors'
                            >
                              <ExternalLink className='h-4 w-4 text-gray-600' />
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Left Column - Driver Details */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Experience & Licenses */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Trophy className='h-5 w-5' />
                  Experience & Licenses
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <h4 className='font-semibold text-gray-900 mb-2'>
                    Experience Level
                  </h4>
                  <Badge
                    className={`${getExperienceColor(driverProfile.experience)} capitalize text-sm`}
                  >
                    {driverProfile.experience}
                  </Badge>
                </div>

                {driverProfile.licenses.length > 0 && (
                  <div>
                    <h4 className='font-semibold text-gray-900 mb-2'>
                      Licenses & Certifications
                    </h4>
                    <div className='flex flex-wrap gap-2'>
                      {driverProfile.licenses.map((license, index) => (
                        <Badge
                          key={index}
                          variant='outline'
                          className='text-sm'
                        >
                          {license}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {driverProfile.achievements && (
                  <div>
                    <h4 className='font-semibold text-gray-900 mb-2'>
                      Achievements
                    </h4>
                    <p className='text-gray-700'>
                      {driverProfile.achievements}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Racing Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Star className='h-5 w-5' />
                  Racing Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {driverProfile.preferredCategories.length > 0 && (
                  <div>
                    <h4 className='font-semibold text-gray-900 mb-2'>
                      Preferred Categories
                    </h4>
                    <div className='flex flex-wrap gap-2'>
                      {driverProfile.preferredCategories.map(
                        (category, index) => (
                          <Badge
                            key={index}
                            variant='secondary'
                            className='text-sm'
                          >
                            {category}
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                )}

                {driverProfile.availability.length > 0 && (
                  <div>
                    <h4 className='font-semibold text-gray-900 mb-2'>
                      Availability
                    </h4>
                    <div className='flex flex-wrap gap-2'>
                      {driverProfile.availability.map((availability, index) => (
                        <Badge
                          key={index}
                          variant='outline'
                          className='text-sm'
                        >
                          <Clock className='h-3 w-3 mr-1' />
                          {availability}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Available Teams */}
          <div className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Users className='h-5 w-5' />
                  Available Teams
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {teams
                    .filter(team => team.isActive)
                    .slice(0, 3)
                    .map(team => (
                      <div
                        key={team._id}
                        className='border rounded-lg p-4 hover:bg-gray-50 transition-colors'
                      >
                        <div className='flex items-start justify-between mb-2'>
                          <h4 className='font-semibold text-gray-900'>
                            {team.name}
                          </h4>
                          <Badge variant='outline' className='text-xs'>
                            {team.availableSeats} seats
                          </Badge>
                        </div>
                        <p className='text-sm text-gray-600 mb-3 line-clamp-2'>
                          {team.description}
                        </p>
                        <div className='flex items-center text-xs text-gray-500 mb-3'>
                          <MapPin className='h-3 w-3 mr-1' />
                          {team.location}
                        </div>
                        <Button
                          size='sm'
                          className='w-full'
                          onClick={() => {
                            setSelectedTeamId(team._id);
                            setShowApplicationModal(true);
                          }}
                          disabled={isApplying}
                        >
                          Apply to Team
                        </Button>
                      </div>
                    ))}
                </div>
                <div className='mt-4 pt-4 border-t'>
                  <Button
                    variant='outline'
                    className='w-full'
                    onClick={() => navigate('/motorsports')}
                  >
                    View All Teams
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Application Modal */}
        {showApplicationModal && selectedTeamId && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
            <div className='bg-white rounded-lg p-6 w-full max-w-md'>
              <h3 className='text-lg font-semibold mb-4'>Apply to Team</h3>
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Application Message
                  </label>
                  <textarea
                    value={applicationMessage}
                    onChange={e => setApplicationMessage(e.target.value)}
                    className='w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#EF1C25] focus:border-transparent'
                    rows={4}
                    placeholder="Tell the team why you'd like to join..."
                  />
                </div>
                <div className='flex gap-3'>
                  <Button
                    onClick={() => handleApplyToTeam(selectedTeamId)}
                    disabled={isApplying}
                    className='flex-1'
                  >
                    {isApplying ? 'Applying...' : 'Submit Application'}
                  </Button>
                  <Button
                    variant='outline'
                    onClick={() => {
                      setShowApplicationModal(false);
                      setSelectedTeamId(null);
                      setApplicationMessage('');
                    }}
                    className='flex-1'
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

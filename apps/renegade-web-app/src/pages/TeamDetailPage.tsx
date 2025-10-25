import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useTeamApplications } from '@/hooks/useTeamApplications';
import { api } from '@/lib/convex';
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
import { useQuery } from 'convex/react';
import {
  ArrowLeft,
  CheckCircle,
  Facebook,
  Globe,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Star,
  Trophy,
  Twitter,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NotFoundPage from './NotFoundPage';

export default function TeamDetailPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const { requireAuth } = useAuthGuard();
  const { applyToTeam, isApplying } = useTeamApplications();

  const [applicationMessage, setApplicationMessage] = useState('');
  const [showApplicationModal, setShowApplicationModal] = useState(false);

  // Fetch team data
  const team = useQuery(
    api.teams.getById,
    teamId ? { teamId: teamId as Id<'teams'> } : 'skip'
  );
  const teamApplications = useQuery(
    api.teamApplications.getPublicByTeam,
    teamId ? { teamId: teamId as Id<'teams'> } : 'skip'
  );

  if (!team) {
    return <NotFoundPage />;
  }

  const handleApplyToTeam = async () => {
    requireAuth(async () => {
      try {
        await applyToTeam({
          teamId: team._id,
          message:
            applicationMessage ||
            `I'm interested in joining ${team.name}. I believe I would be a great fit for your team.`,
          driverExperience: 'intermediate', // This should come from user's driver profile
          preferredDates: ['weekends'], // This should come from user's driver profile
        });
        setShowApplicationModal(false);
        setApplicationMessage('');
      } catch (error) {
        console.error('Error applying to team:', error);
      }
    });
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
              {/* Team Info */}
              <div className='flex-1'>
                <div className='flex items-start gap-6'>
                  <div className='w-24 h-24 rounded-full bg-[#EF1C25] flex items-center justify-center text-white text-2xl font-bold overflow-hidden'>
                    {team.logoUrl ? (
                      <img
                        src={team.logoUrl}
                        alt={team.name}
                        className='w-full h-full object-cover'
                      />
                    ) : (
                      <Users className='h-12 w-12' />
                    )}
                  </div>
                  <div className='flex-1'>
                    <h1 className='text-3xl font-bold text-gray-900 mb-2'>
                      {team.name}
                    </h1>
                    <div className='flex items-center gap-4 mb-4'>
                      <div className='flex items-center text-gray-600'>
                        <MapPin className='h-4 w-4 mr-1' />
                        {team.location}
                      </div>
                      <Badge variant='secondary' className='text-sm'>
                        {team.availableSeats} seats available
                      </Badge>
                    </div>
                    <p className='text-gray-700 text-lg leading-relaxed'>
                      {team.description}
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
                    {team.contactInfo.email && (
                      <div className='flex items-center gap-2'>
                        <Mail className='h-4 w-4 text-gray-500' />
                        <span className='text-sm'>
                          {team.contactInfo.email}
                        </span>
                      </div>
                    )}
                    {team.contactInfo.phone && (
                      <div className='flex items-center gap-2'>
                        <Phone className='h-4 w-4 text-gray-500' />
                        <span className='text-sm'>
                          {team.contactInfo.phone}
                        </span>
                      </div>
                    )}
                    {team.contactInfo.website && (
                      <div className='flex items-center gap-2'>
                        <Globe className='h-4 w-4 text-gray-500' />
                        <a
                          href={team.contactInfo.website}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-sm text-blue-600 hover:underline'
                        >
                          Visit Website
                        </a>
                      </div>
                    )}
                    {team.socialLinks && (
                      <div className='pt-2'>
                        <Separator className='mb-3' />
                        <div className='flex gap-2'>
                          {team.socialLinks.instagram && (
                            <a
                              href={`https://instagram.com/${team.socialLinks.instagram.replace('@', '')}`}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='p-2 rounded-md hover:bg-gray-100 transition-colors'
                            >
                              <Instagram className='h-4 w-4 text-pink-600' />
                            </a>
                          )}
                          {team.socialLinks.twitter && (
                            <a
                              href={`https://twitter.com/${team.socialLinks.twitter.replace('@', '')}`}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='p-2 rounded-md hover:bg-gray-100 transition-colors'
                            >
                              <Twitter className='h-4 w-4 text-blue-500' />
                            </a>
                          )}
                          {team.socialLinks.facebook && (
                            <a
                              href={`https://facebook.com/${team.socialLinks.facebook}`}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='p-2 rounded-md hover:bg-gray-100 transition-colors'
                            >
                              <Facebook className='h-4 w-4 text-blue-600' />
                            </a>
                          )}
                          {team.socialLinks.linkedin && (
                            <a
                              href={team.socialLinks.linkedin}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='p-2 rounded-md hover:bg-gray-100 transition-colors'
                            >
                              <Linkedin className='h-4 w-4 text-blue-700' />
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
          {/* Left Column - Team Details */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Team Specialties */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Trophy className='h-5 w-5' />
                  Team Specialties
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='flex flex-wrap gap-2'>
                  {team.specialties.map((specialty, index) => (
                    <Badge key={index} variant='secondary' className='text-sm'>
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <CheckCircle className='h-5 w-5' />
                  Driver Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  {team.requirements.map((requirement, index) => (
                    <div key={index} className='flex items-start gap-2'>
                      <CheckCircle className='h-4 w-4 text-green-600 mt-0.5 flex-shrink-0' />
                      <span className='text-gray-700'>{requirement}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Team Stats */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Star className='h-5 w-5' />
                  Team Information
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='text-center p-4 bg-gray-50 rounded-lg'>
                    <div className='text-2xl font-bold text-[#EF1C25]'>
                      {team.availableSeats}
                    </div>
                    <div className='text-sm text-gray-600'>Available Seats</div>
                  </div>
                  <div className='text-center p-4 bg-gray-50 rounded-lg'>
                    <div className='text-2xl font-bold text-[#EF1C25]'>
                      {team.specialties.length}
                    </div>
                    <div className='text-sm text-gray-600'>Specialties</div>
                  </div>
                </div>
                <div className='pt-4 border-t'>
                  <div className='text-sm text-gray-600'>
                    <strong>Founded:</strong>{' '}
                    {new Date(team.createdAt).getFullYear()}
                  </div>
                  <div className='text-sm text-gray-600'>
                    <strong>Last Updated:</strong>{' '}
                    {new Date(team.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Application */}
          <div className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Users className='h-5 w-5' />
                  Join This Team
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <p className='text-sm text-gray-600'>
                  Ready to join {team.name}? Submit your application and let
                  them know why you'd be a great fit.
                </p>

                <div className='space-y-2'>
                  <div className='text-sm font-medium text-gray-900'>
                    Available Seats
                  </div>
                  <div className='text-2xl font-bold text-[#EF1C25]'>
                    {team.availableSeats}
                  </div>
                </div>

                <Button
                  onClick={() => setShowApplicationModal(true)}
                  disabled={isApplying || team.availableSeats === 0}
                  className='w-full'
                >
                  {team.availableSeats === 0
                    ? 'No Seats Available'
                    : 'Apply to Team'}
                </Button>

                {team.availableSeats > 0 && (
                  <p className='text-xs text-gray-500 text-center'>
                    Applications are reviewed by the team owner
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Recent Applications */}
            {teamApplications && teamApplications.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg'>Recent Applications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-3'>
                    {teamApplications.slice(0, 3).map(application => (
                      <div
                        key={application._id}
                        className='border rounded-lg p-3'
                      >
                        <div className='flex items-center justify-between mb-2'>
                          <span className='text-sm font-medium'>
                            Driver Application
                          </span>
                          <Badge
                            variant={
                              application.status === 'accepted'
                                ? 'default'
                                : application.status === 'declined'
                                  ? 'destructive'
                                  : 'secondary'
                            }
                            className='text-xs'
                          >
                            {application.status}
                          </Badge>
                        </div>
                        <p className='text-xs text-gray-600 line-clamp-2'>
                          {application.message}
                        </p>
                        <div className='text-xs text-gray-500 mt-1'>
                          {new Date(application.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Application Modal */}
        {showApplicationModal && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
            <div className='bg-white rounded-lg p-6 w-full max-w-md'>
              <h3 className='text-lg font-semibold mb-4'>
                Apply to {team.name}
              </h3>
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
                    onClick={handleApplyToTeam}
                    disabled={isApplying}
                    className='flex-1'
                  >
                    {isApplying ? 'Applying...' : 'Submit Application'}
                  </Button>
                  <Button
                    variant='outline'
                    onClick={() => {
                      setShowApplicationModal(false);
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

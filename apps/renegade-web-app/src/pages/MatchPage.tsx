import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useDriverProfiles } from '@/hooks/useDriverProfiles';
import { useTeamApplications } from '@/hooks/useTeamApplications';
import { useTeams } from '@/hooks/useTeams';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  LoginPromptModal,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@renegade/ui';
import { MapPin, Search, User, Users } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function MatchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { requireAuth, showLoginPrompt, closeLoginPrompt } = useAuthGuard();

  // Hooks for data
  const { teams, teamsLoading } = useTeams();
  const { driverProfiles, driverProfilesLoading } = useDriverProfiles();
  const { applyToTeam, isApplying } = useTeamApplications();

  // Filter teams based on search query
  const filteredTeams = teams.filter(team => {
    const matchesSearch =
      !searchQuery ||
      team.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.location?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  // Filter driver profiles based on search query
  const filteredDrivers = driverProfiles.filter(driver => {
    const matchesSearch =
      !searchQuery ||
      driver.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.location?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const handleApplyToTeam = async (teamId: string) => {
    requireAuth(async () => {
      try {
        await applyToTeam({
          teamId: teamId as any,
          message: 'I am interested in joining your team!',
          driverExperience:
            'I have experience in racing and would love to contribute.',
          preferredDates: ['2024-03-15', '2024-03-16'],
        });
      } catch (error) {
        console.error('Error applying to team:', error);
      }
    });
  };

  const handleContactDriver = (driverId: string) => {
    requireAuth(() => {
      // Navigate to messages or open contact modal
      console.log('Contact driver:', driverId);
    });
  };

  if (teamsLoading || driverProfilesLoading) {
    return (
      <div className='container px-4 py-8'>
        <div className='flex items-center justify-center min-h-[400px]'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4'></div>
            <p className='text-gray-600'>Loading motorsports community...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='container px-4 py-8'>
      <div className='space-y-8'>
        {/* Header */}
        <div className='text-center space-y-4'>
          <h1 className='text-3xl md:text-4xl font-bold text-gray-900 font-display'>
            Motorsports Community
          </h1>
          <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
            Connect with racing teams and drivers to build your perfect racing
            community
          </p>
        </div>

        {/* Search */}
        <div className='max-w-md mx-auto'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
            <Input
              placeholder='Search by name, description, or location...'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className='pl-10'
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex justify-center space-x-4'>
          <Button
            onClick={() =>
              requireAuth(
                () => (window.location.href = '/motorsports/create-team')
              )
            }
          >
            <Users className='h-4 w-4 mr-2' />
            Create Team
          </Button>
          <Button
            variant='outline'
            onClick={() =>
              requireAuth(
                () => (window.location.href = '/motorsports/create-driver')
              )
            }
          >
            <User className='h-4 w-4 mr-2' />
            Create Driver Profile
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue='teams' className='w-full'>
          <TabsList className='grid w-full grid-cols-2 max-w-md mx-auto'>
            <TabsTrigger value='teams' className='flex items-center space-x-2'>
              <Users className='h-4 w-4' />
              <span>Racing Teams ({filteredTeams.length})</span>
            </TabsTrigger>
            <TabsTrigger
              value='drivers'
              className='flex items-center space-x-2'
            >
              <User className='h-4 w-4' />
              <span>Drivers ({filteredDrivers.length})</span>
            </TabsTrigger>
          </TabsList>

          {/* Teams Tab */}
          <TabsContent value='teams' className='mt-8'>
            {filteredTeams.length === 0 ? (
              <div className='text-center py-12'>
                <Users className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                <h3 className='text-lg font-medium text-gray-900 mb-2'>
                  No teams found
                </h3>
                <p className='text-gray-600 mb-4'>
                  {searchQuery
                    ? 'Try adjusting your search criteria.'
                    : 'Be the first to create a racing team!'}
                </p>
                <Button
                  onClick={() =>
                    requireAuth(
                      () => (window.location.href = '/motorsports/create-team')
                    )
                  }
                >
                  <Users className='h-4 w-4 mr-2' />
                  Create Team
                </Button>
              </div>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {filteredTeams.map(team => (
                  <Card
                    key={team._id}
                    className='hover:shadow-lg transition-shadow'
                  >
                    <CardHeader>
                      <div className='flex items-start justify-between'>
                        <div>
                          <CardTitle className='text-xl text-gray-900 mb-2'>
                            {team.name}
                          </CardTitle>
                          <div className='flex items-center text-sm text-gray-600 mb-2'>
                            <MapPin className='h-4 w-4 mr-1' />
                            {team.location}
                          </div>
                        </div>
                        <Badge variant='outline'>
                          {team.availableSeats} seats
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className='space-y-4'>
                        <p className='text-gray-700 text-sm'>
                          {team.description}
                        </p>

                        <div className='space-y-2'>
                          <div>
                            <p className='text-sm text-gray-600 mb-2'>
                              Specialties:
                            </p>
                            <div className='flex flex-wrap gap-1'>
                              {team.specialties
                                ?.slice(0, 3)
                                .map((specialty, index) => (
                                  <Badge
                                    key={index}
                                    variant='outline'
                                    className='text-xs'
                                  >
                                    {specialty}
                                  </Badge>
                                ))}
                              {team.specialties?.length > 3 && (
                                <Badge variant='outline' className='text-xs'>
                                  +{team.specialties.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>

                          {team.requirements &&
                            team.requirements.length > 0 && (
                              <div className='text-sm'>
                                <span className='text-gray-600'>
                                  Requirements:{' '}
                                </span>
                                <span className='text-gray-800'>
                                  {team.requirements.join(', ')}
                                </span>
                              </div>
                            )}
                        </div>

                        <div className='space-y-2'>
                          <Button
                            className='w-full'
                            onClick={() => handleApplyToTeam(team._id)}
                            disabled={isApplying}
                          >
                            {isApplying ? 'Applying...' : 'Apply to Join'}
                          </Button>
                          <Button variant='outline' className='w-full' asChild>
                            <Link to={`/motorsports/team/${team._id}`}>
                              View Details
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Drivers Tab */}
          <TabsContent value='drivers' className='mt-8'>
            {filteredDrivers.length === 0 ? (
              <div className='text-center py-12'>
                <User className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                <h3 className='text-lg font-medium text-gray-900 mb-2'>
                  No drivers found
                </h3>
                <p className='text-gray-600 mb-4'>
                  {searchQuery
                    ? 'Try adjusting your search criteria.'
                    : 'Be the first to create a driver profile!'}
                </p>
                <Button
                  onClick={() =>
                    requireAuth(
                      () =>
                        (window.location.href = '/motorsports/create-driver')
                    )
                  }
                >
                  <User className='h-4 w-4 mr-2' />
                  Create Driver Profile
                </Button>
              </div>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {filteredDrivers.map(driver => (
                  <Card
                    key={driver._id}
                    className='hover:shadow-lg transition-shadow'
                  >
                    <CardHeader>
                      <div className='flex items-start justify-between'>
                        <div>
                          <CardTitle className='text-xl text-gray-900 mb-2'>
                            Driver Profile
                          </CardTitle>
                          <div className='flex items-center text-sm text-gray-600 mb-2'>
                            <MapPin className='h-4 w-4 mr-1' />
                            {driver.location}
                          </div>
                        </div>
                        <Badge variant='secondary' className='capitalize'>
                          {driver.experience}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className='space-y-4'>
                        <p className='text-gray-700 text-sm'>{driver.bio}</p>

                        <div className='space-y-2'>
                          <div>
                            <p className='text-sm text-gray-600 mb-2'>
                              Preferred Categories:
                            </p>
                            <div className='flex flex-wrap gap-1'>
                              {driver.preferredCategories
                                ?.slice(0, 3)
                                .map((category, index) => (
                                  <Badge
                                    key={index}
                                    variant='outline'
                                    className='text-xs'
                                  >
                                    {category}
                                  </Badge>
                                ))}
                              {driver.preferredCategories?.length > 3 && (
                                <Badge variant='outline' className='text-xs'>
                                  +{driver.preferredCategories.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>

                          {driver.licenses && driver.licenses.length > 0 && (
                            <div className='text-sm'>
                              <span className='text-gray-600'>Licenses: </span>
                              <span className='text-gray-800'>
                                {driver.licenses.join(', ')}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className='space-y-2'>
                          <Button
                            className='w-full'
                            onClick={() => handleContactDriver(driver._id)}
                          >
                            Contact Driver
                          </Button>
                          <Button variant='outline' className='w-full' asChild>
                            <Link to={`/motorsports/driver/${driver._id}`}>
                              View Details
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Login Prompt Modal */}
      <LoginPromptModal
        isOpen={showLoginPrompt}
        onClose={closeLoginPrompt}
        title='Sign In Required'
        message='Please sign in to create teams, driver profiles, and connect with the motorsports community.'
      />
    </div>
  );
}

import { useUser } from '@clerk/clerk-react';
import { Badge, Button, Card, CardContent, Input } from '@renegade/ui';
import {
  ArrowRight,
  Award,
  Calendar,
  Car,
  CheckCircle,
  Clock,
  MapPin,
  Search,
  Shield,
  Star,
  UserCheck,
  Users,
  Zap,
} from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Import the hero image
import HeroImage from '@/assets/images/clement-delacre-JuEQI7nssh0-unsplash.jpg';
import { PendingActionsWidget } from '@/components/PendingActionsWidget';

export default function HomePage() {
  const navigate = useNavigate();
  const { isSignedIn } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLocation, setSearchLocation] = useState('');

  const features = [
    {
      icon: Car,
      title: 'Premium Track Cars',
      description:
        'Access high-performance vehicles from top manufacturers for your track day experience.',
    },
    {
      icon: Users,
      title: 'Racing Community',
      description:
        'Connect with fellow drivers, join racing teams, and build lasting racing relationships.',
    },
    {
      icon: Shield,
      title: 'Verified Owners',
      description:
        'All vehicle owners are thoroughly vetted to ensure safety and reliability.',
    },
    {
      icon: Zap,
      title: 'Instant Booking',
      description:
        'Book your dream car instantly with our streamlined reservation system.',
    },
  ];

  const howItWorks = [
    {
      step: 1,
      icon: Search,
      title: 'Search & Discover',
      description:
        'Browse our curated collection of premium track cars from verified owners worldwide.',
      details: [
        'Filter by location, price, and specifications',
        'View detailed photos and specifications',
        'Read owner profiles and track records',
      ],
    },
    {
      step: 2,
      icon: Calendar,
      title: 'Book Your Session',
      description:
        'Select your preferred dates and complete the booking process with secure payment.',
      details: [
        'Choose your track day dates',
        'Secure payment processing',
        'Instant booking confirmation',
      ],
    },
    {
      step: 3,
      icon: UserCheck,
      title: 'Meet & Drive',
      description:
        'Connect with the owner, complete safety checks, and enjoy your track day experience.',
      details: [
        'Meet the owner at the track',
        'Complete safety briefing',
        'Enjoy your track day',
      ],
    },
  ];

  const stats = [
    {
      icon: Car,
      value: '500+',
      label: 'Premium Vehicles',
      description: 'Track-ready cars from top manufacturers',
    },
    {
      icon: Users,
      value: '2,500+',
      label: 'Active Members',
      description: 'Racing enthusiasts worldwide',
    },
    {
      icon: Award,
      value: '98%',
      label: 'Satisfaction Rate',
      description: 'Based on user reviews',
    },
    {
      icon: Clock,
      value: '24/7',
      label: 'Support',
      description: 'Always here to help',
    },
  ];

  const featuredVehicles = [
    {
      id: 1,
      name: 'Porsche 911 GT3',
      image:
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400',
      price: '$450/day',
      location: 'Laguna Seca',
      rating: 4.9,
      reviews: 24,
    },
    {
      id: 2,
      name: 'Ferrari 488 GTB',
      image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400',
      price: '$650/day',
      location: 'Sonoma Raceway',
      rating: 4.8,
      reviews: 18,
    },
    {
      id: 3,
      name: 'McLaren 720S',
      image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400',
      price: '$750/day',
      location: 'Thunderhill',
      rating: 4.9,
      reviews: 31,
    },
  ];

  const handleSearch = () => {
    navigate('/search', {
      state: {
        query: searchQuery,
        location: searchLocation,
      },
    });
  };

  return (
    <div className='min-h-screen'>
      {/* Hero Section */}
      <section className='relative text-white overflow-hidden'>
        {/* Hero Background Image */}
        <div className='absolute inset-0'>
          <img
            src={HeroImage}
            alt='Race track with sports cars'
            className='w-full h-full object-cover'
            loading='eager'
            decoding='async'
          />
          <div className='absolute inset-0 bg-black/50' />
        </div>

        <div className='relative container px-4 py-16 sm:py-20 md:py-24 lg:py-32'>
          <div className='max-w-4xl mx-auto text-center space-y-6 sm:space-y-8'>
            <Badge className='bg-[#EF1C25] text-white border-0 px-4 py-2 text-sm'>
              Premium Track Car Marketplace
            </Badge>

            <h1 className='text-4xl md:text-6xl lg:text-7xl font-bold leading-tight font-display'>
              Your Dream Track Car
              <span className='block text-[#EF1C25]'>Awaits</span>
            </h1>

            <p className='text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto'>
              Connect with track car owners, find your perfect racing machine,
              and join a community of passionate drivers.
            </p>

            {/* Quick Search Bar */}
            <div className='max-w-2xl mx-auto'>
              <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20'>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4'>
                  <div className='sm:col-span-2 lg:col-span-2'>
                    <div className='relative'>
                      <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400' />
                      <Input
                        placeholder='Search for cars (e.g., Porsche, Ferrari)'
                        value={searchQuery}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setSearchQuery(e.target.value)
                        }
                        className='pl-9 sm:pl-10 bg-white/90 text-gray-900 placeholder-gray-500 border-0 rounded-xl text-sm sm:text-base h-10 sm:h-12'
                      />
                    </div>
                  </div>
                  <div className='relative'>
                    <MapPin className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400' />
                    <Input
                      placeholder='Location'
                      value={searchLocation}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setSearchLocation(e.target.value)
                      }
                      className='pl-9 sm:pl-10 bg-white/90 text-gray-900 placeholder-gray-500 border-0 rounded-xl text-sm sm:text-base h-10 sm:h-12'
                    />
                  </div>
                </div>
                <div className='mt-3 sm:mt-4 flex justify-center'>
                  <Button
                    size='lg'
                    className='text-base sm:text-lg px-6 sm:px-8 py-2 sm:py-3 h-auto bg-[#EF1C25] hover:bg-[#EF1C25]/90 w-full sm:w-auto'
                    onClick={handleSearch}
                  >
                    Search Cars
                    <ArrowRight className='ml-2 h-4 w-4 sm:h-5 sm:w-5' />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Background Pattern */}
        <div className='absolute inset-0 opacity-10 pointer-events-none'>
          <div className='absolute top-20 left-10 w-20 h-20 border border-white/20 rounded-full'></div>
          <div className='absolute top-40 right-20 w-16 h-16 border border-white/20 rounded-full'></div>
          <div className='absolute bottom-20 left-20 w-12 h-12 border border-white/20 rounded-full'></div>
          <div className='absolute bottom-40 right-10 w-8 h-8 border border-white/20 rounded-full'></div>
        </div>
      </section>

      {/* Pending Actions Widget for authenticated users */}
      {isSignedIn && (
        <section className='py-8 bg-gray-50'>
          <div className='container px-4'>
            <div className='max-w-4xl mx-auto'>
              <PendingActionsWidget />
            </div>
          </div>
        </section>
      )}

      {/* Statistics Section */}
      <section className='py-12 sm:py-16 bg-white'>
        <div className='container px-4'>
          <div className='text-center mb-8 sm:mb-12'>
            <h2 className='text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 font-display'>
              Trusted by Racing Enthusiasts Worldwide
            </h2>
            <p className='text-base sm:text-lg text-gray-600 max-w-2xl mx-auto'>
              Join thousands of satisfied customers who have found their perfect
              track car experience.
            </p>
          </div>

          <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8'>
            {stats.map((stat, index) => (
              <div key={index} className='text-center group'>
                <div className='w-12 h-12 sm:w-16 sm:h-16 bg-[#EF1C25] rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300'>
                  <stat.icon className='h-6 w-6 sm:h-8 sm:w-8 text-white' />
                </div>
                <div className='text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-1 sm:mb-2 font-display'>
                  {stat.value}
                </div>
                <div className='text-sm sm:text-lg font-semibold text-gray-900 mb-1'>
                  {stat.label}
                </div>
                <div className='text-xs sm:text-sm text-gray-600'>
                  {stat.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Vehicles Section */}
      <section className='py-24 bg-gray-50'>
        <div className='container px-4'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-display'>
              Featured Track Cars
            </h2>
            <p className='text-xl text-gray-600 max-w-2xl mx-auto'>
              Discover some of our most popular and highly-rated vehicles.
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            {featuredVehicles.map(vehicle => (
              <Card
                key={vehicle.id}
                className='group hover:shadow-xl transition-all duration-300 border-0 shadow-sm overflow-hidden'
              >
                <div className='relative overflow-hidden'>
                  <img
                    src={vehicle.image}
                    alt={vehicle.name}
                    className='w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300'
                    loading='lazy'
                    decoding='async'
                  />
                  <div className='absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1'>
                    <span className='text-sm font-semibold text-[#EF1C25]'>
                      {vehicle.price}
                    </span>
                  </div>
                </div>
                <CardContent className='p-6'>
                  <h3 className='text-xl font-bold text-gray-900 mb-2 font-display'>
                    {vehicle.name}
                  </h3>
                  <div className='flex items-center text-gray-600 mb-3'>
                    <MapPin className='h-4 w-4 mr-1' />
                    <span className='text-sm'>{vehicle.location}</span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center'>
                      <Star className='h-4 w-4 text-yellow-400 fill-current mr-1' />
                      <span className='text-sm font-semibold text-gray-900'>
                        {vehicle.rating}
                      </span>
                      <span className='text-sm text-gray-600 ml-1'>
                        ({vehicle.reviews} reviews)
                      </span>
                    </div>
                    <Button
                      size='sm'
                      className='bg-[#EF1C25] hover:bg-[#EF1C25]/90'
                      onClick={() => navigate('/search')}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className='text-center mt-12'>
            <Button
              size='lg'
              className='text-lg px-8 py-3 h-auto'
              onClick={() => navigate('/search')}
            >
              View All Vehicles
              <ArrowRight className='ml-2 h-5 w-5' />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className='py-24 bg-white'>
        <div className='container px-4'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-display'>
              Why Choose Renegade Race?
            </h2>
            <p className='text-xl text-gray-600 max-w-2xl mx-auto'>
              Experience the ultimate track car marketplace with unmatched
              benefits and community support.
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
            {features.map((feature, index) => (
              <Card
                key={index}
                className='text-center group hover:shadow-lg transition-shadow duration-300 border-0 shadow-sm'
              >
                <CardContent className='p-8'>
                  <div className='w-16 h-16 bg-[#EF1C25] rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300'>
                    <feature.icon className='h-8 w-8 text-white' />
                  </div>
                  <h3 className='text-xl font-semibold text-gray-900 mb-4 font-display'>
                    {feature.title}
                  </h3>
                  <p className='text-gray-600 leading-relaxed'>
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className='py-24 bg-gradient-to-br from-gray-50 to-gray-100'>
        <div className='container px-4'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-display'>
              How It Works
            </h2>
            <p className='text-xl text-gray-600 max-w-2xl mx-auto'>
              Get started in just three simple steps and experience the thrill
              of driving premium track cars.
            </p>
          </div>

          <div className='max-w-6xl mx-auto'>
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12'>
              {howItWorks.map((step, index) => (
                <div key={index} className='relative'>
                  {/* Connection Line */}
                  {index < howItWorks.length - 1 && (
                    <div className='hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-[#EF1C25] to-gray-300 transform translate-x-6'></div>
                  )}

                  <Card className='group hover:shadow-xl transition-all duration-300 border-0 shadow-sm bg-white/80 backdrop-blur-sm h-full'>
                    <CardContent className='p-8 text-center'>
                      {/* Step Number */}
                      <div className='relative mb-6'>
                        <div className='w-20 h-20 bg-gradient-to-br from-[#EF1C25] to-[#D91A20] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300'>
                          <step.icon className='h-10 w-10 text-white' />
                        </div>
                        <div className='absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center border-2 border-[#EF1C25]'>
                          <span className='text-sm font-bold text-[#EF1C25]'>
                            {step.step}
                          </span>
                        </div>
                      </div>

                      <h3 className='text-xl font-bold text-gray-900 mb-4 font-display'>
                        {step.title}
                      </h3>

                      <p className='text-gray-600 mb-6 leading-relaxed'>
                        {step.description}
                      </p>

                      {/* Step Details */}
                      <div className='space-y-2'>
                        {step.details.map((detail, detailIndex) => (
                          <div
                            key={detailIndex}
                            className='flex items-center text-sm text-gray-600'
                          >
                            <CheckCircle className='h-4 w-4 text-[#EF1C25] mr-2 flex-shrink-0' />
                            <span>{detail}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='py-24 bg-gradient-to-r from-[#EF1C25] to-[#D91A20] relative overflow-hidden'>
        {/* Background Pattern */}
        <div className='absolute inset-0 opacity-10'>
          <div className='absolute top-10 left-10 w-32 h-32 border border-white/20 rounded-full'></div>
          <div className='absolute top-20 right-20 w-24 h-24 border border-white/20 rounded-full'></div>
          <div className='absolute bottom-20 left-20 w-16 h-16 border border-white/20 rounded-full'></div>
          <div className='absolute bottom-10 right-10 w-20 h-20 border border-white/20 rounded-full'></div>
        </div>

        <div className='container px-4 text-center relative'>
          <div className='max-w-4xl mx-auto'>
            <h2 className='text-3xl md:text-5xl font-bold text-white mb-6 font-display'>
              Ready to Find Your Dream Track Car?
            </h2>
            <p className='text-xl md:text-2xl text-red-100 mb-8 max-w-3xl mx-auto'>
              Join thousands of racing enthusiasts and start your track day
              adventure today.
            </p>
            <div className='flex flex-col sm:flex-row justify-center gap-4'>
              <Button
                size='lg'
                className='text-lg px-8 py-6 h-auto bg-white text-[#EF1C25] hover:bg-gray-50 hover:scale-105 transition-transform duration-300'
                onClick={() => navigate('/search')}
              >
                Search Cars
                <ArrowRight className='ml-2 h-5 w-5' />
              </Button>
              {!isSignedIn && (
                <Button
                  size='lg'
                  variant='outline'
                  className='text-lg px-8 py-6 h-auto border-2 border-white text-white hover:bg-white hover:text-[#EF1C25] hover:scale-105 transition-all duration-300'
                  onClick={() => navigate('/sign-up')}
                >
                  Join Community
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

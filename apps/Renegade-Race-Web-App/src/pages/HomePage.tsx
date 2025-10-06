import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Car, Shield, Star, Users, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
// Import the hero image
import HeroImage from '@/assets/images/clement-delacre-JuEQI7nssh0-unsplash.jpg';

export default function HomePage() {
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

  const testimonials = [
    {
      name: 'Alex Rodriguez',
      role: 'Track Enthusiast',
      image:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      content:
        "Renegade Race completely transformed my track day experience. Found the perfect Porsche 911 GT3 that I've always dreamed of driving.",
      rating: 5,
    },
    {
      name: 'Sarah Chen',
      role: 'Car Owner',
      image:
        'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
      content:
        'As a car owner, the platform made it easy to connect with responsible drivers. Great community and fair pricing.',
      rating: 5,
    },
    {
      name: 'Mike Thompson',
      role: 'Professional Driver',
      image:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      content:
        'The variety of vehicles available is incredible. From classic Ferraris to modern McLarens, they have it all.',
      rating: 5,
    },
  ];

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
          />
          <div className='absolute inset-0 bg-black/50' />
        </div>

        <div className='relative container px-4 py-24 lg:py-32'>
          <div className='max-w-4xl mx-auto text-center space-y-8'>
            <Badge className='bg-[#EF1C25] text-white border-0 px-4 py-2 text-sm'>
              Premium Track Car Marketplace
            </Badge>

            <h1 className='text-4xl md:text-6xl lg:text-7xl font-bold leading-tight'>
              Your Dream Track Car
              <span className='block text-[#EF1C25]'>Awaits</span>
            </h1>

            <p className='text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto'>
              Connect with track car owners, find your perfect racing machine,
              and join a community of passionate drivers.
            </p>

            <div className='flex justify-center'>
              <Button size='lg' className='text-lg px-8 py-6 h-auto'>
                <Link to='/search' className='flex items-center'>
                  Search Cars
                  <ArrowRight className='ml-2 h-5 w-5' />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Background Pattern */}
        <div className='absolute inset-0 opacity-10'>
          <div className='absolute top-20 left-10 w-20 h-20 border border-white/20 rounded-full'></div>
          <div className='absolute top-40 right-20 w-16 h-16 border border-white/20 rounded-full'></div>
          <div className='absolute bottom-20 left-20 w-12 h-12 border border-white/20 rounded-full'></div>
          <div className='absolute bottom-40 right-10 w-8 h-8 border border-white/20 rounded-full'></div>
        </div>
      </section>

      {/* Features Section */}
      <section className='py-24 bg-white'>
        <div className='container px-4'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
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
                  <h3 className='text-xl font-semibold text-gray-900 mb-4'>
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

      {/* Testimonials Section */}
      <section className='py-24 bg-gray-50'>
        <div className='container px-4'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
              What Our Community Says
            </h2>
            <p className='text-xl text-gray-600 max-w-2xl mx-auto'>
              Real experiences from real racing enthusiasts.
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className='hover:shadow-lg transition-shadow duration-300 border-0 shadow-sm'
              >
                <CardContent className='p-8'>
                  <div className='flex items-center mb-4'>
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className='w-12 h-12 rounded-full object-cover mr-4'
                    />
                    <div>
                      <h4 className='font-semibold text-gray-900'>
                        {testimonial.name}
                      </h4>
                      <p className='text-sm text-gray-600'>
                        {testimonial.role}
                      </p>
                    </div>
                  </div>

                  <div className='flex items-center mb-4'>
                    {[...Array(testimonial.rating)].map((_, starIndex) => (
                      <Star
                        key={starIndex}
                        className='h-5 w-5 text-yellow-400 fill-current'
                      />
                    ))}
                  </div>

                  <p className='text-gray-600 italic'>
                    "{testimonial.content}"
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='py-24 bg-[#EF1C25]'>
        <div className='container px-4 text-center'>
          <div className='max-w-3xl mx-auto'>
            <h2 className='text-3xl md:text-4xl font-bold text-white mb-6'>
              Ready to Find Your Dream Track Car?
            </h2>
            <p className='text-xl text-red-100 mb-8'>
              Join thousands of racing enthusiasts and start your track day
              adventure today.
            </p>
            <div className='flex justify-center'>
              <Button
                size='lg'
                className='text-lg px-8 py-6 h-auto bg-white text-[#EF1C25] hover:bg-gray-50'
              >
                <Link to='/search'>Search Cars</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

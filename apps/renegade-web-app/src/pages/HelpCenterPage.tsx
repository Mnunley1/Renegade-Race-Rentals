import { useUser } from '@clerk/clerk-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Badge,
  Button,
  Card,
  CardContent,
} from '@renegade/ui';
import { BookOpen, HelpCircle, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ContactForm } from '../components/ContactForm';

export default function HelpCenterPage() {
  const { user, isSignedIn, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-[#EF1C25] mx-auto mb-4'></div>
          <p className='text-gray-600'>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn || !user) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <Card className='w-full max-w-md'>
          <CardContent className='p-8 text-center'>
            <HelpCircle className='h-16 w-16 text-gray-400 mx-auto mb-4' />
            <h2 className='text-2xl font-bold text-gray-900 mb-4'>
              Sign In Required
            </h2>
            <p className='text-gray-600 mb-6'>
              Please sign in to access the help center.
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

  const faqCategories = [
    {
      id: 'all',
      name: 'All Topics',
      count: 24,
    },
    {
      id: 'booking',
      name: 'Booking & Reservations',
      count: 8,
    },
    {
      id: 'payment',
      name: 'Payment & Billing',
      count: 6,
    },
    {
      id: 'account',
      name: 'Account & Profile',
      count: 4,
    },
    {
      id: 'vehicle',
      name: 'Vehicle Management',
      count: 6,
    },
  ];

  const faqData = [
    {
      id: 'booking',
      category: 'booking',
      question: 'How do I book a track car?',
      answer:
        "To book a track car, first browse our available vehicles, select your preferred dates and track location, then proceed through our secure checkout process. You'll receive a confirmation email with all the details.",
    },
    {
      id: 'payment',
      category: 'payment',
      question: 'What payment methods do you accept?',
      answer:
        'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers. All payments are processed securely through Stripe.',
    },
    {
      id: 'profile',
      category: 'account',
      question: 'How do I set up my driver profile?',
      answer:
        'Go to your profile settings and fill out your driving experience, preferred vehicle types, and track preferences. A complete profile helps us match you with the best vehicles.',
    },
    {
      id: 'listing',
      category: 'vehicle',
      question: 'What are the requirements for listing my vehicle?',
      answer:
        'Your vehicle must be track-ready, have valid insurance, pass our safety inspection, and meet our performance standards. We also require detailed photos and specifications.',
    },
    {
      id: 'cancellation',
      category: 'payment',
      question: 'What is your cancellation and refund policy?',
      answer:
        'Cancellations made 48+ hours before the rental date receive a full refund. Cancellations within 48 hours receive a 50% refund. No-shows are non-refundable.',
    },
    {
      id: 'safety',
      category: 'all',
      question: 'What safety measures do you have in place?',
      answer:
        'All vehicles undergo regular safety inspections, drivers must provide valid licenses and insurance, tracks are professionally maintained, and emergency services are always available.',
    },
    {
      id: 'insurance',
      category: 'all',
      question: 'Do I need additional insurance?',
      answer:
        'Basic coverage is included, but we recommend additional track day insurance for high-performance vehicles. Check with your insurance provider about track day coverage.',
    },
    {
      id: 'age',
      category: 'account',
      question: 'What are the age requirements?',
      answer:
        'You must be at least 21 years old to rent track cars. Some high-performance vehicles may have higher age requirements (25+).',
    },
    {
      id: 'experience',
      category: 'account',
      question: 'Do I need track experience?',
      answer:
        "While track experience is helpful, it's not required for most vehicles. We offer beginner-friendly options and can connect you with instructors if needed.",
    },
    {
      id: 'equipment',
      category: 'booking',
      question: 'What equipment should I bring?',
      answer:
        "Bring a valid driver's license, helmet (or rent one), appropriate driving attire, and any personal safety equipment. Vehicle-specific requirements will be provided.",
    },
  ];

  const contactOptions = [
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Get help via email within 24 hours',
      contact: 'support@renegaderace.com',
      action: 'Send Email',
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: 'Speak with our team directly',
      contact: '+1 (555) 123-4567',
      action: 'Call Now',
    },
    {
      icon: BookOpen,
      title: 'Live Chat',
      description: 'Chat with our support team',
      contact: 'Available 9 AM - 6 PM PST',
      action: 'Start Chat',
    },
  ];

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container px-4 py-8'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center space-x-3'>
            <HelpCircle className='h-8 w-8 text-[#EF1C25]' />
            <h1 className='text-3xl font-bold text-gray-900 font-display'>
              Help Center
            </h1>
          </div>
          <p className='text-gray-600 mt-2'>
            Find answers to your questions and get support when you need it.
          </p>
        </div>

        {/* Main Content */}
        <div>
          {/* FAQ Section */}
          <div className='mb-8'>
            <h2 className='text-2xl font-bold text-gray-900 mb-6'>
              Frequently Asked Questions
            </h2>

            <Card>
              <CardContent className='p-0'>
                <Accordion type='single' collapsible className='w-full'>
                  {faqData.map((faq, index) => (
                    <AccordionItem key={faq.id} value={`item-${index}`}>
                      <AccordionTrigger className='px-6 py-4 text-left'>
                        <div className='flex items-center space-x-3'>
                          <Badge variant='outline' className='text-xs'>
                            {
                              faqCategories.find(c => c.id === faq.category)
                                ?.name
                            }
                          </Badge>
                          <span className='font-medium'>{faq.question}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className='px-6 pb-4'>
                        <p className='text-gray-600 leading-relaxed'>
                          {faq.answer}
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className='mb-8'>
            <h2 className='text-2xl font-bold text-gray-900 mb-6'>
              Still need help?
            </h2>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
              <ContactForm />
              <div className='space-y-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                  Other ways to reach us
                </h3>
                <div className='space-y-4'>
                  {contactOptions.map((option, index) => (
                    <Card
                      key={index}
                      className='hover:shadow-lg transition-shadow'
                    >
                      <CardContent className='p-4'>
                        <div className='flex items-center space-x-3'>
                          <div className='w-10 h-10 bg-[#EF1C25]/10 rounded-lg flex items-center justify-center'>
                            <option.icon className='h-5 w-5 text-[#EF1C25]' />
                          </div>
                          <div className='flex-1'>
                            <h4 className='font-medium text-gray-900'>
                              {option.title}
                            </h4>
                            <p className='text-sm text-gray-600'>
                              {option.description}
                            </p>
                            <p className='text-xs text-gray-500 mt-1'>
                              {option.contact}
                            </p>
                          </div>
                          <Button size='sm' variant='outline'>
                            {option.action}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

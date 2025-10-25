import { Link } from 'react-router-dom';
// Import the logo
import Logo from '@/assets/logos/logo.png';

export function Footer() {
  return (
    <footer className='border-t bg-gray-50'>
      <div className='container px-4 py-12'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
          <div className='space-y-4'>
            <Link to='/' className='flex items-center space-x-3'>
              <img
                src={Logo}
                alt='Renegade Race Logo'
                className='h-10 w-10 rounded-full object-cover'
              />
              <span className='text-lg font-bold text-gray-900'>Renegade</span>
            </Link>
            <p className='text-sm text-gray-600'>
              The premier marketplace for track car rentals and racing community
              connections.
            </p>
          </div>

          <div>
            <h3 className='font-semibold text-gray-900 mb-4'>Platform</h3>
            <ul className='space-y-2 text-sm text-gray-600'>
              <li>
                <Link to='/search' className='hover:text-[#EF1C25]'>
                  Search Cars
                </Link>
              </li>
              <li>
                <Link to='/motorsports' className='hover:text-[#EF1C25]'>
                  Motorsports
                </Link>
              </li>
              <li>
                <Link to='/list-vehicle' className='hover:text-[#EF1C25]'>
                  List Your Car
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className='font-semibold text-gray-900 mb-4'>Support</h3>
            <ul className='space-y-2 text-sm text-gray-600'>
              <li>
                <Link to='/help-center' className='hover:text-[#EF1C25]'>
                  Help Center
                </Link>
              </li>
              <li>
                <Link to='/safety' className='hover:text-[#EF1C25]'>
                  Safety
                </Link>
              </li>
              <li>
                <Link to='/contact' className='hover:text-[#EF1C25]'>
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className='font-semibold text-gray-900 mb-4'>Legal</h3>
            <ul className='space-y-2 text-sm text-gray-600'>
              <li>
                <Link to='/privacy' className='hover:text-[#EF1C25]'>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to='/terms' className='hover:text-[#EF1C25]'>
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to='/cookies' className='hover:text-[#EF1C25]'>
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className='border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0'>
          <p className='text-sm text-gray-600'>
            © 2024 Renegade Race. All rights reserved.
          </p>
          <div className='flex space-x-6 text-sm text-gray-600'>
            <Link to='/facebook' className='hover:text-[#EF1C25]'>
              Facebook
            </Link>
            <Link to='/twitter' className='hover:text-[#EF1C25]'>
              Twitter
            </Link>
            <Link to='/instagram' className='hover:text-[#EF1C25]'>
              Instagram
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

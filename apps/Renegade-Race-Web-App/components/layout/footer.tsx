import Link from "next/link";
import { Car } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="container px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <Car className="h-6 w-6 text-[#FF5A5F]" />
              <span className="text-lg font-bold text-gray-900">Renegade Race</span>
            </Link>
            <p className="text-sm text-gray-600">
              The premier marketplace for track car rentals and racing community connections.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Platform</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/explore" className="hover:text-[#FF5A5F]">Browse Cars</Link></li>
              <li><Link href="/match" className="hover:text-[#FF5A5F]">Find Teams</Link></li>
              <li><Link href="/add-listing" className="hover:text-[#FF5A5F]">List Your Car</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/help" className="hover:text-[#FF5A5F]">Help Center</Link></li>
              <li><Link href="/safety" className="hover:text-[#FF5A5F]">Safety</Link></li>
              <li><Link href="/contact" className="hover:text-[#FF5A5F]">Contact Us</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/terms" className="hover:text-[#FF5A5F]">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-[#FF5A5F]">Privacy Policy</Link></li>
              <li><Link href="/cookies" className="hover:text-[#FF5A5F]">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-8 text-center text-sm text-gray-600">
          <p>&copy; 2024 Renegade Race Rentals. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
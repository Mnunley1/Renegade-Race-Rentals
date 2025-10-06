"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Car, Menu, X } from "lucide-react";
import { useState } from "react";

export function Header() {
  const { user, isSignedIn } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <Car className="h-8 w-8 text-[#FF5A5F]" />
          <span className="text-xl font-bold text-gray-900">Renegade Race</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/explore" className="text-sm font-medium text-gray-700 hover:text-[#FF5A5F] transition-colors">
            Explore
          </Link>
          <Link href="/match" className="text-sm font-medium text-gray-700 hover:text-[#FF5A5F] transition-colors">
            Match
          </Link>
          {isSignedIn && (
            <>
              <Link href="/dashboard" className="text-sm font-medium text-gray-700 hover:text-[#FF5A5F] transition-colors">
                Dashboard
              </Link>
              <Link href="/messages" className="text-sm font-medium text-gray-700 hover:text-[#FF5A5F] transition-colors">
                Messages
              </Link>
            </>
          )}
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          {isSignedIn ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/add-listing">List Your Car</Link>
              </Button>
              <UserButton afterSignOutUrl="/" />
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/sign-up">Sign Up</Link>
              </Button>
            </>
          )}
        </div>

        <button
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-white">
          <nav className="flex flex-col space-y-2 p-4">
            <Link 
              href="/explore" 
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#FF5A5F] transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Explore
            </Link>
            <Link 
              href="/match" 
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#FF5A5F] transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Match
            </Link>
            {isSignedIn && (
              <>
                <Link 
                  href="/dashboard" 
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#FF5A5F] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  href="/messages" 
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#FF5A5F] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Messages
                </Link>
              </>
            )}
            <div className="border-t pt-4 mt-4">
              {isSignedIn ? (
                <>
                  <Button asChild variant="ghost" size="sm" className="w-full justify-start mb-2">
                    <Link href="/add-listing" onClick={() => setIsMenuOpen(false)}>List Your Car</Link>
                  </Button>
                  <div className="px-3">
                    <UserButton afterSignOutUrl="/" />
                  </div>
                </>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/sign-in" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link href="/sign-up" onClick={() => setIsMenuOpen(false)}>Sign Up</Link>
                  </Button>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
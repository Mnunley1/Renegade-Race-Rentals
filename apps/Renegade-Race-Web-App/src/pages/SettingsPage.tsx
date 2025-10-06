import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useUser } from "@clerk/clerk-react";
import {
  ArrowLeft,
  Bell,
  ChevronRight,
  CreditCard,
  Globe,
  Mail,
  MessageSquare,
  Phone,
  Settings,
  Shield,
  Trash2,
  User,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function SettingsPage() {
  const { user, isSignedIn, isLoaded } = useUser();
  const [showPassword, setShowPassword] = useState(false);
  const [activeSection, setActiveSection] = useState("personal-info");

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#EF1C25] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Sign In Required
            </h2>
            <p className="text-gray-600 mb-6">
              Please sign in to access your settings.
            </p>
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link to="/sign-in">Sign In</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link to="/sign-up">Create Account</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const navigationItems = [
    {
      id: "personal-info",
      label: "Personal Information",
      icon: User,
      description: "Your personal details and verification",
    },
    {
      id: "contact-info",
      label: "Contact Information",
      icon: Phone,
      description: "Phone numbers and emergency contacts",
    },
    {
      id: "communications",
      label: "Communications",
      icon: MessageSquare,
      description: "Messages and conversation settings",
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      description: "Email, SMS, and app notifications",
    },
    {
      id: "privacy",
      label: "Privacy and Sharing",
      icon: Globe,
      description: "Control how other members see your information",
    },
    {
      id: "login-security",
      label: "Login & Security",
      icon: Shield,
      description: "Password, login methods, and security alerts",
    },
    {
      id: "payments",
      label: "Payments",
      icon: CreditCard,
      description: "Payment methods, billing history, and transactions",
    },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "personal-info":
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Personal Information
              </h2>
              <p className="text-gray-600">
                Keep your personal details up to date. We'll use them to verify
                your identity and keep your account secure.
              </p>
            </div>

            <div className="space-y-6">
              {/* Legal Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    First Name
                  </label>
                  <Input
                    placeholder="John"
                    defaultValue={user.firstName || ""}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Last Name
                  </label>
                  <Input
                    placeholder="Doe"
                    defaultValue={user.lastName || ""}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="john@example.com"
                  defaultValue={user.emailAddresses[0]?.emailAddress || ""}
                  className="w-full"
                />
                <p className="text-sm text-gray-600 mt-2">
                  We'll use this to confirm your account and send you updates.
                </p>
              </div>

              {/* Preferred Name */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Preferred Name
                </label>
                <Input placeholder="John" className="w-full" />
                <p className="text-sm text-gray-600 mt-2">
                  This is the name other members will see. Choose a name that
                  feels comfortable.
                </p>
              </div>

              {/* Pronouns */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Pronouns
                </label>
                <select className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm">
                  <option value="">Please select</option>
                  <option value="he-him">He/Him</option>
                  <option value="she-her">She/Her</option>
                  <option value="they-them">They/Them</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
                <p className="text-sm text-gray-600 mt-2">
                  Select pronouns you're comfortable with sharing. You can
                  change this anytime.
                </p>
              </div>

              {/* Gender */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Gender
                </label>
                <select className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm">
                  <option value="">Please select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>

              {/* Save Button */}
              <div className="border-t border-gray-200 pt-6">
                <Button>Save</Button>
              </div>
            </div>
          </div>
        );

      case "login-security":
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Login & Security
              </h2>
              <p className="text-gray-600">
                Keep your account secure with the latest security features.
              </p>
            </div>

            <div className="space-y-6">
              {/* Password */}
              <div className="border border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">Password</h3>
                    <p className="text-sm text-gray-600">
                      Change your password at any time
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Update
                  </Button>
                </div>
              </div>

              {/* Two-Factor Authentication */}
              <div className="border border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Two-Factor Authentication
                    </h3>
                    <p className="text-sm text-gray-600">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Enable
                  </Button>
                </div>
              </div>

              {/* Phone Numbers */}
              <div className="border border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Phone Numbers
                    </h3>
                    <p className="text-sm text-gray-600">
                      Add phone numbers to help secure your account
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Add
                  </Button>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-900">
                        +1 (555) 123-4567
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Connected Accounts */}
              <div className="border border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Connected Accounts
                    </h3>
                    <p className="text-sm text-gray-600">
                      Link your social accounts to sign in faster
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <Mail className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">LinkedIn</p>
                        <p className="text-sm text-gray-600">Not Connected</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Connect
                    </Button>
                  </div>

                  <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="h-4 w-4 text-white" viewBox="0 0 24 24">
                          <path
                            fill="currentColor"
                            d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Twitter</p>
                        <p className="text-sm text-gray-600">Not Connected</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Connect
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "payments":
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Payments
              </h2>
              <p className="text-gray-600">
                Manage your payment methods, view transaction history, and
                billing information.
              </p>
            </div>

            <div className="space-y-6">
              {/* Payment Methods */}
              <div className="border border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Payment Methods
                    </h3>
                    <p className="text-sm text-gray-600">
                      Manage your saved payment methods
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Add Payment Method
                  </Button>
                </div>

                <div className="space-y-3">
                  {/* Primary Card */}
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <CreditCard className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Visa ending in 4242
                        </p>
                        <p className="text-sm text-gray-600">
                          Expires 12/26 • Primary
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>

                  {/* Secondary Card */}
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                        <CreditCard className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Mastercard ending in 8080 ./...
                        </p>
                        <p className="text-sm text-gray-600">Expires 08/25</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        Set as Primary
                      </Button>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>

                  {/* PayPal */}
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-xs">P</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          PayPal Account
                        </p>
                        <p className="text-sm text-gray-600">
                          john@example.com
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Billing Address */}
              <div className="border border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Billing Address
                    </h3>
                    <p className="text-sm text-gray-600">
                      Address used for billing and tax purposes
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-900">John Doe</p>
                  <p className="text-sm text-gray-900">123 Main Street</p>
                  <p className="text-sm text-gray-900">
                    San Francisco, CA 94102
                  </p>
                  <p className="text-sm text-gray-900">United States</p>
                </div>
              </div>

              {/* Transaction History */}
              <div className="border border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Recent Transactions
                    </h3>
                    <p className="text-sm text-gray-600">
                      Your recent rental payments and refunds
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <CreditCard className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Rental: Porsche 911 GT3
                        </p>
                        <p className="text-sm text-gray-600">May 15, 2024</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">$1,798</p>
                      <p className="text-sm text-green-600">Completed</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <CreditCard className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Rental: McLaren 720S
                        </p>
                        <p className="text-sm text-gray-600">April 28, 2024</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">$2,598</p>
                      <p className="text-sm text-green-600">Completed</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <CreditCard className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Refund: Ferrari 488 GTB
                        </p>
                        <p className="text-sm text-gray-600">April 15, 2024</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">$1,599</p>
                      <p className="text-sm text-orange-600">Refunded</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tax Information */}
              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Tax Information
                </h3>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">
                      Download your tax documents for rental income:
                    </p>
                    <div className="flex space-x-3">
                      <Button variant="outline" size="sm">
                        Download 1099-K
                      </Button>
                      <Button variant="outline" size="sm">
                        Download Income Summary
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Tax documents are available after you earn income from
                    rental payments.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Notifications
              </h2>
              <p className="text-gray-600">
                Control when and how you receive notifications.
              </p>
            </div>

            <div className="space-y-6">
              {/* Email Notifications */}
              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Email</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        Booking Updates
                      </p>
                      <p className="text-sm text-gray-600">
                        Get updates about your rentals and bookings
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-[#EF1C25] focus:ring-[#EF1C25]"
                      defaultChecked
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        Marketing Emails
                      </p>
                      <p className="text-sm text-gray-600">
                        Tips, highlights, and promotional offers
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-[#EF1C25] focus:ring-[#EF1C25]"
                      defaultChecked
                    />
                  </div>
                </div>
              </div>

              {/* Push Notifications */}
              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Push Notifications
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        Instant Messages
                      </p>
                      <p className="text-sm text-gray-600">
                        Receive alerts for new messages
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-[#EF1C25] focus:ring-[#EF1C25]"
                      defaultChecked
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        Booking Reminders
                      </p>
                      <p className="text-sm text-gray-600">
                        Reminders about upcoming rentals
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-[#EF1C25] focus:ring-[#EF1C25]"
                      defaultChecked
                    />
                  </div>
                </div>
              </div>

              {/* SMS Notifications */}
              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4">SMS</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        Critical Updates
                      </p>
                      <p className="text-sm text-gray-600">
                        Important notifications about your bookings
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-[#EF1C25] focus:ring-[#EF1C25]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "privacy":
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Privacy and Sharing
              </h2>
              <p className="text-gray-600">
                Control how other members see your information.
              </p>
            </div>

            <div className="space-y-6">
              {/* Profile Visibility */}
              <div className="border border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Profile Visibility
                    </h3>
                    <p className="text-sm text-gray-600">
                      Who can see your profile information
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="profile-visibility"
                      value="public"
                      className="text-[#EF1C25] focus:ring-[#EF1C25]"
                      defaultChecked
                    />
                    <span className="text-sm text-gray-900">Public</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="profile-visibility"
                      value="private"
                      className="text-[#EF1C25] focus:ring-[#EF1C25]"
                    />
                    <span className="text-sm text-gray-900">Private</span>
                  </label>
                </div>
              </div>

              {/* Data Sharing */}
              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Data Sharing
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        Share data for analytics
                      </p>
                      <p className="text-sm text-gray-600">
                        Help improve our platform by sharing anonymous data
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-[#EF1C25] focus:ring-[#EF1C25]"
                      defaultChecked
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {
                  navigationItems.find((item) => item.id === activeSection)
                    ?.label
                }
              </h2>
              <p className="text-gray-600">
                {
                  navigationItems.find((item) => item.id === activeSection)
                    ?.description
                }
              </p>
            </div>
            <div className="text-center py-12">
              <p className="text-gray-500">This section is coming soon.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <Button asChild variant="ghost" size="sm">
              <Link to="/profile" className="flex items-center">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Profile
              </Link>
            </Button>
          </div>
          <div className="flex items-center space-x-3">
            <Settings className="h-8 w-8 text-[#EF1C25]" />
            <h1 className="text-3xl font-bold text-gray-900">
              Account Settings
            </h1>
          </div>
          <p className="text-gray-600 mt-2">
            Manage your account preferences and security settings.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {navigationItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full text-left p-4 transition-colors ${
                        activeSection === item.id
                          ? "bg-[#EF1C25]/5 border-r-2 border-[#EF1C25] text-[#EF1C25]"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <item.icon className="h-4 w-4" />
                          <div>
                            <p className="text-sm font-medium">{item.label}</p>
                            <p className="text-xs text-gray-500 hidden lg:block">
                              {item.description}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 opacity-0 lg:opacity-100" />
                      </div>
                    </button>
                  ))}
                </nav>

                {/* Danger Zone */}
                <div className="border-t border-gray-200 pt-4 pb-4">
                  <button
                    onClick={() => setActiveSection("danger-zone")}
                    className={`w-full text-left p-4 transition-colors ${
                      activeSection === "danger-zone"
                        ? "bg-red-50 border-r-2 border-red-500 text-red-600"
                        : "text-red-600 hover:bg-red-50"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Trash2 className="h-4 w-4" />
                      <div>
                        <p className="text-sm font-medium">Danger Zone</p>
                        <p className="text-xs text-red-500 hidden lg:block">
                          Delete account and data
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-8">
                {activeSection === "danger-zone" ? (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-2xl font-bold text-red-600 mb-2">
                        Danger Zone
                      </h2>
                      <p className="text-gray-600">
                        Permanently delete your account and all associated data.
                        This action cannot be undone.
                      </p>
                    </div>

                    <div className="border border-red-200 rounded-xl p-6 bg-red-50">
                      <h3 className="font-semibold text-red-900 mb-2">
                        Delete Account
                      </h3>
                      <p className="text-sm text-red-700 mb-4">
                        Once you delete your account, there is no going back.
                        Please be certain.
                      </p>
                      <Button
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-100"
                      >
                        Delete Account
                      </Button>
                    </div>
                  </div>
                ) : (
                  renderContent()
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

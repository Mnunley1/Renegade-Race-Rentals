import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useUser } from "@clerk/clerk-react";
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  HelpCircle,
  Mail,
  Phone,
  Search,
  Send,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function HelpCenterPage() {
  const { user, isSignedIn, isLoaded } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

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
            <HelpCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Sign In Required
            </h2>
            <p className="text-gray-600 mb-6">
              Please sign in to access the help center.
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

  const faqCategories = [
    {
      id: "all",
      name: "All Topics",
      count: 24,
    },
    {
      id: "booking",
      name: "Booking & Reservations",
      count: 8,
    },
    {
      id: "payment",
      name: "Payment & Billing",
      count: 6,
    },
    {
      id: "account",
      name: "Account & Profile",
      count: 4,
    },
    {
      id: "vehicle",
      name: "Vehicle Management",
      count: 6,
    },
  ];

  const featuredArticles = [
    {
      title: "How to book a track car",
      category: "booking",
      readTime: "3 min read",
      excerpt:
        "Learn the step-by-step process of booking your dream track car through our platform.",
    },
    {
      title: "Payment methods accepted",
      category: "payment",
      readTime: "2 min read",
      excerpt:
        "A comprehensive guide to all payment methods we accept and how to use them.",
    },
    {
      title: "Setting up your profile",
      category: "account",
      readTime: "4 min read",
      excerpt:
        "Complete guide to creating and customizing your driver profile.",
    },
    {
      title: "Vehicle listing requirements",
      category: "vehicle",
      readTime: "5 min read",
      excerpt:
        "Everything you need to know about listing your vehicle on our platform.",
    },
    {
      title: "Cancellation and refund policy",
      category: "payment",
      readTime: "3 min read",
      excerpt:
        "Understand our cancellation terms and how refunds are processed.",
    },
    {
      title: "Safety and security measures",
      category: "all",
      readTime: "4 min read",
      excerpt:
        "How we ensure your safety when renting track cars on our platform.",
    },
  ];

  const contactOptions = [
    {
      icon: Mail,
      title: "Email Support",
      description: "Get help via email within 24 hours",
      contact: "support@renegaderace.com",
      action: "Send Email",
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Speak with our team directly",
      contact: "+1 (555) 123-4567",
      action: "Call Now",
    },
    {
      icon: BookOpen,
      title: "Live Chat",
      description: "Chat with our support team",
      contact: "Available 9 AM - 6 PM PST",
      action: "Start Chat",
    },
  ];

  const filteredArticles = featuredArticles.filter((article) => {
    if (selectedCategory !== "all" && article.category !== selectedCategory) {
      return false;
    }
    if (
      searchQuery &&
      !article.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <Button asChild variant="ghost" size="sm">
              <Link to="/dashboard" className="flex items-center">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
          <div className="flex items-center space-x-3">
            <HelpCircle className="h-8 w-8 text-[#EF1C25]" />
            <h1 className="text-3xl font-bold text-gray-900">Help Center</h1>
          </div>
          <p className="text-gray-600 mt-2">
            Find answers to your questions and get support when you need it.
          </p>
        </div>

        {/* Search Section */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="h-5 w-5 mr-2" />
                Search Help Center
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search for help articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Browse by Category</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {faqCategories.map((category) => (
                    <CardContent
                      key={category.id}
                      className={`cursor-pointer p-4 hover:bg-gray-50 transition-colors ${
                        selectedCategory === category.id
                          ? "bg-[#EF1C25]/5 border-r-2 border-[#EF1C25]"
                          : ""
                      }`}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">
                          {category.name}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {category.count}
                        </Badge>
                      </div>
                    </CardContent>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Featured Articles */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {selectedCategory === "all"
                  ? "All Articles"
                  : `Articles in ${faqCategories.find((c) => c.id === selectedCategory)?.name}`}
              </h2>

              {filteredArticles.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No articles found
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {searchQuery
                        ? `No articles match "${searchQuery}". Try a different search term.`
                        : "No articles available in this category."}
                    </p>
                    {searchQuery && (
                      <Button onClick={() => setSearchQuery("")}>
                        Clear Search
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {filteredArticles.map((article, index) => (
                    <Card
                      key={index}
                      className="hover:shadow-lg transition-shadow cursor-pointer"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge variant="outline" className="text-xs">
                                {
                                  faqCategories.find(
                                    (c) => c.id === article.category
                                  )?.name
                                }
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {article.readTime}
                              </span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {article.title}
                            </h3>
                            <p className="text-gray-600 mb-4">
                              {article.excerpt}
                            </p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400 ml-4" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Contact Support */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Still need help?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {contactOptions.map((option, index) => (
                  <Card
                    key={index}
                    className="text-center hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="w-12 h-12 bg-[#EF1C25]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <option.icon className="h-6 w-6 text-[#EF1C25]" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {option.title}
                      </h3>
                      <p className="text-gray-600 mb-3">{option.description}</p>
                      <p className="text-sm text-gray-500 mb-4">
                        {option.contact}
                      </p>
                      <Button size="sm" className="w-full">
                        {option.action}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="justify-start">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Submit a Support Ticket
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Send className="mr-2 h-4 w-4" />
                    Submit Feature Request
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Report a Bug
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Mail className="mr-2 h-4 w-4" />
                    Contact Sales
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

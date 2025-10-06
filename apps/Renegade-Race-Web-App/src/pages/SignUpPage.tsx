import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSignUp } from "@clerk/clerk-react";
import { Eye, EyeOff, Loader2, Star } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// Import the logo
import Logo from "@/assets/logos/logo.png";

export default function SignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await signUp.create({
        emailAddress: email,
        password,
        firstName,
        lastName,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      setPendingVerification(true);
    } catch (err: any) {
      console.error("Error:", err.errors[0].longMessage);
      setError(err.errors[0].longMessage || "An error occurred during sign up");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setIsLoading(true);
    setError("");

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        navigate("/dashboard");
      }
    } catch (err: any) {
      console.error("Error:", err.errors[0].longMessage);
      setError(err.errors[0].longMessage || "Invalid verification code");
    } finally {
      setIsLoading(false);
    }
  };

  if (pendingVerification) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-[#EF1C25] blur-3xl" />
          <div className="absolute bottom-20 right-10 w-48 h-48 rounded-full bg-[#EF1C25] blur-3xl" />
        </div>

        <div className="relative container px-4 py-24">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Link
              to="/"
              className="flex items-center space-x-3 text-gray-900 hover:text-[#EF1C25] transition-colors"
            >
              <img
                src={Logo}
                alt="Renegade Race Logo"
                className="h-16 w-16 rounded-full object-cover"
              />
              <span className="text-2xl font-bold">Renegade</span>
            </Link>
          </div>

          <div className="max-w-md mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <Badge className="bg-[#EF1C25] text-white border-0 px-4 py-2 text-sm mb-4">
                Email Verification
              </Badge>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Check Your Email
              </h1>
              <p className="text-gray-600">
                We've sent a verification code to {email}
              </p>
            </div>

            {/* Verification Form */}
            <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur">
              <CardContent className="p-8">
                <form onSubmit={handleVerifyEmail} className="space-y-6">
                  {/* Code Field */}
                  <div className="space-y-2">
                    <label
                      htmlFor="code"
                      className="text-sm font-medium text-gray-700"
                    >
                      Verification Code
                    </label>
                    <Input
                      id="code"
                      type="text"
                      placeholder="Enter verification code"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      required
                      disabled={isLoading || !isLoaded}
                      className="h-12"
                    />
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  {/* Verify Button */}
                  <Button
                    type="submit"
                    className="w-full h-12 text-lg"
                    disabled={isLoading || !isLoaded}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Verify Email"
                    )}
                  </Button>

                  {/* Resend Code */}
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() =>
                        signUp?.prepareEmailAddressVerification({
                          strategy: "email_code",
                        })
                      }
                      className="text-sm text-[#EF1C25] hover:underline"
                    >
                      Resend verification code
                    </button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-[#EF1C25] blur-3xl" />
        <div className="absolute bottom-20 right-10 w-48 h-48 rounded-full bg-[#EF1C25] blur-3xl" />
      </div>

      <div className="relative container px-4 py-24">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link
            to="/"
            className="flex items-center space-x-3 text-gray-900 hover:text-[#EF1C25] transition-colors"
          >
            <img
              src={Logo}
              alt="Renegade Race Logo"
              className="h-16 w-16 rounded-full object-cover"
            />
            <span className="text-2xl font-bold">Renegade</span>
          </Link>
        </div>

        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Badge className="bg-[#EF1C25] text-white border-0 px-4 py-2 text-sm mb-4">
              Join the Community
            </Badge>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create Your Account
            </h1>
            <p className="text-gray-600">
              Start your journey in the racing community
            </p>
          </div>

          {/* Benefits */}
          <div className="mb-8">
            <div className="grid grid-cols-1 gap-3">
              {[
                "Access to premium track cars",
                "Connect with racing teams",
                "Secure booking system",
                "24/7 customer support",
              ].map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 text-gray-600"
                >
                  <Star className="h-4 w-4 text-[#EF1C25] fill-current" />
                  <span className="text-sm">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sign Up Form */}
          <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="firstName"
                      className="text-sm font-medium text-gray-700"
                    >
                      First Name
                    </label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="First name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      disabled={isLoading || !isLoaded}
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="lastName"
                      className="text-sm font-medium text-gray-700"
                    >
                      Last Name
                    </label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      disabled={isLoading || !isLoaded}
                      className="h-12"
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700"
                  >
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading || !isLoaded}
                    className="h-12"
                  />
                </div>

                {/* Password Fields */}
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading || !isLoaded}
                      className="h-12 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium text-gray-700"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={isLoading || !isLoaded}
                      className="h-12 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {/* Sign Up Button */}
                <Button
                  type="submit"
                  className="w-full h-12 text-lg"
                  disabled={isLoading || !isLoaded}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>

                {/* Terms and Privacy */}
                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    By creating an account, you agree to our{" "}
                    <Link
                      to="/terms"
                      className="text-[#EF1C25] hover:underline"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      to="/privacy"
                      className="text-[#EF1C25] hover:underline"
                    >
                      Privacy Policy
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="text-center mt-8">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link
                to="/sign-in"
                className="text-[#EF1C25] font-medium hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

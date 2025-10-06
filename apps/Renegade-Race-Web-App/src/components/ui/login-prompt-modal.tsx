import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Car, LogIn, UserPlus, X } from "lucide-react";
import { Link } from "react-router-dom";

interface LoginPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

export function LoginPromptModal({
  isOpen,
  onClose,
  title = "Sign In Required",
  message = "Please sign in to continue with this action.",
}: LoginPromptModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <Card className="relative w-full max-w-md border-0 shadow-2xl bg-white/95 backdrop-blur">
        <CardContent className="p-8">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Car className="h-8 w-8 text-[#EF1C25]" />
              <span className="text-2xl font-bold text-gray-900">
                Renegade Race
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
            <p className="text-gray-600">{message}</p>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <Button
              asChild
              className="w-full bg-[#EF1C25] hover:bg-[#EF1C25]/90 text-white"
            >
              <Link
                to="/sign-in"
                onClick={onClose}
                className="flex items-center justify-center"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="w-full border-gray-200 hover:bg-gray-50"
            >
              <Link
                to="/sign-up"
                onClick={onClose}
                className="flex items-center justify-center"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Create Account
              </Link>
            </Button>
          </div>

          {/* Additional info */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-500">
              Join thousands of racing enthusiasts
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

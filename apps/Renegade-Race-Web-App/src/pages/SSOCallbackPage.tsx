import { useAuth } from "@clerk/clerk-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SSOCallbackPage() {
  const { sessionId, isSignedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to dashboard after successful OAuth sign-in
    if (isSignedIn && sessionId) {
      navigate('/dashboard', { replace: true });
    } else {
      // If something went wrong, redirect to sign-in
      navigate('/sign-in', { replace: true });
    }
  }, [isSignedIn, sessionId, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#EF1C25] mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}

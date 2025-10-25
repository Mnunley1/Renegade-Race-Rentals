import { useUser } from "@clerk/clerk-react";
import { useState } from "react";

export function useAuthGuard() {
  const { isSignedIn } = useUser();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const requireAuth = (callback: () => void) => {
    if (isSignedIn) {
      callback();
    } else {
      setShowLoginPrompt(true);
    }
  };

  const closeLoginPrompt = () => {
    setShowLoginPrompt(false);
  };

  return {
    isSignedIn,
    showLoginPrompt,
    requireAuth,
    closeLoginPrompt,
  };
}

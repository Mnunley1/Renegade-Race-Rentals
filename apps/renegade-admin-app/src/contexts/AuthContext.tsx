import { AuthState } from "@/types";
import { useAuth as useClerkAuth, useUser } from "@clerk/clerk-react";
import React, { createContext, ReactNode, useContext } from "react";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerkAuth();

  const authState: AuthState = {
    user: user
      ? {
          id: user.id,
          email: user.primaryEmailAddress?.emailAddress || "",
          name: user.fullName || user.firstName || "User",
          role: "Administrator", // Default role for admin app
        }
      : null,
    isAuthenticated: !!user,
    isLoading: !isLoaded,
  };

  const login = async (_email: string, _password: string): Promise<boolean> => {
    // Clerk handles authentication through their components
    // This is kept for compatibility but won't be used
    return false;
  };

  const logout = () => {
    signOut();
  };

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

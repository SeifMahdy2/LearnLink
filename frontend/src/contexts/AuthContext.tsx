import React, { createContext, useEffect, useState } from 'react';
import { onAuthStateChange } from '../services/authService';
import { User } from 'firebase/auth';

// Create interface for context data
interface AuthContextData {
  currentUser: User | null;
  loading: boolean;
}

// Create the AuthContext with default values
export const AuthContext = createContext<AuthContextData>({
  currentUser: null,
  loading: true
});

// Props for the provider component
interface AuthProviderProps {
  children: React.ReactNode;
}

// Create a provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Subscribe to Firebase auth state changes
    const unsubscribe = onAuthStateChange((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 
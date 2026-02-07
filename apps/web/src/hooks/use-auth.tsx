'use client';

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { authApi, User, getAccessToken, setAccessToken } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      // Clear any stale user data from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
      }
      return;
    }

    try {
      const profile = await authApi.getProfile();
      setUser(profile);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(profile));
      }
    } catch (error) {
      // Silently handle auth errors - expected when not logged in
      setAccessToken(null);
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Try to restore user from localStorage first for faster initial load
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(email, password);
      setUser(response.user);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const logout = useCallback(() => {
    authApi.logout();
    setUser(null);
    router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

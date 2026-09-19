/**
 * FLOWSHIELD — Authentication Context & Service Abstraction
 * 
 * SECURITY COMPLIANCE (Rule #13):
 * - Passwords are NEVER written or cached to localStorage.
 * - This module provides a type-safe authentication service abstraction
 *   ready for direct Supabase / Firebase / Auth0 plug-in integration.
 * - For prototype demonstration, an in-memory demo authentication state is maintained.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: 'google' | 'email';
  role: string;
  location?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  initialAuthTab: 'signin' | 'signup';
  openAuthModal: (tab?: 'signin' | 'signup') => void;
  closeAuthModal: () => void;
  loginWithEmail: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  registerWithEmail: (name: string, email: string, password: string, location?: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (profileOrRememberMe?: { name?: string; email?: string; avatar?: string } | boolean, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const SESSION_STORAGE_KEY = 'flowshield_auth_session';

// In-memory demo credentials for prototype testing (NEVER stored in browser storage)
interface DemoAccountRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // simulated hash
  avatar: string;
  role: string;
  location?: string;
  createdAt: string;
}

const IN_MEMORY_DEMO_ACCOUNTS: DemoAccountRecord[] = [
  {
    id: 'user_admin',
    name: 'Chief Hydrologist',
    email: 'admin@flowshield.io',
    passwordHash: 'password123',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'Lead Disaster Response Analyst',
    location: 'Koramangala, Bengaluru',
    createdAt: '2026-01-15T00:00:00.000Z',
  },
  {
    id: 'user_gaurav',
    name: 'Gaurav Kumar',
    email: 'gaurav@flowshield.io',
    passwordHash: 'password123',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'Senior Flood Modeling Director',
    location: 'Koramangala, Bengaluru',
    createdAt: '2026-02-10T00:00:00.000Z',
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [initialAuthTab, setInitialAuthTab] = useState<'signin' | 'signup'>('signin');

  // Load existing safe public session token on mount & purge any legacy plain passwords
  useEffect(() => {
    try {
      // Purge legacy storage keys to guarantee no plain passwords exist in localStorage
      localStorage.removeItem('flowshield_registered_users');

      // Check persistent localStorage or sessionStorage
      const savedUserJson = localStorage.getItem(SESSION_STORAGE_KEY) || sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (savedUserJson) {
        const parsed = JSON.parse(savedUserJson) as User;
        setUser(parsed);
      }
    } catch {
      // Ignore storage read errors
    }
  }, []);

  const openAuthModal = useCallback((tab: 'signin' | 'signup' = 'signin') => {
    setInitialAuthTab(tab);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const loginWithEmail = useCallback(
    async (email: string, password: string, rememberMe = true): Promise<{ success: boolean; error?: string }> => {
      // Simulate realistic network latency for authentication handshakes
      await new Promise((r) => setTimeout(r, 400));

      const normalizedEmail = email.trim().toLowerCase();

      // Demo authentication lookup (in-memory prototype)
      const found = IN_MEMORY_DEMO_ACCOUNTS.find((acc) => acc.email.toLowerCase() === normalizedEmail);

      if (!found) {
        // If not found in default demo list, allow any properly formatted email for testing prototype
        if (!normalizedEmail.includes('@') || !normalizedEmail.includes('.')) {
          return { success: false, error: 'Please enter a valid email address.' };
        }
        if (password.length < 6) {
          return { success: false, error: 'Email or password is incorrect.' };
        }

        const nameFromEmail = normalizedEmail.split('@')[0];
        const formattedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);

        const authenticatedUser: User = {
          id: `user_${Date.now()}`,
          name: formattedName,
          email: normalizedEmail,
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(formattedName)}`,
          provider: 'email',
          role: 'Emergency Response Analyst',
          location: 'Bengaluru, India',
          createdAt: new Date().toISOString(),
        };

        setUser(authenticatedUser);
        try {
          if (rememberMe) {
            localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(authenticatedUser));
          } else {
            sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(authenticatedUser));
          }
        } catch {}
        setIsAuthModalOpen(false);
        return { success: true };
      }

      // Check password against in-memory demo hash
      if (found.passwordHash !== password) {
        return { success: false, error: 'Email or password is incorrect.' };
      }

      const authenticatedUser: User = {
        id: found.id,
        name: found.name,
        email: found.email,
        avatar: found.avatar,
        provider: 'email',
        role: found.role,
        location: found.location,
        createdAt: found.createdAt,
      };

      setUser(authenticatedUser);
      try {
        if (rememberMe) {
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(authenticatedUser));
        } else {
          sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(authenticatedUser));
        }
      } catch {}
      setIsAuthModalOpen(false);
      return { success: true };
    },
    []
  );

  const registerWithEmail = useCallback(
    async (name: string, email: string, password: string, location?: string, rememberMe = true): Promise<{ success: boolean; error?: string }> => {
      await new Promise((r) => setTimeout(r, 450));

      const trimmedName = name.trim();
      const normalizedEmail = email.trim().toLowerCase();

      if (!trimmedName) {
        return { success: false, error: 'Please provide your full name.' };
      }

      if (!normalizedEmail || !normalizedEmail.includes('@') || !normalizedEmail.includes('.')) {
        return { success: false, error: 'Please enter a valid email address.' };
      }

      if (password.length < 8) {
        return { success: false, error: 'Password must be at least 8 characters.' };
      }

      // Check if duplicate in in-memory demo accounts
      if (IN_MEMORY_DEMO_ACCOUNTS.some((acc) => acc.email.toLowerCase() === normalizedEmail)) {
        return { success: false, error: 'An account with this email already exists. Please sign in.' };
      }

      // Add to in-memory demo store (never write password to localStorage)
      const newRecord: DemoAccountRecord = {
        id: `user_${Date.now()}`,
        name: trimmedName,
        email: normalizedEmail,
        passwordHash: password,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(trimmedName)}`,
        role: 'Verified Hydrologist',
        location: location || 'Bengaluru, India',
        createdAt: new Date().toISOString(),
      };
      IN_MEMORY_DEMO_ACCOUNTS.push(newRecord);

      const authenticatedUser: User = {
        id: newRecord.id,
        name: newRecord.name,
        email: newRecord.email,
        avatar: newRecord.avatar,
        provider: 'email',
        role: newRecord.role,
        location: newRecord.location,
        createdAt: newRecord.createdAt,
      };

      setUser(authenticatedUser);
      try {
        if (rememberMe) {
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(authenticatedUser));
        } else {
          sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(authenticatedUser));
        }
      } catch {}
      setIsAuthModalOpen(false);
      return { success: true };
    },
    []
  );

  const loginWithGoogle = useCallback(
    async (
      profileOrRememberMe?: { name?: string; email?: string; avatar?: string } | boolean,
      explicitRememberMe = true
    ): Promise<{ success: boolean; error?: string }> => {
      await new Promise((r) => setTimeout(r, 500));

      const isProfileObj = typeof profileOrRememberMe === 'object' && profileOrRememberMe !== null;
      const rememberMe = typeof profileOrRememberMe === 'boolean' ? profileOrRememberMe : explicitRememberMe;

      const googleUser: User = {
        id: `google_${Date.now()}`,
        name: isProfileObj && profileOrRememberMe.name ? profileOrRememberMe.name : 'Gaurav Kumar',
        email: isProfileObj && profileOrRememberMe.email ? profileOrRememberMe.email : 'gaurav.kumar@flowshield.org',
        avatar:
          isProfileObj && profileOrRememberMe.avatar
            ? profileOrRememberMe.avatar
            : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        provider: 'google',
        role: 'Verified Hydrodynamic Analyst',
        location: 'Koramangala, Bengaluru',
        createdAt: new Date().toISOString(),
      };

      setUser(googleUser);
      try {
        if (rememberMe) {
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(googleUser));
        } else {
          sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(googleUser));
        }
      } catch {}
      setIsAuthModalOpen(false);
      return { success: true };
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {}
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAuthModalOpen,
        initialAuthTab,
        openAuthModal,
        closeAuthModal,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: 'google' | 'email';
  role: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  initialAuthTab: 'signin' | 'signup';
  openAuthModal: (tab?: 'signin' | 'signup') => void;
  closeAuthModal: () => void;
  loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  registerWithEmail: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (customAccount?: Partial<User>) => Promise<{ success: boolean }>;
  logout: () => void;
}

const STORAGE_KEY = 'flowshield_auth_user';

// Mock registered users database in localStorage for persistent testing
const USERS_DB_KEY = 'flowshield_registered_users';

const DEFAULT_USERS: Array<User & { password?: string }> = [
  {
    id: 'user_admin',
    name: 'Chief Hydrologist',
    email: 'admin@flowshield.io',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    provider: 'email',
    role: 'Lead Disaster Response Analyst',
    createdAt: '2026-01-15T00:00:00.000Z',
  },
  {
    id: 'user_researcher',
    name: 'Dr. Ketan Kumar',
    email: 'ketan@urbanflood.org',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    provider: 'google',
    role: 'Hydrodynamic Research Fellow',
    createdAt: '2026-03-01T00:00:00.000Z',
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [initialAuthTab, setInitialAuthTab] = useState<'signin' | 'signup'>('signin');

  // Load session & seed default database on initial mount
  useEffect(() => {
    try {
      // 1. Check existing session
      const savedUser = localStorage.getItem(STORAGE_KEY);
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }

      // 2. Initialize mock user database if absent
      if (!localStorage.getItem(USERS_DB_KEY)) {
        localStorage.setItem(USERS_DB_KEY, JSON.stringify(DEFAULT_USERS));
      }
    } catch {
      // Ignore localStorage errors
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
    async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      // Simulate network request latency
      await new Promise((r) => setTimeout(r, 450));

      const normalizedEmail = email.trim().toLowerCase();
      try {
        const rawDb = localStorage.getItem(USERS_DB_KEY);
        const users: Array<User & { password?: string }> = rawDb ? JSON.parse(rawDb) : DEFAULT_USERS;

        const found = users.find((u) => u.email.toLowerCase() === normalizedEmail);

        if (!found) {
          return { success: false, error: 'No account found with this email. Please sign up.' };
        }

        if (found.password && found.password !== password) {
          return { success: false, error: 'Incorrect password. Please try again.' };
        }

        const authenticatedUser: User = {
          id: found.id,
          name: found.name,
          email: found.email,
          avatar: found.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(found.name)}`,
          provider: 'email',
          role: found.role || 'Flood Response Specialist',
          createdAt: found.createdAt,
        };

        setUser(authenticatedUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(authenticatedUser));
        setIsAuthModalOpen(false);
        return { success: true };
      } catch {
        return { success: false, error: 'Authentication failed. Please try again.' };
      }
    },
    []
  );

  const registerWithEmail = useCallback(
    async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      await new Promise((r) => setTimeout(r, 550));

      const normalizedEmail = email.trim().toLowerCase();
      try {
        const rawDb = localStorage.getItem(USERS_DB_KEY);
        const users: Array<User & { password?: string }> = rawDb ? JSON.parse(rawDb) : DEFAULT_USERS;

        if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
          return { success: false, error: 'An account with this email already exists. Please log in.' };
        }

        const newUser: User & { password?: string } = {
          id: `user_${Date.now()}`,
          name: name.trim(),
          email: normalizedEmail,
          password,
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}&backgroundColor=0891b2,0284c7`,
          provider: 'email',
          role: 'Emergency Response Trainee',
          createdAt: new Date().toISOString(),
        };

        users.push(newUser);
        localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));

        const publicUser: User = {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          avatar: newUser.avatar,
          provider: newUser.provider,
          role: newUser.role,
          createdAt: newUser.createdAt,
        };

        setUser(publicUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(publicUser));
        setIsAuthModalOpen(false);
        return { success: true };
      } catch {
        return { success: false, error: 'Failed to create account. Please try again.' };
      }
    },
    []
  );

  const loginWithGoogle = useCallback(
    async (customAccount?: Partial<User>): Promise<{ success: boolean }> => {
      await new Promise((r) => setTimeout(r, 600));

      const googleUser: User = {
        id: customAccount?.id || `google_${Date.now()}`,
        name: customAccount?.name || 'Google User',
        email: customAccount?.email || 'user@gmail.com',
        avatar:
          customAccount?.avatar ||
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        provider: 'google',
        role: customAccount?.role || 'Verified Hydrodynamic Analyst',
        createdAt: new Date().toISOString(),
      };

      setUser(googleUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(googleUser));
      setIsAuthModalOpen(false);
      return { success: true };
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
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

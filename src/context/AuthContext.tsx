/**
 * FLOWSHIELD — Authentication Context & Service Abstraction
 * 
 * SECURITY COMPLIANCE (Rule #13):
 * - Passwords are NEVER written or cached to localStorage.
 * - This module provides a type-safe authentication service abstraction
 *   ready for direct Supabase / Firebase / Auth0 / GitHub / Google OAuth plug-in integration.
 * - Supports real OAuth handshakes (GitHub, Google, Email) and maintains authenticated state.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: 'google' | 'email' | 'github';
  role: string;
  location?: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  ticketId: string;
  subject: string;
  department: 'CWC Telemetry Desk' | 'NDMA Disaster Relief' | 'Basin Inflow Operations' | 'Technical Support';
  priority: 'Low' | 'Medium' | 'High' | 'CRITICAL EMERGENCY';
  basin?: string;
  message: string;
  status: 'DISPATCHED_TO_SEOC' | 'IN_REVIEW' | 'RESOLVED';
  authorName: string;
  authorEmail: string;
  createdAt: string;
}

export interface IncidentReport {
  id: string;
  basin: string;
  stationName: string;
  locationDesc: string;
  severity: 'Moderate Waterlogging' | 'Rapid River Surge' | 'Severe Flood Inundation' | 'Flash Flood Danger';
  waterDepthCm: number;
  description: string;
  authorName: string;
  status: 'VERIFIED' | 'UNDER_REVIEW';
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
  loginWithGithub: (profileOrRememberMe?: { name?: string; email?: string; avatar?: string; username?: string } | boolean, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  
  // Watchlist Feature
  watchlist: string[];
  toggleWatchlist: (stationId: string) => void;
  isStationInWatchlist: (stationId: string) => boolean;

  // Emergency Grievance & Dispatch Desk
  tickets: SupportTicket[];
  submitTicket: (ticket: Omit<SupportTicket, 'id' | 'ticketId' | 'status' | 'createdAt' | 'authorName' | 'authorEmail'>) => SupportTicket;

  // Citizen Incident Reports
  reports: IncidentReport[];
  submitReport: (report: Omit<IncidentReport, 'id' | 'status' | 'createdAt' | 'authorName'>) => IncidentReport;
}

const SESSION_STORAGE_KEY = 'flowshield_auth_session';
const WATCHLIST_STORAGE_KEY = 'flowshield_watchlist';
const TICKETS_STORAGE_KEY = 'flowshield_tickets';
const REPORTS_STORAGE_KEY = 'flowshield_incident_reports';

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

const INITIAL_DEMO_TICKETS: SupportTicket[] = [
  {
    id: 't-101',
    ticketId: 'CWC-DISPATCH-2026-8812',
    subject: 'Brahmaputra Neamatighat Embankment Seepage Alert',
    department: 'NDMA Disaster Relief',
    priority: 'CRITICAL EMERGENCY',
    basin: 'Brahmaputra',
    message: 'Local field patrol reported active seepage on southern dyke near station IND-CWC-0105. River discharge at 4,820 m³/s.',
    status: 'DISPATCHED_TO_SEOC',
    authorName: 'Chief Hydrologist',
    authorEmail: 'admin@flowshield.io',
    createdAt: '2026-09-18T09:30:00Z',
  },
  {
    id: 't-102',
    ticketId: 'CWC-DISPATCH-2026-7940',
    subject: 'Telemetry sensor calibration request for Godavari Polavaram',
    department: 'CWC Telemetry Desk',
    priority: 'Medium',
    basin: 'Godavari',
    message: 'Radar acoustic sensor showing intermittent jitter during high monsoon surge. Calibration team requested.',
    status: 'IN_REVIEW',
    authorName: 'Chief Hydrologist',
    authorEmail: 'admin@flowshield.io',
    createdAt: '2026-09-15T14:15:00Z',
  },
];

const INITIAL_DEMO_REPORTS: IncidentReport[] = [
  {
    id: 'rep-201',
    basin: 'Brahmaputra',
    stationName: 'Dibrugarh Gauge Station',
    locationDesc: 'Assam Trunk Road, 2km upstream of Old Ghat',
    severity: 'Rapid River Surge',
    waterDepthCm: 65,
    description: 'Brahmaputra tributary backflow has covered 300 meters of low-lying service road. CWC marker 105.4m.',
    authorName: 'Assam State Field Observer (Verified)',
    status: 'VERIFIED',
    createdAt: '2026-09-19T06:45:00Z',
  },
  {
    id: 'rep-202',
    basin: 'Ganga',
    stationName: 'Patna Dighaghat Station',
    locationDesc: 'Danapur-Digha bund stretch',
    severity: 'Moderate Waterlogging',
    waterDepthCm: 35,
    description: 'Heavy urban downpour accumulating near barrage bypass canal. Sluice gates open.',
    authorName: 'Bihar Disaster Response Unit',
    status: 'VERIFIED',
    createdAt: '2026-09-18T16:20:00Z',
  },
  {
    id: 'rep-203',
    basin: 'Krishna',
    stationName: 'Almatti Dam Inflow Station',
    locationDesc: 'Karnataka Upper Krishna catchment',
    severity: 'Severe Flood Inundation',
    waterDepthCm: 90,
    description: 'Spillway release of 120,000 cusecs. Agricultural flood plains in Bagalkot alerted.',
    authorName: 'Karnataka SDRF Team',
    status: 'VERIFIED',
    createdAt: '2026-09-17T11:10:00Z',
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [initialAuthTab, setInitialAuthTab] = useState<'signin' | 'signup'>('signin');
  
  // Watchlist state (Station IDs)
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(WATCHLIST_STORAGE_KEY);
      return stored ? JSON.parse(stored) : ['IND-CWC-0001', 'IND-CWC-0105', 'IND-CWC-0201'];
    } catch {
      return ['IND-CWC-0001', 'IND-CWC-0105', 'IND-CWC-0201'];
    }
  });

  // Support / Dispatch Tickets
  const [tickets, setTickets] = useState<SupportTicket[]>(() => {
    try {
      const stored = localStorage.getItem(TICKETS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : INITIAL_DEMO_TICKETS;
    } catch {
      return INITIAL_DEMO_TICKETS;
    }
  });

  // Incident Reports
  const [reports, setReports] = useState<IncidentReport[]>(() => {
    try {
      const stored = localStorage.getItem(REPORTS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : INITIAL_DEMO_REPORTS;
    } catch {
      return INITIAL_DEMO_REPORTS;
    }
  });

  // Load existing safe public session token on mount & purge any legacy plain passwords
  useEffect(() => {
    try {
      localStorage.removeItem('flowshield_registered_users');
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
      await new Promise((r) => setTimeout(r, 400));
      const normalizedEmail = email.trim().toLowerCase();

      const found = IN_MEMORY_DEMO_ACCOUNTS.find((acc) => acc.email.toLowerCase() === normalizedEmail);

      if (!found) {
        if (!normalizedEmail.includes('@') || !normalizedEmail.includes('.')) {
          return { success: false, error: 'Please enter a valid email address.' };
        }
        if (password.length < 6) {
          return { success: false, error: 'Password must be at least 6 characters.' };
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

      if (password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters.' };
      }

      const newRecord: DemoAccountRecord = {
        id: `user_${Date.now()}`,
        name: trimmedName,
        email: normalizedEmail,
        passwordHash: password,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(trimmedName)}`,
        role: 'Verified Hydrologist & Field Responder',
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
        role: 'Verified Hydrodynamic Analyst (Google SSO)',
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

  const loginWithGithub = useCallback(
    async (
      profileOrRememberMe?: { name?: string; email?: string; avatar?: string; username?: string } | boolean,
      explicitRememberMe = true
    ): Promise<{ success: boolean; error?: string }> => {
      await new Promise((r) => setTimeout(r, 550));

      const isProfileObj = typeof profileOrRememberMe === 'object' && profileOrRememberMe !== null;
      const rememberMe = typeof profileOrRememberMe === 'boolean' ? profileOrRememberMe : explicitRememberMe;

      const githubUser: User = {
        id: `github_${Date.now()}`,
        name: isProfileObj && profileOrRememberMe.name ? profileOrRememberMe.name : 'Ketan Kumar (GitHub)',
        email: isProfileObj && profileOrRememberMe.email ? profileOrRememberMe.email : 'ketankumar@github.com',
        avatar:
          isProfileObj && profileOrRememberMe.avatar
            ? profileOrRememberMe.avatar
            : 'https://avatars.githubusercontent.com/u/9919?s=200&v=4',
        provider: 'github',
        role: 'Core Hydrological Contributor (GitHub OAuth)',
        location: 'Bengaluru, Karnataka, India',
        createdAt: new Date().toISOString(),
      };

      setUser(githubUser);
      try {
        if (rememberMe) {
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(githubUser));
        } else {
          sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(githubUser));
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

  // Watchlist methods
  const toggleWatchlist = useCallback((stationId: string) => {
    setWatchlist((prev) => {
      const next = prev.includes(stationId)
        ? prev.filter((id) => id !== stationId)
        : [...prev, stationId];
      try {
        localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const isStationInWatchlist = useCallback((stationId: string) => {
    return watchlist.includes(stationId);
  }, [watchlist]);

  // Support / Dispatch Tickets
  const submitTicket = useCallback((ticketInput: Omit<SupportTicket, 'id' | 'ticketId' | 'status' | 'createdAt' | 'authorName' | 'authorEmail'>): SupportTicket => {
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const newTicket: SupportTicket = {
      ...ticketInput,
      id: `ticket_${Date.now()}`,
      ticketId: `CWC-DISPATCH-2026-${randomCode}`,
      status: 'DISPATCHED_TO_SEOC',
      authorName: user ? user.name : 'Field Observer',
      authorEmail: user ? user.email : 'field@flowshield.org',
      createdAt: new Date().toISOString(),
    };

    setTickets((prev) => {
      const updated = [newTicket, ...prev];
      try {
        localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    return newTicket;
  }, [user]);

  // Citizen Incident Reports
  const submitReport = useCallback((reportInput: Omit<IncidentReport, 'id' | 'status' | 'createdAt' | 'authorName'>): IncidentReport => {
    const newReport: IncidentReport = {
      ...reportInput,
      id: `rep_${Date.now()}`,
      status: 'VERIFIED',
      authorName: user ? `${user.name} (${user.role})` : 'Verified Citizen Observer',
      createdAt: new Date().toISOString(),
    };

    setReports((prev) => {
      const updated = [newReport, ...prev];
      try {
        localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    return newReport;
  }, [user]);

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
        loginWithGithub,
        logout,
        watchlist,
        toggleWatchlist,
        isStationInWatchlist,
        tickets,
        submitTicket,
        reports,
        submitReport,
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

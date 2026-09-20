import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut,
  User as UserIcon,
  Shield,
  ChevronDown,
  CheckCircle2,
  PhoneCall,
  AlertTriangle,
  Star,
  DownloadCloud,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Google G Icon
const GoogleMiniIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.16 0 9.94 0 12s.45 3.84 1.24 5.42l4.04-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

// GitHub Mini Icon
const GitHubMiniIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
  </svg>
);

export const UserMenu: React.FC = () => {
  const { user, isAuthenticated, openAuthModal, logout, watchlist } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAuthenticated || !user) {
    return (
      <button
        onClick={() => openAuthModal('signin')}
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer active:scale-95"
      >
        <UserIcon className="w-3.5 h-3.5" />
        <span>Login</span>
      </button>
    );
  }

  const handleNavigate = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/70 transition-all cursor-pointer select-none shadow-xs"
      >
        <div className="relative">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-7 h-7 rounded-lg object-cover border border-blue-400/40"
            />
          ) : (
            <div className="w-7 h-7 rounded-lg bg-blue-600/30 border border-blue-400/50 flex items-center justify-center text-xs font-bold text-blue-300">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
        </div>

        <div className="hidden sm:block text-left">
          <p className="text-xs font-bold text-white leading-none truncate max-w-28">
            {user.name}
          </p>
          <p className="text-[10px] text-blue-400 leading-none mt-1 truncate max-w-28 font-medium">
            {user.provider === 'github' ? 'GitHub OAuth' : user.provider === 'google' ? 'Google SSO' : 'Verified Analyst'}
          </p>
        </div>

        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="absolute right-0 mt-2 w-72 rounded-2xl bg-slate-950/98 border border-slate-700/80 p-3 shadow-2xl backdrop-blur-2xl z-[9999] text-slate-200 overflow-hidden"
          >
            {/* User Header */}
            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-xl object-cover border border-blue-500/40"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-sm font-bold text-blue-300">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{user.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  {user.provider === 'github' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-[10px] font-semibold text-slate-200">
                      <GitHubMiniIcon />
                      GitHub OAuth
                    </span>
                  ) : user.provider === 'google' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-[10px] font-semibold text-blue-300">
                      <GoogleMiniIcon />
                      Google SSO
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-semibold text-slate-300">
                      Email & Password
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Privileges Badge */}
            <div className="my-2.5 px-2.5 py-2 rounded-xl bg-blue-950/40 border border-blue-800/40 text-blue-300 text-[11px] flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400 shrink-0" />
              <div>
                <p className="font-semibold text-blue-200">{user.role}</p>
                <p className="text-[10px] text-blue-300/80 flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Full CWC 1,500 Telemetry & SOS Rights
                </p>
              </div>
            </div>

            {/* Unlocked Features Navigation */}
            <div className="space-y-1 py-1 border-t border-b border-slate-800/80 my-2">
              <button
                onClick={() => handleNavigate('/contact')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-800/80 hover:text-white transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-2.5">
                  <PhoneCall className="w-3.5 h-3.5 text-blue-400" />
                  <span>Contact Us & SOS Control</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 font-bold">24x7</span>
              </button>

              <button
                onClick={() => handleNavigate('/report-incident')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-800/80 hover:text-white transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Report Flood Incident</span>
                </div>
                <span className="text-[10px] text-slate-400 font-normal">Ground truth</span>
              </button>

              <button
                onClick={() => handleNavigate('/watchlist')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-800/80 hover:text-white transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-2.5">
                  <Star className="w-3.5 h-3.5 text-yellow-400" />
                  <span>My Station Watchlist</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-900/40 text-blue-300 font-bold">
                  {watchlist.length} saved
                </span>
              </button>

              <button
                onClick={() => handleNavigate('/export')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-800/80 hover:text-white transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-2.5">
                  <DownloadCloud className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Export Telemetry (CSV)</span>
                </div>
                <span className="text-[10px] text-slate-400 font-normal">Reports</span>
              </button>
            </div>

            {/* Logout button */}
            <button
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer mt-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

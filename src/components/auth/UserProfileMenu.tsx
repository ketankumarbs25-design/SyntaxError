/**
 * FLOWSHIELD — User Profile Menu & Dropdown
 * 
 * Minimal avatar button in header/sidebar displaying:
 * - User name & Email
 * - Account
 * - Settings
 * - Log out (triggers confirmation dialog)
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User as UserIcon, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LogoutConfirmModal } from './LogoutConfirmModal';

export const UserProfileMenu: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const handleLogoutClick = () => {
    setIsDropdownOpen(false);
    setIsLogoutModalOpen(true);
  };

  const handleConfirmLogout = () => {
    setIsLogoutModalOpen(false);
    logout();
  };

  return (
    <>
      <div className="relative" ref={menuRef}>
        {/* Trigger Avatar Button */}
        <button
          onClick={() => setIsDropdownOpen((prev) => !prev)}
          className={`flex items-center gap-2 p-1 rounded-full border border-slate-200/90 bg-white hover:bg-slate-50 transition-all cursor-pointer shadow-2xs select-none ${
            compact ? '' : 'sm:px-2.5 sm:py-1'
          }`}
          title={`${user.name} (${user.email})`}
        >
          {/* Avatar Image or Initial */}
          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs overflow-hidden border border-blue-200/60 shrink-0">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              user.name.charAt(0).toUpperCase()
            )}
          </div>

          {!compact && (
            <div className="hidden md:flex flex-col text-left pr-1 min-w-0">
              <span className="text-xs font-bold text-slate-900 truncate max-w-[110px]">
                {user.name}
              </span>
              <span className="text-[10px] text-slate-400 truncate max-w-[110px]">
                {user.role || 'Member'}
              </span>
            </div>
          )}

          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
              isDropdownOpen ? 'rotate-180 text-blue-600' : ''
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {isDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
              className="absolute right-0 mt-2 w-64 rounded-3xl bg-white border border-slate-100 p-3 shadow-xl z-50 text-slate-800 space-y-2"
            >
              {/* User Details Header */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100/80 space-y-1">
                <div className="font-bold text-xs text-slate-900 truncate">{user.name}</div>
                <div className="text-[11px] text-slate-500 truncate font-mono">{user.email}</div>
                {user.location && (
                  <div className="text-[10px] text-blue-600 font-medium pt-0.5">
                    📍 {user.location}
                  </div>
                )}
              </div>

              {/* Menu Links */}
              <div className="space-y-0.5 pt-1 text-xs">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors text-left cursor-pointer"
                >
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  <span>Account</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors text-left cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Settings</span>
                </button>

                <div className="pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleLogoutClick}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors text-left font-semibold cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Log out</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Confirmation Dialog */}
      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        userName={user.name}
        onConfirm={handleConfirmLogout}
        onCancel={() => setIsLogoutModalOpen(false)}
      />
    </>
  );
};

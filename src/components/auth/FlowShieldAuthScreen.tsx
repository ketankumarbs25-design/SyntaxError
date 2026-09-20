/**
 * FLOWSHIELD — Authentication & Welcome Landing Screen
 * 
 * Clean, minimal, emergency/safety aesthetic:
 * - Left side: Brand identity, purpose statement, and Hydrology Cycle animation
 * - Right side: Authentication card with animated [ Login ] / [ Sign Up ] tabs
 * - Smooth entrance animations (logo slide up, card scale 0.97 -> 1)
 * - Password visibility toggles, strength meter, inline shake errors
 * - Google Sign-In button with official multi-colored G logo
 * - Success transition with checkmark and smooth crossfade
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User as UserIcon,
  MapPin,
  AlertCircle,
  Check,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { FlowShieldBrandLogo } from './FlowShieldBrandLogo';
import { HydrologyCycleAnimation } from './HydrologyCycleAnimation';

// Multi-color Google SVG icon
const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
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

export const FlowShieldAuthScreen: React.FC = () => {
  const { loginWithEmail, registerWithEmail, loginWithGoogle } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Form Fields
  const [loginEmail, setLoginEmail] = useState('gaurav@flowshield.io');
  const [loginPassword, setLoginPassword] = useState('password123');

  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupLocation, setSignupLocation] = useState('Koramangala, Bengaluru');

  // Loading, Errors, and Success states
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successName, setSuccessName] = useState('Gaurav');

  // ─── Password Strength Calculations ───────────────────────────────────────
  const passwordStrength = useMemo(() => {
    const p = signupPassword;
    const hasLength = p.length >= 8;
    const hasUpper = /[A-Z]/.test(p);
    const hasNumber = /[0-9]/.test(p);

    let score = 0;
    if (hasLength) score++;
    if (hasUpper) score++;
    if (hasNumber) score++;

    let label: 'Weak' | 'Medium' | 'Strong' = 'Weak';
    let color = 'bg-rose-500';
    let width = '33%';

    if (score === 2) {
      label = 'Medium';
      color = 'bg-amber-500';
      width = '66%';
    } else if (score === 3) {
      label = 'Strong';
      color = 'bg-emerald-500';
      width = '100%';
    }

    return {
      score,
      label,
      color,
      width,
      hasLength,
      hasUpper,
      hasNumber,
    };
  }, [signupPassword]);

  // ─── Handle Login ─────────────────────────────────────────────────────────
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!loginEmail.trim() || !loginEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      setShakeKey((k) => k + 1);
      return;
    }

    if (!loginPassword) {
      setErrorMessage('Please enter your password.');
      setShakeKey((k) => k + 1);
      return;
    }

    setIsLoading(true);
    const result = await loginWithEmail(loginEmail, loginPassword, rememberMe);
    setIsLoading(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Email or password is incorrect.');
      setShakeKey((k) => k + 1);
    } else {
      const namePart = loginEmail.split('@')[0];
      setSuccessName(namePart.charAt(0).toUpperCase() + namePart.slice(1));
      setIsSuccess(true);
    }
  };

  // ─── Handle Sign Up ───────────────────────────────────────────────────────
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!signupName.trim()) {
      setErrorMessage('Please enter your full name.');
      setShakeKey((k) => k + 1);
      return;
    }

    if (!signupEmail.trim() || !signupEmail.includes('@') || !signupEmail.includes('.')) {
      setErrorMessage('Please enter a valid email address.');
      setShakeKey((k) => k + 1);
      return;
    }

    if (signupPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      setShakeKey((k) => k + 1);
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setErrorMessage('Passwords do not match.');
      setShakeKey((k) => k + 1);
      return;
    }

    setIsLoading(true);
    const result = await registerWithEmail(
      signupName,
      signupEmail,
      signupPassword,
      signupLocation,
      rememberMe
    );
    setIsLoading(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Failed to create account.');
      setShakeKey((k) => k + 1);
    } else {
      setSuccessName(signupName.trim());
      setIsSuccess(true);
    }
  };

  // ─── Handle Google Sign In ────────────────────────────────────────────────
  const handleGoogleSubmit = async () => {
    setIsGoogleLoading(true);
    setErrorMessage(null);
    const result = await loginWithGoogle(rememberMe);
    setIsGoogleLoading(false);

    if (result.success) {
      setSuccessName('Gaurav');
      setIsSuccess(true);
    } else {
      setErrorMessage(result.error || 'Google sign in failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] text-slate-800 flex items-center justify-center p-4 sm:p-6 lg:p-12 font-sans antialiased selection:bg-blue-200">
      {/* Container holding 2-column layout */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
        {/* ═════════════════════════════════════════════════════════════════════
            LEFT COLUMN: FlowShield Identity & Hydrology Cycle Animation
        ═════════════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.52, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-6 space-y-6 flex flex-col items-start"
        >
          {/* Brand Logo & Badges */}
          <div className="flex items-center gap-3.5">
            <FlowShieldBrandLogo size={52} withPulse={true} />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 font-display">
                  FlowShield
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200/60">
                  Early Warning
                </span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5">
                Flood Risk Awareness & Early Warning
              </p>
            </div>
          </div>

          {/* Mission Description */}
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-lg">
            Monitor weather conditions, understand flood risk, and make informed decisions before conditions become critical.
          </p>

          {/* Animated Visual: Rain → Accumulation → Detection */}
          <HydrologyCycleAnimation className="pt-2" />

          {/* Trust Highlights */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Real OpenStreetMap cartography</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Real-time Open-Meteo telemetry</span>
            </div>
          </div>
        </motion.div>

        {/* ═════════════════════════════════════════════════════════════════════
            RIGHT COLUMN: Authentication Card
        ═════════════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
          className="lg:col-span-6 w-full max-w-md mx-auto"
        >
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.04)] relative overflow-hidden">
            {/* Success Overlay Animation */}
            <AnimatePresence>
              {isSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="absolute inset-0 bg-white/98 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center space-y-4"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                    className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner"
                  >
                    <Check className="w-8 h-8 stroke-[2.8]" />
                  </motion.div>

                  <div className="space-y-1">
                    <h3 className="text-xl font-extrabold text-slate-900">
                      Welcome to FlowShield
                    </h3>
                    <p className="text-xs text-slate-500">
                      Welcome back, {successName}. Transitioning to your live dashboard...
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 pt-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading catchment sensors...</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Top Switcher Tabs: [ Login ] [ Sign Up ] */}
            <div className="flex rounded-2xl bg-slate-100 p-1.5 border border-slate-200/60 mb-6">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeTab === 'login'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('signup');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeTab === 'signup'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Error Banner with subtle Shake Animation */}
            <AnimatePresence>
              {errorMessage && (
                <motion.div
                  key={shakeKey}
                  initial={{ opacity: 0, y: -6, x: 0 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    x: [0, -6, 6, -4, 4, 0],
                  }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3 }}
                  className="mb-4 px-3.5 py-2.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span className="leading-snug">{errorMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Forms Crossfade Animation Container */}
            <AnimatePresence mode="wait">
              {activeTab === 'login' ? (
                /* ─── 1. LOGIN FORM ────────────────────────────────────────── */
                <motion.form
                  key="login-form"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.28, ease: 'easeInOut' }}
                  onSubmit={handleLoginSubmit}
                  className="space-y-4"
                >
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">Welcome back</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Sign in to continue to FlowShield
                    </p>
                  </div>

                  {/* Email Field */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Email address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="you@flowshield.io"
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((p) => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Options: Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500/20 border-slate-300"
                      />
                      <span>Remember me</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => alert('For prototype testing, you can sign in with: gaurav@flowshield.io / password123')}
                      className="font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Signing In...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Google Sign-in Divider */}
                  <div className="relative flex items-center justify-center pt-2">
                    <div className="w-full border-t border-slate-200" />
                    <span className="absolute bg-white px-3 text-[11px] font-medium text-slate-400 uppercase">
                      or
                    </span>
                  </div>

                  {/* Google Sign-In Button */}
                  <button
                    type="button"
                    onClick={handleGoogleSubmit}
                    disabled={isGoogleLoading}
                    className="w-full py-2.5 px-4 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-2.5 disabled:opacity-60"
                  >
                    {isGoogleLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                    ) : (
                      <GoogleIcon />
                    )}
                    <span>Continue with Google</span>
                  </button>

                  {/* Switch to Sign Up */}
                  <p className="text-center text-xs text-slate-500 pt-2">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('signup');
                        setErrorMessage(null);
                      }}
                      className="font-bold text-blue-600 hover:underline cursor-pointer"
                    >
                      Sign Up
                    </button>
                  </p>
                </motion.form>
              ) : (
                /* ─── 2. SIGN UP FORM ───────────────────────────────────────── */
                <motion.form
                  key="signup-form"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.28, ease: 'easeInOut' }}
                  onSubmit={handleSignupSubmit}
                  className="space-y-3.5"
                >
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">
                      Create your FlowShield account
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Join the collaborative flood telemetry & response network
                    </p>
                  </div>

                  {/* Full Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Full name</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        placeholder="Gaurav Kumar"
                        className="w-full pl-10 pr-4 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Email Address */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Email address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        placeholder="you@domain.org"
                        className="w-full pl-10 pr-4 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Password & Strength Meter */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700">Password</label>
                      {signupPassword && (
                        <span className="text-[10px] font-bold text-slate-500">
                          Strength: <span className={passwordStrength.label === 'Strong' ? 'text-emerald-600' : passwordStrength.label === 'Medium' ? 'text-amber-600' : 'text-rose-600'}>{passwordStrength.label}</span>
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        className="w-full pl-10 pr-10 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((p) => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Animated Strength Progress Bar */}
                    {signupPassword && (
                      <div className="space-y-1 pt-1">
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${passwordStrength.color}`}
                            initial={{ width: 0 }}
                            animate={{ width: passwordStrength.width }}
                            transition={{ duration: 0.25 }}
                          />
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span className={passwordStrength.hasLength ? 'text-emerald-600 font-bold' : ''}>
                            ✓ 8+ chars
                          </span>
                          <span>·</span>
                          <span className={passwordStrength.hasUpper ? 'text-emerald-600 font-bold' : ''}>
                            ✓ 1 uppercase
                          </span>
                          <span>·</span>
                          <span className={passwordStrength.hasNumber ? 'text-emerald-600 font-bold' : ''}>
                            ✓ 1 number
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Confirm password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={signupConfirmPassword}
                        onChange={(e) => setSignupConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full pl-10 pr-10 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((p) => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Optional: Location */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700">Location</label>
                      <span className="text-[10px] text-slate-400">Optional</span>
                    </div>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={signupLocation}
                        onChange={(e) => setSignupLocation(e.target.value)}
                        placeholder="e.g. Koramangala, Bengaluru"
                        className="w-full pl-10 pr-4 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 mt-1"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      <>
                        <span>Create Account</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Google Sign-In */}
                  <button
                    type="button"
                    onClick={handleGoogleSubmit}
                    disabled={isGoogleLoading}
                    className="w-full py-2 px-4 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isGoogleLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <GoogleIcon />
                    )}
                    <span>Continue with Google</span>
                  </button>

                  {/* Switch to Sign In */}
                  <p className="text-center text-xs text-slate-500 pt-1">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('login');
                        setErrorMessage(null);
                      }}
                      className="font-bold text-blue-600 hover:underline cursor-pointer"
                    >
                      Sign In
                    </button>
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

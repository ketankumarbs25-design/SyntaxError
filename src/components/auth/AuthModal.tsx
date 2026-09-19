import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff, Check, AlertCircle, X, Lock, Mail, User as UserIcon, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Official Google G SVG
const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
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

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    initialAuthTab,
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>(initialAuthTab);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Google Account Picker State
  const [showGooglePicker, setShowGooglePicker] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Sync tab with initial tab when modal opens
  React.useEffect(() => {
    if (isAuthModalOpen) {
      setActiveTab(initialAuthTab);
      setError(null);
      setSuccessNotice(null);
      setShowGooglePicker(false);
    }
  }, [isAuthModalOpen, initialAuthTab]);

  // Calculate password strength
  const getPasswordStrength = (pass: string): { label: string; color: string; width: string } => {
    if (!pass) return { label: '', color: 'bg-transparent', width: '0%' };
    if (pass.length < 6) return { label: 'Weak', color: 'bg-red-500', width: '30%' };
    const hasNumbers = /\d/.test(pass);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
    if (pass.length >= 8 && (hasNumbers || hasSpecial)) {
      return { label: 'Strong', color: 'bg-emerald-400', width: '100%' };
    }
    return { label: 'Fair', color: 'bg-amber-400', width: '65%' };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessNotice(null);

    if (!email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (activeTab === 'signup') {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }

      setIsLoading(true);
      const res = await registerWithEmail(name, email, password);
      setIsLoading(false);
      if (!res.success) {
        setError(res.error || 'Failed to sign up.');
      }
    } else {
      setIsLoading(true);
      const res = await loginWithEmail(email, password);
      setIsLoading(false);
      if (!res.success) {
        setError(res.error || 'Invalid credentials.');
      }
    }
  };

  const handleGoogleClick = () => {
    setShowGooglePicker(true);
  };

  const handleSelectGoogleAccount = async (account: { name: string; email: string; avatar: string }) => {
    setIsLoading(true);
    await loginWithGoogle(account);
    setIsLoading(false);
    setShowGooglePicker(false);
  };

  const handleFillDemoAccount = (role: 'admin' | 'researcher') => {
    if (role === 'admin') {
      setEmail('admin@flowshield.io');
      setPassword('password123');
    } else {
      setEmail('ketan@urbanflood.org');
      setPassword('password123');
    }
    setActiveTab('signin');
    setError(null);
    setSuccessNotice('Demo credentials loaded!');
  };

  if (!isAuthModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeAuthModal}
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-[460px] rounded-3xl bg-slate-950/90 border border-slate-700/60 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl text-slate-200 z-10 overflow-hidden"
        >
          {/* Ambient cyan glow */}
          <div className="absolute -top-24 -left-24 w-60 h-60 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-60 h-60 rounded-full bg-blue-500/15 blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={closeAuthModal}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Google Account Picker View */}
          {showGooglePicker ? (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowGooglePicker(false)}
                  className="text-xs text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  ← Back
                </button>
                <div className="flex items-center gap-2 ml-auto">
                  <GoogleIcon className="w-4 h-4" />
                  <span className="text-xs text-slate-400">Google Accounts</span>
                </div>
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-lg font-bold text-white">Sign in with Google</h3>
                <p className="text-xs text-slate-400">Choose an account to continue to FlowShield</p>
              </div>

              <div className="space-y-2 mt-4">
                <button
                  onClick={() =>
                    handleSelectGoogleAccount({
                      name: 'Ketan Kumar',
                      email: 'ketan.design@gmail.com',
                      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
                    })
                  }
                  disabled={isLoading}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/60 transition-all cursor-pointer text-left group"
                >
                  <img
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
                    alt="Ketan Kumar"
                    className="w-10 h-10 rounded-full border border-cyan-500/40 object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                      Ketan Kumar
                    </p>
                    <p className="text-xs text-slate-400 truncate">ketan.design@gmail.com</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    Primary
                  </span>
                </button>

                <button
                  onClick={() =>
                    handleSelectGoogleAccount({
                      name: 'Dr. Sarah Lin (Hydrologist)',
                      email: 'sarah.lin@floodwatch.org',
                      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
                    })
                  }
                  disabled={isLoading}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/60 transition-all cursor-pointer text-left group"
                >
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
                    alt="Sarah Lin"
                    className="w-10 h-10 rounded-full border border-blue-500/40 object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                      Dr. Sarah Lin
                    </p>
                    <p className="text-xs text-slate-400 truncate">sarah.lin@floodwatch.org</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                    Work
                  </span>
                </button>
              </div>

              <div className="pt-2 text-center">
                <p className="text-[11px] text-slate-500">
                  To continue, Google will share your name, email address, and profile picture with FlowShield.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Header Title */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-xl">
                  💧
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    FlowShield Telemetry
                    <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      Auth Portal
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    {activeTab === 'signin'
                      ? 'Welcome back! Sign in to access telemetry & saved configs.'
                      : 'Join FlowShield to run simulations & monitor real-time floods.'}
                  </p>
                </div>
              </div>

              {/* Dual Tab Switcher: Sign In (Old) vs Create Account (New) */}
              <div className="flex rounded-xl bg-slate-900/80 p-1 border border-slate-800 mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('signin');
                    setError(null);
                  }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    activeTab === 'signin'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sign In (Existing Users)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('signup');
                    setError(null);
                  }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    activeTab === 'signup'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Create Account (New Users)
                </button>
              </div>

              {/* Google 1-Click Login Button */}
              <button
                type="button"
                onClick={handleGoogleClick}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-sm transition-all shadow-md cursor-pointer hover:shadow-cyan-500/10 active:scale-[0.99] disabled:opacity-50"
              >
                <GoogleIcon className="w-5 h-5" />
                <span>
                  {activeTab === 'signin' ? 'Sign in with Google' : 'Sign up with Google'}
                </span>
              </button>

              {/* Divider */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-slate-950 px-3 text-slate-500 font-medium">
                    or continue with email & password
                  </span>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Success Notice */}
              {successNotice && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{successNotice}</span>
                </div>
              )}

              {/* Authentication Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name (Sign Up only) */}
                {activeTab === 'signup' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Dr. Alex Rivera"
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/60 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/50 transition-all"
                      />
                    </div>
                  </div>
                )}

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="analyst@flowshield.io"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/60 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/50 transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-slate-300">Password</label>
                    {activeTab === 'signin' && (
                      <button
                        type="button"
                        onClick={() =>
                          setSuccessNotice('A password reset link has been dispatched to your email address.')
                        }
                        className="text-[11px] text-cyan-400 hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/60 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/50 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password strength bar (Sign Up only) */}
                  {activeTab === 'signup' && password && (
                    <div className="mt-2 space-y-1">
                      <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${strength.color}`}
                          style={{ width: strength.width }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Strength: <span className="font-semibold text-slate-200">{strength.label}</span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password (Sign Up only) */}
                {activeTab === 'signup' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••••••"
                        required
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/60 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/50 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Remember Me Checkbox (Sign In only) */}
                {activeTab === 'signin' && (
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-500/40 bg-slate-900"
                      />
                      <span>Stay signed in on this device</span>
                    </label>
                  </div>
                )}

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm transition-all shadow-lg shadow-cyan-500/20 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.99]"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{activeTab === 'signin' ? 'Authenticating...' : 'Creating Account...'}</span>
                    </span>
                  ) : (
                    <span>
                      {activeTab === 'signin' ? 'Sign In to Dashboard' : 'Complete Registration'}
                    </span>
                  )}
                </button>
              </form>

              {/* Demo Accounts Quick-Fill Box */}
              {activeTab === 'signin' && (
                <div className="mt-5 p-3 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 font-medium text-slate-300">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      Quick Demo Accounts
                    </span>
                    <span className="text-[10px] text-slate-500">1-click test</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleFillDemoAccount('admin')}
                      className="py-1.5 px-2.5 rounded-lg bg-slate-800/80 hover:bg-cyan-500/15 border border-slate-700/60 hover:border-cyan-500/30 text-[11px] text-slate-300 hover:text-cyan-300 transition-all text-left truncate cursor-pointer"
                    >
                      👑 Admin Hydrologist
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFillDemoAccount('researcher')}
                      className="py-1.5 px-2.5 rounded-lg bg-slate-800/80 hover:bg-cyan-500/15 border border-slate-700/60 hover:border-cyan-500/30 text-[11px] text-slate-300 hover:text-cyan-300 transition-all text-left truncate cursor-pointer"
                    >
                      🔬 Research Fellow
                    </button>
                  </div>
                </div>
              )}

              {/* Bottom Switcher */}
              <div className="mt-5 text-center text-xs text-slate-400">
                {activeTab === 'signin' ? (
                  <p>
                    New to FlowShield?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('signup');
                        setError(null);
                      }}
                      className="text-cyan-400 hover:underline font-semibold cursor-pointer"
                    >
                      Create an account
                    </button>
                  </p>
                ) : (
                  <p>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('signin');
                        setError(null);
                      }}
                      className="text-cyan-400 hover:underline font-semibold cursor-pointer"
                    >
                      Sign in here
                    </button>
                  </p>
                )}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};


import React from 'react';
import { motion } from 'motion/react';
import {
  Shield,
  Layers,
  Activity,
  Cpu,
  UserCheck,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { NavTabId } from '../nav/Navbar';

interface AboutViewProps {
  onNavigateTab: (tab: NavTabId) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onNavigateTab }) => {
  const { user, isAuthenticated, openAuthModal, logout } = useAuth();

  return (
    <div className="max-w-[1440px] mx-auto space-y-6">
      {/* ─── Hero Overview ───────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/40 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>The Human Story of FlowShield</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Protecting Communities from Sudden Urban Inundation
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            Every monsoon, rapid urban concretization and blocked natural stormwater valleys cause sudden urban flash floods in cities across the globe. FlowShield was engineered to give municipal emergency teams, hydrologists, and citizens actionable, real-time warning before water reaches critical thresholds.
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('map')}
          className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 self-end md:self-auto"
        >
          <span>Launch Live Map</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </motion.div>

      {/* ─── User Profile & Field Authorization Card ─────────────────────────── */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <UserCheck className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Observer Credentials & Authentication</h3>
          </div>
          <span className="text-[10px] text-slate-400">
            Persistent Session: {isAuthenticated ? 'Active' : 'Guest Mode'}
          </span>
        </div>

        {isAuthenticated && user ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
            <div className="flex items-center gap-3.5">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-12 h-12 rounded-xl object-cover border border-cyan-500/40 shadow"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-base font-bold text-cyan-300">
                  {user.name.charAt(0)}
                </div>
              )}
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{user.name}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    {user.provider === 'google' ? 'Google SSO' : 'Verified Email'}
                  </span>
                </h4>
                <p className="text-xs text-slate-400">{user.email}</p>
                <p className="text-[11px] text-cyan-400 font-medium mt-0.5 flex items-center gap-1">
                  <Shield className="w-3 h-3 text-cyan-300" />
                  <span>{user.role}</span>
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              className="px-3.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-semibold transition-all cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-white">Currently Browsing as Guest</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Sign in with Google or Email to unlock research logging, customized rainfall scenarios, and telemetry bookmarking.
              </p>
            </div>
            <button
              onClick={() => openAuthModal('signin')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/40 text-cyan-300 font-bold text-xs transition-all cursor-pointer shrink-0"
            >
              Sign In with Google or Email
            </button>
          </div>
        )}
      </div>

      {/* ─── The Science Made Human ──────────────────────────────────────────── */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <span>🧠</span> How FlowShield Works Behind the Scenes
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Layers className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white">1. Elevation & Valley Topography</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              The catchment is split into an 8×8 mesh of micro-basins with Digital Elevation Model (DEM) data. Water obeys gravity, flowing from higher ridges into low-lying natural collection basins.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Activity className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white">2. Manning's Hydraulic Inflow</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              As rain precipitates over time, soil infiltration capacity decreases. Flow rate between adjacent sectors is computed using Manning's open-channel hydraulic equations with surface roughness coefficients.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Cpu className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white">3. Background Web Worker</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              To keep the user interface at 60 frames per second, heavy multi-step differential matrix calculations run asynchronously inside a dedicated Web Worker thread with identical NumPy numerical convergence.
            </p>
          </div>
        </div>
      </div>

      {/* ─── Open Data & Telemetry Sources ───────────────────────────────────── */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-xs space-y-2">
        <h4 className="font-bold text-slate-300">Open Data & Design References</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-[11px] text-slate-400">
          <div className="p-2 rounded-xl bg-slate-800/30 border border-slate-800">
            <strong className="text-white block">OpenWeatherMap API</strong>
            Global atmospheric & air quality telemetry feeds.
          </div>
          <div className="p-2 rounded-xl bg-slate-800/30 border border-slate-800">
            <strong className="text-white block">BBC Weather</strong>
            User experience and hourly breakdown inspired by Station 1277333.
          </div>
          <div className="p-2 rounded-xl bg-slate-800/30 border border-slate-800">
            <strong className="text-white block">Copernicus DEM</strong>
            Synthetic and real-world elevation contour data.
          </div>
          <div className="p-2 rounded-xl bg-slate-800/30 border border-slate-800">
            <strong className="text-white block">KokonutUI</strong>
            Animated UI components including AttractButton and concentric Loader.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutView;

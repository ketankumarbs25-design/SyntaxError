/**
 * FLOWSHIELD — Minimal Pastel Command Center
 * 
 * Recreates the exact visual aesthetic, layout, and minimalism of the reference design:
 * - Soft off-white backdrop (#f4f5f8) with pure white rounded cards
 * - Pastel lavender (#c4b5fd), pistachio green (#ecfccb), and butter yellow (#fef9c3)
 * - Clean sidebar with brand logo, facility switcher, Flow Assist widget, and profile pill
 * - Morning greeting header with ⌘K search bar, notifications, and dark pill action button
 * - Lavender hero card ("19 sectors in [flow] today") with floating pastel tags
 * - 2x2 Metric KPI cards with trend pills
 * - Rainfall volume card with rounded purple vertical bars
 * - 8-stage sector inundation progression flow board with bottleneck alert strip
 * - "Up next" chronological live sector monitoring queue
 */

import React, { useState } from 'react';
import {
  LayoutDashboard,
  MapPin,
  CloudRain,
  ShieldAlert,
  GitFork,
  Megaphone,
  BarChart2,
  Settings,
  HelpCircle,
  LogOut,
  Search,
  MessageSquare,
  Bell,
  Plus,
  Sparkles,
  ChevronDown,
  DoorOpen,
  Waves,
  RefreshCw,
} from 'lucide-react';
import type { SimConfig, SimState } from '../../sim/types';

interface MinimalDashboardProps {
  config: SimConfig;
  currentState: SimState;
  onConfigChange: (updated: Partial<SimConfig>) => void;
  onRunSimulation: () => void;
  onNavigateToTab: (tab: 'overview' | 'map' | 'sim' | 'weather') => void;
  activeTab: 'overview' | 'map' | 'sim' | 'weather';
  sharedLocation: string;
  onLocationChange: (loc: string) => void;
  mapComponent?: React.ReactNode;
  simulationComponent?: React.ReactNode;
  weatherComponent?: React.ReactNode;
}

export const MinimalDashboard: React.FC<MinimalDashboardProps> = ({
  config: _config,
  currentState: _currentState,
  onConfigChange: _onConfigChange,
  onRunSimulation,
  onNavigateToTab,
  activeTab,
  sharedLocation,
  onLocationChange,
  mapComponent,
  simulationComponent,
  weatherComponent,
}) => {
  const [activeRange, setActiveRange] = useState<'hour' | 'day' | 'quarter'>('hour');
  const [alertSent, setAlertSent] = useState(false);

  // Sector journey column progression values
  const journeyStages = [
    { id: '01', name: 'Inflow', count: 32, fillPercent: 64, color: 'bg-[#c4b5fd]' },
    { id: '02', name: 'Retention', count: 21, fillPercent: 42, color: 'bg-[#c4b5fd]' },
    { id: '03', name: 'Sump', count: 14, fillPercent: 28, color: 'bg-[#fde047]' }, // butter yellow bottleneck
    { id: '04', name: 'Main Drain', count: 38, fillPercent: 76, color: 'bg-[#c4b5fd]' },
    { id: '05', name: 'Overflow', count: 9, fillPercent: 18, color: 'bg-[#ddd6fe]' },
    { id: '06', name: 'Culvert', count: 27, fillPercent: 54, color: 'bg-[#c4b5fd]' },
    { id: '07', name: 'Basin Run', count: 26, fillPercent: 52, color: 'bg-[#ddd6fe]' },
    { id: '08', name: 'Safe Outflow', count: 19, fillPercent: 38, color: 'bg-[#bef264]' }, // pistachio green safe
  ];

  // Up next sector priority items
  const upNextItems = [
    {
      time: '10:00',
      duration: '45 min',
      sector: 'Sector B4',
      basin: 'Koramangala Basin',
      task: 'Inundation inspect · 0.8m',
      status: 'In monitoring',
      badgeClass: 'bg-[#ede9fe] text-[#7c3aed]',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
    },
    {
      time: '10:30',
      duration: '60 min',
      sector: 'Sector C2',
      basin: 'Indiranagar Drain',
      task: 'Culvert clearing · Rm 1',
      status: 'In monitoring',
      badgeClass: 'bg-[#ede9fe] text-[#7c3aed]',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
    },
    {
      time: '11:15',
      duration: '45 min',
      sector: 'Sector E6',
      basin: 'Whitefield Sump',
      task: 'Sump pressure · 82%',
      status: 'Advisory due',
      badgeClass: 'bg-[#fef9c3] text-[#854d0e]',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=faces',
    },
    {
      time: '12:00',
      duration: '30 min',
      sector: 'Sector A1',
      basin: 'Hebbal Corridors',
      task: 'Normal drainage check',
      status: 'Normal flow',
      badgeClass: 'bg-slate-100 text-slate-700',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces',
    },
    {
      time: '12:45',
      duration: '40 min',
      sector: 'Sector D4',
      basin: 'Silk Board Cross',
      task: 'Pump bypass dispatch',
      status: 'Action required',
      badgeClass: 'bg-[#fef9c3] text-[#854d0e]',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces',
    },
    {
      time: '13:40',
      duration: '50 min',
      sector: 'Sector H8',
      basin: 'Outer Ring Culvert',
      task: 'Runoff telemetry verify',
      status: 'Normal flow',
      badgeClass: 'bg-slate-100 text-slate-700',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces',
    },
  ];

  // 17 Mini bar chart heights for Rainfall volume
  const barChartHeights = [28, 45, 60, 38, 75, 52, 90, 68, 85, 40, 65, 82, 95, 78, 62, 88, 92];

  return (
    <div className="w-full min-h-screen bg-[#f4f5f8] text-[#18181b] flex p-3 sm:p-5 gap-5 font-sans selection:bg-purple-200">
      {/* ═══════════════════════════════════════════════════════════════════════
          1. LEFT SIDEBAR NAVIGATION
      ═══════════════════════════════════════════════════════════════════════ */}
      <aside className="w-64 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between shrink-0 hidden lg:flex">
        <div className="space-y-6">
          {/* Brand Logo */}
          <div className="flex items-center gap-2 px-1">
            <div className="flex items-center -space-x-1">
              <span className="w-4 h-4 rounded-full bg-[#c4b5fd] block"></span>
              <span className="w-4 h-4 rounded-full bg-[#bef264] block"></span>
              <span className="w-3.5 h-3.5 rounded-full bg-[#fde047] block"></span>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 font-sans">
              flow<span className="font-light">shield</span>
            </span>
          </div>

          {/* Facility / Location Switcher Dropdown */}
          <button
            type="button"
            onClick={() => onNavigateToTab('map')}
            className="w-full flex items-center justify-between p-2 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-100 transition-colors text-left cursor-pointer group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#ede9fe] text-[#7c3aed] flex items-center justify-center font-bold text-sm shrink-0">
                F
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">
                  {sharedLocation.split(',')[0]} Basin
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  {sharedLocation.includes(',') ? sharedLocation.split(',')[1].trim() : 'Active Basin'}
                </div>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors shrink-0" />
          </button>

          {/* Navigation Workspace */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
              Workspace
            </div>

            <button
              onClick={() => onNavigateToTab('overview')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-[#ede9fe] text-[#6d28d9]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className="w-4 h-4" />
                <span>Overview</span>
              </div>
            </button>

            <button
              onClick={() => onNavigateToTab('map')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'map'
                  ? 'bg-[#ede9fe] text-[#6d28d9]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4" />
                <span>Live Map</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800">
                Live
              </span>
            </button>

            <button
              onClick={() => onNavigateToTab('sim')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'sim'
                  ? 'bg-[#ede9fe] text-[#6d28d9]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Waves className="w-4 h-4" />
                <span>Simulation</span>
              </div>
            </button>

            <button
              onClick={() => onNavigateToTab('weather')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'weather'
                  ? 'bg-[#ede9fe] text-[#6d28d9]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <CloudRain className="w-4 h-4" />
                <span>Telemetry</span>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold px-2 py-0.5 rounded-full">
                8
              </span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateToTab('sim')}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-4 h-4" />
                <span>Risk Sectors</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onNavigateToTab('sim')}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <GitFork className="w-4 h-4" />
                <span>Drainage Corridors</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onNavigateToTab('sim')}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Megaphone className="w-4 h-4" />
                <span>Emergency Actions</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onNavigateToTab('sim')}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <BarChart2 className="w-4 h-4" />
                <span>Reports</span>
              </div>
            </button>
          </div>
        </div>

        {/* Bottom Flow Assist Card & User Profile */}
        <div className="space-y-4 pt-4">
          {/* Flow Assist Widget (Pistachio Green Card) */}
          <div className="bg-[#ecfccb] text-slate-900 rounded-3xl p-4 border border-[#d9f99d]">
            <div className="flex items-center gap-1.5 text-xs font-bold mb-1">
              <Sparkles className="w-3.5 h-3.5 text-lime-700 fill-lime-700" />
              <span>Flow Assist</span>
            </div>
            <p className="text-[11px] text-slate-700 leading-relaxed mb-3">
              6 sectors near saturation this hour. Draft drainage reminders?
            </p>
            <button
              type="button"
              onClick={onRunSimulation}
              className="w-full py-1.5 px-3 bg-white text-slate-900 hover:bg-slate-50 rounded-xl text-xs font-bold shadow-sm border border-slate-200/60 transition-colors cursor-pointer"
            >
              Review list
            </button>
          </div>

          {/* Links */}
          <div className="space-y-1 text-xs text-slate-600">
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Settings</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
              <HelpCircle className="w-4 h-4 text-slate-400" />
              <span>Help & support</span>
            </button>
          </div>

          {/* User Profile Pill */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces"
                alt="Olivia Hart"
                className="w-9 h-9 rounded-full object-cover border border-slate-200"
              />
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">Olivia Hart</div>
                <div className="text-[10px] text-slate-400 truncate">Lead Hydro Director</div>
              </div>
            </div>
            <button className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ═══════════════════════════════════════════════════════════════════════
          2. MAIN CONTENT STAGE
      ═══════════════════════════════════════════════════════════════════════ */}
      <main className="flex-1 flex flex-col gap-5 min-w-0">
        {/* Top Header Bar */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-sans">
              Good morning, Olivia
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Thursday, 18 September · 19 active sectors in flow across 4 basins
            </p>
          </div>

          {/* Right Tools & Action Pill Button */}
          <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
            {/* Search Pill Input */}
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={sharedLocation}
                onChange={(e) => onLocationChange(e.target.value)}
                placeholder="Search sectors, treatments..."
                className="w-full pl-9 pr-10 py-2 rounded-full bg-white border border-slate-200/90 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400/40 shadow-sm"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                ⌘K
              </span>
            </div>

            {/* Circular Utility Buttons */}
            <button
              type="button"
              className="w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center shadow-sm hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
            </button>

            <button
              type="button"
              className="w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center shadow-sm hover:bg-slate-50 transition-colors relative cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-2 right-2 border-2 border-white"></span>
            </button>

            {/* Dark Action Pill Button */}
            <button
              type="button"
              onClick={onRunSimulation}
              className="px-5 py-2.5 rounded-full bg-[#18181b] hover:bg-[#27272a] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New simulation</span>
            </button>
          </div>
        </header>

        {/* Dynamic Main View */}
        {activeTab === 'map' && mapComponent ? (
          <div className="w-full bg-white rounded-3xl p-4 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            {mapComponent}
          </div>
        ) : activeTab === 'sim' && simulationComponent ? (
          <div className="w-full bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            {simulationComponent}
          </div>
        ) : activeTab === 'weather' && weatherComponent ? (
          <div className="w-full">
            {weatherComponent}
          </div>
        ) : (
          /* Dashboard Grid Container (Overview) */
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
            {/* ─────────────────────────────────────────────────────────────────
                LEFT 8-COLUMNS: Upper Row (Hero + KPIs + Chart) & Journey Board
            ───────────────────────────────────────────────────────────────── */}
            <div className="xl:col-span-8 space-y-5">
            {/* Upper 3-Card Row */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* CARD 1: Big Lavender Hero Card (md:col-span-5) */}
              <div className="md:col-span-5 bg-[#c4b5fd] rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between shadow-sm min-h-[220px]">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold text-[#3b0764]/80">
                      Today at FlowShield
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/60 text-[#4c1d95] shadow-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse"></span>
                      Live
                    </span>
                  </div>

                  {/* Huge Bold Headline with Pill Word */}
                  <div className="text-3xl sm:text-4xl font-extrabold text-[#1e1b4b] leading-tight tracking-tight">
                    19 sectors <br />
                    in{' '}
                    <span className="inline-block px-3 py-0.5 rounded-full border-2 border-[#1e1b4b] text-[#1e1b4b] font-medium text-2xl sm:text-3xl align-middle">
                      flow
                    </span>{' '}
                    today
                  </div>
                  <div className="text-xs text-[#312e81] font-medium mt-2">
                    3 safe · 3 in treatment · 13 upcoming
                  </div>
                </div>

                {/* Floating Pill Tags at Bottom */}
                <div className="flex flex-wrap gap-1.5 pt-4">
                  <span className="px-3 py-1 rounded-full bg-white text-xs font-semibold text-slate-800 shadow-xs">
                    hydrafacial
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/70 text-xs font-semibold text-slate-800 shadow-xs">
                    peels
                  </span>
                  <span className="px-3 py-1 rounded-full bg-[#bef264] text-xs font-semibold text-slate-900 shadow-xs">
                    botox
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/70 text-xs font-semibold text-slate-800 shadow-xs">
                    filler
                  </span>
                  <span className="px-3 py-1 rounded-full bg-[#bef264] text-xs font-semibold text-slate-900 shadow-xs">
                    laser
                  </span>
                </div>
              </div>

              {/* CARD 2: 2x2 Metric KPI Grid (md:col-span-4) */}
              <div className="md:col-span-4 grid grid-cols-2 gap-3 bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm">
                {/* KPI 1 */}
                <div className="p-2 flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold mb-1">
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[9px] font-bold">
                      $
                    </span>
                    <span>Revenue today</span>
                  </div>
                  <div className="text-lg font-bold text-slate-900">$8,420</div>
                  <div className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 mt-1">
                    <span>↑ 12%</span>
                    <span className="text-slate-400 font-normal">vs last Thu</span>
                  </div>
                </div>

                {/* KPI 2 */}
                <div className="p-2 flex flex-col justify-between border-l border-slate-100 pl-3">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold mb-1">
                    <RefreshCw className="w-3 h-3 text-purple-600" />
                    <span>Rebooking rate</span>
                  </div>
                  <div className="text-lg font-bold text-slate-900">68%</div>
                  <div className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 mt-1">
                    <span>↑ 4 pts</span>
                    <span className="text-slate-400 font-normal">30-day avg</span>
                  </div>
                </div>

                {/* KPI 3 */}
                <div className="p-2 flex flex-col justify-between border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold mb-1">
                    <span className="text-amber-500 font-bold">📝</span>
                    <span>Consents due</span>
                  </div>
                  <div className="text-lg font-bold text-slate-900">5</div>
                  <div className="text-[10px] font-semibold text-slate-400 flex items-center gap-1 mt-1">
                    <span className="text-amber-600 font-bold">Due today</span>
                    <span>· 2 overdue</span>
                  </div>
                </div>

                {/* KPI 4 */}
                <div className="p-2 flex flex-col justify-between border-t border-l border-slate-100 pt-3 pl-3">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold mb-1">
                    <span className="text-purple-600 font-bold">👑</span>
                    <span>New members</span>
                  </div>
                  <div className="text-lg font-bold text-slate-900">9</div>
                  <div className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 mt-1">
                    <span>↑ 3</span>
                    <span className="text-slate-400 font-normal">this week</span>
                  </div>
                </div>
              </div>

              {/* CARD 3: Soft Green Rainfall/Revenue Bar Chart Card (md:col-span-3) */}
              <div className="md:col-span-3 bg-[#ecfccb] rounded-3xl p-5 border border-[#d9f99d] flex flex-col justify-between shadow-sm min-h-[220px]">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-700">Revenue</span>
                    <button className="flex items-center gap-1 px-2.5 py-0.5 bg-white text-slate-800 rounded-full text-[10px] font-bold shadow-xs border border-slate-200 cursor-pointer">
                      <span>September</span>
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    </button>
                  </div>

                  <div className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                    $142,380
                  </div>
                  <div className="text-[10px] text-slate-600 mt-0.5">
                    <strong className="text-emerald-700">↑ 18.4%</strong> vs August · target $160k
                  </div>
                </div>

                {/* Rounded Bar Chart in Lavender */}
                <div className="flex items-end justify-between gap-1 h-20 pt-4 px-1">
                  {barChartHeights.map((h, i) => (
                    <div
                      key={i}
                      className="w-1.5 rounded-full bg-[#c4b5fd] hover:bg-[#8b5cf6] transition-all cursor-pointer"
                      style={{ height: `${h}%` }}
                      title={`Day ${i + 1}`}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-[9px] text-slate-400 font-mono px-0.5 mt-1">
                  <span>2</span>
                  <span>4</span>
                  <span>6</span>
                  <span>8</span>
                  <span>10</span>
                  <span>12</span>
                  <span>14</span>
                  <span>16</span>
                  <span>18</span>
                </div>
              </div>
            </div>

            {/* Middle Big Card: Client Journey / Sector Flow Progression Board */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-6">
              {/* Board Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                    Client journey
                  </h3>
                  <p className="text-xs text-slate-400">
                    Where 186 active clients are right now
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  {/* Segmented Filter Pills */}
                  <div className="flex rounded-full bg-slate-100 p-1 border border-slate-200/60 text-xs font-semibold text-slate-600">
                    <button
                      onClick={() => setActiveRange('hour')}
                      className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                        activeRange === 'hour' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
                      }`}
                    >
                      Week
                    </button>
                    <button
                      onClick={() => setActiveRange('day')}
                      className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                        activeRange === 'day' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
                      }`}
                    >
                      Month
                    </button>
                    <button
                      onClick={() => setActiveRange('quarter')}
                      className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                        activeRange === 'quarter' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
                      }`}
                    >
                      Quarter
                    </button>
                  </div>

                  <button
                    onClick={() => onNavigateToTab('map')}
                    className="px-3.5 py-1.5 rounded-full border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>Open board</span>
                    <span>&gt;</span>
                  </button>
                </div>
              </div>

              {/* 8 Column Progression Chart */}
              <div className="grid grid-cols-8 gap-2.5 sm:gap-4 pt-2">
                {journeyStages.map((stage) => (
                  <div key={stage.id} className="flex flex-col items-center gap-2 min-w-0">
                    {/* Header Label */}
                    <div className="text-center w-full">
                      <div className="text-[10px] text-slate-400 font-mono">{stage.id}</div>
                      <div className="text-[11px] font-bold text-slate-800 truncate" title={stage.name}>
                        {stage.name}
                      </div>
                    </div>

                    {/* Vertical Pill Track */}
                    <div className="w-full max-w-[56px] h-48 sm:h-56 bg-slate-100 rounded-full flex flex-col justify-end p-1 relative overflow-hidden">
                      <div
                        className={`w-full rounded-full transition-all duration-700 ${stage.color} flex items-center justify-center text-xs font-bold text-slate-900`}
                        style={{ height: `${stage.fillPercent}%` }}
                      >
                        {stage.count}
                      </div>
                    </div>

                    {/* Miniature Avatar Stack */}
                    <div className="flex -space-x-1.5 pt-1">
                      <div className="w-5 h-5 rounded-full bg-slate-300 border border-white overflow-hidden">
                        <img
                          src={`https://images.unsplash.com/photo-${1500000000000 + parseInt(stage.id) * 1000000}?w=50&h=50&fit=crop&crop=faces`}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                      <div className="w-5 h-5 rounded-full bg-[#d8b4fe] border border-white text-[8px] font-bold flex items-center justify-center text-[#3b0764]">
                        {stage.id}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottleneck Warning Pill Banner at Bottom */}
              <div className="bg-[#fef9c3] border border-[#fef08a] rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-amber-200/70 text-amber-900 flex items-center justify-center text-xs shrink-0 mt-0.5">
                    ⚠️
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      Consent is this week's bottleneck
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      14 clients have waited 2.3 days on average. 3 are booked tomorrow.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setAlertSent(true);
                    setTimeout(() => setAlertSent(false), 2500);
                  }}
                  className="px-4 py-2 rounded-full bg-[#18181b] hover:bg-[#27272a] text-white text-xs font-semibold transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{alertSent ? 'Reminders sent!' : 'Send reminders'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────────
              RIGHT 4-COLUMNS: Up Next Chronological List & Room Widget
          ───────────────────────────────────────────────────────────────── */}
          <div className="xl:col-span-4 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Up next</h3>
              <button
                onClick={() => onNavigateToTab('map')}
                className="text-xs font-semibold text-[#7c3aed] hover:text-[#6d28d9] flex items-center gap-1 cursor-pointer"
              >
                <span>Calendar</span>
                <span>&gt;</span>
              </button>
            </div>

            {/* List of 6 Chronological Items */}
            <div className="space-y-4">
              {upNextItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-2.5 hover:bg-slate-50 p-2 rounded-2xl transition-colors cursor-pointer"
                >
                  {/* Left: Time & Avatar */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="text-left w-12 shrink-0">
                      <div className="text-xs font-bold text-slate-900">{item.time}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{item.duration}</div>
                    </div>

                    <img
                      src={item.avatar}
                      alt={item.sector}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                    />

                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {item.sector}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {item.task}
                      </div>
                    </div>
                  </div>

                  {/* Right Status Pill Badge */}
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-bold shrink-0 ${item.badgeClass}`}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>

            {/* Bottom Rooms Status Card */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <DoorOpen className="w-4 h-4 text-slate-400" />
                <span>
                  <strong className="text-slate-900">Rooms 3 of 4 in use</strong> · Room 3 free until 13:30
                </span>
              </div>

              {/* 4 Pill Indicators */}
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-4 rounded-full bg-[#c4b5fd] block"></span>
                <span className="w-1.5 h-4 rounded-full bg-[#c4b5fd] block"></span>
                <span className="w-1.5 h-4 rounded-full bg-[#c4b5fd] block"></span>
                <span className="w-1.5 h-4 rounded-full bg-slate-200 block"></span>
              </div>
            </div>
          </div>
        </div>
        )}
      </main>
    </div>
  );
};

/**
 * MEDSPA / LUMIÈRE — Minimal Pastel Command Center
 * 
 * Pixel-perfect 1:1 match of the reference design:
 * - Off-white canvas (#f4f5f8) with pure white rounded-3xl cards
 * - Pastel lavender (#c4b5fd), pistachio green (#ecfccb, #bef264), and butter yellow (#fef9c3, #fde047)
 * - Clean sidebar with 3-circle medspa logo, Lumière Aesthetics switcher, workspace menu, Flow Assist widget, and Olivia Hart profile pill
 * - Greeting header: "Good morning, Olivia", search pill with ⌘K, messages/notifications circles, "+ New booking" black pill button
 * - Lavender hero card ("19 clients in [flow] today") with live badge, floating pills: hydrafacial, peels, botox, filler, laser
 * - 2x2 Metric KPI grid: Revenue today ($8,420), Rebooking rate (68%), Consents due (5), New members (9)
 * - Pistachio revenue card: $142,380, September dropdown, 17 rounded purple bars (days 2 to 18)
 * - 8-stage Client Journey progression board with avatar clusters and butter-yellow bottleneck alert strip ("Consent is this week's bottleneck...")
 * - Up next chronological queue with Emma Wilson, Chloe Bennett, Amara Okafor, Sofia Laurent, Mei Tanaka, Ruby Clarke, plus rooms utilization status
 */

import React, { useState } from 'react';
import {
  LayoutGrid,
  Calendar,
  Users,
  GitBranch,
  FileText,
  Crown,
  Megaphone,
  CreditCard,
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
  RefreshCw,
  AlertTriangle,
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
  const [activeRange, setActiveRange] = useState<'week' | 'month' | 'quarter'>('week');
  const [alertSent, setAlertSent] = useState(false);

  // 8-stage Client Journey Progression Data
  const journeyStages = [
    {
      id: '01',
      name: 'Consultation',
      count: 32,
      fillHeight: '64%',
      barColor: 'bg-[#c4b5fd]',
      avatars: [
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&h=60&fit=crop&crop=faces',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=faces',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop&crop=faces',
      ],
    },
    {
      id: '02',
      name: 'Plan',
      count: 21,
      fillHeight: '42%',
      barColor: 'bg-[#c4b5fd]',
      avatars: [
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=60&h=60&fit=crop&crop=faces',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop&crop=faces',
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=faces',
      ],
    },
    {
      id: '03',
      name: 'Consent',
      count: 14,
      fillHeight: '28%',
      barColor: 'bg-[#fde047]', // Butter yellow bottleneck
      avatars: [
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&h=60&fit=crop&crop=faces',
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=60&h=60&fit=crop&crop=faces',
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=60&h=60&fit=crop&crop=faces',
      ],
    },
    {
      id: '04',
      name: 'Appointment',
      count: 38,
      fillHeight: '76%',
      barColor: 'bg-[#c4b5fd]',
      avatars: [
        'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=60&h=60&fit=crop&crop=faces',
        'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=60&h=60&fit=crop&crop=faces',
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=60&h=60&fit=crop&crop=faces',
      ],
    },
    {
      id: '05',
      name: 'Treatment',
      count: 9,
      fillHeight: '18%',
      barColor: 'bg-[#ddd6fe]',
      avatars: [
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&h=60&fit=crop&crop=faces',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=faces',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop&crop=faces',
      ],
    },
    {
      id: '06',
      name: 'Aftercare',
      count: 27,
      fillHeight: '54%',
      barColor: 'bg-[#c4b5fd]',
      avatars: [
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=60&h=60&fit=crop&crop=faces',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop&crop=faces',
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=faces',
      ],
    },
    {
      id: '07',
      name: 'Follow-up',
      count: 26,
      fillHeight: '52%',
      barColor: 'bg-[#c4b5fd]',
      avatars: [
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&h=60&fit=crop&crop=faces',
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=60&h=60&fit=crop&crop=faces',
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=60&h=60&fit=crop&crop=faces',
      ],
    },
    {
      id: '08',
      name: 'Rebooking',
      count: 19,
      fillHeight: '38%',
      barColor: 'bg-[#bef264]', // Pistachio green
      avatars: [
        'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=60&h=60&fit=crop&crop=faces',
        'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=60&h=60&fit=crop&crop=faces',
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=60&h=60&fit=crop&crop=faces',
      ],
    },
  ];

  // Up Next Chronological Queue Items
  const upNextItems = [
    {
      time: '10:00',
      duration: '45 min',
      client: 'Emma Wilson',
      treatment: 'Botox · 3 areas',
      provider: 'Dr. Maya Chen · Rm 2',
      status: 'In treatment',
      badgeClass: 'bg-[#ede9fe] text-[#7c3aed]',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&h=60&fit=crop&crop=faces',
    },
    {
      time: '10:30',
      duration: '60 min',
      client: 'Chloe Bennett',
      treatment: 'HydraFacial Deluxe',
      provider: 'Leo Park · Rm 1',
      status: 'In treatment',
      badgeClass: 'bg-[#ede9fe] text-[#7c3aed]',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=60&h=60&fit=crop&crop=faces',
    },
    {
      time: '11:15',
      duration: '45 min',
      client: 'Amara Okafor',
      treatment: 'Lip filler · 1 ml',
      provider: 'Dr. Maya Chen · R...',
      status: 'Consent due',
      badgeClass: 'bg-[#fef9c3] text-[#854d0e]',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=faces',
    },
    {
      time: '12:00',
      duration: '30 min',
      client: 'Sofia Laurent',
      treatment: 'Laser genesis',
      provider: 'Dr. James Ortiz · Rm 4',
      status: 'Confirmed',
      badgeClass: 'bg-slate-100 text-slate-700',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop&crop=faces',
    },
    {
      time: '12:45',
      duration: '40 min',
      client: 'Mei Tanaka',
      treatment: 'Chemical peel',
      provider: 'Leo Park · Rm 1',
      status: 'Deposit due',
      badgeClass: 'bg-[#fef9c3] text-[#854d0e]',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&h=60&fit=crop&crop=faces',
    },
    {
      time: '13:40',
      duration: '50 min',
      client: 'Ruby Clarke',
      treatment: 'Gold member facial',
      provider: 'Leo Park · Rm 3',
      status: 'Confirmed',
      badgeClass: 'bg-slate-100 text-slate-700',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=faces',
    },
  ];

  // 17 Mini bar chart heights for Revenue volume (days 2 to 18)
  const barChartHeights = [30, 48, 62, 38, 78, 54, 90, 70, 85, 42, 66, 82, 94, 76, 60, 86, 92];
  const barDays = ['2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18'];

  return (
    <div className="w-full min-h-screen bg-[#f4f5f8] text-[#18181b] flex p-3 sm:p-5 gap-5 font-sans selection:bg-purple-200">
      {/* ═══════════════════════════════════════════════════════════════════════
          1. LEFT SIDEBAR NAVIGATION
      ═══════════════════════════════════════════════════════════════════════ */}
      <aside className="w-64 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between shrink-0 hidden lg:flex">
        <div className="space-y-6">
          {/* Brand Logo: 3 overlapping circles + "medspa" */}
          <div className="flex items-center gap-2.5 px-1">
            <div className="flex items-center -space-x-1.5">
              <span className="w-5 h-5 rounded-full bg-[#84cc16] block opacity-90"></span>
              <span className="w-5 h-5 rounded-full bg-[#8b5cf6] block opacity-90"></span>
              <span className="w-5 h-5 rounded-full bg-[#38bdf8] block opacity-80"></span>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 font-sans">
              medspa
            </span>
          </div>

          {/* Clinic Dropdown: "Lumière Aesthetics / Soho, New York" */}
          <button
            type="button"
            className="w-full flex items-center justify-between p-2 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/60 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#c4b5fd] text-[#3b0764] flex items-center justify-center font-bold text-base shrink-0">
                L
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">
                  Lumière Aesthetics
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  Soho, New York
                </div>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          </button>

          {/* Navigation Workspace */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
              Workspace
            </div>

            <button
              onClick={() => onNavigateToTab('overview')}
              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-[#ede9fe] text-[#7c3aed]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutGrid className="w-4 h-4" />
                <span>Overview</span>
              </div>
            </button>

            <button
              onClick={() => onNavigateToTab('map')}
              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'map'
                  ? 'bg-[#ede9fe] text-[#7c3aed]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4" />
                <span>Calendar</span>
              </div>
              <span className="text-[11px] text-slate-400 font-semibold">19</span>
            </button>

            <button
              onClick={() => onNavigateToTab('overview')}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4" />
                <span>Clients</span>
              </div>
            </button>

            <button
              onClick={() => onNavigateToTab('sim')}
              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'sim'
                  ? 'bg-[#ede9fe] text-[#7c3aed]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <GitBranch className="w-4 h-4" />
                <span>Journeys</span>
              </div>
              <span className="text-[11px] text-slate-400 font-semibold">8</span>
            </button>

            <button
              type="button"
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4" />
                <span>Treatment plans</span>
              </div>
            </button>

            <button
              type="button"
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Crown className="w-4 h-4" />
                <span>Memberships</span>
              </div>
            </button>

            <button
              type="button"
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Megaphone className="w-4 h-4" />
                <span>Marketing</span>
              </div>
            </button>

            <button
              type="button"
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <CreditCard className="w-4 h-4" />
                <span>Payments</span>
              </div>
            </button>

            <button
              onClick={() => onNavigateToTab('weather')}
              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'weather'
                  ? 'bg-[#ede9fe] text-[#7c3aed]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <BarChart2 className="w-4 h-4" />
                <span>Reports</span>
              </div>
            </button>
          </div>
        </div>

        {/* Bottom Sidebar: Flow Assist Card, Settings, Profile */}
        <div className="space-y-4">
          {/* Flow Assist Card */}
          <div className="bg-[#ecfccb] border border-[#d9f99d] rounded-3xl p-4 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <Sparkles className="w-4 h-4 text-slate-800" />
              <span>Flow Assist</span>
            </div>
            <p className="text-[11px] text-slate-700 leading-snug">
              6 clients are due to rebook this week. Draft reminders?
            </p>
            <button
              type="button"
              className="px-4 py-1.5 rounded-full bg-white hover:bg-slate-50 text-slate-900 text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              Review list
            </button>
          </div>

          <div className="space-y-1">
            <button
              type="button"
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-2xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>

            <button
              type="button"
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-2xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Help & support</span>
            </button>
          </div>

          {/* User Profile Pill */}
          <div className="flex items-center justify-between p-2 rounded-2xl hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces"
                alt="Olivia Hart"
                className="w-9 h-9 rounded-full object-cover border border-slate-200"
              />
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">Olivia Hart</div>
                <div className="text-[10px] text-slate-400 truncate">Owner · Medical Director</div>
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
              Thursday, 18 September · 19 appointments across 4 rooms
            </p>
          </div>

          {/* Right Search, Tools & Action Pill Button */}
          <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
            {/* Search Pill Input */}
            <div className="relative flex-1 md:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search clients, treatments..."
                value={sharedLocation}
                onChange={(e) => onLocationChange(e.target.value)}
                className="w-full pl-9 pr-12 py-2 rounded-full bg-white border border-slate-200/80 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20 focus:border-[#7c3aed] shadow-xs transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                ⌘K
              </span>
            </div>

            {/* Message Bubble Button */}
            <button
              type="button"
              className="w-9 h-9 rounded-full bg-white border border-slate-200/80 text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center justify-center shadow-xs transition-all cursor-pointer shrink-0"
            >
              <MessageSquare className="w-4 h-4" />
            </button>

            {/* Notification Bell Button */}
            <button
              type="button"
              className="w-9 h-9 rounded-full bg-white border border-slate-200/80 text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center justify-center shadow-xs transition-all cursor-pointer shrink-0 relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#ef4444] border-2 border-white"></span>
            </button>

            {/* New Booking Action Pill Button */}
            <button
              type="button"
              onClick={onRunSimulation}
              className="px-5 py-2.5 rounded-full bg-[#18181b] hover:bg-[#27272a] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New booking</span>
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
                <div className="md:col-span-5 bg-[#c4b5fd] rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between shadow-xs min-h-[220px]">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-semibold text-[#3b0764]/80">
                        Today at Lumière
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white text-[#4c1d95] shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
                        Live
                      </span>
                    </div>

                    {/* Bold Headline with "flow" capsule */}
                    <div className="text-3xl sm:text-4xl font-extrabold text-[#1e1b4b] leading-tight tracking-tight">
                      19 clients <br />
                      in{' '}
                      <span className="inline-block px-3.5 py-0.5 rounded-full border border-white/90 bg-white/40 text-[#1e1b4b] font-normal">
                        flow
                      </span>{' '}
                      today
                    </div>

                    <p className="text-xs text-[#3b0764]/80 mt-2 font-medium">
                      3 done · 3 in treatment · 13 upcoming
                    </p>
                  </div>

                  {/* Floating Pill Tags at Bottom */}
                  <div className="flex flex-wrap gap-1.5 pt-4">
                    <span className="px-3.5 py-1 rounded-full bg-white text-xs font-semibold text-slate-800 shadow-xs">
                      hydrafacial
                    </span>
                    <span className="px-3.5 py-1 rounded-full bg-white text-xs font-semibold text-slate-800 shadow-xs">
                      peels
                    </span>
                    <span className="px-3.5 py-1 rounded-full bg-[#bef264] text-xs font-semibold text-slate-900 shadow-xs">
                      botox
                    </span>
                    <span className="px-3.5 py-1 rounded-full bg-white text-xs font-semibold text-slate-800 shadow-xs">
                      filler
                    </span>
                    <span className="px-3.5 py-1 rounded-full bg-[#bef264] text-xs font-semibold text-slate-900 shadow-xs">
                      laser
                    </span>
                  </div>
                </div>

                {/* CARD 2: 2x2 Metric KPI Grid (md:col-span-4) */}
                <div className="md:col-span-4 grid grid-cols-2 gap-3 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                  {/* KPI 1: Revenue today */}
                  <div className="p-1 flex flex-col justify-between">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold mb-1">
                      <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-bold">
                        $
                      </span>
                      <span>Revenue today</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900 tracking-tight">$8,420</div>
                    <div className="text-[10px] font-bold text-emerald-700 flex items-center gap-1 mt-1">
                      <span className="bg-emerald-50 px-1.5 py-0.5 rounded">↑ 12%</span>
                      <span className="text-slate-400 font-normal">vs last Thu</span>
                    </div>
                  </div>

                  {/* KPI 2: Rebooking rate */}
                  <div className="p-1 flex flex-col justify-between border-l border-slate-100 pl-3">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold mb-1">
                      <RefreshCw className="w-3.5 h-3.5 text-purple-600" />
                      <span>Rebooking rate</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900 tracking-tight">68%</div>
                    <div className="text-[10px] font-bold text-emerald-700 flex items-center gap-1 mt-1">
                      <span className="bg-emerald-50 px-1.5 py-0.5 rounded">↑ 4 pts</span>
                      <span className="text-slate-400 font-normal">30-day avg</span>
                    </div>
                  </div>

                  {/* KPI 3: Consents due */}
                  <div className="p-1 flex flex-col justify-between border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold mb-1">
                      <span className="text-amber-500 font-bold text-sm">📝</span>
                      <span>Consents due</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900 tracking-tight">5</div>
                    <div className="text-[10px] font-semibold text-slate-500 flex items-center gap-1 mt-1">
                      <span className="bg-amber-50 text-amber-800 font-bold px-1.5 py-0.5 rounded">Due today</span>
                      <span className="text-slate-400">· 2 overdue</span>
                    </div>
                  </div>

                  {/* KPI 4: New members */}
                  <div className="p-1 flex flex-col justify-between border-t border-l border-slate-100 pt-3 pl-3">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold mb-1">
                      <span className="text-purple-600 font-bold text-sm">👑</span>
                      <span>New members</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900 tracking-tight">9</div>
                    <div className="text-[10px] font-bold text-emerald-700 flex items-center gap-1 mt-1">
                      <span className="bg-emerald-50 px-1.5 py-0.5 rounded">↑ 3</span>
                      <span className="text-slate-400 font-normal">this week</span>
                    </div>
                  </div>
                </div>

                {/* CARD 3: Soft Pistachio Green Revenue Bar Chart (md:col-span-3) */}
                <div className="md:col-span-3 bg-[#ecfccb] rounded-3xl p-5 border border-[#d9f99d] flex flex-col justify-between shadow-xs min-h-[220px]">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-800">
                        Revenue
                      </span>
                      <button
                        type="button"
                        className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white text-xs font-semibold text-slate-800 shadow-xs hover:bg-slate-50"
                      >
                        <span>September</span>
                        <ChevronDown className="w-3 h-3 text-slate-600" />
                      </button>
                    </div>

                    <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                      $142,380
                    </div>
                    <div className="text-[10px] text-slate-600 mt-0.5 font-medium flex items-center gap-1">
                      <span className="font-bold text-slate-800">↑ 18.4%</span>
                      <span>vs August · target $160k</span>
                    </div>
                  </div>

                  {/* 17 Rounded Purple Vertical Bars */}
                  <div className="pt-4">
                    <div className="flex items-end justify-between gap-1 h-20 w-full px-1">
                      {barChartHeights.map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                          <div
                            className={`w-full rounded-full transition-all duration-300 ${
                              i === 16 ? 'bg-[#7c3aed]' : i % 2 === 0 ? 'bg-[#a78bfa]' : 'bg-[#c4b5fd]'
                            }`}
                            style={{ height: `${h}%` }}
                          />
                        </div>
                      ))}
                    </div>
                    {/* Day labels along bottom: 2 to 18 */}
                    <div className="flex justify-between text-[9px] text-slate-500 font-mono pt-1.5 px-0.5">
                      {barDays.map((d) => (
                        <span key={d} className="text-center w-2.5 block">{d}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle Big Card: Client Journey Progression Board */}
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
                        onClick={() => setActiveRange('week')}
                        className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                          activeRange === 'week' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
                        }`}
                      >
                        Week
                      </button>
                      <button
                        onClick={() => setActiveRange('month')}
                        className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                          activeRange === 'month' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
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

                    {/* Open board button */}
                    <button
                      type="button"
                      className="px-3.5 py-1.5 rounded-full border border-slate-200/80 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                    >
                      Open board &gt;
                    </button>
                  </div>
                </div>

                {/* 8 Columns Flow Tracks */}
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                  {journeyStages.map((stage) => (
                    <div key={stage.id} className="flex flex-col items-center gap-2">
                      {/* Column Header: Step Number & Name */}
                      <div className="text-center w-full min-h-[36px]">
                        <div className="text-[10px] text-slate-400 font-mono">{stage.id}</div>
                        <div className="text-[11px] font-bold text-slate-900 truncate">
                          {stage.name}
                        </div>
                      </div>

                      {/* Vertical Progress Bar Container */}
                      <div className="w-full bg-[#f4f5f8] rounded-2xl p-1 flex flex-col justify-end h-56 relative overflow-hidden">
                        {/* Dynamic Filled Bar */}
                        <div
                          className={`w-full rounded-xl flex items-start justify-center pt-2 transition-all duration-500 ${stage.barColor}`}
                          style={{ height: stage.fillHeight }}
                        >
                          <span className="text-sm font-extrabold text-slate-900">
                            {stage.count}
                          </span>
                        </div>
                      </div>

                      {/* Overlapping Avatar Cluster */}
                      <div className="flex items-center -space-x-1.5 pt-1">
                        {stage.avatars.map((av, idx) => (
                          <img
                            key={idx}
                            src={av}
                            alt=""
                            className="w-5 h-5 rounded-full object-cover border border-white shadow-xs"
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom Yellow Bottleneck Alert Banner */}
                <div className="bg-[#fef9c3] border border-[#fef08a] rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-200/70 text-amber-800 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-4 h-4 text-amber-900" />
                    </div>
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
                    {/* Left: Time, Avatar, Client & Treatment Info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="text-left w-12 shrink-0">
                        <div className="text-xs font-bold text-slate-900">{item.time}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{item.duration}</div>
                      </div>

                      <img
                        src={item.avatar}
                        alt={item.client}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                      />

                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {item.client}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {item.treatment}
                        </div>
                        <div className="text-[9px] text-slate-400 truncate">
                          {item.provider}
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

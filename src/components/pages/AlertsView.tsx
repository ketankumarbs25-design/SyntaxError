import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Bell, Info } from 'lucide-react';
import type { LiveAlertItem } from '../../lib/liveDataSource';
import type { NavTabId } from '../nav/Navbar';

interface AlertsViewProps {
  alerts: LiveAlertItem[];
  onSelectSectorByName: (name: string) => void;
  onNavigateTab: (tab: NavTabId) => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  onSelectSectorByName,
  onNavigateTab,
}) => {
  const [filter, setFilter] = useState<'all' | 'warning' | 'critical'>('all');

  // Exact 3 alerts matching Screenshot 5
  const alertItems = [
    {
      id: 'alt-1',
      title: 'High Water Level – Marathahalli',
      description: 'Water level crossed 0.4 m',
      timeAgo: '10 min ago',
      severity: 'Critical' as const,
      sectorName: 'Marathahalli',
    },
    {
      id: 'alt-2',
      title: 'Heavy Rainfall Expected',
      description: 'Moderate to heavy rain in next 3 hours',
      timeAgo: '1 hour ago',
      severity: 'Warning' as const,
      sectorName: 'Bengaluru',
    },
    {
      id: 'alt-3',
      title: 'Culvert Maintenance',
      description: 'Planned maintenance at Hebbal',
      timeAgo: '3 hours ago',
      severity: 'Info' as const,
      sectorName: 'Hebbal',
    },
  ];

  const filteredAlerts = alertItems.filter((item) => {
    if (filter === 'warning') return item.severity === 'Warning';
    if (filter === 'critical') return item.severity === 'Critical';
    return true;
  });

  const handleAlertClick = (sectorName: string) => {
    if (sectorName && sectorName !== 'Bengaluru') {
      onSelectSectorByName(sectorName);
      onNavigateTab('sector-details');
    } else {
      onNavigateTab('map');
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6 max-w-4xl mx-auto">
      {/* Title & Subtitle (exact match from Screenshot 5) */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0D1F38] dark:text-white tracking-tight">
          Alerts &amp; Warnings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Stay informed with real-time alerts and notifications.
        </p>
      </div>

      {/* Filter Tabs: [ All (3) ]  [ Warning (2) ]  [ Critical (1) ] (exact match from Screenshot 5) */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 sm:flex-initial sm:min-w-[130px] py-2.5 px-6 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer text-center ${
            filter === 'all'
              ? 'bg-[#1D4ED8] text-white shadow-md shadow-blue-600/20'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
          }`}
        >
          All (3)
        </button>

        <button
          onClick={() => setFilter('warning')}
          className={`flex-1 sm:flex-initial sm:min-w-[130px] py-2.5 px-6 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer text-center ${
            filter === 'warning'
              ? 'bg-[#1D4ED8] text-white shadow-md shadow-blue-600/20'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
          }`}
        >
          Warning (2)
        </button>

        <button
          onClick={() => setFilter('critical')}
          className={`flex-1 sm:flex-initial sm:min-w-[130px] py-2.5 px-6 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer text-center ${
            filter === 'critical'
              ? 'bg-[#1D4ED8] text-white shadow-md shadow-blue-600/20'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
          }`}
        >
          Critical (1)
        </button>
      </div>

      {/* Alert Cards (exact match from Screenshot 5) */}
      <div className="space-y-3.5">
        {filteredAlerts.map((alert) => {
          const isWarning = alert.severity === 'Warning';
          const isInfo = alert.severity === 'Info';

          let borderStripeClass = 'border-l-[5px] border-l-[#EF4444]';
          let glowClass = 'bg-red-50 dark:bg-red-950/40 text-[#DC2626]';
          let badgeClass = 'bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA] dark:bg-red-950/50 dark:border-red-800';
          let Icon = Bell;

          if (isWarning) {
            borderStripeClass = 'border-l-[5px] border-l-[#F59E0B]';
            glowClass = 'bg-amber-50 dark:bg-amber-950/40 text-[#D97706]';
            badgeClass = 'bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A] dark:bg-amber-950/50 dark:border-amber-800';
            Icon = Bell;
          } else if (isInfo) {
            borderStripeClass = 'border-l-[5px] border-l-[#0284C7]';
            glowClass = 'bg-blue-50 dark:bg-blue-950/40 text-[#0284C7]';
            badgeClass = 'bg-[#E0F2FE] text-[#0284C7] border border-[#BAE6FD] dark:bg-blue-950/50 dark:border-blue-800';
            Icon = Info;
          }

          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => handleAlertClick(alert.sectorName)}
              className={`bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-xs border border-slate-100 dark:border-slate-800 ${borderStripeClass} flex items-center justify-between gap-4 cursor-pointer hover:shadow-md transition-all`}
            >
              <div className="flex items-center gap-4">
                {/* Soft Glowing Circular Icon */}
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${glowClass}`}
                >
                  <Icon className="w-5 h-5 fill-current" />
                </div>

                {/* Text Block */}
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-[#0D1F38] dark:text-white">
                    {alert.title}
                  </h3>
                  <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {alert.description}
                  </p>
                  <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-1">
                    {alert.timeAgo}
                  </div>
                </div>
              </div>

              {/* Severity Pill Badge on Right */}
              <div className="shrink-0">
                <span
                  className={`px-3.5 py-1 rounded-full text-xs font-semibold ${badgeClass}`}
                >
                  {alert.severity}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

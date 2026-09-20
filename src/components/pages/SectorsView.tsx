import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import type { SectorLiveMetrics } from '../../lib/liveDataSource';
import type { NavTabId } from '../nav/Navbar';

interface SectorsViewProps {
  sectors: SectorLiveMetrics[];
  onSelectSector: (sector: SectorLiveMetrics) => void;
  onNavigateTab: (tab: NavTabId) => void;
}

export const SectorsView: React.FC<SectorsViewProps> = ({
  sectors,
  onSelectSector,
  onNavigateTab,
}) => {
  const handleOpenSector = (sector: SectorLiveMetrics) => {
    onSelectSector(sector);
    onNavigateTab('sector-details');
  };

  return (
    <div className="space-y-5 sm:space-y-6 max-w-4xl mx-auto">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0D1F38] dark:text-white tracking-tight">
          Bengaluru Sectors
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Select any municipal sector to view live culvert telemetry and 24-hour water levels.
        </p>
      </div>

      {/* Sectors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-4">
        {sectors.map((sector) => {
          const isSafe = sector.status === 'Safe';
          const isWarning = sector.status === 'Warning';

          return (
            <motion.div
              key={sector.id}
              whileHover={{ y: -2 }}
              onClick={() => handleOpenSector(sector)}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-xs border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold text-slate-400">
                    {sector.code}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      isSafe
                        ? 'bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0]'
                        : isWarning
                        ? 'bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]'
                        : 'bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA]'
                    }`}
                  >
                    {sector.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#0D1F38] dark:text-white">
                  {sector.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                  {sector.catchmentBasin}
                </p>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="text-slate-400">Water Level</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {sector.currentWaterLevelM.toFixed(2)} m / {sector.culvertCapacityM.toFixed(1)} m
                  </span>
                </div>

                <div className="w-full py-2 px-3 rounded-xl bg-[#EBF3FE] dark:bg-blue-950/40 text-[#1D4ED8] dark:text-blue-400 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-blue-100 transition-colors">
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Printer,
  Calendar,
  Loader2,
} from 'lucide-react';
import { getBulletins, getStations } from '../api/adapter';
import { formatIST } from '../api/status';
import { useI18n } from '../i18n';
import { FloodSafetyAdvisorySection } from '../components/safety/FloodSafetyAdvisorySection';

export const BulletinsPage: React.FC = () => {
  const { language, t } = useI18n();
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedBulletinId, setSelectedBulletinId] = useState<string | null>(null);

  const { data: bulletins = [], isLoading: isLoadingBulletins } = useQuery({
    queryKey: ['bulletins'],
    queryFn: getBulletins,
    refetchInterval: 3 * 60 * 1000,
  });

  const { data: stations = [] } = useQuery({
    queryKey: ['stations'],
    queryFn: getStations,
  });

  const filteredBulletins = bulletins.filter((b) => {
    if (selectedSeverity !== 'all' && b.severity !== selectedSeverity) return false;
    return true;
  });

  const activeBulletin = bulletins.find((b) => b.id === selectedBulletinId) || bulletins[0];

  const handlePrint = () => {
    window.print();
  };

  if (isLoadingBulletins) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Loading daily bulletins...</p>
      </div>
    );
  }

  const extremeStations = stations.filter((s) => s.status === 'Extreme');
  const severeStations = stations.filter((s) => s.status === 'Severe');

  return (
    <div className="space-y-6">
      {/* ─── Screen Header & Action ────────────────────────────────────────── */}
      <div className="no-print flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t.dailyBulletins}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Official daily flood warning advisories, river reaches in inundation stage, and printable executive bulletins.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer shrink-0"
        >
          <Printer className="w-4 h-4" />
          <span>{t.printReport}</span>
        </button>
      </div>

      {/* ─── Filter Pills ─────────────────────────────────────────────────── */}
      <div className="no-print flex items-center gap-2.5">
        {(['all', 'Extreme', 'Severe', 'Warning', 'Advisory'] as const).map((sev) => (
          <button
            key={sev}
            onClick={() => setSelectedSeverity(sev)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              selectedSeverity === sev
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            {sev === 'all' ? 'All Advisories' : sev}
          </button>
        ))}
      </div>

      {/* ─── Bulletins List & Active Preview Layout ────────────────────────── */}
      <div className="no-print grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 1 Col: List of Bulletins */}
        <div className="space-y-3">
          {filteredBulletins.map((b) => {
            const isSelected = activeBulletin?.id === b.id;
            let badgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
            if (b.severity === 'Extreme') badgeColor = 'bg-red-50 text-red-700 border-red-200';
            else if (b.severity === 'Severe') badgeColor = 'bg-orange-50 text-orange-700 border-orange-200';
            else if (b.severity === 'Warning') badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';

            return (
              <div
                key={b.id}
                onClick={() => setSelectedBulletinId(b.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                  isSelected
                    ? 'bg-white dark:bg-slate-900 border-blue-600 shadow-md ring-2 ring-blue-500/20'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] text-slate-400 font-bold">{b.bulletinNo}</span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                    {b.severity}
                  </span>
                </div>

                <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-2">
                  {language === 'hi' && b.titleHi ? b.titleHi : b.title}
                </h3>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>{formatIST(b.dateTime)}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right 2 Cols: Active Bulletin Detail View */}
        <div className="lg:col-span-2">
          {activeBulletin ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 rounded-md border border-blue-200 dark:border-blue-900">
                      {activeBulletin.bulletinNo}
                    </span>
                    <span className="text-xs text-slate-400">
                      Issued: {formatIST(activeBulletin.dateTime)}
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                    {language === 'hi' && activeBulletin.titleHi ? activeBulletin.titleHi : activeBulletin.title}
                  </h2>
                </div>

                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
              </div>

              {/* Summary Paragraph */}
              <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                {language === 'hi' && activeBulletin.summaryHi ? activeBulletin.summaryHi : activeBulletin.summary}
              </div>

              {/* Affected Entities */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase mb-1">
                    {t.affectedBasins}
                  </span>
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    {activeBulletin.affectedBasins.join(', ')}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase mb-1">
                    {t.affectedStates}
                  </span>
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    {activeBulletin.affectedStates.join(', ')}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase mb-1">
                    {t.keyStations}
                  </span>
                  <div className="font-bold text-red-600 dark:text-red-400">
                    {activeBulletin.keyStationsAffected.join(', ')}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* ─── Official Flood Safety Advisories & Precautions ────────────── */}
      <div className="no-print pt-2">
        <FloodSafetyAdvisorySection />
      </div>

      {/* ─── PRINTABLE EXECUTIVE REPORT (@media print template) ─────────────── */}
      <div className="hidden print:block printable-bulletin-container bg-white text-black p-8 font-serif leading-normal">
        {/* Official Header */}
        <div className="text-center pb-4 border-b-2 border-black mb-6">
          <h1 className="text-xl font-black uppercase tracking-wider">
            GOVERNMENT OF INDIA • MINISTRY OF JAL SHAKTI
          </h1>
          <h2 className="text-lg font-bold">CENTRAL WATER COMMISSION — FLOOD FORECASTING COMMAND</h2>
          <h3 className="text-sm font-semibold mt-1">DAILY NATIONAL FLOOD SITUATION &amp; ADVISORY BULLETIN</h3>
          <p className="text-xs text-gray-600 mt-1 font-mono">
            Bulletin ID: {activeBulletin?.bulletinNo} | Date of Issue: {formatIST(activeBulletin?.dateTime || new Date())}
          </p>
        </div>

        {/* Executive Summary */}
        <div className="mb-6">
          <h4 className="text-sm font-bold uppercase border-b border-gray-400 pb-1 mb-2">
            1. Executive Flood Inundation Summary
          </h4>
          <p className="text-xs leading-relaxed text-justify">
            {activeBulletin?.summary}
          </p>
        </div>

        {/* Critical Stations Table */}
        <div className="mb-6">
          <h4 className="text-sm font-bold uppercase border-b border-gray-400 pb-1 mb-2">
            2. Stations in Extreme / Severe Flood Stage (Surpassing Danger / HFL)
          </h4>
          <table className="w-full text-xs border border-collapse border-black text-left">
            <thead>
              <tr className="bg-gray-100 border-b border-black font-bold">
                <th className="p-1.5 border-r border-black">Station</th>
                <th className="p-1.5 border-r border-black">River / Basin</th>
                <th className="p-1.5 border-r border-black">State</th>
                <th className="p-1.5 border-r border-black">Current (m)</th>
                <th className="p-1.5 border-r border-black">Danger (m)</th>
                <th className="p-1.5 border-r border-black">HFL (m)</th>
                <th className="p-1.5">Category</th>
              </tr>
            </thead>
            <tbody>
              {[...extremeStations, ...severeStations].map((s) => (
                <tr key={s.id} className="border-b border-gray-300">
                  <td className="p-1.5 border-r border-black font-bold">{s.name}</td>
                  <td className="p-1.5 border-r border-black">{s.river} ({s.basin})</td>
                  <td className="p-1.5 border-r border-black">{s.state}</td>
                  <td className="p-1.5 border-r border-black font-black">{s.currentLevel.toFixed(2)}</td>
                  <td className="p-1.5 border-r border-black">{s.dangerLevel.toFixed(2)}</td>
                  <td className="p-1.5 border-r border-black">{s.hfl.toFixed(2)}</td>
                  <td className="p-1.5 font-bold">{s.status.toUpperCase()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Basin Directives */}
        <div className="mb-6">
          <h4 className="text-sm font-bold uppercase border-b border-gray-400 pb-1 mb-2">
            3. Operational Directives &amp; NDRF Preparedness
          </h4>
          <ul className="list-disc pl-5 text-xs space-y-1">
            <li>State Disaster Management Authorities (SDMA) advised to maintain round-the-clock watch along riparian bunds.</li>
            <li>Regulated gate operations mandated at upstream reservoirs to limit downstream peak flood synchrony.</li>
            <li>Inundation alerts communicated to low-lying taluks and municipal administrations.</li>
          </ul>
        </div>

        {/* Official Sign-off */}
        <div className="pt-8 border-t border-gray-400 flex justify-between items-end text-xs">
          <div>
            <p className="font-semibold">FlowShield Automated Hydrological Telemetry System</p>
            <p className="text-gray-500">Telemetry feed synchronized via CWC Doppler Radar &amp; Stage Gauges</p>
          </div>
          <div className="text-right">
            <p className="font-bold uppercase">Authorized Signatory</p>
            <p>Superintending Engineer (Hydrology)</p>
            <p>Central Flood Forecasting Division</p>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Printer,
  Calendar,
  Loader2,
  Clock,
  Radio,
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
        <Loader2 className="w-8 h-8 text-[var(--live)] animate-spin" />
        <p className="text-xs font-medium text-[var(--text-muted)]">Loading daily bulletins...</p>
      </div>
    );
  }

  const extremeStations = stations.filter((s) => s.status === 'Extreme');
  const severeStations = stations.filter((s) => s.status === 'Severe');

  const getSeverityColor = (severity: string) => {
    if (severity === 'Extreme') return 'var(--danger)';
    if (severity === 'Severe') return 'var(--warning)';
    return 'var(--watch)';
  };

  return (
    <div className="space-y-6">
      {/* ─── Screen Header & Print ─────────────────────────────────────────── */}
      <div className="no-print flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text)] tracking-tight">
            {t.dailyBulletins}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            Official daily flood warning advisories, river reaches in inundation stage, and printable executive bulletins
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-3.5 py-2 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] font-medium text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Printer className="w-4 h-4 text-[var(--live)]" />
          <span>{t.printReport}</span>
        </button>
      </div>

      {/* ─── Filter Pills ─────────────────────────────────────────────────── */}
      <div className="no-print flex items-center gap-2 flex-wrap">
        {(['all', 'Extreme', 'Severe', 'Warning', 'Advisory'] as const).map((sev) => (
          <button
            key={sev}
            onClick={() => setSelectedSeverity(sev)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
              selectedSeverity === sev
                ? 'bg-[var(--primary)] text-white shadow-xs'
                : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
          >
            {sev === 'all' ? 'All advisories' : sev}
          </button>
        ))}
      </div>

      {/* ─── Bulletins List & Sticky Active Preview Layout ─────────────────── */}
      <div className="no-print grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 1 Col: List of Bulletins */}
        <div className="space-y-2.5">
          {filteredBulletins.map((b) => {
            const isSelected = activeBulletin?.id === b.id;
            const sevColor = getSeverityColor(b.severity);

            return (
              <div
                key={b.id}
                onClick={() => setSelectedBulletinId(b.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2 relative overflow-hidden ${
                  isSelected
                    ? 'bg-[var(--surface)] border-[var(--live)] shadow-sm'
                    : 'bg-[var(--surface)] border-[var(--border)] hover:border-[var(--border)]/80 hover:translate-y-[-1px]'
                }`}
              >
                {/* Active Indicator Left Bar */}
                {isSelected && (
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1"
                    style={{ backgroundColor: sevColor }}
                  />
                )}

                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[11px] text-[var(--text-muted)]">
                    {b.bulletinNo}
                  </span>
                  <span
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: sevColor,
                      color: b.severity === 'Warning' || b.severity === 'Advisory' ? '#0B1F33' : '#FFFFFF',
                    }}
                  >
                    {b.severity}
                  </span>
                </div>

                <h3 className="font-semibold text-xs sm:text-sm text-[var(--text)] line-clamp-2">
                  {language === 'hi' && b.titleHi ? b.titleHi : b.title}
                </h3>

                <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] pt-2 border-t border-[var(--border)]">
                  <Calendar className="w-3 h-3" />
                  <span>{formatIST(b.dateTime)}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right 2 Cols: Sticky Active Bulletin Detail View with Stripe, Timeline & Chips */}
        <div className="lg:col-span-2 lg:sticky lg:top-20">
          <AnimatePresence mode="wait">
            {activeBulletin && (
              <motion.div
                key={activeBulletin.id}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-xs overflow-hidden"
              >
                {/* Top Severity Color Stripe */}
                <div
                  className="w-full h-1.5"
                  style={{ backgroundColor: getSeverityColor(activeBulletin.severity) }}
                />

                <div className="p-5 sm:p-6 space-y-5">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 pb-4 border-b border-[var(--border)]">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="font-mono text-xs font-medium text-[var(--live)] bg-[var(--surface-2)] px-2.5 py-0.5 rounded-md border border-[var(--border)]">
                          {activeBulletin.bulletinNo}
                        </span>
                        <span className="text-xs text-[var(--text-muted)]">
                          Issued: {formatIST(activeBulletin.dateTime)}
                        </span>
                      </div>
                      <h2 className="text-base sm:text-lg font-bold text-[var(--text)]">
                        {language === 'hi' && activeBulletin.titleHi
                          ? activeBulletin.titleHi
                          : activeBulletin.title}
                      </h2>
                    </div>

                    <button
                      onClick={handlePrint}
                      className="px-3 py-1.5 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface)] text-[var(--text)] text-xs font-medium border border-[var(--border)] flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print</span>
                    </button>
                  </div>

                  {/* Summary Advisory Paragraph */}
                  <div className="text-xs sm:text-sm text-[var(--text)] leading-relaxed bg-[var(--surface-2)] p-4 rounded-xl border border-[var(--border)]">
                    {language === 'hi' && activeBulletin.summaryHi
                      ? activeBulletin.summaryHi
                      : activeBulletin.summary}
                  </div>

                  {/* Affected Stations as Interactive Chips */}
                  <div>
                    <span className="text-xs font-medium text-[var(--text-muted)] block mb-2">
                      Key affected stations
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {activeBulletin.keyStationsAffected.map((stnName) => (
                        <span
                          key={stnName}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--surface-2)] text-[var(--text)] text-xs font-medium border border-[var(--border)]"
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: getSeverityColor(activeBulletin.severity) }}
                          />
                          <span>{stnName}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Affected Regions Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                      <span className="text-[11px] text-[var(--text-muted)] block mb-1">
                        {t.affectedBasins}
                      </span>
                      <div className="font-semibold text-[var(--text)]">
                        {activeBulletin.affectedBasins.join(', ')}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                      <span className="text-[11px] text-[var(--text-muted)] block mb-1">
                        {t.affectedStates}
                      </span>
                      <div className="font-semibold text-[var(--text)]">
                        {activeBulletin.affectedStates.join(', ')}
                      </div>
                    </div>
                  </div>

                  {/* Timeline of Issued Updates */}
                  <div className="pt-3 border-t border-[var(--border)]">
                    <span className="text-xs font-medium text-[var(--text-muted)] block mb-3">
                      Advisory timeline & status updates
                    </span>
                    <div className="space-y-3 pl-2 border-l-2 border-[var(--border)]">
                      <div className="relative pl-4">
                        <div
                          className="absolute -left-[13px] top-1 w-2.5 h-2.5 rounded-full border-2 border-[var(--surface)]"
                          style={{ backgroundColor: getSeverityColor(activeBulletin.severity) }}
                        />
                        <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
                          <Clock className="w-3 h-3" />
                          <span>Current Advisory Active • {formatIST(activeBulletin.dateTime)}</span>
                        </div>
                        <p className="text-xs text-[var(--text)] mt-0.5">
                          High alert maintained across riparians. Evacuation advisories broadcasted to SDMAs.
                        </p>
                      </div>

                      <div className="relative pl-4">
                        <div className="absolute -left-[13px] top-1 w-2.5 h-2.5 rounded-full bg-[var(--border)] border-2 border-[var(--surface)]" />
                        <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
                          <Radio className="w-3 h-3" />
                          <span>Initial Telemetry Ingestion • Automated CWC Alert</span>
                        </div>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">
                          Water level exceeded warning threshold at upstream gauging stations.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ─── Official Flood Safety Advisories & Precautions ────────────── */}
      <div className="no-print pt-2">
        <FloodSafetyAdvisorySection />
      </div>

      {/* ─── Printable Executive Report (@media print template) ─────────────── */}
      <div className="hidden print:block printable-bulletin-container bg-white text-black p-8 font-serif leading-normal">
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

        <div className="mb-6">
          <h4 className="text-sm font-bold uppercase border-b border-gray-400 pb-1 mb-2">
            1. Executive flood inundation summary
          </h4>
          <p className="text-xs leading-relaxed text-justify">
            {activeBulletin?.summary}
          </p>
        </div>

        <div className="mb-6">
          <h4 className="text-sm font-bold uppercase border-b border-gray-400 pb-1 mb-2">
            2. Stations in extreme / severe flood stage
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
                  <td className="p-1.5 border-r border-black font-mono">{s.currentLevel.toFixed(2)}</td>
                  <td className="p-1.5 border-r border-black font-mono">{s.dangerLevel.toFixed(2)}</td>
                  <td className="p-1.5 border-r border-black font-mono">{s.hfl.toFixed(2)}</td>
                  <td className="p-1.5 font-bold">{s.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BulletinsPage;

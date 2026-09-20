import React, { useState } from 'react';
import {
  AlertTriangle,
  Send,
  CheckCircle2,
  MapPin,
  Waves,
  Eye,
  LogIn,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CWC_NATIONAL_STATIONS } from '../api/cwcNetwork';

export const IncidentReporterPage: React.FC = () => {
  const { isAuthenticated, openAuthModal, reports, submitReport } = useAuth();

  const [selectedBasin, setSelectedBasin] = useState('Brahmaputra');
  const [selectedStation, setSelectedStation] = useState('Dibrugarh Gauge Station');
  const [locationDesc, setLocationDesc] = useState('');
  const [severity, setSeverity] = useState<'Moderate Waterlogging' | 'Rapid River Surge' | 'Severe Flood Inundation' | 'Flash Flood Danger'>('Rapid River Surge');
  const [waterDepthCm, setWaterDepthCm] = useState(45);
  const [description, setDescription] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Basin stations list
  const basinStations = CWC_NATIONAL_STATIONS.filter(
    (s) => (s.basin ?? '').toLowerCase().includes(selectedBasin.toLowerCase())
  ).slice(0, 30);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !locationDesc.trim()) return;

    submitReport({
      basin: selectedBasin,
      stationName: selectedStation,
      locationDesc: locationDesc.trim(),
      severity,
      waterDepthCm: Number(waterDepthCm),
      description: description.trim(),
    });

    setSubmittedSuccess(true);
    setDescription('');
    setLocationDesc('');
    setTimeout(() => setSubmittedSuccess(false), 5000);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-[1440px] mx-auto pb-12">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-950 via-slate-900 to-slate-950 border border-amber-800/40 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold mb-4">
            <Eye className="w-3.5 h-3.5 text-amber-400" />
            Citizen Ground-Truth & Community Flood Reporter
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2">
            Report Live Flood & Inundation Incidents
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Help calibrate satellite radar and CWC telemetry by submitting verified eyewitness water levels,
            submerged roads, embankment dyke breaches, and flash flood alerts in your area.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Incident Report Form */}
        <div className="lg:col-span-7 bg-white dark:bg-[#0E101B] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Submit Ground Observation
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Observed water level readings will be geotagged and flagged for state SDRF validation
              </p>
            </div>

            {!isAuthenticated && (
              <button
                onClick={() => openAuthModal('signin')}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" /> Log in to submit
              </button>
            )}
          </div>

          {submittedSuccess && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold">Ground-Truth Report Recorded & Transmitted!</p>
                <p className="text-xs mt-1">
                  Your eyewitness data is now live on the community stream and sent to regional basin monitoring nodes.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  River Basin
                </label>
                <select
                  value={selectedBasin}
                  onChange={(e) => {
                    setSelectedBasin(e.target.value);
                    const firstMatch = CWC_NATIONAL_STATIONS.find(s => (s.basin ?? '').toLowerCase().includes(e.target.value.toLowerCase()));
                    if (firstMatch) setSelectedStation(firstMatch.name);
                  }}
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Brahmaputra">Brahmaputra Basin (North East)</option>
                  <option value="Ganga">Ganga Basin (Northern & Eastern Plains)</option>
                  <option value="Godavari">Godavari Basin (Central & Deccan)</option>
                  <option value="Krishna">Krishna Basin (South-Central)</option>
                  <option value="Mahanadi">Mahanadi Basin (Odisha/East)</option>
                  <option value="Indus">Indus Tributaries (J&K, Punjab, HP)</option>
                  <option value="Narmada">Narmada Basin</option>
                  <option value="Cauvery">Cauvery Basin</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nearest CWC Telemetry Station
                </label>
                <select
                  value={selectedStation}
                  onChange={(e) => setSelectedStation(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-amber-500"
                >
                  {basinStations.length > 0 ? (
                    basinStations.map((st) => (
                      <option key={st.id} value={st.name}>
                        {st.name} ({st.state})
                      </option>
                    ))
                  ) : (
                    <option value="Regional Basin Gauge">Regional Basin Gauge</option>
                  )}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Incident Severity
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Moderate Waterlogging">Moderate Waterlogging</option>
                  <option value="Rapid River Surge">Rapid River Surge</option>
                  <option value="Severe Flood Inundation">Severe Flood Inundation</option>
                  <option value="Flash Flood Danger">Flash Flood Danger (Critical)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Estimated Water Depth: <span className="text-amber-500 font-mono font-bold">{waterDepthCm} cm</span>
                </label>
                <input
                  type="range"
                  min="5"
                  max="300"
                  step="5"
                  value={waterDepthCm}
                  onChange={(e) => setWaterDepthCm(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 mt-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Specific Landmark / Road / Village Location
              </label>
              <input
                type="text"
                required
                placeholder="e.g. NH-37 stretch near Kaliabor bypass, 300m from Brahmaputra embankment"
                value={locationDesc}
                onChange={(e) => setLocationDesc(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Field Observations & Situation Details
              </label>
              <textarea
                required
                rows={3}
                placeholder="Describe current road accessibility, vehicle stranding, rate of water rising per hour, rainfall intensity..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
            >
              <Send className="w-4 h-4" />
              Publish Ground-Truth Incident to Live Stream
            </button>
          </form>
        </div>

        {/* Right: Live Community Incident Stream */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-[#0E101B] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Waves className="w-4 h-4 text-amber-500" />
                Live Ground-Truth Feed ({reports.length})
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Stream
              </span>
            </div>

            <div className="space-y-3.5 max-h-[550px] overflow-y-auto pr-1">
              {reports.map((rep) => (
                <div
                  key={rep.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      {rep.stationName}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        rep.severity === 'Flash Flood Danger' || rep.severity === 'Severe Flood Inundation'
                          ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                          : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      }`}
                    >
                      {rep.severity}
                    </span>
                  </div>

                  <p className="text-[11px] font-medium text-blue-600 dark:text-blue-400">
                    📍 {rep.locationDesc}
                  </p>

                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                    {rep.description}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-slate-200 dark:border-slate-800">
                    <span>Depth: <strong className="text-slate-700 dark:text-slate-200">{rep.waterDepthCm} cm</strong> • {rep.basin}</span>
                    <span className="text-emerald-500 font-semibold">{rep.authorName}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentReporterPage;

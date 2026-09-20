import React, { useState } from 'react';
import {
  Send,
  CheckCircle2,
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
  const [severity, setSeverity] = useState<
    'Moderate Waterlogging' | 'Rapid River Surge' | 'Severe Flood Inundation' | 'Flash Flood Danger'
  >('Rapid River Surge');
  const [waterDepthCm, setWaterDepthCm] = useState(45);
  const [description, setDescription] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [touched, setTouched] = useState<{ location?: boolean; description?: boolean }>({});

  const basinStations = CWC_NATIONAL_STATIONS.filter((s) =>
    (s.basin ?? '').toLowerCase().includes(selectedBasin.toLowerCase())
  ).slice(0, 30);

  const isLocationValid = locationDesc.trim().length >= 3;
  const isDescriptionValid = description.trim().length >= 10;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ location: true, description: true });
    if (!isLocationValid || !isDescriptionValid) return;

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
    setTouched({});
    setTimeout(() => setSubmittedSuccess(false), 5000);
  };

  const getSeverityTag = (sev: string) => {
    switch (sev) {
      case 'Flash Flood Danger':
        return { label: 'Flash flood danger', bg: 'var(--danger)', color: '#FFFFFF' };
      case 'Severe Flood Inundation':
        return { label: 'Severe flood', bg: 'var(--danger)', color: '#FFFFFF' };
      case 'Rapid River Surge':
        return { label: 'Rapid surge', bg: 'var(--warning)', color: '#FFFFFF' };
      default:
        return { label: 'Waterlogging', bg: 'var(--watch)', color: '#0B1F33' };
    }
  };

  return (
    <div className="space-y-5 max-w-[1440px] mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text)]">
              Report ground incidents
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--surface-2)] text-[var(--live)] border border-[var(--border)]">
              Citizen telemetry
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
            Submit verified eyewitness water levels, submerged infrastructure, and flood alerts to calibrate radar telemetry
          </p>
        </div>

        {!isAuthenticated && (
          <button
            onClick={() => openAuthModal('signin')}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface)] flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <LogIn className="w-3.5 h-3.5 text-[var(--live)]" />
            <span>Log in to submit</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Clean 2-Column Incident Report Form */}
        <div className="lg:col-span-7 bg-[var(--surface)] rounded-xl border border-[var(--border)] p-5 sm:p-6 shadow-xs">
          <div className="mb-5 pb-3 border-b border-[var(--border)]">
            <h2 className="text-sm font-semibold text-[var(--text)] flex items-center gap-2">
              <Eye className="w-4 h-4 text-[var(--live)]" />
              <span>Submit ground observation</span>
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Eyewitness observations are geocoded and flagged for state SDRF response
            </p>
          </div>

          {submittedSuccess && (
            <div className="mb-5 p-3.5 rounded-xl bg-[var(--normal)]/15 border border-[var(--normal)]/30 text-[var(--text)] flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[var(--normal)] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold">Ground report recorded and published</p>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                  Your observation is now visible on the live feed and linked to CWC telemetry nodes.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 2-Column Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                  River basin
                </label>
                <select
                  value={selectedBasin}
                  onChange={(e) => {
                    setSelectedBasin(e.target.value);
                    const firstMatch = CWC_NATIONAL_STATIONS.find((s) =>
                      (s.basin ?? '').toLowerCase().includes(e.target.value.toLowerCase())
                    );
                    if (firstMatch) setSelectedStation(firstMatch.name);
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--primary)]"
                >
                  <option value="Brahmaputra">Brahmaputra basin</option>
                  <option value="Ganga">Ganga basin</option>
                  <option value="Godavari">Godavari basin</option>
                  <option value="Krishna">Krishna basin</option>
                  <option value="Mahanadi">Mahanadi basin</option>
                  <option value="Indus">Indus basin</option>
                  <option value="Narmada">Narmada basin</option>
                  <option value="Cauvery">Cauvery basin</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                  Nearest CWC station
                </label>
                <select
                  value={selectedStation}
                  onChange={(e) => setSelectedStation(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--primary)]"
                >
                  {basinStations.length > 0 ? (
                    basinStations.map((st) => (
                      <option key={st.id} value={st.name}>
                        {st.name} ({st.state})
                      </option>
                    ))
                  ) : (
                    <option value="Regional Basin Gauge">Regional basin gauge</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                  Incident severity
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--primary)]"
                >
                  <option value="Moderate Waterlogging">Moderate waterlogging</option>
                  <option value="Rapid River Surge">Rapid river surge</option>
                  <option value="Severe Flood Inundation">Severe flood inundation</option>
                  <option value="Flash Flood Danger">Flash flood danger (critical)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                  Estimated depth: <span className="font-mono text-[var(--text)]">{waterDepthCm} cm</span>
                </label>
                <input
                  type="range"
                  min="5"
                  max="300"
                  step="5"
                  value={waterDepthCm}
                  onChange={(e) => setWaterDepthCm(Number(e.target.value))}
                  className="w-full h-2 bg-[var(--surface-2)] rounded-lg appearance-none cursor-pointer accent-[var(--primary)] mt-2"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                  Specific landmark / road / village location
                </label>
                <input
                  type="text"
                  placeholder="e.g. NH-37 stretch near Kaliabor bypass, 300m from embankment"
                  value={locationDesc}
                  onBlur={() => setTouched((p) => ({ ...p, location: true }))}
                  onChange={(e) => setLocationDesc(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg bg-[var(--surface-2)] border text-xs text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] ${
                    touched.location && !isLocationValid
                      ? 'border-[var(--danger)]'
                      : 'border-[var(--border)]'
                  }`}
                />
                {touched.location && !isLocationValid && (
                  <p className="text-[11px] text-[var(--danger)] mt-1">
                    Please enter at least 3 characters for the location.
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                  Field observations & situation details
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe road accessibility, rising rate of water per hour, rainfall intensity..."
                  value={description}
                  onBlur={() => setTouched((p) => ({ ...p, description: true }))}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg bg-[var(--surface-2)] border text-xs text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] ${
                    touched.description && !isDescriptionValid
                      ? 'border-[var(--danger)]'
                      : 'border-[var(--border)]'
                  }`}
                />
                {touched.description && !isDescriptionValid && (
                  <p className="text-[11px] text-[var(--danger)] mt-1">
                    Please enter at least 10 characters detailing current conditions.
                  </p>
                )}
              </div>
            </div>

            {/* Single Primary Button in Brand Blue */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[var(--primary)] hover:brightness-110 text-white font-medium text-xs shadow-xs transition-colors cursor-pointer active:scale-98"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Publish ground-truth incident</span>
            </button>
          </form>
        </div>

        {/* Right: Feed Cards with Severity Tag Only */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[var(--border)]">
              <h3 className="text-sm font-semibold text-[var(--text)] flex items-center gap-2">
                <Waves className="w-4 h-4 text-[var(--live)]" />
                <span>Live ground feed ({reports.length})</span>
              </h3>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--surface-2)] text-[var(--live)] border border-[var(--border)] font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--live)] animate-pulse" />
                <span>Active</span>
              </span>
            </div>

            <div className="space-y-3 max-h-[520px] overflow-y-auto custom-scrollbar pr-1">
              {reports.map((rep) => {
                const tag = getSeverityTag(rep.severity);
                return (
                  <div
                    key={rep.id}
                    className="p-3.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-xs space-y-2"
                  >
                    {/* Header with Severity Tag Only */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-xs text-[var(--text)] truncate">
                        {rep.stationName}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded-md text-[10px] font-medium shrink-0"
                        style={{ backgroundColor: tag.bg, color: tag.color }}
                      >
                        {tag.label}
                      </span>
                    </div>

                    <p className="text-[11px] text-[var(--text-muted)]">
                      {rep.locationDesc}
                    </p>

                    <p className="text-[var(--text)] text-xs leading-relaxed">
                      {rep.description}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] pt-1.5 border-t border-[var(--border)]">
                      <span>
                        Depth: <strong className="text-[var(--text)] font-mono">{rep.waterDepthCm} cm</strong> • {rep.basin}
                      </span>
                      <span>{rep.authorName}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentReporterPage;

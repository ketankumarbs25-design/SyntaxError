import React, { useState } from 'react';
import {
  PhoneCall,
  ShieldAlert,
  Send,
  CheckCircle2,
  Clock,
  Building2,
  Radio,
  FileText,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ContactPage: React.FC = () => {
  const { user, isAuthenticated, tickets, submitTicket } = useAuth();

  const [department, setDepartment] = useState<'CWC Telemetry Desk' | 'NDMA Disaster Relief' | 'Basin Inflow Operations' | 'Technical Support'>('CWC Telemetry Desk');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'CRITICAL EMERGENCY'>('High');
  const [basin, setBasin] = useState('Brahmaputra');
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    const newTicket = submitTicket({
      subject: subject.trim(),
      department,
      priority,
      basin,
      message: message.trim(),
    });

    setSubmittedCode(newTicket.ticketId);
    setSubject('');
    setMessage('');
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-[1440px] mx-auto pb-12">
      {/* Page Header */}
      <div className="rounded-xl bg-[var(--surface)] border border-[var(--border)] p-6 sm:p-8 text-[var(--text)] shadow-xs">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-muted)] text-xs font-semibold mb-3">
            <Radio className="w-3.5 h-3.5 text-[var(--live)] animate-pulse" />
            24x7 national flood emergency & grievance desk
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--text)] mb-2">
            Contact official flood control & emergency dispatch
          </h1>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            Direct priority communications desk connected with Central Water Commission (CWC),
            National Disaster Management Authority (NDMA), and State Emergency Operation Centres (SEOC).
          </p>
        </div>
      </div>

      {/* 24x7 Emergency Helplines Grid */}
      <div>
        <h2 className="text-base font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
          <PhoneCall className="w-4 h-4 text-[var(--primary)]" />
          National emergency toll-free hotlines
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* NDMA 1078 gets the danger accent and large Call button */}
          <div className="p-4 rounded-xl bg-[var(--surface)] border-2 border-[var(--danger)]/60 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[var(--danger)]">NDMA helpline</span>
                <ShieldAlert className="w-4 h-4 text-[var(--danger)]" />
              </div>
              <p className="text-2xl font-semibold text-[var(--text)] font-mono">1078</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                National Disaster Management Authority 24x7 control room
              </p>
            </div>
            <a
              href="tel:1078"
              className="mt-4 w-full py-2 px-3 rounded-lg bg-[var(--danger)] hover:opacity-90 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-opacity"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              Call 1078 now
            </a>
          </div>

          {/* Neutral Cards for CWC, SEOC, IMD */}
          <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-[var(--text-muted)]">CWC flood room</span>
                <Building2 className="w-4 h-4 text-[var(--text-muted)]" />
              </div>
              <p className="text-xl font-semibold text-[var(--text)] font-mono">011-26106523</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Central Flood Forecasting Division, New Delhi
              </p>
            </div>
            <a
              href="tel:01126106523"
              className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)] hover:underline"
            >
              Call CWC division →
            </a>
          </div>

          <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-[var(--text-muted)]">SEOC toll-free</span>
                <MapPin className="w-4 h-4 text-[var(--text-muted)]" />
              </div>
              <p className="text-xl font-semibold text-[var(--text)] font-mono">1070</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                State Emergency Operations Centre (Relief Commissioners)
              </p>
            </div>
            <a
              href="tel:1070"
              className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)] hover:underline"
            >
              Call state SEOC →
            </a>
          </div>

          <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-[var(--text-muted)]">IMD weather desk</span>
                <Radio className="w-4 h-4 text-[var(--text-muted)]" />
              </div>
              <p className="text-xl font-semibold text-[var(--text)] font-mono">1800-180-1717</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Monsoon & cyclone advisory hotline
              </p>
            </div>
            <a
              href="tel:18001801717"
              className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)] hover:underline"
            >
              Toll free IMD →
            </a>
          </div>
        </div>
      </div>

      {/* Dispatch Ticket System */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Submit Emergency Ticket */}
        <div className="lg:col-span-7 bg-[var(--surface)] rounded-xl border border-[var(--border)] p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--border)]">
            <div>
              <h2 className="text-base font-semibold text-[var(--text)] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[var(--primary)]" />
                File priority incident dispatch ticket
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Direct transmission to CWC hydrologists & emergency field coordinators
              </p>
            </div>

            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--normal)]/15 text-[var(--normal)] border border-[var(--normal)]/30 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> 24x7 active
            </span>
          </div>

          {submittedCode && (
            <div className="mb-6 p-4 rounded-xl bg-[var(--normal)]/10 border border-[var(--normal)]/30 text-[var(--text)] flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[var(--normal)] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold">Priority dispatch ticket dispatched successfully!</p>
                <p className="text-xs mt-1 text-[var(--text-muted)]">
                  Ticket ID: <span className="font-mono font-semibold text-[var(--text)]">{submittedCode}</span> • Estimated SLA response:{' '}
                  <span className="font-medium text-[var(--normal)]">&lt; 15 minutes</span>
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* User Details Pre-fill */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                  Reporter name
                </label>
                <input
                  type="text"
                  readOnly={isAuthenticated}
                  value={isAuthenticated ? (user?.name || 'Verified Observer') : customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3.5 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs font-medium text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                  Verified contact / email
                </label>
                <input
                  type="email"
                  readOnly={isAuthenticated}
                  value={isAuthenticated ? (user?.email || 'observer@flowshield.org') : customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="e.g. observer@flowshield.org"
                  className="w-full px-3.5 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs font-medium text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>
            </div>

            {/* Department & Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                  Target department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs font-medium text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] cursor-pointer"
                >
                  <option value="CWC Telemetry Desk">CWC Telemetry Desk</option>
                  <option value="NDMA Disaster Relief">NDMA Disaster Relief</option>
                  <option value="Basin Inflow Operations">Basin Inflow Operations</option>
                  <option value="Technical Support">Technical Platform Support</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                  Emergency priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs font-semibold text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] cursor-pointer"
                >
                  <option value="Low">Low (General inquiry)</option>
                  <option value="Medium">Medium (Telemetry discrepancy)</option>
                  <option value="High">High (Rapid river surge alert)</option>
                  <option value="CRITICAL EMERGENCY">Critical emergency (&lt;15m SLA)</option>
                </select>
              </div>
            </div>

            {/* Basin */}
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                Affected river basin / state
              </label>
              <select
                value={basin}
                onChange={(e) => setBasin(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs font-medium text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] cursor-pointer"
              >
                <option value="Brahmaputra">Brahmaputra Basin (Assam, Arunachal Pradesh)</option>
                <option value="Ganga">Ganga Basin (UP, Bihar, Uttarakhand, Bengal)</option>
                <option value="Godavari">Godavari Basin (Maharashtra, Telangana, AP)</option>
                <option value="Krishna">Krishna Basin (Karnataka, Telangana, AP)</option>
                <option value="Mahanadi">Mahanadi Basin (Odisha, Chhattisgarh)</option>
                <option value="Indus">Indus & Himalayan Tributaries (J&K, Himachal, Punjab)</option>
                <option value="Narmada">Narmada Basin (MP, Gujarat)</option>
                <option value="Cauvery">Cauvery Basin (Karnataka, Tamil Nadu)</option>
                <option value="Coastal">Coastal & West-Flowing Rivers (Kerala, Goa, Konkan)</option>
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                Subject / station name
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Embankment crack detected near Dibrugarh Station IND-CWC-0105"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                Detailed incident description / observations
              </label>
              <textarea
                required
                rows={4}
                placeholder="Describe current water level observations, gauge markings, road inundation, breached dykes, or telemetry anomalies..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[var(--primary)] hover:opacity-90 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer active:scale-98"
            >
              <Send className="w-4 h-4" />
              Transmit priority ticket to CWC/NDMA control room
            </button>
          </form>
        </div>

        {/* Right Column: Live Dispatched Tickets Feed */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[var(--text)] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[var(--primary)]" />
                Active dispatch & grievance tickets ({tickets.length})
              </h3>
              <span className="text-[11px] font-mono text-[var(--text-muted)]">Live SEOC sync</span>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {tickets.map((t) => (
                <div
                  key={t.id}
                  className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-semibold text-[var(--primary)] text-[11px]">
                      {t.ticketId}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                        t.priority === 'CRITICAL EMERGENCY'
                          ? 'bg-[var(--danger)]/15 text-[var(--danger)] border border-[var(--danger)]/30'
                          : t.priority === 'High'
                          ? 'bg-[var(--warning)]/15 text-[var(--warning)] border border-[var(--warning)]/30'
                          : 'bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border)]'
                      }`}
                    >
                      {t.priority}
                    </span>
                  </div>

                  <p className="font-semibold text-[var(--text)]">{t.subject}</p>
                  <p className="text-[var(--text-muted)] text-[11px] line-clamp-2">{t.message}</p>

                  <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] pt-1 border-t border-[var(--border)]">
                    <span>{t.department} • {t.basin}</span>
                    <span className="text-[var(--normal)] font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--normal)] animate-pulse" />
                      {t.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Physical Headquarters Address Card */}
          <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-6 shadow-xs space-y-3 text-xs">
            <h3 className="font-semibold text-[var(--text)] flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[var(--primary)]" />
              Central Water Commission (CWC) headquarters
            </h3>
            <p className="text-[var(--text-muted)] leading-relaxed">
              Sewa Bhawan, Sector-1, R.K. Puram,<br />
              New Delhi – 110066, India.<br />
              Ministry of Jal Shakti, Department of Water Resources
            </p>
            <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-[11px]">
              <span className="text-[var(--text-muted)]">Official portal:</span>
              <a
                href="https://cwc.gov.in"
                target="_blank"
                rel="noreferrer"
                className="text-[var(--primary)] hover:underline flex items-center gap-1 font-semibold"
              >
                cwc.gov.in <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;

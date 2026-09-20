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
  LogIn,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ContactPage: React.FC = () => {
  const { user, isAuthenticated, openAuthModal, tickets, submitTicket } = useAuth();

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
    <div className="space-y-8 animate-fadeIn max-w-[1440px] mx-auto pb-12">
      {/* Page Header */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-blue-900/40 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold mb-4">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
            24x7 National Flood Emergency & Grievance Desk
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2">
            Contact Official Flood Control & Emergency Dispatch
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Direct priority communications desk connected with the Central Water Commission (CWC),
            National Disaster Management Authority (NDMA), and State Emergency Operation Centres (SEOC).
          </p>
        </div>
      </div>

      {/* 24x7 Emergency Helplines Grid */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <PhoneCall className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          National Emergency Toll-Free Hotlines
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0E101B] border border-red-200 dark:border-red-900/40 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">NDMA Helpline</span>
              <ShieldAlert className="w-4 h-4 text-red-500" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">1078</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              National Disaster Management Authority 24x7 Control Room
            </p>
            <a
              href="tel:1078"
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400 hover:underline"
            >
              Call 1078 Now →
            </a>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#0E101B] border border-blue-200 dark:border-blue-900/40 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">CWC Flood Room</span>
              <Building2 className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">011-26106523</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Central Water Commission Central Flood Forecasting Division, New Delhi
            </p>
            <a
              href="tel:01126106523"
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Call CWC Division →
            </a>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#0E101B] border border-amber-200 dark:border-amber-900/40 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">SEOC Toll-Free</span>
              <MapPin className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">1070</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              State Emergency Operations Centre (Relief Commissioners)
            </p>
            <a
              href="tel:1070"
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
            >
              Call State SEOC →
            </a>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#0E101B] border border-emerald-200 dark:border-emerald-900/40 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">IMD Weather Desk</span>
              <Radio className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">1800-180-1717</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              India Meteorological Department Monsoon & Cyclone Hotline
            </p>
            <a
              href="tel:18001801717"
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Toll Free IMD →
            </a>
          </div>
        </div>
      </div>

      {/* Dispatch Ticket System */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Submit Emergency Ticket */}
        <div className="lg:col-span-7 bg-white dark:bg-[#0E101B] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                File Priority Incident Dispatch Ticket
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Direct transmission to CWC hydrologists & emergency field coordinators
              </p>
            </div>

            {isAuthenticated ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Authenticated
              </span>
            ) : (
              <button
                onClick={() => openAuthModal('signin')}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" /> Log In with OAuth
              </button>
            )}
          </div>

          {submittedCode && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold">Priority Dispatch Ticket Dispatched Successfully!</p>
                <p className="text-xs mt-1">
                  Ticket ID: <span className="font-mono font-bold">{submittedCode}</span> • Estimated SLA Response:{' '}
                  <span className="font-semibold text-emerald-700 dark:text-emerald-300">&lt; 15 Minutes</span>
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* User Details Pre-fill */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reporter Name
                </label>
                <input
                  type="text"
                  readOnly={isAuthenticated}
                  value={isAuthenticated ? (user?.name || 'Verified Observer') : customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Verified Contact / Email
                </label>
                <input
                  type="email"
                  readOnly={isAuthenticated}
                  value={isAuthenticated ? (user?.email || 'observer@flowshield.org') : customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="e.g. observer@flowshield.org"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Department & Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="CWC Telemetry Desk">CWC Telemetry Desk</option>
                  <option value="NDMA Disaster Relief">NDMA Disaster Relief</option>
                  <option value="Basin Inflow Operations">Basin Inflow Operations</option>
                  <option value="Technical Support">Technical Platform Support</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Emergency Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="Low">Low (General Inquiry)</option>
                  <option value="Medium">Medium (Telemetry Discrepancy)</option>
                  <option value="High">High (Rapid River Surge Alert)</option>
                  <option value="CRITICAL EMERGENCY">CRITICAL EMERGENCY (&lt;15m SLA)</option>
                </select>
              </div>
            </div>

            {/* Basin */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Affected River Basin / State
              </label>
              <select
                value={basin}
                onChange={(e) => setBasin(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 cursor-pointer"
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
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Subject / Station Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Embankment crack detected near Dibrugarh Station IND-CWC-0105"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Detailed Incident Description / Observations
              </label>
              <textarea
                required
                rows={4}
                placeholder="Describe current water level observations, gauge markings, road inundation, breached dykes, or telemetry anomalies..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
            >
              <Send className="w-4 h-4" />
              Transmit Priority Ticket to CWC/NDMA Control Room
            </button>
          </form>
        </div>

        {/* Right Column: Live Dispatched Tickets Feed */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-[#0E101B] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                Active Dispatch & Grievance Tickets ({tickets.length})
              </h3>
              <span className="text-[10px] font-mono text-slate-400">Live SEOC Sync</span>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {tickets.map((t) => (
                <div
                  key={t.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-[11px]">
                      {t.ticketId}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        t.priority === 'CRITICAL EMERGENCY'
                          ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                          : t.priority === 'High'
                          ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}
                    >
                      {t.priority}
                    </span>
                  </div>

                  <p className="font-semibold text-slate-800 dark:text-slate-200">{t.subject}</p>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] line-clamp-2">{t.message}</p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800/60">
                    <span>{t.department} • {t.basin}</span>
                    <span className="text-emerald-500 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      {t.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Physical Headquarters Address Card */}
          <div className="bg-white dark:bg-[#0E101B] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-500" />
              Central Water Commission (CWC) Headquarters
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Sewa Bhawan, Sector-1, R.K. Puram,<br />
              New Delhi – 110066, India.<br />
              Ministry of Jal Shakti, Department of Water Resources
            </p>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Official Portal:</span>
              <a
                href="https://cwc.gov.in"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold"
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

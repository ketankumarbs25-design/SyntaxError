import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  PhoneCall,
  CheckSquare,
  Square,
  MapPin,
  HeartHandshake,
  CheckCircle2,
} from 'lucide-react';
import type { SimState } from '../../sim/types';
import type { NavTabId } from '../nav/Navbar';

interface SafetyEvacuationViewProps {
  currentState: SimState;
  onNavigateTab: (tab: NavTabId) => void;
  onSelectSector?: (cellId: string) => void;
}

const EMERGENCY_CONTACTS = [
  { name: 'National Disaster Response Force (NDRF)', number: '1078', desc: 'Toll-free 24x7 specialized disaster rescue', icon: '🚨' },
  { name: 'State Emergency Operation Centre', number: '1070', desc: 'Karnataka State Disaster Management Authority', icon: '🏛️' },
  { name: 'Urban Flood & Storm Drainage Helpline', number: '1533', desc: 'BBMP Control Room & Emergency Water Pumps', icon: '🌊' },
  { name: 'Unified Emergency Services (Police/Fire/Ambulance)', number: '112', desc: 'Immediate first-responder dispatch', icon: '🚑' },
];

const EVACUATION_CHECKLIST = [
  { id: '1', item: 'Important personal documents (IDs, insurance, deeds) in a waterproof pouch' },
  { id: '2', item: 'Prescription medications & basic first-aid supplies (minimum 5-day supply)' },
  { id: '3', item: 'Charged mobile phones, high-capacity power banks, and USB cables' },
  { id: '4', item: 'Bottled drinking water (at least 3 liters per person) and dry non-perishable food' },
  { id: '5', item: 'Waterproof flashlights, spare batteries, and emergency safety whistles' },
  { id: '6', item: 'Pet supplies: dry food, leashes, carrier bags, and identification collars' },
  { id: '7', item: 'Switch off main electrical circuit breaker and LPG gas valve before leaving' },
];

const SHELTER_LOCATIONS = [
  { name: 'Highland Civic Centre (Sector A2)', capacity: '1,200 Persons', elevation: '920m (High Ground)', status: 'Active & Open', contact: '+91 80 2266 0001' },
  { name: 'Northern Polytechnic Gymnasium (Sector B1)', capacity: '850 Persons', elevation: '915m (Dry Ridge)', status: 'Active & Open', contact: '+91 80 2266 0002' },
  { name: 'Central Sports Complex (Sector D2)', capacity: '2,500 Persons', elevation: '910m (Emergency Relief Hub)', status: 'Standby Ready', contact: '+91 80 2266 0003' },
  { name: 'Hillview Community Hall (Sector H1)', capacity: '600 Persons', elevation: '935m (Highest Elevation)', status: 'Active & Open', contact: '+91 80 2266 0004' },
];

export const SafetyEvacuationView: React.FC<SafetyEvacuationViewProps> = ({
  currentState,
  onNavigateTab,
}) => {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set(['1', '3']));
  const [sectorSearch, setSectorSearch] = useState('');

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Find searched sector
  const searchedCell = sectorSearch.trim()
    ? currentState.cells.find(
        (c) =>
          c.id.toLowerCase() === sectorSearch.trim().toLowerCase() ||
          `Sector ${String.fromCharCode(65 + c.row)}${c.col + 1}`.toLowerCase().includes(sectorSearch.trim().toLowerCase())
      )
    : null;

  return (
    <div className="max-w-[1440px] mx-auto space-y-5">
      {/* ─── Hero Banner ─────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-start sm:items-center gap-3.5">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
            style={{ background: 'var(--status-safe-subtle)', border: '1px solid var(--status-safe-border)' }}
          >
            🛡️
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Citizen Safety & Emergency Evacuation Hub
              </h2>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ color: 'var(--status-safe)', background: 'var(--status-safe-subtle)', border: '1px solid var(--status-safe-border)', fontSize: '10px' }}
              >
                Public Assistance
              </span>
            </div>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              Live safety advisories, verified evacuation shelters, emergency contact numbers, and personal preparedness guidance for urban catchments.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateTab('map')}
          className="px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer self-end md:self-auto shrink-0"
          style={{ background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)', color: 'var(--accent)' }}
        >
          Check Flood Depth on Map
        </button>
      </motion.div>

      {/* ─── Sector Safety Quick-Checker ─────────────────────────────────────── */}
      <div
        className="p-4 sm:p-5 rounded-2xl shadow-sm"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
      >
        <div
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3"
          style={{ borderBottom: '1px solid var(--border-strong)' }}
        >
          <div>
            <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <MapPin className="w-4 h-4" style={{ color: 'var(--accent)' }} />
              <span>Is My Sector Safe Right Now?</span>
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Type your sector code (e.g. <strong style={{ color: 'var(--text-primary)' }}>A1</strong>, <strong style={{ color: 'var(--text-primary)' }}>B4</strong>, <strong style={{ color: 'var(--text-primary)' }}>H8</strong>) to check current hydraulic inundation depth.
            </p>
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              value={sectorSearch}
              onChange={(e) => setSectorSearch(e.target.value)}
              placeholder="e.g. B4 or Sector C2..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
            />
          </div>
        </div>

        {searchedCell ? (
          <div className="mt-3 p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white">
                Sector {String.fromCharCode(65 + searchedCell.row)}{searchedCell.col + 1}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Current Water Depth: <strong className="text-cyan-300">{searchedCell.water.toFixed(2)}m</strong> • Ground Elevation: {searchedCell.elevation.toFixed(1)}m
              </p>
            </div>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-xl border ${
                searchedCell.water >= 0.5
                  ? 'bg-red-500/20 text-red-300 border-red-500/40'
                  : searchedCell.water >= 0.15
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}
            >
              {searchedCell.water >= 0.5 ? '🚨 Critical Flooding' : searchedCell.water >= 0.15 ? '⚠️ Warning' : '✅ Safe'}
            </span>
          </div>
        ) : (
          <p className="text-[11px] text-slate-500 mt-2">
            Try sector codes from A1 to H8. Critical low-lying zones usually develop along central drainage basins.
          </p>
        )}
      </div>

      {/* ─── 4-Tier Public Safety Action Protocols ───────────────────────────── */}
      <div>
        <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
          <span>🚦</span> 4-Tier Flood Protection Action Plan
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Tier 1: Normal (Green)
            </div>
            <h4 className="text-xs font-bold text-white">Preventive Vigilance</h4>
            <ul className="text-[11px] text-slate-300 space-y-1 list-disc list-inside">
              <li>Keep roadside drainage grates clear of leaves.</li>
              <li>Inspect sump pump battery backups.</li>
              <li>Monitor 24-hour BBC Doppler radar updates.</li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-yellow-500/5 border border-yellow-500/20 space-y-2">
            <div className="flex items-center gap-2 text-yellow-400 font-bold text-xs">
              <span className="w-2 h-2 rounded-full bg-yellow-400" />
              Tier 2: Flood Watch (Yellow)
            </div>
            <h4 className="text-xs font-bold text-white">Precautionary Staging</h4>
            <ul className="text-[11px] text-slate-300 space-y-1 list-disc list-inside">
              <li>Move vehicles to multi-level or higher terrain.</li>
              <li>Relocate electronics from ground floor.</li>
              <li>Charge mobile phones and power banks.</li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Tier 3: Flood Warning (Orange)
            </div>
            <h4 className="text-xs font-bold text-white">Active Hazard Response</h4>
            <ul className="text-[11px] text-slate-300 space-y-1 list-disc list-inside">
              <li>Avoid driving through standing water (&gt;15cm).</li>
              <li>Assemble emergency grab bag and medications.</li>
              <li>Stay informed via FlowShield live map.</li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/20 space-y-2">
            <div className="flex items-center gap-2 text-red-400 font-bold text-xs">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              Tier 4: Severe Alert (Red)
            </div>
            <h4 className="text-xs font-bold text-white">Immediate Evacuation</h4>
            <ul className="text-[11px] text-slate-300 space-y-1 list-disc list-inside">
              <li>Evacuate to designated highland shelters immediately.</li>
              <li>Switch off main electricity and LPG valve.</li>
              <li>Call 1070 or 112 if trapped by flood waters.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ─── Two-Column: Emergency Contacts & Grab Bag Checklist ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Emergency Contacts Directory (6 cols) */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-cyan-400" />
              <span>Emergency Help Line Directory</span>
            </h3>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30 font-semibold">
              24×7 Active
            </span>
          </div>

          <div className="space-y-2.5">
            {EMERGENCY_CONTACTS.map((c) => (
              <div
                key={c.number}
                className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 flex items-center justify-between hover:bg-slate-800/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{c.icon}</span>
                  <div>
                    <h4 className="text-xs font-bold text-white">{c.name}</h4>
                    <p className="text-[10px] text-slate-400">{c.desc}</p>
                  </div>
                </div>
                <a
                  href={`tel:${c.number}`}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center gap-1.5 transition-all"
                >
                  <PhoneCall className="w-3 h-3" />
                  <span>{c.number}</span>
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Family Emergency Grab-Bag Checklist (6 cols) */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Family Grab-Bag Checklist</span>
            </h3>
            <span className="text-[10px] text-slate-400">
              {checkedItems.size} of {EVACUATION_CHECKLIST.length} Ready
            </span>
          </div>

          <div className="space-y-2">
            {EVACUATION_CHECKLIST.map((item) => {
              const isChecked = checkedItems.has(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => toggleCheck(item.id)}
                  className={`p-2.5 rounded-xl border flex items-center gap-3 cursor-pointer select-none transition-all ${
                    isChecked
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-slate-200'
                      : 'bg-slate-800/40 border-slate-700/40 text-slate-400 hover:bg-slate-800/60'
                  }`}
                >
                  {isChecked ? (
                    <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                  <span className={`text-xs ${isChecked ? 'line-through text-slate-400' : ''}`}>
                    {item.item}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Designated Evacuation Shelters ──────────────────────────────────── */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-xl space-y-3">
        <div className="border-b border-slate-800 pb-2.5 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-cyan-400" />
            <span>Designated Safe High-Ground Shelters</span>
          </h3>
          <span className="text-[10px] text-slate-400">Government Verified Public Relocation Sites</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SHELTER_LOCATIONS.map((s) => (
            <div key={s.name} className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/40 space-y-1.5">
              <h4 className="text-xs font-bold text-white">{s.name}</h4>
              <p className="text-[11px] text-emerald-400 font-semibold">{s.elevation}</p>
              <div className="text-[10px] text-slate-400 space-y-0.5">
                <p>Capacity: <strong className="text-slate-200">{s.capacity}</strong></p>
                <p>Status: <strong className="text-cyan-300">{s.status}</strong></p>
                <p>Helpline: <strong className="text-slate-300">{s.contact}</strong></p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SafetyEvacuationView;

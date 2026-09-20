import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldAlert,
  LifeBuoy,
  Home,
  ZapOff,
  Activity,
  CheckCircle2,
  Droplets,
  AlertTriangle,
  PhoneCall,
  Check,
  Copy,
  Printer,
  ShieldCheck,
  FileText,
  ExternalLink,
} from 'lucide-react';

export type SafetyPhase = 'before' | 'during' | 'after';

interface SafetyItem {
  id: string;
  title: string;
  badge: string;
  badgeType: 'critical' | 'warning' | 'info' | 'success';
  summary: string;
  steps: string[];
  icon: React.ReactNode;
}

interface ChecklistItem {
  id: string;
  label: string;
  category: string;
  importance: 'Essential' | 'High' | 'Recommended';
}

const EMERGENCY_CHECKLIST_ITEMS: ChecklistItem[] = [
  { id: 'water', label: 'Drinking Water (3 Litres per person/day for at least 72 hours)', category: 'Hydration', importance: 'Essential' },
  { id: 'purification', label: 'Water purification tablets (Chlorine/Halazone) & boiling kit', category: 'Health', importance: 'Essential' },
  { id: 'food', label: 'Ready-to-eat dry rations (roasted chana, energy bars, dry fruits, biscuits)', category: 'Nutrition', importance: 'Essential' },
  { id: 'first_aid', label: 'First Aid Kit: Antiseptic, bandages, ORS sachets, antibiotic ointment & personal prescription medications (7-day supply)', category: 'Medical', importance: 'Essential' },
  { id: 'torch_batteries', label: 'Waterproof LED torch / headlamp with 2 sets of spare alkaline batteries', category: 'Lighting', importance: 'Essential' },
  { id: 'whistle', label: 'Loud emergency whistle (for vertical signaling to rescue boats/helicopters)', category: 'Signaling', importance: 'Essential' },
  { id: 'docs_pouch', label: 'Waterproof zip-pouch for Aadhaar, property deeds, bank passbooks, passports & medical records', category: 'Documents', importance: 'High' },
  { id: 'power_bank', label: 'High-capacity portable power bank (fully charged) & emergency AM/FM radio', category: 'Communication', importance: 'High' },
  { id: 'clothing_boots', label: 'Sturdy rubber gumboots, raincoats, waterproof tarpaulin & warm dry clothing set', category: 'Protection', importance: 'Recommended' },
  { id: 'sanitation', label: 'Chlorine bleach powder, soap, hand sanitizer, sanitary pads & thick trash bags', category: 'Hygiene', importance: 'High' },
];

const EMERGENCY_HOTLINES = [
  { name: 'National Emergency', number: '112', desc: 'Single Unified Helpline across India (Police, Fire, Ambulance)', badge: '24x7 Universal' },
  { name: 'NDRF Control Room', number: '1078', altNumber: '011-24363260', desc: 'National Disaster Response Force HQ & Flood Rescue Dispatch', badge: 'Disaster Rescue' },
  { name: 'State Flood Control (SDMA)', number: '1070', desc: 'State Disaster Management Authority Toll-Free Emergency Desk', badge: 'State Level' },
  { name: 'District Emergency (DDMA)', number: '1077', desc: 'District Magistrate Disaster Operations & Local Inundation Response', badge: 'District Level' },
  { name: 'Medical Emergency / Ambulance', number: '108', desc: 'Free emergency ambulance & critical care transport', badge: 'Medical SOS' },
  { name: 'CWC Flood Early Warning Cell', number: '1800-180-1551', desc: 'Central Water Commission Toll-Free National Inundation Advisory', badge: 'Hydrological' },
];

export const FloodSafetyAdvisorySection: React.FC = () => {
  const [activePhase, setActivePhase] = useState<SafetyPhase>('during');
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  // Persistent Emergency Go-Bag checklist state in localStorage
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('fs_flood_kit_checklist');
      if (saved) return JSON.parse(saved);
    } catch {}
    return { water: true, torch_batteries: true, first_aid: true };
  });

  useEffect(() => {
    try {
      localStorage.setItem('fs_flood_kit_checklist', JSON.stringify(checkedItems));
    } catch {}
  }, [checkedItems]);

  const toggleChecklistItem = (id: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const completedCount = useMemo(() => {
    return EMERGENCY_CHECKLIST_ITEMS.filter((item) => checkedItems[item.id]).length;
  }, [checkedItems]);

  const completionPercent = Math.round((completedCount / EMERGENCY_CHECKLIST_ITEMS.length) * 100);

  const handleCopyNumber = (num: string) => {
    navigator.clipboard.writeText(num.replace(/[^0-9]/g, ''));
    setCopiedNumber(num);
    setTimeout(() => setCopiedNumber(null), 2200);
  };

  const handlePrint = () => {
    window.print();
  };

  // Phase-specific data cards
  const phaseData: Record<SafetyPhase, SafetyItem[]> = {
    before: [
      {
        id: 'b1',
        title: 'Know Basin Flood Inundation Zones & Local Shelter',
        badge: 'PRE-DISASTER DRILL',
        badgeType: 'warning',
        summary: 'Identify the elevation of your residence relative to nearby rivers or storm canals and locate the nearest designated cyclone/flood shelter.',
        steps: [
          'Study your local CWC and municipal flood zoning map to know if your house falls in the 25-year or 100-year flood zone.',
          'Identify two high-ground evacuation routes that do not cross low-lying bridges, culverts, or railway underpasses.',
          'Locate designated government relief shelters, school compounds, or elevated community halls in your ward.',
          'Establish an out-of-district family contact person who can coordinate if local towers go offline.',
        ],
        icon: <Home className="w-5 h-5 text-amber-500" />,
      },
      {
        id: 'b2',
        title: 'Waterproof Critical Documents & High-Value Assets',
        badge: 'ASSET PROTECTION',
        badgeType: 'info',
        summary: 'Submersion destroys unlaminated property records, identity proofs, and electronic inverters. Secure them well in advance.',
        steps: [
          'Pack Aadhaar, PAN cards, property titles, insurance certificates, and school records into sealed waterproof dry-pouches.',
          'Upload high-resolution scans of all identity and land documents to DigiLocker or encrypted cloud storage.',
          'Elevate ground-floor appliances (refrigerators, washing machines, inverter batteries) on raised plinths or brick blocks.',
          'Install non-return sewer backflow valves to prevent municipal storm water from backing up into toilets and sinks.',
        ],
        icon: <FileText className="w-5 h-5 text-blue-500" />,
      },
      {
        id: 'b3',
        title: 'Utility Preparation: Electrical & Gas Cutoff Safeguards',
        badge: 'PREVENTION',
        badgeType: 'critical',
        summary: 'Flooding causes catastrophic electrical short-circuits and gas line explosions. Prepare shut-off mechanisms before alerts rise.',
        steps: [
          'Ensure every adult in the home knows how to locate and switch off the main Miniature Circuit Breaker (MCB) panel.',
          'Know how to securely shut off the main LPG cylinder regulator knob and detach the regulator hose.',
          'Have a licensed electrician relocate power outlets and fuse switches to at least 1 meter above finished floor level.',
          'Check rooftop and balcony drainage spouts to ensure they are free of debris, plastic leaves, or silt build-up.',
        ],
        icon: <ZapOff className="w-5 h-5 text-amber-500" />,
      },
      {
        id: 'b4',
        title: 'Livestock, Pets & Agricultural Protection',
        badge: 'RURAL SAFEGUARD',
        badgeType: 'success',
        summary: 'Cattle and domestic animals tied up during flash floods face fatal drowning risks. Implement timely untethering.',
        steps: [
          'Move cattle, goats, and poultry to elevated earthen mounds (Killa/Pukka platforms) before water levels reach warning stage.',
          'Never leave animals tethered with ropes or confined inside locked pens when heavy rainfall or reservoir release is announced.',
          'Store dry cattle fodder (straw, hay, concentrate feed) on high wooden racks wrapped in waterproof tarpaulins.',
          'Keep vaccination records ready against hemorrhagic septicemia (HS) and black quarter (BQ) prevalent after floods.',
        ],
        icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />,
      },
    ],
    during: [
      {
        id: 'd1',
        title: '"Turn Around, Don’t Drown" — Zero Travel on Flooded Roads',
        badge: 'CRITICAL LIFE RULE',
        badgeType: 'critical',
        summary: 'Over 60% of flood fatalities occur in vehicles or while walking through fast-moving water. Never test unknown depths.',
        steps: [
          'Just 6 inches (15 cm) of rushing water has sufficient hydrodynamic force to sweep an adult off their feet.',
          'Just 12 inches (30 cm) of moving water will lift and float a small passenger car, disabling steering and brakes.',
          'Just 18 to 24 inches (45 to 60 cm) will sweep away SUVs, four-wheel-drive trucks, and light commercial vehicles.',
          'Never drive around barricades or enter submerged subways, railway bridges, or overflowing causeways.',
        ],
        icon: <ShieldAlert className="w-5 h-5 text-rose-500" />,
      },
      {
        id: 'd2',
        title: 'Immediate Vertical Evacuation & Rooftop Signaling',
        badge: 'SURVIVAL PROTOCOL',
        badgeType: 'critical',
        summary: 'If water enters your ground floor, execute immediate vertical relocation to the highest available concrete structure.',
        steps: [
          'Move family members, emergency go-bag, and warm blankets to the upper floor, reinforced mezzanine, or rooftop terrace.',
          'Do not climb into closed attic spaces where you could become trapped by rising water; ensure access to the open roof.',
          'Carry an emergency whistle (audible over roaring waters) and flash a torch with 3 distinct pulses to signal distress.',
          'Display a brightly colored cloth, fluorescent sari, or mirror toward the sky to guide NDRF rescue boats and helicopters.',
        ],
        icon: <LifeBuoy className="w-5 h-5 text-rose-500" />,
      },
      {
        id: 'd3',
        title: 'Electrocution & Submerged Infrastructure Hazards',
        badge: 'ELECTROCUTION HAZARD',
        badgeType: 'critical',
        summary: 'Water conducts lethal voltages across long distances from submerged transformers and snapped overhead power cables.',
        steps: [
          'Cut the main electrical MCB breaker immediately if you observe water entering the ground level or compound wall.',
          'Never touch electrical switches, cords, inverters, or metal fixtures while standing in water or with wet hands.',
          'Stay at least 10 meters (33 feet) away from snapped, hanging, or submerged power transmission lines; assume they are live.',
          'Report fallen power poles and sparking transformers to the state electricity distribution board helpline immediately.',
        ],
        icon: <ZapOff className="w-5 h-5 text-amber-500" />,
      },
      {
        id: 'd4',
        title: 'Contaminated Water, Venomous Reptiles & Sanitization',
        badge: 'BIOLOGICAL THREAT',
        badgeType: 'warning',
        summary: 'Flood water is heavily contaminated with raw sewer overflow, industrial toxic run-off, carcass bacteria, and displaced snakes.',
        steps: [
          'Never drink raw tap water or borewell water during floods; boil vigorously for at least 3 full minutes before consumption.',
          'If boiling is impossible, add 1 water purification chlorine tablet (0.5g chlorine) per 20 litres of clarified water.',
          'Floods displace venomous snakes (kraits, cobras, vipers). Look with a torch before stepping; use a long wooden stick to check steps.',
          'Never allow children to swim or play in flood waters; contact causes severe leptospirosis, typhoid, hepatitis, and skin ulcers.',
        ],
        icon: <Droplets className="w-5 h-5 text-sky-500" />,
      },
    ],
    after: [
      {
        id: 'a1',
        title: 'Structural Safety & Building Re-entry Clearance',
        badge: 'STRUCTURAL INSPECTION',
        badgeType: 'critical',
        summary: 'Flood currents undermine foundations, crack retaining walls, and saturate soil causing delayed collapses.',
        steps: [
          'Inspect the exterior of the house for foundation shifting, wall cracks, sagging roof beams, or loose masonry before entering.',
          'Do not enter if the building is leaning, if brick mortar has washed away, or if standing water remains against outer walls.',
          'Open all windows and doors for at least 30 minutes to vent out trapped toxic swamp gas, sewer fumes, or leaking LPG.',
          'Do not use matches, open flames, or cigarette lighters inside; use only battery-powered torches to avoid gas explosions.',
        ],
        icon: <Home className="w-5 h-5 text-amber-500" />,
      },
      {
        id: 'a2',
        title: 'Well & Sump Disinfection (Bleaching Powder Protocol)',
        badge: 'SAFE DRINKING WATER',
        badgeType: 'success',
        summary: 'Ground sumps, borewells, and open wells become saturated with coliform bacteria after inundation. Disinfect before use.',
        steps: [
          'Pump out all stagnant, muddy floodwater from the underground sump and open wells until fresh groundwater emerges.',
          'Scrub the sump floor and walls with a stiff brush and clean water mixed with 5% bleaching powder solution.',
          'Super-chlorinate open wells: Add 2.5 grams of fresh bleaching powder (with 33% available chlorine) per 1,000 litres of water.',
          'Let the chlorinated well water stand for at least 24 hours before drawing water for domestic washing and cooking.',
        ],
        icon: <Droplets className="w-5 h-5 text-emerald-500" />,
      },
      {
        id: 'a3',
        title: 'Vector-Borne Disease Control & Leptospirosis Prevention',
        badge: 'EPIDEMIC PREVENTION',
        badgeType: 'warning',
        summary: 'Stagnant flood pools trigger massive Dengue, Malaria, and Leptospirosis outbreaks within 3 to 7 days post-receding.',
        steps: [
          'Wear heavy rubber gloves and gumboots during cleanup to prevent Leptospira bacteria from entering through skin abrasions.',
          'Consult a primary health center (PHC) medical officer for Doxycycline 200mg chemoprophylaxis if wading was unavoidable.',
          'Clear silt and stagnant water puddles in discarded tires, coconut shells, and empty containers within 48 hours.',
          'Discard any food that came into direct contact with floodwaters, including sealed tin cans with bulges or rusted seals.',
        ],
        icon: <Activity className="w-5 h-5 text-rose-500" />,
      },
      {
        id: 'a4',
        title: 'Property Damage Documentation for Disaster Relief (SDRF/NDRF)',
        badge: 'GOVERNMENT RELIEF',
        badgeType: 'info',
        summary: 'State and national disaster relief compensation requires clear evidence of damage prior to debris disposal.',
        steps: [
          'Capture high-resolution, geo-tagged photos and video walkthroughs of every room, waterline marks on walls, and structural damage.',
          'Photograph destroyed household appliances with serial number plates visible, ruined crop acres, and dead livestock tags.',
          'Keep receipts for emergency hotel stays, building repairs, pumped silt clearance, and medical prescriptions.',
          'Submit damage claims promptly to your local Gram Panchayat, Revenue Inspector (Tahsildar office), or insurance claims surveyor.',
        ],
        icon: <FileText className="w-5 h-5 text-blue-500" />,
      },
    ],
  };

  return (
    <section
      id="safety-advisory"
      className="w-full bg-white dark:bg-[#0E101B] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 sm:p-6 lg:p-8 space-y-8 shadow-xs transition-colors"
      aria-label="Flood Safety Advisories and Precautions"
    >
      {/* ─── Top Header with NDMA/CWC Banner & Print Action ────────────────── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div className="space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-[11px] font-semibold text-rose-700 dark:text-rose-300">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>Official Life-Safety Guidelines • NDMA & CWC Protocol</span>
          </div>

          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Flood Safety Advisories & Life-Saving Precautions
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Essential safety guidelines, step-by-step preparation protocols, and emergency survival measures curated from the
            National Disaster Management Authority (NDMA) and Central Water Commission (CWC) to safeguard families and communities.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0 self-start md:self-center">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200/80 dark:border-slate-700/80 transition-all cursor-pointer shadow-xs active:scale-95"
            title="Print a 1-page emergency checklist for household posting"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Print Safety Sheet</span>
          </button>

          <a
            href="https://ndma.gov.in/Natural-Hazards/Floods"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-xs shadow-blue-500/20 active:scale-95"
          >
            <span>NDMA Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* ─── 3-Phase Interactive Tab Switcher (Before / During / After) ───── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Emergency Lifecycle Phase
          </h3>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Click a phase to view actionable precautions
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3 p-1.5 bg-slate-100/80 dark:bg-slate-900/80 rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
          {/* Phase 1: Before */}
          <button
            type="button"
            onClick={() => setActivePhase('before')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2.5 py-2.5 sm:py-3 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activePhase === 'before'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/60'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-300 hidden sm:inline-block" />
            <span>1. Before Flood</span>
            <span className="text-[10px] opacity-85 font-normal hidden md:inline-block">(Preparation)</span>
          </button>

          {/* Phase 2: During */}
          <button
            type="button"
            onClick={() => setActivePhase('during')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2.5 py-2.5 sm:py-3 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activePhase === 'during'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/25'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/60'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-200 animate-ping hidden sm:inline-block" />
            <span>2. During Flood</span>
            <span className="text-[10px] opacity-85 font-normal hidden md:inline-block">(Active Survival)</span>
          </button>

          {/* Phase 3: After */}
          <button
            type="button"
            onClick={() => setActivePhase('after')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2.5 py-2.5 sm:py-3 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activePhase === 'after'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/60'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-300 hidden sm:inline-block" />
            <span>3. After Flood</span>
            <span className="text-[10px] opacity-85 font-normal hidden md:inline-block">(Recovery & Health)</span>
          </button>
        </div>

        {/* Phase Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {phaseData[activePhase].map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 hover:border-blue-400/50 dark:hover:border-blue-500/50 transition-all hover:shadow-xs group"
            >
              <div className="space-y-3">
                {/* Header with Icon and Badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs group-hover:scale-105 transition-transform">
                      {item.icon}
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                        item.badgeType === 'critical'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                          : item.badgeType === 'warning'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          : item.badgeType === 'success'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                      }`}
                    >
                      {item.badge}
                    </span>
                  </div>
                </div>

                {/* Title & Summary */}
                <div>
                  <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    {item.summary}
                  </p>
                </div>

                {/* Detailed Action Steps */}
                <div className="space-y-1.5 pt-2 border-t border-slate-200/60 dark:border-slate-800/80">
                  {item.steps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                      <span className="leading-snug">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Interactive 72-Hour Flood Go-Bag Packing Checklist ───────────── */}
      <div className="bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50 dark:from-slate-900 dark:via-blue-950/20 dark:to-slate-900 border border-blue-200/60 dark:border-blue-900/40 rounded-3xl p-5 sm:p-6 lg:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Interactive Household Readiness</span>
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
              72-Hour Flood Emergency Go-Bag Checklist
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Check off items as you pack them. Your preparation progress is saved automatically.
            </p>
          </div>

          {/* Progress Pill */}
          <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs shrink-0 text-right">
            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-end gap-1.5">
              <span>{completedCount} of {EMERGENCY_CHECKLIST_ITEMS.length} Packed</span>
              <span className={`text-xs font-extrabold ${completionPercent === 100 ? 'text-emerald-500' : 'text-blue-600'}`}>
                ({completionPercent}%)
              </span>
            </div>
            <div className="w-36 h-2 bg-slate-100 dark:bg-slate-700 rounded-full mt-1.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  completionPercent === 100
                    ? 'bg-emerald-500'
                    : completionPercent > 50
                    ? 'bg-blue-600'
                    : 'bg-amber-500'
                }`}
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Checklist Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {EMERGENCY_CHECKLIST_ITEMS.map((item) => {
            const isChecked = Boolean(checkedItems[item.id]);
            return (
              <label
                key={item.id}
                onClick={() => toggleChecklistItem(item.id)}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                  isChecked
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
                    : 'bg-white/80 dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {}}
                  className="w-4 h-4 rounded mt-0.5 text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-600 cursor-pointer shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold leading-snug flex items-center gap-2">
                    <span className={isChecked ? 'line-through opacity-75' : ''}>{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                      {item.category}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {item.importance}
                    </span>
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* ─── Do's and Don'ts Comparison Table ─────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* DO'S CARD */}
        <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 space-y-3">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-sm uppercase tracking-wide">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>Essential Do's (Life Protectors)</span>
          </div>

          <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">•</span>
              <span><strong>Move to Upper Floors:</strong> Relocate vulnerable family members, pets, and food rations vertically immediately upon flood alert.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">•</span>
              <span><strong>Boil All Water:</strong> Boil municipal and well water vigorously for at least 3 minutes before drinking to kill cholera and typhoid microbes.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">•</span>
              <span><strong>Monitor Official CWC Bulletins:</strong> Keep your mobile phone on Ultra Battery Saver mode and follow CWC River Level warning signals.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">•</span>
              <span><strong>Keep an Emergency Whistle:</strong> Sound 3 loud whistle bursts to attract NDRF boats when voice shouting is drowned by water sound.</span>
            </li>
          </ul>
        </div>

        {/* DON'TS CARD */}
        <div className="p-5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 space-y-3">
          <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-bold text-sm uppercase tracking-wide">
            <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            <span>Deadly Don'ts (Strictly Avoid)</span>
          </div>

          <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-rose-600 font-bold">•</span>
              <span><strong>Never Drive Through Floodwaters:</strong> "Turn Around, Don't Drown." 12 inches of water sweeps away cars; road surfaces underneath may have washed away.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-600 font-bold">•</span>
              <span><strong>Do Not Touch Submerged Electricals:</strong> Never touch switchboards, inverters, or electric appliances while standing in puddle water.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-600 font-bold">•</span>
              <span><strong>Never Drink Raw Water or Eat Wet Food:</strong> Discard all perishable food and medicines that have come in contact with floodwaters.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-600 font-bold">•</span>
              <span><strong>Do Not Spread Social Media Rumors:</strong> Rely strictly on CWC, NDMA, and local District Collectorate verified emergency advisories.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* ─── 24x7 National Emergency Hotlines Cards ──────────────────────── */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-rose-500" />
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
              24/7 National Emergency & Flood Rescue Hotlines
            </h3>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Toll-free emergency numbers active across India
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {EMERGENCY_HOTLINES.map((helpline) => (
            <div
              key={helpline.name}
              className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">
                    {helpline.name}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {helpline.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                  {helpline.desc}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800">
                <a
                  href={`tel:${helpline.number.replace(/[^0-9]/g, '')}`}
                  className="text-base sm:text-lg font-mono font-extrabold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>{helpline.number}</span>
                </a>

                <button
                  type="button"
                  onClick={() => handleCopyNumber(helpline.number)}
                  className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
                  title="Copy number to clipboard"
                  aria-label={`Copy ${helpline.name} number`}
                >
                  {copiedNumber === helpline.number ? (
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Copied
                    </span>
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FloodSafetyAdvisorySection;

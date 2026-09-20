/**
 * FLOWSHIELD — AI Chatbot & Command Navigator
 *
 * Full-featured Flood Intelligence Assistant and Command Palette:
 * - Direct keyboard shortcut activation via Ctrl+K / Cmd+K (global capture phase)
 * - Intelligent natural-language query answering (CWC standards, emergency SOS, NDMA protocols, disaster history)
 * - Seamless page routing (/stations, /basins, /bulletins, /disasters, /watchlist, /report-incident, /contact, /help, globe)
 * - Interactive arrow-key navigation (ArrowUp/Down + Enter to jump)
 * - Robust Gemini 2.0 Flash integration with instant offline local intelligence engine
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import {
  Bot,
  X,
  Send,
  Navigation,
  ArrowRight,
  PhoneCall,
  Waves,
  ShieldCheck,
  Globe,
  Radio,
  FileText,
  HelpCircle,
  Clock,
  Command,
  Search,
  CheckCircle2,
  CornerDownLeft,
  AlertTriangle,
  Download,
} from 'lucide-react';
import { API_KEYS, API_ENDPOINTS } from '../../config/api';
import { MOCK_STATIONS } from '../../api/mockData';
import type { SimConfig, SimStats } from '../../sim/types';

// ─── App Routes Registry ───────────────────────────────────────────────────

export interface NavRoute {
  path: string;
  label: string;
  category: string;
  description: string;
  icon: React.ElementType;
  keywords: string[];
}

export const APP_NAV_ROUTES: NavRoute[] = [
  {
    path: '/',
    label: 'Overview & National Map',
    category: 'Core',
    description: 'National hydrographic map with 1,500 real-time CWC stations & KPI telemetry',
    icon: Radio,
    keywords: ['home', 'overview', 'map', 'national map', 'dashboard', 'live map', 'telemetry', 'kpi'],
  },
  {
    path: '/stations',
    label: 'Stations Telemetry',
    category: 'Data',
    description: 'Browse, filter, and inspect water levels across 1,500 gauging stations',
    icon: Waves,
    keywords: ['stations', 'station', 'gauging', 'water level', 'cwc stations', 'stage level', 'sensor', 'gauges'],
  },
  {
    path: '/basins',
    label: 'River Basins Overview',
    category: 'Data',
    description: 'Risk aggregation across 20 major river basins (Ganga, Brahmaputra, Godavari, Krishna, Cauvery)',
    icon: Waves,
    keywords: ['basins', 'basin', 'rivers', 'river basin', 'ganga', 'brahmaputra', 'godavari', 'krishna', 'cauvery', 'narmada', 'tapi', 'mahanadi'],
  },
  {
    path: '/bulletins',
    label: 'Daily Flood Bulletins',
    category: 'Advisory',
    description: 'Official CWC daily flood situation advisories & printable executive reports',
    icon: FileText,
    keywords: ['bulletins', 'bulletin', 'advisories', 'advisory', 'cwc bulletin', 'report', 'official bulletin', 'print bulletin'],
  },
  {
    path: '/disasters',
    label: 'Disaster History & AI Search',
    category: 'Intelligence',
    description: 'Verified historical Indian flood, cyclone & cloudburst records with AI search',
    icon: AlertTriangle,
    keywords: ['disaster', 'disasters', 'history', 'disaster history', 'kedarnath', 'kerala floods', 'wayanad', 'yamuna', 'amphan', 'deluge', 'cyclone', 'archives'],
  },
  {
    path: '/watchlist',
    label: 'Monitored Watchlist',
    category: 'Monitoring',
    description: 'Personalized watchlist for stations approaching critical or severe stages',
    icon: Clock,
    keywords: ['watchlist', 'watch', 'saved', 'favorites', 'pinned', 'monitored'],
  },
  {
    path: '/report-incident',
    label: 'Ground Incident Reporter',
    category: 'Citizen',
    description: 'Submit crowdsourced ground flood observations with GPS coordinates & photos',
    icon: ShieldCheck,
    keywords: ['report', 'incident', 'ground report', 'citizen report', 'submit', 'crowdsource', 'flood damage'],
  },
  {
    path: '/contact',
    label: 'Emergency Contacts & SOS',
    category: 'Emergency',
    description: 'Direct dialing for NDRF (011-24363260), State Disaster (1070), District (1077), and 112',
    icon: PhoneCall,
    keywords: ['contact', 'sos', 'helpline', 'emergency', 'phone', 'help line', 'ndrf', 'call', 'rescue', 'police', 'ambulance'],
  },
  {
    path: '/export',
    label: 'Data Export & Reports',
    category: 'Data',
    description: 'Export telemetry datasets in CSV, JSON, or GeoJSON formats for GIS workflows',
    icon: Download,
    keywords: ['export', 'download', 'csv', 'geojson', 'dataset'],
  },
  {
    path: '/help',
    label: 'Technical Help & REST API Docs',
    category: 'Docs',
    description: 'Hydrological classification methodology, schema specs, and REST API documentation',
    icon: HelpCircle,
    keywords: ['help', 'api', 'docs', 'documentation', 'methodology', 'developer', 'json', 'endpoints'],
  },
  {
    path: 'globe',
    label: '3D Satellite Earth Globe',
    category: '3D View',
    description: 'Launch full 3D interactive satellite Earth orbit centered on India boundary',
    icon: Globe,
    keywords: ['globe', '3d globe', '3d', 'earth', 'satellite earth', 'satellite globe', 'orbit', '3d view', 'survey of india'],
  },
];

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ChatAction {
  type:
    | 'NAVIGATE'
    | 'LAUNCH_GLOBE'
    | 'CHANGE_RAINFALL'
    | 'CHANGE_DURATION'
    | 'CHANGE_DRAINAGE'
    | 'CHANGE_TERRAIN'
    | 'SET_PRESET'
    | 'TOGGLE_EMERGENCY'
    | 'START_DEMO'
    | 'PLAY'
    | 'PAUSE'
    | 'RESET'
    | 'SEARCH_LOCATION';
  payload?: any;
  description?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  actions?: ChatAction[];
  suggestedRoute?: NavRoute;
  navigated?: boolean;
  timestamp: number;
}

export interface SimulationContext {
  config: SimConfig;
  stats: SimStats;
  currentTime: number;
  totalSteps: number;
  isPlaying: boolean;
  playbackSpeed: number;
  isDemoMode: boolean;
  emergencyMode: boolean;
  blockedCellsCount: number;
}

export interface AIChatbotProps {
  context?: SimulationContext;
  onAction?: (action: ChatAction) => void;
}

const DEFAULT_SIM_CONTEXT: SimulationContext = {
  config: {
    rainfallIntensity: 40,
    rainfallDuration: 60,
    drainageEfficiency: 0.75,
    elevationMultiplier: 1.0,
    rows: 8,
    cols: 8,
  } as any,
  stats: {
    safeCells: 58,
    warningCells: 4,
    criticalCells: 2,
    maxWater: 1.25,
    avgWater: 0.18,
    affectedPopulation: 14500,
  } as any,
  currentTime: 15,
  totalSteps: 120,
  isPlaying: false,
  playbackSpeed: 1,
  isDemoMode: false,
  emergencyMode: false,
  blockedCellsCount: 0,
};

// ─── Intent Recognition (Navigation vs Informational Query) ─────────────────

const QUESTION_STARTERS = [
  'what',
  'how',
  'why',
  'where',
  'who',
  'when',
  'which',
  'can you',
  'could you',
  'is there',
  'are there',
  'tell me',
  'explain',
  'difference',
  'meaning',
  'define',
  'status',
  'guideline',
  'advice',
  'tips',
  'numbers',
  'helpline numbers',
];

const NAVIGATION_VERBS = [
  'go to',
  'navigate to',
  'open',
  'take me to',
  'show me',
  'switch to',
  'visit',
  'launch',
  'head to',
  'browse',
  'jump to',
  'see',
];

export function isExplicitQuestion(query: string): boolean {
  const q = query.trim().toLowerCase();
  if (q.endsWith('?')) return true;
  return QUESTION_STARTERS.some((qs) => q.startsWith(qs) || q.includes(` ${qs} `));
}

export function findDirectRouteMatch(input: string): NavRoute | null {
  const clean = input.trim().toLowerCase().replace(/^\/+/, ''); // remove leading slashes

  // Direct route path matches
  for (const route of APP_NAV_ROUTES) {
    const routeClean = route.path.replace(/^\/+/, '');
    if (clean === routeClean) return route;
    if (clean === route.label.toLowerCase()) return route;
  }

  // Exact single-word / command matches
  if (['stations', 'station', 'gauges', 'water level', 'telemetry'].includes(clean)) {
    return APP_NAV_ROUTES.find((r) => r.path === '/stations') || null;
  }
  if (['basins', 'basin', 'rivers', 'river'].includes(clean)) {
    return APP_NAV_ROUTES.find((r) => r.path === '/basins') || null;
  }
  if (['bulletins', 'bulletin', 'advisories', 'advisory'].includes(clean)) {
    return APP_NAV_ROUTES.find((r) => r.path === '/bulletins') || null;
  }
  if (['disasters', 'disaster', 'history', 'archives'].includes(clean)) {
    return APP_NAV_ROUTES.find((r) => r.path === '/disasters') || null;
  }
  if (['watchlist', 'watch', 'saved', 'favorites'].includes(clean)) {
    return APP_NAV_ROUTES.find((r) => r.path === '/watchlist') || null;
  }
  if (['report', 'incident', 'report incident', 'ground report'].includes(clean)) {
    return APP_NAV_ROUTES.find((r) => r.path === '/report-incident') || null;
  }
  if (['contact', 'sos', 'helpline', 'helplines', 'emergency', 'phone'].includes(clean)) {
    return APP_NAV_ROUTES.find((r) => r.path === '/contact') || null;
  }
  if (['help', 'docs', 'api', 'documentation', 'methodology'].includes(clean)) {
    return APP_NAV_ROUTES.find((r) => r.path === '/help') || null;
  }
  if (['export', 'download', 'csv', 'geojson'].includes(clean)) {
    return APP_NAV_ROUTES.find((r) => r.path === '/export') || null;
  }
  if (['globe', '3d globe', 'earth', 'satellite earth', '3d'].includes(clean)) {
    return APP_NAV_ROUTES.find((r) => r.path === 'globe') || null;
  }
  if (['home', 'overview', 'map', 'national map'].includes(clean)) {
    return APP_NAV_ROUTES.find((r) => r.path === '/') || null;
  }

  return null;
}

export function findCommandNavigationIntent(query: string): NavRoute | null {
  const q = query.trim().toLowerCase();

  // If it's a question (e.g. "What is the danger level in stations?"), do NOT treat as direct navigation command!
  if (isExplicitQuestion(q)) {
    return null;
  }

  // Check direct matches first (e.g. "stations" or "/stations")
  const direct = findDirectRouteMatch(q);
  if (direct) return direct;

  // Check navigation verbs
  for (const verb of NAVIGATION_VERBS) {
    if (q.startsWith(verb) || q.includes(` ${verb} `)) {
      const rest = q.replace(verb, '').trim();
      const matched = findDirectRouteMatch(rest);
      if (matched) return matched;

      // Check keywords inside the remaining text
      for (const route of APP_NAV_ROUTES) {
        if (route.keywords.some((kw) => rest.includes(kw))) {
          return route;
        }
      }
    }
  }

  return null;
}

// ─── Comprehensive Domain Knowledge Engine ─────────────────────────────────

interface KnowledgeEntry {
  patterns: RegExp[];
  answer: (q: string) => { text: string; route?: NavRoute };
}

const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  // 1. Water Levels: Warning Level vs Danger Level vs HFL
  {
    patterns: [
      /(warning|danger|hfl|highest flood level|critical level|stage level|threshold|meter|msl)/i,
    ],
    answer: () => ({
      text: `🌊 **CWC Hydrographic Gauging Standards & Thresholds:**\n\n• **Warning Level (WL):** The stage at which river water spills into unprotected low-lying floodplains. District authorities are alerted to begin preparatory measures.\n• **Danger Level (DL):** The stage threatening flood defenses, embankments, or inhabited settlements. High alert and evacuation protocols are triggered.\n• **HFL (Highest Flood Level):** The peak stage ever recorded in historical telemetry records for that station.\n• **Current Monitoring:** FlowShield tracks **1,500 active telemetry stations** nationwide updating every 3 minutes with radar and ultrasonic stage sensors.`,
      route: APP_NAV_ROUTES.find((r) => r.path === '/stations'),
    }),
  },

  // 2. Emergency Helplines & SOS
  {
    patterns: [
      /(helpline|emergency|sos|phone|number|contact|call|ndrf|sdrf|rescue|police|ambulance|control room)/i,
    ],
    answer: () => ({
      text: `🚨 **National Emergency Flood Helplines (India):**\n\n• **112** — Single National Emergency Response Support System (ERSS - Police, Fire, Ambulance)\n• **1070** — State Disaster Management Authority (SDMA Toll-Free Control Room)\n• **1077** — District Disaster Management Authority (DDMA Control Room)\n• **011-24363260** / **9711077372** — National Disaster Response Force (NDRF HQ 24x7)\n• **1072** — Indian Railways Disaster Relief Helpline\n• **108** — National Ambulance Emergency Services\n\nYou can click below to access direct one-tap dialing and state-specific disaster squads.`,
      route: APP_NAV_ROUTES.find((r) => r.path === '/contact'),
    }),
  },

  // 3. Flood Safety Protocols & NDMA Guidelines
  {
    patterns: [
      /(safety|precaution|what to do|protect|evacuate|go bag|survival|drinking water|protocol|ndma|during flood|before flood)/i,
    ],
    answer: () => ({
      text: `🛡️ **Official NDMA Flood Safety & Life-Saving Protocol:**\n\n1. **Move to Higher Ground:** Never remain in basements or low-lying floodplains when water rises or sirens sound.\n2. **Rule of Water Force:** Just **15 cm (6 inches)** of moving water can knock down an adult, and **30 cm (1 foot)** can float passenger vehicles.\n3. **Isolate Utilities:** Shut off the main electrical MCB breaker and LPG cylinder regulators before evacuating.\n4. **Emergency Go-Bag:** Pack 3 days of bottled water, chlorine purification tablets, dry rations, torch with extra batteries, vital documents in waterproof pouches, and first-aid kit.\n5. **Safe Water Only:** Boil all drinking water vigorously to prevent waterborne cholera and typhoid.`,
      route: APP_NAV_ROUTES.find((r) => r.path === '/help'),
    }),
  },

  // 4. Stations & Telemetry Monitoring
  {
    patterns: [
      /(how many station|station count|telemetry|sensor|gauge|monitoring network|real time data)/i,
    ],
    answer: () => ({
      text: `📊 **FlowShield Station Telemetry Network:**\n\n• **1,500 Gauging Stations:** Active hydrological sensing stations across India's river systems.\n• **Sensor Types:** Radar non-contact water level sensors, ultrasonic stage sensors, and tipping-bucket automated rain gauges.\n• **Update Frequency:** Real-time data synchronization every **3 minutes**.\n• **Status Classification:** Normal (Green), Watch (Yellow), Warning (Orange), and Danger (Red).\n• You can search stations by name, state, river, or risk stage in the Telemetry view.`,
      route: APP_NAV_ROUTES.find((r) => r.path === '/stations'),
    }),
  },

  // 5. River Basins (Ganga, Brahmaputra, Godavari, Krishna, etc.)
  {
    patterns: [
      /(basin|river|ganga|brahmaputra|godavari|krishna|cauvery|kaveri|narmada|tapi|mahanadi|yamuna|teesta)/i,
    ],
    answer: (q) => {
      const qLower = q.toLowerCase();
      let extra = 'FlowShield tracks risk aggregation across 20 major Indian river basins.';
      if (qLower.includes('ganga') || qLower.includes('yamuna')) {
        extra = 'The **Ganga-Yamuna Basin** is India’s most densely monitored hydrographic system, spanning Uttarakhand, UP, Bihar, and West Bengal.';
      } else if (qLower.includes('brahmaputra')) {
        extra = 'The **Brahmaputra Basin** experiences high monsoon discharge and flash surges across Assam and Arunachal Pradesh.';
      } else if (qLower.includes('krishna') || qLower.includes('godavari')) {
        extra = 'The **Godavari & Krishna Basins** are monitored for major dam discharges (Srisailam, Nagarjuna Sagar, Prakasam Barrage) impacting Andhra Pradesh & Telangana.';
      }
      return {
        text: `🏞️ **River Basins Telemetry Overview:**\n\n${extra}\n\n• In the River Basins view, you can inspect basin risk index, percentage of stations above warning level, and average water elevation trends.`,
        route: APP_NAV_ROUTES.find((r) => r.path === '/basins'),
      };
    },
  },

  // 6. Disaster History & Case Studies
  {
    patterns: [
      /(disaster|history|historical|kedarnath|kerala flood|wayanad|assam flood|delhi flood|michaung|cyclone|tsunami|cloudburst)/i,
    ],
    answer: () => ({
      text: `📜 **Verified Indian Natural Disaster Feeds:**\n\nFlowShield archives verified records from CWC, GDACS, and NASA EONET:\n• **2024 Wayanad Landslides (Kerala):** Massive debris flow triggered by 300mm+ cloudburst.\n• **2024 Budameru Flash Breach (Vijayawada):** Record Krishna basin inundation.\n• **2024 Assam & Brahmaputra Deluge:** 2.4M people impacted across 28 districts.\n• **2023 Yamuna All-Time Peak (Delhi):** 208.66m stage level breaching historical records.\n• **2018 Great Kerala Floods:** Centennial deluge requiring simultaneous opening of 35 dams.\n• **2013 Kedarnath Himalayan Deluge:** Chorabari glacial lake breach.`,
      route: APP_NAV_ROUTES.find((r) => r.path === '/disasters'),
    }),
  },

  // 7. Ground Incident Reporting
  {
    patterns: [
      /(ground report|report incident|citizen report|submit report|upload photo|report flood|how to report)/i,
    ],
    answer: () => ({
      text: `📱 **Crowdsourced Ground Incident Reporter:**\n\nCitizens and ground volunteers can submit real-time flood reports:\n1. **GPS Tagging:** Auto-captures precise device coordinates.\n2. **Water Depth Rating:** Ankle, Knee, Waist, Chest, or Above Head.\n3. **Visual Verification:** Attach camera photos of flooded streets, breached embankments, or submerged infrastructure.\n4. **Emergency Priority:** Flag high-risk situations directly for NDRF response coordination.`,
      route: APP_NAV_ROUTES.find((r) => r.path === '/report-incident'),
    }),
  },

  // 8. Daily Bulletins & Reports
  {
    patterns: [
      /(bulletin|advisory|daily report|official report|cwc report|download bulletin|executive summary)/i,
    ],
    answer: () => ({
      text: `📋 **Official CWC Daily Flood Bulletins:**\n\n• Daily situation summaries compiled from Central Water Commission hydrological stations.\n• Highlights rivers flowing in Extreme or Severe flood situations.\n• Includes 150 major reservoir storage percentages and flood forecast warnings.\n• Full printable layout and one-click PDF export support.`,
      route: APP_NAV_ROUTES.find((r) => r.path === '/bulletins'),
    }),
  },

  // 9. 3D Satellite Earth Globe
  {
    patterns: [
      /(globe|3d globe|3d view|satellite earth|threejs|orbit|space view)/i,
    ],
    answer: () => ({
      text: `🌍 **3D Satellite Earth Globe View:**\n\n• Interactive WebGL orbital globe centered on India's territorial boundaries.\n• High-resolution satellite imagery with realistic atmospheric scattering and cloud layers.\n• 60fps GPU acceleration. Press **Esc** or click **Exit 3D View** anytime to return.`,
      route: APP_NAV_ROUTES.find((r) => r.path === 'globe'),
    }),
  },

  // 10. Technical Help, API & Architecture
  {
    patterns: [
      /(api|documentation|docs|developer|rest|json|architecture|how it works|source code)/i,
    ],
    answer: () => ({
      text: `💻 **FlowShield Technical Architecture & REST API:**\n\n• **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Motion.\n• **Data Layer:** TanStack Query with 3-minute polling cycles and automatic window re-focus sync.\n• **REST Endpoints:** Public CWC hydrographic feeds at \`/api/v1/stations\`, \`/api/v1/basins\`, and \`/api/v1/bulletins\`.\n• **Accessibility:** 100% WCAG 2.1 AA compliant, responsive layout, dark/light themes, and bilingual support.`,
      route: APP_NAV_ROUTES.find((r) => r.path === '/help'),
    }),
  },
];

// ─── Real-Time City & Regional Flood Scenario Intelligence ──────────────────

export function getCityOrRegionalScenarioResponse(query: string): { text: string; route?: NavRoute } | null {
  const q = query.toLowerCase().trim();

  // 1. Patna & Bihar Flood Scenario
  if (
    q.includes('patna') ||
    q.includes('digha') ||
    (q.includes('bihar') && (q.includes('flood') || q.includes('scenario') || q.includes('status') || q.includes('situation') || q.includes('water')))
  ) {
    const stn = MOCK_STATIONS.find((s) => s.id === 'stn-01') || {
      name: 'Patna (Digha Ghat)',
      current_level: 50.82,
      warning_level: 49.30,
      danger_level: 50.45,
      hfl: 52.52,
      inflow_cumec: 34200,
      outflow_cumec: 34100,
      trend: 'Rising',
    };
    const currentLevel = Number(stn.current_level ?? 50.82);
    const dangerLevel = Number(stn.danger_level ?? 50.45);
    const warningLevel = Number(stn.warning_level ?? 49.30);
    const hfl = Number(stn.hfl ?? 52.52);
    const diff = (currentLevel - dangerLevel).toFixed(2);
    const inflow = stn.inflow_cumec ? stn.inflow_cumec.toLocaleString() : '34,200';
    const outflow = stn.outflow_cumec ? stn.outflow_cumec.toLocaleString() : '34,100';

    return {
      text: `📍 **Current Flood Scenario — Patna (Bihar):**\n\n` +
        `• **River & Reach:** River Ganga at **${stn.name}** (Station \`GNG-PAT-01\`, Middle Ganga Basin)\n` +
        `• **Live Stage Telemetry:** **${currentLevel} m** (Warning Level: ${warningLevel} m | Danger Level: ${dangerLevel} m | All-Time HFL: ${hfl} m)\n` +
        `• **Current Severity:** 🔴 **Severe Flood Situation** — Flowing **+${diff} m above Danger Level** with a **${stn.trend || 'Rising'}** trend (+2 cm/hr)\n` +
        `• **Hydrographic Discharge:** Inflow: **${inflow} cumec** | Outflow: **${outflow} cumec**\n\n` +
        `📋 **Official CWC Advisory:**\n` +
        `*"River Ganga at Patna (Digha Ghat) is flowing 0.37m above its Danger Level with a rising trend of 2cm/hr. Farakka Barrage is discharging 48,200 cumec to balance reservoir pondage."*\n\n` +
        `⚠️ **Vulnerable Zones & Inundation Risk:**\n` +
        `Backflow from the swollen Ganga and Punpun rivers has put low-lying floodplains in **Rajendra Nagar**, **Kankarbagh**, **Digha**, **Danapur**, **Maner**, and **Fatuha** on alert. Sump drainage stations are running on auxiliary generator power.\n\n` +
        `🚨 **Emergency Contacts & Flood Relief Hubs (Bihar):**\n` +
        `• **Patna District Control Room:** **1077**\n` +
        `• **Bihar State Disaster Management (BSDMA):** **1070** (Toll-Free)\n` +
        `• **NDRF 9th Battalion Base (Bihta, Patna):** **011-24363260** / **112**\n` +
        `• **Emergency Medical & Ambulance:** **108**`,
      route: APP_NAV_ROUTES.find((r) => r.path === '/stations'),
    };
  }

  // 2. Delhi NCR & Yamuna River Scenario
  if (
    !q.includes('basin') &&
    (q.includes('delhi') ||
      (q.includes('yamuna') && !q.includes('ganga')) ||
      q.includes('ncr') ||
      q.includes('okhla') ||
      q.includes('wazirabad'))
  ) {
    const stn = MOCK_STATIONS.find((s) => s.id === 'stn-05') || {
      name: 'Delhi (Old Railway Bridge)',
      current_level: 206.15,
      warning_level: 204.50,
      danger_level: 205.33,
      hfl: 208.66,
      trend: 'Rising',
      inflow_cumec: 7850,
      outflow_cumec: 7800,
    };
    const currentLevel = Number(stn.current_level ?? 206.15);
    const dangerLevel = Number(stn.danger_level ?? 205.33);
    const warningLevel = Number(stn.warning_level ?? 204.50);
    const hfl = Number(stn.hfl ?? 208.66);
    const diff = (currentLevel - dangerLevel).toFixed(2);
    const inflow = stn.inflow_cumec ? stn.inflow_cumec.toLocaleString() : '7,850';
    const outflow = stn.outflow_cumec ? stn.outflow_cumec.toLocaleString() : '7,800';

    return {
      text: `📍 **Current Flood Scenario — Delhi NCR (River Yamuna):**\n\n` +
        `• **Station:** **${stn.name}** (\`YMN-DEL-05\`)\n` +
        `• **Live Stage Telemetry:** **${currentLevel} m** (Warning Level: ${warningLevel} m | Danger Level: ${dangerLevel} m | All-Time HFL: ${hfl} m)\n` +
        `• **Current Severity:** 🔴 **Severe Flood Situation** — Flowing **+${diff} m above Danger Mark** with a **${stn.trend || 'Rising'}** trend\n` +
        `• **Discharge:** Inflow: **${inflow} cumec** | Outflow: **${outflow} cumec**\n\n` +
        `📋 **Advisory & Floodplain Warning:**\n` +
        `Substantial discharges released from Hathnikund Barrage (Haryana) are traversing the Delhi corridor. Inundation alerts are active for low-lying settlements in **Yamuna Bazar**, **Monastery Market**, **Bela Estate**, and **Mayur Vihar**.\n\n` +
        `🚨 **Helplines:** Delhi Disaster Control **1077** | National Emergency **112**`,
      route: APP_NAV_ROUTES.find((r) => r.path === '/stations'),
    };
  }

  // 3. Assam & Brahmaputra Basin Scenario
  if (
    q.includes('guwahati') ||
    q.includes('assam') ||
    q.includes('brahmaputra') ||
    q.includes('dibrugarh') ||
    q.includes('tezpur') ||
    q.includes('kaziranga')
  ) {
    return {
      text: `📍 **Current Flood Scenario — Assam (Brahmaputra Basin):**\n\n` +
        `• **Stations Monitored:** Guwahati (\`BHP-GUW-08\`), Dibrugarh (\`BHP-DIB-09\`), and Tezpur (\`BHP-TEZ-10\`)\n` +
        `• **Current Status:** 🔴 **Severe Flood Situation** across 28 districts\n` +
        `• **Guwahati Stage:** **49.68 m** (Danger Level: 49.68 m) — River Brahmaputra flowing right at the Danger Mark with sustained monsoonal inflow.\n` +
        `• **Ground Impact:** Over 2.4 million people impacted across Darrang, Morigaon, Kamrup, and Barpeta. 70%+ of Kaziranga National Park inundated.\n\n` +
        `🚨 **Helplines:** Assam SDMA **1070** | Guwahati Control **1077** | NDRF 1st Bn (Patgaon) **011-24363260**`,
      route: APP_NAV_ROUTES.find((r) => r.path === '/basins'),
    };
  }

  // 4. Vijayawada, Krishna & Budameru Scenario
  if (
    q.includes('vijayawada') ||
    q.includes('budameru') ||
    q.includes('prakasam') ||
    (q.includes('krishna') && (q.includes('river') || q.includes('flood') || q.includes('barrage')))
  ) {
    return {
      text: `📍 **Current Flood Scenario — Vijayawada (Krishna Basin, Andhra Pradesh):**\n\n` +
        `• **Key Station:** **Vijayawada (Prakasam Barrage)** (\`KRS-VIJ-15\`)\n` +
        `• **Current Stage:** **17.85 m** (Danger Level: 17.50 m) — 🔴 **Severe Status**\n` +
        `• **Barrage Discharge:** Over **400,000 cusecs** released through 70 crest gates into the Bay of Bengal.\n` +
        `• **Budameru Rivulet Watch:** Flash breaches along Budameru diversion canal causing waterlogging in Ajit Singh Nagar, Payakapuram, and Vidyadharapuram.\n\n` +
        `🚨 **Helplines:** Andhra Pradesh SDMA **1070** | Vijayawada Control **1077** | NDRF Mangalagiri **112**`,
      route: APP_NAV_ROUTES.find((r) => r.path === '/stations'),
    };
  }

  // 5. Varanasi, Prayagraj & Farakka (Ganga Corridor)
  if (
    q.includes('varanasi') ||
    q.includes('prayagraj') ||
    q.includes('allahabad') ||
    q.includes('farakka')
  ) {
    return {
      text: `📍 **Current Flood Scenario — Ganga Basin (Uttar Pradesh & West Bengal):**\n\n` +
        `• **Varanasi (\`GNG-VAR-02\`):** **70.92 m** (Warning: 70.26 m, Danger: 71.26 m) — 🟡 **Above Normal**. Historic riverfront ghats partially submerged; small boat traffic suspended.\n` +
        `• **Prayagraj Sangam (\`GNG-PRY-03\`):** **83.25 m** (Danger: 84.73 m) — 🟢 **Normal**, trending steady.\n` +
        `• **Farakka Barrage (\`GNG-FRK-04\`):** **22.45 m** (Danger: 22.25 m) — 🔴 **Severe**. Outflow: 48,200 cumec.\n\n` +
        `🚨 **Helplines:** UP Relief Commissioner **1070** | District Disaster **1077** | Emergency **112**`,
      route: APP_NAV_ROUTES.find((r) => r.path === '/stations'),
    };
  }

  // 6. National Flood Scenario (India / National / Overall / How many rivers)
  if (
    q.includes('india') ||
    q.includes('national') ||
    q.includes('overall') ||
    q.includes('how many river') ||
    q.includes('country') ||
    ((q.includes('current scenario') || q.includes('current situation') || q.includes('flood scenario')) &&
      !q.includes('patna') &&
      !q.includes('delhi'))
  ) {
    const severeCount = MOCK_STATIONS.filter((s) => s.status === 'Severe' || s.status === 'Extreme').length;
    const warningCount = MOCK_STATIONS.filter((s) => s.status === 'Above normal').length;
    const normalCount = MOCK_STATIONS.filter((s) => s.status === 'Normal').length;

    return {
      text: `🇮🇳 **National Flood Scenario — India (Central Water Commission Overview):**\n\n` +
        `• **Active Monitoring Network:** **1,500 Telemetry Stations** across 20 River Basins.\n` +
        `• **Stations in Severe/Extreme Flood:** 🔴 **${severeCount} Key Reaches** (including River Ganga at Patna, Farakka, Yamuna at Delhi, Brahmaputra at Guwahati, and Krishna at Prakasam Barrage).\n` +
        `• **Stations in Above Normal / Watch:** 🟡 **${warningCount} Stations** approaching Danger thresholds.\n` +
        `• **Stations at Normal Stage:** 🟢 **${normalCount} Stations** within safe discharge limits.\n\n` +
        `🌊 **Basin Risk Hotspots:**\n` +
        `1. **Middle Ganga Basin (Bihar & Eastern UP):** Inundation risk along Patna, Buxar, and Bhagalpur.\n` +
        `2. **Upper Brahmaputra Basin (Assam):** Monsoonal flash surges across 28 districts.\n` +
        `3. **Lower Krishna Basin (Andhra Pradesh):** Heavy upstream dam spillway discharges.\n\n` +
        `🚨 **National Unified Helpline:** **112** | **NDRF HQ Control Room:** **011-24363260**`,
      route: APP_NAV_ROUTES.find((r) => r.path === '/'),
    };
  }

  // 7. Dynamic search across all 30+ CWC stations for any named city, district, or river
  for (const stn of MOCK_STATIONS) {
    const nameMatch = stn.name.toLowerCase();
    const distMatch = stn.district?.toLowerCase() || '';
    const stateMatch = stn.state?.toLowerCase() || '';
    const riverMatch = (stn.river || '').toLowerCase();

    if (
      q.includes(nameMatch) ||
      (distMatch && q.includes(distMatch)) ||
      (stateMatch && q.includes(stateMatch) && (q.includes('flood') || q.includes('scenario') || q.includes('status'))) ||
      (riverMatch && q.includes(riverMatch) && (q.includes('flood') || q.includes('scenario') || q.includes('status') || q.includes('water')))
    ) {
      const statusIcon =
        stn.status === 'Severe' || stn.status === 'Extreme'
          ? '🔴'
          : stn.status === 'Above normal'
          ? '🟡'
          : '🟢';
      return {
        text: `📍 **Hydrological Status — ${stn.name} (${stn.state}):**\n\n` +
          `• **River & Basin:** River **${stn.river}** (${stn.basin} Basin)\n` +
          `• **Live Stage Telemetry:** **${stn.current_level} m** (Warning: ${stn.warning_level} m | Danger: ${stn.danger_level} m | HFL: ${stn.hfl} m)\n` +
          `• **Current Classification:** ${statusIcon} **${stn.status}** (${stn.trend} Trend)\n` +
          `• **Discharge:** Inflow: ${stn.inflow_cumec?.toLocaleString() || 'N/A'} cumec | Outflow: ${stn.outflow_cumec?.toLocaleString() || 'N/A'} cumec\n\n` +
          `🚨 **Emergency Helplines:** State Disaster Control **1070** | District **1077** | ERSS **112**`,
        route: APP_NAV_ROUTES.find((r) => r.path === '/stations'),
      };
    }
  }

  return null;
}

export function answerQueryWithKnowledgeBase(query: string): { text: string; route?: NavRoute } {
  const q = query.trim();

  // 1. Check for city / regional / national scenario queries first
  const scenarioResponse = getCityOrRegionalScenarioResponse(q);
  if (scenarioResponse) {
    return scenarioResponse;
  }

  // 2. Try matching registered knowledge domains
  for (const entry of KNOWLEDGE_BASE) {
    if (entry.patterns.some((p) => p.test(q))) {
      return entry.answer(q);
    }
  }

  // 3. Fallback intelligent response
  return {
    text: `FlowShield AI monitors **1,500 Central Water Commission stations** across 20 river basins in India.\n\nI can answer flood queries or navigate you directly:\n• *"What is Danger Level vs Warning Level?"*\n• *"What are the national emergency helplines?"*\n• *"NDMA flood safety guidelines"*\n• *"Current scenario of flood in Patna or Delhi"*\n• *"Navigate to Stations"* or *"Open River Basins"*\n• *"Launch 3D Satellite Earth"*`,
    route: APP_NAV_ROUTES.find((r) => r.path === '/stations'),
  };
}

// ─── Gemini Function Declarations (Tools) ───────────────────────────────────

const GEMINI_TOOLS = [
  {
    function_declarations: [
      {
        name: 'navigate_to_page',
        description:
          'Navigate the application to a specific section or page. Use "/", "/stations", "/basins", "/bulletins", "/disasters", "/watchlist", "/report-incident", "/contact", "/export", "/help", or "globe".',
        parameters: {
          type: 'object',
          properties: {
            route: {
              type: 'string',
              description: 'Target route path or "globe"',
            },
          },
          required: ['route'],
        },
      },
    ],
  },
];

function buildSystemPrompt(_ctx: SimulationContext): string {
  return `You are FlowShield AI — the national flood intelligence assistant and command navigator for FlowShield India.
You monitor 1,500 Central Water Commission stations across 20 river basins in India.
CRITICAL INSTRUCTIONS:
1. When the user asks to go to, open, see, or navigate to a page, call "navigate_to_page" with the route ("/", "/stations", "/basins", "/bulletins", "/disasters", "/watchlist", "/report-incident", "/contact", "/export", "/help", "globe").
2. For questions about water levels, explain Warning Level vs Danger Level vs HFL.
3. For emergencies, give 112, 1070, 1077, and NDRF 011-24363260.
4. Keep responses concise, authoritative, and formatted in clean markdown.`;
}

// ─── Component ──────────────────────────────────────────────────────────────

export const AIChatbot: React.FC<AIChatbotProps> = ({
  context = DEFAULT_SIM_CONTEXT,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const navigate = useNavigate();

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "👋 **Welcome to FlowShield AI Navigator!**\n\nI can navigate to any section or answer queries about flood telemetry and emergency helplines.\n\n⌨️ **Shortcuts:** Press **Ctrl+K** or **Cmd+K** anywhere to open/close.\n\n**Quick Commands:**\n• `/stations` or *\"Go to stations\"*\n• `/basins` or *\"River basins status\"*\n• `/contact` or *\"Emergency helplines\"*\n• `/globe` or *\"3D Satellite Earth\"*",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global Keyboard Shortcut: Ctrl+K / Cmd+K (Capture phase) + Escape to close
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const isK = e.key === 'k' || e.key === 'K';
      if ((e.metaKey || e.ctrlKey) && isK) {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen((prev) => !prev);
        return;
      }

      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown, true);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown, true);
  }, [isOpen]);

  // Custom event listener to open chatbot from external buttons
  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
    };
    window.addEventListener('fs-open-chatbot', handleOpen);
    return () => window.removeEventListener('fs-open-chatbot', handleOpen);
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isThinking, isOpen]);

  // Focus & select input on open
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Execute route navigation
  const executeNavigation = useCallback(
    (targetPath: string) => {
      if (targetPath === 'globe' || targetPath.includes('globe')) {
        window.dispatchEvent(new CustomEvent('fs-replay-intro'));
        setIsOpen(false);
        return;
      }

      navigate(targetPath);

      // On mobile, auto-close chat after navigation to let user see page
      if (window.innerWidth < 768) {
        setIsOpen(false);
      }
    },
    [navigate]
  );

  // Filter routes matching user input for command suggestions
  const matchingRoutes = useMemo(() => {
    const cleanInput = input.trim().toLowerCase().replace(/^\/+/, '');
    if (!cleanInput) {
      return APP_NAV_ROUTES.slice(0, 4);
    }
    return APP_NAV_ROUTES.filter(
      (r) =>
        r.label.toLowerCase().includes(cleanInput) ||
        r.path.toLowerCase().replace(/^\/+/, '').includes(cleanInput) ||
        r.keywords.some((kw) => kw.includes(cleanInput))
    ).slice(0, 5);
  }, [input]);

  // Reset selected index when matching routes change
  useEffect(() => {
    setSelectedIndex(0);
  }, [matchingRoutes]);

  // Send message or execute command
  const sendMessage = useCallback(
    async (textOverride?: string) => {
      const text = (textOverride || input).trim();
      if (!text || isThinking) return;

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: text,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMsg]);
      if (!textOverride) setInput('');
      setIsThinking(true);

      // 1. Check if user typed a direct navigation command
      const navTarget = findCommandNavigationIntent(text);
      if (navTarget) {
        executeNavigation(navTarget.path);
        const confirmMsg =
          navTarget.path === 'globe'
            ? `🌍 **Launching 3D Satellite Earth Globe...**\n\nCentered on Survey of India coordinates. Press **Esc** or click **Exit 3D View** anytime to return to the 2D dashboard.`
            : `🚀 **Navigated to ${navTarget.label}** (\`${navTarget.path}\`)\n\n${navTarget.description}. You can click the link below to revisit anytime.`;

        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: `ai-${Date.now()}`,
              role: 'assistant',
              content: confirmMsg,
              suggestedRoute: navTarget,
              navigated: true,
              timestamp: Date.now(),
            },
          ]);
          setIsThinking(false);
        }, 150);
        return;
      }

      // 2. If Gemini API key is configured and valid, call Gemini 2.0 Flash
      if (API_KEYS.GEMINI && API_KEYS.GEMINI.startsWith('AIza')) {
        try {
          const recentMessages = [...messages.slice(-8), userMsg];
          const contents = recentMessages
            .filter((m) => m.role !== 'system')
            .map((m) => ({
              role: m.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: m.content }],
            }));

          const response = await fetch(`${API_ENDPOINTS.GEMINI}?key=${API_KEYS.GEMINI}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              system_instruction: {
                parts: [{ text: buildSystemPrompt(context) }],
              },
              contents,
              tools: GEMINI_TOOLS,
              generationConfig: {
                temperature: 0.6,
                maxOutputTokens: 800,
              },
            }),
          });

          if (response.ok) {
            const data = await response.json();
            const candidate = data.candidates?.[0];
            const parts = candidate?.content?.parts || [];

            let responseText = '';
            let targetRoute: NavRoute | undefined;

            for (const part of parts) {
              if (part.text && !part.thought) responseText += part.text;
              if (part.functionCall) {
                const { name, args } = part.functionCall;
                if (name === 'navigate_to_page' && args?.route) {
                  const matched =
                    findDirectRouteMatch(args.route) ||
                    APP_NAV_ROUTES.find(
                      (r) => r.path === args.route || r.keywords.includes(args.route.toLowerCase())
                    );
                  if (matched) {
                    targetRoute = matched;
                    executeNavigation(matched.path);
                    responseText = `🚀 **Navigated to ${matched.label}** (\`${matched.path}\`)\n\n${responseText || matched.description}`;
                  }
                }
              }
            }

            if (responseText) {
              setMessages((prev) => [
                ...prev,
                {
                  id: `ai-${Date.now()}`,
                  role: 'assistant',
                  content: responseText,
                  suggestedRoute: targetRoute,
                  timestamp: Date.now(),
                },
              ]);
              setIsThinking(false);
              return;
            }
          }
        } catch {
          // Gracefully continue to offline intelligence engine
        }
      }

      // 3. Fallback: Authoritative Local Intelligence Knowledge Engine
      setTimeout(() => {
        const { text: responseText, route } = answerQueryWithKnowledgeBase(text);

        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            content: responseText,
            suggestedRoute: route,
            timestamp: Date.now(),
          },
        ]);
        setIsThinking(false);
      }, 250);
    },
    [input, isThinking, messages, context, executeNavigation]
  );

  // Keyboard navigation inside input (ArrowDown, ArrowUp, Enter, Tab)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (matchingRoutes.length > 0) {
        setSelectedIndex((prev) => (prev + 1) % matchingRoutes.length);
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (matchingRoutes.length > 0) {
        setSelectedIndex((prev) => (prev - 1 + matchingRoutes.length) % matchingRoutes.length);
      }
      return;
    }

    if (e.key === 'Tab' && matchingRoutes.length > 0) {
      e.preventDefault();
      const target = matchingRoutes[selectedIndex] || matchingRoutes[0];
      setInput(target.path);
      return;
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();

      // If user typed a direct route match or highlighted a suggested route
      const clean = input.trim().toLowerCase();
      if (clean.startsWith('/') || clean.length < 20) {
        const direct = findDirectRouteMatch(clean);
        if (direct) {
          executeNavigation(direct.path);
          sendMessage(clean);
          return;
        }
      }

      // If user pressed Enter and there is a highlighted match while typing a command
      if (matchingRoutes.length > 0 && clean.startsWith('/')) {
        const target = matchingRoutes[selectedIndex] || matchingRoutes[0];
        executeNavigation(target.path);
        sendMessage(`Go to ${target.label}`);
        return;
      }

      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Chatbot Launcher Button (Bottom-Right, Clears Mobile Nav) */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-50 flex items-center gap-2 px-3.5 py-3 rounded-full bg-[var(--primary)] hover:brightness-110 text-white shadow-xl border border-[var(--border)] cursor-pointer group active:scale-95 transition-transform select-none"
            title="Open FlowShield AI Navigator (Ctrl+K / ⌘K)"
            aria-label="Open Flood Intelligence Assistant"
          >
            <div className="relative flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[var(--live)] animate-ping" />
            </div>
            <span className="hidden sm:inline font-semibold text-xs text-white pr-1">
              AI Navigator
            </span>
            <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono rounded bg-black/25 text-white/90 border border-white/20">
              ⌘K
            </kbd>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window Dialog / Command Navigator */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-50 w-[460px] max-w-[calc(100vw-2rem)] h-[620px] max-h-[calc(100vh-6.5rem)] flex flex-col rounded-2xl bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] shadow-2xl overflow-hidden backdrop-blur-md"
            role="dialog"
            aria-label="FlowShield AI Navigator Dialog"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[var(--surface-2)] border-b border-[var(--border)] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-[var(--primary)]/15 border border-[var(--primary)]/30 text-[var(--live)]">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-xs sm:text-sm text-[var(--text)]">
                      FlowShield AI Navigator
                    </h3>
                    <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[var(--surface)] border border-[var(--border)] text-[var(--text-muted)]">
                      Ctrl+K / ⌘K
                    </kbd>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--live)] animate-pulse" />
                    <span>Live Page Navigation & Flood Telemetry</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
                title="Close dialog (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs sm:text-sm">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[90%] px-3.5 py-2.5 rounded-2xl leading-relaxed whitespace-pre-wrap select-text ${
                      msg.role === 'user'
                        ? 'bg-[var(--primary)] text-white rounded-br-xs'
                        : 'bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)] rounded-bl-xs'
                    }`}
                  >
                    {msg.content}

                    {/* Interactive Suggested Navigation Link */}
                    {msg.suggestedRoute && (
                      <div className="mt-2.5 pt-2.5 border-t border-[var(--border)]/60 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => executeNavigation(msg.suggestedRoute!.path)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--primary)] text-white text-xs font-semibold hover:brightness-110 active:scale-95 transition-all shadow-xs cursor-pointer"
                        >
                          <Navigation className="w-3.5 h-3.5 text-[var(--live)]" />
                          <span>Open {msg.suggestedRoute.label}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                        {msg.navigated && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-[var(--live)] font-medium">
                            <CheckCircle2 className="w-3 h-3" /> Navigated
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Thinking Indicator */}
              {isThinking && (
                <div className="flex justify-start">
                  <div className="px-3.5 py-2.5 rounded-2xl rounded-bl-xs bg-[var(--surface-2)] border border-[var(--border)] flex items-center gap-2 text-xs text-[var(--text-muted)]">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-[var(--live)] rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-[var(--live)] rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 bg-[var(--live)] rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                    <span>Analyzing flood intelligence & routes...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Real-time Dynamic Route Match Suggestions when typing */}
            {matchingRoutes.length > 0 && (
              <div className="px-3 py-2 bg-[var(--surface-2)] border-t border-[var(--border)] flex flex-col gap-1.5 text-xs shrink-0">
                <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--text-muted)]">
                  <span className="flex items-center gap-1">
                    <Command className="w-3 h-3 text-[var(--live)]" /> Quick Routes (↑↓ Enter):
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)]">
                    {matchingRoutes.length} options
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  {matchingRoutes.map((route, idx) => {
                    const Icon = route.icon;
                    const isSelected = idx === selectedIndex;
                    return (
                      <button
                        key={route.path}
                        type="button"
                        onClick={() => {
                          executeNavigation(route.path);
                          sendMessage(`Go to ${route.label}`);
                        }}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer font-medium text-xs text-left ${
                          isSelected
                            ? 'bg-[var(--primary)] text-white border-transparent shadow-xs'
                            : 'bg-[var(--surface)] text-[var(--text)] border-[var(--border)] hover:bg-[var(--surface-2)] hover:text-[var(--live)]'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Icon
                            className={`w-3.5 h-3.5 shrink-0 ${
                              isSelected ? 'text-white' : 'text-[var(--primary)]'
                            }`}
                          />
                          <span className="truncate">{route.label}</span>
                          <span
                            className={`text-[10px] font-mono shrink-0 ${
                              isSelected ? 'text-white/80' : 'text-[var(--text-muted)]'
                            }`}
                          >
                            `{route.path}`
                          </span>
                        </div>
                        <CornerDownLeft
                          className={`w-3 h-3 shrink-0 ml-2 ${
                            isSelected ? 'text-white' : 'text-[var(--text-muted)]'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick Action Navigation Chips */}
            <div className="px-3 py-1.5 bg-[var(--surface-2)] border-t border-[var(--border)] flex gap-1.5 overflow-x-auto scrollbar-none shrink-0">
              {[
                { label: '🌊 Stations', prompt: 'Take me to stations' },
                { label: '🏞️ Basins', prompt: 'Go to basins' },
                { label: '🌍 3D Globe', prompt: 'Launch 3D globe' },
                { label: '🚨 SOS Helplines', prompt: 'Emergency helpline numbers' },
                { label: '⚠️ Warning vs Danger', prompt: 'What is Warning Level vs Danger Level?' },
                { label: '📜 Disasters', prompt: 'Open disaster history' },
                { label: '📋 Bulletins', prompt: 'Show flood bulletins' },
              ].map((qp) => (
                <button
                  key={qp.label}
                  type="button"
                  onClick={() => sendMessage(qp.prompt)}
                  className="shrink-0 text-[11px] px-2.5 py-1 rounded-lg bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)] border border-[var(--border)] transition-all cursor-pointer whitespace-nowrap active:scale-95"
                >
                  {qp.label}
                </button>
              ))}
            </div>

            {/* Chat Input Bar */}
            <div className="p-3 bg-[var(--surface)] border-t border-[var(--border)] shrink-0">
              <div className="flex items-center gap-2">
                <div className="relative flex-1 flex items-center">
                  <Search className="w-3.5 h-3.5 absolute left-3 text-[var(--text-muted)] pointer-events-none" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type /stations, a page name, or ask a question..."
                    disabled={isThinking}
                    className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] transition-all disabled:opacity-50"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => sendMessage()}
                  disabled={isThinking || !input.trim()}
                  className="p-2 rounded-xl bg-[var(--primary)] hover:opacity-90 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs shrink-0"
                  title="Send message or navigate"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatbot;

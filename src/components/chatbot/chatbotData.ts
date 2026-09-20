/**
 * FLOWSHIELD — Chatbot Data & Logic (non-component exports)
 *
 * Separated from AIChatbot.tsx to maintain React Fast Refresh compatibility.
 * (HMR requires component files export ONLY React components, not mixed constants)
 */

import {
  Radio,
  Waves,
  FileText,
  AlertTriangle,
  Clock,
  ShieldCheck,
  PhoneCall,
  Download,
  HelpCircle,
  Globe,
} from 'lucide-react';
import type { ElementType } from 'react';
import { MOCK_STATIONS } from '../../api/mockData';
import type { SimConfig, SimStats } from '../../sim/types';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface NavRoute {
  path: string;
  label: string;
  category: string;
  description: string;
  icon: ElementType;
  keywords: string[];
}

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
  payload?: unknown;
  description?: string;
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

// ─── App Routes Registry ────────────────────────────────────────────────────

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
    path: '/simulate',
    label: 'Flood Simulation Engine',
    category: 'Simulation',
    description: 'Physics-based flood simulation with configurable rainfall, drainage, terrain & scenario comparison',
    icon: Waves,
    keywords: ['simulate', 'simulation', 'flood model', 'flood simulation', 'physics', 'rainfall model', 'drainage model', 'grid', 'scenario', 'critical', 'warning', 'water flow', 'time slider'],
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

// ─── Intent Recognition ──────────────────────────────────────────────────────

const QUESTION_STARTERS = [
  'what', 'how', 'why', 'where', 'who', 'when', 'which',
  'can you', 'could you', 'is there', 'are there',
  'tell me', 'explain', 'difference', 'meaning', 'define',
  'status', 'guideline', 'advice', 'tips', 'numbers', 'helpline numbers',
];

const NAVIGATION_VERBS = [
  'go to', 'navigate to', 'open', 'take me to', 'show me',
  'switch to', 'visit', 'launch', 'head to', 'browse', 'jump to', 'see',
];

export function isExplicitQuestion(query: string): boolean {
  const q = query.trim().toLowerCase();
  if (q.endsWith('?')) return true;
  return QUESTION_STARTERS.some((qs) => q.startsWith(qs) || q.includes(` ${qs} `));
}

export function findDirectRouteMatch(input: string): NavRoute | null {
  const clean = input.trim().toLowerCase().replace(/^\/+/, '');

  for (const route of APP_NAV_ROUTES) {
    const routeClean = route.path.replace(/^\/+/, '');
    if (clean === routeClean) return route;
    if (clean === route.label.toLowerCase()) return route;
  }

  if (['stations', 'station', 'gauges', 'water level', 'telemetry'].includes(clean))
    return APP_NAV_ROUTES.find((r) => r.path === '/stations') || null;
  if (['basins', 'basin', 'rivers', 'river'].includes(clean))
    return APP_NAV_ROUTES.find((r) => r.path === '/basins') || null;
  if (['bulletins', 'bulletin', 'advisories', 'advisory'].includes(clean))
    return APP_NAV_ROUTES.find((r) => r.path === '/bulletins') || null;
  if (['disasters', 'disaster', 'history', 'archives'].includes(clean))
    return APP_NAV_ROUTES.find((r) => r.path === '/disasters') || null;
  if (['watchlist', 'watch', 'saved', 'favorites'].includes(clean))
    return APP_NAV_ROUTES.find((r) => r.path === '/watchlist') || null;
  if (['report', 'incident', 'report incident', 'ground report'].includes(clean))
    return APP_NAV_ROUTES.find((r) => r.path === '/report-incident') || null;
  if (['contact', 'sos', 'helpline', 'helplines', 'emergency', 'phone'].includes(clean))
    return APP_NAV_ROUTES.find((r) => r.path === '/contact') || null;
  if (['help', 'docs', 'api', 'documentation', 'methodology'].includes(clean))
    return APP_NAV_ROUTES.find((r) => r.path === '/help') || null;
  if (['export', 'download', 'csv', 'geojson'].includes(clean))
    return APP_NAV_ROUTES.find((r) => r.path === '/export') || null;
  if (['globe', '3d globe', 'earth', 'satellite earth', '3d'].includes(clean))
    return APP_NAV_ROUTES.find((r) => r.path === 'globe') || null;
  if (['home', 'overview', 'map', 'national map'].includes(clean))
    return APP_NAV_ROUTES.find((r) => r.path === '/') || null;

  return null;
}

export function findCommandNavigationIntent(query: string): NavRoute | null {
  const q = query.trim().toLowerCase();
  if (isExplicitQuestion(q)) return null;

  const direct = findDirectRouteMatch(q);
  if (direct) return direct;

  for (const verb of NAVIGATION_VERBS) {
    if (q.startsWith(verb) || q.includes(` ${verb} `)) {
      const rest = q.replace(verb, '').trim();
      const matched = findDirectRouteMatch(rest);
      if (matched) return matched;
      for (const route of APP_NAV_ROUTES) {
        if (route.keywords.some((kw) => rest.includes(kw))) return route;
      }
    }
  }

  return null;
}

// ─── Comprehensive Knowledge Base ────────────────────────────────────────────

interface KnowledgeEntry {
  patterns: RegExp[];
  answer: (q: string) => { text: string; route?: NavRoute };
}

const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  // ── 0. Greetings & Identity ──
  {
    patterns: [
      /^(hello|hi|hey|greetings|namaste|good morning|good afternoon|good evening|who are you|what are you|introduce yourself|what can you do)\b/i,
    ],
    answer: () => ({
      text: `👋 **Namaste! I'm FlowShield AI** — India's national flood intelligence assistant.\n\n**I can help you with:**\n\n🌊 **Live Flood Data**\n• *"Current flood situation in Patna / Delhi / Assam / Mumbai"*\n• *"Which rivers are in danger level right now?"*\n• *"How many stations are in flood stage?"*\n\n📋 **CWC Standards & Info**\n• *"What is Warning Level vs Danger Level vs HFL?"*\n• *"What is cumec / cusec?"*\n• *"How does flood classification work?"*\n\n🚨 **Emergency & Safety**\n• *"Emergency helpline numbers"*\n• *"NDMA flood safety guidelines"*\n• *"What to do if flood is approaching?"*\n\n🗺️ **Navigate the App**\n• Type \`/stations\`, \`/basins\`, \`/contact\`, \`/globe\` to jump directly\n\nHow can I help you today?`,
    }),
  },

  // ── 1. CWC Water Level Standards ──
  {
    patterns: [/(warning level|danger level|hfl|highest flood level|critical level|stage level|threshold|what is wl|what is dl|flood stage|classification|normal level|flood category)/i],
    answer: () => ({
      text: `🌊 **CWC Flood Classification System (India):**\n\n| Status | Definition | Authority Response |\n|--------|-----------|-------------------|\n| 🟢 **Normal** | Below Warning Level | Routine monitoring |\n| 🟡 **Above Normal** | Between Warning & Danger | State alert, preparedness |\n| 🟠 **Warning** | At or above Warning Level | District evacuation prep |\n| 🔴 **Danger** | At or above Danger Level | Full emergency, NDRF deployment |\n| 🚨 **Extreme/Severe** | Surpassing historical records | Crisis management mode |\n\n**Key Benchmarks:**\n• **Warning Level (WL):** River spills into low-lying floodplains; district bodies alerted\n• **Danger Level (DL):** Threatens embankments & inhabited areas; mandatory evacuation\n• **HFL (Highest Flood Level):** Maximum stage ever recorded at that gauging station\n\n**Unit Note:** Stage is measured in **metres above mean sea level (m MSL)**`,
      route: APP_NAV_ROUTES.find((r) => r.path === '/stations'),
    }),
  },

  // ── 2. What is Cumec / Cusec ──
  {
    patterns: [/(cumec|cusec|discharge unit|cubic metre|cubic feet|flow rate|what is cumec|what is cusec|m3.s|flow measurement)/i],
    answer: () => ({
      text: `💧 **Hydrological Flow Units Explained:**\n\n• **Cumec** = Cubic Metre per Second (m³/s) — the SI unit used by CWC India\n  → 1 cumec = 1 cubic metre of water passing a point every second\n\n• **Cusec** = Cubic Feet per Second (ft³/s) — older imperial unit still used for dam discharges\n  → 1 cumec = **35.315 cusecs**\n\n**Reference Scale:**\n• Small stream: ~5–50 cumec\n• River in normal monsoon: 500–5,000 cumec\n• Ganga at Patna (flood peak): ~80,000–1,00,000 cumec\n• Brahmaputra peak flood: ~70,000 cumec\n• Farakka Barrage normal outflow: ~40,000–50,000 cumec\n\nFlowShield displays **cumec (m³/s)** for all discharge readings.`,
      route: APP_NAV_ROUTES.find((r) => r.path === '/stations'),
    }),
  },

  // ── 3. Emergency Helplines ──
  {
    patterns: [/(helpline|emergency number|sos|phone number|contact number|call|ndrf|sdrf|rescue|fire brigade|ambulance|control room|disaster number|flood helpline|112|1070|1077)/i],
    answer: () => ({
      text: `🚨 **National Emergency & Flood Helplines (India):**\n\n| Number | Service |\n|--------|--------|\n| **112** | National Emergency Response (Police, Fire, Ambulance) |\n| **1070** | State Disaster Management Authority (SDMA) — Toll Free |\n| **1077** | District Disaster Management Authority (DDMA) |\n| **011-24363260** | NDRF Headquarters (National Disaster Response Force) 24×7 |\n| **9711077372** | NDRF Control Room (alternate) |\n| **108** | National Ambulance Emergency Service |\n| **1072** | Railway Disaster Relief Helpline |\n| **1938** | National Disaster Helpline |\n\n**State-wise control rooms** and direct one-tap dialing are available on the Emergency Contacts page.`,
      route: APP_NAV_ROUTES.find((r) => r.path === '/contact'),
    }),
  },

  // ── 4. NDMA Safety Guidelines ──
  {
    patterns: [/(safety|precaution|what to do|what should i do|protect|evacuate|go bag|survival|drinking water|protocol|ndma|during flood|before flood|after flood|flood preparedness|flood warning|flood alert|how to stay safe)/i],
    answer: () => ({
      text: `🛡️ **Official NDMA Flood Safety Protocol (India):**\n\n**BEFORE A FLOOD:**\n1. Monitor FlowShield telemetry and CWC bulletins\n2. Prepare a **Go-Bag:** 3 days water + purification tablets, dry rations, torch + batteries, waterproof ID documents, first aid kit\n3. Know your nearest evacuation centre and elevated routes\n4. Shut off electrical MCB and LPG regulators if evacuating\n\n**DURING A FLOOD:**\n5. **Move to Higher Ground immediately** — never wait in basements\n6. **15 cm (6 inches)** of fast-moving water can knock you down\n7. **30 cm (1 foot)** of floodwater can float a car — never drive through\n8. Avoid walking in floodwater — hidden manholes, live wires, debris\n9. Keep children and elderly away from flood edges\n\n**AFTER A FLOOD:**\n10. **Boil all drinking water** vigorously — 1 minute at rolling boil\n11. Do not enter a building until authorities declare it safe\n12. Watch for snakes and insects displaced by flood\n13. Report damage to District Control Room: **1077**`,
      route: APP_NAV_ROUTES.find((r) => r.path === '/help'),
    }),
  },

  // ── 5. FlowShield App — What is it / How it works ──
  {
    patterns: [/(what is flowshield|about flowshield|flowshield app|how does flowshield|tell me about this app|what does this app do|features|capabilities)/i],
    answer: () => ({
      text: `🛡️ **About FlowShield India:**\n\nFlowShield is India's **real-time national flood monitoring and intelligence platform**, built to save lives during floods.\n\n**Core Features:**\n• 🌊 **1,500 CWC Gauging Stations** with live stage telemetry (updates every 3 minutes)\n• 🗺️ **20 River Basin Risk Dashboards** with aggregated danger indices\n• 📋 **Daily CWC Bulletins** — official advisories with PDF export\n• 📜 **Disaster Archive** — verified records of Kedarnath, Kerala 2018, Wayanad 2024, etc.\n• 📱 **Citizen Ground Reports** — crowdsourced flood depth reporting with GPS\n• 🌍 **3D Satellite Globe** — WebGL-powered India orbital view\n• 🤖 **AI Navigator (me!)** — natural language flood queries + page navigation\n• 📊 **Watchlist** — pin stations of personal interest for quick monitoring\n\n**Data Sources:** Central Water Commission (CWC), GDACS, NASA EONET, IMD\n**Technology:** React 19, TypeScript, Vite, TanStack Query, Three.js, Gemini AI`,
    }),
  },

  // ── 6. Stations & Telemetry ──
  {
    patterns: [/(how many station|station count|telemetry|sensor|gauge|monitoring network|real time data|how many rivers|active station|cwc station|water level sensor)/i],
    answer: () => {
      const severeCount = MOCK_STATIONS.filter((s) => s.status === 'Severe' || s.status === 'Extreme').length;
      const aboveNormalCount = MOCK_STATIONS.filter((s) => s.status === 'Above normal').length;
      return {
        text: `📊 **FlowShield Telemetry Network:**\n\n• **1,500 Active Stations** across all major Indian river systems\n• **Update Frequency:** Every 3 minutes via satellite-linked sensors\n• **Sensor Technology:** Radar non-contact stage sensors, ultrasonic sensors, tipping-bucket rain gauges\n• **Coverage:** All 20 major river basins — Himalayan glacial rivers to peninsular deltas\n\n**Live Status (monitored stations right now):**\n• 🔴 **Severe/Extreme flood:** ${severeCount} major reaches\n• 🟡 **Above Normal/Warning:** ${aboveNormalCount} stations on alert\n• 🟢 **Normal Stage:** Remaining stations within safe limits\n\n**Major Networks:** Ganga corridor (Bihar-Bengal), Brahmaputra (Assam), Yamuna (Delhi), Krishna-Godavari (AP-Telangana), Cauvery (Karnataka-TN)`,
        route: APP_NAV_ROUTES.find((r) => r.path === '/stations'),
      };
    },

  },

  // ── 7. River Basins ──
  {
    patterns: [/(river basin|basin overview|major river|ganga basin|brahmaputra basin|godavari basin|krishna basin|cauvery basin|narmada|mahanadi|teesta|indus|peninsular|himalayan river)/i],
    answer: (q) => {
      const qLower = q.toLowerCase();
      let detail = '';
      if (qLower.includes('ganga') || qLower.includes('yamuna')) {
        detail = '\n\n**Ganga-Yamuna Basin:**\n• Length: 2,525 km | Drainage: 8.6 lakh km²\n• Key stations: Haridwar, Prayagraj, Varanasi, Patna, Farakka\n• Flood season: July–October | Peak risk: August–September\n• Upstream triggers: Glacial melt + heavy monsoon in Uttarakhand, Nepal';
      } else if (qLower.includes('brahmaputra')) {
        detail = '\n\n**Brahmaputra Basin:**\n• Length: 2,900 km (longest in India) | Drainage: 5.8 lakh km²\n• Key stations: Dhubri, Guwahati, Dibrugarh, Tezpur\n• Flood season: June–September | Annual floods displace millions\n• Special risk: Narrow gorge topography causes rapid stage rise';
      } else if (qLower.includes('krishna')) {
        detail = '\n\n**Krishna Basin:**\n• Length: 1,400 km | Drainage: 2.6 lakh km²\n• Key stations: Srisailam Dam, Prakasam Barrage, Vijayawada\n• Dam triggers: Nagarjuna Sagar + Srisailam spillway discharges cause flash flooding';
      } else if (qLower.includes('godavari')) {
        detail = '\n\n**Godavari Basin ("Dakshin Ganga"):**\n• Length: 1,465 km | India\'s second largest river by discharge\n• Key stations: Polavaram, Rajahmundry, Sir Arthur Cotton Barrage\n• 2024: Record flood discharge of 36.8 lakh cusecs at Dowleswaram Barrage';
      } else if (qLower.includes('cauvery') || qLower.includes('kaveri')) {
        detail = '\n\n**Cauvery Basin:**\n• Length: 800 km | Drainage: 81,155 km²\n• Shared between Karnataka and Tamil Nadu\n• Key stations: KRS Dam, Biligundlu, Mettur Dam\n• Flood risk peaks during northeast monsoon (Oct–Dec)';
      }
      return {
        text: `🏞️ **India's 20 Major River Basins — FlowShield Coverage:**\n\nFlowShield monitors risk indices across:\n\n| Basin | States Covered | Flood Season |\n|-------|---------------|--------------|\n| Ganga-Yamuna | UP, Bihar, WB, Uttarakhand | Jul–Oct |\n| Brahmaputra | Assam, Arunachal | Jun–Sep |\n| Godavari | Maharashtra, Telangana, AP | Jul–Oct |\n| Krishna | Karnataka, Telangana, AP | Jul–Oct |\n| Cauvery | Karnataka, Tamil Nadu | Oct–Dec |\n| Mahanadi | Odisha, Chhattisgarh | Aug–Sep |\n| Narmada | MP, Gujarat | Aug–Sep |\n| Teesta | West Bengal, Sikkim | Jun–Sep |${detail}`,
        route: APP_NAV_ROUTES.find((r) => r.path === '/basins'),
      };
    },
  },

  // ── 8. Disaster History ──
  {
    patterns: [/(disaster|history|historical|kedarnath|kerala flood|wayanad|assam flood|delhi flood|michaung|cyclone|tsunami|cloudburst|2013|2018|2024|worst flood|deadliest flood|flood record)/i],
    answer: (q) => {
      const qLower = q.toLowerCase();
      let detail = '';
      if (qLower.includes('kedarnath') || qLower.includes('2013')) {
        detail = '\n\n**2013 Kedarnath Himalayan Deluge (Uttarakhand):**\nChorabari glacial lake breach on 16–17 June 2013. 5,700+ deaths. Mandakini River peaked at catastrophic levels. 100,000+ pilgrims stranded. Costliest flood disaster in modern Indian history.';
      } else if (qLower.includes('kerala') || qLower.includes('2018')) {
        detail = '\n\n**2018 Great Kerala Floods:**\nCentennial deluge — worst since 1924. 5 million displaced, 433 deaths. Unprecedented simultaneous opening of 35+ dams including Idukki and Cheruthoni. ₹31,000 crore damages. Entire districts of Alappuzha, Thrissur, Ernakulam submerged.';
      } else if (qLower.includes('wayanad') || qLower.includes('2024')) {
        detail = '\n\n**2024 Wayanad Landslides (Kerala):**\nJuly 30, 2024: 300mm+ rainfall in 24 hours triggered catastrophic debris flows in Mundakkai and Chooralmala villages. 400+ deaths, 150+ missing. Over 1,500 hectares of tea/coffee plantations destroyed. Indian Army, NDRF, Navy deployed for search operations.';
      } else if (qLower.includes('assam')) {
        detail = '\n\n**2024 Assam Floods:**\nBrahmaputra and Barak river systems caused 2.4 million people displacement across 28 districts. 70% of Kaziranga National Park submerged (400+ animal deaths including rhinos). Dibrugarh, Dhemaji, Lakhimpur worst affected.';
      }
      return {
        text: `📜 **Verified Indian Flood & Disaster Records:**\n\n• **2024 Wayanad Landslides (Kerala):** 400+ deaths, 300mm cloudburst in 24h\n• **2024 Budameru Flash Breach (Vijayawada, AP):** Krishna basin inundated; 4.5 lakh people affected\n• **2024 Assam Brahmaputra Deluge:** 2.4M displaced across 28 districts\n• **2023 Yamuna All-Time Record (Delhi):** 208.66m — highest ever recorded\n• **2022 Assam-Meghalaya Floods:** 9 million affected; 180+ deaths\n• **2021 Uttarakhand Flash Flood:** Chamoli glacier burst; Rishiganga & Dhauliganga devastated\n• **2020 Cyclone Amphan (WB/Odisha):** ₹1 lakh crore damage; 100 deaths\n• **2018 Great Kerala Floods:** 5M displaced; 35 dams opened simultaneously\n• **2013 Kedarnath Himalayan Deluge:** 5,700+ deaths; Chorabari glacial lake burst${detail}`,
        route: APP_NAV_ROUTES.find((r) => r.path === '/disasters'),
      };
    },
  },

  // ── 9. Ground Reporting ──
  {
    patterns: [/(ground report|report incident|citizen report|submit report|upload photo|report flood|how to report|flood damage|flood photo|crowdsource)/i],
    answer: () => ({
      text: `📱 **Citizen Ground Incident Reporter — How to Report:**\n\n**Steps to submit a ground flood report:**\n1. Open **Ground Incident Reporter** (menu → Report Incident)\n2. **GPS Auto-Capture:** Your device location is tagged automatically\n3. **Describe the situation:** Select flood depth level:\n   - Ankle (< 30 cm) | Knee (30–60 cm) | Waist (60–100 cm) | Chest | Above Head\n4. **Upload photos** of flooded roads, breached embankments, or submerged infrastructure\n5. **Priority Flag:** Mark as emergency if life is at immediate risk → forwarded to NDRF\n6. **Submit** — your report enters the live ground intelligence feed\n\n**Why it matters:** Ground reports help CWC and NDRF teams identify unreported flood pockets faster than satellite data alone.\n\n📞 In immediate danger? Call **112** first — then file a report.`,
      route: APP_NAV_ROUTES.find((r) => r.path === '/report-incident'),
    }),
  },

  // ── 10. Daily Bulletins ──
  {
    patterns: [/(bulletin|advisory|daily report|official report|cwc report|download bulletin|executive summary|flood situation report|cwc advisory)/i],
    answer: () => ({
      text: `📋 **CWC Daily Flood Bulletins — FlowShield:**\n\n**What the bulletin contains:**\n• National overview of all rivers in Extreme/Severe flood situation\n• Station-level stage readings vs Warning/Danger levels\n• 150+ major reservoir storage status (% full)\n• Upstream/downstream flood forecasts (24–72 hour)\n• Cyclone and intense rainfall system alerts\n• Basin-wise situation summaries (20 basins)\n\n**How to access:**\n→ Navigate to **Daily Flood Bulletins** page\n→ Download PDF of today's executive summary\n→ Set up alerts for specific basins\n\n**Source:** Central Water Commission (CWC), Ministry of Jal Shakti, Government of India`,
      route: APP_NAV_ROUTES.find((r) => r.path === '/bulletins'),
    }),
  },

  // ── 11. 3D Globe ──
  {
    patterns: [/(globe|3d globe|3d view|satellite earth|threejs|orbit|space view|satellite view|earth view|3d map)/i],
    answer: () => ({
      text: `🌍 **3D Satellite Earth Globe — FlowShield:**\n\n• Interactive **WebGL orbital globe** centered on India's territorial boundaries\n• **High-resolution satellite imagery** with realistic cloud layers and atmospheric scattering\n• **GPU-accelerated 60fps** rendering via Three.js\n• Click and drag to orbit, scroll to zoom into any region of India\n• River basin overlays and station hotspots visible in 3D\n• Press **Esc** or click **Exit 3D View** to return to 2D dashboard\n\n→ Type *"launch globe"* or click below to open now`,
      route: APP_NAV_ROUTES.find((r) => r.path === 'globe'),
    }),
  },

  // ── 12. Flood Insurance / Compensation ──
  {
    patterns: [/(insurance|compensation|relief fund|pmrf|sdrf|ndrf fund|crop damage|flood relief|government help|aid|claim|rabi|kharif|farmer)/i],
    answer: () => ({
      text: `💰 **Flood Relief & Compensation in India:**\n\n**Government Relief Mechanisms:**\n• **SDRF (State Disaster Response Fund):** Primary source for immediate relief (food, shelter, rescue)\n• **NDRF (National Disaster Response Fund):** Supplementary funds for large-scale disasters\n• **PM Relief Fund (PMRF):** One-time ex-gratia for major disasters\n\n**Compensation Norms (SDRF Guidelines):**\n• Death ex-gratia: ₹4 lakh per family\n• House fully damaged: ₹1.2 lakh (pucca), ₹50,000 (kutcha)\n• Crop damage: Assessed per acre via state revenue departments\n• Livestock loss: ₹30,000 (large animals), ₹3,000 (small animals)\n\n**How to Apply:**\n1. Contact your **Village/Block Panchayat** or **Tehsildar office**\n2. File grievance at **District Collector's office**\n3. Check **State Disaster Management Authority** (SDMA) website\n\n📞 Helpline: District Collector Office **1077**`,
    }),
  },

  // ── 13. Dam / Reservoir Discharge ──
  {
    patterns: [/(dam|reservoir|srisailam|nagarjuna|prakasam|farakka|hirakud|mettur|bhakra|tehri|discharge|spillway|gates open|crest gate|pondage|storage)/i],
    answer: (q) => {
      const qLower = q.toLowerCase();
      let specific = '';
      if (qLower.includes('farakka')) {
        specific = '\n\n**Farakka Barrage (West Bengal, River Ganga):**\nDischarges 40,000–55,000 cumec during peak monsoon. Controls water flow to Bangladesh. When Farakka opens feeder canal, downstream Bihar & Bengal face surge risk.';
      } else if (qLower.includes('srisailam')) {
        specific = '\n\n**Srisailam Dam (AP/Telangana, River Krishna):**\nCapacity: 215.8 TMC. During 2024 floods, spilled 4,00,000+ cusecs through flood gates causing Vijayawada downstream surge.';
      } else if (qLower.includes('hirakud')) {
        specific = '\n\n**Hirakud Dam (Odisha, River Mahanadi):**\nLargest earthen dam in Asia by reservoir area. Controls Mahanadi floods into Cuttack-Bhubaneswar coastal plains.';
      }
      return {
        text: `🏗️ **Indian Dam Flood Management:**\n\nMajor reservoirs act as flood moderators but can cause **downstream surge** when spillway discharge is necessary:\n\n**Key Flood-Season Dams:**\n• **Farakka Barrage** (Ganga, WB): ~48,000 cumec outflow at peak\n• **Srisailam** (Krishna, AP/TS): 215 TMC capacity; triggers Vijayawada alerts when spilling\n• **Hirakud** (Mahanadi, Odisha): Controls coastal Odisha flooding\n• **Prakasam Barrage** (Krishna, Vijayawada): 70 crest gates; 4,00,000 cusec capacity\n• **Tehri Dam** (Ganga, Uttarakhand): Controls Haridwar/Rishikesh surge\n• **Mettur Dam** (Cauvery, TN): Controls TN delta flooding${specific}\n\n**Safety Rule:** When any dam announces gate openings, downstream districts activate emergency protocols.`,
        route: APP_NAV_ROUTES.find((r) => r.path === '/stations'),
      };
    },
  },

  // ── 14. Flood Prediction / IMD Forecast ──
  {
    patterns: [/(flood forecast|flood prediction|weather forecast|imd|monsoon|rainfall forecast|when will flood|will there be flood|rain forecast|cyclone warning|red alert|orange alert)/i],
    answer: () => ({
      text: `🌧️ **Flood Forecasting & IMD Alerts in India:**\n\n**Agencies involved:**\n• **CWC (Central Water Commission):** Issues 24–72 hour flood stage forecasts for 340 key stations\n• **IMD (India Meteorological Department):** Issues rainfall warnings (Red/Orange/Yellow alerts)\n• **NDMA:** Coordinates national-level disaster response\n\n**Alert Color Codes (IMD):**\n| Color | Meaning | Action |\n|-------|---------|--------|\n| 🟢 Green | All clear | Normal |\n| 🟡 Yellow | Watch | Be aware |\n| 🟠 Orange | Alert | Be prepared |\n| 🔴 Red | Warning | Take action now |\n\n**Flood Forecast Lead Time:**\n• Hill rivers: 6–12 hours advance warning\n• Plains rivers (Ganga, Brahmaputra): 24–72 hours\n\n**Live forecast data** is integrated into FlowShield's bulletin system and station detail pages.`,
      route: APP_NAV_ROUTES.find((r) => r.path === '/bulletins'),
    }),
  },

  // ── 15. Watchlist Feature ──
  {
    patterns: [/(watchlist|save station|pin station|favorite|monitor station|track station|my stations|alert me|personal alert)/i],
    answer: () => ({
      text: `👁️ **FlowShield Watchlist — Personal Station Monitoring:**\n\n**How it works:**\n1. Browse any station in **Stations Telemetry**\n2. Click the **bookmark/pin icon** on any station card\n3. Station is added to your **Watchlist** (stored locally in browser)\n4. View all your pinned stations at a glance in the Watchlist page\n5. Get quick-access to water levels, danger status, and trends\n\n**Best use cases:**\n• Monitoring stations near your home town\n• Tracking upstream stations before traveling downstream\n• Following a specific river basin during monsoon season\n\n**Tip:** Pin Patna (Digha Ghat) if you're in Bihar, Delhi (Old Railway Bridge) for NCR, or Guwahati for Assam.`,
      route: APP_NAV_ROUTES.find((r) => r.path === '/watchlist'),
    }),
  },

  // ── 16. Technical / API / Developers ──
  {
    patterns: [/(api|documentation|developer|rest api|json endpoint|architecture|source code|how it works|tech stack|built with|open source|github)/i],
    answer: () => ({
      text: `💻 **FlowShield Technical Architecture:**\n\n**Frontend Stack:**\n• React 19 + TypeScript 5.8 + Vite 8\n• TanStack Query (3-min polling for live data)\n• Motion (Framer Motion v12) for animations\n• Three.js for 3D Globe rendering\n• Tailwind CSS v4 design system\n\n**AI & Intelligence:**\n• Google Gemini 2.0 Flash for natural language\n• Local offline knowledge engine (domain-specific)\n• Gemini Function Calling for navigation actions\n\n**Data Sources:**\n• Central Water Commission (CWC) live telemetry\n• GDACS (Global Disaster Alert and Coordination System)\n• NASA EONET (Earth Observatory Natural Event Tracker)\n• IMD (India Meteorological Department) bulletins\n\n**REST Endpoints:**\n\`/api/v1/stations\` • \`/api/v1/basins\` • \`/api/v1/bulletins\`\n\n**Accessibility:** WCAG 2.1 AA • Bilingual (Hindi/English) • Dark/Light themes`,
      route: APP_NAV_ROUTES.find((r) => r.path === '/help'),
    }),
  },

  // ── 17. Export / Download Data ──
  {
    patterns: [/(export|download|csv|geojson|json export|data export|raw data|dataset|gis|shapefile|excel)/i],
    answer: () => ({
      text: `📥 **FlowShield Data Export:**\n\n**Available export formats:**\n• **CSV** — All station telemetry data (stage, discharge, classification)\n• **JSON** — Full structured dataset for programmatic use\n• **GeoJSON** — Station coordinates + attributes for GIS tools (QGIS, ArcGIS)\n\n**Exportable datasets:**\n• Live station readings snapshot\n• Historical stage data (7-day / 30-day)\n• Basin risk indices\n• Bulletin PDFs (printable executive summaries)\n\n**Use cases:** Research, journalism, government analysis, disaster response planning\n\n→ Navigate to **Data Export & Reports** to download`,
      route: APP_NAV_ROUTES.find((r) => r.path === '/export'),
    }),
  },

  // ── 18. Mumbai / Maharashtra Floods ──
  {
    patterns: [/(mumbai|pune|nashik|kolhapur|sangli|maharashtra flood|konkan|western ghats flood|godavari.*maharashtra)/i],
    answer: () => ({
      text: `📍 **Flood Scenario — Mumbai & Maharashtra:**\n\n**Active Monitoring Stations:**\n• **Godavari at Nashik (\`GDV-NSK-20\`):** 570.28 m (Warning: 569.50 m, Danger: 571.00 m) — 🟡 **Above Normal**\n• **Krishna at Sangli (\`KRS-SGL-18\`):** 543.82 m (Warning: 544.50 m) — 🟢 **Normal**\n\n**Mumbai Specific:**\n• Mumbai flooding is primarily **urban flash flooding** (not river overflow)\n• Mithi River at Mahim Causeway is the key indicator station\n• Peak risk: July–August when IMD issues Red Alert + Southwest monsoon intensity surge\n• Aarey Milk Colony and Powai Lake overflow historically triggers Kurla, Sion, Dharavi flooding\n\n**Key Risks:** Konkan coast (Ratnagiri, Sindhudurg), Pune (Mutha River), Nashik (Godavari), Kolhapur (Panchaganga)\n\n🚨 **Maharashtra Helplines:** NDMA Pune: **1070** | Mumbai Emergency: **1916** | NDRF 4th Bn: **112**`,
      route: APP_NAV_ROUTES.find((r) => r.path === '/stations'),
    }),
  },

  // ── 19. Odisha / Mahanadi Floods ──
  {
    patterns: [/(odisha|bhubaneswar|cuttack|mahanadi|hirakud|puri|balasore|kendrapara|odisha flood)/i],
    answer: () => ({
      text: `📍 **Flood Scenario — Odisha (Mahanadi Basin):**\n\n• **Mahanadi at Mundali (\`MHN-MND-21\`):** 23.45 m (Warning: 23.50 m, Danger: 25.00 m) — 🟡 **Approaching Warning**\n• **Hirakud Reservoir:** 626.10 m — 98% capacity; gates may open imminently\n\n**Key Vulnerability Zones:**\n• Cuttack, Kendrapara, Jagatsinghpur, Puri districts in Mahanadi delta\n• Balasore district (Subarnarekha River)\n• Cyclone-induced coastal storm surge (Bay of Bengal coast)\n\n**Odisha Preparedness:**\nOdisha is recognised for best-in-class disaster preparedness. Cyclone Shelter programme covers ~3,200 km coastline. ODRAF (Odisha Disaster Rapid Action Force) is pre-positioned during high-risk periods.\n\n🚨 **Helplines:** Odisha SDMA: **1070** | Bhubaneswar Control: **0674-2534177** | Emergency: **112**`,
      route: APP_NAV_ROUTES.find((r) => r.path === '/stations'),
    }),
  },

  // ── 20. West Bengal Flood ──
  {
    patterns: [/(west bengal|kolkata|hooghly|damodar|teesta|malda|murshidabad|wb flood|kolkata flood)/i],
    answer: () => ({
      text: `📍 **Flood Scenario — West Bengal:**\n\n• **Ganga at Farakka (\`GNG-FRK-04\`):** 22.45 m (Danger: 22.25 m) — 🔴 **Severe**, Outflow: 48,200 cumec\n• **Teesta at Domohani (\`TST-DOM-11\`):** 68.92 m (Danger: 69.50 m) — 🟡 **Above Normal**\n• **Damodar at Rhondia (\`DMD-RHN-12\`):** 38.15 m (Warning: 38.00 m) — 🟡 **Warning Stage**\n\n**Key Risk Zones:**\n• Malda, Murshidabad, Nadia (Ganga/Farakka discharges)\n• North Bengal: Cooch Behar, Jalpaiguri (Teesta/Torsa surge)\n• Howrah, Hooghly (Damodar Valley discharges)\n• Sundarbans delta (cyclone storm surge + river backflow)\n\n🚨 **Helplines:** WB SDMA: **1070** | Kolkata Control: **033-22143526** | Emergency: **112**`,
      route: APP_NAV_ROUTES.find((r) => r.path === '/stations'),
    }),
  },
];

// ─── City / Regional Scenario Engine ────────────────────────────────────────

export function getCityOrRegionalScenarioResponse(query: string): { text: string; route?: NavRoute } | null {
  const q = query.toLowerCase().trim();

  // 1. Patna & Bihar
  if (
    q.includes('patna') || q.includes('digha') ||
    (q.includes('bihar') && (q.includes('flood') || q.includes('scenario') || q.includes('status') || q.includes('situation') || q.includes('water') || q.includes('level')))
  ) {
    const stn = MOCK_STATIONS.find((s) => s.id === 'stn-01') || {
      name: 'Patna (Digha Ghat)', current_level: 50.82, warning_level: 49.30,
      danger_level: 50.45, hfl: 52.52, inflow_cumec: 34200, outflow_cumec: 34100, trend: 'Rising',
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
        `• **Live Stage:** **${currentLevel} m** (Warning: ${warningLevel} m | Danger: ${dangerLevel} m | HFL: ${hfl} m)\n` +
        `• **Severity:** 🔴 **Severe Flood Situation** — Flowing **+${diff} m above Danger Level** (${stn.trend || 'Rising'} trend, +2 cm/hr)\n` +
        `• **Discharge:** Inflow: **${inflow} cumec** | Outflow: **${outflow} cumec**\n\n` +
        `📋 *CWC Advisory: "River Ganga at Patna (Digha Ghat) is flowing 0.37m above its Danger Level with a rising trend of 2cm/hr. Farakka Barrage discharging 48,200 cumec."*\n\n` +
        `⚠️ **Vulnerable Zones:** Rajendra Nagar, Kankarbagh, Digha, Danapur, Maner, and Fatuha. Low-lying areas under evacuation advisory.\n\n` +
        `🚨 **Emergency Contacts (Bihar):**\n• District Disaster Control: **1077**\n• Bihar SDMA (BSDMA): **1070** (Toll-Free)\n• NDRF 9th Battalion, Bihta: **011-24363260** | **112**\n• Medical Emergency: **108**`,
      route: APP_NAV_ROUTES.find((r) => r.path === '/stations'),
    };
  }

  // 2. Delhi NCR & Yamuna
  if (
    !q.includes('basin') &&
    (q.includes('delhi') || (q.includes('yamuna') && !q.includes('ganga')) || q.includes('ncr') || q.includes('okhla') || q.includes('wazirabad') || q.includes('hathnikund'))
  ) {
    const stn = MOCK_STATIONS.find((s) => s.id === 'stn-05') || {
      name: 'Delhi (Old Railway Bridge)', current_level: 206.15, warning_level: 204.50,
      danger_level: 205.33, hfl: 208.66, trend: 'Rising', inflow_cumec: 7850, outflow_cumec: 7800,
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
        `• **Station:** **${stn.name}** (\`YMN-DEL-05\`, Upper Yamuna Basin)\n` +
        `• **Live Stage:** **${currentLevel} m** (Warning: ${warningLevel} m | Danger: ${dangerLevel} m | All-Time HFL: ${hfl} m)\n` +
        `• **Severity:** 🔴 **Severe** — Flowing **+${diff} m above Danger Mark** (${stn.trend || 'Rising'} trend)\n` +
        `• **Discharge:** Inflow: **${inflow} cumec** | Outflow: **${outflow} cumec**\n\n` +
        `📋 *Trigger: Hathnikund Barrage (Haryana) releasing high discharge after heavy upstream rain. Yamuna traversing Delhi corridor in 36–48 hrs.*\n\n` +
        `⚠️ **Alert Zones:** Yamuna Bazar, Monastery Market, Bela Estate, Mayur Vihar, Wazirabad, Okhla Barrage downstream areas\n\n` +
        `🚨 **Emergency Contacts (Delhi):**\n• Delhi Disaster Control: **1077**\n• Delhi DDMA: **011-23439898**\n• National Emergency: **112**`,
      route: APP_NAV_ROUTES.find((r) => r.path === '/stations'),
    };
  }

  // 3. Assam & Brahmaputra
  if (q.includes('guwahati') || q.includes('assam') || q.includes('brahmaputra') || q.includes('dibrugarh') || q.includes('tezpur') || q.includes('kaziranga') || q.includes('dhubri')) {
    return {
      text: `📍 **Current Flood Scenario — Assam (Brahmaputra Basin):**\n\n` +
        `• **Stations Monitored:** Guwahati (\`BHP-GUW-08\`), Dibrugarh (\`BHP-DIB-09\`), Tezpur (\`BHP-TEZ-10\`), Dhubri (\`BHP-DHU-13\`)\n` +
        `• **Status:** 🔴 **Severe Flood** across 28 districts\n` +
        `• **Guwahati Stage:** **49.68 m** (Danger Level: 49.68 m) — At Danger Mark with surging monsoonal inflow\n` +
        `• **Dibrugarh Stage:** **115.32 m** (Danger: 115.50 m) — 🟡 **Near Danger Level**\n\n` +
        `⚠️ **Ground Impact:** 2.4 million people displaced across Darrang, Morigaon, Kamrup, Barpeta, Lakhimpur. 70%+ of Kaziranga National Park inundated (500+ animals affected including rhinos).\n\n` +
        `🚨 **Emergency Contacts (Assam):**\n• Assam SDMA: **1070**\n• Guwahati Control: **1077**\n• NDRF 1st Battalion, Patgaon: **011-24363260** | **112**`,
      route: APP_NAV_ROUTES.find((r) => r.path === '/basins'),
    };
  }

  // 4. Vijayawada & Krishna Basin
  if (
    q.includes('vijayawada') || q.includes('budameru') || q.includes('prakasam') ||
    (q.includes('krishna') && (q.includes('river') || q.includes('flood') || q.includes('barrage') || q.includes('scenario')))
  ) {
    return {
      text: `📍 **Current Flood Scenario — Vijayawada (Krishna Basin, Andhra Pradesh):**\n\n` +
        `• **Station:** **Vijayawada (Prakasam Barrage)** (\`KRS-VIJ-15\`)\n` +
        `• **Stage:** **17.85 m** (Warning: 16.00 m | Danger Level: 17.50 m) — 🔴 **Severe**\n` +
        `• **Barrage Discharge:** Over **400,000 cusecs** released through 70 crest gates into Bay of Bengal\n` +
        `• **Upstream Trigger:** Srisailam + Nagarjuna Sagar dam spillway releases (heavy Telangana rainfall)\n` +
        `• **Budameru Rivulet Watch:** Flash breaches causing waterlogging in Ajit Singh Nagar, Payakapuram, Vidyadharapuram\n\n` +
        `⚠️ **Affected Areas:** 4.5 lakh people, 17 mandals inundated, NDRF and SDRF boats deployed\n\n` +
        `🚨 **Helplines:** AP SDMA: **1070** | Vijayawada Control: **1077** | NDRF Mangalagiri: **112**`,
      route: APP_NAV_ROUTES.find((r) => r.path === '/stations'),
    };
  }

  // 5. Varanasi, Prayagraj & Farakka (Ganga Corridor)
  if (q.includes('varanasi') || q.includes('prayagraj') || q.includes('allahabad') || q.includes('farakka') || q.includes('banaras') || q.includes('kashi')) {
    return {
      text: `📍 **Flood Scenario — Ganga Basin (Uttar Pradesh & West Bengal):**\n\n` +
        `• **Varanasi (\`GNG-VAR-02\`):** **70.92 m** (Warning: 70.26 m | Danger: 71.26 m) — 🟡 **Above Normal**\n  → Historic ghats (Dashashwamedh, Assi, Manikarnika) partially submerged. Boat traffic restricted.\n` +
        `• **Prayagraj Sangam (\`GNG-PRY-03\`):** **83.25 m** (Danger: 84.73 m) — 🟢 **Normal**, steady trend\n` +
        `• **Farakka Barrage (\`GNG-FRK-04\`):** **22.45 m** (Danger: 22.25 m) — 🔴 **Severe**, Outflow: 48,200 cumec\n\n` +
        `⚠️ **Downstream Impact:** Farakka discharges elevating Ganga levels in Malda, Murshidabad (West Bengal)\n\n` +
        `🚨 **Helplines:** UP Relief Commissioner: **1070** | District Disaster: **1077** | Emergency: **112**`,
      route: APP_NAV_ROUTES.find((r) => r.path === '/stations'),
    };
  }

  // 6. National Overview
  if (
    (q.includes('india') || q.includes('national') || q.includes('overall') || q.includes('country') || q.includes('how many river')) ||
    ((q.includes('current scenario') || q.includes('current situation') || q.includes('flood scenario') || q.includes('flood situation')) &&
      !q.includes('patna') && !q.includes('delhi') && !q.includes('assam') && !q.includes('mumbai'))
  ) {
    const severeCount = MOCK_STATIONS.filter((s) => s.status === 'Severe' || s.status === 'Extreme').length;
    const warningCount = MOCK_STATIONS.filter((s) => s.status === 'Above normal').length;
    const normalCount = MOCK_STATIONS.filter((s) => s.status === 'Normal').length;

    return {
      text: `🇮🇳 **National Flood Scenario — India (CWC Real-Time Overview):**\n\n` +
        `**Active Monitoring:** 1,500 Telemetry Stations across 20 River Basins\n\n` +
        `| Status | Count | Key Locations |\n|--------|-------|---------------|\n` +
        `| 🔴 Severe/Extreme | **${severeCount}** | Patna, Farakka, Delhi-Yamuna, Guwahati, Prakasam Barrage |\n` +
        `| 🟡 Watch/Above Normal | **${warningCount}** | Varanasi, Dibrugarh, Nashik, Teesta |\n` +
        `| 🟢 Normal | **${normalCount}** | Remaining stations within safe limits |\n\n` +
        `**Current Basin Hotspots:**\n` +
        `1. 🔴 **Middle Ganga Basin (Bihar):** Patna, Buxar, Bhagalpur — severe inundation risk\n` +
        `2. 🔴 **Upper Brahmaputra (Assam):** 28 districts; 2.4M displaced\n` +
        `3. 🔴 **Lower Krishna Basin (AP):** Dam spillway cascades into Vijayawada\n` +
        `4. 🟡 **Ganga Corridor (UP-WB):** Farakka barrage discharging at high levels\n` +
        `5. 🟡 **Teesta Basin (WB/Sikkim):** Glacial melt adding to monsoon surge\n\n` +
        `🚨 **National Emergency:** **112** | NDRF HQ: **011-24363260**`,
      route: APP_NAV_ROUTES.find((r) => r.path === '/'),
    };
  }

  // 7. Dynamic search across all CWC mock stations
  for (const stn of MOCK_STATIONS) {
    const nameMatch = stn.name.toLowerCase();
    const distMatch = stn.district?.toLowerCase() || '';
    const stateMatch = stn.state?.toLowerCase() || '';
    const riverMatch = (stn.river || '').toLowerCase();

    if (
      q.includes(nameMatch) ||
      (distMatch && q.includes(distMatch)) ||
      (stateMatch && q.includes(stateMatch) && (q.includes('flood') || q.includes('scenario') || q.includes('status') || q.includes('level') || q.includes('water'))) ||
      (riverMatch && q.includes(riverMatch) && (q.includes('flood') || q.includes('scenario') || q.includes('status') || q.includes('water') || q.includes('level')))
    ) {
      const currentLevel = Number(stn.current_level ?? 0);
      const dangerLevel = Number(stn.danger_level ?? 0);
      const warningLevel = Number(stn.warning_level ?? 0);
      const statusIcon = stn.status === 'Severe' || stn.status === 'Extreme' ? '🔴' : stn.status === 'Above normal' ? '🟡' : '🟢';
      const aboveDanger = currentLevel > dangerLevel
        ? `⚠️ Flowing **+${(currentLevel - dangerLevel).toFixed(2)} m above Danger Level**`
        : currentLevel > warningLevel
        ? `⚠️ Flowing **+${(currentLevel - warningLevel).toFixed(2)} m above Warning Level**`
        : `✅ Within safe limits — **${(dangerLevel - currentLevel).toFixed(2)} m below Danger Level**`;

      return {
        text: `📍 **Live Hydrological Status — ${stn.name} (${stn.state}):**\n\n` +
          `• **River & Basin:** ${stn.river} River (${stn.basin} Basin)\n` +
          `• **Live Stage:** **${currentLevel} m** (Warning: ${warningLevel} m | Danger: ${dangerLevel} m | HFL: ${stn.hfl} m)\n` +
          `• **Classification:** ${statusIcon} **${stn.status}** — ${aboveDanger}\n` +
          `• **Trend:** ${stn.trend || 'Steady'}\n` +
          `• **Discharge:** ${stn.inflow_cumec?.toLocaleString() || 'N/A'} cumec inflow | ${stn.outflow_cumec?.toLocaleString() || 'N/A'} cumec outflow\n\n` +
          `🚨 **Emergency:** State SDMA: **1070** | District: **1077** | ERSS: **112**`,
        route: APP_NAV_ROUTES.find((r) => r.path === '/stations'),
      };
    }
  }

  return null;
}

export function answerQueryWithKnowledgeBase(query: string): { text: string; route?: NavRoute } {
  const q = query.trim();

  // 1. City / regional scenarios first (highest priority)
  const scenarioResponse = getCityOrRegionalScenarioResponse(q);
  if (scenarioResponse) return scenarioResponse;

  // 2. Knowledge domains
  for (const entry of KNOWLEDGE_BASE) {
    if (entry.patterns.some((p) => p.test(q))) return entry.answer(q);
  }

  // 3. Keyword-based smart fallback — try to find something relevant to say
  const qLow = q.toLowerCase();

  if (qLow.includes('flood') || qLow.includes('water') || qLow.includes('river') || qLow.includes('rain')) {
    return {
      text: `🌊 **Flood Query Detected**\n\nI can give you detailed flood intelligence for specific locations. Try:\n\n• *"Current flood situation in Patna / Delhi / Assam / Vijayawada"*\n• *"What is the water level at Varanasi / Farakka / Guwahati?"*\n• *"How many stations are in danger level?"*\n• *"Which rivers are in flood right now?"*\n\nOr navigate to **Stations Telemetry** to browse all 1,500 live readings.`,
      route: APP_NAV_ROUTES.find((r) => r.path === '/stations'),
    };
  }

  if (qLow.includes('help') || qLow.includes('assist') || qLow.includes('can you') || qLow.includes('do you know')) {
    return {
      text: `🤖 **How I Can Help You:**\n\n**Live Flood Data:**\n• City flood scenarios (Patna, Delhi, Assam, Vijayawada, Mumbai...)\n• Station-level water readings across 1,500 CWC stations\n• River basin risk status\n\n**Educational:**\n• CWC flood classification (Warning/Danger/HFL)\n• What is cumec/cusec?\n• Dam & reservoir discharge explained\n• NDMA safety guidelines\n\n**Emergency:**\n• National & state helpline numbers\n• Flood safety protocols\n• Evacuation guidelines\n\n**Navigation:**\nType \`/stations\`, \`/basins\`, \`/bulletins\`, \`/contact\`, \`/disasters\`, \`/globe\` to jump to any section.`,
    };
  }

  // 4. Final generic fallback
  return {
    text: `I'm FlowShield AI — I specialize in **India's flood intelligence**.\n\nHere's what I know best:\n\n🌊 **"Flood scenario in Patna / Delhi / Assam?"** → Live CWC telemetry data\n📊 **"How many stations are in flood?"** → National overview\n🌧️ **"Warning Level vs Danger Level?"** → CWC classification explained\n🚨 **"Emergency helpline numbers?"** → NDRF, SDMA, 112\n🛡️ **"NDMA flood safety tips?"** → Official protocol\n🏗️ **"Farakka / Srisailam dam discharge?"** → Dam status\n📋 **"Latest CWC bulletin?"** → Daily flood advisories\n\nType \`/stations\` to see live water levels, or ask me anything flood-related!`,
    route: APP_NAV_ROUTES.find((r) => r.path === '/stations'),
  };
}

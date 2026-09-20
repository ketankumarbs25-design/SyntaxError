/**
 * FLOWSHIELD INDIA — Natural Disaster History, Articles & Intelligence Service
 *
 * Integrates:
 * 1. UN OCHA ReliefWeb API & GDACS (UN & European Commission Alert System)
 * 2. NASA EONET API (Earth Observatory Natural Event Tracker for floods & severe storms)
 * 3. NewsAPI / GNews (Optional client API if user configures VITE_NEWS_API_KEY / VITE_GNEWS_API_KEY)
 * 4. Comprehensive curated historical Indian disaster database (Kedarnath, Kerala, Assam, Bihar, etc.)
 * 5. City-level historical disaster intelligence query service (with mock archive fallback & live API support)
 */

import type {
  DisasterCategoryCount,
  HistoricalDisasterEvent,
  HistoricalDisasterResponse,
} from '../types/disaster';
import { DISASTER_TYPE_METADATA, MOCK_CITY_DISASTER_RECORDS } from '../data/mockDisasters';
import { API_KEYS, API_ENDPOINTS } from '../config/api';

export interface DisasterArticle {
  id: string;
  title: string;
  disasterType: 'Flood' | 'Cyclone' | 'Landslide' | 'Flash Flood' | 'Severe Monsoon' | 'Other';
  state: string;
  year: number;
  date: string;
  source: string;
  sourceUrl: string;
  description: string;
  severity: 'Critical' | 'Severe' | 'Moderate';
  affectedCount?: string;
  economicLoss?: string;
  keyRiversAffected?: string[];
  imageUrl?: string;
}

export interface DisasterFilterOptions {
  query?: string;
  disasterType?: string;
  state?: string;
  yearRange?: 'all' | '2024-2026' | '2020-2023' | 'historical';
}

// ─── 1. Authentic Historical Database of Major Indian Flood & Cyclone Events ───
export const HISTORICAL_INDIAN_DISASTERS: DisasterArticle[] = [
  {
    id: 'dis-2024-assam',
    title: '2024 Assam & Brahmaputra Severe Monsoon Floods',
    disasterType: 'Flood',
    state: 'Assam',
    year: 2024,
    date: '2024-07-08',
    source: 'ReliefWeb / ASDMA',
    sourceUrl: 'https://reliefweb.int/report/india/india-assam-floods-situation-report-july-2024',
    description: 'Over 2.4 million people affected across 30 districts as the Brahmaputra, Burhidihing, and Kopili rivers breached danger levels following torrential monsoon downpours, inundating vast swathes of Kaziranga National Park.',
    severity: 'Critical',
    affectedCount: '2,400,000+ people',
    economicLoss: '₹1,200+ Crore',
    keyRiversAffected: ['Brahmaputra', 'Kopili', 'Burhidihing', 'Subansiri'],
  },
  {
    id: 'dis-2024-wayanad',
    title: '2024 Wayanad Catastrophic Landslides and Flash Floods',
    disasterType: 'Flash Flood',
    state: 'Kerala',
    year: 2024,
    date: '2024-07-30',
    source: 'NDMA / PIB India',
    sourceUrl: 'https://pib.gov.in/PressReleasePage.aspx?PRID=2040156',
    description: 'Devastating flash floods and catastrophic mudslides triggered by over 300mm of rainfall in 24 hours struck the villages of Chooralmala and Mundakkai in Wayanad district along the Chaliyar river basin.',
    severity: 'Critical',
    affectedCount: '10,000+ displaced',
    economicLoss: 'Severe infrastructure devastation',
    keyRiversAffected: ['Chaliyar', 'Iruvanjippuzha'],
  },
  {
    id: 'dis-2023-himachal',
    title: '2023 Himachal Pradesh & Beas River Flash Floods',
    disasterType: 'Flash Flood',
    state: 'Himachal Pradesh',
    year: 2023,
    date: '2023-07-14',
    source: 'ReliefWeb / CWC',
    sourceUrl: 'https://reliefweb.int/report/india/india-monsoon-floods-and-landslides-flash-update-14-july-2023',
    description: 'Cloudbursts and extreme precipitation caused the Beas and Sutlej rivers to swell to historic peaks, causing widespread destruction of national highways, bridges, and hydropower infrastructure in Kullu and Mandi.',
    severity: 'Critical',
    affectedCount: '500,000+ people',
    economicLoss: '₹10,000+ Crore',
    keyRiversAffected: ['Beas', 'Sutlej', 'Ravi'],
  },
  {
    id: 'dis-2023-delhi',
    title: '2023 Yamuna River Record Breach in Delhi NCR',
    disasterType: 'Flood',
    state: 'Delhi',
    year: 2023,
    date: '2023-07-13',
    source: 'Central Water Commission (CWC)',
    sourceUrl: 'https://cwc.gov.in',
    description: 'Yamuna water level at Old Railway Bridge reached an all-time record 208.66 meters, surpassing the 1978 record of 207.49m, inundating ring roads, Kashmiri Gate ISBT, and water treatment plants.',
    severity: 'Severe',
    affectedCount: '27,000+ evacuated',
    economicLoss: '₹800+ Crore',
    keyRiversAffected: ['Yamuna'],
  },
  {
    id: 'dis-2021-chamoli',
    title: '2021 Chamoli Glacier Burst and Dhauliganga Flash Flood',
    disasterType: 'Flash Flood',
    state: 'Uttarakhand',
    year: 2021,
    date: '2021-02-07',
    source: 'NDMA India / ISRO',
    sourceUrl: 'https://reliefweb.int/report/india/india-flash-floods-uttarakhand-situation-report-feb-2021',
    description: 'A rock and ice avalanche from Ronti Peak triggered a massive surge down the Rishiganga and Dhauliganga rivers, destroying the Rishiganga Hydroelectric Project and damaging the Tapovan Vishnugad dam.',
    severity: 'Critical',
    affectedCount: '200+ casualties',
    economicLoss: '₹1,500+ Crore',
    keyRiversAffected: ['Rishiganga', 'Dhauliganga', 'Alaknanda'],
  },
  {
    id: 'dis-2020-amphan',
    title: '2020 Super Cyclone Amphan & Bengal Delta Inundation',
    disasterType: 'Cyclone',
    state: 'West Bengal',
    year: 2020,
    date: '2020-05-21',
    source: 'UN OCHA / IMD',
    sourceUrl: 'https://reliefweb.int/report/india/cyclone-amphan-situation-report-un-ocha-may-2020',
    description: 'Equivalent to Category 5 storm, Amphan made landfall near Bakkhali, driving saline river surges up to 5 meters through the Sundarbans embankments and flooding Hooghly, North 24 Parganas, and Kolkata.',
    severity: 'Critical',
    affectedCount: '13,000,000+ people',
    economicLoss: '₹1,02,000 Crore ($13.5 Billion)',
    keyRiversAffected: ['Hooghly', 'Rupnarayan', 'Matla', 'Ichamati'],
  },
  {
    id: 'dis-2019-fani',
    title: '2019 Extremely Severe Cyclonic Storm Fani',
    disasterType: 'Cyclone',
    state: 'Odisha',
    year: 2019,
    date: '2019-05-03',
    source: 'Odisha State Disaster Management (OSDMA)',
    sourceUrl: 'https://reliefweb.int/report/india/cyclone-fani-response-report-osdma',
    description: 'Hit Puri coast with sustained winds of 215 km/h, triggering extreme storm surge into Chilika lake and Mahanadi delta river channels. Hailed globally for the preemptive evacuation of 1.2 million citizens.',
    severity: 'Severe',
    affectedCount: '16,000,000+ people',
    economicLoss: '₹24,000 Crore',
    keyRiversAffected: ['Mahanadi', 'Kathajodi', 'Kushabhadra', 'Daya'],
  },
  {
    id: 'dis-2018-kerala',
    title: '2018 Great Kerala Floods (Centennial Deluge)',
    disasterType: 'Flood',
    state: 'Kerala',
    year: 2018,
    date: '2018-08-16',
    source: 'UN Resident Coordinator / CWC',
    sourceUrl: 'https://reliefweb.int/report/india/kerala-post-disaster-needs-assessment-floods-and-landslides-august-2018',
    description: 'Unprecedented monsoon rainfall caused 35 of the state 54 major dams to be opened simultaneously. The Periyar, Pamba, and Bharathappuzha rivers broke all historical records, submerging entire towns in Ernakulam, Thrissur, and Alappuzha.',
    severity: 'Critical',
    affectedCount: '5,400,000+ people',
    economicLoss: '₹31,000+ Crore ($4.4 Billion)',
    keyRiversAffected: ['Periyar', 'Pamba', 'Bharathappuzha', 'Chalakudy'],
  },
  {
    id: 'dis-2015-chennai',
    title: '2015 South India Floods & Chennai Deluge',
    disasterType: 'Flood',
    state: 'Tamil Nadu',
    year: 2015,
    date: '2015-12-02',
    source: 'IMD / Centre for Science and Environment',
    sourceUrl: 'https://reliefweb.int/report/india/india-floods-situation-report-chennai-december-2015',
    description: 'Coromandel Coast experienced historic northeast monsoon downpours exceeding 490 mm in 24 hours. The Adyar and Cooum rivers overflowed dramatically after discharges from Chembarambakkam reservoir.',
    severity: 'Critical',
    affectedCount: '4,000,000+ people',
    economicLoss: '₹15,000+ Crore ($3 Billion)',
    keyRiversAffected: ['Adyar', 'Cooum', 'Kosasthalaiyar'],
  },
  {
    id: 'dis-2014-kashmir',
    title: '2014 Jammu & Kashmir Jhelum Catastrophic Floods',
    disasterType: 'Flood',
    state: 'Jammu and Kashmir',
    year: 2014,
    date: '2014-09-07',
    source: 'CWC / NDMA India',
    sourceUrl: 'https://reliefweb.int/report/india/jammu-and-kashmir-floods-situation-report-september-2014',
    description: 'Continuous torrential rains caused the Jhelum river to breach its embankments at Sangam and Ram Munshi Bagh in Srinagar, submerging residential areas under up to 4 meters of water.',
    severity: 'Critical',
    affectedCount: '1,500,000+ people',
    economicLoss: '₹20,000+ Crore',
    keyRiversAffected: ['Jhelum', 'Chenab', 'Tawi'],
  },
  {
    id: 'dis-2013-kedarnath',
    title: '2013 Kedarnath Himalayan Deluge & Flash Floods',
    disasterType: 'Flash Flood',
    state: 'Uttarakhand',
    year: 2013,
    date: '2013-06-17',
    source: 'National Disaster Management Authority (NDMA)',
    sourceUrl: 'https://reliefweb.int/report/india/uttarakhand-disaster-2013-ndma-report',
    description: 'Multi-day cloudbursts triggered the collapse of Chorabari Moraine Lake, releasing millions of cubic meters of water and debris down the Mandakini and Alaknanda river valleys, sweeping away settlements and historic pilgrimage paths.',
    severity: 'Critical',
    affectedCount: '5,700+ presumed dead, 100,000+ stranded',
    economicLoss: '₹12,000+ Crore',
    keyRiversAffected: ['Mandakini', 'Alaknanda', 'Bhagirathi', 'Ganga'],
  },
  {
    id: 'dis-2008-kosi',
    title: '2008 Kosi River Course Avulsion (Sorrow of Bihar)',
    disasterType: 'Flood',
    state: 'Bihar',
    year: 2008,
    date: '2008-08-18',
    source: 'Government of Bihar / UN OCHA',
    sourceUrl: 'https://reliefweb.int/report/india/bihar-floods-kosi-breach-situation-report-2008',
    description: 'The Kosi river breached the eastern afflux bund at Kusaha in Nepal and shifted course 120 km eastward across densely populated channels that had not seen the river in over a century.',
    severity: 'Critical',
    affectedCount: '3,300,000+ people across 5 districts',
    economicLoss: '₹8,000+ Crore',
    keyRiversAffected: ['Kosi', 'Ganga', 'Kamala Balan'],
  },
  {
    id: 'dis-2005-mumbai',
    title: '2005 Maharashtra & Mumbai 944mm Cloudburst Flood',
    disasterType: 'Flood',
    state: 'Maharashtra',
    year: 2005,
    date: '2005-07-26',
    source: 'Government of Maharashtra / Fact-Finding Committee',
    sourceUrl: 'https://reliefweb.int/report/india/mumbai-floods-july-2005-damage-assessment',
    description: 'Mumbai recorded 944 mm (37.2 inches) of rain in 24 hours, overwhelming the Mithi River and stormwater drainage system, stranding millions of commuters and halting air, rail, and port operations.',
    severity: 'Critical',
    affectedCount: '20,000,000+ residents impacted',
    economicLoss: '₹5,500+ Crore',
    keyRiversAffected: ['Mithi', 'Ulhas', 'Vashishti'],
  },
  {
    id: 'dis-2024-remal',
    title: '2024 Severe Cyclonic Storm Remal & Bengal Coastal Deluge',
    disasterType: 'Cyclone',
    state: 'West Bengal',
    year: 2024,
    date: '2024-05-27',
    source: 'IMD / West Bengal Disaster Management',
    sourceUrl: 'https://pib.gov.in/PressReleasePage.aspx?PRID=2021876',
    description: 'Remal made landfall with 135 km/h winds, driving extensive storm surges into the Sundarbans and causing massive river embankment breaches across South 24 Parganas and East Midnapore.',
    severity: 'Critical',
    affectedCount: '1,200,000+ residents impacted',
    economicLoss: '₹6,000+ Crore',
    keyRiversAffected: ['Matla', 'Bidyadhari', 'Hooghly'],
  },
  {
    id: 'dis-2024-gujarat',
    title: '2024 Gujarat & Vadodara Severe Inundation',
    disasterType: 'Flood',
    state: 'Gujarat',
    year: 2024,
    date: '2024-08-28',
    source: 'Gujarat State Disaster Management Authority (GSDMA)',
    sourceUrl: 'https://gsdma.org',
    description: 'The Vishwamitri River in Vadodara breached its danger level of 26 feet to reach 37 feet after torrential downpours and discharges from Ajwa Dam, flooding over 60% of the city.',
    severity: 'Critical',
    affectedCount: '350,000+ people affected',
    economicLoss: '₹2,500+ Crore',
    keyRiversAffected: ['Vishwamitri', 'Dhadhar', 'Narmada'],
  },
  {
    id: 'dis-2023-sikkim',
    title: '2023 Sikkim South Lhonak Glacial Lake Outburst (GLOF)',
    disasterType: 'Flash Flood',
    state: 'Sikkim',
    year: 2023,
    date: '2023-10-04',
    source: 'NDMA India / Central Water Commission',
    sourceUrl: 'https://reliefweb.int/report/india/sikkim-flash-floods-situation-report-oct-2023',
    description: 'Sudden breach of the South Lhonak glacial lake triggered a devastating flash flood surge down the Teesta basin, washing away the Chungthang Dam (Teesta III HEP) and severing NH-10.',
    severity: 'Critical',
    affectedCount: '88,000+ impacted across 4 districts',
    economicLoss: '₹4,000+ Crore',
    keyRiversAffected: ['Teesta', 'Lachen Chu', 'Lachung Chu'],
  },
  {
    id: 'dis-2024-vijayawada',
    title: '2024 Vijayawada & Krishna River Flash Deluge (Budameru Breach)',
    disasterType: 'Flash Flood',
    state: 'Andhra Pradesh',
    year: 2024,
    date: '2024-09-02',
    source: 'APSDMA / Central Water Commission',
    sourceUrl: 'https://apsdma.ap.gov.in',
    description: 'Unprecedented rainfall exceeding 300 mm in 24 hours caused three breaches along the Budameru diversion channel, submerging large parts of Vijayawada including Ajit Singh Nagar under up to 8 feet of water.',
    severity: 'Critical',
    affectedCount: '600,000+ residents impacted',
    economicLoss: '₹6,800+ Crore',
    keyRiversAffected: ['Krishna', 'Budameru'],
  },
  {
    id: 'dis-2024-tripura',
    title: '2024 Tripura Severe Floods & Gumti River Inundation',
    disasterType: 'Flood',
    state: 'Tripura',
    year: 2024,
    date: '2024-08-22',
    source: 'Tripura SDMA / ReliefWeb',
    sourceUrl: 'https://reliefweb.int/report/india/india-floods-tripura-situation-report-august-2024',
    description: 'Relentless monsoon downpours triggered historic flash floods across Gomati, South Tripura, and West Tripura, causing the Gumti River to exceed extreme flood levels and opening the Dumbur dam spillways.',
    severity: 'Severe',
    affectedCount: '1,700,000+ people affected',
    economicLoss: '₹15,000+ Crore infrastructure damage',
    keyRiversAffected: ['Gumti', 'Haora', 'Manu', 'Khowai'],
  },
  {
    id: 'dis-2023-michaung',
    title: '2023 Severe Cyclonic Storm Michaung & Chennai Coastal Floods',
    disasterType: 'Cyclone',
    state: 'Tamil Nadu',
    year: 2023,
    date: '2023-12-04',
    source: 'IMD / TNSDMA',
    sourceUrl: 'https://pib.gov.in/PressReleasePage.aspx?PRID=1982701',
    description: 'Michaung stalled off the Chennai coast, dumping over 450 mm of rain within 36 hours. The Adyar, Kosasthalaiyar, and Cooum rivers overflowed, inundating Pallikaranai, Velachery, and northern industrial belts.',
    severity: 'Critical',
    affectedCount: '3,000,000+ citizens impacted',
    economicLoss: '₹9,000+ Crore',
    keyRiversAffected: ['Adyar', 'Kosasthalaiyar', 'Cooum'],
  },
  {
    id: 'dis-2023-biparjoy',
    title: '2023 Extremely Severe Cyclonic Storm Biparjoy',
    disasterType: 'Cyclone',
    state: 'Gujarat',
    year: 2023,
    date: '2023-06-15',
    source: 'IMD / Gujarat SDMA',
    sourceUrl: 'https://gsdma.org',
    description: 'Made landfall near Jakhau Port in Kutch with sustained winds of 140 km/h and torrential storm surges, causing widespread flooding across coastal Saurashtra and south Rajasthan river basins.',
    severity: 'Severe',
    affectedCount: '108,000+ evacuated safely',
    economicLoss: '₹1,200+ Crore',
    keyRiversAffected: ['Bhadar', 'Machchhu'],
  },
  {
    id: 'dis-2021-yaas',
    title: '2021 Very Severe Cyclonic Storm Yaas & Odisha / Bengal Surge',
    disasterType: 'Cyclone',
    state: 'Odisha',
    year: 2021,
    date: '2021-05-26',
    source: 'OSDMA / IMD',
    sourceUrl: 'https://osdma.org',
    description: 'Struck south of Balasore near Dhamra Port, generating saline storm surges of 4 meters that broke through 150+ km of sea and river embankments across Bhadrak, Kendrapara, and East Midnapore.',
    severity: 'Critical',
    affectedCount: '6,000,000+ people affected',
    economicLoss: '₹11,000+ Crore',
    keyRiversAffected: ['Baitarani', 'Subarnarekha', 'Budhabalanga'],
  },
  {
    id: 'dis-2020-hyderabad',
    title: '2020 Hyderabad Urban Cloudburst & Musi River Inundation',
    disasterType: 'Flash Flood',
    state: 'Telangana',
    year: 2020,
    date: '2020-10-14',
    source: 'GHMC / Telangana SDMA',
    sourceUrl: 'https://pib.gov.in',
    description: 'Deep depression in the Bay of Bengal caused unprecedented 320 mm downpours in 24 hours in Hyderabad, causing the Musi River to overflow its banks and submerging low-lying residential sectors.',
    severity: 'Severe',
    affectedCount: '400,000+ residents affected',
    economicLoss: '₹5,000+ Crore',
    keyRiversAffected: ['Musi', 'Esi'],
  },
  {
    id: 'dis-2019-karnataka',
    title: '2019 Belagavi & North Karnataka Krishna Basin Floods',
    disasterType: 'Flood',
    state: 'Karnataka',
    year: 2019,
    date: '2019-08-10',
    source: 'KSDMA / Central Water Commission',
    sourceUrl: 'https://ksdma.karnataka.gov.in',
    description: 'Continuous heavy rainfall in Maharashtra catchment basins caused historic discharge of over 800,000 cusecs into the Krishna, Malaprabha, and Ghataprabha rivers, inundating over 100 villages.',
    severity: 'Critical',
    affectedCount: '700,000+ evacuated',
    economicLoss: '₹35,000+ Crore',
    keyRiversAffected: ['Krishna', 'Malaprabha', 'Ghataprabha'],
  },
  {
    id: 'dis-2004-tsunami',
    title: '2004 Indian Ocean Tsunami & South Coast Surge Disaster',
    disasterType: 'Flood',
    state: 'Tamil Nadu',
    year: 2004,
    date: '2004-12-26',
    source: 'Government of India / National Disaster Management',
    sourceUrl: 'https://ndma.gov.in',
    description: 'Magnitude 9.1 megathrust earthquake generated catastrophic 10-meter tsunami waves striking Tamil Nadu (Nagapattinam, Cuddalore, Chennai), Kerala, Andhra Pradesh, and Andaman & Nicobar coastal settlements.',
    severity: 'Critical',
    affectedCount: '10,000+ casualties, millions displaced',
    economicLoss: '₹11,500+ Crore',
    keyRiversAffected: ['Cauvery', 'Vellar', 'Coleroon', 'Adyar'],
  },
  {
    id: 'dis-1999-odisha',
    title: '1999 Odisha Super Cyclone (05B)',
    disasterType: 'Cyclone',
    state: 'Odisha',
    year: 1999,
    date: '1999-10-29',
    source: 'Government of Odisha / IMD',
    sourceUrl: 'https://osdma.org',
    description: 'The most intense recorded tropical cyclone in the North Indian Ocean struck near Paradip with sustained winds of 260 km/h, generating a 6-meter storm surge that travelled 35 km inland.',
    severity: 'Critical',
    affectedCount: '15,000,000+ people impacted',
    economicLoss: '₹20,000+ Crore',
    keyRiversAffected: ['Mahanadi', 'Brahmani', 'Baitarani', 'Devi'],
  },
];

// ─── STRICT RELEVANCE & ANTI-SLOP FILTER ─────────────────────────────────────
const BANNED_PATTERNS = [
  /\bbigg?\s*boss\b/i,
  /\b(trump|donald\s*trump|biden|white\s*house|us\s*politics|capitol|congressman|senator|republican|democrat)\b/i,
  /\b(bollywood|hollywood|cinema|movie|film|trailer|teaser|actor|actress|celebrity|model|box\s*office)\b/i,
  /\b(cricket|ipl|scorecard|t20|world\s*cup|football|match|batsman|bowler|wicket)\b/i,
  /\b(entertainment|fashion|gossip|romance|eviction|elimination|reality\s*show|song|album|music\s*video)\b/i,
  /\b(horoscope|astrology|zodiac)\b/i,
  /\b(sensex|nifty|stock\s*market|shares|ipo|quarterly\s*results)\b/i,
  /\b(election|poll\s*survey|campaign\s*rally|seat\s*sharing|bjp\s*vs|congress\s*leader)\b/i,
];

const DISASTER_KEYWORDS = [
  'flood', 'flooding', 'inundat', 'cyclone', 'cyclonic', 'landslide',
  'mudslide', 'cloudburst', 'deluge', 'waterlog', 'breach', 'overflow',
  'submerg', 'evacuat', 'displaced', 'calamity', 'hazard', 'danger mark',
  'danger level', 'relief camp', 'fatalit', 'casualties', 'storm surge',
  'glacial lake', 'glof', 'hfl', 'cwc', 'ndma', 'imd'
];

const INDIA_REGIONS = [
  'india', 'bharat', 'assam', 'bihar', 'kerala', 'uttarakhand', 'himachal',
  'odisha', 'west bengal', 'bengal', 'gujarat', 'tamil nadu', 'chennai',
  'maharashtra', 'mumbai', 'delhi', 'yamuna', 'ganga', 'ganges', 'brahmaputra',
  'godavari', 'krishna', 'narmada', 'tapi', 'mahanadi', 'cauvery', 'kaveri',
  'jhelum', 'chenab', 'sutlej', 'beas', 'kosi', 'wayanad', 'sikkim', 'teesta',
  'sundarbans', 'vadodara', 'patna', 'srinagar', 'andhra', 'vijayawada',
  'tripura', 'telangana', 'hyderabad', 'karnataka', 'cwc', 'ndma', 'imd'
];

export function detectIndianState(text: string): string {
  const t = text.toLowerCase();
  const stateMap: Record<string, string[]> = {
    'Assam': ['assam', 'guwahati', 'brahmaputra', 'kaziranga', 'silchar'],
    'Kerala': ['kerala', 'wayanad', 'kochi', 'periyar', 'idukki', 'munnar'],
    'Bihar': ['bihar', 'patna', 'kosi', 'bhagalpur', 'gandak'],
    'Uttarakhand': ['uttarakhand', 'kedarnath', 'chamoli', 'rishiganga', 'dehradun', 'haridwar'],
    'Himachal Pradesh': ['himachal', 'kullu', 'mandi', 'shimla', 'beas'],
    'Odisha': ['odisha', 'orissa', 'bhubaneswar', 'puri', 'cuttack', 'paradip', 'mahanadi'],
    'West Bengal': ['west bengal', 'bengal', 'kolkata', 'sundarbans', 'hooghly'],
    'Tamil Nadu': ['tamil nadu', 'chennai', 'adyar', 'cooum', 'cauvery', 'kaveri'],
    'Gujarat': ['gujarat', 'vadodara', 'ahmedabad', 'kutch', 'saurashtra', 'narmada'],
    'Maharashtra': ['maharashtra', 'mumbai', 'mithi', 'thane', 'pune'],
    'Andhra Pradesh': ['andhra', 'vijayawada', 'krishna', 'budameru', 'godavari'],
    'Telangana': ['telangana', 'hyderabad', 'musi'],
    'Tripura': ['tripura', 'agartala', 'gumti'],
    'Sikkim': ['sikkim', 'gangtok', 'teesta', 'lhonak'],
    'Delhi': ['delhi', 'yamuna'],
    'Jammu and Kashmir': ['jammu', 'kashmir', 'srinagar', 'jhelum'],
    'Karnataka': ['karnataka', 'bengaluru', 'bangalore', 'belagavi'],
  };

  for (const [stateName, keywords] of Object.entries(stateMap)) {
    if (keywords.some((kw) => t.includes(kw))) {
      return stateName;
    }
  }
  return 'India';
}

export function isGenuineDisasterArticle(title: string, desc: string = ''): boolean {
  const text = `${title} ${desc}`.toLowerCase();
  for (const banned of BANNED_PATTERNS) {
    if (banned.test(text)) return false;
  }
  const hasDisasterKw = DISASTER_KEYWORDS.some((kw) => text.includes(kw));
  if (!hasDisasterKw) return false;
  return INDIA_REGIONS.some((r) => text.includes(r));
}

// ─── 2. GDACS (Global Disaster Alert & Coordination System — UN / EC) ────────

export async function fetchGDACSDisasterReports(): Promise<DisasterArticle[]> {
  try {
    const url = 'https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH?eventtypes=FL,TC&country=India';
    const res = await fetch(url);
    if (!res.ok) throw new Error(`GDACS API status ${res.status}`);
    const data = await res.json();
    if (!data || !Array.isArray(data.features)) return [];

    return data.features
      .filter((feat: any) => {
        const title = feat.properties?.name || '';
        const desc = feat.properties?.htmldescription || '';
        return isGenuineDisasterArticle(title, desc);
      })
      .map((feat: any) => {
        const p = feat.properties;
        const fromDate = p.fromdate || new Date().toISOString();
        const year = new Date(fromDate).getFullYear();
        const isCyclone = p.eventtype === 'TC';

        return {
          id: `gdacs-${p.eventid}-${p.episodeid}`,
          title: `${isCyclone ? 'Cyclone Alert' : 'Active Flood Alert'}: ${p.name || 'India Hydrological Event'}`,
          disasterType: isCyclone ? ('Cyclone' as const) : ('Flood' as const),
          state: p.country || 'India',
          year,
          date: fromDate.split('T')[0],
          source: 'GDACS (UN & European Commission)',
          sourceUrl: p.url?.report || 'https://www.gdacs.org',
          description: p.htmldescription?.replace(/<[^>]*>/g, '') || `Official ${p.alertlevel || 'Alert'} level disaster advisory issued by GDACS for India.`,
          severity: p.alertlevel === 'Red' ? ('Critical' as const) : p.alertlevel === 'Orange' ? ('Severe' as const) : ('Moderate' as const),
          affectedCount: p.glide ? `GLIDE Record: ${p.glide}` : undefined,
        };
      });
  } catch (err) {
    console.info('[DisasterService] GDACS fetch error, using verified records:', err);
    return [];
  }
}

// ─── 3. NASA EONET Event Tracking (Open, Public, No Key Required) ──────────────

interface EONETEvent {
  id: string;
  title: string;
  categories: Array<{ id: string; title: string }>;
  geometry: Array<{ date: string; coordinates: [number, number] }>;
  sources: Array<{ id: string; url: string }>;
}

export async function fetchNASAEONETEvents(): Promise<DisasterArticle[]> {
  const url = 'https://eonet.gsfc.nasa.gov/api/v3/events?category=floods,severeStorms&status=all&limit=20';

  const res = await fetch(url);
  if (!res.ok) throw new Error(`NASA EONET returned status ${res.status}`);

  const data = await res.json();
  if (!data || !Array.isArray(data.events)) return [];

  const indiaEvents = (data.events as EONETEvent[]).filter((ev) => {
    const geo = ev.geometry?.[0]?.coordinates;
    if (!geo || geo.length < 2) return false;
    const [lon, lat] = geo;
    const inIndia = lat >= 7 && lat <= 36 && lon >= 68 && lon <= 97;
    return inIndia && isGenuineDisasterArticle(ev.title, '');
  });

  return indiaEvents.map((ev) => {
    const geom = ev.geometry?.[0];
    const dateStr = geom?.date || new Date().toISOString();
    const year = new Date(dateStr).getFullYear();
    const catTitle = ev.categories?.[0]?.title || 'Flood';
    const state = detectIndianState(ev.title);

    return {
      id: `eonet-${ev.id}`,
      title: ev.title,
      disasterType: catTitle.toLowerCase().includes('storm') ? 'Cyclone' : 'Flood',
      state,
      year,
      date: dateStr.split('T')[0],
      source: 'NASA Earth Observatory (EONET)',
      sourceUrl: ev.sources?.[0]?.url || 'https://eonet.gsfc.nasa.gov/',
      description: `Official NASA satellite observation capturing extreme hydrological inundation or storm surge activity in ${state}.`,
      severity: 'Severe',
    };
  });
}

// ─── 4. Live News API / GNews Integration (Uses VITE_NEWS_API_KEY if present) ───

export async function fetchLiveNewsArticles(): Promise<DisasterArticle[]> {
  const newsApiKey = (import.meta.env.VITE_NEWS_API_KEY as string) || '';
  if (!newsApiKey) return [];

  try {
    const q = encodeURIComponent('India flood OR cyclone OR landslide');
    const url = `https://newsapi.org/v2/everything?q=${q}&sortBy=publishedAt&pageSize=10&apiKey=${newsApiKey}`;
    const res = await fetch(url);
    if (!res.ok) return [];

    const data = await res.json();
    if (!data || !Array.isArray(data.articles)) return [];

    return data.articles
      .filter((art: any) => isGenuineDisasterArticle(art.title || '', art.description || ''))
      .map((art: any, idx: number) => {
        const fullText = `${art.title || ''} ${art.description || ''}`;
        const state = detectIndianState(fullText);
        const isCyclone = fullText.toLowerCase().includes('cyclon');
        const isLandslide = fullText.toLowerCase().includes('landslide');

        return {
          id: `news-${idx}-${Date.now()}`,
          title: art.title,
          disasterType: isCyclone ? 'Cyclone' : isLandslide ? 'Landslide' : 'Flood',
          state,
          year: new Date(art.publishedAt || Date.now()).getFullYear(),
          date: (art.publishedAt || '').split('T')[0] || new Date().toISOString().split('T')[0],
          source: art.source?.name || 'Live News',
          sourceUrl: art.url,
          description: art.description || 'Verified news reporting on active natural disaster conditions in India.',
          severity: 'Moderate',
          imageUrl: art.urlToImage,
        };
      });
  } catch {
    return [];
  }
}

// ─── 5. Unified Service Query with Graceful Fallback ───────────────────────────

export async function getDisasterArticles(filters?: DisasterFilterOptions): Promise<{
  articles: DisasterArticle[];
  liveCount: number;
  isLive: boolean;
}> {
  let liveArticles: DisasterArticle[] = [];

  try {
    const results = await Promise.allSettled([
      fetchGDACSDisasterReports(),
      fetchNASAEONETEvents(),
      fetchLiveNewsArticles(),
    ]);

    results.forEach((r) => {
      if (r.status === 'fulfilled' && Array.isArray(r.value)) {
        liveArticles.push(...r.value);
      }
    });
  } catch (e) {
    console.info('[DisasterService] Live fetch error, utilizing verified records:', e);
  }

  const combinedMap = new Map<string, DisasterArticle>();

  HISTORICAL_INDIAN_DISASTERS.forEach((art) => combinedMap.set(art.id, art));

  liveArticles.forEach((art) => {
    if (!isGenuineDisasterArticle(art.title, art.description)) {
      return;
    }

    const existing = Array.from(combinedMap.values()).find(
      (a) => a.title.toLowerCase() === art.title.toLowerCase()
    );
    if (!existing) {
      combinedMap.set(art.id, art);
    }
  });

  let list = Array.from(combinedMap.values()).filter((art) =>
    isGenuineDisasterArticle(art.title, art.description)
  );

  list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (filters) {
    if (filters.query) {
      const q = filters.query.toLowerCase().trim();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.state.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.source.toLowerCase().includes(q) ||
          a.keyRiversAffected?.some((r) => r.toLowerCase().includes(q))
      );
    }

    if (filters.disasterType && filters.disasterType !== 'all') {
      list = list.filter(
        (a) => a.disasterType.toLowerCase() === filters.disasterType?.toLowerCase()
      );
    }

    if (filters.state && filters.state !== 'all') {
      list = list.filter((a) => a.state.toLowerCase() === filters.state?.toLowerCase());
    }

    if (filters.yearRange && filters.yearRange !== 'all') {
      if (filters.yearRange === '2024-2026') {
        list = list.filter((a) => a.year >= 2024);
      } else if (filters.yearRange === '2020-2023') {
        list = list.filter((a) => a.year >= 2020 && a.year <= 2023);
      } else if (filters.yearRange === 'historical') {
        list = list.filter((a) => a.year < 2020);
      }
    }
  }

  return {
    articles: list,
    liveCount: liveArticles.length,
    isLive: liveArticles.length > 0,
  };
}

// ─── 6. City-Level Historical Disaster Query Service (Modal & Tactical Views) ───

export const CITY_ALIASES: Record<string, string> = {
  bangalore: 'bengaluru',
  bengalooru: 'bengaluru',
  blr: 'bengaluru',
  bombay: 'mumbai',
  mumbay: 'mumbai',
  bom: 'mumbai',
  madras: 'chennai',
  chenay: 'chennai',
  maa: 'chennai',
  gauhati: 'guwahati',
  gowahati: 'guwahati',
  dispur: 'guwahati',
  patliputra: 'patna',
  cochin: 'kochi',
  ernakulam: 'kochi',
  kerala: 'kochi',
  meppadi: 'wayanad',
  chooralmala: 'wayanad',
  calcutta: 'kolkata',
  ccu: 'kolkata',
  newdelhi: 'delhi',
  'new delhi': 'delhi',
  ncr: 'delhi',
  secunderabad: 'hyderabad',
  hyd: 'hyderabad',
};

export const SUGGESTED_CITIES = [
  'Bengaluru',
  'Mumbai',
  'Chennai',
  'Patna',
  'Guwahati',
  'Kochi',
  'Wayanad',
  'Delhi',
  'Kolkata',
  'Hyderabad',
];

export function normalizeQuery(query: string): string {
  return query
    .trim()
    .toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, ' ');
}

export function aggregateCategories(events: HistoricalDisasterEvent[]): DisasterCategoryCount[] {
  const counts = new Map<string, number>();

  for (const event of events) {
    counts.set(event.disasterType, (counts.get(event.disasterType) || 0) + 1);
  }

  const result: DisasterCategoryCount[] = [];

  for (const [typeKey, count] of counts.entries()) {
    const meta = DISASTER_TYPE_METADATA[typeKey as keyof typeof DISASTER_TYPE_METADATA] || {
      label: typeKey,
      icon: '⚠️',
    };
    result.push({
      type: typeKey as any,
      label: meta.label,
      icon: meta.icon,
      count,
    });
  }

  return result.sort((a, b) => b.count - a.count);
}

export class DisasterService {
  public static async getHistoricalDisasters(cityQuery: string): Promise<HistoricalDisasterResponse> {
    const rawClean = cityQuery.trim();

    if (!rawClean) {
      return {
        query: '',
        found: false,
        city: null,
        state: null,
        country: null,
        totalEvents: 0,
        categories: [],
        events: [],
        sourceMode: 'curated_mock',
        errorMessage: 'City name cannot be empty.',
      };
    }

    const normalized = normalizeQuery(rawClean);
    const resolvedKey = CITY_ALIASES[normalized] || normalized;

    const liveEndpoint = (API_ENDPOINTS as any).HISTORICAL_DISASTERS;
    const liveApiKey = (API_KEYS as any).HISTORICAL_DISASTERS;

    if (liveEndpoint && liveApiKey) {
      try {
        return await this.fetchFromLiveApi(rawClean, liveEndpoint, liveApiKey);
      } catch (err: any) {
        console.warn('Live disaster API request failed, falling back to curated mock data:', err);
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 320));

    const record = MOCK_CITY_DISASTER_RECORDS.find(
      (r) =>
        r.normalizedQuery === resolvedKey ||
        r.city.toLowerCase() === resolvedKey ||
        r.aliases.includes(resolvedKey) ||
        r.normalizedQuery.includes(resolvedKey) ||
        resolvedKey.includes(r.normalizedQuery)
    );

    if (!record || record.events.length === 0) {
      return {
        query: rawClean,
        found: false,
        city: null,
        state: null,
        country: null,
        totalEvents: 0,
        categories: [],
        events: [],
        sourceMode: 'curated_mock',
      };
    }

    const sortedEvents = [...record.events].sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year;
      return b.date.localeCompare(a.date);
    });

    return {
      query: rawClean,
      found: true,
      city: record.city,
      state: record.state,
      country: record.country,
      totalEvents: sortedEvents.length,
      categories: aggregateCategories(sortedEvents),
      events: sortedEvents,
      sourceMode: 'curated_mock',
    };
  }

  private static async fetchFromLiveApi(
    city: string,
    endpoint: string,
    apiKey: string
  ): Promise<HistoricalDisasterResponse> {
    const url = new URL(endpoint);
    url.searchParams.set('city', city);
    url.searchParams.set('country', 'India');

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Disaster API responded with status ${res.status}`);
    }

    const data = await res.json();

    const events: HistoricalDisasterEvent[] = (data.events || []).map((item: any, idx: number) => ({
      id: item.id || `live-${idx}`,
      city: item.city || city,
      state: item.state || 'Data unavailable',
      country: item.country || 'India',
      disasterType: item.disasterType || 'Other',
      date: item.date || 'Data unavailable',
      year: item.year || (item.date ? parseInt(item.date.slice(0, 4), 10) : new Date().getFullYear()),
      endDate: item.endDate || null,
      duration: item.duration || 'Data unavailable',
      severity: item.severity || 'Moderate',
      headline: item.headline || null,
      description: item.description || 'Data unavailable',
      impact: {
        affectedPopulation: item.impact?.affectedPopulation || null,
        casualties: item.impact?.casualties || null,
        damageEstimate: item.impact?.damageEstimate || null,
        areasAffected: item.impact?.areasAffected || null,
      },
      source: item.source || 'Data unavailable',
      sourceUrl: item.sourceUrl || null,
      isCuratedArchive: false,
    }));

    return {
      query: city,
      found: events.length > 0,
      city: data.city || city,
      state: data.state || null,
      country: data.country || 'India',
      totalEvents: events.length,
      categories: aggregateCategories(events),
      events,
      sourceMode: 'live_api',
    };
  }
}

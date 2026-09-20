/**
 * FLOWSHIELD INDIA — Natural Disaster History & Articles Service
 *
 * Integrates:
 * 1. UN OCHA ReliefWeb API (Free, open public REST API for humanitarian reports & disaster situations in India)
 * 2. NASA EONET API (Earth Observatory Natural Event Tracker for floods & severe storms)
 * 3. NewsAPI / GNews (Optional client API if user configures VITE_NEWS_API_KEY / VITE_GNEWS_API_KEY)
 * 4. Comprehensive curated historical Indian disaster database (Kedarnath, Kerala, Assam, Bihar, etc.)
 */

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
];

// ─── 2. ReliefWeb UN OCHA API Integration (Open, Public, No Key Required) ────

interface ReliefWebReport {
  id: number;
  fields: {
    title: string;
    body?: string;
    url: string;
    date: {
      created: string;
    };
    source?: Array<{ name: string; shortname?: string }>;
    primary_country?: { name: string };
    disaster_type?: Array<{ name: string }>;
  };
}

export async function fetchReliefWebDisasterReports(): Promise<DisasterArticle[]> {
  const url =
    'https://api.reliefweb.int/v1/reports?appname=flowshield-india&query[value]=India+(flood+OR+cyclone+OR+landslide)&limit=15&profile=list&preset=latest';

  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`ReliefWeb API returned status ${res.status}`);
  }

  const data = await res.json();
  if (!data || !Array.isArray(data.data)) {
    return [];
  }

  return data.data.map((item: ReliefWebReport) => {
    const f = item.fields;
    const title = f.title || 'India Disaster Situation Report';
    const dateStr = f.date?.created || new Date().toISOString();
    const year = new Date(dateStr).getFullYear();

    // Determine type from title/fields
    let disasterType: DisasterArticle['disasterType'] = 'Flood';
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('cyclone')) disasterType = 'Cyclone';
    else if (lowerTitle.includes('landslide')) disasterType = 'Landslide';
    else if (lowerTitle.includes('flash flood')) disasterType = 'Flash Flood';
    else if (lowerTitle.includes('monsoon')) disasterType = 'Severe Monsoon';

    // Infer State if mentioned
    const knownStates = [
      'Assam', 'Kerala', 'Bihar', 'Uttarakhand', 'Himachal Pradesh',
      'Odisha', 'West Bengal', 'Gujarat', 'Tamil Nadu', 'Maharashtra',
      'Jammu and Kashmir', 'Delhi', 'Tripura', 'Sikkim', 'Andhra Pradesh',
    ];
    const detectedState = knownStates.find((st) => lowerTitle.includes(st.toLowerCase())) || 'National / Multi-State';

    const sourceName = f.source?.[0]?.name || 'UN OCHA ReliefWeb';

    return {
      id: `rw-${item.id}`,
      title,
      disasterType,
      state: detectedState,
      year,
      date: dateStr.split('T')[0],
      source: sourceName,
      sourceUrl: f.url || `https://reliefweb.int/node/${item.id}`,
      description: `Official situation report published on ReliefWeb by ${sourceName} documenting flood and severe hydro-meteorological impacts in ${detectedState}.`,
      severity: lowerTitle.includes('emergency') || lowerTitle.includes('severe') ? 'Critical' : 'Severe',
      affectedCount: 'Regional population impacted',
    };
  });
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
  // Category 'floods' and 'severeStorms'
  const url = 'https://eonet.gsfc.nasa.gov/api/v3/events?category=floods,severeStorms&status=all&limit=20';

  const res = await fetch(url);
  if (!res.ok) throw new Error(`NASA EONET returned status ${res.status}`);

  const data = await res.json();
  if (!data || !Array.isArray(data.events)) return [];

  // Filter events in Indian subcontinent bounding box (Lat 6 to 37 N, Lon 68 to 98 E)
  const indiaEvents = (data.events as EONETEvent[]).filter((ev) => {
    const geo = ev.geometry?.[0]?.coordinates;
    if (!geo || geo.length < 2) return false;
    const [lon, lat] = geo;
    return lat >= 6 && lat <= 38 && lon >= 67 && lon <= 99;
  });

  return indiaEvents.map((ev) => {
    const geom = ev.geometry?.[0];
    const dateStr = geom?.date || new Date().toISOString();
    const year = new Date(dateStr).getFullYear();
    const catTitle = ev.categories?.[0]?.title || 'Flood';

    return {
      id: `eonet-${ev.id}`,
      title: ev.title,
      disasterType: catTitle.toLowerCase().includes('storm') ? 'Cyclone' : 'Flood',
      state: 'India Hydrographic Basin',
      year,
      date: dateStr.split('T')[0],
      source: 'NASA Earth Observatory (EONET)',
      sourceUrl: ev.sources?.[0]?.url || 'https://eonet.gsfc.nasa.gov/',
      description: `NASA satellite and earth observation system event record capturing geospatial flood or severe meteorological disturbance.`,
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

    return data.articles.map((art: any, idx: number) => ({
      id: `news-${idx}-${Date.now()}`,
      title: art.title,
      disasterType: art.title?.toLowerCase().includes('cyclone') ? 'Cyclone' : 'Flood',
      state: 'India',
      year: new Date(art.publishedAt || Date.now()).getFullYear(),
      date: (art.publishedAt || '').split('T')[0] || new Date().toISOString().split('T')[0],
      source: art.source?.name || 'Live News',
      sourceUrl: art.url,
      description: art.description || 'Latest news coverage on natural disaster events in India.',
      severity: 'Moderate',
      imageUrl: art.urlToImage,
    }));
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

  // Query live endpoints concurrently
  try {
    const results = await Promise.allSettled([
      fetchReliefWebDisasterReports(),
      fetchNASAEONETEvents(),
      fetchLiveNewsArticles(),
    ]);

    results.forEach((r) => {
      if (r.status === 'fulfilled' && Array.isArray(r.value)) {
        liveArticles.push(...r.value);
      }
    });
  } catch (e) {
    console.info('[DisasterService] Live fetch error, utilizing historical records:', e);
  }

  // Deduplicate and combine live articles with our comprehensive historical registry
  const combinedMap = new Map<string, DisasterArticle>();

  // Add historical records first
  HISTORICAL_INDIAN_DISASTERS.forEach((art) => combinedMap.set(art.id, art));

  // Add live articles (avoid duplicate titles)
  liveArticles.forEach((art) => {
    const existing = Array.from(combinedMap.values()).find(
      (a) => a.title.toLowerCase() === art.title.toLowerCase()
    );
    if (!existing) {
      combinedMap.set(art.id, art);
    }
  });

  let list = Array.from(combinedMap.values());

  // Sort descending by date
  list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Apply filters
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

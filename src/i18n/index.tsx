import React, { createContext, useContext, useState } from 'react';

export type Language = 'en' | 'hi';

export interface Translations {
  // Brand & Header
  appTitle: string;
  appSubtitle: string;
  nationalIntelligence: string;
  istTime: string;

  // Nav
  navHome: string;
  navStations: string;
  navBasins: string;
  navBulletins: string;
  navHelp: string;

  // Statuses
  statusAll: string;
  statusNormal: string;
  statusAboveNormal: string;
  statusSevere: string;
  statusExtreme: string;

  // Types
  typeAll: string;
  typeRiverLevel: string;
  typeReservoirInflow: string;

  // KPI cards
  totalStations: string;
  activeWarnings: string;
  needsAttention: string;
  averageLevel: string;

  // Filters & Search
  filterByBasin: string;
  filterByState: string;
  filterByType: string;
  filterByStatus: string;
  searchPlaceholder: string;
  resetFilters: string;
  allBasins: string;
  allStates: string;

  // Table
  stationName: string;
  river: string;
  basin: string;
  state: string;
  currentLevel: string;
  trend: string;
  warningLevel: string;
  dangerLevel: string;
  hfl: string;
  status: string;
  action: string;
  viewDetails: string;
  exportCSV: string;
  showingPage: string;
  of: string;
  previous: string;
  next: string;

  // Station Detail
  backToStations: string;
  gaugeTitle: string;
  hydrographTitle: string;
  forecastTableTitle: string;
  sameRiverTitle: string;
  observed: string;
  forecast: string;
  capacityUtilization: string;
  lastUpdated: string;
  deltaToDanger: string;
  hflRecord: string;

  // Bulletins & Print
  bulletinTitle: string;
  dailyBulletins: string;
  printReport: string;
  affectedBasins: string;
  affectedStates: string;
  keyStations: string;

  // Help
  helpTitle: string;
  methodology: string;
  warningLevelDesc: string;
  dangerLevelDesc: string;
  hflDesc: string;
  apiDocs: string;
}

const en: Translations = {
  appTitle: 'FlowShield India',
  appSubtitle: 'National Flood Intelligence & Early Warning Command Center',
  nationalIntelligence: 'Official Telemetry • Central Water Commission Network',
  istTime: 'IST (Indian Standard Time)',

  navHome: 'Home (Map)',
  navStations: 'Stations',
  navBasins: 'Basins',
  navBulletins: 'Daily Bulletins',
  navHelp: 'Help & Data',

  statusAll: 'All Statuses',
  statusNormal: 'Normal',
  statusAboveNormal: 'Above Normal',
  statusSevere: 'Severe',
  statusExtreme: 'Extreme',

  typeAll: 'All Station Types',
  typeRiverLevel: 'River-Level Stations (Circles)',
  typeReservoirInflow: 'Reservoir-Inflow Stations (Squares)',

  totalStations: 'Total Stations',
  activeWarnings: 'Active Flood Warnings',
  needsAttention: 'Needs Immediate Attention',
  averageLevel: 'Average Basin Level',

  filterByBasin: 'Basin',
  filterByState: 'State',
  filterByType: 'Station Type',
  filterByStatus: 'Flood Status',
  searchPlaceholder: 'Search station, river, district or state...',
  resetFilters: 'Reset Filters',
  allBasins: 'All Basins',
  allStates: 'All States',

  stationName: 'Station',
  river: 'River',
  basin: 'Basin',
  state: 'State',
  currentLevel: 'Current Level',
  trend: 'Trend',
  warningLevel: 'Warning Level',
  dangerLevel: 'Danger Level',
  hfl: 'Highest Flood Level (HFL)',
  status: 'Status',
  action: 'Action',
  viewDetails: 'View Details',
  exportCSV: 'Export CSV',
  showingPage: 'Showing',
  of: 'of',
  previous: 'Previous',
  next: 'Next',

  backToStations: 'Back to Stations',
  gaugeTitle: 'Hydraulic Staff Gauge',
  hydrographTitle: 'Hydrograph (Observed & Forecast)',
  forecastTableTitle: '24-Hour Hydrological Forecast',
  sameRiverTitle: 'Other Stations on Same River',
  observed: 'Observed Level',
  forecast: 'Forecast Level',
  capacityUtilization: 'Threshold Utilization',
  lastUpdated: 'Last Updated',
  deltaToDanger: 'Delta to Danger Mark',
  hflRecord: 'Historical Peak Flood Level',

  bulletinTitle: 'Central Flood Advisory Bulletin',
  dailyBulletins: 'Daily National Flood Bulletins',
  printReport: 'Print Official Bulletin',
  affectedBasins: 'Affected River Basins',
  affectedStates: 'Affected States',
  keyStations: 'Critical Stations',

  helpTitle: 'Flood Monitoring Methodology & API Documentation',
  methodology: 'Central Water Commission (CWC) Classification Methodology',
  warningLevelDesc: 'Water level at which flood warning is initiated and river patrol commences.',
  dangerLevelDesc: 'Water level above which life and property in riparian zones are threatened.',
  hflDesc: 'Highest water level ever recorded at this gauging station since inception.',
  apiDocs: 'REST API Specification & Telemetry Endpoints',
};

const hi: Translations = {
  appTitle: 'फ्लोशील्ड भारत',
  appSubtitle: 'राष्ट्रीय बाढ़ चेतावनी एवं जलवैज्ञानिक निगरानी कमान केंद्र',
  nationalIntelligence: 'आधिकारिक टेलीमेट्री • केंद्रीय जल आयोग नेटवर्क',
  istTime: 'भारतीय मानक समय (IST)',

  navHome: 'मुख्य (मानचित्र)',
  navStations: 'स्टेशन सूची',
  navBasins: 'नदी बेसिन',
  navBulletins: 'दैनिक बुलेटिन',
  navHelp: 'सहायता एवं डेटा',

  statusAll: 'सभी स्थितियां',
  statusNormal: 'सामान्य',
  statusAboveNormal: 'सामान्य से अधिक',
  statusSevere: 'गंभीर स्थिति',
  statusExtreme: 'अत्यधिक बाढ़',

  typeAll: 'सभी प्रकार के स्टेशन',
  typeRiverLevel: 'नदी जलस्तर स्टेशन (गोलाकार)',
  typeReservoirInflow: 'जलाशय अंतर्वाह स्टेशन (चौकोर)',

  totalStations: 'कुल निगरानी स्टेशन',
  activeWarnings: 'सक्रिय बाढ़ चेतावनियां',
  needsAttention: 'तत्काल ध्यानाकर्षण आवश्यक',
  averageLevel: 'औसत जलस्तर',

  filterByBasin: 'नदी बेसिन',
  filterByState: 'राज्य',
  filterByType: 'स्टेशन प्रकार',
  filterByStatus: 'बाढ़ स्थिति',
  searchPlaceholder: 'स्टेशन, नदी, जिला या राज्य खोजें...',
  resetFilters: 'फ़िल्टर हटाएं',
  allBasins: 'सभी बेसिन',
  allStates: 'सभी राज्य',

  stationName: 'स्टेशन का नाम',
  river: 'नदी',
  basin: 'बेसिन',
  state: 'राज्य',
  currentLevel: 'वर्तमान जलस्तर',
  trend: 'प्रवृत्ति',
  warningLevel: 'चेतावनी स्तर',
  dangerLevel: 'खतरे का निशान',
  hfl: 'उच्चतम बाढ़ स्तर (HFL)',
  status: 'स्थिति',
  action: 'कार्य',
  viewDetails: 'विवरण देखें',
  exportCSV: 'CSV डाउनलोड करें',
  showingPage: 'दिखाया जा रहा है',
  of: 'का',
  previous: 'पिछला',
  next: 'अगला',

  backToStations: 'वापस स्टेशन सूची पर जाएं',
  gaugeTitle: 'हाइड्रोलिक स्टाफ गेज',
  hydrographTitle: 'हाइड्रोग्राफ (प्रेक्षित एवं पूर्वानुमान)',
  forecastTableTitle: '24-घंटे का जलवैज्ञानिक पूर्वानुमान',
  sameRiverTitle: 'समान नदी पर अन्य गेज स्टेशन',
  observed: 'प्रेक्षित जलस्तर',
  forecast: 'पूर्वानुमान जलस्तर',
  capacityUtilization: 'क्षमता उपयोग',
  lastUpdated: 'अंतिम अद्यतन',
  deltaToDanger: 'खतरे के निशान से अंतर',
  hflRecord: 'ऐतिहासिक उच्चतम बाढ़ स्तर',

  bulletinTitle: 'केंद्रीय बाढ़ परामर्श बुलेटिन',
  dailyBulletins: 'दैनिक राष्ट्रीय बाढ़ बुलेटिन',
  printReport: 'आधिकारिक बुलेटिन प्रिंट करें',
  affectedBasins: 'प्रभावित नदी बेसिन',
  affectedStates: 'प्रभावित राज्य',
  keyStations: 'अतिसंवेदनशील स्टेशन',

  helpTitle: 'बाढ़ निगरानी पद्धति एवं एपीआई प्रलेखन',
  methodology: 'केंद्रीय जल आयोग (CWC) वर्गीकरण पद्धति',
  warningLevelDesc: 'वह जलस्तर जिस पर पहली चेतावनी जारी की जाती है एवं गश्त शुरू होती है।',
  dangerLevelDesc: 'वह स्तर जिसके ऊपर आवासीय एवं कृषि क्षेत्रों में बाढ़ का सीधा खतरा उत्पन्न होता है।',
  hflDesc: 'इस गेजिंग स्टेशन पर इतिहास में दर्ज किया गया अब तक का उच्चतम जलस्तर।',
  apiDocs: 'REST API विनिर्देश एवं टेलीमेट्री एंडपॉइंट्स',
};

const translations: Record<Language, Translations> = { en, hi };

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const I18nContext = createContext<I18nContextType>({
  language: 'en',
  setLanguage: () => {},
  t: en,
});

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('flowshield-lang');
      return (saved === 'hi' || saved === 'en') ? saved : 'en';
    } catch {
      return 'en';
    }
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('flowshield-lang', lang);
    } catch {}
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);

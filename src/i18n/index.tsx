import React, { createContext, useContext, useState } from 'react';

export type Language = 'en' | 'hi' | 'bn' | 'te' | 'ta' | 'mr' | 'gu' | 'kn' | 'or' | 'as';

export interface LanguageMeta {
  code: Language;
  name: string;
  nativeName: string;
  region: string;
}

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  { code: 'en', name: 'English', nativeName: 'English', region: 'National / Official' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', region: 'Ganga & Yamuna Basin' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', region: 'Brahmaputra & Delta' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', region: 'Godavari & Krishna Basin' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', region: 'Cauvery Basin' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', region: 'Krishna & Godavari Catchment' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', region: 'Narmada & Tapi Basin' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', region: 'Krishna & Cauvery Catchment' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', region: 'Mahanadi Basin' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', region: 'Brahmaputra Valley' },
];

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
  navDisasters: string;
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
  navDisasters: 'Disaster History',
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
  navDisasters: 'आपदा इतिहास',
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

const bn: Translations = {
  appTitle: 'ফ্লোশিল্ড ভারত',
  appSubtitle: 'জাতীয় বন্যা পূর্বাভাস ও জলবৈজ্ঞানিক কমান্ড সেন্টার',
  nationalIntelligence: 'অফিসিয়াল টেলিমেট্রি • কেন্দ্রীয় জল কমিশন নেটওয়ার্ক',
  istTime: 'ভারতীয় প্রমিত সময় (IST)',

  navHome: 'হোম (মানচিত্র)',
  navStations: 'স্টেশনসমূহ',
  navBasins: 'নদী অববাহিকা',
  navBulletins: 'দৈনিক বুলেটিন',
  navDisasters: 'দুর্যোগ ইতিহাস',
  navHelp: 'সহায়তা ও ডেটা',

  statusAll: 'সকল অবস্থা',
  statusNormal: 'স্বাভাবিক',
  statusAboveNormal: 'স্বাভাবিকের উপরে',
  statusSevere: 'মারাত্মক বন্যা',
  statusExtreme: 'চরম বিপজ্জনক বন্যা',

  typeAll: 'সকল ধরনের স্টেশন',
  typeRiverLevel: 'নদীর জলস্তর স্টেশন',
  typeReservoirInflow: 'জলাধার অন্তর্বাহ স্টেশন',

  totalStations: 'মোট স্টেশন',
  activeWarnings: 'সক্রিয় বন্যা সতর্কতা',
  needsAttention: 'জরুরী পর্যবেক্ষণ প্রয়োজন',
  averageLevel: 'গড় অববাহিকা জলস্তর',

  filterByBasin: 'অববাহিকা',
  filterByState: 'রাজ্য',
  filterByType: 'স্টেশনের ধরন',
  filterByStatus: 'বন্যার স্থিতি',
  searchPlaceholder: 'স্টেশন, নদী, জেলা বা রাজ্য অনুসন্ধান করুন...',
  resetFilters: 'ফিল্টার রিসেট',
  allBasins: 'সকল অববাহিকা',
  allStates: 'সকল রাজ্য',

  stationName: 'স্টেশন',
  river: 'নদী',
  basin: 'অববাহিকা',
  state: 'রাজ্য',
  currentLevel: 'বর্তমান স্তর',
  trend: 'প্রবণতা',
  warningLevel: 'সতর্কতা স্তর',
  dangerLevel: 'বিপদসীমা',
  hfl: 'সর্বোচ্চ ঐতিহাসিক বন্যা স্তর (HFL)',
  status: 'অবস্থা',
  action: 'পদক্ষেপ',
  viewDetails: 'বিস্তারিত দেখুন',
  exportCSV: 'CSV ডাউনলোড',
  showingPage: 'প্রদর্শন',
  of: 'এর মধ্যে',
  previous: 'পূর্ববর্তী',
  next: 'পরবর্তী',

  backToStations: 'স্টেশন তালিকায় ফিরুন',
  gaugeTitle: 'হাইড্রোলিক স্টাফ গেজ',
  hydrographTitle: 'হাইড্রোগ্রাফ (পর্যবেক্ষিত ও পূর্বাভাস)',
  forecastTableTitle: '২৪ ঘন্টার জলবৈজ্ঞানিক পূর্বাভাস',
  sameRiverTitle: 'একই নদীর অন্যান্য স্টেশন',
  observed: 'পর্যবেক্ষিত স্তর',
  forecast: 'পূর্বাভাস স্তর',
  capacityUtilization: 'সীমা ব্যবহার',
  lastUpdated: 'সর্বশেষ আপডেট',
  deltaToDanger: 'বিপদসীমা থেকে দূরত্ব',
  hflRecord: 'ঐতিহাসিক রেকর্ড মাত্রা',

  bulletinTitle: 'কেন্দ্রীয় বন্যা পরামর্শ বুলেটিন',
  dailyBulletins: 'দৈনিক জাতীয় বন্যা বুলেটিন',
  printReport: 'অফিসিয়াল বুলেটিন প্রিন্ট',
  affectedBasins: 'আক্রান্ত অববাহিকাসমূহ',
  affectedStates: 'আক্রান্ত রাজ্যসমূহ',
  keyStations: 'গুরুত্বপূর্ণ ঝুঁকিপূর্ণ স্টেশন',

  helpTitle: 'বন্যা নিরীক্ষণ পদ্ধতি ও API তথ্য',
  methodology: 'কেন্দ্রীয় জল কমিশন (CWC) শ্রেণীবিন্যাস পদ্ধতি',
  warningLevelDesc: 'জলস্তর যেখানে প্রাথমিক সতর্কতা জারি করা হয় এবং টহল শুরু হয়।',
  dangerLevelDesc: 'জলস্তর যার উপরে নদী তীরবর্তী জীবন ও সম্পত্তির প্রত্যক্ষ ঝুঁকি সৃষ্টি হয়।',
  hflDesc: 'এই স্টেশনে ইতিহাসে রেকর্ড করা সর্বকালের সর্বোচ্চ জলস্তর।',
  apiDocs: 'REST API স্পেসিফিকেশন ও টেলিমেট্রি এন্ডপয়েন্ট',
};

const te: Translations = {
  appTitle: 'ఫ్లోషీల్డ్ భారత్',
  appSubtitle: 'జాతీయ వరద హెచ్చరిక & జలవనరుల పర్యవేక్షణ కేంద్రం',
  nationalIntelligence: 'అధికారిక టెలిమెట్రీ • సెంట్రల్ వాటర్ కమిషన్ నెట్‌వర్క్',
  istTime: 'భారత ప్రామాణిక కాలం (IST)',

  navHome: 'హోమ్ (మ్యాప్)',
  navStations: 'స్టేషన్లు',
  navBasins: 'నదీ పరివాహక ప్రాంతాలు',
  navBulletins: 'రోజువారీ బులెటిన్లు',
  navDisasters: 'విపత్తు చరిత్ర',
  navHelp: 'సహాయం & డేటా',

  statusAll: 'అన్ని స్థితులు',
  statusNormal: 'సాధారణం',
  statusAboveNormal: 'సాధారణం కంటే ఎక్కువ',
  statusSevere: 'తీవ్ర వరద',
  statusExtreme: 'అత్యంత ప్రమాదకరం',

  typeAll: 'అన్ని స్టేషన్ రకాలు',
  typeRiverLevel: 'నదీ నీటి మట్టం స్టేషన్లు',
  typeReservoirInflow: 'రిజర్వాయర్ ఇన్ఫ్లో స్టేషన్లు',

  totalStations: 'మొత్తం స్టేషన్లు',
  activeWarnings: 'క్రియాశీల వరద హెచ్చరికలు',
  needsAttention: 'తక్షణ శ్రద్ధ అవసరం',
  averageLevel: 'సగటు నీటి మట్టం',

  filterByBasin: 'పరివాహకం',
  filterByState: 'రాష్ట్రం',
  filterByType: 'స్టేషన్ రకం',
  filterByStatus: 'వరద స్థితి',
  searchPlaceholder: 'స్టేషన్, నది, జిల్లా లేదా రాష్ట్రాన్ని వెతకండి...',
  resetFilters: 'ఫిల్టర్లు రీసెట్ చేయండి',
  allBasins: 'అన్ని పరివాహకాలు',
  allStates: 'అన్ని రాష్ట్రాలు',

  stationName: 'స్టేషన్',
  river: 'నది',
  basin: 'పరివాహకం',
  state: 'రాష్ట్రం',
  currentLevel: 'ప్రస్తుత మట్టం',
  trend: 'ధోరణి',
  warningLevel: 'హెచ్చరిక మట్టం',
  dangerLevel: 'ప్రమాద స్థాయి',
  hfl: 'అత్యధిక వరద మట్టం (HFL)',
  status: 'స్థితి',
  action: 'చర్య',
  viewDetails: 'వివరాలు చూడండి',
  exportCSV: 'CSV ఎగుమతి చేయండి',
  showingPage: 'చూపిస్తున్నది',
  of: 'లో',
  previous: 'మునుపటి',
  next: 'తరువాతి',

  backToStations: 'స్టేషన్లకు తిరిగి వెళ్లండి',
  gaugeTitle: 'హైడ్రాలిక్ స్టాఫ్ గేజ్',
  hydrographTitle: 'హైడ్రోగ్రాఫ్ (పరిశీలించిన & అంచనా)',
  forecastTableTitle: '24-గంటల జలవైజ్ఞానిక సూచన',
  sameRiverTitle: 'అదే నదిపై ఇతర స్టేషన్లు',
  observed: 'పరిశీలించిన మట్టం',
  forecast: 'అంచనా మట్టం',
  capacityUtilization: 'పరిమితి వినియోగం',
  lastUpdated: 'చివరి నవీకరణ',
  deltaToDanger: 'ప్రమాద స్థాయికి వ్యత్యాసం',
  hflRecord: 'చారిత్రక రికార్డు మట్టం',

  bulletinTitle: 'కేంద్ర వరద సలహా బులెటిన్',
  dailyBulletins: 'రోజువారీ జాతీయ వరద బులెటిన్లు',
  printReport: 'బులెటిన్ ముద్రించండి',
  affectedBasins: 'ప్రభావిత నదీ పరివాహకాలు',
  affectedStates: 'ప్రభావిత రాష్ట్రాలు',
  keyStations: 'కీలక స్టేషన్లు',

  helpTitle: 'వరద పర్యవేక్షణ విధానం & API డాక్యుమెంటేషన్',
  methodology: 'సెంట్రల్ వాటర్ కమిషన్ (CWC) వర్గీకరణ విధానం',
  warningLevelDesc: 'వరద హెచ్చరిక ప్రారంభించబడి నదీ గస్తీ ప్రారంభమయ్యే నీటి మట్టం.',
  dangerLevelDesc: 'తీరప్రాంతాల్లో ప్రాణ నష్టం, ఆస్తి నష్టం సంభవించే ప్రమాద స్థాయి.',
  hflDesc: 'ఈ స్టేషన్‌లో చరిత్రలో నమోదైన అత్యధిక నీటి మట్టం.',
  apiDocs: 'REST API స్పెసిఫికేషన్ & టెలిమెట్రీ ఎండ్‌పాయింట్లు',
};

const ta: Translations = {
  appTitle: 'ஃப்ளோஷீல்ட் பாரதம்',
  appSubtitle: 'தேசிய வெள்ள முன்னெச்சரிக்கை மற்றும் நீரியல் கட்டுப்பாட்டு மையம்',
  nationalIntelligence: 'அதிகாரப்பூர்வ டெலிமெட்ரி • மத்திய நீர் ஆணைய நெட்வொர்க்',
  istTime: 'இந்திய நிலையான நேரம் (IST)',

  navHome: 'முகப்பு (வரைபடம்)',
  navStations: 'நிலையங்கள்',
  navBasins: 'நதிப் படுகைகள்',
  navBulletins: 'தினசரி அறிக்கைகள்',
  navDisasters: 'பேரிடர் வரலாறு',
  navHelp: 'உதவி & தரவு',

  statusAll: 'அனைத்து நிலைகள்',
  statusNormal: 'இயல்பு நிலை',
  statusAboveNormal: 'இயல்புக்கு மேல்',
  statusSevere: 'கடுமையான வெள்ளம்',
  statusExtreme: 'மிகவும் தீவிர வெள்ளம்',

  typeAll: 'அனைத்து நிலைய வகைகள்',
  typeRiverLevel: 'ஆற்று நீர்மட்ட நிலையங்கள்',
  typeReservoirInflow: 'நீர்த்தேக்க நீர்வரத்து நிலையங்கள்',

  totalStations: 'மொத்த நிலையங்கள்',
  activeWarnings: 'செயலில் உள்ள வெள்ள எச்சரிக்கைகள்',
  needsAttention: 'உடனடி கவனம் தேவை',
  averageLevel: 'சராசரி நீர்மட்டம்',

  filterByBasin: 'படுகை',
  filterByState: 'மாநிலம்',
  filterByType: 'நிலைய வகை',
  filterByStatus: 'வெள்ள நிலை',
  searchPlaceholder: 'நிலையம், நதி, மாவட்டம் அல்லது மாநிலத்தை தேடுங்கள்...',
  resetFilters: 'வடிகட்டிகளை மீட்டமை',
  allBasins: 'அனைத்து படுகைகள்',
  allStates: 'அனைத்து மாநிலங்கள்',

  stationName: 'நிலையம்',
  river: 'நதி',
  basin: 'படுகை',
  state: 'மாநிலம்',
  currentLevel: 'தற்போதைய மட்டம்',
  trend: 'போக்கு',
  warningLevel: 'எச்சரிக்கை மட்டம்',
  dangerLevel: 'அபாய அளவு',
  hfl: 'வரலாற்று உச்ச வெள்ள அளவு (HFL)',
  status: 'நிலை',
  action: 'நடவடிக்கை',
  viewDetails: 'விவரங்களை காண்க',
  exportCSV: 'CSV பதிவிறக்கு',
  showingPage: 'காண்பிக்கப்படுகிறது',
  of: 'இல்',
  previous: 'முந்தையது',
  next: 'அடுத்தது',

  backToStations: 'நிலையங்களுக்கு திரும்பு',
  gaugeTitle: 'ஹைட்ராலிக் அளவுகோல்',
  hydrographTitle: 'ஹைட்ரோகிராஃப் (கணிக்கப்பட்ட & பதிவு செய்யப்பட்டவை)',
  forecastTableTitle: '24 மணிநேர நீரியல் கணிப்பு',
  sameRiverTitle: 'இதே நதியில் உள்ள பிற நிலையங்கள்',
  observed: 'கண்டறியப்பட்ட மட்டம்',
  forecast: 'கணிக்கப்பட்ட மட்டம்',
  capacityUtilization: 'வரம்பு பயன்பாடு',
  lastUpdated: 'கடைசி புதுப்பிப்பு',
  deltaToDanger: 'அபாய அளவிற்கு இடைவெளி',
  hflRecord: 'வரலாற்று உச்ச வெள்ள மட்டம்',

  bulletinTitle: 'மத்திய வெள்ள ஆலோசனை அறிக்கை',
  dailyBulletins: 'தினசரி தேசிய வெள்ள அறிக்கைகள்',
  printReport: 'அறிக்கையை அச்சிடுக',
  affectedBasins: 'பாதிக்கப்பட்ட நதிப் படுகைகள்',
  affectedStates: 'பாதிக்கப்பட்ட மாநிலங்கள்',
  keyStations: 'முக்கிய அபாய நிலையங்கள்',

  helpTitle: 'வெள்ள கண்காணிப்பு முறை & API ஆவணங்கள்',
  methodology: 'மத்திய நீர் ஆணையம் (CWC) வகைப்பாடு நெறிமுறைகள்',
  warningLevelDesc: 'முதல் வெள்ள எச்சரிக்கை விடுக்கப்பட்டு நதி ரோந்து தொடங்கும் நீர்மட்டம்.',
  dangerLevelDesc: 'குடியிருப்பு மற்றும் விவசாய பகுதிகளுக்கு நேரடி ஆபத்து ஏற்படும் நிலை.',
  hflDesc: 'இந்த நிலையத்தில் இதுவரை பதிவான மிக உயர்ந்த நீர்மட்டம்.',
  apiDocs: 'REST API விவரங்கள் & டெலிமெட்ரி எண்ட்பாயிண்டுகள்',
};

const mr: Translations = {
  appTitle: 'फ्लोशील्ड भारत',
  appSubtitle: 'राष्ट्रीय पूर नियंत्रण आणि जलवैज्ञानिक निरीक्षण केंद्र',
  nationalIntelligence: 'अधिकृत टेलिमेट्री • केंद्रीय जल आयोग नेटवर्क',
  istTime: 'भारतीय प्रमाणवेळ (IST)',

  navHome: 'मुख्यपृष्ठ (नकाशा)',
  navStations: 'स्थानके',
  navBasins: 'नदी खोरी',
  navBulletins: 'दैनिक बुलेटिन',
  navDisasters: 'आपत्ती इतिहास',
  navHelp: 'मदत व डेटा',

  statusAll: 'सर्व स्थिती',
  statusNormal: 'सामान्य',
  statusAboveNormal: 'सामान्यापेक्षा जास्त',
  statusSevere: 'गंभीर पूर',
  statusExtreme: 'अत्यंत गंभीर पूर',

  typeAll: 'सर्व स्थानक प्रकार',
  typeRiverLevel: 'नदी पातळी स्थानके',
  typeReservoirInflow: 'जलाशय आवक स्थानके',

  totalStations: 'एकूण स्थानके',
  activeWarnings: 'सक्रिय पूर इशारे',
  needsAttention: 'तातडीचे लक्ष आवश्यक',
  averageLevel: 'सरासरी पाणीपातळी',

  filterByBasin: 'नदी खोरे',
  filterByState: 'राज्य',
  filterByType: 'स्थानक प्रकार',
  filterByStatus: 'पूर स्थिती',
  searchPlaceholder: 'स्थानक, नदी, जिल्हा किंवा राज्य शोधा...',
  resetFilters: 'फिल्टर रीसेट करा',
  allBasins: 'सर्व खोरी',
  allStates: 'सर्व राज्ये',

  stationName: 'स्थानक',
  river: 'नदी',
  basin: 'खोरे',
  state: 'राज्य',
  currentLevel: 'सध्याची पातळी',
  trend: 'प्रवृत्ती',
  warningLevel: 'इशारा पातळी',
  dangerLevel: 'धोका पातळी',
  hfl: 'उच्चतम पूर पातळी (HFL)',
  status: 'स्थिती',
  action: 'कृती',
  viewDetails: 'तपशील पहा',
  exportCSV: 'CSV डाउनलोड करा',
  showingPage: 'दाखवत आहे',
  of: 'पैकी',
  previous: 'मागील',
  next: 'पुढील',

  backToStations: 'स्थानक यादीकडे परत जा',
  gaugeTitle: 'हायड्रॉलिक स्टाफ गेज',
  hydrographTitle: 'हायड्रोग्राफ (निरीक्षित व अंदाज)',
  forecastTableTitle: '२४-तास जलवैज्ञानिक अंदाज',
  sameRiverTitle: 'त्याच नदीवरील इतर स्थानके',
  observed: 'नोंदवलेली पातळी',
  forecast: 'अंदाजित पातळी',
  capacityUtilization: 'क्षमता वापर',
  lastUpdated: 'शेवटचे अद्यतन',
  deltaToDanger: 'धोका पातळीपासून अंतर',
  hflRecord: 'ऐतिहासिक सर्वोच्च पातळी',

  bulletinTitle: 'केंद्रीय पूर सल्लागार बुलेटिन',
  dailyBulletins: 'दैनिक राष्ट्रीय पूर बुलेटिन',
  printReport: 'बुलेटिन प्रिंट करा',
  affectedBasins: 'प्रभावित नदी खोरी',
  affectedStates: 'प्रभावित राज्ये',
  keyStations: 'संवेदनशील स्थानके',

  helpTitle: 'पूर नियंत्रण पद्धती व API दस्तऐवजीकरण',
  methodology: 'केंद्रीय जल आयोग (CWC) वर्गीकरण पद्धत',
  warningLevelDesc: 'ज्या पातळीवर पहिला पूर इशारा जारी होतो व पाहणी सुरू होते.',
  dangerLevelDesc: 'ज्या पातळीवर लोकवस्ती व शेतीसाठी थेट धोका निर्माण होतो.',
  hflDesc: 'या स्थानकावर इतिहासात नोंदवलेली आतापर्यंतची सर्वोच्च पातळी.',
  apiDocs: 'REST API तपशील व टेलिमेट्री एंडपॉइंट्स',
};

const gu: Translations = {
  appTitle: 'ફ્લોશીલ્ડ ભારત',
  appSubtitle: 'રાષ્ટ્રીય પૂર ચેતવણી અને જળવિજ્ઞાન નિયંત્રણ કેન્દ્ર',
  nationalIntelligence: 'સત્તાવાર ટેલિમેટ્રી • સેન્ટ્રલ વોટર કમિશન નેટવર્ક',
  istTime: 'ભારતીય પ્રમાણભૂત સમય (IST)',

  navHome: 'મુખ્ય (નકશો)',
  navStations: 'સ્ટેશનો',
  navBasins: 'નદી બેસિન',
  navBulletins: 'દૈનિક બુલેટિન',
  navDisasters: 'આપત્તિ ઇતિહાસ',
  navHelp: 'મદદ અને ડેટા',

  statusAll: 'તમામ સ્થિતિ',
  statusNormal: 'સામાન્ય',
  statusAboveNormal: 'સામાન્યથી વધુ',
  statusSevere: 'ગંભીર પૂર',
  statusExtreme: 'અત્યંત ગંભીર પૂર',

  typeAll: 'તમામ સ્ટેશન પ્રકાર',
  typeRiverLevel: 'નદી જળસ્તર સ્ટેશનો',
  typeReservoirInflow: 'જળાશય આવક સ્ટેશનો',

  totalStations: 'કુલ સ્ટેશનો',
  activeWarnings: 'સક્રિય પૂર ચેતવણીઓ',
  needsAttention: 'તાત્કાલિક ધ્યાન જરૂરી',
  averageLevel: 'સરેરાશ જળસ્તર',

  filterByBasin: 'બેસિન',
  filterByState: 'રાજ્ય',
  filterByType: 'સ્ટેશન પ્રકાર',
  filterByStatus: 'પૂર સ્થિતિ',
  searchPlaceholder: 'સ્ટેશન, નદી, જિલ્લો અથવા રાજ્ય શોધો...',
  resetFilters: 'ફિલ્ટર્સ રીસેટ કરો',
  allBasins: 'તમામ બેસિન',
  allStates: 'તમામ રાજ્યો',

  stationName: 'સ્ટેશન',
  river: 'નદી',
  basin: 'બેસિન',
  state: 'રાજ્ય',
  currentLevel: 'વર્તમાન સ્તર',
  trend: 'વલણ',
  warningLevel: 'ચેતવણી સ્તર',
  dangerLevel: 'ભયજનક સપાટી',
  hfl: 'સર્વોચ્ચ પૂર સ્તર (HFL)',
  status: 'સ્થિતિ',
  action: 'કાર્ય',
  viewDetails: 'વિગતો જુઓ',
  exportCSV: 'CSV ડાઉનલોડ કરો',
  showingPage: 'દર્શાવી રહ્યું છે',
  of: 'માંથી',
  previous: 'પાછલું',
  next: 'આગલું',

  backToStations: 'સ્ટેશનોની યાદી પર પાછા જાઓ',
  gaugeTitle: 'હાઇડ્રોલિક સ્ટાફ ગેજ',
  hydrographTitle: 'હાઇડ્રોગ્રાફ (નિરીક્ષણ અને આગાહી)',
  forecastTableTitle: '24-કલાકની જળવિજ્ઞાન આગાહી',
  sameRiverTitle: 'તે જ નદી પરના અન્ય સ્ટેશનો',
  observed: 'નોંધાયેલ સ્તર',
  forecast: 'આગાહી સ્તર',
  capacityUtilization: 'મર્યાદા ઉપયોગિતા',
  lastUpdated: 'છેલ્લું અપડેટ',
  deltaToDanger: 'ભયજનક સપાટીથી અંતર',
  hflRecord: 'ઐતિહાસિક ઉચ્ચ સ્તર',

  bulletinTitle: 'કેન્દ્રીય પૂર સલાહકાર બુલેટિન',
  dailyBulletins: 'દૈનિક રાષ્ટ્રીય પૂર બુલેટિન',
  printReport: 'બુલેટિન પ્રિન્ટ કરો',
  affectedBasins: 'અસરગ્રસ્ત નદી બેસિન',
  affectedStates: 'અસરગ્રસ્ત રાજ્યો',
  keyStations: 'મહત્વપૂર્ણ સ્ટેશનો',

  helpTitle: 'પૂર મોનિટરિંગ પદ્ધતિ અને API દસ્તાવેજીકરણ',
  methodology: 'સેન્ટ્રલ વોટર કમિશન (CWC) વર્ગીકરણ પદ્ધતિ',
  warningLevelDesc: 'જળસ્તર કે જેના પર પ્રથમ પૂર ચેતવણી જાહેર કરવામાં આવે છે.',
  dangerLevelDesc: 'જે સપાટીથી ઉપર રહેણાંક અને ખેતી માટે સીધો ખતરો ઊભો થાય છે.',
  hflDesc: 'આ સ્ટેશન પર ઇતિહાસમાં અત્યાર સુધી નોંધાયેલું સર્વોચ્ચ જળસ્તર.',
  apiDocs: 'REST API સ્પષ્ટીકરણ અને ટેલિમેટ્રી એન્ડપોઇન્ટ્સ',
};

const kn: Translations = {
  appTitle: 'ಫ್ಲೋಶೀಲ್ಡ್ ಭಾರತ',
  appSubtitle: 'ರಾಷ್ಟ್ರೀಯ ಪ್ರವಾಹ ಮುನ್ನೆಚ್ಚರಿಕೆ ಮತ್ತು ಜಲವಿಜ್ಞಾನ ನಿಯಂತ್ರಣ ಕೇಂದ್ರ',
  nationalIntelligence: 'ಅಧಿಕೃತ ಟೆಲಿಮೆಟ್ರಿ • ಕೇಂದ್ರ ಜಲ ಆಯೋಗ ಜಾಲ',
  istTime: 'ಭಾರತೀಯ ಪ್ರಮಾಣಿತ ಕಾಲಮಾನ (IST)',

  navHome: 'ಮುಖಪುಟ (ನಕ್ಷೆ)',
  navStations: 'ನಿಲ್ದಾಣಗಳು',
  navBasins: 'ನದಿ ಜಲಾನಯನಗಳು',
  navBulletins: 'ದೈನಂದಿನ ಬುಲೆಟಿನ್ಗಳು',
  navDisasters: 'ವಿಪತ್ತು ಇತಿಹಾಸ',
  navHelp: 'ಸಹಾಯ ಮತ್ತು ಮಾಹಿತಿ',

  statusAll: 'ಎಲ್ಲಾ ಸ್ಥಿತಿಗಳು',
  statusNormal: 'ಸಾಮಾನ್ಯ',
  statusAboveNormal: 'ಸಾಮಾನ್ಯಕ್ಕಿಂತ ಹೆಚ್ಚು',
  statusSevere: 'ತೀವ್ರ ಪ್ರವಾಹ',
  statusExtreme: 'ಅತ್ಯಂತ ಅಪಾಯಕಾರಿ ಪ್ರವಾಹ',

  typeAll: 'ಎಲ್ಲಾ ನಿಲ್ದಾಣದ ವಿಧಗಳು',
  typeRiverLevel: 'ನದಿ ನೀರಿನ ಮಟ್ಟ ನಿಲ್ದಾಣಗಳು',
  typeReservoirInflow: 'ಜಲಾಶಯ ಒಳಹರಿವು ನಿಲ್ದಾಣಗಳು',

  totalStations: 'ಒಟ್ಟು ನಿಲ್ದಾಣಗಳು',
  activeWarnings: 'ಸಕ್ರಿಯ ಪ್ರವಾಹ ಎಚ್ಚರಿಕೆಗಳು',
  needsAttention: 'ತಕ್ಷಣದ ಗಮನ ಅಗತ್ಯ',
  averageLevel: 'ಸರಾಸರಿ ನೀರಿನ ಮಟ್ಟ',

  filterByBasin: 'ಜಲಾನಯನ',
  filterByState: 'ರಾಜ್ಯ',
  filterByType: 'ನಿಲ್ದಾಣದ ವಿಧ',
  filterByStatus: 'ಪ್ರವಾಹ ಸ್ಥಿತಿ',
  searchPlaceholder: 'ನಿಲ್ದಾಣ, ನದಿ, ಜಿಲ್ಲೆ ಅಥವಾ ರಾಜ್ಯವನ್ನು ಹುಡುಕಿ...',
  resetFilters: 'ಫಿಲ್ಟರ್‌ಗಳನ್ನು ಮರುಹೊಂದಿಸಿ',
  allBasins: 'ಎಲ್ಲಾ ಜಲಾನಯನಗಳು',
  allStates: 'ಎಲ್ಲಾ ರಾಜ್ಯಗಳು',

  stationName: 'ನಿಲ್ದಾಣ',
  river: 'ನದಿ',
  basin: 'ಜಲಾನಯನ',
  state: 'ರಾಜ್ಯ',
  currentLevel: 'ಪ್ರಸ್ತುತ ಮಟ್ಟ',
  trend: 'ಪ್ರವೃತ್ತಿ',
  warningLevel: 'ಎಚ್ಚರಿಕೆ ಮಟ್ಟ',
  dangerLevel: 'ಅಪಾಯದ ಮಟ್ಟ',
  hfl: 'ಐತಿಹಾಸಿಕ ಗರಿಷ್ಠ ಪ್ರವಾಹ ಮಟ್ಟ (HFL)',
  status: 'ಸ್ಥಿತಿ',
  action: 'ಕ್ರಮ',
  viewDetails: 'ವಿವರಗಳನ್ನು ವೀಕ್ಷಿಸಿ',
  exportCSV: 'CSV ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ',
  showingPage: 'ತೋರಿಸಲಾಗುತ್ತಿದೆ',
  of: 'ರಲ್ಲಿ',
  previous: 'ಹಿಂದಿನದು',
  next: 'ಮುಂದಿನದು',

  backToStations: 'ನಿಲ್ದಾಣಗಳ ಪಟ್ಟಿಗೆ ಹಿಂತಿರುಗಿ',
  gaugeTitle: 'ಹೈಡ್ರಾಲಿಕ್ ಸಿಬ್ಬಂದಿ ಗೇಜ್',
  hydrographTitle: 'ಹೈಡ್ರೋಗ್ರಾಫ್ (ವೀಕ್ಷಿಸಿದ ಮತ್ತು ಮುನ್ಸೂಚನೆ)',
  forecastTableTitle: '24-ಗಂಟೆಗಳ ಜಲವಿಜ್ಞಾನ ಮುನ್ಸೂಚನೆ',
  sameRiverTitle: 'ಅದೇ ನದಿಯಲ್ಲಿರುವ ಇತರ ನಿಲ್ದಾಣಗಳು',
  observed: 'ದಾಖಲಾದ ಮಟ್ಟ',
  forecast: 'ಮುನ್ಸೂಚನೆ ಮಟ್ಟ',
  capacityUtilization: 'ಮಿತಿ ಬಳಕೆ',
  lastUpdated: 'ಕೊನೆಯ ನವೀಕರಣ',
  deltaToDanger: 'ಅಪಾಯ ಮಟ್ಟಕ್ಕೆ ಅಂತರ',
  hflRecord: 'ಐತಿಹಾಸಿಕ ಗರಿಷ್ಠ ದಾಖಲೆ',

  bulletinTitle: 'ಕೇಂದ್ರ ಪ್ರವಾಹ ಸಲಹಾ ಬುಲೆಟಿನ್',
  dailyBulletins: 'ದೈನಂದಿನ ರಾಷ್ಟ್ರೀಯ ಪ್ರವಾಹ ಬುಲೆಟಿನ್‌ಗಳು',
  printReport: 'ಬುಲೆಟಿನ್ ಮುದ್ರಿಸಿ',
  affectedBasins: 'ಬಾಧಿತ ನದಿ ಜಲಾನಯನಗಳು',
  affectedStates: 'ಬಾಧಿತ ರಾಜ್ಯಗಳು',
  keyStations: 'ಪ್ರಮುಖ ಅಪಾಯದ ನಿಲ್ದಾಣಗಳು',

  helpTitle: 'ಪ್ರವಾಹ ಮೇಲ್ವಿಚಾರಣೆ ವಿಧಾನ ಮತ್ತು API ಮಾಹಿತಿ',
  methodology: 'ಕೇಂದ್ರ ಜಲ ಆಯೋಗ (CWC) ವರ್ಗೀಕರಣ ವಿಧಾನ',
  warningLevelDesc: 'ಮೊದಲ ಪ್ರವಾಹ ಎಚ್ಚರಿಕೆ ನೀಡುವ ಮತ್ತು ಗಸ್ತು ಪ್ರಾರಂಭವಾಗುವ ನೀರಿನ ಮಟ್ಟ.',
  dangerLevelDesc: 'ನದಿತೀರದ ಜನಜೀವನ ಮತ್ತು ಕೃಷಿಗೆ ನೇರ ಅಪಾಯವನ್ನುಂಟುಮಾಡುವ ಮಟ್ಟ.',
  hflDesc: 'ಈ ನಿಲ್ದಾಣದಲ್ಲಿ ಇತಿಹಾಸದಲ್ಲಿ ದಾಖಲಾದ ಅತ್ಯುನ್ನತ ನೀರಿನ ಮಟ್ಟ.',
  apiDocs: 'REST API ವಿವರಣೆ ಮತ್ತು ಟೆಲಿಮೆಟ್ರಿ ಎಂಡ್‌ಪಾಯಿಂಟ್‌ಗಳು',
};

const or: Translations = {
  appTitle: 'ଫ୍ଲୋସିଲ୍ଡ ଭାରତ',
  appSubtitle: 'ଜାତୀୟ ବନ୍ୟା ପୂର୍ବାନୁମାନ ଏବଂ ଜଳବୈଜ୍ଞାନିକ ନିୟନ୍ତ୍ରଣ କେନ୍ଦ୍ର',
  nationalIntelligence: 'ସରକାରୀ ଟେଲିମେଟ୍ରି • କେନ୍ଦ୍ରୀୟ ଜଳ ଆୟୋଗ ନେଟୱାର୍କ',
  istTime: 'ଭାରତୀୟ ମାନକ ସମୟ (IST)',

  navHome: 'ମୁଖ୍ୟ (ମାନଚିତ୍ର)',
  navStations: 'ଷ୍ଟେସନଗୁଡ଼ିକ',
  navBasins: 'ନଦୀ ଅବବାହିକା',
  navBulletins: 'ଦୈନିକ ବୁଲେଟିନ୍',
  navDisasters: 'ବିପର୍ଯ୍ୟୟ ଇତିହାସ',
  navHelp: 'ସାହାଯ୍ୟ ଓ ତଥ୍ୟ',

  statusAll: 'ସମସ୍ତ ସ୍ଥିତି',
  statusNormal: 'ସ୍ୱାଭାବିକ',
  statusAboveNormal: 'ସ୍ୱାଭାବିକଠାରୁ ଅଧିକ',
  statusSevere: 'ଭୟଙ୍କର ବନ୍ୟା',
  statusExtreme: 'ଅତ୍ୟନ୍ତ ବିପଜ୍ଜନକ ବନ୍ୟା',

  typeAll: 'ସମସ୍ତ ଷ୍ଟେସନ ପ୍ରକାର',
  typeRiverLevel: 'ନଦୀ ଜଳସ୍ତର ଷ୍ଟେସନ',
  typeReservoirInflow: 'ଜଳାଶୟ ପ୍ରବେଶ ଷ୍ଟେସନ',

  totalStations: 'ମୋଟ ଷ୍ଟେସନ',
  activeWarnings: 'ସକ୍ରିୟ ବନ୍ୟା ଚେତାବନୀ',
  needsAttention: 'ତୁରନ୍ତ ଧ୍ୟାନ ଆବଶ୍ୟକ',
  averageLevel: 'ହାରାହାରି ଜଳସ୍ତର',

  filterByBasin: 'ଅବବାହିକା',
  filterByState: 'ରାଜ୍ୟ',
  filterByType: 'ଷ୍ଟେସନ ପ୍ରକାର',
  filterByStatus: 'ବନ୍ୟା ସ୍ଥିତି',
  searchPlaceholder: 'ଷ୍ଟେସନ, ନଦୀ, ଜିଲ୍ଲା କିମ୍ବା ରାଜ୍ୟ ଖୋଜନ୍ତୁ...',
  resetFilters: 'ଫିଲ୍ଟର ହଟାନ୍ତୁ',
  allBasins: 'ସମସ୍ତ ଅବବାହିକା',
  allStates: 'ସମସ୍ତ ରାଜ୍ୟ',

  stationName: 'ଷ୍ଟେସନ',
  river: 'ନଦୀ',
  basin: 'ଅବବାହିକା',
  state: 'ରାଜ୍ୟ',
  currentLevel: 'ବର୍ତ୍ତମାନର ସ୍ତର',
  trend: 'ପ୍ରବୃତ୍ତି',
  warningLevel: 'ଚେତାବନୀ ସ୍ତର',
  dangerLevel: 'ବିପଦ ସଙ୍କେତ',
  hfl: 'ସର୍ବୋଚ୍ଚ ଐତିହାସିକ ବନ୍ୟା ସ୍ତର (HFL)',
  status: 'ସ୍ଥିତି',
  action: 'କାର୍ଯ୍ୟ',
  viewDetails: 'ବିବରଣୀ ଦେଖନ୍ତୁ',
  exportCSV: 'CSV ଡାଉନଲୋଡ୍ କରନ୍ତୁ',
  showingPage: 'ଦର୍ଶାଯାଉଛି',
  of: 'ରୁ',
  previous: 'ପୂର୍ବବର୍ତ୍ତୀ',
  next: 'ପରବର୍ତ୍ତୀ',

  backToStations: 'ଷ୍ଟେସନ ତାଲିକାକୁ ଫେରନ୍ତୁ',
  gaugeTitle: 'ହାଇଡ୍ରୋଲିକ୍ ଗେଜ୍',
  hydrographTitle: 'ହାଇଡ୍ରୋଗ୍ରାଫ୍ (ପର୍ଯ୍ୟବେକ୍ଷଣ ଓ ପୂର୍ବାନୁମାନ)',
  forecastTableTitle: '୨୪-ଘଣ୍ଟିଆ ଜଳବୈଜ୍ଞାନିକ ପୂର୍ବାନୁମାନ',
  sameRiverTitle: 'ସମାନ ନଦୀର ଅନ୍ୟ ଷ୍ଟେସନ',
  observed: 'ନିରୀକ୍ଷିତ ସ୍ତର',
  forecast: 'ପୂର୍ବାନୁମାନ ସ୍ତର',
  capacityUtilization: 'ସୀମା ବ୍ୟବହାର',
  lastUpdated: 'ଶେଷ ଅଦ୍ୟତନ',
  deltaToDanger: 'ବିପଦ ସଙ୍କେତଠାରୁ ଦୂରତା',
  hflRecord: 'ଐତିହାସିକ ସର୍ବୋଚ୍ଚ ରେକର୍ଡ',

  bulletinTitle: 'କେନ୍ଦ୍ରୀୟ ବନ୍ୟା ପରାମର୍ଶ ବୁଲେଟିନ୍',
  dailyBulletins: 'ଦୈନିକ ଜାତୀୟ ବନ୍ୟା ବୁଲେଟିନ୍',
  printReport: 'ବୁଲେଟିନ୍ ପ୍ରିଣ୍ଟ୍ କରନ୍ତୁ',
  affectedBasins: 'ପ୍ରଭାବିତ ନଦୀ ଅବବାହିକା',
  affectedStates: 'ପ୍ରଭାବିତ ରାଜ୍ୟଗୁଡ଼ିକ',
  keyStations: 'ସମ୍ବେଦନଶୀଳ ଷ୍ଟେସନ',

  helpTitle: 'ବନ୍ୟା ନିରୀକ୍ଷଣ ପଦ୍ଧତି ଓ API ବିବରଣୀ',
  methodology: 'କେନ୍ଦ୍ରୀୟ ଜଳ ଆୟୋଗ (CWC) ବର୍ଗୀକରଣ ପଦ୍ଧତି',
  warningLevelDesc: 'ଯେଉଁ ଜଳସ୍ତରରେ ପ୍ରଥମ ବନ୍ୟା ଚେତାବନୀ ଜାରି କରାଯାଏ।',
  dangerLevelDesc: 'ଯେଉଁ ସ୍ତରଠାରୁ ଜନବସତି ଏବଂ ଚାଷ ଜମି ପ୍ରତି ସିଧାସଳଖ ବିପଦ ସୃଷ୍ଟି ହୁଏ।',
  hflDesc: 'ଏହି ଷ୍ଟେସନରେ ଇତିହାସରେ ଏପର୍ଯ୍ୟନ୍ତ ରେକର୍ଡ ହୋଇଥିବା ସର୍ବୋଚ୍ଚ ଜଳସ୍ତର।',
  apiDocs: 'REST API ବିବରଣୀ ଏବଂ ଟେଲିମେଟ୍ରି ଏଣ୍ଡପଏଣ୍ଟ୍',
};

const as: Translations = {
  appTitle: 'ফ্লোশ্বিল্ড ভাৰত',
  appSubtitle: 'ৰাষ্ট্ৰীয় বান নিয়ন্ত্ৰণ আৰু জলবিজ্ঞান নিৰীক্ষণ কমাণ্ড চেণ্টাৰ',
  nationalIntelligence: 'চৰকাৰী টেলিমেট্ৰি • কেন্দ্ৰীয় জল আয়োগ নেটৱৰ্ক',
  istTime: 'ভাৰতীয় মান সময় (IST)',

  navHome: 'মুখ্য (মানচিত্ৰ)',
  navStations: 'ষ্টেচনসমূহ',
  navBasins: 'নদী অৱবাহিকা',
  navBulletins: 'দৈনিক বুলেটিন',
  navDisasters: 'দুর্যোগ ইতিহাস',
  navHelp: 'সহায় আৰু তথ্য',

  statusAll: 'সকলো স্থিতি',
  statusNormal: 'স্বাভাৱিক',
  statusAboveNormal: 'স্বাভাৱিকতকৈ অধিক',
  statusSevere: 'ভয়াবহ বানপানী',
  statusExtreme: 'চৰম বিপজ্জনক বানপানী',

  typeAll: 'সকলো ষ্টেচনৰ ধৰণ',
  typeRiverLevel: 'নদীৰ জলস্তৰ ষ্টেচন',
  typeReservoirInflow: 'জলাশয় অন্তৰ্বাহ ষ্টেচন',

  totalStations: 'মুঠ ষ্টেচন',
  activeWarnings: 'সক্ৰিয় বান সতৰ্কতা',
  needsAttention: 'জৰুৰী দৃষ্টি আকৰ্ষণৰ প্ৰয়োজন',
  averageLevel: 'গড় জলস্তৰ',

  filterByBasin: 'অৱবাহিকা',
  filterByState: 'ৰাজ্য',
  filterByType: 'ষ্টেচনৰ প্ৰকাৰ',
  filterByStatus: 'বানপানীৰ স্থিতি',
  searchPlaceholder: 'ষ্টেচন, নদী, জিলা বা ৰাজ্য সন্ধান কৰক...',
  resetFilters: 'ফিল্টাৰ আঁতৰাওক',
  allBasins: 'সকলো অৱবাহিকা',
  allStates: 'সকলো ৰাজ্য',

  stationName: 'ষ্টেচন',
  river: 'নদী',
  basin: 'অৱবাহিকা',
  state: 'ৰাজ্য',
  currentLevel: 'বৰ্তমানৰ স্তৰ',
  trend: 'প্ৰৱণতা',
  warningLevel: 'সতৰ্কতা স্তৰ',
  dangerLevel: 'বিপদ সীমা',
  hfl: 'সৰ্বোচ্চ ঐতিহাসিক বান স্তৰ (HFL)',
  status: 'স্থিতি',
  action: 'পদক্ষেপ',
  viewDetails: 'বিৱৰণ চাওক',
  exportCSV: 'CSV ডাউনল’ড কৰক',
  showingPage: 'প্ৰদৰ্শন কৰা হৈছে',
  of: 'ৰ ভিতৰত',
  previous: 'পূৰ্বৱৰ্তী',
  next: 'পৰৱৰ্তী',

  backToStations: 'ষ্টেচনৰ তালিকালৈ উভতি যাওক',
  gaugeTitle: 'হাইড্ৰলিক ষ্টাফ গজ',
  hydrographTitle: 'হাইড্ৰগ্ৰাফ (পৰ্যবেক্ষিত আৰু পূৰ্বাভাস)',
  forecastTableTitle: '২৪ ঘণ্টাৰ জলবৈজ্ঞানিক পূৰ্বাভাস',
  sameRiverTitle: 'একে নদীৰ আন ষ্টেচনসমূহ',
  observed: 'পৰ্যবেক্ষিত স্তৰ',
  forecast: 'পূৰ্বাভাস স্তৰ',
  capacityUtilization: 'ক্ষমতা ব্যৱহাৰ',
  lastUpdated: 'শেষ আপডেট',
  deltaToDanger: 'বিপদসীমাৰ পৰা ব্যৱধান',
  hflRecord: 'ঐতিহাসিক সৰ্বোচ্চ ৰেকৰ্ড',

  bulletinTitle: 'কেন্দ্ৰীয় বান পৰামৰ্শ বুলেটিন',
  dailyBulletins: 'দৈনিক ৰাষ্ট্ৰীয় বান বুলেটিন',
  printReport: 'বুলেটিন প্ৰিণ্ট কৰক',
  affectedBasins: 'ক্ষতিগ্ৰস্ত নদী অৱবাহিকা',
  affectedStates: 'ক্ষতিগ্ৰস্ত ৰাজ্যসমূহ',
  keyStations: 'সংবেদনশীল ষ্টেচন',

  helpTitle: 'বান নিৰীক্ষণ পদ্ধতি আৰু API নথিপত্ৰ',
  methodology: 'কেন্দ্ৰীয় জল আয়োগ (CWC) শ্ৰেণীবিভাজন পদ্ধতি',
  warningLevelDesc: 'যি জলস্তৰত প্ৰথম বান সতৰ্কতা জাৰি কৰা হয় আৰু তহল আৰম্ভ হয়।',
  dangerLevelDesc: 'যাৰ ওপৰত নদীৰ পাৰৰ জীৱন আৰু সম্পত্তিৰ প্ৰত্যক্ষ ভাবুকি সৃষ্টি হয়।',
  hflDesc: 'এই ষ্টেচনত ইতিহাসত এতিয়ালৈকে ৰেকৰ্ড কৰা সৰ্বোচ্চ জলস্তৰ।',
  apiDocs: 'REST API বিৱৰণ আৰু টেলিমেট্ৰি এণ্ডপইণ্ট',
};

const translations: Record<Language, Translations> = {
  en,
  hi,
  bn,
  te,
  ta,
  mr,
  gu,
  kn,
  or,
  as,
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  currentLanguageMeta: LanguageMeta;
  languages: LanguageMeta[];
}

const defaultMeta = SUPPORTED_LANGUAGES[0];

const I18nContext = createContext<I18nContextType>({
  language: 'en',
  setLanguage: () => {},
  t: en,
  currentLanguageMeta: defaultMeta,
  languages: SUPPORTED_LANGUAGES,
});

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('flowshield-lang') as Language;
      if (saved && translations[saved]) {
        return saved;
      }
    } catch {}
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('flowshield-lang', lang);
    } catch {}
  };

  const currentLanguageMeta =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) || defaultMeta;

  return (
    <I18nContext.Provider
      value={{
        language,
        setLanguage,
        t: translations[language] || en,
        currentLanguageMeta,
        languages: SUPPORTED_LANGUAGES,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);

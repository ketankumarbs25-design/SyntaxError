import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  Search,
  ExternalLink,
  Calendar,
  MapPin,
  FileText,
  Filter,
  RefreshCw,
  Globe,
  Waves,
  Wind,
  Mountain,
  CloudRain,
  Layers,
} from 'lucide-react';
import {
  getDisasterArticles,
  type DisasterArticle,
  type DisasterFilterOptions,
} from '../services/disasterService';
import { useI18n } from '../i18n';

export const DisasterHistoryPage: React.FC = () => {
  const { language } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedEra, setSelectedEra] = useState<DisasterFilterOptions['yearRange']>('all');

  const {
    data,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ['disasterArticles', searchQuery, selectedType, selectedState, selectedEra],
    queryFn: () =>
      getDisasterArticles({
        query: searchQuery,
        disasterType: selectedType,
        state: selectedState,
        yearRange: selectedEra,
      }),
    staleTime: 5 * 60 * 1000,
  });

  const articles = data?.articles || [];
  const isLive = data?.isLive ?? false;
  const liveCount = data?.liveCount ?? 0;

  // Extract unique states for filter
  const stateList = [
    'All States',
    'Assam',
    'Bihar',
    'Kerala',
    'Uttarakhand',
    'Himachal Pradesh',
    'Odisha',
    'West Bengal',
    'Tamil Nadu',
    'Maharashtra',
    'Jammu and Kashmir',
    'Delhi',
  ];

  const disasterTypes = [
    { id: 'all', label: language === 'hi' ? 'सभी आपदाएं' : 'All Types', icon: Layers },
    { id: 'flood', label: language === 'hi' ? 'बाढ़' : 'River Floods', icon: Waves },
    { id: 'flash flood', label: language === 'hi' ? 'आकस्मिक बाढ़' : 'Flash Floods', icon: CloudRain },
    { id: 'cyclone', label: language === 'hi' ? 'चक्रवात' : 'Cyclones', icon: Wind },
    { id: 'landslide', label: language === 'hi' ? 'भूस्खलन' : 'Landslides', icon: Mountain },
  ];

  const getSeverityBadge = (severity: DisasterArticle['severity']) => {
    switch (severity) {
      case 'Critical':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-950/70 dark:text-red-300 border border-red-200 dark:border-red-800">
            <AlertTriangle className="w-3 h-3 text-red-500" />
            {language === 'hi' ? 'गंभीर आपातकाल' : 'Critical Event'}
          </span>
        );
      case 'Severe':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="w-3 h-3 text-amber-500" />
            {language === 'hi' ? 'अति तीव्र' : 'Severe'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            {language === 'hi' ? 'मध्यम' : 'Moderate'}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30 mb-3">
                <Globe className="w-3.5 h-3.5 animate-pulse" />
                {language === 'hi' ? 'राष्ट्रीय आपदा इतिहास एवं रिपोर्ट' : 'National Disaster Records & UN Live Feeds'}
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                {language === 'hi' ? 'प्राकृतिक आपदा इतिहास एवं लेख' : 'History of Natural Disasters in India'}
              </h1>
              <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-3xl leading-relaxed">
                {language === 'hi'
                  ? 'केंद्रीय जल आयोग (CWC), संयुक्त राष्ट्र (UN OCHA ReliefWeb), एवं नासा (NASA EONET) से भारत के ऐतिहासिक व ताज़ा बाढ़, चक्रवात एवं भूस्खलन के आधिकारिक दस्तावेज।'
                  : 'Official situation reports, landmark deluge archives, and real-time humanitarian intelligence from UN OCHA ReliefWeb, NASA EONET, and Central Water Commission.'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-800/80 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-700 text-xs">
                <span className={`w-2.5 h-2.5 rounded-full ${isLive ? 'bg-emerald-400 animate-ping' : 'bg-emerald-500'}`} />
                <span className="text-slate-300 font-medium">
                  {isLive ? `ReliefWeb API Connected (${liveCount} live)` : 'UN OCHA & CWC Feeds Online'}
                </span>
              </div>
              <button
                onClick={() => refetch()}
                disabled={isRefetching}
                className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
                title="Refresh disaster articles"
              >
                <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-700/60">
            <div>
              <div className="text-2xl font-bold text-white">{articles.length}</div>
              <div className="text-xs text-slate-400">{language === 'hi' ? 'कुल प्रलेखित घटनाएं' : 'Documented Events'}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-400">100+ Years</div>
              <div className="text-xs text-slate-400">{language === 'hi' ? 'ऐतिहासिक अभिलेख' : 'Historical Deluges'}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">UN OCHA & NDMA</div>
              <div className="text-xs text-slate-400">{language === 'hi' ? 'आधिकारिक स्रोत' : 'Primary Source Feeds'}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-400">Zero Proxy</div>
              <div className="text-xs text-slate-400">{language === 'hi' ? 'सीधा सुरक्षित API' : 'Direct Browser REST'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#0E101B] rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={
                language === 'hi'
                  ? 'घटना, राज्य, नदी या कीवर्ड खोजें (उदा: Kedarnath, Kerala, Assam, Kosi)...'
                  : 'Search disaster, state, river, or keyword (e.g. Kedarnath, Kerala, Assam, Kosi)...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* State Selector */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              aria-label="Filter by state"
              className="w-full md:w-48 px-3 py-2.5 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{language === 'hi' ? 'सभी राज्य' : 'All States / Regions'}</option>
              {stateList.slice(1).map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Era Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedEra}
              onChange={(e) => setSelectedEra(e.target.value as any)}
              aria-label="Filter by time era"
              className="w-full md:w-48 px-3 py-2.5 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{language === 'hi' ? 'सभी समयावधि' : 'All Eras'}</option>
              <option value="2024-2026">2024 – 2026 (Live & Recent)</option>
              <option value="2020-2023">2020 – 2023</option>
              <option value="historical">{language === 'hi' ? 'ऐतिहासिक (2000-2019)' : 'Historical (2000–2019)'}</option>
            </select>
          </div>
        </div>

        {/* Disaster Type Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            {language === 'hi' ? 'प्रकार:' : 'Type:'}
          </span>
          {disasterTypes.map((t) => {
            const Icon = t.icon;
            const active = selectedType === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedType(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  active
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Articles Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#0E101B] rounded-xl border border-slate-200 dark:border-slate-800">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mb-3" />
          <p className="text-slate-600 dark:text-slate-300 text-sm font-medium">
            {language === 'hi'
              ? 'संयुक्त राष्ट्र एवं राष्ट्रीय आपदा अभिलेख लोड हो रहे हैं...'
              : 'Fetching disaster reports from UN OCHA ReliefWeb & NASA EONET...'}
          </p>
        </div>
      ) : articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-[#0E101B] rounded-xl border border-slate-200 dark:border-slate-800 text-center px-4">
          <AlertTriangle className="w-12 h-12 text-slate-400 mb-3" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">
            {language === 'hi' ? 'कोई आपदा लेख नहीं मिला' : 'No Disaster Records Found'}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 max-w-md">
            {language === 'hi'
              ? 'कृपया अपने खोज शब्द या फ़िल्टर समायोजित करें।'
              : 'Try clearing your search query or switching state/type filters.'}
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedType('all');
              setSelectedState('all');
              setSelectedEra('all');
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-500"
          >
            {language === 'hi' ? 'फ़िल्टर रीसेट करें' : 'Reset All Filters'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map((art) => (
            <div
              key={art.id}
              className="bg-white dark:bg-[#0E101B] rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:shadow-md hover:border-blue-500/40 dark:hover:border-blue-500/40 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Top badges */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {getSeverityBadge(art.severity)}
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {art.disasterType}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {art.year}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {art.title}
                </h3>

                {/* State & Date Info */}
                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-2 mb-3">
                  <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
                    <MapPin className="w-3 h-3 text-red-500" />
                    {art.state}
                  </span>
                  <span>•</span>
                  <span>{art.date}</span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-4 mb-4">
                  {art.description}
                </p>

                {/* Rivers affected tags */}
                {art.keyRiversAffected && art.keyRiversAffected.length > 0 && (
                  <div className="mb-4">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Waves className="w-3 h-3 text-blue-500" />
                      {language === 'hi' ? 'प्रभावित नदियां:' : 'Key Rivers Affected:'}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {art.keyRiversAffected.map((river) => (
                        <span
                          key={river}
                          className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 text-[11px]"
                        >
                          {river}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Impact stats pill */}
                {art.affectedCount && (
                  <div className="bg-slate-50 dark:bg-slate-900/60 rounded-lg p-2.5 border border-slate-200 dark:border-slate-800 text-xs mb-4">
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                      <span className="text-slate-400">{language === 'hi' ? 'जनसंख्या प्रभाव:' : 'Impact / Displaced:'}</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{art.affectedCount}</span>
                    </div>
                    {art.economicLoss && (
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 mt-1">
                        <span className="text-slate-400">{language === 'hi' ? 'आर्थिक क्षति:' : 'Damage Estimate:'}</span>
                        <span className="font-semibold text-amber-600 dark:text-amber-400">{art.economicLoss}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Source & Action */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 truncate">
                  <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span className="truncate font-medium">{art.source}</span>
                </div>

                <a
                  href={art.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:hover:bg-blue-900/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition-colors shrink-0"
                >
                  <span>{language === 'hi' ? 'मूल रिपोर्ट पढ़ें' : 'Read Report'}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DisasterHistoryPage;

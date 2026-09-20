import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  Search,
  ExternalLink,
  Calendar,
  MapPin,
  FileText,
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
import { Loader } from '../components/ui/Loader';
import { AI_Input_Search } from '../components/ui/AIInputSearch';

export const DisasterHistoryPage: React.FC = () => {
  const { language } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedEra, setSelectedEra] = useState<DisasterFilterOptions['yearRange']>('all');
  const [visibleCount, setVisibleCount] = useState<number>(12);
  const [showAiSearch, setShowAiSearch] = useState(false);

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
  const displayedArticles = articles.slice(0, visibleCount);
  const hasMore = visibleCount < articles.length;
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
      <div className="bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] rounded-xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--surface-2)] text-[var(--text-muted)] border border-[var(--border)] mb-3">
              <Globe className="w-3.5 h-3.5 text-[var(--live)]" />
              {language === 'hi' ? 'राष्ट्रीय आपदा इतिहास एवं रिपोर्ट' : 'Official natural disaster intelligence feeds'}
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--text)]">
              {language === 'hi' ? 'प्राकृतिक आपदा इतिहास एवं लेख' : 'History of natural disasters in India'}
            </h1>
            <p className="text-[var(--text-muted)] text-sm mt-2 max-w-3xl leading-relaxed">
              {language === 'hi'
                ? 'केंद्रीय जल आयोग (CWC), GDACS (संयुक्त राष्ट्र एवं यूरोपीय आयोग), एवं नासा (NASA EONET) से भारत के ऐतिहासिक व ताज़ा बाढ़, चक्रवात एवं भूस्खलन के आधिकारिक दस्तावेज।'
                : 'Official situation reports, landmark deluge archives, and real-time humanitarian intelligence from GDACS, NASA EONET, and Central Water Commission.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[var(--surface-2)] px-4 py-2 rounded-xl border border-[var(--border)] text-xs">
              <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-[var(--live)] animate-pulse' : 'bg-[var(--normal)]'}`} />
              <span className="text-[var(--text)] font-medium">
                {isLive ? `Live connected (${liveCount} active)` : 'Disaster feeds online'}
              </span>
            </div>
            <button
              onClick={() => refetch()}
              disabled={isRefetching}
              className="p-2.5 bg-[var(--primary)] hover:opacity-90 text-white rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
              title="Refresh disaster articles"
            >
              <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[var(--surface)] rounded-xl p-4 border border-[var(--border)] shadow-xs space-y-4">
        {/* Optional AI Search Input */}
        {showAiSearch ? (
          <div className="pt-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[var(--live)] flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                AI Natural Disaster Search
              </span>
              <button
                type="button"
                onClick={() => setShowAiSearch(false)}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] underline cursor-pointer"
              >
                Switch to Standard Filter
              </button>
            </div>
            <AI_Input_Search
              placeholder="Ask or search natural disasters (e.g., 'Kedarnath cloudburst 2013', 'Wayanad landslides', 'Yamuna record level')..."
              searchLabel="Disasters"
              onSubmit={(val) => setSearchQuery(val)}
            />
          </div>
        ) : null}

        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder={
                language === 'hi'
                  ? 'घटना, राज्य, नदी या कीवर्ड खोजें (उदा: Kedarnath, Kerala, Assam, Kosi)...'
                  : 'Search disaster, state, river, or keyword (e.g. Kedarnath, Kerala, Assam, Kosi)...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-24 py-2.5 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
            <button
              type="button"
              onClick={() => setShowAiSearch(!showAiSearch)}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded-md text-[11px] font-semibold bg-[var(--surface)] text-[var(--live)] border border-[var(--border)] hover:border-[var(--live)] transition-all cursor-pointer"
              title="Toggle AI Search Bar"
            >
              AI Search
            </button>
          </div>

          {/* State Selector */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <MapPin className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              aria-label="Filter by state"
              className="w-full md:w-48 px-3 py-2.5 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            >
              <option value="all">{language === 'hi' ? 'सभी राज्य' : 'All states / regions'}</option>
              {stateList.slice(1).map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Era Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Calendar className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
            <select
              value={selectedEra}
              onChange={(e) => setSelectedEra(e.target.value as any)}
              aria-label="Filter by time era"
              className="w-full md:w-48 px-3 py-2.5 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            >
              <option value="all">{language === 'hi' ? 'सभी समयावधि' : 'All eras'}</option>
              <option value="2024-2026">2024 – 2026 (Live & recent)</option>
              <option value="2020-2023">2020 – 2023</option>
              <option value="historical">{language === 'hi' ? 'ऐतिहासिक (2000-2019)' : 'Historical (2000–2019)'}</option>
            </select>
          </div>
        </div>

        {/* Disaster Type Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {disasterTypes.map((t) => {
            const Icon = t.icon;
            const isSelected = selectedType === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedType(t.id as any)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-[var(--primary)] text-white shadow-xs'
                    : 'bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text)] border border-[var(--border)]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Articles Grid / Results Section */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 bg-[var(--surface)] rounded-xl border border-[var(--border)]">
          <Loader
            size="md"
            title="Loading Disaster Intelligence Feeds..."
            subtitle="Aggregating verified reports from UN OCHA ReliefWeb, NASA EONET, and CWC..."
          />
        </div>
      ) : displayedArticles.length === 0 ? (
        <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-12 text-center">
          <AlertTriangle className="w-12 h-12 text-[var(--watch)] mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-semibold text-[var(--text)]">
            {language === 'hi' ? 'कोई आपदा लेख नहीं मिला' : 'No disaster articles match your filters'}
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-1 max-w-md mx-auto">
            {language === 'hi'
              ? 'कृपया अपना खोज शब्द या चयनित फ़िल्टर बदलें।'
              : 'Try clearing the search text or switching to another state or disaster category.'}
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedType('all');
              setSelectedState('all');
              setSelectedEra('all');
            }}
            className="mt-4 px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-xs font-semibold hover:opacity-90"
          >
            {language === 'hi' ? 'फ़िल्टर रीसेट करें' : 'Reset all filters'}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayedArticles.map((art) => {
              const displayLocation = (art.state || '').replace(/,\s*India/i, '').replace(/Sri Lanka/i, 'Southern Coastal Waters');
              return (
                <div
                  key={art.id}
                  className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-5 shadow-xs hover:border-[var(--primary)]/40 transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Top badges */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {getSeverityBadge(art.severity)}
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[var(--surface-2)] text-[var(--text-muted)] border border-[var(--border)]">
                          {art.disasterType}
                        </span>
                      </div>
                      <span className="text-xs text-[var(--text-muted)] font-mono flex items-center gap-1">
                        <Calendar className="w-3 h-3 opacity-70" />
                        {art.year}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-base text-[var(--text)] leading-snug group-hover:text-[var(--live)] transition-colors">
                      {art.title}
                    </h3>

                    {/* State & Date Info */}
                    <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] mt-2 mb-3">
                      <span className="flex items-center gap-1 font-medium">
                        <MapPin className="w-3 h-3 text-[var(--danger)]" />
                        {displayLocation}
                      </span>
                      <span>•</span>
                      <span className="font-mono">{art.date}</span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed line-clamp-4 mb-4">
                      {art.description}
                    </p>

                    {/* Rivers affected tags */}
                    {art.keyRiversAffected && art.keyRiversAffected.length > 0 && (
                      <div className="mb-4">
                        <div className="text-[12px] font-medium text-[var(--text-muted)] mb-1 flex items-center gap-1">
                          <Waves className="w-3 h-3 text-[var(--primary)]" />
                          {language === 'hi' ? 'प्रभावित नदियां:' : 'Key rivers affected:'}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {art.keyRiversAffected.map((river) => (
                            <span
                              key={river}
                              className="px-2 py-0.5 rounded bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)] text-[11px]"
                            >
                              {river}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Impact stats pill (Omit GLIDE filler) */}
                    {art.affectedCount && !art.affectedCount.toLowerCase().includes('glide') && (
                      <div className="bg-[var(--surface-2)] rounded-lg p-2.5 border border-[var(--border)] text-xs mb-4">
                        <div className="flex items-center justify-between text-[var(--text-muted)]">
                          <span>{language === 'hi' ? 'जनसंख्या प्रभाव:' : 'Impact / displaced:'}</span>
                          <span className="font-semibold text-[var(--text)] font-mono">{art.affectedCount}</span>
                        </div>
                        {art.economicLoss && (
                          <div className="flex items-center justify-between text-[var(--text-muted)] mt-1">
                            <span>{language === 'hi' ? 'आर्थिक क्षति:' : 'Damage estimate:'}</span>
                            <span className="font-semibold text-[var(--warning)] font-mono">{art.economicLoss}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Bottom Source & Action */}
                  <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] truncate">
                      <FileText className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />
                      <span className="truncate font-medium">{art.source}</span>
                    </div>

                    <a
                      href={art.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--surface-2)] hover:bg-[var(--surface-2)]/80 text-[var(--text)] border border-[var(--border)] transition-colors shrink-0"
                    >
                      <span>{language === 'hi' ? 'मूल रिपोर्ट पढ़ें' : 'Read report'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="flex flex-col items-center justify-center pt-4 pb-2 gap-2">
              <button
                onClick={() => setVisibleCount((prev) => prev + 12)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>{language === 'hi' ? 'अधिक ऐतिहासिक रिपोर्ट लोड करें' : 'Load More Historical Reports'}</span>
              </button>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Showing {displayedArticles.length} of {articles.length} verified reports
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DisasterHistoryPage;

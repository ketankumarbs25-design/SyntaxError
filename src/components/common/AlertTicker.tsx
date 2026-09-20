import { AlertCircle, ArrowRight } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import type { FloodBulletin, Station } from '../../api/types';
import { useI18n } from '../../i18n';

interface AlertTickerProps {
  bulletins: FloodBulletin[];
  severeStations: Station[];
}

export const AlertTicker: React.FC<AlertTickerProps> = ({ bulletins, severeStations }) => {
  const { language } = useI18n();

  // Combine bulletins & critical stations for continuous marquee
  const tickerItems = [
    ...bulletins.map((b) => ({
      id: b.id,
      type: 'bulletin' as const,
      text: language === 'hi' ? b.titleHi : b.title,
      severity: b.severity,
      link: '/bulletins',
    })),
    ...severeStations.slice(0, 5).map((s) => ({
      id: s.id,
      type: 'station' as const,
      text: `${s.name} (${s.river}) - ${s.status.toUpperCase()}: ${s.currentLevel.toFixed(2)}m (${s.deltaToDangerM >= 0 ? `+${s.deltaToDangerM}m above danger` : 'approaching danger'})`,
      severity: s.status === 'Extreme' ? 'Extreme' : 'Severe',
      link: `/stations/${s.id}`,
    })),
  ];

  if (tickerItems.length === 0) return null;

  return (
    <div
      className="w-full bg-red-600 text-white overflow-hidden py-1.5 px-3 flex items-center shadow-xs select-none relative z-30"
      role="region"
      aria-label="Active Flood Warnings Ticker"
    >
      {/* Ticker Fixed Header Label */}
      <div className="flex items-center gap-1.5 bg-red-700/90 text-white px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider shrink-0 z-10 shadow-xs mr-3">
        <AlertCircle className="w-3.5 h-3.5 text-amber-300" />
        <span>{language === 'hi' ? 'ताज़ा अलर्ट' : 'LIVE ALERTS'}</span>
      </div>

      {/* Marquee Track */}
      <div className="flex-1 overflow-hidden relative flex items-center">
        <div className="animate-ticker flex items-center gap-8 text-xs font-semibold">
          {/* Duplicate array for seamless infinite looping */}
          {[...tickerItems, ...tickerItems].map((item, idx) => (
            <NavLink
              key={`${item.id}-${idx}`}
              to={item.link}
              className="inline-flex items-center gap-2 text-white hover:text-amber-200 transition-colors shrink-0 group"
            >
              <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping inline-block" />
              <span>{item.text}</span>
              <ArrowRight className="w-3 h-3 opacity-70 group-hover:translate-x-0.5 transition-transform" />
              <span className="text-white/40 ml-4">•</span>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { ArrowRight } from 'lucide-react';
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
      text: `${s.name} (${s.river}) - ${s.status}: ${s.currentLevel.toFixed(2)}m (${s.deltaToDangerM >= 0 ? `+${s.deltaToDangerM}m above danger` : 'approaching danger'})`,
      severity: s.status === 'Extreme' ? 'Extreme' : 'Severe',
      link: `/stations/${s.id}`,
    })),
  ];

  if (tickerItems.length === 0) return null;

  return (
    <div
      className="w-full bg-[var(--bg)] border-b border-[var(--border)] overflow-hidden py-2 px-3 sm:px-4 flex items-center select-none relative z-30"
      role="region"
      aria-label="Active flood warnings ticker"
    >
      {/* Ticker Fixed Header Label with red Live dot */}
      <div className="flex items-center gap-2 bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 z-10 mr-3 shadow-xs">
        <span className="w-2 h-2 rounded-full bg-[var(--danger)] animate-pulse inline-block" />
        <span className="text-xs font-medium text-[var(--text)]">
          {language === 'hi' ? 'ताज़ा अलर्ट' : 'Live alerts'}
        </span>
      </div>

      {/* Marquee Track - pauses on hover, padded so text is never clipped at left edge */}
      <div className="flex-1 overflow-hidden relative flex items-center pl-3">
        <div className="animate-ticker flex items-center gap-8 text-xs font-medium hover:[animation-play-state:paused]">
          {[...tickerItems, ...tickerItems].map((item, idx) => (
            <NavLink
              key={`${item.id}-${idx}`}
              to={item.link}
              className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors shrink-0 group"
            >
              <span
                className="w-1.5 h-1.5 rounded-full inline-block"
                style={{
                  backgroundColor:
                    item.severity === 'Extreme'
                      ? 'var(--danger)'
                      : item.severity === 'Severe'
                      ? 'var(--warning)'
                      : 'var(--watch)',
                }}
              />
              <span className="text-[var(--text)]">{item.text}</span>
              <ArrowRight className="w-3 h-3 text-[var(--text-muted)] opacity-70 group-hover:translate-x-0.5 transition-transform" />
              <span className="text-[var(--border)] ml-3 select-none">·</span>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AlertTicker;

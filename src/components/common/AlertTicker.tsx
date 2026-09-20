import React from 'react';
import { ArrowRight, AlertTriangle, Siren } from 'lucide-react';
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
    ...severeStations.slice(0, 8).map((s) => ({
      id: s.id,
      type: 'station' as const,
      text: `${s.name} (${s.river}) — ${s.status}: ${s.currentLevel.toFixed(2)}m (${
        s.deltaToDangerM >= 0
          ? `+${s.deltaToDangerM}m above danger`
          : 'approaching danger'
      })`,
      severity: s.status === 'Extreme' ? 'Extreme' : 'Severe',
      link: `/stations/${s.id}`,
    })),
  ];

  if (tickerItems.length === 0) return null;

  // Determine highest active severity to drive the bar color
  const hasExtreme = tickerItems.some((i) => i.severity === 'Extreme');
  const hasSevere  = tickerItems.some((i) => i.severity === 'Severe');

  const barBg    = hasExtreme ? 'rgba(198,40,40,0.18)'   : hasSevere ? 'rgba(240,138,36,0.15)' : 'rgba(242,194,48,0.12)';
  const barBorder= hasExtreme ? 'rgba(198,40,40,0.55)'   : hasSevere ? 'rgba(240,138,36,0.45)' : 'rgba(242,194,48,0.4)';
  const badgeBg  = hasExtreme ? 'var(--danger)'           : hasSevere ? 'var(--warning)'         : 'var(--watch)';
  const badgeText= hasExtreme ? '#fff'                    : hasSevere ? '#fff'                   : '#0B1F33';

  const severityColor = (sev: string) => {
    if (sev === 'Extreme') return 'var(--danger)';
    if (sev === 'Severe')  return 'var(--warning)';
    return 'var(--watch)';
  };

  return (
    <div
      className="w-full overflow-hidden py-2 px-3 sm:px-4 flex items-center select-none relative z-30 border-b"
      style={{
        background: barBg,
        borderColor: barBorder,
      }}
      role="region"
      aria-label="Active flood warnings ticker"
    >
      {/* Fixed Badge — danger-red or warning-orange depending on severity */}
      <div
        className="flex items-center gap-1.5 shrink-0 mr-3 z-10 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide shadow-sm"
        style={{ background: badgeBg, color: badgeText }}
      >
        {hasExtreme ? (
          <Siren className="w-3 h-3 animate-pulse" />
        ) : (
          <AlertTriangle className="w-3 h-3 animate-pulse" />
        )}
        <span>{language === 'hi' ? 'ताज़ा अलर्ट' : hasExtreme ? 'EXTREME ALERT' : 'LIVE WARNING'}</span>
      </div>

      {/* Blinking severity pill count */}
      <div
        className="shrink-0 mr-3 text-[10px] font-semibold px-2 py-0.5 rounded-full border"
        style={{
          color: hasExtreme ? 'var(--danger)' : 'var(--warning)',
          borderColor: hasExtreme ? 'rgba(198,40,40,0.5)' : 'rgba(240,138,36,0.5)',
          background: hasExtreme ? 'rgba(198,40,40,0.12)' : 'rgba(240,138,36,0.10)',
        }}
      >
        {tickerItems.length} alerts
      </div>

      {/* Marquee Track */}
      <div className="flex-1 overflow-hidden relative flex items-center">
        <div className="animate-ticker flex items-center gap-8 text-xs font-medium hover:[animation-play-state:paused]">
          {[...tickerItems, ...tickerItems].map((item, idx) => (
            <NavLink
              key={`${item.id}-${idx}`}
              to={item.link}
              className="inline-flex items-center gap-2 transition-colors shrink-0 group"
              style={{ color: severityColor(item.severity) }}
            >
              {/* Severity dot */}
              <span
                className="w-2 h-2 rounded-full inline-block shrink-0 animate-pulse"
                style={{ backgroundColor: severityColor(item.severity) }}
              />

              {/* Severity label badge */}
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide"
                style={{
                  background: severityColor(item.severity) + '25',
                  color: severityColor(item.severity),
                  border: `1px solid ${severityColor(item.severity)}50`,
                }}
              >
                {item.severity}
              </span>

              {/* Alert text */}
              <span className="font-medium group-hover:underline underline-offset-2">
                {item.text}
              </span>

              <ArrowRight
                className="w-3 h-3 opacity-60 group-hover:translate-x-0.5 transition-transform"
              />

              {/* Separator */}
              <span className="opacity-30 ml-2 select-none">·</span>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AlertTicker;

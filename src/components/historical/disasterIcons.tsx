import React from 'react';
import {
  Waves,
  CloudRain,
  Mountain,
  Wind,
  Activity,
  SunMedium,
  AlertTriangle,
  type LucideProps,
} from 'lucide-react';
import type { DisasterType } from '../../types/disaster';

export function getDisasterLucideIcon(
  type: DisasterType | string,
  props: LucideProps = { className: 'w-4 h-4' }
): React.ReactElement {
  switch (type) {
    case 'Flood':
      return <Waves {...props} />;
    case 'Extreme Rainfall':
      return <CloudRain {...props} />;
    case 'Landslide':
      return <Mountain {...props} />;
    case 'Cyclone':
      return <Wind {...props} />;
    case 'Earthquake':
      return <Activity {...props} />;
    case 'Drought':
      return <SunMedium {...props} />;
    default:
      return <AlertTriangle {...props} />;
  }
}

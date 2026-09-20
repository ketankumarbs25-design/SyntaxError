import React from 'react';
import { GlobeStaticFallback } from './GlobeStaticFallback';

interface Globe3DViewProps {
  onZoomComplete: () => void;
}

export const Globe3DView: React.FC<Globe3DViewProps> = ({ onZoomComplete }) => {
  return <GlobeStaticFallback onZoomComplete={onZoomComplete} />;
};

export default Globe3DView;


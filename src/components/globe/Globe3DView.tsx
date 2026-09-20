import React, { useEffect, useRef, useState } from 'react';
import Globe, { type GlobeMethods } from 'react-globe.gl';

interface Globe3DViewProps {
  onZoomComplete: () => void;
}

export const Globe3DView: React.FC<Globe3DViewProps> = ({ onZoomComplete }) => {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const [countries, setCountries] = useState<any[]>([]);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  // Responsive resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load countries GeoJSON
  useEffect(() => {
    let active = true;
    fetch('/world_countries.geojson')
      .then((res) => res.json())
      .then((data) => {
        if (active && data.features) {
          setCountries(data.features);
        }
      })
      .catch((err) => {
        console.warn('Failed to load local world countries geojson:', err);
      });

    return () => {
      active = false;
    };
  }, []);

  // Configure Globe, Rotation, and Camera Zoom animation
  useEffect(() => {
    if (!globeRef.current) return;
    const globe = globeRef.current;

    // Initial camera position: distant full-globe view
    globe.pointOfView({ lat: 10, lng: 0, altitude: 2.8 }, 0);

    // Orbit controls settings
    const controls = globe.controls();
    if (controls) {
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.8;
      controls.enableZoom = false;
      controls.enablePan = false;
      controls.enableRotate = false;
    }

    // After 350ms initial rotation, ease camera zoom to India (lat ~20.5937, lon ~78.9629)
    const zoomTimer = setTimeout(() => {
      if (!globeRef.current) return;
      // Animate camera zoom to India over 2600ms using eased transition
      globeRef.current.pointOfView(
        { lat: 20.5937, lng: 78.9629, altitude: 0.65 },
        2600
      );
    }, 350);

    // Zoom complete callback triggered at 3000ms (350ms + 2650ms)
    const completionTimer = setTimeout(() => {
      onZoomComplete();
    }, 3000);

    return () => {
      clearTimeout(zoomTimer);
      clearTimeout(completionTimer);
    };
  }, [onZoomComplete]);

  // Full Three.js disposal on unmount to prevent WebGL leaks
  useEffect(() => {
    return () => {
      if (!globeRef.current) return;
      try {
        const globe = globeRef.current;
        const renderer = globe.renderer();
        const scene = globe.scene();
        const controls = globe.controls();

        if (controls && controls.dispose) {
          controls.dispose();
        }

        if (scene) {
          scene.traverse((object: any) => {
            if (object.geometry && object.geometry.dispose) {
              object.geometry.dispose();
            }
            if (object.material) {
              if (Array.isArray(object.material)) {
                object.material.forEach((m: any) => m.dispose && m.dispose());
              } else if (object.material.dispose) {
                object.material.dispose();
              }
            }
          });
          scene.clear();
        }

        if (renderer) {
          renderer.dispose();
          renderer.forceContextLoss?.();
          const gl = renderer.getContext?.();
          if (gl) {
            const loseContextExt = gl.getExtension?.('WEBGL_lose_context');
            if (loseContextExt) {
              loseContextExt.loseContext();
            }
          }
          if (renderer.domElement && renderer.domElement.parentElement) {
            renderer.domElement.parentElement.removeChild(renderer.domElement);
          }
        }
      } catch (e) {
        console.warn('Error during Globe WebGL teardown:', e);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-[#0D0E15]">
      <Globe
        ref={globeRef}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="#0D0E15"
        // Photorealistic satellite view of Earth
        globeImageUrl="/earth_satellite.jpg"
        showGlobe={true}
        showAtmosphere={true}
        atmosphereColor="#38bdf8"
        atmosphereAltitude={0.14}
        showGraticules={false}
        // Country borders: India includes official Survey of India boundary (with PoK & Gilgit-Baltistan)
        polygonsData={countries}
        polygonAltitude={(d: any) => (d?.properties?.name === 'India' || d?.properties?.isIndia ? 0.009 : 0.004)}
        polygonCapColor={(d: any) =>
          d?.properties?.name === 'India' || d?.properties?.isIndia
            ? 'rgba(56, 189, 248, 0.09)'
            : 'rgba(0, 0, 0, 0)'
        }
        polygonSideColor={() => 'rgba(0, 0, 0, 0)'}
        polygonStrokeColor={(d: any) =>
          d?.properties?.name === 'India' || d?.properties?.isIndia
            ? '#60a5fa'
            : 'rgba(255, 255, 255, 0.3)'
        }
        polygonsTransitionDuration={0}
      />
    </div>
  );
};

export default Globe3DView;

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { INDIA_BOUNDARY_RINGS } from './indiaBoundaryCoords';

interface Globe3DViewProps {
  onZoomComplete: () => void;
}

// Convert latitude and longitude to 3D spherical coordinates on Earth's surface
function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

// Decimate a ring of coordinates by keeping every Nth point to reduce draw calls
function decimateRing(ring: [number, number][], keepEvery: number): [number, number][] {
  if (ring.length <= 4) return ring;
  const result: [number, number][] = [];
  for (let i = 0; i < ring.length; i++) {
    if (i % keepEvery === 0 || i === ring.length - 1) {
      result.push(ring[i]);
    }
  }
  return result;
}

export const Globe3DView: React.FC<Globe3DViewProps> = ({ onZoomComplete }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const onZoomCompleteRef = useRef(onZoomComplete);
  onZoomCompleteRef.current = onZoomComplete;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let animFrameId: number;
    let isDisposed = false;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Determine pixel ratio - cap at 1.5 for performance, use 1 on low-end devices
    const dpr = Math.min(window.devicePixelRatio, 1.5);

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 2000);
    camera.up.set(0, 1, 0);

    // 2. WebGL Renderer - optimized settings
    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: dpr <= 1, // Disable AA on high-DPI screens (native pixels are small enough)
        alpha: true,
        powerPreference: 'high-performance',
        stencil: false,       // Not used — saves GPU memory
        depth: true,
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(dpr);
      // Disable tone mapping & encoding overhead for simple scene
      renderer.toneMapping = THREE.NoToneMapping;
      container.appendChild(renderer.domElement);
    } catch (e) {
      console.warn('WebGL init failed in Globe3DView:', e);
      onZoomCompleteRef.current();
      return;
    }

    // 3. Lighting — simplified: single hemisphere light replaces ambient + directional
    //    Hemisphere light gives natural top-down illumination with less shader cost
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x080820, 1.6);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(150, 100, -200);
    scene.add(dirLight);

    // 4. Background Starfield — reduced count, slightly larger points
    const starGeo = new THREE.BufferGeometry();
    const starCount = 200; // Reduced from 350
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 450 + Math.random() * 200;
      starPositions[i] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i + 2] = r * Math.cos(phi);
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 2.2,
      transparent: true,
      opacity: 0.65,
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // 5. Earth Sphere — reduced segments from 64×64 to 48×48
    const earthRadius = 100;
    const earthGeo = new THREE.SphereGeometry(earthRadius, 48, 48);
    const textureLoader = new THREE.TextureLoader();
    const earthTex = textureLoader.load('/earth_satellite.jpg');
    earthTex.colorSpace = THREE.SRGBColorSpace;

    // Use MeshPhongMaterial instead of MeshStandardMaterial — much cheaper shader
    const earthMat = new THREE.MeshPhongMaterial({
      map: earthTex,
      shininess: 15,
      specular: 0x111111,
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    scene.add(earthMesh);

    // 6. Atmospheric Glow Layer — reduced from 48×48 to 24×24
    const atmosphereGeo = new THREE.SphereGeometry(earthRadius * 1.025, 24, 24);
    const atmosphereMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.16,
      side: THREE.BackSide,
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    scene.add(atmosphereMesh);

    // 7. Official Survey of India Boundary — decimated coordinates & merged geometry
    const boundaryRadius = earthRadius * 1.004;
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x60a5fa,
      linewidth: 2,
      transparent: true,
      opacity: 0.95,
    });

    // Merge all small rings into fewer draw calls using a single Group
    const indiaLinesGroup = new THREE.Group();
    const lineGeometries: THREE.BufferGeometry[] = [];

    INDIA_BOUNDARY_RINGS.forEach((ring) => {
      // Decimate rings with many points — keep every 2nd point for large rings
      const decimated = ring.length > 20 ? decimateRing(ring, 2) : ring;
      const points: THREE.Vector3[] = [];
      decimated.forEach(([lng, lat]) => {
        points.push(latLngToVector3(lat, lng, boundaryRadius));
      });
      if (points.length > 1) {
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        lineGeometries.push(lineGeo);
        const line = new THREE.Line(lineGeo, lineMat);
        indiaLinesGroup.add(line);
      }
    });
    earthMesh.add(indiaLinesGroup);

    // 8. India Targeting Radar Reticle — reduced ring segments from 32 to 16
    const centerTargetVec = latLngToVector3(22.8, 79.5, earthRadius * 1.008);
    const reticleGroup = new THREE.Group();
    reticleGroup.position.copy(centerTargetVec);
    reticleGroup.lookAt(centerTargetVec.clone().multiplyScalar(2));

    const ringGeo = new THREE.RingGeometry(2.5, 3.4, 16);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    const reticleRing = new THREE.Mesh(ringGeo, ringMat);
    reticleGroup.add(reticleRing);
    earthMesh.add(reticleGroup);

    // 9. Camera trajectory — pre-computed start/end directions
    const startDir = latLngToVector3(5, 52, 1).normalize();
    const endDir = latLngToVector3(22.8, 79.5, 1).normalize();

    const startCamDist = 290;
    const endCamDist = 142;

    const startTime = performance.now();
    const duration = 2800; // 2.8s cinematic zoom

    // PRE-ALLOCATE reusable vectors to avoid GC pressure during animation
    const _currentDir = new THREE.Vector3();
    const _camPos = new THREE.Vector3();
    const _lookTarget = new THREE.Vector3(0, 0, 0);

    const handleResize = () => {
      if (!container || !renderer || isDisposed) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop — stops after zoom completes
    let hasCompleted = false;

    const animate = (currentTime: number) => {
      if (isDisposed) return;

      const elapsed = currentTime - startTime;
      const rawProgress = Math.min(1, Math.max(0, elapsed / duration));

      // Cubic ease-in-out for smooth camera zoom
      const t = rawProgress < 0.5
        ? 4 * rawProgress * rawProgress * rawProgress
        : 1 - Math.pow(-2 * rawProgress + 2, 3) / 2;

      // Current camera distance
      const currentDist = startCamDist + (endCamDist - startCamDist) * t;

      // Smooth spherical interpolation — reuse pre-allocated vector
      _currentDir.copy(startDir).lerp(endDir, t).normalize();
      _camPos.copy(_currentDir).multiplyScalar(currentDist);
      camera.position.copy(_camPos);
      camera.lookAt(_lookTarget);

      // Radar ring pulse
      const pulseScale = 1 + Math.sin(elapsed * 0.008) * 0.25;
      reticleRing.scale.set(pulseScale, pulseScale, 1);

      if (renderer) {
        renderer.render(scene, camera);
      }

      if (rawProgress >= 1 && !hasCompleted) {
        hasCompleted = true;
        // Render one final frame at full quality, then stop the loop
        if (renderer) {
          renderer.render(scene, camera);
        }
        onZoomCompleteRef.current();
        // DON'T schedule another frame — animation is complete
        return;
      }

      // Only continue the loop while animation is in progress
      animFrameId = requestAnimationFrame(animate);
    };

    animFrameId = requestAnimationFrame(animate);

    // Cleanup on unmount
    return () => {
      isDisposed = true;
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', handleResize);

      try {
        if (renderer) {
          renderer.dispose();
          renderer.forceContextLoss();
          if (renderer.domElement && renderer.domElement.parentElement) {
            renderer.domElement.parentElement.removeChild(renderer.domElement);
          }
        }

        // Dispose geometries and materials
        earthGeo.dispose();
        earthMat.dispose();
        earthTex.dispose();
        atmosphereGeo.dispose();
        atmosphereMat.dispose();
        starGeo.dispose();
        starMat.dispose();
        lineMat.dispose();
        ringGeo.dispose();
        ringMat.dispose();
        lineGeometries.forEach((g) => g.dispose());

        scene.clear();
      } catch (err) {
        console.warn('Globe teardown error:', err);
      }
    };
  }, []);

  return (
    <div ref={mountRef} className="w-full h-full relative overflow-hidden bg-[#0D0E15]">
      {/* Static reticle crosshair — no CSS animation to avoid GPU compositor fights */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-52 h-52 sm:w-64 sm:h-64 rounded-full border border-sky-400/20 border-dashed" />
      </div>
    </div>
  );
};

export default Globe3DView;

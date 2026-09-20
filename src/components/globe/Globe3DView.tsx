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

export const Globe3DView: React.FC<Globe3DViewProps> = ({ onZoomComplete }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const onZoomCompleteRef = useRef(onZoomComplete);
  onZoomCompleteRef.current = onZoomComplete;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let animFrameId: number;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 2000);
    camera.up.set(0, 1, 0);

    // 2. WebGL Renderer
    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);
    } catch (e) {
      console.warn('WebGL init failed in Globe3DView:', e);
      onZoomCompleteRef.current();
      return;
    }

    // 3. Lighting (Atmospheric sun illumination)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(150, 100, -200); // Angle light towards India
    scene.add(dirLight);

    // 4. Background Starfield
    const starGeo = new THREE.BufferGeometry();
    const starCount = 350;
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
      size: 1.8,
      transparent: true,
      opacity: 0.65,
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // 5. Earth Sphere
    const earthRadius = 100;
    const earthGeo = new THREE.SphereGeometry(earthRadius, 64, 64);
    const textureLoader = new THREE.TextureLoader();
    const earthTex = textureLoader.load('/earth_satellite.jpg');
    earthTex.colorSpace = THREE.SRGBColorSpace;

    const earthMat = new THREE.MeshStandardMaterial({
      map: earthTex,
      roughness: 0.7,
      metalness: 0.05,
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    scene.add(earthMesh);

    // 6. Atmospheric Glow Layer
    const atmosphereGeo = new THREE.SphereGeometry(earthRadius * 1.025, 48, 48);
    const atmosphereMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.16,
      side: THREE.BackSide,
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    scene.add(atmosphereMesh);

    // 7. Official Survey of India Boundary (3D Vector Lines including PoK & Ladakh)
    const indiaLinesGroup = new THREE.Group();
    const boundaryRadius = earthRadius * 1.004;
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x60a5fa,
      linewidth: 2,
      transparent: true,
      opacity: 0.95,
    });

    INDIA_BOUNDARY_RINGS.forEach((ring) => {
      const points: THREE.Vector3[] = [];
      ring.forEach(([lng, lat]) => {
        points.push(latLngToVector3(lat, lng, boundaryRadius));
      });
      if (points.length > 1) {
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(lineGeo, lineMat);
        indiaLinesGroup.add(line);
      }
    });
    earthMesh.add(indiaLinesGroup);

    // 8. India Targeting Radar Reticle (centered at 22.8° N, 79.5° E)
    const centerTargetVec = latLngToVector3(22.8, 79.5, earthRadius * 1.008);
    const reticleGroup = new THREE.Group();
    reticleGroup.position.copy(centerTargetVec);
    reticleGroup.lookAt(centerTargetVec.clone().multiplyScalar(2));

    const ringGeo = new THREE.RingGeometry(2.5, 3.4, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    const reticleRing = new THREE.Mesh(ringGeo, ringMat);
    reticleGroup.add(reticleRing);

    earthMesh.add(reticleGroup);

    // 9. Camera Orbit and Zoom Trajectory directly into India
    // Start camera direction: orbital perspective over Indian Ocean / Horn of Africa
    const startDir = latLngToVector3(5, 52, 1).normalize();
    // End camera direction: centered precisely on India (Survey of India center)
    const endDir = latLngToVector3(22.8, 79.5, 1).normalize();

    const startCamDist = 290;
    const endCamDist = 142; // Close-up satellite orbit centered on India

    const startTime = performance.now();
    const duration = 2800; // 2.8s cinematic zoom

    const handleResize = () => {
      if (!container || !renderer) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let hasCompleted = false;

    const animate = (currentTime: number) => {
      animFrameId = requestAnimationFrame(animate);

      const elapsed = currentTime - startTime;
      const rawProgress = Math.min(1, Math.max(0, elapsed / duration));

      // Cubic ease-in-out for smooth camera zoom
      const t = rawProgress < 0.5
        ? 4 * rawProgress * rawProgress * rawProgress
        : 1 - Math.pow(-2 * rawProgress + 2, 3) / 2;

      // Current camera distance
      const currentDist = startCamDist + (endCamDist - startCamDist) * t;

      // Smooth spherical interpolation of camera direction to India
      const currentDir = new THREE.Vector3().copy(startDir).lerp(endDir, t).normalize();
      camera.position.copy(currentDir.multiplyScalar(currentDist));
      camera.lookAt(0, 0, 0);

      // Radar ring pulse
      const pulseScale = 1 + Math.sin(elapsed * 0.008) * 0.25;
      reticleRing.scale.set(pulseScale, pulseScale, 1);

      if (renderer) {
        renderer.render(scene, camera);
      }

      if (rawProgress >= 1 && !hasCompleted) {
        hasCompleted = true;
        onZoomCompleteRef.current();
      }
    };

    animFrameId = requestAnimationFrame(animate);

    // Cleanup on unmount
    return () => {
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

        scene.clear();
      } catch (err) {
        console.warn('Globe teardown error:', err);
      }
    };
  }, []);

  return (
    <div ref={mountRef} className="w-full h-full relative overflow-hidden bg-[#0D0E15]">
      {/* Center reticle crosshair guides */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-52 h-52 sm:w-64 sm:h-64 rounded-full border border-sky-400/25 border-dashed animate-spin [animation-duration:18s]" />
      </div>
    </div>
  );
};

export default Globe3DView;

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCw, ZoomIn, ZoomOut, Sparkles, Layers, Eye, Compass, MoveHorizontal } from 'lucide-react';
import { ShoeFinish } from '../../types';
import {
  LOAFER_QUARTER_IMAGE,
  LOAFER_SIDE_IMAGE,
  LOAFER_TOP_IMAGE,
  LOAFER_STUDIO_IMAGE,
} from '../../data/products';

interface ShoeViewer3DProps {
  initialFinish?: ShoeFinish;
  availableFinishes?: ShoeFinish[];
  height?: string;
  autoRotateInit?: boolean;
  showControlsBar?: boolean;
  shoeType?: 'loafer' | 'oxford';
  theme?: 'dark' | 'bright';
}

export const ShoeViewer3D: React.FC<ShoeViewer3DProps> = ({
  initialFinish,
  availableFinishes,
  height = 'h-96 md:h-[480px]',
  autoRotateInit = true,
  showControlsBar = true,
  theme = 'dark',
}) => {
  // Mode: 'photoreal-loafer' (Original Studio 360° Loafer) vs 'webgl' (Three.js 3D Model)
  const [viewerMode, setViewerMode] = useState<'photoreal-loafer' | 'webgl'>('photoreal-loafer');
  
  // Selected Finish / Color
  const [selectedColor, setSelectedColor] = useState<string>(
    initialFinish?.hex || '#8a4b28'
  );
  const [selectedFinishName, setSelectedFinishName] = useState<string>(
    initialFinish?.name || 'Antiqued Cognac'
  );

  const [autoRotate, setAutoRotate] = useState<boolean>(autoRotateInit);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isWireframe, setIsWireframe] = useState<boolean>(false);
  const [activeAngleIndex, setActiveAngleIndex] = useState<number>(0);
  const [rotationDegrees, setRotationDegrees] = useState<number>(45);

  // Dragging state for 360° Photoreal Turntable
  const turntableRef = useRef<HTMLDivElement>(null);
  const isDraggingTurntable = useRef<boolean>(false);
  const startDragX = useRef<number>(0);
  const currentRotationRef = useRef<number>(45);

  // Multi-angle high-resolution photographic dataset of the genuine Italian Horsebit Loafer
  const loaferAngles = [
    {
      name: '3/4 Atelier Perspective',
      deg: 45,
      image: LOAFER_QUARTER_IMAGE,
      callout: 'Sculpted Chisel Apron & Gold Bit',
    },
    {
      name: 'Side Profile & Stacked Heel',
      deg: 90,
      image: LOAFER_SIDE_IMAGE,
      callout: 'Hand-Stitched Norwegian Apron Seam',
    },
    {
      name: 'Top Last & Hardware Spec',
      deg: 180,
      image: LOAFER_TOP_IMAGE,
      callout: 'Glove Calfskin Unlined Lining & Snaffle',
    },
    {
      name: 'Italian Studio Marble Showcase',
      deg: 270,
      image: LOAFER_STUDIO_IMAGE,
      callout: 'Patinated Tuscan Calfskin on Nero Marquina',
    },
  ];

  // Auto-spin animation loop for Photoreal Loafer
  useEffect(() => {
    if (viewerMode !== 'photoreal-loafer' || !autoRotate) return;

    const interval = setInterval(() => {
      setRotationDegrees((prev) => {
        const next = (prev + 0.8) % 360;
        currentRotationRef.current = next;

        // Map degrees to closest angle index
        const idx = Math.floor((next / 360) * loaferAngles.length) % loaferAngles.length;
        setActiveAngleIndex(idx);
        return next;
      });
    }, 45);

    return () => clearInterval(interval);
  }, [viewerMode, autoRotate]);

  // Sync prop changes
  useEffect(() => {
    if (initialFinish) {
      setSelectedColor(initialFinish.hex);
      setSelectedFinishName(initialFinish.name);
    }
  }, [initialFinish]);

  // --- Handlers for 360° Photoreal Loafer Drag ---
  const handleTurntableMouseDown = (e: React.MouseEvent) => {
    isDraggingTurntable.current = true;
    startDragX.current = e.clientX;
    setAutoRotate(false);
  };

  const handleTurntableMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingTurntable.current) return;
    const deltaX = e.clientX - startDragX.current;
    startDragX.current = e.clientX;

    setRotationDegrees((prev) => {
      const next = (prev + deltaX * 0.75 + 360) % 360;
      currentRotationRef.current = next;
      const idx = Math.floor((next / 360) * loaferAngles.length) % loaferAngles.length;
      setActiveAngleIndex(idx);
      return next;
    });
  };

  const handleTurntableMouseUp = () => {
    isDraggingTurntable.current = false;
  };

  const handleTurntableTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      isDraggingTurntable.current = true;
      startDragX.current = e.touches[0].clientX;
      setAutoRotate(false);
    }
  };

  const handleTurntableTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingTurntable.current || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - startDragX.current;
    startDragX.current = e.touches[0].clientX;

    setRotationDegrees((prev) => {
      const next = (prev + deltaX * 0.75 + 360) % 360;
      currentRotationRef.current = next;
      const idx = Math.floor((next / 360) * loaferAngles.length) % loaferAngles.length;
      setActiveAngleIndex(idx);
      return next;
    });
  };

  const handleTurntableTouchEnd = () => {
    isDraggingTurntable.current = false;
  };

  // --- WebGL Three.js Container Mount ---
  const webglContainerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    shoeGroup: THREE.Group;
    upperMaterial: THREE.MeshStandardMaterial;
    soleMaterial: THREE.MeshStandardMaterial;
    brassMaterial: THREE.MeshStandardMaterial;
    isDragging: boolean;
    previousMousePosition: { x: number; y: number };
    targetRotationY: number;
    targetRotationX: number;
    reqId: number | null;
  } | null>(null);

  useEffect(() => {
    if (viewerMode !== 'webgl' || !webglContainerRef.current) return;
    const container = webglContainerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0c10, 0.05);

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(2.6, 1.3, 3.2);
    camera.lookAt(0, 0.15, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xfff5ea, 0.9);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.6);
    keyLight.position.set(3.5, 4.5, 3.5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const goldRim = new THREE.DirectionalLight(0xd4af37, 3.2);
    goldRim.position.set(-3.5, 2.5, -2.5);
    scene.add(goldRim);

    // Materials for Italian Loafer
    const upperMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(selectedColor),
      roughness: 0.32,
      metalness: 0.18,
      wireframe: isWireframe,
    });

    const soleMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x281910),
      roughness: 0.72,
      metalness: 0.05,
      wireframe: isWireframe,
    });

    const brassMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xd4af37),
      roughness: 0.18,
      metalness: 0.92,
      wireframe: isWireframe,
    });

    // Build the Grounded Italian Loafer
    const shoeGroup = new THREE.Group();

    // 1. Plinth (Nero Marquina Marble Pedestal)
    const plinthGeom = new THREE.CylinderGeometry(2.1, 2.15, 0.1, 64);
    const plinthMat = new THREE.MeshStandardMaterial({ color: 0x0e1117, roughness: 0.15, metalness: 0.25 });
    const plinthMesh = new THREE.Mesh(plinthGeom, plinthMat);
    plinthMesh.position.y = -0.05;
    plinthMesh.receiveShadow = true;
    scene.add(plinthMesh);

    // Plinth Gold Rim
    const rimGeom = new THREE.TorusGeometry(2.12, 0.015, 12, 64);
    rimGeom.rotateX(Math.PI / 2);
    const rimMesh = new THREE.Mesh(rimGeom, brassMaterial);
    rimMesh.position.y = 0;
    scene.add(rimMesh);

    // Direct Contact Shadow Disc
    const contactShadowGeom = new THREE.CircleGeometry(1.6, 32);
    const contactShadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.45 });
    const contactShadow = new THREE.Mesh(contactShadowGeom, contactShadowMat);
    contactShadow.rotateX(-Math.PI / 2);
    contactShadow.position.y = 0.002;
    scene.add(contactShadow);

    // 2. Anatomical Loafer Outsole
    const soleShape = new THREE.Shape();
    soleShape.moveTo(-1.25, 0);
    soleShape.bezierCurveTo(-1.28, -0.38, -0.7, -0.4, -0.28, -0.32);
    soleShape.bezierCurveTo(0.12, -0.25, 0.45, -0.46, 0.95, -0.42);
    soleShape.bezierCurveTo(1.36, -0.38, 1.45, -0.12, 1.42, 0);
    soleShape.bezierCurveTo(1.38, 0.15, 1.25, 0.42, 0.9, 0.42);
    soleShape.bezierCurveTo(0.42, 0.42, 0.12, 0.22, -0.28, 0.3);
    soleShape.bezierCurveTo(-0.7, 0.36, -1.2, 0.36, -1.25, 0);

    const soleGeom = new THREE.ExtrudeGeometry(soleShape, { depth: 0.08, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.015 });
    soleGeom.rotateX(Math.PI / 2);
    const soleMesh = new THREE.Mesh(soleGeom, soleMaterial);
    soleMesh.position.y = 0.04;
    shoeGroup.add(soleMesh);

    // Stacked Heel
    const heelShape = new THREE.Shape();
    heelShape.moveTo(-1.26, 0);
    heelShape.bezierCurveTo(-1.3, -0.35, -0.75, -0.38, -0.45, -0.32);
    heelShape.bezierCurveTo(-0.42, 0, -0.42, 0, -0.45, 0.32);
    heelShape.bezierCurveTo(-0.75, 0.38, -1.26, 0.35, -1.26, 0);
    const heelGeom = new THREE.ExtrudeGeometry(heelShape, { depth: 0.09, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01 });
    heelGeom.rotateX(Math.PI / 2);
    const heelMesh = new THREE.Mesh(heelGeom, soleMaterial);
    heelMesh.position.y = 0.02;
    shoeGroup.add(heelMesh);

    // 3. Low-Cut Slip-On Loafer Upper
    const loaferUpperGeom = new THREE.CylinderGeometry(0.32, 0.48, 1.8, 32, 16, true);
    loaferUpperGeom.rotateZ(Math.PI / 2);
    loaferUpperGeom.scale(1.15, 0.52, 0.72);

    const pos = loaferUpperGeom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      let y = pos.getY(i);
      let z = pos.getZ(i);

      // Loafer low-cut ankle opening
      if (x < 0.1 && y > 0.18) {
        y *= 0.65;
      }
      // Apron vamp contour
      if (x > 0.25) {
        const factor = (x - 0.25) / 0.95;
        y *= (1 - factor * 0.42);
        z *= (1 - factor * 0.28);
      }
      pos.setXYZ(i, x, y, z);
    }
    loaferUpperGeom.computeVertexNormals();
    const loaferUpperMesh = new THREE.Mesh(loaferUpperGeom, upperMaterial);
    loaferUpperMesh.position.set(0.05, 0.22, 0);
    loaferUpperMesh.castShadow = true;
    shoeGroup.add(loaferUpperMesh);

    // Apron Hand-Stitched U-Ridge
    const apronTorusGeom = new THREE.TorusGeometry(0.38, 0.025, 8, 24, Math.PI * 1.2);
    apronTorusGeom.rotateX(Math.PI / 2);
    apronTorusGeom.rotateZ(Math.PI * 0.4);
    const apronRidge = new THREE.Mesh(apronTorusGeom, upperMaterial);
    apronRidge.position.set(0.55, 0.28, 0);
    shoeGroup.add(apronRidge);

    // Transverse Leather Saddle Strap across instep
    const strapGeom = new THREE.BoxGeometry(0.24, 0.04, 0.58);
    const strapMesh = new THREE.Mesh(strapGeom, upperMaterial);
    strapMesh.position.set(0.12, 0.32, 0);
    shoeGroup.add(strapMesh);

    // 4. Authentic Polished Brass Horsebit Snaffle Hardware
    const bitCenterBarGeom = new THREE.CylinderGeometry(0.015, 0.015, 0.22, 12);
    bitCenterBarGeom.rotateZ(Math.PI / 2);
    const bitCenterBar = new THREE.Mesh(bitCenterBarGeom, brassMaterial);
    bitCenterBar.position.set(0.12, 0.36, 0);
    shoeGroup.add(bitCenterBar);

    // Interlocking Dual Horsebit Rings
    const ringGeom = new THREE.TorusGeometry(0.045, 0.012, 8, 16);
    ringGeom.rotateY(Math.PI / 2);

    const ringLeft = new THREE.Mesh(ringGeom, brassMaterial);
    ringLeft.position.set(0.12, 0.36, 0.12);
    shoeGroup.add(ringLeft);

    const ringRight = new THREE.Mesh(ringGeom, brassMaterial);
    ringRight.position.set(0.12, 0.36, -0.12);
    shoeGroup.add(ringRight);

    // Final shoe scale & placement
    shoeGroup.scale.set(1.15, 1.15, 1.15);
    shoeGroup.position.set(0, 0, 0);
    shoeGroup.rotation.y = Math.PI * 0.25;
    scene.add(shoeGroup);

    const state = {
      scene,
      camera,
      renderer,
      shoeGroup,
      upperMaterial,
      soleMaterial,
      brassMaterial,
      isDragging: false,
      previousMousePosition: { x: 0, y: 0 },
      targetRotationY: Math.PI * 0.25,
      targetRotationX: 0,
      reqId: null as number | null,
    };
    sceneRef.current = state;

    // WebGL Drag Handlers
    const onMouseDown = (e: MouseEvent) => {
      state.isDragging = true;
      state.previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!state.isDragging) return;
      const deltaX = e.clientX - state.previousMousePosition.x;
      const deltaY = e.clientY - state.previousMousePosition.y;
      state.targetRotationY += deltaX * 0.008;
      state.targetRotationX = Math.max(-0.25, Math.min(0.4, state.targetRotationX + deltaY * 0.005));
      state.previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      state.isDragging = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      const delta = clock.getDelta();
      if (autoRotate && !state.isDragging) {
        state.targetRotationY += delta * 0.45;
      }
      shoeGroup.rotation.y += (state.targetRotationY - shoeGroup.rotation.y) * 0.1;
      shoeGroup.rotation.x += (state.targetRotationX - shoeGroup.rotation.x) * 0.1;
      renderer.render(scene, camera);
      state.reqId = requestAnimationFrame(animate);
    };
    state.reqId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domElement.removeEventListener('mousedown', onMouseDown);
      if (state.reqId) cancelAnimationFrame(state.reqId);
      renderer.dispose();
      plinthGeom.dispose();
      plinthMat.dispose();
      upperMaterial.dispose();
      soleMaterial.dispose();
      brassMaterial.dispose();
      container.innerHTML = '';
    };
  }, [viewerMode]);

  // Update Three.js color dynamically
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.upperMaterial.color.set(selectedColor);
      sceneRef.current.upperMaterial.needsUpdate = true;
    }
  }, [selectedColor]);

  // Update Wireframe mode
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.upperMaterial.wireframe = isWireframe;
      sceneRef.current.soleMaterial.wireframe = isWireframe;
    }
  }, [isWireframe]);

  const selectLoaferAngle = (idx: number) => {
    setActiveAngleIndex(idx);
    setRotationDegrees(loaferAngles[idx].deg);
    currentRotationRef.current = loaferAngles[idx].deg;
    setAutoRotate(false);
  };

  return (
    <div className={`relative w-full ${height} rounded-2xl overflow-hidden bg-obsidian-radial border border-gold-subtle/50 select-none shadow-2xl flex flex-col justify-between`}>
      
      {/* Top Floating Badge & Mode Switcher */}
      <div className="absolute top-3.5 inset-x-3.5 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <span className="text-[11px] uppercase tracking-widest text-[#d4af37] font-semibold bg-black/75 backdrop-blur-md px-3 py-1 rounded-lg border border-[#d4af37]/40 flex items-center gap-1.5 shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>The Milano Horsebit Loafer</span>
          </span>

          <span className="hidden sm:flex items-center gap-1 text-[10px] text-zinc-400 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 font-mono">
            <MoveHorizontal className="w-3 h-3 text-[#d4af37]" />
            <span>Drag 360° · {Math.round(rotationDegrees)}°</span>
          </span>
        </div>

        {/* Dual Mode Switcher: 360° Photoreal Original vs 3D WebGL Model */}
        <div className="flex items-center gap-1 bg-black/80 backdrop-blur-md p-1 rounded-xl border border-gold-subtle pointer-events-auto shadow-xl">
          <button
            onClick={() => setViewerMode('photoreal-loafer')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
              viewerMode === 'photoreal-loafer'
                ? 'bg-[#d4af37] text-black shadow-md'
                : 'text-zinc-300 hover:text-white'
            }`}
            title="Original Luxury Loafer in 360° Studio Photography"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>360° Original Loafer</span>
          </button>

          <button
            onClick={() => setViewerMode('webgl')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
              viewerMode === 'webgl'
                ? 'bg-[#d4af37] text-black shadow-md'
                : 'text-zinc-300 hover:text-white'
            }`}
            title="Interactive 3D WebGL Shader Model"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>3D WebGL Model</span>
          </button>
        </div>
      </div>

      {/* Main Visual Display Area */}
      <div className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden">
        {viewerMode === 'photoreal-loafer' ? (
          /* Mode 1: Original Italian Loafer 360° Interactive Turntable */
          <div
            ref={turntableRef}
            onMouseDown={handleTurntableMouseDown}
            onMouseMove={handleTurntableMouseMove}
            onMouseUp={handleTurntableMouseUp}
            onMouseLeave={handleTurntableMouseUp}
            onTouchStart={handleTurntableTouchStart}
            onTouchMove={handleTurntableTouchMove}
            onTouchEnd={handleTurntableTouchEnd}
            className="w-full h-full relative flex items-center justify-center cursor-grab active:cursor-grabbing bg-radial from-[#151923] via-[#0d1017] to-[#07080b] turntable-photoreal-bg"
          >
            {/* The Original Genuine Loafer Photography Layer */}
            <div
              className="relative w-full h-full flex items-center justify-center p-4 sm:p-8 transition-transform duration-100 ease-out"
              style={{
                transform: `scale(${zoomLevel})`,
              }}
            >
              <img
                src={loaferAngles[activeAngleIndex].image}
                alt={`Original Italian Horsebit Loafer - ${loaferAngles[activeAngleIndex].name}`}
                referrerPolicy="no-referrer"
                className="max-h-full max-w-full object-contain filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.85)] pointer-events-none"
              />

              {/* Dynamic Patina Hue Modulation Filter if non-cognac is selected */}
              {selectedColor !== '#8a4b28' && (
                <div
                  className="absolute inset-0 mix-blend-color opacity-60 pointer-events-none"
                  style={{ backgroundColor: selectedColor }}
                />
              )}
            </div>

            {/* Direct Grounding Shadow Plinth Effect */}
            <div className="absolute bottom-6 w-3/4 h-8 bg-black/75 rounded-full blur-xl pointer-events-none" />

            {/* Angle Callout Overlay */}
            <div className="absolute bottom-16 left-4 z-10 pointer-events-none bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
              <span className="text-[10px] uppercase tracking-widest text-[#d4af37] font-semibold block">
                {loaferAngles[activeAngleIndex].name}
              </span>
              <span className="text-xs text-zinc-300 font-light">
                {loaferAngles[activeAngleIndex].callout}
              </span>
            </div>
          </div>
        ) : (
          /* Mode 2: Real-time 3D WebGL Loafer Model */
          <div ref={webglContainerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
        )}
      </div>

      {/* Angle Presets Quick Pill Switcher for Loafer */}
      {viewerMode === 'photoreal-loafer' && (
        <div className="absolute top-16 right-3.5 z-20 flex flex-col gap-1 bg-black/70 backdrop-blur-md p-1.5 rounded-xl border border-white/10 shadow-lg">
          {loaferAngles.map((angle, idx) => (
            <button
              key={angle.name}
              onClick={() => selectLoaferAngle(idx)}
              className={`px-2.5 py-1 text-[11px] rounded text-left transition-colors whitespace-nowrap ${
                activeAngleIndex === idx
                  ? 'bg-[#d4af37] text-black font-semibold'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {angle.name.split('&')[0]}
            </button>
          ))}
        </div>
      )}

      {/* Bottom Floating Control Bar */}
      {showControlsBar && (
        <div className="relative z-20 m-3 p-2.5 rounded-xl bg-black/80 backdrop-blur-md border border-gold-subtle/50 flex flex-wrap items-center justify-between gap-3 shadow-xl">
          {/* Finish & Leather Color Swatches */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider text-zinc-400 hidden sm:inline">
              Loafer Finish:
            </span>
            <div className="flex items-center gap-1.5">
              {(availableFinishes || [
                { name: 'Antiqued Cognac', hex: '#8a4b28', colorName: 'Cognac' },
                { name: 'Nero Gloss', hex: '#111317', colorName: 'Black' },
                { name: 'Bordeaux Riserva', hex: '#4e1423', colorName: 'Burgundy' },
                { name: 'Espresso Roast', hex: '#3d251e', colorName: 'Dark Brown' },
              ]).map((finish) => (
                <button
                  key={finish.name}
                  onClick={() => {
                    setSelectedColor(finish.hex);
                    setSelectedFinishName(finish.name);
                  }}
                  title={finish.name}
                  className={`w-6 h-6 rounded-full border transition-all transform hover:scale-110 flex items-center justify-center ${
                    selectedColor === finish.hex
                      ? 'border-[#d4af37] scale-110 ring-2 ring-[#d4af37]/50'
                      : 'border-white/20'
                  }`}
                  style={{ backgroundColor: finish.hex }}
                >
                  {selectedColor === finish.hex && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white/90" />
                  )}
                </button>
              ))}
            </div>
            <span className="text-xs text-[#f5ebd7] font-medium hidden md:inline ml-1">
              {selectedFinishName}
            </span>
          </div>

          {/* Action Utilities (Auto-Rotate, Wireframe, Zoom) */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors border ${
                autoRotate
                  ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#d4af37]'
                  : 'bg-white/5 border-white/10 text-zinc-300 hover:text-white'
              }`}
              title="Toggle Auto 360° Turntable Orbit"
            >
              <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
              <span className="text-[11px] font-medium hidden sm:inline">360° Orbit</span>
            </button>

            {viewerMode === 'webgl' && (
              <button
                onClick={() => setIsWireframe(!isWireframe)}
                className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors border ${
                  isWireframe
                    ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#d4af37]'
                    : 'bg-white/5 border-white/10 text-zinc-300 hover:text-white'
                }`}
                title="Toggle Wireframe Anatomy"
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="text-[11px] hidden sm:inline">Anatomy</span>
              </button>
            )}

            <div className="h-4 w-px bg-white/15 mx-1" />

            <button
              onClick={() => setZoomLevel((prev) => Math.min(1.4, prev + 0.15))}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-zinc-300 hover:text-white transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setZoomLevel((prev) => Math.max(0.85, prev - 0.15))}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-zinc-300 hover:text-white transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            {zoomLevel !== 1 && (
              <button
                onClick={() => setZoomLevel(1)}
                className="px-2 py-1 rounded text-[10px] text-zinc-400 hover:text-white"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

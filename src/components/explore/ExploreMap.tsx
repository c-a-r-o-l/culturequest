import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { Venue, VenueType } from '../../types';
import {
  Compass,
  MapPin,
  Clock,
  Sparkles,
  Zap,
  CheckCircle2,
  Navigation,
  Crosshair,
  Filter,
  Flame,
  Plus,
  Minus,
} from 'lucide-react';
import { triggerHaptic, sound } from '../../utils/audioAndFx';

// Map Coordinate System for Cambridge
const MAP_BOUNDS = {
  minLat: 52.1900,
  maxLat: 52.2150,
  minLng: 0.1000,
  maxLng: 0.1360,
  width: 2200,
  height: 2600,
};

function projectCoords(lat: number, lng: number) {
  const x = ((lng - MAP_BOUNDS.minLng) / (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng)) * MAP_BOUNDS.width;
  const y = ((MAP_BOUNDS.maxLat - lat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) * MAP_BOUNDS.height;
  return { x, y };
}

export const ExploreMap: React.FC = () => {
  const {
    venues,
    visitedVenueIds,
    userLocation,
    isSimulatingLocation,
    setSelectedVenue,
    setActivePlayingQuest,
    quests,
    teleportToVenue,
    resetUserLocation,
    getDistanceToVenueMeters,
  } = useApp();

  const containerRef = useRef<HTMLDivElement>(null);

  // Pan & Zoom state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: -600, y: -800 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const [activeFilter, setActiveFilter] = useState<'All' | VenueType>('All');
  const [showSimNotice, setShowSimNotice] = useState(false);

  // Filtered venues
  const filteredVenues = venues.filter((v) => {
    if (activeFilter === 'All') return true;
    return v.type === activeFilter;
  });

  // Calculate user position in map space
  const userPos = projectCoords(userLocation.lat, userLocation.lng);

  // Center pan on given map coordinate
  const centerOnPoint = useCallback((mapX: number, mapY: number, targetZoom = zoom) => {
    if (!containerRef.current) return;
    const viewWidth = containerRef.current.clientWidth;
    const viewHeight = containerRef.current.clientHeight;

    const newX = viewWidth / 2 - mapX * targetZoom;
    const newY = viewHeight / 2 - mapY * targetZoom;
    setPan({ x: newX, y: newY });
  }, [zoom]);

  // Initial center on user
  useEffect(() => {
    centerOnPoint(userPos.x, userPos.y, 1.15);
    setZoom(1.15);
  }, []);

  // Recenter when teleporting
  const handleRecenter = () => {
    triggerHaptic('light');
    centerOnPoint(userPos.x, userPos.y);
  };

  // Zoom handlers
  const handleZoomIn = () => {
    triggerHaptic('light');
    setZoom((prev) => Math.min(2.0, prev + 0.25));
  };

  const handleZoomOut = () => {
    triggerHaptic('light');
    setZoom((prev) => Math.max(0.65, prev - 0.25));
  };

  // Dragging handlers (Mouse & Touch)
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPan({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Quick 15-min dose
  const handleQuickDose = () => {
    triggerHaptic('medium');
    sound.playCoin();
    const dailyQuest = quests.find((q) => q.isDaily) || quests[0];
    if (dailyQuest) {
      const venue = venues.find((v) => v.id === dailyQuest.venueId);
      if (venue) {
        setSelectedVenue(venue);
        setActivePlayingQuest(dailyQuest);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative w-full h-[calc(100vh-60px)] overflow-hidden bg-[#0a0e17] cursor-grab active:cursor-grabbing select-none"
    >
      {/* ================= SVG VECTOR FAKE MAP ================= */}
      <div
        className="absolute top-0 left-0 transition-transform duration-75 will-change-transform origin-top-left"
        style={{
          transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
          width: MAP_BOUNDS.width,
          height: MAP_BOUNDS.height,
        }}
      >
        <svg
          width={MAP_BOUNDS.width}
          height={MAP_BOUNDS.height}
          viewBox={`0 0 ${MAP_BOUNDS.width} ${MAP_BOUNDS.height}`}
          className="w-full h-full pointer-events-none"
        >
          <defs>
            {/* Dark city background gradient */}
            <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#080c16" />
              <stop offset="50%" stopColor="#0d1322" />
              <stop offset="100%" stopColor="#090e1a" />
            </linearGradient>

            {/* River Cam water gradient */}
            <linearGradient id="riverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#0284c7" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#0369a1" stopOpacity="0.85" />
            </linearGradient>

            {/* Glowing river filter */}
            <filter id="riverGlow" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Grid pattern for high-tech game look */}
            <pattern id="cityGrid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#1e293b" strokeWidth="0.8" strokeOpacity="0.4" />
              <circle cx="0" cy="0" r="1.5" fill="#38bdf8" fillOpacity="0.2" />
            </pattern>

            {/* Parks grass pattern */}
            <pattern id="parkGrass" width="20" height="20" patternUnits="userSpaceOnUse">
              <rect width="20" height="20" fill="#064e3b" fillOpacity="0.4" />
              <circle cx="10" cy="10" r="1" fill="#10b981" fillOpacity="0.3" />
            </pattern>
          </defs>

          {/* 1. Base Terrain & Tech Grid */}
          <rect width={MAP_BOUNDS.width} height={MAP_BOUNDS.height} fill="url(#bgGrad)" />
          <rect width={MAP_BOUNDS.width} height={MAP_BOUNDS.height} fill="url(#cityGrid)" />

          {/* 2. Historic Cambridge Green Areas (Parks, Meadows & Botanic Gardens) */}
          <g id="greens-and-parks">
            {/* The Backs (West side along River Cam) */}
            <path
              d="M 600,680 Q 750,900 780,1200 L 950,1180 Q 920,850 780,650 Z"
              fill="url(#parkGrass)"
              stroke="#059669"
              strokeWidth="2"
              strokeOpacity="0.5"
            />
            <text x="700" y="920" fill="#34d399" fontSize="18" fontWeight="bold" opacity="0.6" letterSpacing="3">
              THE BACKS
            </text>

            {/* Coe Fen & Sheep's Green (South) */}
            <path
              d="M 820,1500 Q 980,1650 960,1900 L 1120,1880 Q 1150,1600 1020,1450 Z"
              fill="url(#parkGrass)"
              stroke="#059669"
              strokeWidth="1.5"
              strokeOpacity="0.4"
            />
            <text x="910" y="1720" fill="#34d399" fontSize="15" fontWeight="bold" opacity="0.5" letterSpacing="2">
              COE FEN
            </text>

            {/* Jesus Green (North East) */}
            <rect
              x="1200"
              y="280"
              width="450"
              height="220"
              rx="30"
              fill="url(#parkGrass)"
              stroke="#059669"
              strokeWidth="2"
              strokeOpacity="0.5"
            />
            <text x="1350" y="390" fill="#34d399" fontSize="18" fontWeight="bold" opacity="0.6" letterSpacing="3">
              JESUS GREEN
            </text>

            {/* Parker's Piece (South-East historic green) */}
            <rect
              x="1480"
              y="1100"
              width="380"
              height="360"
              rx="24"
              fill="url(#parkGrass)"
              stroke="#059669"
              strokeWidth="2"
              strokeOpacity="0.5"
            />
            <text x="1560" y="1280" fill="#34d399" fontSize="18" fontWeight="bold" opacity="0.6" letterSpacing="2">
              PARKER'S PIECE
            </text>
            <text x="1575" y="1310" fill="#94a3b8" fontSize="12" opacity="0.5">
              Birthplace of Modern Rules (1863)
            </text>

            {/* Cambridge Botanic Garden Grounds (South) */}
            <rect
              x="1400"
              y="1900"
              width="420"
              height="360"
              rx="28"
              fill="#064e3b"
              fillOpacity="0.65"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeDasharray="6,4"
            />
            <text x="1460" y="2090" fill="#6ee7b7" fontSize="17" fontWeight="black" letterSpacing="1">
              🌿 BOTANIC GARDEN
            </text>
            <text x="1490" y="2120" fill="#a7f3d0" fontSize="12" opacity="0.8">
              40 Acres • 8,000 Species
            </text>
          </g>

          {/* 3. The River Cam (Flowing gracefully from South to North-East) */}
          <g id="river-cam">
            {/* Outer Water Glow */}
            <path
              d="M 920,2300 C 900,1950 860,1750 960,1520 C 1020,1380 940,1260 880,1050 C 830,880 840,650 930,480 C 1020,320 1200,240 1600,180"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="48"
              strokeLinecap="round"
              opacity="0.25"
              filter="url(#riverGlow)"
            />
            {/* Main Stream */}
            <path
              d="M 920,2300 C 900,1950 860,1750 960,1520 C 1020,1380 940,1260 880,1050 C 830,880 840,650 930,480 C 1020,320 1200,240 1600,180"
              fill="none"
              stroke="url(#riverGrad)"
              strokeWidth="28"
              strokeLinecap="round"
            />
            {/* Center Flow Wave */}
            <path
              d="M 920,2300 C 900,1950 860,1750 960,1520 C 1020,1380 940,1260 880,1050 C 830,880 840,650 930,480 C 1020,320 1200,240 1600,180"
              fill="none"
              stroke="#bae6fd"
              strokeWidth="4"
              strokeDasharray="16, 24"
              strokeLinecap="round"
              opacity="0.8"
            />
            {/* River Text */}
            <text x="890" y="850" fill="#7dd3fc" fontSize="16" fontWeight="bold" opacity="0.75" letterSpacing="4">
              R I V E R   C A M
            </text>
          </g>

          {/* 4. Historic Bridges across River Cam */}
          <g id="historic-bridges">
            {/* King's Bridge */}
            <line x1="860" y1="1020" x2="905" y2="1020" stroke="#fde047" strokeWidth="6" strokeLinecap="round" />
            <text x="780" y="1015" fill="#fde047" fontSize="11" opacity="0.7">King's Bridge</text>

            {/* Mathematical Bridge (Queens') */}
            <line x1="910" y1="1260" x2="955" y2="1260" stroke="#fde047" strokeWidth="6" strokeLinecap="round" />
            <text x="965" y="1265" fill="#fde047" fontSize="11" opacity="0.7">Mathematical Bridge</text>

            {/* Bridge of Sighs (St John's) */}
            <line x1="880" y1="620" x2="925" y2="620" stroke="#fde047" strokeWidth="6" strokeLinecap="round" />
            <text x="770" y="615" fill="#fde047" fontSize="11" opacity="0.7">Bridge of Sighs</text>
          </g>

          {/* 5. Cambridge Street Network */}
          <g id="street-grid">
            {/* King's Parade / Trinity Street (Central spine) */}
            <path
              d="M 1120,1850 L 1100,1350 L 1040,920 L 980,560 L 920,400"
              fill="none"
              stroke="#475569"
              strokeWidth="16"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 1120,1850 L 1100,1350 L 1040,920 L 980,560 L 920,400"
              fill="none"
              stroke="#64748b"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Castle Street (North Hill) */}
            <path
              d="M 920,400 L 820,240"
              fill="none"
              stroke="#64748b"
              strokeWidth="10"
              strokeLinecap="round"
            />
            <text x="760" y="310" fill="#94a3b8" fontSize="12" fontWeight="bold">Castle Street</text>

            {/* Silver Street / Sidgwick Avenue (Crossing West to Library) */}
            <path
              d="M 450,1180 L 940,1260 L 1100,1280"
              fill="none"
              stroke="#475569"
              strokeWidth="12"
              strokeLinecap="round"
            />
            <text x="470" y="1165" fill="#94a3b8" fontSize="12" fontWeight="bold">Sidgwick Ave (To Library)</text>

            {/* Downing Street / Pembroke Street (Science Museums axis) */}
            <path
              d="M 1080,1130 L 1480,1130"
              fill="none"
              stroke="#475569"
              strokeWidth="12"
              strokeLinecap="round"
            />
            <text x="1220" y="1120" fill="#94a3b8" fontSize="12" fontWeight="bold">Downing St</text>

            {/* Trumpington Road (South towards Fitzwilliam & Botanic) */}
            <path
              d="M 1100,1350 L 1110,1650 L 1400,2100"
              fill="none"
              stroke="#475569"
              strokeWidth="14"
              strokeLinecap="round"
            />
            <text x="1125" y="1520" fill="#94a3b8" fontSize="12" fontWeight="bold">Trumpington St</text>

            {/* Regent Street & Hills Road (East Axis) */}
            <path
              d="M 1480,1130 L 1480,1850 L 1650,2300"
              fill="none"
              stroke="#475569"
              strokeWidth="14"
              strokeLinecap="round"
            />
            <text x="1500" y="1560" fill="#94a3b8" fontSize="12" fontWeight="bold">Regent St / Hills Rd</text>
          </g>

          {/* 6. College Courts & Landmarks Footprints */}
          <g id="college-landmarks">
            {/* King's College Court & Chapel Footprint */}
            <rect x="960" y="980" width="85" height="110" rx="6" fill="#1e1b4b" stroke="#818cf8" strokeWidth="2" opacity="0.8" />
            <text x="965" y="1035" fill="#c7d2fe" fontSize="11" fontWeight="bold">King's</text>

            {/* Trinity College Great Court */}
            <rect x="940" y="740" width="100" height="120" rx="8" fill="#1e1b4b" stroke="#818cf8" strokeWidth="2" opacity="0.8" />
            <text x="955" y="805" fill="#c7d2fe" fontSize="11" fontWeight="bold">Trinity</text>

            {/* St John's College */}
            <rect x="920" y="560" width="90" height="95" rx="8" fill="#1e1b4b" stroke="#818cf8" strokeWidth="2" opacity="0.8" />
            <text x="935" y="615" fill="#c7d2fe" fontSize="11" fontWeight="bold">St John's</text>

            {/* University Library Tower */}
            <rect x="420" y="910" width="80" height="85" rx="10" fill="#312e81" stroke="#a78bfa" strokeWidth="2" opacity="0.9" />
            <text x="430" y="955" fill="#ede9fe" fontSize="10" fontWeight="bold">UL Tower</text>

            {/* Market Square */}
            <rect x="1110" y="960" width="55" height="55" rx="6" fill="#f59e0b" fillOpacity="0.25" stroke="#f59e0b" strokeWidth="1.5" />
            <text x="1115" y="990" fill="#fde047" fontSize="9" fontWeight="bold">Market</text>
          </g>
        </svg>

        {/* 7. User Avatar & Radar Pulse in Map Space */}
        <div
          className="absolute z-30 pointer-events-none -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
          style={{
            left: userPos.x,
            top: userPos.y,
          }}
        >
          {/* Radar Waves (representing 75m detection) */}
          <div className="absolute w-44 h-44 rounded-full bg-indigo-500/20 border border-indigo-400/40 animate-radar" />
          <div className="absolute w-28 h-28 rounded-full bg-amber-400/15 border border-amber-400/30" />

          {/* User Avatar Pin */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-700 via-indigo-600 to-amber-400 border-2 border-white shadow-[0_6px_20px_rgba(0,0,0,0.7)] flex items-center justify-center text-2xl">
            🧭
          </div>
        </div>

        {/* 8. Interactive Venue Markers in Map Space */}
        {filteredVenues.map((venue) => {
          const pos = projectCoords(venue.lat, venue.lng);
          const isVisited = visitedVenueIds.includes(venue.id);
          const distance = getDistanceToVenueMeters(venue);
          const isWithinRange = distance <= venue.radiusMeters;
          const hasEvent = !!venue.featuredEvent;

          return (
            <div
              key={venue.id}
              onClick={(e) => {
                e.stopPropagation();
                triggerHaptic('medium');
                sound.playCoin();
                setSelectedVenue(venue);
              }}
              style={{
                left: pos.x,
                top: pos.y,
              }}
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer group flex flex-col items-center pointer-events-auto active:scale-95 transition-transform"
            >
              {/* Event halo */}
              {hasEvent && (
                <div className="absolute -inset-3 rounded-full bg-rose-500/40 animate-ping pointer-events-none" />
              )}

              {/* Pin Icon Bubble */}
              <div
                className={`relative w-12 h-12 rounded-2xl border-2 flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.6)] transition-all ${
                  isVisited
                    ? 'bg-emerald-500 border-white text-white text-base font-black shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                    : isWithinRange
                    ? 'bg-gradient-to-tr from-amber-400 to-amber-500 border-white text-slate-950 text-xl scale-110 shadow-[0_0_20px_rgba(245,158,11,0.8)]'
                    : hasEvent
                    ? 'bg-gradient-to-tr from-rose-500 to-amber-400 border-white text-white text-base shadow-[0_0_15px_rgba(244,63,94,0.6)]'
                    : 'bg-indigo-950/95 border-amber-400/80 text-amber-300 text-base'
                }`}
              >
                {isVisited ? '✓' : hasEvent ? '⚡' : '🏛️'}

                {/* Pulse badge on in-range */}
                {isWithinRange && !isVisited && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border border-slate-950 animate-bounce" />
                )}
              </div>

              {/* Venue Name Label */}
              <div className="mt-1 px-2 py-0.5 rounded-lg bg-slate-950/90 border border-slate-700/80 text-[11px] font-black text-slate-100 shadow-md whitespace-nowrap max-w-[120px] truncate group-hover:scale-105 transition">
                {venue.name.replace('Cambridge University', 'CU').replace('Museum', 'Mus.')}
              </div>

              {/* Distance pill */}
              <div className="text-[10px] font-bold text-amber-300 bg-slate-900/90 px-1.5 rounded-full mt-0.5 border border-slate-800">
                {distance}m
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= MAP CONTROLS & HUD OVERLAYS ================= */}

      {/* Top Filter Chips */}
      <div className="absolute top-3 left-0 right-0 z-40 px-3 flex gap-1.5 overflow-x-auto no-scrollbar pointer-events-auto">
        {(['All', 'Museum', 'Gallery', 'Heritage', 'Garden', 'Library'] as const).map((cat) => {
          const isSelected = activeFilter === cat;
          return (
            <button
              key={cat}
              onClick={() => {
                triggerHaptic('light');
                setActiveFilter(cat);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-md backdrop-blur-md ${
                isSelected
                  ? 'bg-amber-400 text-slate-950 shadow-[0_2px_8px_rgba(245,158,11,0.4)]'
                  : 'bg-slate-950/80 text-slate-300 border border-slate-800 hover:bg-slate-900'
              }`}
            >
              {cat === 'All' ? '🌍 All Venues' : cat}
            </button>
          );
        })}
      </div>

      {/* Floating Controls on Right Side (Zoom + Recenter + GPS Sim) */}
      <div className="absolute right-3 bottom-52 z-40 flex flex-col gap-2">
        {/* Zoom In */}
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="w-10 h-10 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-slate-200 flex items-center justify-center shadow-lg active:scale-95 transition"
        >
          <Plus className="w-4 h-4" />
        </button>

        {/* Zoom Out */}
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="w-10 h-10 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-slate-200 flex items-center justify-center shadow-lg active:scale-95 transition"
        >
          <Minus className="w-4 h-4" />
        </button>

        {/* Recenter */}
        <button
          onClick={handleRecenter}
          title="Recenter on my explorer"
          className="w-10 h-10 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-amber-400 flex items-center justify-center shadow-lg active:scale-95 transition"
        >
          <Crosshair className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* GPS Simulation / Teleport Toggle */}
        <button
          onClick={() => setShowSimNotice((prev) => !prev)}
          title="Simulate GPS presence at venues"
          className={`w-10 h-10 rounded-2xl border flex items-center justify-center shadow-lg active:scale-95 transition ${
            isSimulatingLocation
              ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
              : 'bg-slate-900/90 border-slate-700/80 text-slate-300'
          }`}
        >
          <Navigation className="w-4 h-4" />
        </button>
      </div>

      {/* 15-Minute Culture Dose Floating Pill */}
      <div className="absolute left-3 bottom-52 z-40">
        <button
          onClick={handleQuickDose}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 via-amber-500 to-amber-400 text-slate-950 font-black text-xs shadow-[0_4px_12px_rgba(244,63,94,0.4)] active:translate-y-0.5 transition"
        >
          <Zap className="w-4 h-4 fill-slate-950" />
          <span>15-Min Culture Dose</span>
        </button>
      </div>

      {/* Zero-API Indicator Banner (Subtle Top Badge) */}
      <div className="absolute top-12 left-3 z-30 pointer-events-none">
        <span className="px-2 py-0.5 rounded-full bg-slate-950/80 border border-slate-800 text-[10px] text-slate-400 font-semibold backdrop-blur-md">
          Offline Cambridge World Map
        </span>
      </div>

      {/* GPS Simulation Drawer / Debugger */}
      {showSimNotice && (
        <div className="absolute top-14 left-3 right-3 z-50 p-3 bg-slate-900/95 border border-amber-400/50 rounded-2xl shadow-2xl backdrop-blur-md text-xs text-slate-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="font-bold text-amber-400 flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5" /> GPS Presence Simulator
            </span>
            <button
              onClick={() => setShowSimNotice(false)}
              className="text-slate-400 hover:text-white font-bold text-xs"
            >
              ✕
            </button>
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5">
            Test the 75m geofence check by teleporting your avatar to any venue entrance:
          </p>
          <div className="grid grid-cols-2 gap-1.5 mt-2.5 max-h-36 overflow-y-auto">
            {venues.map((v) => (
              <button
                key={v.id}
                onClick={() => {
                  teleportToVenue(v.id);
                  setShowSimNotice(false);
                }}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-950 border border-slate-700 text-[10px] font-bold text-left truncate text-slate-200"
              >
                📍 {v.name}
              </button>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800 flex justify-end">
            <button
              onClick={resetUserLocation}
              className="text-[10px] text-amber-400 hover:underline font-semibold"
            >
              Reset to Cambridge Market Center
            </button>
          </div>
        </div>
      )}

      {/* Bottom Sheet "Nearby Now" Tray */}
      <div className="absolute bottom-14 left-0 right-0 z-40 px-3 pb-2 pointer-events-auto">
        <div className="flex items-center justify-between mb-1.5 px-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-amber-400" /> Nearby Now ({filteredVenues.length})
          </span>
          <span className="text-[10px] text-amber-400/90 font-medium">Tap venue to inspect</span>
        </div>

        <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
          {filteredVenues.map((venue) => {
            const distance = getDistanceToVenueMeters(venue);
            const isWithinRange = distance <= venue.radiusMeters;
            const isVisited = visitedVenueIds.includes(venue.id);
            const walkMin = Math.max(1, Math.round(distance / 80));

            return (
              <button
                key={venue.id}
                onClick={() => {
                  triggerHaptic('light');
                  setSelectedVenue(venue);
                }}
                className={`flex-shrink-0 w-64 p-3 rounded-2xl border text-left transition-all backdrop-blur-md ${
                  isWithinRange
                    ? 'bg-indigo-950/90 border-amber-400/90 shadow-[0_4px_16px_rgba(245,158,11,0.25)]'
                    : 'bg-slate-950/85 border-slate-800 hover:border-slate-700 shadow-md'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-slate-700 relative">
                    <img src={venue.image} alt={venue.name} className="w-full h-full object-cover" />
                    {isVisited && (
                      <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-500 text-[10px] text-white flex items-center justify-center font-bold shadow">
                        ✓
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-amber-300">
                        {venue.type}
                      </span>
                      <span
                        className={`text-[10px] font-bold ${
                          isWithinRange ? 'text-emerald-400 font-extrabold' : 'text-slate-400'
                        }`}
                      >
                        {distance}m • {walkMin}m walk
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white truncate mt-1">{venue.name}</h4>

                    <div className="flex items-center gap-2 mt-1.5 text-[10px]">
                      <span className="text-amber-400 font-bold flex items-center gap-0.5">
                        <Sparkles className="w-3 h-3" /> +50 pts
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className={venue.isFree ? 'text-emerald-400 font-medium' : 'text-slate-400'}>
                        {venue.isFree ? 'Free entry' : venue.entryFee}
                      </span>
                    </div>
                  </div>
                </div>

                {venue.featuredEvent && (
                  <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                    <span className="text-rose-400 font-bold flex items-center gap-1">
                      <Flame className="w-3 h-3" /> {venue.featuredEvent.title}
                    </span>
                    <span className="text-slate-400">{venue.featuredEvent.endsIn}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

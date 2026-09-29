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
  BookOpen,
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

  const handleRecenter = () => {
    triggerHaptic('light');
    centerOnPoint(userPos.x, userPos.y);
  };

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
      className="relative w-full h-[calc(100vh-60px)] overflow-hidden bg-[#121A15] cursor-grab active:cursor-grabbing select-none"
    >
      {/* ================= CANTABRIGIA ANTIQUARIAN PARCHMENT MAP ================= */}
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
            {/* Dark Academia Nocturnal Cartography Background */}
            <linearGradient id="darkCartoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#080F0B" />
              <stop offset="50%" stopColor="#0D1812" />
              <stop offset="100%" stopColor="#060C09" />
            </linearGradient>

            {/* Glowing River Cam Stream */}
            <linearGradient id="darkRiverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0D3547" />
              <stop offset="50%" stopColor="#124E68" />
              <stop offset="100%" stopColor="#0A2D3D" />
            </linearGradient>

            {/* Dark Scholarly Grid with Brass Points */}
            <pattern id="cartoGrid" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#B89758" strokeWidth="0.75" strokeOpacity="0.12" strokeDasharray="3,3" />
              <circle cx="0" cy="0" r="1.5" fill="#B89758" fillOpacity="0.25" />
            </pattern>

            {/* Dark Botanical Foliage Hatch */}
            <pattern id="botanicalHatch" width="16" height="16" patternUnits="userSpaceOnUse">
              <rect width="16" height="16" fill="#112217" />
              <circle cx="8" cy="8" r="1.5" fill="#1C3A27" opacity="0.8" />
            </pattern>

            {/* College Quad Architectural Hatch */}
            <pattern id="collegeHatch" width="12" height="12" patternUnits="userSpaceOnUse">
              <rect width="12" height="12" fill="#18271E" />
              <line x1="0" y1="0" x2="12" y2="12" stroke="#B89758" strokeWidth="0.8" opacity="0.3" />
            </pattern>
          </defs>

          {/* 1. Dark Mode Terrain & Grid */}
          <rect width={MAP_BOUNDS.width} height={MAP_BOUNDS.height} fill="url(#darkCartoGrad)" />
          <rect width={MAP_BOUNDS.width} height={MAP_BOUNDS.height} fill="url(#cartoGrid)" />

          {/* Cartographic Compass Rose in upper left corner */}
          <g id="compass-rose" transform="translate(300, 360)">
            <circle cx="0" cy="0" r="90" fill="none" stroke="#B89758" strokeWidth="1.5" strokeDasharray="4,3" opacity="0.6" />
            <circle cx="0" cy="0" r="75" fill="none" stroke="#B89758" strokeWidth="1" opacity="0.4" />
            {/* Compass Star Points */}
            <polygon points="0,-70 12,-15 0,0" fill="#8E232B" />
            <polygon points="0,-70 -12,-15 0,0" fill="#E2CA8E" />
            <polygon points="0,70 12,15 0,0" fill="#E2CA8E" />
            <polygon points="0,70 -12,15 0,0" fill="#8E232B" />
            <polygon points="70,0 15,12 0,0" fill="#E2CA8E" />
            <polygon points="70,0 15,-12 0,0" fill="#8E232B" />
            <polygon points="-70,0 -15,12 0,0" fill="#8E232B" />
            <polygon points="-70,0 -15,-12 0,0" fill="#E2CA8E" />
            <circle cx="0" cy="0" r="8" fill="#1C3A27" stroke="#E2CA8E" strokeWidth="2" />
            <text x="0" y="-80" textAnchor="middle" fill="#E2CA8E" fontSize="16" fontWeight="bold" fontFamily="Cinzel">N</text>
            <text x="0" y="96" textAnchor="middle" fill="#B89758" fontSize="14" fontWeight="bold" fontFamily="Cinzel">S</text>
            <text x="88" y="5" textAnchor="start" fill="#B89758" fontSize="14" fontWeight="bold" fontFamily="Cinzel">E</text>
            <text x="-88" y="5" textAnchor="end" fill="#B89758" fontSize="14" fontWeight="bold" fontFamily="Cinzel">W</text>
            <text x="0" y="115" textAnchor="middle" fill="#B89758" fontSize="10" fontFamily="Cinzel" letterSpacing="2" opacity="0.8">
              ACADEMIA CANTABRIGIENSIS
            </text>
          </g>

          {/* 2. Historic Cambridge Green Spaces (The Backs, Coe Fen, Jesus Green, Botanic Gardens) */}
          <g id="parks-and-greens">
            {/* The Backs (Meandering along River Cam) */}
            <path
              d="M 600,680 Q 750,900 780,1200 L 950,1180 Q 920,850 780,650 Z"
              fill="url(#botanicalHatch)"
              stroke="#B89758"
              strokeWidth="1.5"
              strokeDasharray="4,2"
              strokeOpacity="0.4"
            />
            <text x="680" y="920" fill="#E2CA8E" fontSize="16" fontWeight="bold" fontFamily="Cinzel" letterSpacing="4" opacity="0.85">
              THE BACKS
            </text>

            {/* Coe Fen (South of Mill Pond) */}
            <path
              d="M 820,1500 Q 980,1650 960,1900 L 1120,1880 Q 1150,1600 1020,1450 Z"
              fill="url(#botanicalHatch)"
              stroke="#B89758"
              strokeWidth="1.2"
              strokeOpacity="0.3"
            />
            <text x="910" y="1720" fill="#E2CA8E" fontSize="14" fontWeight="bold" fontFamily="Cinzel" letterSpacing="3" opacity="0.8">
              COE FEN
            </text>

            {/* Jesus Green (North East) */}
            <rect
              x="1200"
              y="280"
              width="450"
              height="220"
              rx="16"
              fill="url(#botanicalHatch)"
              stroke="#B89758"
              strokeWidth="1.5"
              strokeOpacity="0.35"
            />
            <text x="1350" y="390" fill="#E2CA8E" fontSize="16" fontWeight="bold" fontFamily="Cinzel" letterSpacing="3" opacity="0.85">
              JESUS GREEN
            </text>

            {/* Parker's Piece */}
            <rect
              x="1480"
              y="1100"
              width="380"
              height="360"
              rx="12"
              fill="url(#botanicalHatch)"
              stroke="#B89758"
              strokeWidth="1.5"
              strokeOpacity="0.35"
            />
            <text x="1560" y="1280" fill="#E2CA8E" fontSize="16" fontWeight="bold" fontFamily="Cinzel" letterSpacing="2" opacity="0.85">
              PARKER'S PIECE
            </text>
            <text x="1575" y="1305" fill="#879B8E" fontSize="11" fontFamily="EB Garamond" fontStyle="italic">
              Anno Domini 1863
            </text>

            {/* Cambridge University Botanic Garden */}
            <rect
              x="1400"
              y="1900"
              width="420"
              height="360"
              rx="18"
              fill="#122419"
              stroke="#B89758"
              strokeWidth="2"
            />
            <rect
              x="1410"
              y="1910"
              width="400"
              height="340"
              rx="14"
              fill="none"
              stroke="#B89758"
              strokeWidth="1"
              strokeDasharray="6,3"
              strokeOpacity="0.5"
            />
            <text x="1460" y="2080" fill="#E2CA8E" fontSize="16" fontWeight="bold" fontFamily="Cinzel" letterSpacing="1">
              HORTUS BOTANICUS
            </text>
            <text x="1490" y="2110" fill="#A6BAAE" fontSize="12" fontFamily="EB Garamond" fontStyle="italic">
              Cantabrigia Flora & Silviculture
            </text>
          </g>

          {/* 3. The River Cam (Flowing gracefully in deep nocturnal teal with gold wavelets) */}
          <g id="river-cam">
            {/* River bed bank outer glow */}
            <path
              d="M 920,2300 C 900,1950 860,1750 960,1520 C 1020,1380 940,1260 880,1050 C 830,880 840,650 930,480 C 1020,320 1200,240 1600,180"
              fill="none"
              stroke="#0A2533"
              strokeWidth="42"
              strokeLinecap="round"
              opacity="0.6"
            />
            {/* Main Stream */}
            <path
              d="M 920,2300 C 900,1950 860,1750 960,1520 C 1020,1380 940,1260 880,1050 C 830,880 840,650 930,480 C 1020,320 1200,240 1600,180"
              fill="none"
              stroke="url(#darkRiverGrad)"
              strokeWidth="28"
              strokeLinecap="round"
            />
            {/* Water Flow Illuminated Ripples */}
            <path
              d="M 920,2300 C 900,1950 860,1750 960,1520 C 1020,1380 940,1260 880,1050 C 830,880 840,650 930,480 C 1020,320 1200,240 1600,180"
              fill="none"
              stroke="#38BDF8"
              strokeWidth="2.5"
              strokeDasharray="14, 28"
              strokeLinecap="round"
              opacity="0.8"
            />
            <text x="890" y="850" fill="#7DD3FC" fontSize="14" fontWeight="bold" fontFamily="Cinzel" letterSpacing="5" opacity="0.9">
              FLUMEN   CAMUS
            </text>
          </g>

          {/* 4. Historic Bridges across River Cam */}
          <g id="bridges">
            {/* King's Bridge */}
            <rect x="860" y="1015" width="50" height="10" rx="3" fill="#B89758" stroke="#121A15" strokeWidth="1.5" />
            <text x="770" y="1010" fill="#E2CA8E" fontSize="11" fontWeight="bold" fontFamily="Cinzel">Pons Regalis</text>

            {/* Mathematical Bridge */}
            <rect x="910" y="1255" width="48" height="10" rx="3" fill="#B89758" stroke="#121A15" strokeWidth="1.5" />
            <text x="965" y="1265" fill="#E2CA8E" fontSize="11" fontWeight="bold" fontFamily="Cinzel">Pons Mathematicus</text>

            {/* Bridge of Sighs */}
            <rect x="880" y="615" width="48" height="10" rx="3" fill="#B89758" stroke="#121A15" strokeWidth="1.5" />
            <text x="760" y="612" fill="#E2CA8E" fontSize="11" fontWeight="bold" fontFamily="Cinzel">Pons Suspiriorum</text>
          </g>

          {/* 5. Historic College Courts Footprints (Architectural Quadrangles) */}
          <g id="colleges">
            {/* King's College Court */}
            <rect x="960" y="980" width="85" height="110" rx="4" fill="url(#collegeHatch)" stroke="#B89758" strokeWidth="1.5" />
            <text x="970" y="1040" fill="#E2CA8E" fontSize="12" fontWeight="bold" fontFamily="Cinzel">King's</text>

            {/* Trinity College Great Court */}
            <rect x="940" y="740" width="100" height="120" rx="4" fill="url(#collegeHatch)" stroke="#B89758" strokeWidth="1.5" />
            <text x="960" y="805" fill="#E2CA8E" fontSize="12" fontWeight="bold" fontFamily="Cinzel">Trinity</text>

            {/* St John's College */}
            <rect x="920" y="560" width="90" height="95" rx="4" fill="url(#collegeHatch)" stroke="#B89758" strokeWidth="1.5" />
            <text x="935" y="615" fill="#E2CA8E" fontSize="12" fontWeight="bold" fontFamily="Cinzel">St John's</text>

            {/* Cambridge University Library Tower */}
            <rect x="420" y="910" width="80" height="85" rx="6" fill="#1C2D23" stroke="#B89758" strokeWidth="1.5" />
            <text x="430" y="955" fill="#FAF8F5" fontSize="10" fontWeight="bold" fontFamily="Cinzel">UL Tower</text>

            {/* Market Square */}
            <rect x="1110" y="960" width="55" height="55" rx="4" fill="#B89758" fillOpacity="0.2" stroke="#B89758" strokeWidth="1.5" strokeDasharray="3,2" />
            <text x="1115" y="990" fill="#E2CA8E" fontSize="9" fontWeight="bold" fontFamily="Cinzel">Forum</text>
          </g>

          {/* 6. Historic Streets */}
          <g id="streets">
            {/* King's Parade / Trinity Street */}
            <path
              d="M 1120,1850 L 1100,1350 L 1040,920 L 980,560 L 920,400"
              fill="none"
              stroke="#152119"
              strokeWidth="16"
              strokeLinecap="round"
            />
            <path
              d="M 1120,1850 L 1100,1350 L 1040,920 L 980,560 L 920,400"
              fill="none"
              stroke="#B89758"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="8,6"
              strokeOpacity="0.65"
            />
            <text x="1055" y="920" fill="#E2CA8E" fontSize="11" fontWeight="bold" fontFamily="Cinzel" opacity="0.9">Via Regalis</text>

            {/* Castle Street */}
            <path d="M 920,400 L 820,240" fill="none" stroke="#152119" strokeWidth="10" strokeLinecap="round" />
            <path d="M 920,400 L 820,240" fill="none" stroke="#B89758" strokeWidth="3" strokeDasharray="6,4" strokeOpacity="0.5" strokeLinecap="round" />
            <text x="760" y="305" fill="#E2CA8E" fontSize="11" fontWeight="bold" fontFamily="Cinzel" opacity="0.85">Castle Hill</text>

            {/* Downing Street / Free School Lane */}
            <path d="M 1080,1130 L 1480,1130" fill="none" stroke="#152119" strokeWidth="10" strokeLinecap="round" />
            <path d="M 1080,1130 L 1480,1130" fill="none" stroke="#B89758" strokeWidth="3" strokeDasharray="6,4" strokeOpacity="0.5" strokeLinecap="round" />
            <text x="1220" y="1120" fill="#E2CA8E" fontSize="11" fontWeight="bold" fontFamily="Cinzel" opacity="0.85">Downing St</text>

            {/* Trumpington Road */}
            <path d="M 1100,1350 L 1110,1650 L 1400,2100" fill="none" stroke="#152119" strokeWidth="12" strokeLinecap="round" />
            <path d="M 1100,1350 L 1110,1650 L 1400,2100" fill="none" stroke="#B89758" strokeWidth="3.5" strokeDasharray="8,5" strokeOpacity="0.55" strokeLinecap="round" />
            <text x="1125" y="1520" fill="#E2CA8E" fontSize="11" fontWeight="bold" fontFamily="Cinzel" opacity="0.85">Trumpington St</text>
          </g>
        </svg>

        {/* 7. Scholar Avatar & Radar Pulse */}
        <div
          className="absolute z-30 pointer-events-none -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
          style={{
            left: userPos.x,
            top: userPos.y,
          }}
        >
          {/* Radar Waves (representing 75m detection radius in antique gold) */}
          <div className="absolute w-44 h-44 rounded-full bg-[#B89758]/15 border border-[#B89758]/50 animate-radar" />
          <div className="absolute w-28 h-28 rounded-full bg-[#1C3A27]/20 border border-[#1C3A27]/40" />

          {/* Scholar Astrolabe Emblem */}
          <div className="w-12 h-12 rounded-full bg-[#1C3A27] border-2 border-[#B89758] shadow-[0_6px_20px_rgba(0,0,0,0.6)] flex items-center justify-center text-xl">
            🧭
          </div>
        </div>

        {/* 8. Interactive Collegiate Wax Seal Venue Markers */}
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
                <div className="absolute -inset-3 rounded-full bg-[#B89758]/40 animate-ping pointer-events-none" />
              )}

              {/* Physical Wax Seal Medallion */}
              <div
                className={`relative w-12 h-12 rounded-2xl border-2 flex items-center justify-center shadow-[0_6px_16px_rgba(0,0,0,0.5)] transition-all ${
                  isVisited
                    ? 'bg-[#1C3A27] border-[#B89758] text-[#E2CA8E] text-sm font-black shadow-[0_0_15px_rgba(28,58,39,0.5)]'
                    : isWithinRange
                    ? 'bg-[#6B1D23] border-[#E2CA8E] text-[#FAF8F5] text-lg scale-110 shadow-[0_0_20px_rgba(184,151,88,0.8)]'
                    : hasEvent
                    ? 'bg-[#6B1D23] border-[#B89758] text-[#E2CA8E] text-sm shadow-[0_0_15px_rgba(107,29,35,0.6)]'
                    : 'bg-[#122419] border-[#B89758]/70 text-[#B89758] text-sm'
                }`}
              >
                {isVisited ? '✓' : hasEvent ? '⚡' : '🏛️'}

                {/* Range alert dot */}
                {isWithinRange && !isVisited && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#B89758] border border-[#121A15] animate-bounce" />
                )}
              </div>

              {/* Parchment Venue Name Placard */}
              <div className="mt-1 px-2 py-0.5 rounded bg-[#FDF5E6] border border-[#B89758] text-[10px] font-bold text-[#1C3A27] font-display shadow whitespace-nowrap max-w-[125px] truncate group-hover:scale-105 transition">
                {venue.name.replace('Cambridge University', 'CU').replace('Museum', 'Mus.')}
              </div>

              {/* Distance Callout */}
              <div className="text-[9px] font-mono text-[#FAF8F5] bg-[#1C3A27] px-1.5 py-0.2 rounded-full mt-0.5 border border-[#B89758]/60">
                {distance}m
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= MAP CONTROLS & HUD OVERLAYS ================= */}

      {/* Top Brass Ribbon Filter Chips */}
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
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-md font-display ${
                isSelected
                  ? 'bg-[#1C3A27] text-[#E2CA8E] border border-[#B89758] shadow-[0_2px_8px_rgba(0,0,0,0.4)]'
                  : 'bg-[#FDF5E6]/95 text-[#1C3A27] border border-[#B89758]/50 hover:bg-[#FDF5E6]'
              }`}
            >
              {cat === 'All' ? '🏛️ All Archives' : cat}
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
          className="w-10 h-10 rounded-2xl bg-[#1C3A27] border border-[#B89758] text-[#E2CA8E] flex items-center justify-center shadow-lg active:scale-95 transition"
        >
          <Plus className="w-4 h-4" />
        </button>

        {/* Zoom Out */}
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="w-10 h-10 rounded-2xl bg-[#1C3A27] border border-[#B89758] text-[#E2CA8E] flex items-center justify-center shadow-lg active:scale-95 transition"
        >
          <Minus className="w-4 h-4" />
        </button>

        {/* Recenter on Scholar */}
        <button
          onClick={handleRecenter}
          title="Recenter on my explorer"
          className="w-10 h-10 rounded-2xl bg-[#1C3A27] border border-[#B89758] text-[#B89758] flex items-center justify-center shadow-lg active:scale-95 transition"
        >
          <Crosshair className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* GPS Simulation / Teleport Toggle */}
        <button
          onClick={() => setShowSimNotice((prev) => !prev)}
          title="Simulate GPS presence at venues"
          className={`w-10 h-10 rounded-2xl border flex items-center justify-center shadow-lg active:scale-95 transition ${
            isSimulatingLocation
              ? 'bg-[#6B1D23] text-[#FAF8F5] border-[#B89758] shadow-[0_0_12px_rgba(107,29,35,0.7)]'
              : 'bg-[#1C3A27] border-[#B89758]/60 text-[#D1C7B7]'
          }`}
        >
          <Navigation className="w-4 h-4" />
        </button>
      </div>

      {/* 15-Minute Culture Dose Floating Pill (Oxblood Wax Seal) */}
      <div className="absolute left-3 bottom-52 z-40">
        <button
          onClick={handleQuickDose}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-[#6B1D23] border border-[#B89758] text-[#FAF8F5] font-display font-bold text-xs shadow-[0_4px_12px_rgba(0,0,0,0.5)] active:translate-y-0.5 transition tracking-wide"
        >
          <Zap className="w-4 h-4 text-[#E2CA8E] fill-[#E2CA8E]" />
          <span>15-Min Scholar Treat</span>
        </button>
      </div>

      {/* Antiquarian Cambridge Watermark Badge */}
      <div className="absolute top-12 left-3 z-30 pointer-events-none">
        <span className="px-2.5 py-0.5 rounded-full bg-[#1C3A27]/90 border border-[#B89758]/50 text-[10px] text-[#D1C7B7] font-display tracking-widest backdrop-blur-md">
          CANTABRIGIA ARCHIVUM
        </span>
      </div>

      {/* GPS Simulation Drawer / Debugger */}
      {showSimNotice && (
        <div className="absolute top-14 left-3 right-3 z-50 p-4 bg-[#1C3A27] border-2 border-[#B89758] rounded-3xl shadow-2xl backdrop-blur-md text-xs text-[#FAF8F5]">
          <div className="flex items-center justify-between pb-2 border-b border-[#B89758]/40">
            <span className="font-bold text-[#E2CA8E] font-display flex items-center gap-1.5 text-xs">
              <Navigation className="w-3.5 h-3.5 text-[#B89758]" /> Geofence Presence Simulator
            </span>
            <button
              onClick={() => setShowSimNotice(false)}
              className="text-[#D1C7B7] hover:text-white font-bold text-xs"
            >
              ✕
            </button>
          </div>
          <p className="text-[11px] text-[#C0CEC5] mt-1.5 font-body">
            Verify the 75m archival geofence check by teleporting your scholar avatar to any college or museum:
          </p>
          <div className="grid grid-cols-2 gap-1.5 mt-2.5 max-h-36 overflow-y-auto">
            {venues.map((v) => (
              <button
                key={v.id}
                onClick={() => {
                  teleportToVenue(v.id);
                  setShowSimNotice(false);
                }}
                className="p-1.5 rounded-xl bg-[#122419] hover:bg-[#234731] border border-[#B89758]/50 text-[10px] font-bold text-left truncate text-[#FAF8F5] font-display"
              >
                🏛️ {v.name}
              </button>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-[#B89758]/40 flex justify-end">
            <button
              onClick={resetUserLocation}
              className="text-[10px] text-[#E2CA8E] hover:underline font-bold font-display"
            >
              Reset to Cambridge Market Center
            </button>
          </div>
        </div>
      )}

      {/* Bottom Sheet "Nearby Now" Tray (Parchment Cards) */}
      <div className="absolute bottom-14 left-0 right-0 z-40 px-3 pb-2 pointer-events-auto">
        <div className="flex items-center justify-between mb-1.5 px-1">
          <span className="text-[10px] font-bold text-[#D1C7B7] uppercase tracking-widest font-display flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-[#B89758]" /> Proximate Archives ({filteredVenues.length})
          </span>
          <span className="text-[10px] text-[#E2CA8E] font-medium font-body italic">Tap archive to inspect</span>
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
                className={`flex-shrink-0 w-64 p-3 rounded-2xl border text-left transition-all parchment-card ${
                  isWithinRange
                    ? 'border-2 border-[#6B1D23] shadow-[0_6px_20px_rgba(107,29,35,0.3)]'
                    : 'border border-[#B89758]/50 hover:border-[#B89758]'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-[#B89758]/60 relative">
                    <img src={venue.image} alt={venue.name} className="w-full h-full object-cover" />
                    {isVisited && (
                      <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#1C3A27] text-[10px] text-[#E2CA8E] flex items-center justify-center font-bold border border-[#B89758]">
                        ✓
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#1C3A27] text-[#E2CA8E] font-display uppercase tracking-wider">
                        {venue.type}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold ${
                          isWithinRange ? 'text-[#6B1D23] font-black' : 'text-[#544431]'
                        }`}
                      >
                        {distance}m • {walkMin}m
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-[#1A281F] font-display truncate mt-1">
                      {venue.name}
                    </h4>

                    <div className="flex items-center gap-2 mt-1 text-[10px] font-body text-[#3B4E41]">
                      <span className="text-[#6B1D23] font-bold flex items-center gap-0.5">
                        <Sparkles className="w-3 h-3 text-[#B89758]" /> +50 pts
                      </span>
                      <span>•</span>
                      <span>{venue.isFree ? 'Free Admission' : venue.entryFee}</span>
                    </div>
                  </div>
                </div>

                {venue.featuredEvent && (
                  <div className="mt-2 pt-1.5 border-t border-[#B89758]/30 flex items-center justify-between text-[10px] font-body">
                    <span className="text-[#6B1D23] font-bold flex items-center gap-1">
                      <Flame className="w-3 h-3 text-[#B89758]" /> {venue.featuredEvent.title}
                    </span>
                    <span className="text-[#544431] font-mono">{venue.featuredEvent.endsIn}</span>
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

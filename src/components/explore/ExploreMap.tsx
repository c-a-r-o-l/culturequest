import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { Venue, VenueType } from '../../types';
import {
  MapPin,
  Clock,
  Sparkles,
  Zap,
  Navigation,
  Crosshair,
  Plus,
  Minus,
  Flame,
  Check,
} from 'lucide-react';
import { triggerHaptic, sound } from '../../utils/audioAndFx';

// Map coordinate system for Cambridge (pilot city)
const MAP_BOUNDS = {
  minLat: 52.19,
  maxLat: 52.215,
  minLng: 0.1,
  maxLng: 0.136,
  width: 2200,
  height: 2600,
};

function projectCoords(lat: number, lng: number) {
  const x = ((lng - MAP_BOUNDS.minLng) / (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng)) * MAP_BOUNDS.width;
  const y = ((MAP_BOUNDS.maxLat - lat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) * MAP_BOUNDS.height;
  return { x, y };
}

// Palette for the bright tourist-style map
const LAND = '#EFF1E4';
const LAND_EDGE = '#DDE0CC';
const WATER = '#A9D3E4';
const WATER_DEEP = '#8FC2D8';
const PARK = '#B9D0A4';
const PARK_EDGE = '#97B57F';
const STREET = '#FFFFFF';
const STREET_CASING = '#D8D6C4';
const INK = '#3A382E';
const MUTED = '#6E6B5C';
const GOLD = '#F2A71B';

const VENUE_STYLE: Record<VenueType, { ring: string; emoji: string; label: string }> = {
  Museum: { ring: '#E23D28', emoji: '🏛️', label: 'Museum' },
  Gallery: { ring: '#127E8A', emoji: '🖼️', label: 'Gallery' },
  Library: { ring: '#4C5FD5', emoji: '📚', label: 'Library' },
  Heritage: { ring: '#F2A71B', emoji: '⛪', label: 'Heritage' },
  Garden: { ring: '#6E9A54', emoji: '🌿', label: 'Garden' },
};

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

  // Pan & zoom state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: -600, y: -800 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const [activeFilter, setActiveFilter] = useState<'All' | VenueType>('All');
  const [showSimNotice, setShowSimNotice] = useState(false);

  const filteredVenues = venues.filter((v) => {
    if (activeFilter === 'All') return true;
    return v.type === activeFilter;
  });

  const userPos = projectCoords(userLocation.lat, userLocation.lng);

  // Center pan on a map coordinate
  const centerOnPoint = useCallback(
    (mapX: number, mapY: number, targetZoom = zoom) => {
      if (!containerRef.current) return;
      const viewWidth = containerRef.current.clientWidth;
      const viewHeight = containerRef.current.clientHeight;

      const newX = viewWidth / 2 - mapX * targetZoom;
      const newY = viewHeight / 2 - mapY * targetZoom;
      setPan({ x: newX, y: newY });
    },
    [zoom]
  );

  // Initial center on the player
  useEffect(() => {
    centerOnPoint(userPos.x, userPos.y, 1.15);
    setZoom(1.15);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Dragging (mouse & touch)
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);

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

  const handleTouchEnd = () => setIsDragging(false);

  // Quick Quest: jump straight into today's bite-size quest
  const handleQuickQuest = () => {
    triggerHaptic('medium');
    sound.playCoin();
    const dailyQuest = quests.find((q) => q.isDaily) || quests[0];
    if (dailyQuest) {
      setActivePlayingQuest(dailyQuest);
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
      className="absolute inset-0 overflow-hidden bg-wall cursor-grab active:cursor-grabbing select-none"
    >
      {/* ============ THE MAP (pannable layer) ============ */}
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
          {/* Base land */}
          <rect width={MAP_BOUNDS.width} height={MAP_BOUNDS.height} fill={LAND} />
          <rect
            width={MAP_BOUNDS.width}
            height={MAP_BOUNDS.height}
            fill="none"
            stroke={LAND_EDGE}
            strokeWidth="6"
          />

          {/* Green spaces */}
          <g id="parks">
            <path
              d="M 600,680 Q 750,900 780,1200 L 950,1180 Q 920,850 780,650 Z"
              fill={PARK}
              stroke={PARK_EDGE}
              strokeWidth="3"
            />
            <text x="690" y="930" fill="#4E6B3E" fontSize="17" fontWeight="700" fontFamily="Archivo, sans-serif" letterSpacing="2">
              THE BACKS
            </text>

            <path
              d="M 820,1500 Q 980,1650 960,1900 L 1120,1880 Q 1150,1600 1020,1450 Z"
              fill={PARK}
              stroke={PARK_EDGE}
              strokeWidth="3"
            />
            <text x="915" y="1710" fill="#4E6B3E" fontSize="15" fontWeight="700" fontFamily="Archivo, sans-serif" letterSpacing="2">
              COE FEN
            </text>

            <rect x="1200" y="280" width="450" height="220" rx="18" fill={PARK} stroke={PARK_EDGE} strokeWidth="3" />
            <text x="1340" y="398" fill="#4E6B3E" fontSize="17" fontWeight="700" fontFamily="Archivo, sans-serif" letterSpacing="2">
              JESUS GREEN
            </text>

            <rect x="1480" y="1100" width="380" height="360" rx="14" fill={PARK} stroke={PARK_EDGE} strokeWidth="3" />
            <text x="1552" y="1288" fill="#4E6B3E" fontSize="17" fontWeight="700" fontFamily="Archivo, sans-serif" letterSpacing="1">
              PARKER'S PIECE
            </text>

            <rect x="1400" y="1900" width="420" height="360" rx="20" fill="#A8C48F" stroke={PARK_EDGE} strokeWidth="4" />
            <rect x="1412" y="1912" width="396" height="336" rx="14" fill="none" stroke={PARK_EDGE} strokeWidth="2" strokeDasharray="8,4" />
            <text x="1470" y="2090" fill="#3F5A33" fontSize="18" fontWeight="800" fontFamily="Archivo, sans-serif">
              BOTANIC GARDEN
            </text>
            <text x="1540" y="2120" fill="#5A7350" fontSize="13" fontStyle="italic" fontFamily="Inter, sans-serif">
              Glasshouses & heritage trees
            </text>
          </g>

          {/* River Cam */}
          <g id="river">
            <path
              d="M 920,2300 C 900,1950 860,1750 960,1520 C 1020,1380 940,1260 880,1050 C 830,880 840,650 930,480 C 1020,320 1200,240 1600,180"
              fill="none"
              stroke={WATER_DEEP}
              strokeWidth="34"
              strokeLinecap="round"
              opacity="0.5"
            />
            <path
              d="M 920,2300 C 900,1950 860,1750 960,1520 C 1020,1380 940,1260 880,1050 C 830,880 840,650 930,480 C 1020,320 1200,240 1600,180"
              fill="none"
              stroke={WATER}
              strokeWidth="24"
              strokeLinecap="round"
            />
            <text x="880" y="862" fill="#127E8A" fontSize="15" fontWeight="800" fontFamily="Archivo, sans-serif" letterSpacing="4">
              RIVER CAM
            </text>
          </g>

          {/* Bridges */}
          <g id="bridges">
            <rect x="858" y="1012" width="54" height="12" rx="4" fill="#8B8578" />
            <text x="772" y="1008" fill={MUTED} fontSize="12" fontWeight="700" fontFamily="Archivo, sans-serif">King's Bridge</text>

            <rect x="908" y="1252" width="52" height="12" rx="4" fill="#8B8578" />
            <text x="970" y="1266" fill={MUTED} fontSize="12" fontWeight="700" fontFamily="Archivo, sans-serif">Mathematical Bridge</text>

            <rect x="878" y="612" width="52" height="12" rx="4" fill="#8B8578" />
            <text x="762" y="608" fill={MUTED} fontSize="12" fontWeight="700" fontFamily="Archivo, sans-serif">Bridge of Sighs</text>
          </g>

          {/* Colleges */}
          <g id="colleges">
            <rect x="960" y="980" width="85" height="110" rx="6" fill="#FFFFFF" stroke={STREET_CASING} strokeWidth="3" />
            <text x="972" y="1040" fill={INK} fontSize="13" fontWeight="700" fontFamily="Archivo, sans-serif">King's</text>

            <rect x="940" y="740" width="100" height="120" rx="6" fill="#FFFFFF" stroke={STREET_CASING} strokeWidth="3" />
            <text x="962" y="806" fill={INK} fontSize="13" fontWeight="700" fontFamily="Archivo, sans-serif">Trinity</text>

            <rect x="920" y="560" width="90" height="95" rx="6" fill="#FFFFFF" stroke={STREET_CASING} strokeWidth="3" />
            <text x="938" y="612" fill={INK} fontSize="13" fontWeight="700" fontFamily="Archivo, sans-serif">St John's</text>

            <rect x="420" y="910" width="80" height="85" rx="8" fill="#FFFFFF" stroke={STREET_CASING} strokeWidth="3" />
            <text x="432" y="956" fill={INK} fontSize="11" fontWeight="700" fontFamily="Archivo, sans-serif">University Library</text>

            <rect x="1110" y="960" width="55" height="55" rx="6" fill="#FDF2D8" stroke={GOLD} strokeWidth="3" strokeDasharray="4,3" />
            <text x="1117" y="992" fill="#8A6A10" fontSize="10" fontWeight="700" fontFamily="Archivo, sans-serif">Market</text>
          </g>

          {/* Streets */}
          <g id="streets">
            <path
              d="M 1120,1850 L 1100,1350 L 1040,920 L 980,560 L 920,400"
              fill="none"
              stroke={STREET_CASING}
              strokeWidth="22"
              strokeLinecap="round"
            />
            <path
              d="M 1120,1850 L 1100,1350 L 1040,920 L 980,560 L 920,400"
              fill="none"
              stroke={STREET}
              strokeWidth="16"
              strokeLinecap="round"
            />
            <text x="1060" y="922" fill={MUTED} fontSize="12" fontWeight="600" fontFamily="Archivo, sans-serif">King's Parade</text>

            <path d="M 920,400 L 820,240" fill="none" stroke={STREET_CASING} strokeWidth="16" strokeLinecap="round" />
            <path d="M 920,400 L 820,240" fill="none" stroke={STREET} strokeWidth="10" strokeLinecap="round" />
            <text x="760" y="308" fill={MUTED} fontSize="12" fontWeight="600" fontFamily="Archivo, sans-serif">Castle Hill</text>

            <path d="M 1080,1130 L 1480,1130" fill="none" stroke={STREET_CASING} strokeWidth="16" strokeLinecap="round" />
            <path d="M 1080,1130 L 1480,1130" fill="none" stroke={STREET} strokeWidth="10" strokeLinecap="round" />
            <text x="1220" y="1120" fill={MUTED} fontSize="12" fontWeight="600" fontFamily="Archivo, sans-serif">Downing St</text>

            <path d="M 1100,1350 L 1110,1650 L 1400,2100" fill="none" stroke={STREET_CASING} strokeWidth="18" strokeLinecap="round" />
            <path d="M 1100,1350 L 1110,1650 L 1400,2100" fill="none" stroke={STREET} strokeWidth="12" strokeLinecap="round" />
            <text x="1128" y="1524" fill={MUTED} fontSize="12" fontWeight="600" fontFamily="Archivo, sans-serif">Trumpington St</text>
          </g>

          {/* Small compass rose */}
          <g transform="translate(1910, 380)">
            <circle cx="0" cy="0" r="52" fill="#FFFFFF" opacity="0.85" stroke={STREET_CASING} strokeWidth="3" />
            <polygon points="0,-38 9,-8 0,0" fill={GOLD} />
            <polygon points="0,-38 -9,-8 0,0" fill="#E8B54A" />
            <polygon points="0,38 9,8 0,0" fill="#E8E3CF" />
            <polygon points="0,38 -9,8 0,0" fill="#D9D3BD" />
            <polygon points="38,0 8,9 0,0" fill="#E8E3CF" />
            <polygon points="38,0 8,-9 0,0" fill="#D9D3BD" />
            <polygon points="-38,0 -8,9 0,0" fill="#D9D3BD" />
            <polygon points="-38,0 -8,-9 0,0" fill="#E8E3CF" />
            <circle cx="0" cy="0" r="4" fill={INK} />
            <text x="0" y="-46" textAnchor="middle" fill={INK} fontSize="13" fontWeight="800" fontFamily="Archivo, sans-serif">N</text>
          </g>
        </svg>

        {/* Player marker */}
        <div
          className="absolute z-30 pointer-events-none -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
          style={{ left: userPos.x, top: userPos.y }}
        >
          <div className="absolute w-44 h-44 rounded-full bg-teal/15 border border-teal/50 animate-radar" />
          <div className="absolute w-20 h-20 rounded-full bg-teal/10 border border-teal/30" />
          <div className="w-6 h-6 rounded-full bg-teal border-[3px] border-white shadow-[0_2px_10px_rgba(18,126,138,0.5)]" />
        </div>

        {/* Venue markers */}
        {filteredVenues.map((venue) => {
          const pos = projectCoords(venue.lat, venue.lng);
          const isVisited = visitedVenueIds.includes(venue.id);
          const distance = getDistanceToVenueMeters(venue);
          const isWithinRange = distance <= venue.radiusMeters;
          const style = VENUE_STYLE[venue.type];

          return (
            <div
              key={venue.id}
              onClick={(e) => {
                e.stopPropagation();
                triggerHaptic('medium');
                sound.playCoin();
                setSelectedVenue(venue);
              }}
              style={{ left: pos.x, top: pos.y }}
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer group flex flex-col items-center pointer-events-auto active:scale-95 transition-transform"
            >
              {/* In-range pulse */}
              {isWithinRange && !isVisited && (
                <div className="absolute top-5 w-12 h-12 rounded-full bg-gold/40 animate-ping pointer-events-none" />
              )}

              {/* Pin */}
              <div
                className={`relative w-10 h-10 rounded-full border-[2.5px] flex items-center justify-center text-base shadow-[0_3px_10px_rgba(0,0,0,0.18)] transition-transform group-hover:scale-110 ${
                  isVisited ? 'bg-teal-soft opacity-90' : 'bg-white'
                }`}
                style={{ borderColor: isVisited ? '#127E8A' : isWithinRange ? GOLD : style.ring }}
              >
                {style.emoji}
                {isVisited && (
                  <span className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 rounded-full bg-teal text-white flex items-center justify-center border-2 border-white">
                    <Check className="w-2.5 h-2.5 stroke-[4]" />
                  </span>
                )}
                {venue.featuredEvent && !isVisited && (
                  <span className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 rounded-full bg-gold text-white flex items-center justify-center border-2 border-white animate-bounce">
                    <Zap className="w-2.5 h-2.5 fill-white" />
                  </span>
                )}
              </div>

              {/* Nameplate */}
              <div className="mt-1 px-2 py-0.5 rounded-full bg-white border border-line text-[10px] font-bold text-ink font-display shadow-sm whitespace-nowrap max-w-[120px] truncate group-hover:border-vermilion transition">
                {venue.name.replace('Cambridge University', 'CU')}
              </div>

              {/* Distance */}
              <div className="text-[9px] font-mono text-ink bg-white/95 px-1.5 py-0.1 rounded-full mt-0.5 border border-line/70">
                {isWithinRange ? 'In range' : `${distance}m away`}
              </div>
            </div>
          );
        })}
      </div>

      {/* ============ OVERLAYS ============ */}

      {/* Filter chips */}
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
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shadow-sm ${
                isSelected
                  ? 'bg-ink text-wall'
                  : 'bg-card text-ink border border-line hover:border-muted'
              }`}
            >
              {cat === 'All' ? 'All' : `${cat}s`}
            </button>
          );
        })}
      </div>

      {/* Map eyebrow */}
      <div className="absolute top-14 left-3 z-30 pointer-events-none">
        <span className="px-2.5 py-0.5 rounded-full bg-card/90 border border-line text-[10px] text-muted font-mono tracking-wide backdrop-blur-sm">
          CAMBRIDGE · PILOT MAP
        </span>
      </div>

      {/* Floating controls */}
      <div className="absolute right-3 bottom-64 z-40 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          title="Zoom in"
          className="w-10 h-10 rounded-2xl bg-card border border-line text-ink flex items-center justify-center shadow-sm active:scale-95 transition"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom out"
          className="w-10 h-10 rounded-2xl bg-card border border-line text-ink flex items-center justify-center shadow-sm active:scale-95 transition"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={handleRecenter}
          title="Recenter on me"
          className="w-10 h-10 rounded-2xl bg-card border border-line text-teal flex items-center justify-center shadow-sm active:scale-95 transition"
        >
          <Crosshair className="w-5 h-5 stroke-[2.5]" />
        </button>
        <button
          onClick={() => setShowSimNotice((prev) => !prev)}
          title="Demo: simulate your location"
          className={`w-10 h-10 rounded-2xl border flex items-center justify-center shadow-sm active:scale-95 transition ${
            isSimulatingLocation
              ? 'bg-vermilion text-white border-vermilion'
              : 'bg-card border-line text-muted'
          }`}
        >
          <Navigation className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Quest pill */}
      <div className="absolute left-3 bottom-64 z-40">
        <button
          onClick={handleQuickQuest}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-vermilion text-white font-bold text-xs shadow-[0_4px_14px_rgba(226,61,40,0.4)] active:translate-y-0.5 transition"
        >
          <Zap className="w-4 h-4 fill-gold text-gold" />
          <span>Quick Quest</span>
        </button>
      </div>

      {/* Location simulator drawer (demo) */}
      {showSimNotice && (
        <div className="absolute top-14 left-3 right-3 z-50 p-4 bg-card border border-line rounded-3xl shadow-2xl text-xs text-ink animate-rise">
          <div className="flex items-center justify-between pb-2 border-b border-line">
            <span className="font-bold font-display flex items-center gap-1.5 text-xs">
              <Navigation className="w-3.5 h-3.5 text-teal" /> Location simulator (demo)
            </span>
            <button onClick={() => setShowSimNotice(false)} className="text-muted hover:text-ink font-bold text-xs">
              ✕
            </button>
          </div>
          <p className="text-[11px] text-muted mt-1.5">
            Teleport to any venue to unlock its check-in and quests:
          </p>
          <div className="grid grid-cols-2 gap-1.5 mt-2.5 max-h-36 overflow-y-auto">
            {venues.map((v) => (
              <button
                key={v.id}
                onClick={() => {
                  teleportToVenue(v.id);
                  setShowSimNotice(false);
                }}
                className="p-1.5 rounded-xl bg-wall hover:bg-teal-soft border border-line text-[10px] font-bold text-left truncate text-ink transition"
              >
                {VENUE_STYLE[v.type].emoji} {v.name}
              </button>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-line flex justify-end">
            <button onClick={resetUserLocation} className="text-[10px] text-teal hover:underline font-bold">
              Reset to Cambridge centre
            </button>
          </div>
        </div>
      )}

      {/* Nearby rail */}
      <div className="absolute bottom-24 left-0 right-0 z-40 px-3 pb-2 pointer-events-auto">
        <div className="flex items-center justify-between mb-1.5 px-1">
          <span className="text-[10px] font-bold text-muted uppercase tracking-widest font-display flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-vermilion" /> Nearby ({filteredVenues.length})
          </span>
          <span className="text-[10px] text-muted">Tap a card to see quests</span>
        </div>

        <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
          {filteredVenues.map((venue) => {
            const distance = getDistanceToVenueMeters(venue);
            const isWithinRange = distance <= venue.radiusMeters;
            const isVisited = visitedVenueIds.includes(venue.id);
            const style = VENUE_STYLE[venue.type];

            return (
              <button
                key={venue.id}
                onClick={() => {
                  triggerHaptic('light');
                  setSelectedVenue(venue);
                }}
                className={`flex-shrink-0 w-64 p-3 rounded-2xl border text-left transition-all bg-card shadow-sm ${
                  isWithinRange ? 'border-2 border-gold' : 'border-line hover:border-muted'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-line relative">
                    <img src={venue.image} alt={venue.name} className="w-full h-full object-cover" />
                    {isVisited && (
                      <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-teal text-white text-[10px] flex items-center justify-center font-bold border border-white">
                        ✓
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider"
                        style={{ backgroundColor: style.ring + '18', color: style.ring }}
                      >
                        {style.label}
                      </span>
                      <span className={`text-[10px] font-mono font-bold ${isWithinRange ? 'text-vermilion' : 'text-muted'}`}>
                        {distance}m
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-ink font-display truncate mt-1">{venue.name}</h4>

                    <div className="flex items-center gap-2 mt-1 text-[10px] text-muted">
                      <span className="text-gold font-bold flex items-center gap-0.5">
                        <Sparkles className="w-3 h-3" /> +{isVisited ? 50 : 100} pts
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5">
                        <Clock className="w-3 h-3" /> {venue.isFree ? 'Free' : venue.entryFee}
                      </span>
                    </div>
                  </div>
                </div>

                {venue.featuredEvent && (
                  <div className="mt-2 pt-1.5 border-t border-line flex items-center justify-between text-[10px]">
                    <span className="text-vermilion font-bold flex items-center gap-1">
                      <Flame className="w-3 h-3" /> {venue.featuredEvent.title}
                    </span>
                    <span className="text-muted font-mono">{venue.featuredEvent.endsIn}</span>
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

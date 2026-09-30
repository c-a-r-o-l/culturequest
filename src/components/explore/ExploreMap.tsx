import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useApp } from '../../context/AppContext';
import { VenueType } from '../../types';
import { Navigation, Crosshair } from 'lucide-react';
import { triggerHaptic, sound } from '../../utils/audioAndFx';

const CAMBRIDGE_CENTER: [number, number] = [52.204, 0.118];

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
    teleportToVenue,
    resetUserLocation,
    getDistanceToVenueMeters,
  } = useApp();

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  const [activeFilter, setActiveFilter] = useState<'All' | VenueType>('All');
  const [showSimNotice, setShowSimNotice] = useState(false);

  // Initialise the map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: CAMBRIDGE_CENTER,
      zoom: 15,
      zoomControl: false, // no +/- buttons — gestures zoom
      scrollWheelZoom: true, // wheel/pinch-trackpad zooms
      doubleClickZoom: false, // clicks pan the map, they don't zoom
      touchZoom: true, // pinch to zoom
      dragging: true, // click-drag moves the map
    });
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    markerLayerRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
      markerLayerRef.current = null;
      userMarkerRef.current = null;
    };
  }, []);

  // Venue markers, re-rendered when the filter or state changes
  useEffect(() => {
    const layer = markerLayerRef.current;
    if (!layer) return;

    layer.clearLayers();

    const filtered = venues.filter((v) => activeFilter === 'All' || v.type === activeFilter);

    filtered.forEach((venue) => {
      const style = VENUE_STYLE[venue.type];
      const isVisited = visitedVenueIds.includes(venue.id);
      const inRange = getDistanceToVenueMeters(venue) <= venue.radiusMeters;
      const ring = isVisited ? '#127E8A' : inRange ? '#F2A71B' : style.ring;

      const icon = L.divIcon({
        className: 'cq-pin',
        html: `
          <div class="cq-pin-wrap">
            <div class="cq-pin-dot" style="border-color:${ring};${isVisited ? 'opacity:.9;' : ''}">
              ${style.emoji}
              ${isVisited ? '<span class="cq-pin-check">✓</span>' : ''}
            </div>
            <div class="cq-pin-label">${venue.name.replace('Cambridge University', 'CU')}</div>
          </div>`,
        iconSize: [0, 0],
      });

      const marker = L.marker([venue.lat, venue.lng], { icon }).addTo(layer);
      marker.on('click', () => {
        triggerHaptic('medium');
        sound.playCoin();
        setSelectedVenue(venue);
      });
    });
  }, [venues, activeFilter, visitedVenueIds, userLocation, getDistanceToVenueMeters, setSelectedVenue]);

  // User location dot (calm, no pulse)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!userMarkerRef.current) {
      const icon = L.divIcon({
        className: 'cq-user',
        html: '<div class="cq-user-dot"></div>',
        iconSize: [0, 0],
      });
      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
        icon,
        zIndexOffset: 500,
        keyboard: false,
        interactive: false, // the location dot must never swallow taps on venue pins
      }).addTo(map);
    } else {
      userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
    }
  }, [userLocation]);

  // Follow the teleported location
  useEffect(() => {
    if (isSimulatingLocation && mapRef.current) {
      mapRef.current.setView([userLocation.lat, userLocation.lng], 16, { animate: true });
    }
  }, [userLocation, isSimulatingLocation]);

  const handleRecenter = () => {
    triggerHaptic('light');
    mapRef.current?.setView([userLocation.lat, userLocation.lng], 15, { animate: true });
  };

  return (
    <div className="absolute inset-0">
      {/* Map */}
      <div ref={containerRef} className="absolute inset-0 z-0" />

      {/* Filter chips — dark pills for contrast over the map */}
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
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shadow-[0_2px_6px_rgba(0,0,0,0.25)] ${
                isSelected ? 'bg-ink text-wall' : 'bg-white text-ink border border-line hover:border-muted'
              }`}
            >
              {cat === 'All' ? 'All' : `${cat}s`}
            </button>
          );
        })}
      </div>

      {/* Adjust-where-you-are pill (demo teleport) */}
      <div className="absolute top-14 right-3 z-40">
        <button
          onClick={() => setShowSimNotice((prev) => !prev)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-[11px] font-bold shadow-[0_2px_8px_rgba(0,0,0,0.25)] active:scale-95 transition ${
            isSimulatingLocation ? 'bg-vermilion text-white' : 'bg-white text-ink border border-line'
          }`}
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Adjust where you are</span>
        </button>
      </div>

      {/* Recenter control */}
      <div className="absolute right-3 bottom-6 z-40">
        <button
          onClick={handleRecenter}
          title="Recenter on me"
          className="w-10 h-10 rounded-2xl bg-white border border-line text-teal flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.2)] active:scale-95 transition"
        >
          <Crosshair className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* Location simulator drawer (demo) */}
      {showSimNotice && (
        <div className="absolute top-14 left-3 right-3 z-50 p-4 bg-card border border-line rounded-3xl shadow-2xl text-xs text-ink animate-rise">
          <div className="flex items-center justify-between pb-2 border-b border-line">
            <span className="font-bold font-display flex items-center gap-1.5 text-xs">
              <Navigation className="w-3.5 h-3.5 text-teal" /> Adjust your location (demo)
            </span>
            <button onClick={() => setShowSimNotice(false)} className="text-muted hover:text-ink font-bold text-xs">
              ✕
            </button>
          </div>
          <p className="text-[11px] text-muted mt-1.5">Teleport to any venue to unlock its check-in and quests:</p>
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
    </div>
  );
};

'use client';

import { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { locations, getHomeLocation } from '@/data/locations';
import Link from 'next/link';

export default function AtlasPage() {
  const trips = useStore((s) => s.trips);
  const home = getHomeLocation();
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [hoveredTrip, setHoveredTrip] = useState<string | null>(null);

  // Get year range
  const years = useMemo(() => {
    const tripYears = trips
      .filter((t) => t.dates.start)
      .map((t) => new Date(t.dates.start).getFullYear());
    if (tripYears.length === 0) return [new Date().getFullYear()];
    const min = Math.min(...tripYears);
    const max = Math.max(...tripYears, new Date().getFullYear());
    const range: number[] = [];
    for (let y = min; y <= max; y++) range.push(y);
    return range;
  }, [trips]);

  const filteredTrips = selectedYear
    ? trips.filter((t) => new Date(t.dates.start).getFullYear() <= selectedYear)
    : trips;

  // Map trips to coordinates
  const tripPins = filteredTrips.map((trip) => {
    const loc = locations.find((l) => l.id === trip.destination || l.slug === trip.destination);
    return { trip, loc };
  }).filter((p) => p.loc);

  return (
    <div className="pt-16 h-screen flex flex-col">
      <div className="flex-1 relative bg-horizon/5 overflow-hidden">
        {/* SVG-based simple world map visualization */}
        <svg viewBox="-180 -90 360 180" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
          {/* Simple world outline */}
          <rect x="-180" y="-90" width="360" height="180" fill="var(--mist)" opacity="0.3" />

          {/* Grid lines */}
          {[-120, -60, 0, 60, 120].map((lng) => (
            <line key={`lng-${lng}`} x1={lng} y1="-90" x2={lng} y2="90" stroke="var(--mist)" strokeWidth="0.5" />
          ))}
          {[-60, -30, 0, 30, 60].map((lat) => (
            <line key={`lat-${lat}`} x1="-180" y1={-lat} x2="180" y2={-lat} stroke="var(--mist)" strokeWidth="0.5" />
          ))}

          {/* Home marker */}
          <g transform={`translate(${home.coords.lng}, ${-home.coords.lat})`}>
            <polygon
              points="0,-4 2.5,1 0,3 -2.5,1"
              fill="var(--ember)"
              stroke="white"
              strokeWidth="0.5"
            />
            <text x="4" y="1" fontSize="3" fill="var(--ink)" opacity="0.6">{home.name}</text>
          </g>

          {/* Route lines + trip pins */}
          {tripPins.map(({ trip, loc }) => {
            if (!loc) return null;
            const isHovered = hoveredTrip === trip.id;
            const color = trip.status === 'past'
              ? 'var(--ember)'
              : trip.status === 'upcoming'
                ? 'var(--ember)'
                : 'var(--horizon)';
            const filled = trip.status === 'past';

            return (
              <g key={trip.id}>
                {/* Route line */}
                <line
                  x1={home.coords.lng}
                  y1={-home.coords.lat}
                  x2={loc.coords.lng}
                  y2={-loc.coords.lat}
                  stroke={color}
                  strokeWidth={isHovered ? '1' : '0.5'}
                  strokeDasharray={trip.status === 'idea' ? '2,2' : undefined}
                  opacity={isHovered ? 0.8 : 0.3}
                />

                {/* Pin */}
                <circle
                  cx={loc.coords.lng}
                  cy={-loc.coords.lat}
                  r={isHovered ? 3.5 : 2.5}
                  fill={filled ? color : 'var(--paper)'}
                  stroke={color}
                  strokeWidth="0.8"
                  className="cursor-pointer transition-all"
                  onMouseEnter={() => setHoveredTrip(trip.id)}
                  onMouseLeave={() => setHoveredTrip(null)}
                  onClick={() => setHoveredTrip(trip.id)}
                />

                {/* Label on hover */}
                {isHovered && (
                  <g transform={`translate(${loc.coords.lng + 4}, ${-loc.coords.lat - 2})`}>
                    <rect x="-1" y="-4" width={trip.title.length * 2 + 4} height="8" rx="1" fill="var(--paper)" stroke="var(--mist)" strokeWidth="0.3" />
                    <text fontSize="3" fill="var(--ink)" fontWeight="bold">{trip.title}</text>
                    <text fontSize="2" fill="var(--ink)" opacity="0.5" y="3.5">
                      {new Date(trip.dates.start).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      {trip.rating ? ` · ${'★'.repeat(trip.rating)}` : ''}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Year scrubber */}
        <div className="absolute bottom-4 left-4 right-4 bg-paper/90 backdrop-blur-md rounded-brand border border-mist p-4">
          <div className="flex items-center gap-3">
            <span className="text-[0.75rem] text-ink/50 whitespace-nowrap">Timeline</span>
            <input
              type="range"
              min={0}
              max={years.length - 1}
              value={selectedYear ? years.indexOf(selectedYear) : years.length - 1}
              onChange={(e) => setSelectedYear(years[Number(e.target.value)])}
              className="flex-1 h-2 rounded-full appearance-none bg-mist cursor-pointer accent-ember"
              aria-label="Year scrubber"
              style={{ minHeight: '44px' }}
            />
            <span className="text-[0.85rem] font-medium tabular-nums w-12 text-right">
              {selectedYear || years[years.length - 1]}
            </span>
          </div>
          <div className="flex justify-between mt-1">
            {years.filter((_, i) => i % Math.max(1, Math.floor(years.length / 6)) === 0 || i === years.length - 1).map((y) => (
              <button
                key={y}
                onClick={() => setSelectedYear(y)}
                className="text-[0.65rem] text-ink/30 hover:text-ink/60 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                {y}
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="absolute top-4 right-4 bg-paper/90 backdrop-blur-md rounded-brand border border-mist p-3 space-y-2 text-[0.75rem]">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-ember" />
            <span>Past trip</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border-2 border-ember bg-paper" />
            <span>Upcoming</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border-2 border-dashed border-horizon bg-paper" />
            <span>Idea</span>
          </div>
          <div className="flex items-center gap-2">
            <svg width="12" height="12" viewBox="0 0 12 12">
              <polygon points="6,1 9,7 6,10 3,7" fill="var(--ember)" />
            </svg>
            <span>Home</span>
          </div>
        </div>
      </div>

      {/* Trip list sidebar */}
      <div className="h-48 md:h-56 overflow-y-auto border-t border-mist bg-paper p-4">
        <div className="max-w-content mx-auto flex flex-wrap gap-3">
          {filteredTrips.map((trip) => (
            <Link
              key={trip.id}
              href={`/trips/${trip.id}`}
              className={`px-3 py-2 rounded-brand border text-[0.8rem] min-h-[44px] flex items-center transition-colors ${
                hoveredTrip === trip.id ? 'border-ember bg-ember/5' : 'border-mist hover:border-ember'
              }`}
              onMouseEnter={() => setHoveredTrip(trip.id)}
              onMouseLeave={() => setHoveredTrip(null)}
            >
              <span className={`w-2 h-2 rounded-full mr-2 ${
                trip.status === 'past' ? 'bg-ember' : trip.status === 'upcoming' ? 'bg-ember/50' : 'bg-horizon/50'
              }`} />
              {trip.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

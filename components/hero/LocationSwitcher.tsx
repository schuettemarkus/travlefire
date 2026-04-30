'use client';

import { locations } from '@/data/locations';
import { useStore } from '@/lib/store';

export function LocationSwitcher() {
  const selectedSlug = useStore((s) => s.selectedLocationSlug);
  const setSelected = useStore((s) => s.setSelectedLocation);

  return (
    <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Select a destination">
      {locations.map((loc) => {
        const isSelected = loc.slug === selectedSlug;
        const isHome = loc.slug === 'north-ogden-ut';
        return (
          <button
            key={loc.slug}
            role="tab"
            aria-selected={isSelected}
            onClick={() => setSelected(loc.slug)}
            className={`px-4 py-2 rounded-full text-[0.85rem] font-medium min-h-[44px] transition-all duration-200 ${
              isSelected
                ? 'bg-white text-ink shadow-brand'
                : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
            }`}
          >
            {isHome ? `${loc.name} (Home)` : `${loc.name}, ${loc.country === 'United States' ? loc.region : loc.country}`}
          </button>
        );
      })}
      <button
        className="px-4 py-2 rounded-full text-[0.85rem] font-medium min-h-[44px] bg-white/10 text-white/70 hover:bg-white/20 backdrop-blur-sm border border-white/20 border-dashed transition-all duration-200"
        aria-label="Add a new location"
      >
        + Add location
      </button>
    </div>
  );
}

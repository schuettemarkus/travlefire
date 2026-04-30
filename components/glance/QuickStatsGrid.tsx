'use client';

import { locations } from '@/data/locations';
import { useStore } from '@/lib/store';
import { StatTile } from '@/components/primitives/StatTile';

export function QuickStatsGrid() {
  const selectedSlug = useStore((s) => s.selectedLocationSlug);
  const loc = locations.find((l) => l.slug === selectedSlug);
  if (!loc) return null;

  const now = new Date();
  const monthIndex = now.getMonth();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = monthNames[monthIndex];
  const climate = loc.monthlyClimate[monthIndex];
  const daylight = loc.daylightHoursByMonth[currentMonth];

  return (
    <section className="py-12 md:py-16" aria-label="Quick stats">
      <div className="max-w-content mx-auto px-4 sm:px-6">
        <h2 className="display text-2xl font-bold mb-6">
          {loc.name} at a glance
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <StatTile
            icon="☀️"
            label="Sunshine"
            value={`${climate.sunshineHours}h`}
            sublabel={`${currentMonth} average`}
          />
          <StatTile
            icon="🌬️"
            label="Air Quality"
            value={loc.airQualityIndex < 50 ? 'Good' : loc.airQualityIndex < 100 ? 'Moderate' : 'Poor'}
            sublabel={`AQI ${loc.airQualityIndex}`}
          />
          <StatTile
            icon="💰"
            label="Daily Cost"
            value={`$${loc.budget.dailyMidUSD}`}
            sublabel="Mid-range"
          />
          <StatTile
            icon="🛡️"
            label="Safety"
            value={`${loc.safetyScore}/100`}
            sublabel={loc.safetyScore >= 75 ? 'Good' : 'Moderate'}
          />
          <StatTile
            icon="🌅"
            label="Daylight"
            value={`${daylight.toFixed(1)}h`}
            sublabel={currentMonth}
          />
          <StatTile
            icon="🛂"
            label="Visa"
            value={loc.visa.usPassport === 'visa-free' ? 'Free' : loc.visa.usPassport === 'evisa' ? 'eVisa' : loc.visa.usPassport}
            sublabel={loc.visa.days ? `${loc.visa.days} days` : 'US passport'}
          />
        </div>
      </div>
    </section>
  );
}

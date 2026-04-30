'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { locations } from '@/data/locations';
import { useStore } from '@/lib/store';
import { StatTile } from '@/components/primitives/StatTile';
import { Sparkline } from '@/components/primitives/Sparkline';
import { Activity, Restaurant, ItineraryItem } from '@/types';

const EFFORT_LABELS: Record<string, { text: string; color: string }> = {
  easy: { text: 'Easy', color: 'bg-success/10 text-success' },
  moderate: { text: 'Moderate', color: 'bg-warn/10 text-warn' },
  challenging: { text: 'Challenging', color: 'bg-danger/10 text-danger' },
};

function ActivityCard({ activity, locationSlug }: { activity: Activity; locationSlug: string }) {
  const trips = useStore((s) => s.trips);
  const addToItinerary = useStore((s) => s.addToItinerary);
  const upcomingTrips = trips.filter((t) => t.status === 'upcoming' || t.status === 'idea');
  const effort = EFFORT_LABELS[activity.effortLevel];

  function handleAdd(tripId: string) {
    const item: ItineraryItem = {
      id: `itin-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      tripId,
      day: 1,
      type: 'activity',
      referenceId: activity.id,
      locationSlug,
      timeSlot: 'morning',
    };
    addToItinerary(tripId, item);
  }

  return (
    <div className="rounded-brand border border-mist overflow-hidden bg-paper hover:shadow-brand transition-shadow">
      <div
        className="h-40 bg-cover bg-center"
        style={{ backgroundImage: `url(${activity.image})` }}
      />
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-[1rem] leading-snug">{activity.name}</h3>
          <span className={`shrink-0 text-[0.65rem] px-2 py-0.5 rounded-full font-medium ${effort.color}`}>
            {effort.text}
          </span>
        </div>
        <p className="text-ink/60 text-[0.85rem] leading-relaxed">{activity.description}</p>
        <div className="flex flex-wrap items-center gap-3 text-[0.75rem] text-ink/50">
          <span className="tabular-nums">
            {activity.estimatedCostUSD.low === 0 && activity.estimatedCostUSD.high === 0
              ? 'Free'
              : `$${activity.estimatedCostUSD.low}–$${activity.estimatedCostUSD.high}`}
          </span>
          <span>{activity.durationHours}h</span>
          {activity.bestTime && <span>{activity.bestTime}</span>}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {activity.tags.map((tag) => (
            <span key={tag} className="px-2 py-0.5 rounded-full bg-mist text-[0.7rem] text-ink/50">{tag}</span>
          ))}
        </div>
        {upcomingTrips.length > 0 && (
          <div className="pt-2 border-t border-mist">
            <p className="text-[0.7rem] text-ink/40 mb-1.5">Add to trip:</p>
            <div className="flex flex-wrap gap-1.5">
              {upcomingTrips.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleAdd(t.id)}
                  className="px-3 py-1.5 rounded-full border border-ember/30 text-ember text-[0.7rem] font-medium hover:bg-ember/5 transition-colors min-h-[36px]"
                >
                  + {t.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function RestaurantCard({ restaurant, locationSlug }: { restaurant: Restaurant; locationSlug: string }) {
  const trips = useStore((s) => s.trips);
  const addToItinerary = useStore((s) => s.addToItinerary);
  const upcomingTrips = trips.filter((t) => t.status === 'upcoming' || t.status === 'idea');

  function handleAdd(tripId: string) {
    const item: ItineraryItem = {
      id: `itin-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      tripId,
      day: 1,
      type: 'restaurant',
      referenceId: restaurant.id,
      locationSlug,
      timeSlot: 'evening',
    };
    addToItinerary(tripId, item);
  }

  return (
    <div className="rounded-brand border border-mist overflow-hidden bg-paper hover:shadow-brand transition-shadow">
      <div
        className="h-40 bg-cover bg-center"
        style={{ backgroundImage: `url(${restaurant.image})` }}
      />
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-[1rem] leading-snug">{restaurant.name}</h3>
          <div className="flex items-center gap-1.5 shrink-0">
            {restaurant.organicFocus && (
              <span className="text-[0.65rem] px-2 py-0.5 rounded-full bg-success/15 text-success font-medium">
                Organic
              </span>
            )}
            <span className="text-[0.75rem] text-ink/40 font-medium">{restaurant.priceRange}</span>
          </div>
        </div>
        <p className="text-ink/60 text-[0.85rem] leading-relaxed">{restaurant.description}</p>

        {/* Health rating */}
        <div className="flex items-center gap-2">
          <span className="text-[0.7rem] text-ink/40">Health:</span>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <div
                key={n}
                className={`w-4 h-2 rounded-full ${n <= restaurant.healthRating ? 'bg-success' : 'bg-mist'}`}
              />
            ))}
          </div>
          <span className="text-[0.7rem] text-ink/40 tabular-nums">~${restaurant.avgMealCostUSD}/meal</span>
        </div>

        {/* Specialties */}
        <div>
          <p className="text-[0.7rem] text-ink/40 mb-1">Specialties:</p>
          <div className="flex flex-wrap gap-1.5">
            {restaurant.specialties.map((s) => (
              <span key={s} className="px-2 py-0.5 rounded-full bg-ember/8 text-[0.7rem] text-ember/80">{s}</span>
            ))}
          </div>
        </div>

        {/* Dietary options */}
        <div className="flex flex-wrap gap-1.5">
          {restaurant.dietaryOptions.map((d) => (
            <span key={d} className="px-2 py-0.5 rounded-full bg-mist text-[0.7rem] text-ink/50">{d}</span>
          ))}
        </div>

        {upcomingTrips.length > 0 && (
          <div className="pt-2 border-t border-mist">
            <p className="text-[0.7rem] text-ink/40 mb-1.5">Add to trip:</p>
            <div className="flex flex-wrap gap-1.5">
              {upcomingTrips.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleAdd(t.id)}
                  className="px-3 py-1.5 rounded-full border border-ember/30 text-ember text-[0.7rem] font-medium hover:bg-ember/5 transition-colors min-h-[36px]"
                >
                  + {t.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LocationDetailPage() {
  const params = useParams();
  const loc = locations.find((l) => l.slug === params.slug);

  if (!loc) {
    return (
      <div className="pt-24 pb-16">
        <div className="max-w-content mx-auto px-4 sm:px-6 text-center">
          <h1 className="display text-3xl font-bold mb-4">Location not found</h1>
          <Link href="/" className="text-ember font-medium min-h-[44px] inline-flex items-center">Back home</Link>
        </div>
      </div>
    );
  }

  const monthlyHighs = loc.monthlyClimate.map((c) => c.avgHighF);
  const monthlyLows = loc.monthlyClimate.map((c) => c.avgLowF);

  // Sort restaurants: organic first, then by health rating
  const sortedRestaurants = [...loc.restaurants].sort((a, b) => {
    if (a.organicFocus !== b.organicFocus) return a.organicFocus ? -1 : 1;
    return b.healthRating - a.healthRating;
  });

  return (
    <div className="pt-0 pb-16">
      {/* Full hero */}
      <div
        className="h-[50vh] md:h-[60vh] bg-cover bg-center relative"
        style={{ backgroundImage: `url(${loc.heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-paper via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="max-w-content mx-auto">
            <h1 className="display text-4xl md:text-6xl font-bold text-white mb-2">{loc.name}</h1>
            <p className="text-white/70 text-lg">{loc.country} · {loc.region}</p>
          </div>
        </div>
      </div>

      <div className="max-w-content mx-auto px-4 sm:px-6">
        {/* Quick stats */}
        <section className="py-8 md:py-12">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            <StatTile icon="💰" label="Budget" value={`$${loc.budget.dailyMidUSD}/day`} sublabel="Mid-range" />
            <StatTile icon="🛡️" label="Safety" value={`${loc.safetyScore}/100`} />
            <StatTile icon="🚶" label="Walkability" value={`${loc.walkability}/100`} />
            <StatTile icon="📶" label="Internet" value={`${loc.internetMbps} Mbps`} />
            <StatTile icon="🌬️" label="Air Quality" value={`AQI ${loc.airQualityIndex}`} />
            <StatTile
              icon="🛂"
              label="Visa"
              value={loc.visa.usPassport === 'visa-free' ? 'Free' : loc.visa.usPassport}
              sublabel={loc.visa.days ? `${loc.visa.days} days` : 'US passport'}
            />
          </div>
        </section>

        {/* Top Things To Do */}
        <section className="py-8 md:py-12 border-t border-mist">
          <h2 className="display text-2xl font-bold mb-2">Top things to do</h2>
          <p className="text-ink/50 text-[0.9rem] mb-6">
            Our picks for the best experiences in {loc.name} — from easy strolls to all-day adventures.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loc.activities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} locationSlug={loc.slug} />
            ))}
          </div>
        </section>

        {/* Food & Restaurants */}
        <section className="py-8 md:py-12 border-t border-mist">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-2">
            <div>
              <h2 className="display text-2xl font-bold">Where to eat</h2>
              <p className="text-ink/50 text-[0.9rem] mt-1">
                Health-conscious dining in {loc.name}. Organic and clean options come first.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[0.75rem] text-success">
              <span className="w-2.5 h-2.5 rounded-full bg-success" />
              Organic-focused restaurants highlighted
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {sortedRestaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} locationSlug={loc.slug} />
            ))}
          </div>
        </section>

        {/* Climate */}
        <section className="py-8 md:py-12 border-t border-mist">
          <h2 className="display text-2xl font-bold mb-6">Climate year-round</h2>
          <div className="flex items-center gap-6 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-ember rounded-full" />
              <span className="text-[0.8rem] text-ink/60">Highs</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-horizon rounded-full" />
              <span className="text-[0.8rem] text-ink/60">Lows</span>
            </div>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-2">
            {loc.monthlyClimate.map((c) => (
              <div key={c.month} className="text-center">
                <p className="text-[0.7rem] text-ink/40 mb-1">{c.month}</p>
                <p className="text-ember font-bold tabular-nums text-[0.85rem]">{c.avgHighF}°</p>
                <p className="text-horizon tabular-nums text-[0.75rem]">{c.avgLowF}°</p>
                <div className="mt-1">
                  <div
                    className="mx-auto w-4 bg-gradient-to-t from-horizon to-ember rounded-full"
                    style={{ height: `${(c.avgHighF - c.avgLowF) * 1.5}px` }}
                  />
                </div>
                <p className="text-[0.65rem] text-ink/30 mt-1">{c.rainDays}d rain</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-col sm:flex-row gap-8">
            <div>
              <p className="text-[0.75rem] text-ink/40 mb-1">Annual highs</p>
              <Sparkline data={monthlyHighs} width={200} height={40} color="var(--ember)" />
            </div>
            <div>
              <p className="text-[0.75rem] text-ink/40 mb-1">Annual lows</p>
              <Sparkline data={monthlyLows} width={200} height={40} color="var(--horizon)" />
            </div>
          </div>
        </section>

        {/* Good months & caution */}
        <section className="py-8 md:py-12 border-t border-mist">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="display text-xl font-bold mb-4">Best months to visit</h2>
              <div className="flex flex-wrap gap-2">
                {loc.goodMonths.map((m) => (
                  <span key={m} className="px-3 py-1.5 rounded-full bg-success/10 text-success text-[0.85rem] font-medium">
                    {m}
                  </span>
                ))}
              </div>
            </div>
            {loc.caution.length > 0 && (
              <div>
                <h2 className="display text-xl font-bold mb-4">Good to know</h2>
                <ul className="space-y-2">
                  {loc.caution.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-ink/70">
                      <span className="text-warn mt-0.5">⚠</span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        {/* Tags */}
        <section className="py-8 md:py-12 border-t border-mist">
          <h2 className="display text-xl font-bold mb-4">Vibe tags</h2>
          <div className="flex flex-wrap gap-2">
            {loc.tags.map((tag) => (
              <span key={tag} className="px-3 py-1.5 rounded-full bg-ember/10 text-ember text-[0.85rem] font-medium">
                {tag}
              </span>
            ))}
          </div>
        </section>

        {/* Plan trip CTA */}
        <div className="py-8 text-center">
          <Link
            href="/trips/new"
            className="inline-flex items-center gap-2 px-8 py-4 bg-ember text-white rounded-brand font-medium text-lg hover:bg-ember/90 transition-colors min-h-[44px]"
          >
            Plan a trip to {loc.name}
          </Link>
        </div>
      </div>
    </div>
  );
}

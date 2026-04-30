'use client';

import { HeroBackdrop } from '@/components/hero/HeroBackdrop';
import { NowVsThereOverlay } from '@/components/hero/NowVsThereOverlay';
import { LocationSwitcher } from '@/components/hero/LocationSwitcher';
import { QuickStatsGrid } from '@/components/glance/QuickStatsGrid';
import { UpcomingTripCard } from '@/components/glance/UpcomingTripCard';
import { RecommendationStrip } from '@/components/glance/RecommendationStrip';
import { useStore } from '@/lib/store';
import Link from 'next/link';

export default function HomePage() {
  const trips = useStore((s) => s.trips);
  const upcoming = trips.filter((t) => t.status === 'upcoming');
  const pastTrips = trips.filter((t) => t.status === 'past').slice(0, 4);

  return (
    <div>
      {/* Hero */}
      <HeroBackdrop>
        <NowVsThereOverlay />
        <LocationSwitcher />
      </HeroBackdrop>

      {/* Quick Stats */}
      <QuickStatsGrid />

      {/* Your Next Trip */}
      <section className="py-12 md:py-16 bg-mist/30" aria-label="Your next trip">
        <div className="max-w-content mx-auto px-4 sm:px-6">
          <h2 className="display text-2xl font-bold mb-6">Your next trip</h2>
          {upcoming.length > 0 ? (
            <div className="space-y-4">
              {upcoming.map((trip) => (
                <UpcomingTripCard key={trip.id} trip={trip} />
              ))}
            </div>
          ) : (
            <div className="rounded-brand border-2 border-dashed border-mist p-8 text-center">
              <p className="text-ink/60 mb-4">
                No trips on the horizon yet. Where will your next adventure take you?
              </p>
              <Link
                href="/trips/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-ember text-white rounded-brand font-medium hover:bg-ember/90 transition-colors min-h-[44px]"
              >
                Plan a trip
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Recommendations */}
      <RecommendationStrip />

      {/* Recently Visited */}
      {pastTrips.length > 0 && (
        <section className="py-12 md:py-16" aria-label="Recently visited">
          <div className="max-w-content mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="display text-2xl font-bold">Recently visited</h2>
              <Link href="/trips" className="text-ember text-[0.85rem] font-medium min-h-[44px] flex items-center">
                See all trips
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {pastTrips.map((trip) => (
                <Link
                  key={trip.id}
                  href={`/trips/${trip.id}`}
                  className="rounded-brand border border-mist p-4 hover:shadow-brand transition-shadow min-h-[44px]"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{trip.title}</h3>
                      <p className="text-ink/50 text-[0.85rem]">
                        {new Date(trip.dates.start).toLocaleDateString('en-US', {
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      {trip.rating && (
                        <div className="text-ember text-[0.85rem]">
                          {'★'.repeat(trip.rating)}{'☆'.repeat(5 - trip.rating)}
                        </div>
                      )}
                      {trip.costUSD && (
                        <p className="text-ink/50 text-[0.8rem] tabular-nums">${trip.costUSD.toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Atlas Teaser */}
      <section className="py-12 md:py-16 bg-horizon/5" aria-label="Your travel atlas">
        <div className="max-w-content mx-auto px-4 sm:px-6 text-center">
          <h2 className="display text-2xl font-bold mb-3">Your travel atlas</h2>
          <p className="text-ink/60 mb-6 max-w-lg mx-auto">
            Every trip you have taken, every place you want to go — all on one map.
            Your life as a journey.
          </p>
          <Link
            href="/atlas"
            className="inline-flex items-center gap-2 px-6 py-3 bg-horizon text-white rounded-brand font-medium hover:bg-horizon/90 transition-colors min-h-[44px]"
          >
            Open atlas
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-mist">
        <div className="max-w-content mx-auto px-4 sm:px-6 text-center text-ink/40 text-[0.8rem] space-y-2">
          <p>
            Weather data from{' '}
            <a href="https://open-meteo.com" className="underline hover:text-ink/60" target="_blank" rel="noopener noreferrer">
              Open-Meteo
            </a>{' '}
            · Route data from{' '}
            <a href="https://project-osrm.org" className="underline hover:text-ink/60" target="_blank" rel="noopener noreferrer">
              OSRM
            </a>{' '}
            · Photos from{' '}
            <a href="https://unsplash.com" className="underline hover:text-ink/60" target="_blank" rel="noopener noreferrer">
              Unsplash
            </a>
          </p>
          <p>Travelfire is a prototype. Flight prices are estimates, not bookable fares.</p>
        </div>
      </footer>
    </div>
  );
}

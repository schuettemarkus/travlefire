'use client';

import Link from 'next/link';
import { useStore } from '@/lib/store';
import { Trip } from '@/types';

function TripRow({ trip }: { trip: Trip }) {
  const statusColors: Record<string, string> = {
    past: 'bg-mist text-ink/60',
    upcoming: 'bg-ember/10 text-ember',
    idea: 'bg-horizon/10 text-horizon',
  };

  return (
    <Link
      href={`/trips/${trip.id}`}
      className="block rounded-brand border border-mist p-4 hover:shadow-brand transition-shadow min-h-[44px]"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className={`text-[0.7rem] px-2 py-0.5 rounded-full font-medium ${statusColors[trip.status]}`}>
            {trip.status}
          </span>
          <h3 className="font-medium">{trip.title}</h3>
        </div>
        <div className="flex items-center gap-4 text-[0.85rem] text-ink/50">
          <span>
            {new Date(trip.dates.start).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </span>
          {trip.rating && (
            <span className="text-ember">{'★'.repeat(trip.rating)}</span>
          )}
          {trip.costUSD && (
            <span className="tabular-nums">${trip.costUSD.toLocaleString()}</span>
          )}
          <span className="text-ink/30">{trip.mode}</span>
        </div>
      </div>
    </Link>
  );
}

export default function TripsPage() {
  const trips = useStore((s) => s.trips);

  const upcoming = trips.filter((t) => t.status === 'upcoming');
  const past = trips.filter((t) => t.status === 'past');
  const ideas = trips.filter((t) => t.status === 'idea');

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-content mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="display text-3xl md:text-4xl font-bold">All trips</h1>
            <p className="text-ink/60 mt-1">{trips.length} trips across your travel history</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/trips/import"
              className="px-4 py-2 rounded-brand border border-mist hover:border-ember text-[0.85rem] font-medium transition-colors min-h-[44px] flex items-center"
            >
              Quick add
            </Link>
            <Link
              href="/trips/new"
              className="px-4 py-2 rounded-brand bg-ember text-white text-[0.85rem] font-medium hover:bg-ember/90 transition-colors min-h-[44px] flex items-center"
            >
              Plan a trip
            </Link>
          </div>
        </div>

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <section className="mb-8">
            <h2 className="display text-xl font-bold mb-4">Upcoming ({upcoming.length})</h2>
            <div className="space-y-3">
              {upcoming.map((trip) => <TripRow key={trip.id} trip={trip} />)}
            </div>
          </section>
        )}

        {/* Past */}
        {past.length > 0 && (
          <section className="mb-8">
            <h2 className="display text-xl font-bold mb-4">Past ({past.length})</h2>
            <div className="space-y-3">
              {past.map((trip) => <TripRow key={trip.id} trip={trip} />)}
            </div>
          </section>
        )}

        {/* Ideas */}
        {ideas.length > 0 && (
          <section className="mb-8">
            <h2 className="display text-xl font-bold mb-4">Ideas ({ideas.length})</h2>
            <div className="space-y-3">
              {ideas.map((trip) => <TripRow key={trip.id} trip={trip} />)}
            </div>
          </section>
        )}

        {trips.length === 0 && (
          <div className="rounded-brand border-2 border-dashed border-mist p-12 text-center">
            <p className="text-ink/60 mb-4 text-lg">No trips yet. Your travel story starts here.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/trips/new" className="px-6 py-3 rounded-brand bg-ember text-white font-medium hover:bg-ember/90 transition-colors min-h-[44px]">
                Plan your first trip
              </Link>
              <Link href="/trips/import" className="px-6 py-3 rounded-brand border border-mist hover:border-ember font-medium transition-colors min-h-[44px]">
                Import past trips
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

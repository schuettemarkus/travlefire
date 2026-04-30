'use client';

import Link from 'next/link';
import { Trip } from '@/types';
import { locations } from '@/data/locations';

interface UpcomingTripCardProps {
  trip: Trip;
}

export function UpcomingTripCard({ trip }: UpcomingTripCardProps) {
  const dest = locations.find((l) => l.id === trip.destination || l.slug === trip.destination);
  const startDate = new Date(trip.dates.start);
  const endDate = new Date(trip.dates.end);
  const daysUntil = Math.max(0, Math.ceil((startDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  const tripLength = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <Link
      href={`/trips/${trip.id}`}
      className="block rounded-brand border border-mist bg-paper p-6 hover:shadow-brand transition-shadow min-h-[44px]"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.75rem] font-medium uppercase tracking-wider text-ember mb-1">
            {daysUntil === 0 ? 'Departing today!' : `In ${daysUntil} days`}
          </p>
          <h3 className="display text-xl font-bold">{trip.title}</h3>
          <p className="text-ink/60 mt-1">
            {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} –{' '}
            {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            <span className="text-ink/40"> · {tripLength} nights</span>
          </p>
          {dest && (
            <p className="text-ink/50 text-[0.85rem] mt-1">
              {dest.name}, {dest.country}
            </p>
          )}
        </div>
        <div className="text-right">
          {trip.costUSD && (
            <p className="display text-lg font-bold tabular-nums">${trip.costUSD.toLocaleString()}</p>
          )}
          <p className="text-ink/40 text-[0.8rem]">{trip.travelers} travelers · {trip.mode}</p>
        </div>
      </div>
    </Link>
  );
}

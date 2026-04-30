'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { locations } from '@/data/locations';

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const trips = useStore((s) => s.trips);
  const updateTrip = useStore((s) => s.updateTrip);
  const removeTrip = useStore((s) => s.removeTrip);

  const trip = trips.find((t) => t.id === params.id);

  if (!trip) {
    return (
      <div className="pt-24 pb-16">
        <div className="max-w-content mx-auto px-4 sm:px-6 text-center">
          <h1 className="display text-3xl font-bold mb-4">Trip not found</h1>
          <Link href="/trips" className="text-ember font-medium min-h-[44px] inline-flex items-center">
            Back to all trips
          </Link>
        </div>
      </div>
    );
  }

  const tripId = trip.id;
  const dest = locations.find((l) => l.id === trip.destination || l.slug === trip.destination);
  const startDate = new Date(trip.dates.start);
  const endDate = new Date(trip.dates.end);
  const nights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  function handleDelete() {
    removeTrip(tripId);
    router.push('/trips');
  }

  function handleRating(rating: 1 | 2 | 3 | 4 | 5) {
    updateTrip(tripId, { rating });
  }

  return (
    <div className="pt-24 pb-16">
      {/* Hero */}
      {dest && (
        <div
          className="h-48 md:h-64 bg-cover bg-center relative -mt-8 mb-8"
          style={{ backgroundImage: `url(${dest.heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-paper via-transparent to-transparent" />
        </div>
      )}

      <div className="max-w-content mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`text-[0.7rem] px-2 py-0.5 rounded-full font-medium ${
                trip.status === 'past' ? 'bg-mist text-ink/60' :
                trip.status === 'upcoming' ? 'bg-ember/10 text-ember' :
                'bg-horizon/10 text-horizon'
              }`}>
                {trip.status}
              </span>
              <span className="text-ink/40 text-[0.85rem]">{trip.mode}</span>
            </div>
            <h1 className="display text-3xl md:text-4xl font-bold">{trip.title}</h1>
            <p className="text-ink/60 mt-2">
              {startDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              {' — '}
              {endDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              <span className="text-ink/40"> · {nights} night{nights !== 1 ? 's' : ''} · {trip.travelers} traveler{trip.travelers !== 1 ? 's' : ''}</span>
            </p>
          </div>

          {trip.costUSD && (
            <div className="text-right">
              <p className="text-ink/40 text-[0.8rem]">Total cost</p>
              <p className="display text-3xl font-bold tabular-nums">${trip.costUSD.toLocaleString()}</p>
              <p className="text-ink/40 text-[0.8rem] tabular-nums">${Math.round(trip.costUSD / Math.max(nights, 1))}/night</p>
            </div>
          )}
        </div>

        {/* Rating */}
        <div className="rounded-brand border border-mist p-6 bg-paper mb-6">
          <h2 className="display text-lg font-bold mb-3">How was this trip?</h2>
          <div className="flex gap-2">
            {([1, 2, 3, 4, 5] as const).map((star) => (
              <button
                key={star}
                onClick={() => handleRating(star)}
                className={`text-2xl min-w-[44px] min-h-[44px] flex items-center justify-center rounded-brand transition-colors ${
                  trip.rating && star <= trip.rating ? 'text-ember' : 'text-mist hover:text-ember/50'
                }`}
                aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        {trip.notes && (
          <div className="rounded-brand border border-mist p-6 bg-paper mb-6">
            <h2 className="display text-lg font-bold mb-2">Notes</h2>
            <p className="text-ink/70">{trip.notes}</p>
          </div>
        )}

        {/* Tags */}
        {trip.tags && trip.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {trip.tags.map((tag) => (
              <span key={tag} className="px-3 py-1 rounded-full bg-mist text-[0.8rem] text-ink/60">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Destination link */}
        {dest && (
          <Link
            href={`/locations/${dest.slug}`}
            className="block rounded-brand border border-mist p-4 hover:shadow-brand transition-shadow mb-6 min-h-[44px]"
          >
            <p className="text-[0.75rem] text-ink/40 uppercase tracking-wider mb-1">Destination</p>
            <p className="font-medium">{dest.name}, {dest.country}</p>
          </Link>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-mist">
          <Link
            href="/trips"
            className="px-4 py-2 rounded-brand border border-mist hover:border-ember text-[0.85rem] font-medium transition-colors min-h-[44px] flex items-center justify-center"
          >
            Back to all trips
          </Link>
          <button
            onClick={handleDelete}
            className="px-4 py-2 rounded-brand border border-danger/30 text-danger text-[0.85rem] font-medium hover:bg-danger/5 transition-colors min-h-[44px]"
          >
            Delete trip
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useStore } from '@/lib/store';
import { locations } from '@/data/locations';
import { getRecommendations } from '@/lib/recommend';
import { RecommendationCard } from '@/components/recommendations/RecommendationCard';
import Link from 'next/link';

export default function RecommendationsPage() {
  const profile = useStore((s) => s.profile);
  const trips = useStore((s) => s.trips);
  const recommendations = getRecommendations(profile, trips, locations);

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-content mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="display text-3xl md:text-4xl font-bold">For you</h1>
            <p className="text-ink/60 mt-1">
              Destinations picked for your travel taste, budget, and history.
            </p>
          </div>
          <Link
            href="/profile"
            className="px-4 py-2 rounded-brand border border-mist hover:border-ember text-[0.85rem] font-medium transition-colors min-h-[44px] flex items-center"
          >
            Edit travel profile
          </Link>
        </div>

        {recommendations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((rec) => (
              <RecommendationCard key={rec.locationId} recommendation={rec} />
            ))}
          </div>
        ) : (
          <div className="rounded-brand border-2 border-dashed border-mist p-12 text-center">
            <p className="text-ink/60 mb-4 text-lg">
              Not enough data for personalized picks yet.
            </p>
            <p className="text-ink/40 mb-6">
              Complete your travel profile and add a few past trips to unlock recommendations.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/profile" className="px-6 py-3 rounded-brand bg-ember text-white font-medium hover:bg-ember/90 transition-colors min-h-[44px]">
                Set up profile
              </Link>
              <Link href="/trips/import" className="px-6 py-3 rounded-brand border border-mist hover:border-ember font-medium transition-colors min-h-[44px]">
                Import trips
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

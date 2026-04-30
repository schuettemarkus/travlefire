'use client';

import { useStore } from '@/lib/store';
import { locations } from '@/data/locations';
import { getRecommendations } from '@/lib/recommend';
import { RecommendationCard } from '@/components/recommendations/RecommendationCard';

export function RecommendationStrip() {
  const profile = useStore((s) => s.profile);
  const trips = useStore((s) => s.trips);

  const recommendations = getRecommendations(profile, trips, locations);

  if (recommendations.length === 0) {
    return (
      <section className="py-12 md:py-16" aria-label="Recommendations">
        <div className="max-w-content mx-auto px-4 sm:px-6">
          <h2 className="display text-2xl font-bold mb-2">For you</h2>
          <p className="text-ink/60 mb-6">
            Complete your travel profile to get personalized recommendations.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-16" aria-label="Recommendations">
      <div className="max-w-content mx-auto px-4 sm:px-6">
        <h2 className="display text-2xl font-bold mb-2">For you</h2>
        <p className="text-ink/60 mb-6">Places we think you will love, based on your travel taste.</p>
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-thin">
          {recommendations.slice(0, 6).map((rec) => (
            <div key={rec.locationId} className="snap-start shrink-0 w-[320px]">
              <RecommendationCard recommendation={rec} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

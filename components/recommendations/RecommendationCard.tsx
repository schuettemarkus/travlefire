'use client';

import { useState } from 'react';
import { RecommendationScore } from '@/types';
import { locations } from '@/data/locations';
import { ConfidenceBand } from '@/components/primitives/ConfidenceBand';
import { Money } from '@/components/primitives/Money';
import Link from 'next/link';

interface RecommendationCardProps {
  recommendation: RecommendationScore;
}

export function RecommendationCard({ recommendation: rec }: RecommendationCardProps) {
  const [expanded, setExpanded] = useState(false);
  const loc = locations.find((l) => l.id === rec.locationId);
  if (!loc) return null;

  const signalEntries = Object.entries(rec.signals) as [string, number][];

  return (
    <div className="rounded-brand border border-mist bg-paper overflow-hidden hover:shadow-brand transition-shadow">
      {/* Hero thumbnail */}
      <div
        className="h-40 bg-cover bg-center relative"
        style={{ backgroundImage: `url(${loc.heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="display text-lg font-bold text-white">{loc.name}</h3>
          <p className="text-white/70 text-[0.8rem]">{loc.country}</p>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Score + confidence */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="display text-lg font-bold tabular-nums text-ember">
              {Math.round(rec.score * 100)}%
            </span>
            <span className="text-ink/40 text-[0.8rem]">match</span>
          </div>
          <ConfidenceBand level={rec.confidence} />
        </div>

        {/* Primary reason */}
        <p className="text-[0.9rem] text-ink/80 leading-relaxed">
          {rec.reasons[0]}
        </p>

        {/* Best month + cost */}
        <div className="flex items-center gap-4 text-[0.8rem] text-ink/50">
          <span>Best month: <strong className="text-ink/70">{rec.bestMonth}</strong></span>
          <span>
            <Money amount={rec.projectedCostUSD.low} className="text-ink/70" />–
            <Money amount={rec.projectedCostUSD.high} className="text-ink/70" />
          </span>
        </div>

        {/* Book timing */}
        <p className="text-[0.75rem] text-ink/40">
          Best to book about {rec.bookingSweetSpotDays} days ahead
        </p>

        {/* Why? expander */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-ember text-[0.85rem] font-medium min-h-[44px] min-w-[44px] flex items-center gap-1"
          aria-expanded={expanded}
        >
          {expanded ? 'Less' : 'Why this trip?'}
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          >
            <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        {expanded && (
          <div className="space-y-3 pt-2 border-t border-mist">
            {/* Additional reasons */}
            <ul className="space-y-1">
              {rec.reasons.slice(1).map((r, i) => (
                <li key={i} className="text-[0.85rem] text-ink/70 pl-4 relative before:content-['·'] before:absolute before:left-0 before:text-ember">
                  {r}
                </li>
              ))}
            </ul>

            {/* Signals radar (simplified bar chart) */}
            <div className="space-y-1.5">
              <p className="text-[0.75rem] font-medium text-ink/40 uppercase tracking-wider">Signal breakdown</p>
              {signalEntries.map(([key, val]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="text-[0.7rem] text-ink/50 w-24 shrink-0 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <div className="flex-1 h-2 bg-mist rounded-full overflow-hidden">
                    <div
                      className="h-full bg-ember rounded-full transition-all duration-300"
                      style={{ width: `${Math.round(val * 100)}%` }}
                    />
                  </div>
                  <span className="text-[0.7rem] text-ink/40 tabular-nums w-8 text-right">
                    {Math.round(val * 100)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Link
          href={`/locations/${loc.slug}`}
          className="block text-center py-2 px-4 rounded-brand bg-ember/10 text-ember font-medium text-[0.85rem] hover:bg-ember/20 transition-colors min-h-[44px] flex items-center justify-center"
        >
          Explore {loc.name}
        </Link>
      </div>
    </div>
  );
}

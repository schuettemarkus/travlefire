'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { locations } from '@/data/locations';
import { StatTile } from '@/components/primitives/StatTile';
import { Sparkline } from '@/components/primitives/Sparkline';

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
          <div className="mt-6 flex gap-8">
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

        {/* Highlights */}
        <section className="py-8 md:py-12 border-t border-mist">
          <h2 className="display text-2xl font-bold mb-6">Highlights</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {loc.highlights.map((h, i) => (
              <div key={i} className="rounded-brand border border-mist p-5 bg-paper">
                <h3 className="font-bold mb-1">{h.title}</h3>
                <p className="text-ink/60 text-[0.9rem]">{h.blurb}</p>
              </div>
            ))}
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

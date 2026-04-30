'use client';

import { useState } from 'react';
import { TripCostInputs, TripCostOutput } from '@/types';
import { calculateTripCost } from '@/lib/cost';
import { locations, getHomeLocation } from '@/data/locations';
import { Money } from '@/components/primitives/Money';

interface DriveVsFlyComparatorProps {
  destinationSlug?: string;
}

export function DriveVsFlyComparator({ destinationSlug }: DriveVsFlyComparatorProps) {
  const home = getHomeLocation();
  const dest = destinationSlug
    ? locations.find((l) => l.slug === destinationSlug) || locations[2]
    : locations[2];

  const [travelers, setTravelers] = useState(2);
  const [mpg, setMpg] = useState(30);
  const [gasPrice, setGasPrice] = useState(4.0);
  const [bags, setBags] = useState(1);
  const [rentalDays, setRentalDays] = useState(0);
  const [parkingPerDay, setParkingPerDay] = useState(15);

  const [result, setResult] = useState<TripCostOutput | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCompare() {
    setLoading(true);
    const now = new Date();
    const month = now.toLocaleDateString('en-US', { month: 'long' });

    const inputs: TripCostInputs = {
      origin: home.coords,
      destination: dest.coords,
      travelers,
      vehicle: { mpg },
      gasPriceUSDPerGal: gasPrice,
      flightSearchSeed: { route: `${home.slug}-${dest.slug}`, month },
      bagsChecked: bags,
      rentalCarDays: rentalDays,
      parkingUSDPerDay: parkingPerDay,
    };

    const output = await calculateTripCost(inputs);
    setResult(output);
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-brand border border-mist p-6 bg-paper">
        <h3 className="display text-xl font-bold mb-4">
          {home.name} to {dest.name}
        </h3>

        {/* Input controls */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          <div>
            <label htmlFor="travelers" className="block text-[0.8rem] text-ink/60 mb-1">Travelers</label>
            <input
              id="travelers"
              type="number"
              min={1}
              max={10}
              value={travelers}
              onChange={(e) => setTravelers(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-brand border border-mist bg-paper text-ink min-h-[44px]"
            />
          </div>
          <div>
            <label htmlFor="mpg" className="block text-[0.8rem] text-ink/60 mb-1">Vehicle MPG</label>
            <input
              id="mpg"
              type="number"
              min={10}
              max={60}
              value={mpg}
              onChange={(e) => setMpg(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-brand border border-mist bg-paper text-ink min-h-[44px]"
            />
          </div>
          <div>
            <label htmlFor="gas" className="block text-[0.8rem] text-ink/60 mb-1">Gas ($/gal)</label>
            <input
              id="gas"
              type="number"
              min={2}
              max={8}
              step={0.1}
              value={gasPrice}
              onChange={(e) => setGasPrice(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-brand border border-mist bg-paper text-ink min-h-[44px]"
            />
          </div>
          <div>
            <label htmlFor="bags" className="block text-[0.8rem] text-ink/60 mb-1">Checked bags each</label>
            <input
              id="bags"
              type="number"
              min={0}
              max={4}
              value={bags}
              onChange={(e) => setBags(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-brand border border-mist bg-paper text-ink min-h-[44px]"
            />
          </div>
          <div>
            <label htmlFor="rental" className="block text-[0.8rem] text-ink/60 mb-1">Rental car days</label>
            <input
              id="rental"
              type="number"
              min={0}
              max={30}
              value={rentalDays}
              onChange={(e) => setRentalDays(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-brand border border-mist bg-paper text-ink min-h-[44px]"
            />
          </div>
          <div>
            <label htmlFor="parking" className="block text-[0.8rem] text-ink/60 mb-1">Parking ($/day)</label>
            <input
              id="parking"
              type="number"
              min={0}
              max={50}
              value={parkingPerDay}
              onChange={(e) => setParkingPerDay(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-brand border border-mist bg-paper text-ink min-h-[44px]"
            />
          </div>
        </div>

        <button
          onClick={handleCompare}
          disabled={loading}
          className="w-full py-3 rounded-brand bg-ember text-white font-medium hover:bg-ember/90 transition-colors min-h-[44px] disabled:opacity-50"
        >
          {loading ? 'Calculating...' : 'Compare drive vs fly'}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Recommendation banner */}
          <div className={`rounded-brand p-4 text-center font-medium ${
            result.recommendation.mode === 'drive' ? 'bg-success/10 text-success' : 'bg-horizon/10 text-horizon'
          }`}>
            {result.recommendation.reason}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Drive card */}
            <div className={`rounded-brand border-2 p-6 ${
              result.recommendation.mode === 'drive' ? 'border-success' : 'border-mist'
            }`}>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🚗</span>
                <h4 className="display text-lg font-bold">Drive</h4>
                {result.recommendation.mode === 'drive' && (
                  <span className="text-[0.7rem] px-2 py-0.5 rounded-full bg-success/20 text-success font-medium">Best value</span>
                )}
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-ink/60">Total cost</span>
                  <span className="display text-2xl font-bold"><Money amount={result.drive.totalUSD} /></span>
                </div>
                <div className="flex justify-between text-[0.85rem] text-ink/60">
                  <span>Travel time</span>
                  <span className="tabular-nums">{result.drive.hours} hours</span>
                </div>
                <div className="flex justify-between text-[0.85rem] text-ink/60">
                  <span>Carbon footprint</span>
                  <span className="tabular-nums">{result.drive.kgCO2e} kg CO₂</span>
                </div>
                <hr className="border-mist" />
                <div className="space-y-1">
                  {Object.entries(result.drive.breakdown).map(([label, amt]) => (
                    <div key={label} className="flex justify-between text-[0.8rem] text-ink/50">
                      <span>{label}</span>
                      {amt > 0 && <span className="tabular-nums"><Money amount={amt} /></span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Fly card */}
            <div className={`rounded-brand border-2 p-6 ${
              result.recommendation.mode === 'fly' ? 'border-horizon' : 'border-mist'
            }`}>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">✈️</span>
                <h4 className="display text-lg font-bold">Fly</h4>
                {result.recommendation.mode === 'fly' && (
                  <span className="text-[0.7rem] px-2 py-0.5 rounded-full bg-horizon/20 text-horizon font-medium">Best value</span>
                )}
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-ink/60">Total cost</span>
                  <span className="display text-2xl font-bold"><Money amount={result.fly.totalUSD} /></span>
                </div>
                <div className="flex justify-between text-[0.85rem] text-ink/60">
                  <span>Travel time</span>
                  <span className="tabular-nums">{result.fly.hours} hours</span>
                </div>
                <div className="flex justify-between text-[0.85rem] text-ink/60">
                  <span>Carbon footprint</span>
                  <span className="tabular-nums">{result.fly.kgCO2e} kg CO₂</span>
                </div>
                <hr className="border-mist" />
                <div className="space-y-1">
                  {Object.entries(result.fly.breakdown).map(([label, amt]) => (
                    <div key={label} className="flex justify-between text-[0.8rem] text-ink/50">
                      <span>{label}</span>
                      <span className="tabular-nums"><Money amount={amt} /></span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-[0.7rem] text-ink/30 mt-3 italic">Estimated, not bookable</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

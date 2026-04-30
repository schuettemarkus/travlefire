'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { locations, getHomeLocation } from '@/data/locations';
import { useStore } from '@/lib/store';
import { DriveVsFlyComparator } from '@/components/trips/DriveVsFlyComparator';
import { Trip } from '@/types';

export default function NewTripPage() {
  const router = useRouter();
  const addTrip = useStore((s) => s.addTrip);
  const home = getHomeLocation();

  const [title, setTitle] = useState('');
  const [destinationSlug, setDestinationSlug] = useState('santa-barbara-ca');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [travelers, setTravelers] = useState(2);
  const [mode, setMode] = useState<'drive' | 'fly' | 'mixed' | 'unknown'>('unknown');
  const [budget, setBudget] = useState('');

  function handleSave() {
    const trip: Trip = {
      id: `trip-${Date.now()}`,
      status: startDate && new Date(startDate) > new Date() ? 'upcoming' : 'idea',
      title: title || `Trip to ${locations.find((l) => l.slug === destinationSlug)?.name || 'Somewhere'}`,
      origin: home.slug,
      destination: destinationSlug,
      dates: {
        start: startDate || new Date().toISOString().split('T')[0],
        end: endDate || new Date().toISOString().split('T')[0],
      },
      travelers,
      mode,
      costUSD: budget ? parseInt(budget) : undefined,
    };
    addTrip(trip);
    router.push('/trips');
  }

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-content mx-auto px-4 sm:px-6">
        <h1 className="display text-3xl md:text-4xl font-bold mb-2">Plan a new trip</h1>
        <p className="text-ink/60 mb-8">Compare costs, pick your dates, and save your plans.</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Trip details form */}
          <div className="space-y-6">
            <div className="rounded-brand border border-mist p-6 bg-paper space-y-4">
              <h2 className="display text-xl font-bold">Trip details</h2>

              <div>
                <label htmlFor="title" className="block text-[0.8rem] text-ink/60 mb-1">Trip name</label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Summer in Santa Barbara"
                  className="w-full px-3 py-2 rounded-brand border border-mist bg-paper text-ink min-h-[44px]"
                />
              </div>

              <div>
                <label htmlFor="destination" className="block text-[0.8rem] text-ink/60 mb-1">Destination</label>
                <select
                  id="destination"
                  value={destinationSlug}
                  onChange={(e) => setDestinationSlug(e.target.value)}
                  className="w-full px-3 py-2 rounded-brand border border-mist bg-paper text-ink min-h-[44px]"
                >
                  {locations.filter((l) => l.slug !== home.slug).map((l) => (
                    <option key={l.slug} value={l.slug}>{l.name}, {l.country}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-[0.8rem] text-ink/60 mb-1">Start date</label>
                  <input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-brand border border-mist bg-paper text-ink min-h-[44px]"
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-[0.8rem] text-ink/60 mb-1">End date</label>
                  <input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-brand border border-mist bg-paper text-ink min-h-[44px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="numTravelers" className="block text-[0.8rem] text-ink/60 mb-1">Travelers</label>
                  <input
                    id="numTravelers"
                    type="number"
                    min={1}
                    max={10}
                    value={travelers}
                    onChange={(e) => setTravelers(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-brand border border-mist bg-paper text-ink min-h-[44px]"
                  />
                </div>
                <div>
                  <label htmlFor="budget" className="block text-[0.8rem] text-ink/60 mb-1">Budget ($)</label>
                  <input
                    id="budget"
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="3,500"
                    className="w-full px-3 py-2 rounded-brand border border-mist bg-paper text-ink min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[0.8rem] text-ink/60 mb-2">How will you get there?</label>
                <div className="flex gap-2">
                  {(['drive', 'fly', 'mixed', 'unknown'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className={`px-4 py-2 rounded-brand text-[0.85rem] font-medium min-h-[44px] transition-colors ${
                        mode === m ? 'bg-ember text-white' : 'border border-mist hover:border-ember'
                      }`}
                    >
                      {m === 'drive' ? '🚗 Drive' : m === 'fly' ? '✈️ Fly' : m === 'mixed' ? '🔄 Mixed' : '❓ Not sure'}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSave}
                className="w-full py-3 rounded-brand bg-ember text-white font-medium hover:bg-ember/90 transition-colors min-h-[44px]"
              >
                Save trip
              </button>
            </div>
          </div>

          {/* Drive vs Fly comparator */}
          <div>
            <DriveVsFlyComparator destinationSlug={destinationSlug} />
          </div>
        </div>
      </div>
    </div>
  );
}

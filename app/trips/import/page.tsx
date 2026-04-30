'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { parseQuickTrip, parsedTripToTrip, parseCSVTrips, ParsedTrip } from '@/lib/parseQuickTrip';

export default function ImportTripsPage() {
  const router = useRouter();
  const addTrip = useStore((s) => s.addTrip);

  const [freeText, setFreeText] = useState('');
  const [parsedTrips, setParsedTrips] = useState<ParsedTrip[]>([]);
  const [csvDrag, setCsvDrag] = useState(false);

  function handleParse() {
    if (!freeText.trim()) return;
    const lines = freeText.split('\n').filter((l) => l.trim());
    const parsed = lines.map(parseQuickTrip);
    setParsedTrips((prev) => [...prev, ...parsed]);
    setFreeText('');
  }

  function handleCSVDrop(e: React.DragEvent) {
    e.preventDefault();
    setCsvDrag(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const csv = evt.target?.result as string;
      const parsed = parseCSVTrips(csv);
      setParsedTrips((prev) => [...prev, ...parsed]);
    };
    reader.readAsText(file);
  }

  function handleCSVInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const csv = evt.target?.result as string;
      const parsed = parseCSVTrips(csv);
      setParsedTrips((prev) => [...prev, ...parsed]);
    };
    reader.readAsText(file);
  }

  function handleRemove(index: number) {
    setParsedTrips((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSaveAll() {
    for (const parsed of parsedTrips) {
      const destId = parsed.destination.toLowerCase().replace(/[\s,]+/g, '-');
      const trip = parsedTripToTrip(parsed, destId);
      addTrip(trip);
    }
    router.push('/trips');
  }

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setCsvDrag(true);
  }, []);

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-content mx-auto px-4 sm:px-6">
        <h1 className="display text-3xl md:text-4xl font-bold mb-2">Add past trips</h1>
        <p className="text-ink/60 mb-8">
          Quickly fill in your travel history. Type freely — we will parse the details for you.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input section */}
          <div className="space-y-6">
            {/* Free-text composer */}
            <div className="rounded-brand border border-mist p-6 bg-paper">
              <h2 className="display text-xl font-bold mb-2">Quick add</h2>
              <p className="text-ink/50 text-[0.85rem] mb-4">
                Type something like &quot;Cabo, March 2023, $1,800, loved it&quot; — one trip per line.
              </p>
              <textarea
                value={freeText}
                onChange={(e) => setFreeText(e.target.value)}
                placeholder={"Cabo, March 2023, $1,800, loved it\nParis, October 2022, $4,500, amazing\nDenver, June 2024, $800, good"}
                rows={5}
                className="w-full px-3 py-2 rounded-brand border border-mist bg-paper text-ink resize-none min-h-[120px]"
                aria-label="Free-text trip entries"
              />
              <button
                onClick={handleParse}
                disabled={!freeText.trim()}
                className="mt-3 w-full py-3 rounded-brand bg-ember text-white font-medium hover:bg-ember/90 transition-colors min-h-[44px] disabled:opacity-50"
              >
                Parse trips
              </button>
            </div>

            {/* CSV drop zone */}
            <div
              className={`rounded-brand border-2 border-dashed p-8 text-center transition-colors ${
                csvDrag ? 'border-ember bg-ember/5' : 'border-mist'
              }`}
              onDragOver={onDragOver}
              onDragLeave={() => setCsvDrag(false)}
              onDrop={handleCSVDrop}
            >
              <p className="text-ink/60 mb-3">Drop a CSV file here, or</p>
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-brand border border-mist hover:border-ember cursor-pointer transition-colors min-h-[44px]">
                <span className="text-[0.85rem] font-medium">Choose file</span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCSVInput}
                  className="sr-only"
                />
              </label>
              <p className="text-ink/40 text-[0.75rem] mt-3">
                Format: destination, start, end, cost, rating, notes
              </p>
            </div>
          </div>

          {/* Parsed results */}
          <div>
            <h2 className="display text-xl font-bold mb-4">
              {parsedTrips.length > 0
                ? `${parsedTrips.length} trip${parsedTrips.length > 1 ? 's' : ''} ready`
                : 'Parsed trips will appear here'}
            </h2>

            {parsedTrips.length === 0 && (
              <div className="rounded-brand border-2 border-dashed border-mist p-8 text-center text-ink/40">
                <p>Type a trip above and click &quot;Parse trips&quot; to see it appear here.</p>
              </div>
            )}

            <div className="space-y-3">
              {parsedTrips.map((trip, i) => (
                <div key={i} className="rounded-brand border border-mist p-4 bg-paper space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-medium">{trip.destination || 'Unknown destination'}</h3>
                    <button
                      onClick={() => handleRemove(i)}
                      className="text-danger text-[0.8rem] min-w-[44px] min-h-[44px] flex items-center justify-center"
                      aria-label={`Remove ${trip.destination}`}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-3 text-[0.8rem] text-ink/60">
                    {trip.month && <span>Date: {trip.month}</span>}
                    {trip.costUSD && <span>Cost: ${trip.costUSD.toLocaleString()}</span>}
                    {trip.rating && (
                      <span className="text-ember">
                        {'★'.repeat(trip.rating)}{'☆'.repeat(5 - trip.rating)}
                      </span>
                    )}
                  </div>
                  <p className="text-[0.75rem] text-ink/30">Raw: &quot;{trip.raw}&quot;</p>
                </div>
              ))}
            </div>

            {parsedTrips.length > 0 && (
              <button
                onClick={handleSaveAll}
                className="mt-6 w-full py-3 rounded-brand bg-success text-white font-medium hover:bg-success/90 transition-colors min-h-[44px]"
              >
                Save all {parsedTrips.length} trips
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

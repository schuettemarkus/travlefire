'use client';

import { useStore } from '@/lib/store';
import { TasteProfile } from '@/types';

const VIBE_LABELS: { key: keyof TasteProfile['vibes']; left: string; right: string }[] = [
  { key: 'beachVsMountain', left: 'Beach', right: 'Mountain' },
  { key: 'cityVsNature', left: 'City', right: 'Nature' },
  { key: 'culturalVsAdventure', left: 'Cultural', right: 'Adventure' },
  { key: 'foodieVsWellness', left: 'Foodie', right: 'Wellness' },
  { key: 'livelyVsQuiet', left: 'Lively', right: 'Quiet' },
  { key: 'luxVsRugged', left: 'Luxury', right: 'Rugged' },
  { key: 'planVsWander', left: 'Plan everything', right: 'Wander freely' },
];

const TRAVELING_WITH = ['Solo', 'Partner', 'Kids', 'Multi-gen family', 'Friends'];

export default function ProfilePage() {
  const profile = useStore((s) => s.profile);
  const updateProfile = useStore((s) => s.updateProfile);

  function updateVibe(key: keyof TasteProfile['vibes'], value: number) {
    updateProfile({ vibes: { ...profile.vibes, [key]: value } });
  }

  function updateClimate(key: keyof TasteProfile['climate'], value: number | boolean) {
    updateProfile({ climate: { ...profile.climate, [key]: value } });
  }

  function updateConstraint(key: keyof TasteProfile['constraints'], value: number | string | boolean | string[]) {
    updateProfile({ constraints: { ...profile.constraints, [key]: value } });
  }

  function toggleTravelingWith(item: string) {
    const current = profile.constraints.travelingWith;
    const lower = item.toLowerCase().replace(/\s+/g, '-');
    const updated = current.includes(lower)
      ? current.filter((c) => c !== lower)
      : [...current, lower];
    updateConstraint('travelingWith', updated);
  }

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-content mx-auto px-4 sm:px-6">
        <h1 className="display text-3xl md:text-4xl font-bold mb-2">Travel taste profile</h1>
        <p className="text-ink/60 mb-8">
          Help us understand what you love. This shapes all your recommendations.
        </p>

        {/* Vibe Sliders */}
        <section className="rounded-brand border border-mist p-6 bg-paper mb-8">
          <h2 className="display text-xl font-bold mb-6">Your travel vibe</h2>
          <div className="space-y-6">
            {VIBE_LABELS.map(({ key, left, right }) => (
              <div key={key}>
                <div className="flex justify-between text-[0.85rem] mb-2">
                  <span className={profile.vibes[key] < 50 ? 'font-medium text-ember' : 'text-ink/50'}>{left}</span>
                  <span className={profile.vibes[key] > 50 ? 'font-medium text-ember' : 'text-ink/50'}>{right}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={profile.vibes[key]}
                  onChange={(e) => updateVibe(key, Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none bg-mist cursor-pointer accent-ember"
                  aria-label={`${left} versus ${right}`}
                  style={{ minHeight: '44px' }}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Climate Preferences */}
        <section className="rounded-brand border border-mist p-6 bg-paper mb-8">
          <h2 className="display text-xl font-bold mb-6">Climate preferences</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-[0.85rem] text-ink/60 mb-2">
                Ideal temperature range: {profile.climate.idealTempLowF}°F – {profile.climate.idealTempHighF}°F
              </label>
              <div className="flex gap-4 items-center">
                <span className="text-[0.8rem] text-ink/40 tabular-nums w-12">{profile.climate.idealTempLowF}°F</span>
                <input
                  type="range"
                  min={30}
                  max={100}
                  value={profile.climate.idealTempLowF}
                  onChange={(e) => updateClimate('idealTempLowF', Number(e.target.value))}
                  className="flex-1 h-2 rounded-full appearance-none bg-mist cursor-pointer accent-horizon"
                  aria-label="Minimum ideal temperature"
                  style={{ minHeight: '44px' }}
                />
                <input
                  type="range"
                  min={30}
                  max={100}
                  value={profile.climate.idealTempHighF}
                  onChange={(e) => updateClimate('idealTempHighF', Number(e.target.value))}
                  className="flex-1 h-2 rounded-full appearance-none bg-mist cursor-pointer accent-ember"
                  aria-label="Maximum ideal temperature"
                  style={{ minHeight: '44px' }}
                />
                <span className="text-[0.8rem] text-ink/40 tabular-nums w-12">{profile.climate.idealTempHighF}°F</span>
              </div>
            </div>

            <div>
              <label className="block text-[0.85rem] text-ink/60 mb-2">
                Humidity tolerance: {profile.climate.humidityTolerance}%
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={profile.climate.humidityTolerance}
                onChange={(e) => updateClimate('humidityTolerance', Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none bg-mist cursor-pointer accent-ember"
                aria-label="Humidity tolerance"
                style={{ minHeight: '44px' }}
              />
            </div>

            <div>
              <label className="block text-[0.85rem] text-ink/60 mb-2">
                Sunshine importance: {profile.climate.sunshineImportance}%
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={profile.climate.sunshineImportance}
                onChange={(e) => updateClimate('sunshineImportance', Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none bg-mist cursor-pointer accent-ember"
                aria-label="Sunshine importance"
                style={{ minHeight: '44px' }}
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => updateClimate('escapeHomeWeather', !profile.climate.escapeHomeWeather)}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors min-h-[44px] min-w-[56px] ${
                  profile.climate.escapeHomeWeather ? 'bg-ember' : 'bg-mist'
                }`}
                role="switch"
                aria-checked={profile.climate.escapeHomeWeather}
                aria-label="Travel to escape home weather"
              >
                <span className={`inline-block h-6 w-6 rounded-full bg-white transition-transform shadow ${
                  profile.climate.escapeHomeWeather ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
              <span className="text-[0.85rem]">I travel to escape my home weather</span>
            </div>
          </div>
        </section>

        {/* Constraints */}
        <section className="rounded-brand border border-mist p-6 bg-paper mb-8">
          <h2 className="display text-xl font-bold mb-6">Travel constraints</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="budget" className="block text-[0.85rem] text-ink/60 mb-1">Annual travel budget</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40">$</span>
                <input
                  id="budget"
                  type="number"
                  value={profile.constraints.annualBudgetUSD}
                  onChange={(e) => updateConstraint('annualBudgetUSD', Number(e.target.value))}
                  className="w-full pl-7 pr-3 py-2 rounded-brand border border-mist bg-paper text-ink min-h-[44px]"
                />
              </div>
            </div>
            <div>
              <label htmlFor="tripDays" className="block text-[0.85rem] text-ink/60 mb-1">Typical trip length (days)</label>
              <input
                id="tripDays"
                type="number"
                min={1}
                max={60}
                value={profile.constraints.typicalTripDays}
                onChange={(e) => updateConstraint('typicalTripDays', Number(e.target.value))}
                className="w-full px-3 py-2 rounded-brand border border-mist bg-paper text-ink min-h-[44px]"
              />
            </div>
            <div>
              <label htmlFor="maxTravel" className="block text-[0.85rem] text-ink/60 mb-1">Max one-way travel time (hours)</label>
              <input
                id="maxTravel"
                type="number"
                min={1}
                max={48}
                value={profile.constraints.maxTravelTimeHours}
                onChange={(e) => updateConstraint('maxTravelTimeHours', Number(e.target.value))}
                className="w-full px-3 py-2 rounded-brand border border-mist bg-paper text-ink min-h-[44px]"
              />
            </div>
            <div>
              <label htmlFor="passport" className="block text-[0.85rem] text-ink/60 mb-1">Passport status</label>
              <select
                id="passport"
                value={profile.constraints.passportStatus}
                onChange={(e) => updateConstraint('passportStatus', e.target.value)}
                className="w-full px-3 py-2 rounded-brand border border-mist bg-paper text-ink min-h-[44px]"
              >
                <option value="us">US passport</option>
                <option value="other">Other passport</option>
                <option value="none">No passport</option>
              </select>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-[0.85rem] text-ink/60 mb-3">Traveling with</p>
            <div className="flex flex-wrap gap-2">
              {TRAVELING_WITH.map((item) => {
                const val = item.toLowerCase().replace(/\s+/g, '-');
                const selected = profile.constraints.travelingWith.includes(val);
                return (
                  <button
                    key={item}
                    onClick={() => toggleTravelingWith(item)}
                    className={`px-4 py-2 rounded-full text-[0.85rem] font-medium min-h-[44px] transition-colors ${
                      selected ? 'bg-ember text-white' : 'border border-mist hover:border-ember'
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={() => updateConstraint('petFriendly', !profile.constraints.petFriendly)}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors min-h-[44px] min-w-[56px] ${
                profile.constraints.petFriendly ? 'bg-ember' : 'bg-mist'
              }`}
              role="switch"
              aria-checked={profile.constraints.petFriendly}
              aria-label="Pet-friendly required"
            >
              <span className={`inline-block h-6 w-6 rounded-full bg-white transition-transform shadow ${
                profile.constraints.petFriendly ? 'translate-x-7' : 'translate-x-1'
              }`} />
            </button>
            <span className="text-[0.85rem]">Pet-friendly required</span>
          </div>
        </section>

        {/* Visual Taste Capture */}
        <section className="rounded-brand border border-mist p-6 bg-paper">
          <h2 className="display text-xl font-bold mb-2">Visual taste</h2>
          <p className="text-ink/50 text-[0.85rem] mb-6">
            Tap the image that pulls you in. This helps diversify your recommendations.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { a: { label: 'Tropical beach sunset', img: '🏖️' }, b: { label: 'Snow-capped mountain lodge', img: '🏔️' } },
              { a: { label: 'Bustling city market', img: '🏙️' }, b: { label: 'Quiet forest cabin', img: '🌲' } },
              { a: { label: 'Historic cobblestone streets', img: '🏛️' }, b: { label: 'Kayaking through rapids', img: '🛶' } },
              { a: { label: 'Farm-to-table dinner', img: '🍽️' }, b: { label: 'Sunrise yoga retreat', img: '🧘' } },
              { a: { label: 'Night market lanterns', img: '🏮' }, b: { label: 'Stargazing in the desert', img: '🌌' } },
              { a: { label: 'Boutique hotel pool', img: '🏊' }, b: { label: 'Tent on a cliff edge', img: '⛺' } },
            ].map((pair, i) => {
              const selected = profile.visualTaste[i];
              return (
                <div key={i} className="flex gap-2">
                  <button
                    onClick={() => {
                      const updated = [...profile.visualTaste];
                      updated[i] = 0;
                      updateProfile({ visualTaste: updated });
                    }}
                    className={`flex-1 rounded-brand p-4 text-center text-3xl min-h-[80px] transition-all ${
                      selected === 0 ? 'ring-2 ring-ember bg-ember/5' : 'border border-mist hover:border-ember'
                    }`}
                    aria-label={pair.a.label}
                    aria-pressed={selected === 0}
                  >
                    <span className="block text-4xl mb-1">{pair.a.img}</span>
                    <span className="text-[0.75rem] text-ink/60">{pair.a.label}</span>
                  </button>
                  <button
                    onClick={() => {
                      const updated = [...profile.visualTaste];
                      updated[i] = 1;
                      updateProfile({ visualTaste: updated });
                    }}
                    className={`flex-1 rounded-brand p-4 text-center text-3xl min-h-[80px] transition-all ${
                      selected === 1 ? 'ring-2 ring-ember bg-ember/5' : 'border border-mist hover:border-ember'
                    }`}
                    aria-label={pair.b.label}
                    aria-pressed={selected === 1}
                  >
                    <span className="block text-4xl mb-1">{pair.b.img}</span>
                    <span className="text-[0.75rem] text-ink/60">{pair.b.label}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

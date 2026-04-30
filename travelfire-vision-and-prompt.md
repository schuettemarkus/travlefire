# Travelfire — Vision & Claude Code Build Prompt

> A single-file source of truth: the scoped product vision (Part 1) and the copy-paste-ready prompt for Claude Code (Part 2).
> Stack: **Next.js 14 (App Router) + TypeScript + Tailwind CSS**. Hybrid data (free APIs + rich seeded mocks). Polished frontend prototype with localStorage persistence. Cinematic editorial visual direction.

---

## Part 1 — The Scoped Vision

### 1.1 Product story

Travelfire is a calm, cinematic travel research and planning workspace. It does for personal travel what Apple Weather did for forecasts: takes a fragmented, anxiety-inducing experience and turns it into something beautiful, glanceable, and confidence-building. It is opinionated where Nomadlist is data-dense, and approachable where Kayak is utilitarian. It is the home page a traveling family of any age opens with their morning coffee.

The product holds three jobs at once:
1. **Dream** — surface places worth going, with a recommendation engine that actually understands the traveler.
2. **Decide** — answer the boring-but-critical questions (Drive or fly? When to book? How does it feel there in May?) without leaving the page.
3. **Remember** — make every past trip a pin on a personal atlas, so the app gets smarter the more you use it.

### 1.2 Users

Primary persona is a multi-generational household — adults 30–75 — with the explicit constraint that the experience must feel native to a 55+ user. That drives several non-negotiables: 18px minimum body type, WCAG AA contrast everywhere (AAA on body text), tap targets ≥44px, plain-language labels (no jargon like "DCM" or "shoulder season" without an inline definition), reduced-motion support, and zero hover-only affordances.

### 1.3 Information architecture

```
/                       Home — hero + location switcher + glance cards
/locations/[slug]       Location deep-dive (Nomadlist-style stats, cinematic)
/trips                  All trips — list + map toggle
/trips/new              Plan a new trip (with Drive vs Fly comparator)
/trips/import           Quick add past trips (paste, type, or CSV)
/trips/[id]             Trip detail
/recommendations        Engine output with explainability
/profile                Travel taste profile
/atlas                  Full-screen personal travel map
```

### 1.4 The five must-have standout features

These are the load-bearing features. Everything else supports them.

**Feature 1 — Live "Now vs There" hero.**
The home page hero is a full-bleed photograph or short looping video of the currently selected location. Overlaid in the lower-third are two temperature dials: the user's home weather (North Ogden, by default) and the destination's weather, with a delta and a 7-day sparkline. Pulled live from Open-Meteo. The hero crossfades when a new location is selected — same component, new image, new numbers, no page reload.

**Feature 2 — Drive vs Fly cost & time comparator.**
Given an origin and destination, computes:
- Driving: route distance via OSRM, fuel cost from the user's vehicle MPG and a configurable gas price, IRS mileage-rate "true cost" alternative, total drive time, overnight hotel stops if >9 hours, food on the road.
- Flying: estimated airfare (seeded by route + season, with a "live-ish" jitter), drive-to-airport, parking, checked bag, ground transport at destination, optional rental car.
- Outputs total **dollars**, total **door-to-door hours**, **kgCO₂e**, and a one-line recommendation ("Drive: saves $342 and 1 hr vs flying when 2+ travelers").

**Feature 3 — World-class recommendation engine with explainability.**
See Section 1.6 for the three-iteration design. Every recommendation card answers "Why this trip for me, right now?" in one sentence ("You love beach + 75°F, Santa Barbara hits both in late May, and flights are tracking 23% below 90-day average").

**Feature 4 — One-tap past-trip backfill.**
A traveler can populate years of history in five minutes: a "Quick Add" composer accepts free-text ("Cabo, March 2023, $1,800, loved it"), parses it into a structured trip, geocodes the location, attaches a hero photo, and pins it to the atlas. CSV import for power users. Bulk-edit table view.

**Feature 5 — Personal travel atlas.**
A full-screen Mapbox/MapLibre map showing every past, upcoming, and recommended trip as color-coded pins, with route lines from home, hover cards, and a year-slider scrubber that animates trips chronologically. This is the emotional hook — your life as a map.

### 1.5 Travel taste profile

A short, mostly-visual onboarding that produces a vector the engine can score against. Three steps:

**Step 1 — Vibe sliders (continuous 0–100):**
Beach ↔ Mountain · City ↔ Nature · Cultural ↔ Adventure · Foodie ↔ Wellness · Lively ↔ Quiet · Lux ↔ Rugged · Plan-everything ↔ Wander.

**Step 2 — Climate preference:**
Ideal travel temperature range (e.g., 65°F–80°F), humidity tolerance, sunshine importance, and "do you travel to escape your home weather?" yes/no — the latter inverts the home-vs-there delta scoring.

**Step 3 — Constraints:**
Annual travel budget, typical trip length, max one-way travel time (hours), passport status, mobility considerations, traveling-with (solo / partner / kids / multi-gen), pet-friendly required.

**Step 4 — Visual taste capture:**
Six pairs of destination photos; the user taps the one that pulls them in. Used purely for diversifying recommendations — never the sole signal.

The profile is editable any time and a small "Profile influence" badge appears on every recommendation showing which signals drove it.

### 1.6 Recommendation engine — three iterations

The user asked for three iterations before locking. Here they are.

**Iteration 1 — Naive weighted score (the strawman).**
Inputs: destination's monthly average temperature, cost-of-living index, safety score, internet speed, distance from home.
Score = 0.3·tempMatch + 0.2·cost + 0.2·safety + 0.15·internet + 0.15·proximity.
Output: ranked list of locations.
*Why it's not enough:* it doesn't know the user. It will recommend the same places to a beach lover and a mountaineer. It uses annual averages, so it will recommend Phoenix in July. It has no concept of "when should I book" or "is this a good moment."

**Iteration 2 — Taste profile + temporal awareness.**
Inputs add: the taste-profile vector, a target travel month (or "any time in next 6 months"), home-weather-at-that-time, destination-weather-at-that-time, an estimated booking-window signal, and a price-trend signal (mocked: % below/above 90-day avg).
Score = w₁·tasteVectorCosineSimilarity + w₂·tempPreferenceMatch(at travel month) + w₃·homeVsThereDelta(if escape-mode) + w₄·budgetFit + w₅·safetyFloor + w₆·priceTrendSignal + w₇·proximityIfShortTrip.
Each weight is itself derived from the profile (e.g., budgetFit weight ↑ if their budget is tight).
*Why it's not enough:* it has no memory. It will keep recommending Cabo to someone who has been to Cabo three times. It gives no reason for its picks.

**Iteration 3 — Diversity, learning, and explainability (the lock).**
Adds:
- **Affinity learning:** every past trip gets a 1–5 star rating (and optional tags). Locations similar to highly-rated trips (by climate, biome, vibe-vector, region) get an affinity bonus; similar to low-rated trips get a penalty.
- **Diversity penalty:** discount candidates that overlap heavily with the user's last 3 trips (region, biome, vibe). Encourages range.
- **Novelty bonus:** small bonus for biomes/regions never visited.
- **Trend signal:** mocked weekly trend ("+18% search this week", "Aurora forecast active"), nudges score by ≤5%.
- **Confidence band:** every recommendation carries a confidence (Low/Med/High) based on how much profile data and history exist. Low-confidence picks get an honest disclaimer.
- **Explainability:** the engine returns the top three contributing factors per pick as human sentences, surfaced on the card. Examples:
  - "You love mountain + 70°F hikes — Banff in late June matches both."
  - "You haven't been to South America yet, and Mendoza fits your budget and wine-foodie tastes."
  - "Flights to Lisbon are tracking 19% below their 90-day average for September."
- **Booking sweet-spot:** for any candidate, return the recommended booking window in days-from-now and the projected price band.

Final scoring shape (TypeScript):
```ts
type RecommendationScore = {
  locationId: string;
  score: number;            // 0..1
  confidence: 'low' | 'med' | 'high';
  bestMonth: string;        // ISO month
  projectedCostUSD: { low: number; mid: number; high: number };
  bookingSweetSpotDays: number;
  reasons: string[];        // 2-4 plain-English sentences
  signals: {
    tasteMatch: number; tempMatch: number; deltaFromHome: number;
    budgetFit: number; affinity: number; diversity: number;
    novelty: number; priceTrend: number;
  };
};
```

The page renders cards sorted by `score`, with a "Why?" expander that shows the `signals` as a tiny radar chart for power users — but the headline is always the human sentence.

### 1.7 Drive vs Fly comparator — the model

```ts
type TripCostInputs = {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  travelers: number;
  vehicle: { mpg: number; tankUSD?: number };
  gasPriceUSDPerGal: number;       // user-editable, default by state
  flightSearchSeed: { route: string; month: string };
  bagsChecked: number;
  rentalCarDays: number;
  parkingUSDPerDay: number;
  hotelOvernightUSD?: number;       // applied if drive > 9 hrs
};

type TripCostOutput = {
  drive: { totalUSD: number; hours: number; kgCO2e: number; breakdown: Record<string, number> };
  fly:   { totalUSD: number; hours: number; kgCO2e: number; breakdown: Record<string, number> };
  recommendation: { mode: 'drive' | 'fly'; reason: string; savingsUSD: number; timeDeltaHours: number };
};
```

Distances and route times come from OSRM's free public endpoint (with a graceful fallback to a haversine + average-speed estimate if the call fails). Fly cost uses a deterministic seeded estimator (route + month + airline-class) that produces believable numbers — clearly labeled "Estimated, not bookable."

### 1.8 Visual system — Cinematic Editorial

**Typography:**
- Display: **Fraunces** (variable serif, optical size 144) — used for hero headlines and section titles.
- UI/Body: **Inter** at 18px base, 1.55 line height.
- Numerals: tabular for all stats.

**Color (light mode primary, dark variant included):**
- `--ink` `#1B1A17` — primary text, near-black warm.
- `--paper` `#FAF7F2` — page background, warm off-white.
- `--ember` `#D4622A` — primary accent (flag plant for Travelfire — the spark in "fire").
- `--horizon` `#2E5266` — secondary accent, deep teal-navy.
- `--mist` `#E5E0D7` — subtle dividers, card backs.
- `--success` `#3F7D5C`, `--warn` `#C99A2E`, `--danger` `#A33B2A`.

**Spacing & layout:**
- 8-pt spacing scale, 12-column grid, max content width 1280px.
- Hero is full-bleed at 100vh on desktop, 70vh on mobile.
- Generous whitespace: section vertical rhythm 96px desktop, 64px mobile.

**Motion:**
- 240ms standard ease-out for crossfades.
- Hero parallax limited to 12px translation; disabled under `prefers-reduced-motion`.
- No spring-bounce or elastic effects (reads as juvenile to older users).

**Imagery:**
- Always high-resolution, color-graded toward warm/golden hour.
- Use Unsplash Source for seeded hero images keyed by location slug.

### 1.9 Accessibility (55+ baseline, helps everyone)

- Body text 18px minimum, scalable via OS settings without breakage up to 200%.
- WCAG AA contrast minimum, AAA on body text.
- Focus rings visible and 2px solid at all times.
- All interactive controls ≥44×44px tap target.
- No hover-only disclosures; same affordance must work on touch and keyboard.
- Plain-language toggles ("Cheap month to book" not "Booking sweet spot").
- An always-available "Make text larger" button in the header.
- `prefers-reduced-motion` disables crossfades and parallax.
- All form fields have visible labels (no placeholder-as-label).
- Date entry uses native date pickers with month/year dropdowns.

### 1.10 Pre-seeded locations

Three locations come pre-loaded; the location switcher exposes an "Add location" affordance.

| Location              | Slug              | Role          |
|-----------------------|-------------------|---------------|
| North Ogden, Utah     | `north-ogden-ut`  | Home (default origin) |
| Brisbane, Australia   | `brisbane-au`     | Big-trip example |
| Santa Barbara, CA     | `santa-barbara-ca`| Quick-getaway example |

Each location carries the full Nomadlist-style stat block (see 1.11).

### 1.11 Location stat block (Nomadlist-inspired)

```ts
type Location = {
  id: string;
  slug: string;
  name: string;
  country: string;
  region: string;
  coords: { lat: number; lng: number };
  timezone: string;
  currency: string;
  language: string[];
  heroImage: string;
  heroVideo?: string;
  monthlyClimate: Array<{
    month: string; avgHighF: number; avgLowF: number;
    rainDays: number; humidity: number; sunshineHours: number;
  }>;
  costOfLivingIndex: number;     // 0..100
  budget: { dailyLowUSD: number; dailyMidUSD: number; dailyHighUSD: number };
  safetyScore: number;           // 0..100
  walkability: number;           // 0..100
  internetMbps: number;
  airQualityIndex: number;
  daylightHoursByMonth: Record<string, number>;
  visa: { usPassport: 'visa-free' | 'visa-on-arrival' | 'evisa' | 'visa-required'; days?: number };
  tags: string[];                // 'beach' | 'mountain' | 'foodie' | ...
  tasteVibeVector: number[];     // aligned with the profile slider order
  goodMonths: string[];
  caution: string[];             // "wildfire season Aug-Oct" etc.
  highlights: { title: string; blurb: string }[];
};
```

### 1.12 Trip data shape

```ts
type Trip = {
  id: string;
  status: 'past' | 'upcoming' | 'idea';
  title: string;
  origin: string;          // location id (default: home)
  destination: string;     // location id
  dates: { start: string; end: string };  // ISO
  travelers: number;
  mode: 'drive' | 'fly' | 'mixed' | 'unknown';
  costUSD?: number;
  rating?: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  tags?: string[];
  photos?: string[];
  routePolyline?: string;
};
```

### 1.13 Component inventory

```
components/
  hero/
    HeroBackdrop.tsx          // full-bleed image/video with crossfade
    NowVsThereOverlay.tsx     // home + destination temp dials
    LocationSwitcher.tsx      // pill picker with "Add location"
  glance/
    UpcomingTripCard.tsx
    RecommendationStrip.tsx   // horizontal scroller
    QuickStatsGrid.tsx        // sun, AQI, $/day, safety, daylight, visa
  trips/
    TripCard.tsx
    DriveVsFlyComparator.tsx
    QuickAddTrip.tsx          // free-text composer
    TripTimeline.tsx
  map/
    Atlas.tsx                 // full-screen
    TripMap.tsx               // embedded
    YearScrubber.tsx
  recommendations/
    RecommendationCard.tsx    // with "Why?" expander + signals radar
    BookingSweetSpot.tsx
  profile/
    VibeSliders.tsx
    ClimatePreferences.tsx
    VisualTasteCapture.tsx
  primitives/
    StatTile.tsx
    Sparkline.tsx
    TempDial.tsx
    ConfidenceBand.tsx
    Money.tsx                 // tabular numerals, currency-aware
    PlainLanguageTooltip.tsx
    LargerTextToggle.tsx
```

### 1.14 Data sources

- **Weather (live):** Open-Meteo (no key required) for current and 7-day forecast. Cached 30 min.
- **Geocoding/maps:** MapLibre GL with OpenFreeMap tiles, or Mapbox if a token is available via env. Fallback to Leaflet + OSM tiles.
- **Routing:** OSRM public endpoint for drive distance/time.
- **Imagery:** Unsplash Source URLs keyed by slug, with locally bundled fallbacks.
- **Country/visa:** REST Countries.
- **Everything else (cost of living, safety, internet, climate averages, flight estimates, trends):** seeded in `/data/locations.ts` with realistic Nomadlist-grade values, updated by a single mock service so the app stays "live-feeling" without paid keys.

### 1.15 Crucial extras worth including

These are not the headline five but make the product feel finished:
- Booking sweet-spot calendar on every trip-plan page.
- Packing intelligence: weather + duration + tags → packing list with a "share with travel partner" copy button.
- Currency converter on every location card.
- Time-zone helper: "Good times to call home" green band.
- Local events near trip dates (mocked).
- Wishlist / save-for-later with one tap.
- Read-only share link for any trip.
- "Print itinerary" page (PDF-friendly CSS).
- Empty states that teach the product (every section explains itself before there's data).

---

## Part 2 — The Claude Code Prompt

> Copy everything below the line into Claude Code. It is self-contained.

---

You are the lead product designer and frontend engineer building **Travelfire**, a cinematic travel research and planning web app. Build a complete, runnable, polished frontend prototype in **Next.js 14 (App Router) + TypeScript + Tailwind CSS**, deployable to Vercel with `npm run build && npm start`. No backend, no auth — persist user data in `localStorage` via a typed wrapper.

### Goals (in priority order)
1. **Stunning visuals.** Full-bleed cinematic hero, editorial typography, calm motion. The home page should make a 55-year-old say "wow" and a designer say "tasteful."
2. **Simple and ages-friendly.** 18px base type, AA/AAA contrast, ≥44px tap targets, plain-language labels, reduced-motion support, "Make text larger" toggle in the header.
3. **Useful data, real-feeling.** Live weather via Open-Meteo. Drive routes via OSRM. Everything else via a rich seeded data layer that looks live and updates deterministically.
4. **Real-time location switching.** Selecting a different location updates the hero image, weather overlay, stat tiles, recommendations, and map without a page reload.

### Stack & conventions
- Next.js 14 App Router, TypeScript strict, Tailwind CSS, `next/font` for Fraunces (display) and Inter (UI).
- Mapping: **MapLibre GL** with OpenFreeMap tiles (no token needed). If `NEXT_PUBLIC_MAPBOX_TOKEN` is set, swap to Mapbox.
- State: lightweight Zustand store + a typed `localStorage` adapter at `lib/persist.ts`.
- Charts: small bespoke SVG sparklines and a tiny radar chart — no heavy chart library.
- No CSS-in-JS; Tailwind only. Use CSS variables for theme tokens.
- Lint/format: ESLint + Prettier, strict TS.

### Design tokens (put in `app/globals.css`)
```css
:root {
  --ink:#1B1A17; --paper:#FAF7F2; --ember:#D4622A; --horizon:#2E5266;
  --mist:#E5E0D7; --success:#3F7D5C; --warn:#C99A2E; --danger:#A33B2A;
  --radius:14px; --shadow:0 10px 30px rgba(27,26,23,.08);
}
@media (prefers-color-scheme: dark) {
  :root { --ink:#F5F1EA; --paper:#14130F; --mist:#2A2823; }
}
html { font-size:18px; }
body { font-family: var(--font-inter); color:var(--ink); background:var(--paper); }
.display { font-family: var(--font-fraunces); font-feature-settings:"opsz" 144; }
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration:0!important; transition-duration:0!important; } }
```

### Routes to implement
```
/                       Home — hero, location switcher, glance cards, recommendations strip, recent trips, atlas teaser
/locations/[slug]       Location deep-dive (Nomadlist-style stats, full hero)
/trips                  All trips — list + map toggle
/trips/new              Plan a new trip — Drive vs Fly comparator + cost summary
/trips/import           Quick add past trips (free-text composer + CSV import)
/trips/[id]             Trip detail
/recommendations        Engine output with explainability
/profile                Travel taste profile (sliders, climate prefs, visual capture)
/atlas                  Full-screen personal travel map
```

### Pre-seeded locations (in `data/locations.ts`)
Seed three locations with realistic Nomadlist-style data. Use the `Location` type below.
- **North Ogden, Utah** (`north-ogden-ut`) — set as the default home/origin.
- **Brisbane, Australia** (`brisbane-au`)
- **Santa Barbara, California** (`santa-barbara-ca`)

For each, populate: coords, timezone, currency, language, hero image (Unsplash Source URL keyed to the slug + a sensible query), 12-month climate averages (avg high/low °F, rain days, humidity, sunshine hours), cost-of-living index, daily budget bands, safety, walkability, internet Mbps, AQI, daylight hours by month, visa info for US passport, vibe tags, taste vector aligned to the profile sliders, good months, caution notes, and 3–5 highlight blurbs each. The data must be plausible and consistent with reality (Brisbane is hot and humid Dec–Feb; Santa Barbara is mild year-round; North Ogden has real winters).

### Type contracts (put in `types/index.ts`)
Implement exactly the `Location`, `Trip`, `RecommendationScore`, `TripCostInputs`, and `TripCostOutput` shapes specified in the vision document above (Sections 1.6, 1.7, 1.11, 1.12). Add a `TasteProfile` type for the user profile.

### Five must-have features

**1) Live "Now vs There" hero (`components/hero/*`)**
- Full-bleed hero image (or short video if `heroVideo` exists) for the selected destination.
- Crossfade between destinations in 240ms when the location switcher changes.
- Overlay: two `TempDial` components — `Home (North Ogden)` and `There (selected)` — with current temp, a 7-day sparkline, and a clearly labeled delta.
- Live data: Open-Meteo `https://api.open-meteo.com/v1/forecast?latitude=…&longitude=…&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&forecast_days=7`. Cache 30 min via `unstable_cache` or a simple in-memory TTL cache.
- Display a tasteful "Live" pill when data is fresh, "Estimated" when falling back.

**2) Drive vs Fly comparator (`components/trips/DriveVsFlyComparator.tsx`)**
- Inputs panel: travelers, vehicle MPG, gas price, bags, rental car days, parking/day, optional overnight hotel.
- Drive math: distance via OSRM (`https://router.project-osrm.org/route/v1/driving/{lng1},{lat1};{lng2},{lat2}?overview=full&geometries=geojson`). Fall back to haversine × 1.25 ÷ 60 mph if OSRM fails.
- Fly math: deterministic seeded estimator combining route distance, month seasonality, and base airline class. Add believable jitter. Always label "Estimated, not bookable."
- Output: side-by-side cards with total $, total hours, kgCO₂e (use 0.404 kg/mi for car split by travelers, 0.255 kg/passenger-mi for economy flight), and a one-line recommendation comparing the two.
- Render the drive route polyline on a small `TripMap` next to the cards.

**3) Recommendation engine (`lib/recommend.ts`) — implement Iteration 3 from the vision.**
- Inputs: `TasteProfile`, `Trip[]` history, `Location[]` candidate set, optional travel-month window.
- Score each candidate using the eight signals (tasteMatch, tempMatch, deltaFromHome, budgetFit, affinity, diversity, novelty, priceTrend) with weights derived from the profile. Pure functions; fully unit-testable.
- Return `RecommendationScore[]` sorted descending. Include `confidence`, `bestMonth`, `projectedCostUSD` band, `bookingSweetSpotDays`, and 2–4 plain-English `reasons`.
- `RecommendationCard` shows the single headline reason by default, with a "Why?" expander that reveals the other reasons + a tiny signals radar chart.
- Add a unit test file `lib/__tests__/recommend.test.ts` with at least 6 cases covering: cold-weather user picking warm destinations in Dec, beach-lover affinity, diversity penalty when last 3 trips were all in Mexico, novelty bonus for never-visited region, low-confidence path with empty profile, and budget-fit penalty for over-budget candidates.

**4) Quick Add past trips (`/trips/import`)**
- Composer accepts free-text like `"Cabo, March 2023, $1,800, loved it"`. Parse with a regex/lightweight grammar in `lib/parseQuickTrip.ts` (extract destination, month/year, cost, sentiment → 1–5 rating).
- Show parsed result inline as an editable card before saving; user confirms with one tap.
- Geocode unknown destinations by matching against `locations.ts` first, then fall back to a stub `geocode()` that calls Open-Meteo's geocoding endpoint.
- CSV import: drop-zone accepting `destination,start,end,cost,rating,notes` rows.
- Bulk-edit table view post-import.

**5) Personal travel atlas (`/atlas`, `components/map/Atlas.tsx`)**
- Full-screen MapLibre map with custom markers: past (filled ember), upcoming (outlined ember), recommended (dashed horizon), home (star).
- Hover/tap a pin → minimal card with title, dates, cost, rating, and a "Open trip" link.
- Route lines drawn from home for each trip.
- Year scrubber at the bottom (`YearScrubber.tsx`) — drag to animate trips appearing chronologically.
- Cluster pins at low zoom.

### Travel taste profile (`/profile`)
- **Vibe sliders** (continuous 0–100, eight pairs, see vision 1.5).
- **Climate preferences:** ideal temp range (dual-thumb slider, °F), humidity tolerance, sunshine importance, "travel to escape home weather?" toggle.
- **Constraints:** annual budget, typical trip length, max travel time hours, passport status, mobility considerations, traveling-with chips, pet-friendly required.
- **Visual taste capture:** six pairs of destination photos; tap to choose. Persist as a 6-bit vector that diversifies recommendations (never the sole signal).
- "Skip for now" allowed; engine adapts via lower confidence.

### Home page composition (`app/page.tsx`)
1. Header: word-mark "Travelfire" in Fraunces, primary nav, "Make text larger" toggle.
2. Hero (100vh desktop, 70vh mobile): backdrop + `NowVsThereOverlay` + `LocationSwitcher` (pills for the three seeded locations + an "Add location" pill).
3. Glance row: `QuickStatsGrid` for the selected location (sun, AQI, $/day, safety, daylight, visa).
4. "Your next trip" card if upcoming exists, else CTA to plan one.
5. "For you" `RecommendationStrip` — horizontal scroller of `RecommendationCard`s.
6. "Recently visited" trips strip.
7. Atlas teaser — small map preview with "Open atlas".
8. Footer: data source attribution.

### Accessibility (must-pass)
- Body text 18px minimum.
- WCAG AA throughout, AAA on long-form copy.
- Visible 2px focus rings on every interactive element.
- All controls ≥44×44px.
- No hover-only disclosures.
- Plain-language labels everywhere; technical terms get an inline `PlainLanguageTooltip`.
- Header includes a "Make text larger" toggle that scales root font-size 100%/115%/130%.
- All animations honor `prefers-reduced-motion`.

### Project layout
```
app/
  layout.tsx
  page.tsx
  globals.css
  locations/[slug]/page.tsx
  trips/page.tsx
  trips/new/page.tsx
  trips/import/page.tsx
  trips/[id]/page.tsx
  recommendations/page.tsx
  profile/page.tsx
  atlas/page.tsx
components/  (per inventory in vision 1.13)
lib/
  recommend.ts
  cost.ts                 // drive vs fly calc
  parseQuickTrip.ts
  weather.ts              // Open-Meteo client + cache
  routing.ts              // OSRM client + fallback
  persist.ts              // typed localStorage adapter
  store.ts                // Zustand store
data/
  locations.ts
  seedTrips.ts
  seedProfile.ts
types/
  index.ts
public/
  fallback hero images per slug
```

### Build order (do in this sequence)
1. Scaffold the Next app, fonts, globals, layout, header with text-size toggle.
2. Implement `types/`, `data/locations.ts` (all three seeded), `data/seedTrips.ts` (5 past trips + 1 upcoming + 2 ideas).
3. Build `LocationSwitcher`, `HeroBackdrop`, `TempDial`, `NowVsThereOverlay`, wire Open-Meteo with caching.
4. Build `QuickStatsGrid` + the home page composition.
5. Build the recommendation engine + `RecommendationCard` + `/recommendations` page + unit tests.
6. Build `DriveVsFlyComparator` + `/trips/new` + `cost.ts` + `routing.ts`.
7. Build `/trips/import` with the free-text parser and CSV import.
8. Build the atlas (`/atlas`) and the embedded `TripMap`.
9. Build `/profile` with sliders, climate prefs, visual taste capture; persist via `lib/persist.ts`.
10. Polish: empty states, loading skeletons, dark mode, print-friendly trip page.
11. Accessibility audit pass: keyboard-only walk-through of every page, contrast checks, reduced-motion verification.
12. Add a `README.md` with run instructions, env vars, data sources, and known limitations.

### Acceptance criteria (the build is done when…)
- `npm run dev` starts cleanly with no console errors or hydration warnings.
- The home page renders a cinematic hero, the temperature overlay shows real numbers from Open-Meteo for North Ogden + the selected destination, and switching locations crossfades the hero and updates every glance tile.
- All three seeded locations have full Nomadlist-style stat blocks rendered on their detail pages.
- The Drive vs Fly comparator returns plausible totals for North Ogden → Santa Barbara within 5% of real-world ballparks (≈730 mi drive, ≈11 hrs, ≈$240 fuel at 30 MPG and $4/gal).
- The recommendation engine produces an ordered list with at least 3 reasons per card, a confidence label, and a booking sweet-spot. Unit tests pass.
- Free-text quick-add successfully parses `"Cabo, March 2023, $1,800, loved it"` into a valid `Trip` object with rating 5.
- The atlas shows pins for all seeded trips, with route lines from North Ogden, and the year scrubber animates them chronologically.
- The "Make text larger" toggle scales every page without layout breakage.
- A keyboard-only user can complete: switch location → open recommendations → expand a "Why?" card → plan a new trip → run the comparator → save the trip → see it on the atlas.
- Lighthouse: Performance ≥85, Accessibility ≥95, Best Practices ≥95.

### Non-negotiables
- Never invent a chart library import that doesn't exist; use the bespoke SVG primitives.
- Never use placeholder Lorem Ipsum copy; write real, voice-on-brand microcopy throughout (warm, plainspoken, confident; no jargon).
- Every "estimate" is clearly labeled as such; every live data point shows its source on hover/focus.
- No hover-only interactions. No tiny tap targets. No 14px body text.
- Ship a real, working `README.md`.

### Stretch (only after acceptance criteria pass)
- Packing intelligence on the trip detail page.
- Booking sweet-spot calendar on `/trips/new`.
- "Good times to call home" time-zone helper on the location detail page.
- Read-only share link for a trip.
- Local events near trip dates (mocked).

Build the entire thing. When you finish, print a short summary of what was built, what was mocked vs live, and any acceptance criteria that need follow-up.

# Travelfire

A cinematic travel research and planning web app. Dream, decide, and remember every journey.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_MAPBOX_TOKEN` | No | Optional Mapbox token for enhanced map tiles |

## Stack

- **Next.js 14** (App Router) + TypeScript + Tailwind CSS
- **Zustand** for state management
- **localStorage** for persistence (no backend)
- **Open-Meteo** for live weather data (no API key needed)
- **OSRM** for drive route calculations (free public endpoint)

## Data Sources

| Data | Source | Live? |
|------|--------|-------|
| Current weather + 7-day forecast | Open-Meteo API | Yes |
| Drive distance & time | OSRM public API | Yes |
| Flight estimates | Deterministic seeded estimator | No (labeled "Estimated") |
| Cost of living, safety, climate averages | Pre-seeded in `data/locations.ts` | No |
| Imagery | Unsplash Source URLs | Yes |

## Features

1. **Live "Now vs There" hero** — full-bleed cinematic hero with real-time weather comparison
2. **Drive vs Fly comparator** — side-by-side cost, time, and carbon comparison
3. **Recommendation engine** — taste-aware, temporal, with explainability (Iteration 3)
4. **Quick-add past trips** — free-text parser + CSV import
5. **Personal travel atlas** — SVG map with year scrubber and trip pins

## Routes

- `/` — Home with hero, stats, recommendations, recent trips
- `/locations/[slug]` — Nomadlist-style location deep-dive
- `/trips` — All trips list
- `/trips/new` — Plan a trip with Drive vs Fly comparator
- `/trips/import` — Quick-add past trips
- `/trips/[id]` — Trip detail
- `/recommendations` — Full recommendations page
- `/profile` — Travel taste profile editor
- `/atlas` — Full-screen personal travel map

## Known Limitations

- Atlas uses SVG projection, not a full map library (MapLibre integration planned)
- Flight prices are deterministic estimates, not live fares
- No authentication or cloud sync — all data lives in localStorage
- Three pre-seeded locations; "Add location" UI is placeholder

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run test     # Run unit tests
```

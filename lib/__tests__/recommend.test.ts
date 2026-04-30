import { getRecommendations } from '../recommend';
import { Location, Trip, TasteProfile } from '@/types';

// Helper to create a minimal location
function makeLocation(overrides: Partial<Location> & { id: string; slug: string }): Location {
  return {
    name: overrides.name || 'Test City',
    country: 'Test',
    region: overrides.region || 'Test Region',
    coords: { lat: 0, lng: 0 },
    timezone: 'UTC',
    currency: 'USD',
    language: ['English'],
    heroImage: '',
    monthlyClimate: Array.from({ length: 12 }, (_, i) => ({
      month: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i],
      avgHighF: overrides.monthlyClimate?.[i]?.avgHighF ?? 75,
      avgLowF: overrides.monthlyClimate?.[i]?.avgLowF ?? 55,
      rainDays: 5,
      humidity: 50,
      sunshineHours: 250,
    })),
    costOfLivingIndex: 50,
    budget: overrides.budget || { dailyLowUSD: 80, dailyMidUSD: 150, dailyHighUSD: 300 },
    safetyScore: 80,
    walkability: 60,
    internetMbps: 100,
    airQualityIndex: 40,
    daylightHoursByMonth: { Jan: 10, Feb: 11, Mar: 12, Apr: 13, May: 14, Jun: 15, Jul: 15, Aug: 14, Sep: 13, Oct: 12, Nov: 11, Dec: 10 },
    visa: { usPassport: 'visa-free' },
    tags: overrides.tags || ['beach'],
    tasteVibeVector: overrides.tasteVibeVector || [50, 50, 50, 50, 50, 50, 50],
    goodMonths: ['Jun', 'Jul', 'Aug'],
    caution: [],
    highlights: [],
    ...overrides,
  };
}

const home = makeLocation({ id: 'north-ogden-ut', slug: 'north-ogden-ut', name: 'North Ogden', region: 'Mountain West',
  monthlyClimate: Array.from({ length: 12 }, (_, i) => ({
    month: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i],
    avgHighF: [34, 39, 50, 59, 69, 80, 90, 88, 77, 62, 46, 35][i],
    avgLowF: [17, 21, 29, 36, 44, 52, 60, 58, 48, 37, 26, 18][i],
    rainDays: 5, humidity: 50, sunshineHours: 200,
  })),
  tasteVibeVector: [20, 30, 40, 30, 30, 60, 50],
  tags: ['mountain', 'skiing'],
});

function makeProfile(overrides?: Partial<TasteProfile>): TasteProfile {
  return {
    vibes: {
      beachVsMountain: 50,
      cityVsNature: 50,
      culturalVsAdventure: 50,
      foodieVsWellness: 50,
      livelyVsQuiet: 50,
      luxVsRugged: 50,
      planVsWander: 50,
    },
    climate: {
      idealTempLowF: 65,
      idealTempHighF: 82,
      humidityTolerance: 50,
      sunshineImportance: 70,
      escapeHomeWeather: true,
    },
    constraints: {
      annualBudgetUSD: 8000,
      typicalTripDays: 7,
      maxTravelTimeHours: 12,
      passportStatus: 'us',
      mobilityConsiderations: [],
      travelingWith: [],
      petFriendly: false,
    },
    visualTaste: [],
    ...overrides,
  };
}

describe('Recommendation Engine', () => {
  test('cold-weather user prefers warm destinations in December', () => {
    const warmDest = makeLocation({
      id: 'warm-beach', slug: 'warm-beach', name: 'Warm Beach', region: 'Caribbean',
      tags: ['beach', 'warm'],
      tasteVibeVector: [90, 50, 50, 50, 50, 30, 50],
      monthlyClimate: Array.from({ length: 12 }, (_, i) => ({
        month: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i],
        avgHighF: 82, avgLowF: 72, rainDays: 5, humidity: 65, sunshineHours: 280,
      })),
    });

    const coldDest = makeLocation({
      id: 'cold-mountain', slug: 'cold-mountain', name: 'Cold Mountain', region: 'Scandinavia',
      tags: ['mountain', 'cold'],
      tasteVibeVector: [10, 40, 50, 50, 50, 80, 50],
      monthlyClimate: Array.from({ length: 12 }, (_, i) => ({
        month: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i],
        avgHighF: 25, avgLowF: 10, rainDays: 12, humidity: 80, sunshineHours: 60,
      })),
    });

    const profile = makeProfile({
      vibes: { beachVsMountain: 80, cityVsNature: 50, culturalVsAdventure: 50, foodieVsWellness: 50, livelyVsQuiet: 50, luxVsRugged: 30, planVsWander: 50 },
    });

    const results = getRecommendations(profile, [], [home, warmDest, coldDest], 11);
    expect(results[0].locationId).toBe('warm-beach');
    expect(results[0].signals.tempMatch).toBeGreaterThan(results[1].signals.tempMatch);
  });

  test('beach lover gets higher taste match for beach destinations', () => {
    const beachDest = makeLocation({
      id: 'beach-city', slug: 'beach-city', name: 'Beach City', region: 'Pacific',
      tags: ['beach'], tasteVibeVector: [90, 50, 50, 70, 50, 30, 50],
    });

    const mountainDest = makeLocation({
      id: 'mountain-town', slug: 'mountain-town', name: 'Mountain Town', region: 'Alps',
      tags: ['mountain'], tasteVibeVector: [10, 30, 60, 30, 40, 80, 50],
    });

    const profile = makeProfile({
      vibes: { beachVsMountain: 95, cityVsNature: 50, culturalVsAdventure: 50, foodieVsWellness: 70, livelyVsQuiet: 50, luxVsRugged: 30, planVsWander: 50 },
    });

    const results = getRecommendations(profile, [], [home, beachDest, mountainDest]);
    const beachRec = results.find((r) => r.locationId === 'beach-city')!;
    const mtRec = results.find((r) => r.locationId === 'mountain-town')!;
    expect(beachRec.signals.tasteMatch).toBeGreaterThan(mtRec.signals.tasteMatch);
  });

  test('diversity penalty when last 3 trips were all in same region', () => {
    const dest = makeLocation({
      id: 'cancun', slug: 'cancun', name: 'Cancun', region: 'Mexico',
      tags: ['beach'], tasteVibeVector: [80, 50, 50, 60, 60, 30, 50],
    });

    const altDest = makeLocation({
      id: 'lisbon', slug: 'lisbon', name: 'Lisbon', region: 'Europe',
      tags: ['cultural', 'foodie'], tasteVibeVector: [50, 60, 70, 80, 50, 30, 40],
    });

    const mexicoTrips: Trip[] = [
      { id: 't1', status: 'past', title: 'Mexico 1', origin: 'north-ogden-ut', destination: 'cancun', dates: { start: '2024-01-01', end: '2024-01-07' }, travelers: 2, mode: 'fly', rating: 4 },
      { id: 't2', status: 'past', title: 'Mexico 2', origin: 'north-ogden-ut', destination: 'cancun', dates: { start: '2024-03-01', end: '2024-03-07' }, travelers: 2, mode: 'fly', rating: 4 },
      { id: 't3', status: 'past', title: 'Mexico 3', origin: 'north-ogden-ut', destination: 'cancun', dates: { start: '2024-06-01', end: '2024-06-07' }, travelers: 2, mode: 'fly', rating: 4 },
    ];

    const profile = makeProfile();
    const results = getRecommendations(profile, mexicoTrips, [home, dest, altDest]);
    const cancunRec = results.find((r) => r.locationId === 'cancun')!;
    const lisbonRec = results.find((r) => r.locationId === 'lisbon')!;
    expect(cancunRec.signals.diversity).toBeLessThan(lisbonRec.signals.diversity);
  });

  test('novelty bonus for never-visited region', () => {
    const visited = makeLocation({
      id: 'paris', slug: 'paris', name: 'Paris', region: 'Europe',
      tags: ['cultural'], tasteVibeVector: [30, 70, 80, 80, 60, 20, 30],
    });

    const novel = makeLocation({
      id: 'tokyo', slug: 'tokyo', name: 'Tokyo', region: 'East Asia',
      tags: ['cultural', 'foodie'], tasteVibeVector: [30, 70, 80, 90, 60, 30, 30],
    });

    const euroTrips: Trip[] = [
      { id: 't1', status: 'past', title: 'Europe trip', origin: 'north-ogden-ut', destination: 'paris', dates: { start: '2024-05-01', end: '2024-05-10' }, travelers: 2, mode: 'fly', rating: 5 },
    ];

    const profile = makeProfile();
    const results = getRecommendations(profile, euroTrips, [home, visited, novel]);
    const parisRec = results.find((r) => r.locationId === 'paris')!;
    const tokyoRec = results.find((r) => r.locationId === 'tokyo')!;
    expect(tokyoRec.signals.novelty).toBeGreaterThan(parisRec.signals.novelty);
  });

  test('low confidence with empty profile', () => {
    const dest = makeLocation({
      id: 'anywhere', slug: 'anywhere', name: 'Anywhere', region: 'Test',
      tags: ['beach'], tasteVibeVector: [50, 50, 50, 50, 50, 50, 50],
    });

    // All vibes at 50 = default/empty-ish
    const emptyProfile = makeProfile();
    const results = getRecommendations(emptyProfile, [], [home, dest]);
    expect(results[0].confidence).toBe('low');
  });

  test('budget-fit penalty for over-budget candidates', () => {
    const cheapDest = makeLocation({
      id: 'cheap', slug: 'cheap', name: 'Cheap City', region: 'SE Asia',
      budget: { dailyLowUSD: 20, dailyMidUSD: 40, dailyHighUSD: 80 },
      tags: ['budget'], tasteVibeVector: [50, 50, 50, 50, 50, 50, 50],
    });

    const expensiveDest = makeLocation({
      id: 'expensive', slug: 'expensive', name: 'Expensive City', region: 'Scandinavia',
      budget: { dailyLowUSD: 200, dailyMidUSD: 400, dailyHighUSD: 800 },
      tags: ['luxury'], tasteVibeVector: [50, 50, 50, 50, 50, 50, 50],
    });

    const tightBudget = makeProfile({
      constraints: {
        annualBudgetUSD: 3000,
        typicalTripDays: 7,
        maxTravelTimeHours: 12,
        passportStatus: 'us',
        mobilityConsiderations: [],
        travelingWith: [],
        petFriendly: false,
      },
    });

    const results = getRecommendations(tightBudget, [], [home, cheapDest, expensiveDest]);
    const cheapRec = results.find((r) => r.locationId === 'cheap')!;
    const expRec = results.find((r) => r.locationId === 'expensive')!;
    expect(cheapRec.signals.budgetFit).toBeGreaterThan(expRec.signals.budgetFit);
  });
});

import { Location, Trip, TasteProfile, RecommendationScore } from '@/types';

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

function profileToVector(profile: TasteProfile): number[] {
  const v = profile.vibes;
  return [
    v.beachVsMountain,
    v.cityVsNature,
    v.culturalVsAdventure,
    v.foodieVsWellness,
    v.livelyVsQuiet,
    v.luxVsRugged,
    v.planVsWander,
  ];
}

function tempMatchScore(location: Location, profile: TasteProfile, travelMonth?: number): number {
  const monthIdx = travelMonth ?? new Date().getMonth();
  const climate = location.monthlyClimate[monthIdx];
  const avgTemp = (climate.avgHighF + climate.avgLowF) / 2;
  const idealMid = (profile.climate.idealTempLowF + profile.climate.idealTempHighF) / 2;
  const idealRange = (profile.climate.idealTempHighF - profile.climate.idealTempLowF) / 2;
  const diff = Math.abs(avgTemp - idealMid);
  return Math.max(0, 1 - diff / (idealRange + 20));
}

function deltaFromHomeScore(location: Location, home: Location, profile: TasteProfile, travelMonth?: number): number {
  if (!profile.climate.escapeHomeWeather) return 0.5;
  const monthIdx = travelMonth ?? new Date().getMonth();
  const homeAvg = (home.monthlyClimate[monthIdx].avgHighF + home.monthlyClimate[monthIdx].avgLowF) / 2;
  const destAvg = (location.monthlyClimate[monthIdx].avgHighF + location.monthlyClimate[monthIdx].avgLowF) / 2;
  const delta = Math.abs(destAvg - homeAvg);
  return Math.min(1, delta / 40);
}

function budgetFitScore(location: Location, profile: TasteProfile): number {
  const dailyBudget = profile.constraints.annualBudgetUSD / (profile.constraints.typicalTripDays * 4);
  if (dailyBudget <= 0) return 0.5;
  if (location.budget.dailyMidUSD <= dailyBudget) return 1;
  const overRatio = location.budget.dailyMidUSD / dailyBudget;
  return Math.max(0, 1 - (overRatio - 1));
}

function affinityScore(location: Location, trips: Trip[], locations: Location[]): number {
  const pastTrips = trips.filter((t) => t.status === 'past' && t.rating);
  if (pastTrips.length === 0) return 0.5;

  let totalWeight = 0;
  let totalScore = 0;

  for (const trip of pastTrips) {
    const dest = locations.find((l) => l.id === trip.destination || l.slug === trip.destination);
    if (!dest) continue;
    const similarity = cosineSimilarity(dest.tasteVibeVector, location.tasteVibeVector);
    const ratingWeight = (trip.rating! - 3) / 2;
    totalScore += similarity * ratingWeight;
    totalWeight += Math.abs(ratingWeight);
  }

  if (totalWeight === 0) return 0.5;
  return 0.5 + (totalScore / totalWeight) * 0.5;
}

function diversityScore(location: Location, trips: Trip[], allLocations: Location[]): number {
  const recent = trips
    .filter((t) => t.status === 'past')
    .sort((a, b) => new Date(b.dates.end).getTime() - new Date(a.dates.end).getTime())
    .slice(0, 3);

  if (recent.length === 0) return 1;

  let overlapCount = 0;
  for (const trip of recent) {
    const dest = allLocations.find((l) => l.id === trip.destination || l.slug === trip.destination);
    if (!dest) continue;
    if (dest.region === location.region) overlapCount++;
    const sim = cosineSimilarity(dest.tasteVibeVector, location.tasteVibeVector);
    if (sim > 0.85) overlapCount++;
  }

  return Math.max(0, 1 - overlapCount * 0.2);
}

function noveltyScore(location: Location, trips: Trip[], allLocations: Location[]): number {
  const visitedRegions = new Set<string>();
  for (const trip of trips.filter((t) => t.status === 'past')) {
    const dest = allLocations.find((l) => l.id === trip.destination || l.slug === trip.destination);
    if (dest) visitedRegions.add(dest.region);
  }
  return visitedRegions.has(location.region) ? 0.3 : 1;
}

function priceTrendScore(location: Location): number {
  // Deterministic seeded "trend" based on location slug hash
  let hash = 0;
  for (let i = 0; i < location.slug.length; i++) {
    hash = ((hash << 5) - hash + location.slug.charCodeAt(i)) | 0;
  }
  const weekNum = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  const trendPct = ((hash ^ weekNum) % 40 - 20) / 100;
  return 0.5 - trendPct;
}

function findBestMonth(location: Location, profile: TasteProfile): string {
  let bestIdx = 0;
  let bestScore = -1;
  for (let i = 0; i < 12; i++) {
    const score = tempMatchScore(location, profile, i);
    if (score > bestScore) {
      bestScore = score;
      bestIdx = i;
    }
  }
  return location.monthlyClimate[bestIdx].month;
}

function generateReasons(
  location: Location,
  signals: RecommendationScore['signals'],
  profile: TasteProfile,
  bestMonth: string,
  priceTrendPct: number,
): string[] {
  const reasons: string[] = [];

  // Taste match reason
  if (signals.tasteMatch > 0.7) {
    const topTag = location.tags[0];
    const idealTemp = Math.round((profile.climate.idealTempLowF + profile.climate.idealTempHighF) / 2);
    reasons.push(`You love ${topTag} destinations around ${idealTemp}°F — ${location.name} matches both.`);
  }

  // Temperature reason
  if (signals.tempMatch > 0.8) {
    reasons.push(`${location.name} in ${bestMonth} sits right in your ideal temperature sweet spot.`);
  }

  // Escape-home reason
  if (signals.deltaFromHome > 0.6 && profile.climate.escapeHomeWeather) {
    reasons.push(`A welcome change from home — expect a significant temperature difference.`);
  }

  // Budget reason
  if (signals.budgetFit > 0.8) {
    reasons.push(`At $${location.budget.dailyMidUSD}/day mid-range, it fits comfortably within your budget.`);
  } else if (signals.budgetFit < 0.4) {
    reasons.push(`Worth noting: ${location.name} is above your typical daily budget at $${location.budget.dailyMidUSD}/day.`);
  }

  // Novelty reason
  if (signals.novelty > 0.8) {
    reasons.push(`You haven't explored ${location.region} yet — a chance to add a new region to your atlas.`);
  }

  // Price trend reason
  if (priceTrendPct < -0.1) {
    reasons.push(`Travel to ${location.name} is trending ${Math.round(Math.abs(priceTrendPct * 100))}% below its 90-day average.`);
  }

  // Always include at least 2 reasons
  if (reasons.length < 2) {
    reasons.push(`${location.name} is known for: ${location.tags.slice(0, 3).join(', ')}.`);
  }
  if (reasons.length < 2) {
    reasons.push(`Best months to visit: ${location.goodMonths.join(', ')}.`);
  }

  return reasons.slice(0, 4);
}

export function getRecommendations(
  profile: TasteProfile,
  trips: Trip[],
  candidateLocations: Location[],
  travelMonth?: number,
): RecommendationScore[] {
  const home = candidateLocations.find((l) => l.slug === 'north-ogden-ut') || candidateLocations[0];
  const profileVector = profileToVector(profile);
  const hasProfile = profileVector.some((v) => v !== 50);
  const hasTripHistory = trips.some((t) => t.status === 'past');

  // Filter out home
  const candidates = candidateLocations.filter((l) => l.slug !== home.slug);

  const results: RecommendationScore[] = candidates.map((loc) => {
    const tasteMatch = cosineSimilarity(profileVector, loc.tasteVibeVector);
    const tempMatch = tempMatchScore(loc, profile, travelMonth);
    const delta = deltaFromHomeScore(loc, home, profile, travelMonth);
    const budget = budgetFitScore(loc, profile);
    const aff = affinityScore(loc, trips, candidateLocations);
    const div = diversityScore(loc, trips, candidateLocations);
    const nov = noveltyScore(loc, trips, candidateLocations);
    const priceTrend = priceTrendScore(loc);

    // Adaptive weights based on profile
    const budgetTight = profile.constraints.annualBudgetUSD < 5000;
    const shortTripper = profile.constraints.typicalTripDays <= 4;

    const w = {
      tasteMatch: 0.25,
      tempMatch: 0.15,
      deltaFromHome: profile.climate.escapeHomeWeather ? 0.1 : 0.03,
      budgetFit: budgetTight ? 0.2 : 0.1,
      affinity: hasTripHistory ? 0.1 : 0.05,
      diversity: hasTripHistory ? 0.08 : 0.02,
      novelty: hasTripHistory ? 0.07 : 0.05,
      priceTrend: 0.05,
    };

    // Proximity boost for short trippers
    if (shortTripper) {
      w.tasteMatch -= 0.05;
    }

    const score =
      w.tasteMatch * tasteMatch +
      w.tempMatch * tempMatch +
      w.deltaFromHome * delta +
      w.budgetFit * budget +
      w.affinity * aff +
      w.diversity * div +
      w.novelty * nov +
      w.priceTrend * priceTrend;

    // Confidence
    let confidence: 'low' | 'med' | 'high' = 'low';
    if (hasProfile && hasTripHistory) confidence = 'high';
    else if (hasProfile || hasTripHistory) confidence = 'med';

    const bestMonth = findBestMonth(loc, profile);

    // Projected cost
    const dailyMid = loc.budget.dailyMidUSD;
    const tripDays = profile.constraints.typicalTripDays;
    const projMid = dailyMid * tripDays;

    // Booking sweet spot
    const bookingSweetSpotDays = 45 + Math.floor(Math.random() * 30);

    // Price trend for reasons
    let hash = 0;
    for (let i = 0; i < loc.slug.length; i++) {
      hash = ((hash << 5) - hash + loc.slug.charCodeAt(i)) | 0;
    }
    const weekNum = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
    const priceTrendPct = ((hash ^ weekNum) % 40 - 20) / 100;

    const signals = {
      tasteMatch,
      tempMatch,
      deltaFromHome: delta,
      budgetFit: budget,
      affinity: aff,
      diversity: div,
      novelty: nov,
      priceTrend,
    };

    const reasons = generateReasons(loc, signals, profile, bestMonth, priceTrendPct);

    return {
      locationId: loc.id,
      score: Math.max(0, Math.min(1, score)),
      confidence,
      bestMonth,
      projectedCostUSD: {
        low: Math.round(projMid * 0.7),
        mid: Math.round(projMid),
        high: Math.round(projMid * 1.4),
      },
      bookingSweetSpotDays,
      reasons,
      signals,
    };
  });

  return results.sort((a, b) => b.score - a.score);
}

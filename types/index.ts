export type Location = {
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
    month: string;
    avgHighF: number;
    avgLowF: number;
    rainDays: number;
    humidity: number;
    sunshineHours: number;
  }>;
  costOfLivingIndex: number;
  budget: { dailyLowUSD: number; dailyMidUSD: number; dailyHighUSD: number };
  safetyScore: number;
  walkability: number;
  internetMbps: number;
  airQualityIndex: number;
  daylightHoursByMonth: Record<string, number>;
  visa: {
    usPassport: 'visa-free' | 'visa-on-arrival' | 'evisa' | 'visa-required';
    days?: number;
  };
  tags: string[];
  tasteVibeVector: number[];
  goodMonths: string[];
  caution: string[];
  highlights: { title: string; blurb: string }[];
};

export type Trip = {
  id: string;
  status: 'past' | 'upcoming' | 'idea';
  title: string;
  origin: string;
  destination: string;
  dates: { start: string; end: string };
  travelers: number;
  mode: 'drive' | 'fly' | 'mixed' | 'unknown';
  costUSD?: number;
  rating?: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  tags?: string[];
  photos?: string[];
  routePolyline?: string;
};

export type TasteProfile = {
  vibes: {
    beachVsMountain: number;
    cityVsNature: number;
    culturalVsAdventure: number;
    foodieVsWellness: number;
    livelyVsQuiet: number;
    luxVsRugged: number;
    planVsWander: number;
  };
  climate: {
    idealTempLowF: number;
    idealTempHighF: number;
    humidityTolerance: number;
    sunshineImportance: number;
    escapeHomeWeather: boolean;
  };
  constraints: {
    annualBudgetUSD: number;
    typicalTripDays: number;
    maxTravelTimeHours: number;
    passportStatus: 'us' | 'other' | 'none';
    mobilityConsiderations: string[];
    travelingWith: string[];
    petFriendly: boolean;
  };
  visualTaste: number[];
};

export type RecommendationScore = {
  locationId: string;
  score: number;
  confidence: 'low' | 'med' | 'high';
  bestMonth: string;
  projectedCostUSD: { low: number; mid: number; high: number };
  bookingSweetSpotDays: number;
  reasons: string[];
  signals: {
    tasteMatch: number;
    tempMatch: number;
    deltaFromHome: number;
    budgetFit: number;
    affinity: number;
    diversity: number;
    novelty: number;
    priceTrend: number;
  };
};

export type TripCostInputs = {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  travelers: number;
  vehicle: { mpg: number; tankUSD?: number };
  gasPriceUSDPerGal: number;
  flightSearchSeed: { route: string; month: string };
  bagsChecked: number;
  rentalCarDays: number;
  parkingUSDPerDay: number;
  hotelOvernightUSD?: number;
};

export type TripCostOutput = {
  drive: {
    totalUSD: number;
    hours: number;
    kgCO2e: number;
    breakdown: Record<string, number>;
  };
  fly: {
    totalUSD: number;
    hours: number;
    kgCO2e: number;
    breakdown: Record<string, number>;
  };
  recommendation: {
    mode: 'drive' | 'fly';
    reason: string;
    savingsUSD: number;
    timeDeltaHours: number;
  };
};

export type WeatherData = {
  current: {
    temperature: number;
    weatherCode: number;
  };
  daily: {
    maxTemps: number[];
    minTemps: number[];
  };
  fetchedAt: number;
};

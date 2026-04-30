import { TasteProfile } from '@/types';

export const defaultProfile: TasteProfile = {
  vibes: {
    beachVsMountain: 60,
    cityVsNature: 45,
    culturalVsAdventure: 50,
    foodieVsWellness: 65,
    livelyVsQuiet: 40,
    luxVsRugged: 35,
    planVsWander: 55,
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
    travelingWith: ['partner'],
    petFriendly: false,
  },
  visualTaste: [1, 0, 1, 1, 0, 1],
};

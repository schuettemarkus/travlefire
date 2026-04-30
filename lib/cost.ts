import { TripCostInputs, TripCostOutput } from '@/types';
import { getRoute } from './routing';

const KG_CO2_PER_MILE_CAR = 0.404;
const KG_CO2_PER_PASSENGER_MILE_FLIGHT = 0.255;
const FOOD_PER_DAY_USD = 45;
const OVERNIGHT_THRESHOLD_HOURS = 9;

function estimateFlightCost(distanceMiles: number, month: string, travelers: number): number {
  // Deterministic seeded estimator
  let baseFare: number;
  if (distanceMiles < 500) baseFare = 150;
  else if (distanceMiles < 1500) baseFare = 250;
  else if (distanceMiles < 3000) baseFare = 400;
  else baseFare = 600 + (distanceMiles - 3000) * 0.05;

  // Season factor
  const peakMonths = ['Jun', 'Jul', 'Dec'];
  const shoulderMonths = ['Mar', 'Apr', 'May', 'Sep', 'Oct', 'Nov'];
  let seasonFactor = 1.0;
  if (peakMonths.includes(month)) seasonFactor = 1.3;
  else if (shoulderMonths.includes(month)) seasonFactor = 1.1;
  else seasonFactor = 0.85;

  // Deterministic jitter based on string hash
  const seed = month.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const jitter = 1 + ((seed % 20) - 10) / 100;

  return Math.round(baseFare * seasonFactor * jitter) * travelers;
}

export async function calculateTripCost(inputs: TripCostInputs): Promise<TripCostOutput> {
  const route = await getRoute(
    inputs.origin.lat,
    inputs.origin.lng,
    inputs.destination.lat,
    inputs.destination.lng,
  );

  const distanceMiles = Math.round(route.distanceMiles);
  const driveHours = Math.round(route.durationHours * 10) / 10;

  // Drive breakdown
  const fuelCost = Math.round((distanceMiles / inputs.vehicle.mpg) * inputs.gasPriceUSDPerGal);
  const overnightStops = driveHours > OVERNIGHT_THRESHOLD_HOURS ? Math.floor(driveHours / OVERNIGHT_THRESHOLD_HOURS) : 0;
  const hotelCost = overnightStops * (inputs.hotelOvernightUSD || 120);
  const foodOnRoad = overnightStops > 0 ? Math.round(FOOD_PER_DAY_USD * (overnightStops + 1)) : Math.round(FOOD_PER_DAY_USD * (driveHours / 12));
  const driveCO2 = Math.round((distanceMiles * KG_CO2_PER_MILE_CAR) / inputs.travelers);

  const driveTotalUSD = fuelCost + hotelCost + foodOnRoad;

  // Fly breakdown
  const flightMonth = inputs.flightSearchSeed.month.slice(0, 3);
  const airfare = estimateFlightCost(distanceMiles, flightMonth, inputs.travelers);
  const airportParking = Math.round(inputs.parkingUSDPerDay * 2); // assume round trip
  const checkedBagFee = inputs.bagsChecked * 35 * inputs.travelers * 2;
  const rentalCar = inputs.rentalCarDays * 55;
  const groundTransport = inputs.rentalCarDays === 0 ? 80 : 0;
  const flyHours = Math.round((distanceMiles / 500 + 3) * 10) / 10; // flight + airport time
  const flyCO2 = Math.round(distanceMiles * KG_CO2_PER_PASSENGER_MILE_FLIGHT * inputs.travelers);

  const flyTotalUSD = airfare + airportParking + checkedBagFee + rentalCar + groundTransport;

  // Recommendation
  const savingsUSD = Math.abs(driveTotalUSD - flyTotalUSD);
  const timeDelta = Math.abs(driveHours - flyHours);
  const driveWins = driveTotalUSD < flyTotalUSD;

  let reason: string;
  if (driveWins) {
    reason = `Drive: saves $${savingsUSD}${timeDelta > 1 ? ` and ${Math.round(timeDelta)} fewer hours` : ''} vs flying${inputs.travelers > 1 ? ` when ${inputs.travelers} travelers share costs` : ''}.`;
  } else {
    reason = `Fly: saves $${savingsUSD}${timeDelta > 1 ? ` and ${Math.round(timeDelta)} fewer hours` : ''} vs driving.`;
  }

  return {
    drive: {
      totalUSD: driveTotalUSD,
      hours: driveHours,
      kgCO2e: driveCO2,
      breakdown: {
        'Fuel': fuelCost,
        'Hotels on road': hotelCost,
        'Food on road': foodOnRoad,
        [`Distance: ${distanceMiles} mi`]: 0,
      },
    },
    fly: {
      totalUSD: flyTotalUSD,
      hours: flyHours,
      kgCO2e: flyCO2,
      breakdown: {
        'Airfare (est.)': airfare,
        'Airport parking': airportParking,
        'Checked bags': checkedBagFee,
        'Rental car': rentalCar,
        'Ground transport': groundTransport,
      },
    },
    recommendation: {
      mode: driveWins ? 'drive' : 'fly',
      reason,
      savingsUSD,
      timeDeltaHours: timeDelta,
    },
  };
}

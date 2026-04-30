export interface RouteResult {
  distanceMiles: number;
  durationHours: number;
  geometry?: { type: string; coordinates: number[][] };
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function getRoute(
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number,
): Promise<RouteResult> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${destLng},${destLat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`OSRM error: ${res.status}`);
    const data = await res.json();

    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      return {
        distanceMiles: route.distance * 0.000621371, // meters to miles
        durationHours: route.duration / 3600,
        geometry: route.geometry,
      };
    }
    throw new Error('No routes found');
  } catch {
    // Fallback: haversine × 1.25 road factor, 60 mph average
    const straightLine = haversineDistance(originLat, originLng, destLat, destLng);
    const roadDistance = straightLine * 1.25;
    return {
      distanceMiles: roadDistance,
      durationHours: roadDistance / 60,
    };
  }
}

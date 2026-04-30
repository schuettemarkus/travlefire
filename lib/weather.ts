import { WeatherData } from '@/types';

const CACHE_TTL = 30 * 60 * 1000; // 30 minutes
const cache = new Map<string, WeatherData>();

export async function fetchWeather(lat: number, lng: number): Promise<WeatherData> {
  const key = `${lat.toFixed(2)},${lng.toFixed(2)}`;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
    return cached;
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&forecast_days=7&timezone=auto`;
    const res = await fetch(url, { next: { revalidate: 1800 } });
    if (!res.ok) throw new Error(`Weather API error: ${res.status}`);
    const data = await res.json();

    const weather: WeatherData = {
      current: {
        temperature: Math.round(data.current.temperature_2m),
        weatherCode: data.current.weather_code,
      },
      daily: {
        maxTemps: data.daily.temperature_2m_max.map((t: number) => Math.round(t)),
        minTemps: data.daily.temperature_2m_min.map((t: number) => Math.round(t)),
      },
      fetchedAt: Date.now(),
    };

    cache.set(key, weather);
    return weather;
  } catch {
    // Return fallback estimated data
    return {
      current: { temperature: 0, weatherCode: 0 },
      daily: { maxTemps: [], minTemps: [] },
      fetchedAt: 0,
    };
  }
}

export function weatherCodeToLabel(code: number): string {
  if (code === 0) return 'Clear';
  if (code <= 3) return 'Partly cloudy';
  if (code <= 48) return 'Foggy';
  if (code <= 57) return 'Drizzle';
  if (code <= 67) return 'Rain';
  if (code <= 77) return 'Snow';
  if (code <= 82) return 'Showers';
  if (code <= 86) return 'Snow showers';
  if (code <= 99) return 'Thunderstorm';
  return 'Unknown';
}

export function weatherCodeToIcon(code: number): string {
  if (code === 0) return '☀️';
  if (code <= 3) return '⛅';
  if (code <= 48) return '🌫️';
  if (code <= 57) return '🌧️';
  if (code <= 67) return '🌧️';
  if (code <= 77) return '❄️';
  if (code <= 82) return '🌦️';
  if (code <= 86) return '🌨️';
  if (code <= 99) return '⛈️';
  return '🌤️';
}

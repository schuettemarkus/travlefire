'use client';

import { useEffect, useState } from 'react';
import { locations, getHomeLocation } from '@/data/locations';
import { useStore } from '@/lib/store';
import { fetchWeather, weatherCodeToIcon } from '@/lib/weather';
import { TempDial } from '@/components/primitives/TempDial';
import { WeatherData } from '@/types';

export function NowVsThereOverlay() {
  const selectedSlug = useStore((s) => s.selectedLocationSlug);
  const home = getHomeLocation();
  const destination = locations.find((l) => l.slug === selectedSlug);

  const [homeWeather, setHomeWeather] = useState<WeatherData | null>(null);
  const [destWeather, setDestWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    fetchWeather(home.coords.lat, home.coords.lng).then(setHomeWeather);
  }, [home.coords.lat, home.coords.lng]);

  useEffect(() => {
    if (!destination) return;
    fetchWeather(destination.coords.lat, destination.coords.lng).then(setDestWeather);
  }, [destination]);

  if (!destination) return null;

  const homeTemp = homeWeather?.current.temperature ?? 0;
  const destTemp = destWeather?.current.temperature ?? 0;
  const delta = destTemp - homeTemp;
  const isHomeLive = homeWeather ? homeWeather.fetchedAt > 0 : false;
  const isDestLive = destWeather ? destWeather.fetchedAt > 0 : false;

  return (
    <div className="flex flex-col gap-4">
      {/* Destination name */}
      <h1 className="display text-4xl md:text-6xl font-bold text-white leading-tight">
        {destination.name}
        {destination.country !== 'United States' && (
          <span className="text-white/60 font-normal">, {destination.country}</span>
        )}
      </h1>

      {/* Temperature comparison */}
      <div className="flex items-center gap-6 md:gap-10 flex-wrap">
        <TempDial
          label={`Home (${home.name})`}
          temperature={homeTemp}
          weeklyHighs={homeWeather?.daily.maxTemps ?? []}
          isLive={isHomeLive}
          weatherIcon={homeWeather ? weatherCodeToIcon(homeWeather.current.weatherCode) : undefined}
        />

        {/* Delta */}
        <div className="flex flex-col items-center">
          <span className="text-white/50 text-[0.75rem] uppercase tracking-wider">Difference</span>
          <span className={`display text-2xl font-bold tabular-nums ${delta > 0 ? 'text-ember' : delta < 0 ? 'text-blue-300' : 'text-white'}`}>
            {delta > 0 ? '+' : ''}{delta}°
          </span>
        </div>

        <TempDial
          label={`There (${destination.name})`}
          temperature={destTemp}
          weeklyHighs={destWeather?.daily.maxTemps ?? []}
          isLive={isDestLive}
          weatherIcon={destWeather ? weatherCodeToIcon(destWeather.current.weatherCode) : undefined}
        />
      </div>
    </div>
  );
}

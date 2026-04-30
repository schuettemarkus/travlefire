'use client';

import { create } from 'zustand';
import { Trip, TasteProfile, WeatherData } from '@/types';
import { seedTrips } from '@/data/seedTrips';
import { defaultProfile } from '@/data/seedProfile';
import { load, save } from './persist';

interface TravelfireState {
  selectedLocationSlug: string;
  setSelectedLocation: (slug: string) => void;

  trips: Trip[];
  addTrip: (trip: Trip) => void;
  updateTrip: (id: string, updates: Partial<Trip>) => void;
  removeTrip: (id: string) => void;

  profile: TasteProfile;
  updateProfile: (updates: Partial<TasteProfile>) => void;

  weatherCache: Record<string, WeatherData>;
  setWeatherCache: (key: string, data: WeatherData) => void;
}

export const useStore = create<TravelfireState>((set, get) => ({
  selectedLocationSlug: 'santa-barbara-ca',
  setSelectedLocation: (slug) => {
    set({ selectedLocationSlug: slug });
    save('selected-location', slug);
  },

  trips: load<Trip[]>('trips', seedTrips),
  addTrip: (trip) => {
    const updated = [...get().trips, trip];
    set({ trips: updated });
    save('trips', updated);
  },
  updateTrip: (id, updates) => {
    const updated = get().trips.map((t) => (t.id === id ? { ...t, ...updates } : t));
    set({ trips: updated });
    save('trips', updated);
  },
  removeTrip: (id) => {
    const updated = get().trips.filter((t) => t.id !== id);
    set({ trips: updated });
    save('trips', updated);
  },

  profile: load<TasteProfile>('profile', defaultProfile),
  updateProfile: (updates) => {
    const updated = { ...get().profile, ...updates };
    set({ profile: updated });
    save('profile', updated);
  },

  weatherCache: {},
  setWeatherCache: (key, data) => {
    set({ weatherCache: { ...get().weatherCache, [key]: data } });
  },
}));

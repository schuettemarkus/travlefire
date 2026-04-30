'use client';

import { Sparkline } from './Sparkline';

interface TempDialProps {
  label: string;
  temperature: number;
  weeklyHighs: number[];
  isLive: boolean;
  weatherIcon?: string;
}

export function TempDial({ label, temperature, weeklyHighs, isLive, weatherIcon }: TempDialProps) {
  return (
    <div className="flex flex-col items-center gap-1 min-w-[120px]">
      <span className="text-[0.75rem] font-medium uppercase tracking-wider text-white/70">
        {label}
      </span>
      <div className="flex items-baseline gap-1">
        {weatherIcon && <span className="text-2xl">{weatherIcon}</span>}
        <span className="display text-4xl font-bold text-white tabular-nums">
          {temperature > 0 ? `${temperature}°` : '—'}
        </span>
      </div>
      {weeklyHighs.length > 0 && (
        <Sparkline data={weeklyHighs} width={80} height={24} color="rgba(255,255,255,0.7)" />
      )}
      <span
        className={`text-[0.65rem] uppercase tracking-wider px-2 py-0.5 rounded-full ${
          isLive
            ? 'bg-success/30 text-green-200'
            : 'bg-white/10 text-white/50'
        }`}
      >
        {isLive ? 'Live' : 'Estimated'}
      </span>
    </div>
  );
}

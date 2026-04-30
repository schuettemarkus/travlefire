'use client';

interface StatTileProps {
  icon: string;
  label: string;
  value: string;
  sublabel?: string;
}

export function StatTile({ icon, label, value, sublabel }: StatTileProps) {
  return (
    <div className="flex flex-col items-center gap-2 p-4 rounded-brand bg-paper border border-mist min-w-[120px]">
      <span className="text-2xl">{icon}</span>
      <span className="text-[0.75rem] font-medium uppercase tracking-wider text-ink/50">
        {label}
      </span>
      <span className="display text-xl font-bold tabular-nums">{value}</span>
      {sublabel && (
        <span className="text-[0.7rem] text-ink/40">{sublabel}</span>
      )}
    </div>
  );
}

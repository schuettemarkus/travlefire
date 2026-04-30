'use client';

interface ConfidenceBandProps {
  level: 'low' | 'med' | 'high';
}

const labels: Record<string, { text: string; color: string }> = {
  low: { text: 'Low confidence', color: 'bg-warn/20 text-warn' },
  med: { text: 'Medium confidence', color: 'bg-horizon/20 text-horizon' },
  high: { text: 'High confidence', color: 'bg-success/20 text-success' },
};

export function ConfidenceBand({ level }: ConfidenceBandProps) {
  const { text, color } = labels[level];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[0.7rem] font-medium ${color}`}>
      {text}
    </span>
  );
}

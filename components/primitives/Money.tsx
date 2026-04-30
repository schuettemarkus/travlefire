'use client';

interface MoneyProps {
  amount: number;
  currency?: string;
  className?: string;
}

export function Money({ amount, currency = 'USD', className = '' }: MoneyProps) {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

  return <span className={`tabular-nums ${className}`}>{formatted}</span>;
}

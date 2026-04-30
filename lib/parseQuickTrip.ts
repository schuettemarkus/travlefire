import { Trip } from '@/types';

const MONTHS: Record<string, string> = {
  jan: '01', january: '01', feb: '02', february: '02', mar: '03', march: '03',
  apr: '04', april: '04', may: '05', jun: '06', june: '06', jul: '07',
  july: '07', aug: '08', august: '08', sep: '09', september: '09', oct: '10',
  october: '10', nov: '11', november: '11', dec: '12', december: '12',
};

const SENTIMENT_MAP: Record<string, 1 | 2 | 3 | 4 | 5> = {
  'loved it': 5, 'amazing': 5, 'incredible': 5, 'perfect': 5, 'best': 5,
  'great': 4, 'really good': 4, 'wonderful': 4, 'fantastic': 4,
  'good': 3, 'nice': 3, 'okay': 3, 'decent': 3, 'fine': 3,
  'meh': 2, 'mediocre': 2, 'so-so': 2, 'not great': 2,
  'bad': 1, 'terrible': 1, 'awful': 1, 'hated it': 1, 'worst': 1,
};

export interface ParsedTrip {
  destination: string;
  month?: string;
  year?: number;
  costUSD?: number;
  rating?: 1 | 2 | 3 | 4 | 5;
  raw: string;
}

export function parseQuickTrip(input: string): ParsedTrip {
  const raw = input.trim();
  const parts = raw.split(/[,;]+/).map((p) => p.trim()).filter(Boolean);

  let destination = '';
  let month: string | undefined;
  let year: number | undefined;
  let costUSD: number | undefined;
  let rating: (1 | 2 | 3 | 4 | 5) | undefined;

  for (const part of parts) {
    const lower = part.toLowerCase();

    // Cost: $1,800 or $1800 or 1800
    const costMatch = part.match(/\$?([\d,]+)/);
    if (costMatch && !destination) {
      // First part is destination
    } else if (costMatch && parseInt(costMatch[1].replace(/,/g, '')) > 100) {
      const val = parseInt(costMatch[1].replace(/,/g, ''));
      if (val > 100 && val < 100000) {
        costUSD = val;
        continue;
      }
    }

    // Month + year: "March 2023" or "Mar 2023"
    const dateMatch = lower.match(/^(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s*(\d{4})?$/);
    if (dateMatch) {
      month = dateMatch[1];
      if (dateMatch[2]) year = parseInt(dateMatch[2]);
      continue;
    }

    // Sentiment
    let foundSentiment = false;
    for (const [phrase, score] of Object.entries(SENTIMENT_MAP)) {
      if (lower.includes(phrase)) {
        rating = score;
        foundSentiment = true;
        break;
      }
    }
    if (foundSentiment) continue;

    // Year only
    const yearOnly = part.match(/^\d{4}$/);
    if (yearOnly && !year) {
      year = parseInt(yearOnly[0]);
      continue;
    }

    // Default: first unmatched is destination
    if (!destination) {
      destination = part;
    }
  }

  // Build month number
  let monthNum: string | undefined;
  if (month) {
    const key = month.toLowerCase();
    monthNum = MONTHS[key];
  }

  return {
    destination,
    month: monthNum ? `${year || new Date().getFullYear()}-${monthNum}` : undefined,
    year,
    costUSD,
    rating,
    raw,
  };
}

export function parsedTripToTrip(parsed: ParsedTrip, destinationId: string): Trip {
  const tripYear = parsed.year || new Date().getFullYear();
  const monthStr = parsed.month || `${tripYear}-06`;
  const startDate = `${monthStr}-01`;
  const endDate = `${monthStr}-07`;

  return {
    id: `trip-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    status: 'past',
    title: `${parsed.destination} Trip`,
    origin: 'north-ogden-ut',
    destination: destinationId || parsed.destination.toLowerCase().replace(/\s+/g, '-'),
    dates: { start: startDate, end: endDate },
    travelers: 2,
    mode: 'unknown',
    costUSD: parsed.costUSD,
    rating: parsed.rating,
  };
}

export function parseCSVTrips(csv: string): ParsedTrip[] {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return [];

  // Skip header
  const header = lines[0].toLowerCase();
  const hasHeader = header.includes('destination') || header.includes('start') || header.includes('cost');
  const dataLines = hasHeader ? lines.slice(1) : lines;

  return dataLines.map((line) => {
    const cols = line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
    return {
      destination: cols[0] || '',
      month: cols[1] && cols[2] ? undefined : cols[1],
      costUSD: cols[3] ? parseInt(cols[3].replace(/[$,]/g, '')) || undefined : undefined,
      rating: cols[4] ? (Math.min(5, Math.max(1, parseInt(cols[4]))) as 1|2|3|4|5) : undefined,
      raw: line,
    };
  }).filter((p) => p.destination);
}

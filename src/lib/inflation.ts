// ─── Inflation Data & Utilities ─────────────────────────────────────────────
// Hardcoded annual CPI rates for all 5 supported currencies.
// Sources: UK ONS, US BLS, Eurostat, Australian ABS, Canadian StatCan.
// Rates are December-to-December percentage change.

export interface InflationRecord {
  year: number;
  rate: number; // e.g. 2.5 = 2.5%
}

// UK CPI (ONS)
const UK_CPI: InflationRecord[] = [
  { year: 2026, rate: 2.5 }, { year: 2025, rate: 2.8 },
  { year: 2024, rate: 3.2 }, { year: 2023, rate: 4.0 },
  { year: 2022, rate: 10.5 }, { year: 2021, rate: 5.4 },
  { year: 2020, rate: 0.9 }, { year: 2019, rate: 1.8 },
  { year: 2018, rate: 2.5 }, { year: 2017, rate: 3.0 },
  { year: 2016, rate: 1.6 }, { year: 2015, rate: 0.2 },
  { year: 2014, rate: 0.5 }, { year: 2013, rate: 2.0 },
  { year: 2012, rate: 2.7 }, { year: 2011, rate: 4.2 },
  { year: 2010, rate: 3.7 },
];

// US CPI (BLS)
const US_CPI: InflationRecord[] = [
  { year: 2026, rate: 2.4 }, { year: 2025, rate: 2.6 },
  { year: 2024, rate: 2.9 }, { year: 2023, rate: 3.4 },
  { year: 2022, rate: 6.5 }, { year: 2021, rate: 7.0 },
  { year: 2020, rate: 1.4 }, { year: 2019, rate: 2.3 },
  { year: 2018, rate: 1.9 }, { year: 2017, rate: 2.1 },
  { year: 2016, rate: 2.1 }, { year: 2015, rate: 0.7 },
  { year: 2014, rate: 0.8 }, { year: 2013, rate: 1.5 },
  { year: 2012, rate: 1.7 }, { year: 2011, rate: 3.0 },
  { year: 2010, rate: 1.5 },
];

// Eurozone HICP (Eurostat)
const EUR_CPI: InflationRecord[] = [
  { year: 2026, rate: 2.3 }, { year: 2025, rate: 2.5 },
  { year: 2024, rate: 2.7 }, { year: 2023, rate: 2.9 },
  { year: 2022, rate: 9.2 }, { year: 2021, rate: 5.0 },
  { year: 2020, rate: 0.3 }, { year: 2019, rate: 1.3 },
  { year: 2018, rate: 1.8 }, { year: 2017, rate: 1.4 },
  { year: 2016, rate: 1.1 }, { year: 2015, rate: 0.2 },
  { year: 2014, rate: 0.2 }, { year: 2013, rate: 0.8 },
  { year: 2012, rate: 2.2 }, { year: 2011, rate: 2.7 },
  { year: 2010, rate: 2.2 },
];

// Australia CPI (ABS)
const AUD_CPI: InflationRecord[] = [
  { year: 2026, rate: 2.6 }, { year: 2025, rate: 2.8 },
  { year: 2024, rate: 3.0 }, { year: 2023, rate: 4.1 },
  { year: 2022, rate: 7.8 }, { year: 2021, rate: 3.5 },
  { year: 2020, rate: 0.9 }, { year: 2019, rate: 1.8 },
  { year: 2018, rate: 1.8 }, { year: 2017, rate: 1.9 },
  { year: 2016, rate: 1.5 }, { year: 2015, rate: 1.7 },
  { year: 2014, rate: 1.7 }, { year: 2013, rate: 2.7 },
  { year: 2012, rate: 2.2 }, { year: 2011, rate: 3.0 },
  { year: 2010, rate: 2.8 },
];

// Canada CPI (StatCan)
const CAD_CPI: InflationRecord[] = [
  { year: 2026, rate: 2.3 }, { year: 2025, rate: 2.5 },
  { year: 2024, rate: 2.7 }, { year: 2023, rate: 3.4 },
  { year: 2022, rate: 6.8 }, { year: 2021, rate: 4.8 },
  { year: 2020, rate: 0.7 }, { year: 2019, rate: 2.2 },
  { year: 2018, rate: 2.0 }, { year: 2017, rate: 1.9 },
  { year: 2016, rate: 1.5 }, { year: 2015, rate: 1.6 },
  { year: 2014, rate: 1.5 }, { year: 2013, rate: 1.2 },
  { year: 2012, rate: 0.8 }, { year: 2011, rate: 2.3 },
  { year: 2010, rate: 2.4 },
];

const CPI_DATA: Record<string, InflationRecord[]> = {
  USD: US_CPI,
  GBP: UK_CPI,
  EUR: EUR_CPI,
  AUD: AUD_CPI,
  CAD: CAD_CPI,
};

/**
 * Gets the cumulative inflation multiplier from a past date to today.
 * e.g. if you had £100 in Jan 2023 and cumulative inflation is 6.8%,
 * the multiplier is 1.068, meaning you'd need £106.80 today for the same value.
 *
 * To adjust a past value to today's money: value * multiplier
 * To express a past value in today's money: value / multiplier
 */
export function getInflationMultiplier(
  currency: string,
  fromMonth: string // "2026-03"
): number {
  const records = CPI_DATA[currency];
  if (!records || records.length === 0) return 1;

  const fromYear = parseInt(fromMonth.slice(0, 4), 10);
  const currentYear = new Date().getFullYear();

  if (fromYear >= currentYear) return 1;

  let cumulative = 1;
  for (const record of records) {
    if (record.year >= fromYear && record.year < currentYear) {
      cumulative *= 1 + record.rate / 100;
    }
  }

  return cumulative;
}

/**
 * Adjusts a historical monetary value to today's purchasing power.
 * Shows what a past amount is worth "in today's money."
 */
export function adjustForInflation(
  value: number,
  currency: string,
  month: string
): number {
  const multiplier = getInflationMultiplier(currency, month);
  return value * multiplier;
}

/**
 * Describes which inflation data is being used for display purposes.
 */
export function getInflationLabel(currency: string): string {
  const labels: Record<string, string> = {
    USD: "US CPI (BLS)",
    GBP: "UK CPI (ONS)",
    EUR: "Eurozone HICP",
    AUD: "Australian CPI (ABS)",
    CAD: "Canadian CPI (StatCan)",
  };
  return labels[currency] ?? `${currency} CPI`;
}

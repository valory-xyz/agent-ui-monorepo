export const CURRENCY = {
  USD: { symbol: '$', name: 'US Dollar' },
} as const;

export type CurrencyCode = keyof typeof CURRENCY;

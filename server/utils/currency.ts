/**
 * Currency codes SerpApi accepts for the `currency` parameter.
 *
 * Kept server-side and independent of the UI list: this validates untrusted
 * query input before it is forwarded upstream, so an arbitrary string from a
 * request cannot be injected into the SerpApi URL.
 */
export const SUPPORTED_CURRENCIES: string[] = [
  'USD', 'EUR', 'GBP', 'JPY', 'VND', 'AUD', 'CAD', 'SGD', 'THB', 'KRW', 'INR', 'CHF',
];

export const DEFAULT_CURRENCY = 'USD';

/** Returns the requested currency when supported, otherwise USD. */
export const resolveCurrency = (value: unknown): string => {
  const code = typeof value === 'string' ? value.toUpperCase() : '';
  return SUPPORTED_CURRENCIES.includes(code) ? code : DEFAULT_CURRENCY;
};
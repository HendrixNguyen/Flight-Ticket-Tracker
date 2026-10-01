/**
 * Currency selection, persisted in localStorage.
 *
 * Prices are converted server-side: the chosen code is passed to SerpApi as the
 * `currency` parameter, so displayed amounts are the fares actually quoted
 * rather than amounts this app converted with its own exchange-rate table.
 *
 * State lives in `useState` so the server and client agree on the initial value
 * (USD) and the stored preference is applied after mount. Reading localStorage
 * during setup would render one currency on the server and another on the
 * client, which Vue reports as a hydration mismatch.
 */

export interface CurrencyOption {
  code: string;
  label: string;
  /** Symbol used in the UI. Falls back to the code for currencies without one. */
  symbol: string;
  name: string;
}

export const CURRENCIES: CurrencyOption[] = [
  { code: 'USD', label: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', label: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', label: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', label: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'VND', label: 'VND', symbol: '₫', name: 'Vietnamese Dong' },
  { code: 'AUD', label: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', label: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'SGD', label: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'THB', label: 'THB', symbol: '฿', name: 'Thai Baht' },
  { code: 'KRW', label: 'KRW', symbol: '₩', name: 'Korean Won' },
  { code: 'INR', label: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'CHF', label: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
];

const STORAGE_KEY = 'skycrawler-currency';
const DEFAULT_CURRENCY = 'USD';
const FALLBACK = CURRENCIES[0];

const isSupported = (code: string): boolean => CURRENCIES.some((c) => c.code === code);

export const useCurrency = () => {
  // Shared across every component that calls this, and serialised on the server.
  const currencyCode = useState<string>('currency-code', () => DEFAULT_CURRENCY);

  /** Apply a previously stored preference. Client-only; call once on mount. */
  const restore = () => {
    const stored = window.localStorage?.getItem(STORAGE_KEY);
    if (stored && isSupported(stored)) currencyCode.value = stored;
  };

  const currency = computed<CurrencyOption>(
    () => CURRENCIES.find((c) => c.code === currencyCode.value) || FALLBACK
  );

  const symbol = computed(() => currency.value.symbol);

  // Only CHF uses a word rather than a glyph; glyphs read better set tight.
  const isWordSymbol = computed(() => /^[A-Za-z]+$/.test(currency.value.symbol));

  /** Alphabetic codes like CHF read as a word and need a space before the
   *  amount ("CHF 1,234.56"); symbol glyphs sit tight against it ("$1,234.56"). */
  const joinSymbol = (value: number): string => {
    const formatted = value.toLocaleString('en-US');
    return isWordSymbol.value ? `${symbol.value} ${formatted}` : `${symbol.value}${formatted}`;
  };

  /** Formats an amount with the active currency. Zero-decimal currencies
   *  (JPY, VND, KRW) get no decimal places, where cents are meaningless. */
  const formatAmount = (amount: number): string => {
    if (!Number.isFinite(amount)) return joinSymbol(0);

    const zeroDecimal = ['JPY', 'VND', 'KRW'].includes(currency.value.code);
    const value = zeroDecimal ? Math.round(amount) : amount;

    return joinSymbol(value);
  };

  const setCurrency = (code: string) => {
    if (!isSupported(code)) return;
    currencyCode.value = code;
    window.localStorage?.setItem(STORAGE_KEY, code);
  };

  return { currencyCode, currency, symbol, formatAmount, setCurrency, restore };
};
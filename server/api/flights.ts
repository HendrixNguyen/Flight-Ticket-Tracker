import { rateLimit, clientIp } from '../utils/rateLimit';
import type { Flight, FlightApiResponse } from '../../types';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const config = useRuntimeConfig(event);
  
  const from = queryText(query.from, 'from');
  const to = queryText(query.to, 'to');
  const date = queryText(query.date, 'date');

  if (!from || !to || !date) {
    return {
      success: false,
      data: [],
      error: 'Missing required parameters: from, to, date',
    } as FlightApiResponse;
  }

  const returnDate = queryText(query.returnDate, 'returnDate');
  const passengers = queryCount(query.passengers, 'passengers', 1, 9);
  if (!validDate(date) || (returnDate && (!validDate(returnDate) || returnDate < date)) || from === to) throw createError({ statusCode: 400, statusMessage: 'Invalid flight route or dates' });

  const limit = RATE_LIMIT.flights;
  const gate = rateLimit('flights', clientIp(event), limit.limit, limit.windowMs);
  if (!gate.allowed) {
    setHeader(event, 'Retry-After', gate.retryAfterSeconds);
    throw createError({
      statusCode: 429,
      statusMessage: 'Too many flight searches. Please wait a moment before searching again.',
    });
  }


  // SerpApi performs the conversion, so prices are real quoted fares rather
  // than amounts this app converted with its own rate table.
  const currency = resolveCurrency(query.currency);

  // Keyed on the full search so a cached round-trip never leaks into a
  // one-way search or a different date. Currency is part of the key because
  // the same route returns different amounts per currency.
  const key = cacheKey('flights', { from, to, date, returnDate, passengers, currency });

  // ?refresh=1 forces a live lookup for users who suspect stale prices.
  if (query.refresh !== '1') {
    const cached = cacheGet<FlightApiResponse>(key);
    if (cached) {
      setHeader(event, 'X-Cache', 'HIT');
      return cached;
    }
  }
  setHeader(event, 'X-Cache', 'MISS');

  if (!config.serpApiKey) {
    return {
      success: false,
      data: [],
      error: 'SerpApi Key is missing. Please set NUXT_SERP_API_KEY in your environment.',
    } as FlightApiResponse;
  }

  try {
    const serpApiUrl = new URL('https://serpapi.com/search.json');
    serpApiUrl.searchParams.append('engine', 'google_flights');
    serpApiUrl.searchParams.append('departure_id', from.startsWith('/m/') ? from : from.toUpperCase());
    serpApiUrl.searchParams.append('arrival_id', to.startsWith('/m/') ? to : to.toUpperCase());
    serpApiUrl.searchParams.append('outbound_date', date);

    if (returnDate && returnDate !== 'undefined' && returnDate.trim() !== '') {
      serpApiUrl.searchParams.append('type', '1'); // Round-trip flight
      serpApiUrl.searchParams.append('return_date', returnDate);
    } else {
      serpApiUrl.searchParams.append('type', '2'); // One-way flight
    }
    serpApiUrl.searchParams.append('adults', String(passengers));
    serpApiUrl.searchParams.append('currency', currency);
    serpApiUrl.searchParams.append('hl', 'en');
    serpApiUrl.searchParams.append('api_key', config.serpApiKey);

    const response: any = await $fetch(serpApiUrl.toString());

    if (response.error) {
       return {
         success: false,
         data: [],
         error: response.error
       } as FlightApiResponse;
    }

    const allFlights = [
      ...(response.best_flights || []),
      ...(response.other_flights || [])
    ];

    const mappedFlights: Flight[] = allFlights.filter((item: any) => Array.isArray(item.flights) && item.flights.length > 0 && typeof item.price === 'number' && item.price > 0).map((item: any) => {
       const flightLegs = item.flights;
       const firstLeg = flightLegs[0];
       const lastLeg = flightLegs[flightLegs.length - 1];

       // Calculate duration in minutes if not explicitly provided
       let durationMinutes = item.total_duration;
       if (typeof durationMinutes !== 'number') {
           const dep = new Date(firstLeg.departure_airport.time).getTime();
           const arr = new Date(lastLeg.arrival_airport.time).getTime();
           durationMinutes = Math.floor((arr - dep) / 60000);
       }
       
       return {
         id: item.flights.map((f:any) => f.flight_number).join('-'),
         airline: firstLeg.airline,
         airlineLogo: firstLeg.airline_logo || item.airline_logo || undefined,
         airplane: firstLeg.airplane || undefined,
         flightNumber: firstLeg.flight_number,
         departureTime: firstLeg.departure_airport.time,
         arrivalTime: lastLeg.arrival_airport.time,
         departureAirport: firstLeg.departure_airport.id,
         arrivalAirport: lastLeg.arrival_airport.id,
         price: item.price || 0,
         currency: currency,
         durationMinutes: durationMinutes,
         stops: flightLegs.length - 1,
       };
    });

    const result = {
      success: true,
      data: mappedFlights,
    } as FlightApiResponse;
    cacheSet(key, result, CACHE_TTL.flights);
    return result;
  } catch (error: any) {
    console.error('Flight provider request failed:', error.statusCode || 'connection error');
    return {
      success: false,
      data: [],
      error: 'Unable to retrieve flight prices. Please try again later.',
    } as FlightApiResponse;
  }
});

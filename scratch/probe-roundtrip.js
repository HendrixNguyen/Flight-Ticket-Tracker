// Throwaway probe: reveals the raw SerpApi round-trip leg structure.
// Run: NUXT_SERP_API_KEY=<key> node scratch/probe-roundtrip.js
// DO NOT COMMIT. Delete after task 2 is resolved.

const apiKey = process.env.NUXT_SERP_API_KEY || process.argv[2];

if (!apiKey) {
  console.error('Usage: NUXT_SERP_API_KEY=<key> node scratch/probe-roundtrip.js');
  process.exit(1);
}

const url = new URL('https://serpapi.com/search.json');
url.searchParams.append('engine', 'google_flights');
url.searchParams.append('departure_id', 'SFO');
url.searchParams.append('arrival_id', 'JFK');
url.searchParams.append('outbound_date', '2026-11-10');
url.searchParams.append('return_date', '2026-11-17');
url.searchParams.append('type', '1');
url.searchParams.append('currency', 'USD');
url.searchParams.append('hl', 'en');
url.searchParams.append('api_key', apiKey);

const summarise = (item, i) => {
  const legs = item.flights || [];
  return {
    index: i,
    // SerpApi tags each item with the leg it represents: 2 = outbound, 3 = return.
    itemType: item.type,
    hasReturnLegIndicator: item.has_return ? true : false,
    itemKeys: Object.keys(item).filter((k) => !k.startsWith('_')),
    legCount: legs.length,
    legSummary: legs.map((l) => ({
      flight_number: l.flight_number,
      date: l.departure_airport?.date,
      dep: l.departure_airport?.id,
      arr: l.arrival_airport?.id,
      dep_time: l.departure_airport?.time,
      arr_time: l.arrival_airport?.time,
      has_airplane: Boolean(l.airplane),
      airplane: l.airplane ?? null,
    })),
    total_duration: item.total_duration ?? null,
    price: item.price ?? null,
  };
};

const run = async () => {
  const res = await fetch(url);
  const json = await res.json();

  if (json.error) {
    console.error('SerpApi error:', json.error);
    process.exit(1);
  }

  const best = json.best_flights || [];
  const other = json.other_flights || [];

  console.log('\n=== ANSWER: are outbound and return legs in the SAME item? ===');
  const outbound = best.filter((i) => i.type === 2);
  const ret = best.filter((i) => i.type === 3);
  console.log(`best_flights: ${best.length} total | type=2 (outbound): ${outbound.length} | type=3 (return): ${ret.length}`);
  console.log(
    outbound.some((i) => (i.flights || []).length > 1)
      ? 'OUTBOUND items have >1 leg (connecting flight, not a round-trip pairing)'
      : 'Outbound items have a single leg each'
  );
  if (outbound[0]) {
    console.log(
      `sample outbound item legCount: ${(outbound[0].flights || []).length}  -> ${
        (outbound[0].flights || []).length > 1 ? 'legs are CONNECTING flights' : 'single leg'
      }`
    );
  }

  console.log('\n=== Does item.flights ever mix outbound + return dates? ===');
  const mixed = [...best, ...other].filter((i) => {
    const legs = i.flights || [];
    const dates = new Set(legs.map((l) => l.departure_airport?.date?.slice(0, 10)));
    return dates.size > 1;
  });
  console.log(mixed.length === 0
    ? 'No item mixes departure dates -> each item is a single-direction itinerary. Current firstLeg/lastLeg mapping is SAFE for one direction.'
    : `${mixed.length} item(s) mix departure dates -> current mapping IS broken, shown below:`);
  mixed.slice(0, 2).forEach((i, n) => console.log(JSON.stringify(summarise(i, n), null, 2)));

  console.log('\n=== first 3 best_flights ===');
  best.slice(0, 3).forEach((i, n) => console.log(JSON.stringify(summarise(i, n), null, 2)));

  console.log('\n=== first 3 other_flights ===');
  other.slice(0, 3).forEach((i, n) => console.log(JSON.stringify(summarise(i, n), null, 2)));

  console.log('\n=== fields the current mapper throws away ===');
  const sample = best[0];
  if (sample) {
    const firstLeg = sample.flights?.[0] || {};
    console.log('leg keys:', Object.keys(firstLeg).join(', '));
    console.log('has travel_class:', Boolean(firstLeg.travel_class), '| has aircraft:', Boolean(firstLeg.aircraft));
    console.log('has carbon_emissions:', Boolean(sample.carbon_emissions));
  }
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
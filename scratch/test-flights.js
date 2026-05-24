const fetch = require('node-fetch');

async function test() {
  const apiKey = '4582a954735ff7327c5d832dfdcf967046e3ec2c74b9cba1538231ea259d98fb';
  // Test SGN to SFO
  const url1 = `https://serpapi.com/search.json?engine=google_flights&departure_id=SGN&arrival_id=SFO&outbound_date=2026-06-01&currency=USD&hl=en&type=2&api_key=${apiKey}`;
  // Test /m/0hn4h to SFO
  const url2 = `https://serpapi.com/search.json?engine=google_flights&departure_id=/m/0hn4h&arrival_id=SFO&outbound_date=2026-06-01&currency=USD&hl=en&type=2&api_key=${apiKey}`;

  console.log("Testing with SGN IATA...");
  try {
    const res = await fetch(url1);
    const data = await res.json();
    console.log("SGN Status:", res.status);
    if (data.error) console.log("SGN Error:", data.error);
    else console.log("SGN Success: Found flights count =", (data.best_flights || []).length + (data.other_flights || []).length);
  } catch (err) {
    console.error(err);
  }

  console.log("\nTesting with /m/0hn4h (Ho Chi Minh City KGMID)...");
  try {
    const res = await fetch(url2);
    const data = await res.json();
    console.log("KGMID Status:", res.status);
    console.log("KGMID Data:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(err);
  }
}

test();

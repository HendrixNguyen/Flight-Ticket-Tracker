const fetch = require('node-fetch');

async function test() {
  const apiKey = '4582a954735ff7327c5d832dfdcf967046e3ec2c74b9cba1538231ea259d98fb';
  const url = `https://serpapi.com/search.json?engine=google_flights_autocomplete&q=Tan%20Son%20Nhat&hl=en&api_key=${apiKey}`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(err);
  }
}

test();

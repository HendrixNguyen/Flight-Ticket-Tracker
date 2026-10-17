// Mock historical price data generator
// In a real implementation, this would come from a database or external API
function generateMockPriceHistory(basePrice: number, days: number = 30): {
  points: { date: string; price: number }[];
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  volatility: number;
  trend: 'up' | 'down' | 'stable';
  prediction: string;
} {
  const points: { date: string; price: number }[] = [];
  let total = 0;
  let min = Infinity;
  let max = -Infinity;

  // Generate prices with some random walk and weekly patterns
  let price = basePrice;
  const trendFactor = (Math.random() - 0.5) * 0.02; // Slight trend -2% to +2% over period

  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - i));

    // Add weekly pattern (weekends more expensive)
    const dayOfWeek = date.getDay();
    const weekendMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 1.2 : 1.0;

    // Add some random noise
    const noise = 1 + (Math.random() - 0.5) * 0.1; // ±5% noise
    price = price * (1 + trendFactor) * weekendMultiplier * noise;

    // Ensure price stays within reasonable bounds
    price = Math.max(basePrice * 0.5, Math.min(basePrice * 2.0, price));

    points.push({
      date: date.toISOString().slice(0, 10),
      price: Math.round(price * 100) / 100,
    });

    total += price;
    if (price < min) min = price;
    if (price > max) max = price;
  }

  const average = total / days;

  // Calculate volatility (standard deviation)
  let sumOfSquares = 0;
  for (const p of points) {
    sumOfSquares += Math.pow(p.price - average, 2);
  }
  const volatility = Math.sqrt(sumOfSquares / days);

  // Determine trend
  const firstWeekAvg =
    points.slice(0, 7).reduce((sum, p) => sum + p.price, 0) / 7;
  const lastWeekAvg =
    points.slice(points.length - 7).reduce((sum, p) => sum + p.price, 0) / 7;

  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (lastWeekAvg > firstWeekAvg * 1.05) trend = 'up';
  else if (lastWeekAvg < firstWeekAvg * 0.95) trend = 'down';

  // Generate prediction
  let prediction = '';
  if (trend === 'up') {
    prediction = 'Prices are expected to rise. Consider booking soon.';
  } else if (trend === 'down') {
    prediction = 'Prices are expected to drop. Consider waiting if flexible.';
  } else {
    prediction = 'Prices are expected to remain stable.';
  }

  return {
    points,
    averagePrice: Math.round(average * 100) / 100,
    minPrice: Math.round(min * 100) / 100,
    maxPrice: Math.round(max * 100) / 100,
    volatility: Math.round(volatility * 100) / 100,
    trend,
    prediction,
  };
}

export default defineEventHandler((event) => {
  // Get query parameters
  const query = getQuery(event);

  // For demonstration, we'll generate mock data based on the search parameters
  // In a real implementation, we would query a database or external API

  // Use destination or route to seed the random data generation consistently
  const seed =
    String(query.destination || query.from || query.to || 'unknown') +
    String(query.checkIn || query.date || '') +
    String(query.checkOut || query.returnDate || '');

  // Simple hash function for consistent seeding
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Use the hash to determine a base price
  const basePrice = 100 + (Math.abs(hash) % 400); // Base price between 100-500

  // Generate mock historical data
  const historyData = generateMockPriceHistory(basePrice);

  return historyData;
});
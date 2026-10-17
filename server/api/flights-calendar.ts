// Mock price calendar data generator
// In a real implementation, this would come from a database or external API
function generateMockPriceCalendar(basePrice: number, totalDays: number = 30): {
  weeks: { days: { date: string; price: number; available: boolean }[] }[];
  minPrice: number;
  maxPrice: number;
  averagePrice: number;
  cheapestDate: string;
  mostExpensiveDate: string;
} {
  const weeks: { days: { date: string; price: number; available: boolean }[] }[] = [];
  let minPrice = Infinity;
  let maxPrice = -Infinity;
  let totalPrice = 0;
  let count = 0;
  let cheapestDate = '';
  let mostExpensiveDate = '';

  // Start from today
  const startDate = new Date();

  // Generate data for the specified number of days
  for (let week = 0; week < Math.ceil(totalDays / 7); week++) {
    const weekDays: { date: string; price: number; available: boolean }[] = [];

    for (let day = 0; day < 7; day++) {
      const dayIndex = week * 7 + day;
      if (dayIndex >= totalDays) break;

      const date = new Date(startDate);
      date.setDate(date.getDate() + dayIndex);

      // Generate price with weekly pattern (weekends more expensive) and some randomness
      let price = basePrice;
      const dayOfWeek = date.getDay();
      const weekendMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 1.3 : 1.0;

      // Add some weekly fluctuation
      const weekOfYear = Math.floor(
        (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) /
          (1000 * 60 * 60 * 24 * 7)
      );
      const weeklyCycle = 1 + Math.sin(weekOfYear * 0.2) * 0.1;

      // Add some random noise
      const noise = 1 + (Math.random() - 0.5) * 0.2;
      price = price * weekendMultiplier * weeklyCycle * noise;

      // Ensure price stays within reasonable bounds
      price = Math.max(basePrice * 0.5, Math.min(basePrice * 2.0, price));

      const dateStr = date.toISOString().slice(0, 10);

      weekDays.push({
        date: dateStr,
        price: Math.round(price * 100) / 100,
        available: true,
      });

      // Update min/max stats
      totalPrice += price;
      count++;

      if (price < minPrice) {
        minPrice = price;
        cheapestDate = dateStr;
      }
      if (price > maxPrice) {
        maxPrice = price;
        mostExpensiveDate = dateStr;
      }
    }

    weeks.push({ days: weekDays });
  }

  const averagePrice = totalPrice / count;

  return {
    weeks,
    minPrice: Math.round(minPrice * 100) / 100,
    maxPrice: Math.round(maxPrice * 100) / 100,
    averagePrice: Math.round(averagePrice * 100) / 100,
    cheapestDate,
    mostExpensiveDate,
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
    String(query.adults || '') +
    String(query.rooms || '');

  // Simple hash function for consistent seeding
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Use the hash to determine a base price
  const basePrice = 100 + (Math.abs(hash) % 400); // Base price between 100-500

  // Generate mock price calendar data
  const calendarData = generateMockPriceCalendar(basePrice);

  return calendarData;
});
import { PrismaClient } from '@prisma/client';

// Mock price calendar data generator
// In a real implementation, this would come from a database or external API
function generateMockPriceCalendar(basePrice: number, days: number = 30): {
  weeks: PriceCalendarWeek[];
  minPrice: number;
  maxPrice: number;
  averagePrice: number;
  cheapestDate: string;
  mostExpensiveDate: string;
} {
  const weeks: PriceCalendarWeek[] = [];
  let minPrice = Infinity;
  let maxPrice = -Infinity;
  let totalPrice = 0;
  let count = 0;
  let cheapestDate = '';
  let mostExpensiveDate = '';
  let cheapestPrice = Infinity;
  let mostExpensivePrice = -Infinity;
  
  // Start from today
  const startDate = new Date();
  
  // Generate data for the specified number of days
  for (let week = 0; week < Math.ceil(days / 7); week++) {
    const days: PriceCalendarDay[] = [];
    
    for (let day = 0; day < 7; day++) {
      const dayIndex = week * 7 + day;
      if (dayIndex >= days) break;
      
      const date = new Date(startDate);
      date.setDate(date.getDate() + dayIndex);
      
      // Generate price with weekly pattern (weekends more expensive) and some randomness
      let price = basePrice;
      const dayOfWeek = date.getDay();
      const weekendMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.4 : 1.0; // Weekends more expensive for hotels
      
      // Add some weekly fluctuation
      const weekOfYear = date.getWeek ? date.getWeek() : Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0)).getTime() / (1000 * 60 * 60 * 24 * 7));
      const weeklyCycle = 1 + Math.sin(weekOfYear * 0.2) * 0.15; // ±15% weekly cycle
      
      // Add some random noise
      const noise = 1 + (Math.random() - 0.5) * 0.25; // ±12.5% noise
      price = price * weekendMultiplier * weeklyCycle * noise;
      
      // Ensure price stays within reasonable bounds
      price = Math.max(basePrice * 0.4, Math.min(basePrice * 2.2, price));
      
      const dateStr = date.toISOString().split('T')[0];
      
      days.push({
        date: dateStr,
        price: Math.round(price * 100) / 100,
        available: true
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
      
      if (price < cheapestPrice) {
        cheapestPrice = price;
        cheapestDate = dateStr;
      }
      if (price > mostExpensivePrice) {
        mostExpensivePrice = price;
        mostExpensiveDate = dateStr;
      }
    }
    
    weeks.push({ days });
  }
  
  const averagePrice = totalPrice / count;
  
  return {
    weeks,
    minPrice: Math.round(minPrice * 100) / 100,
    maxPrice: Math.round(maxPrice * 100) / 100,
    averagePrice: Math.round(averagePrice * 100) / 100,
    cheapestDate,
    mostExpensiveDate
  };
}

export default defineEventHandler((event) => {
  // Get query parameters
  const query = getQuery(event);
  
  // For demonstration, we'll generate mock data based on the search parameters
  // In a real implementation, we would query a database or external API
  
  // Use destination or route to seed the random data generation consistently
  const seed = (query.destination || query.from || query.to || 'unknown') + 
               (query.adults || '') +
               (query.rooms || '');
  
  // Simple hash function for consistent seeding
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Use the hash to determine a base price
  const basePrice = 80 + (Math.abs(hash) % 320); // Base price between 80-400
  
  // Generate mock price calendar data
  const calendarData = generateMockPriceCalendar(basePrice);
  
  return calendarData;
});
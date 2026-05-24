import type { Hotel, HotelApiResponse } from '../../types';

// Gorgeous fallback hotels for premium offline presentation
const MOCK_HOTELS: Hotel[] = [
  {
    id: 'sf_fairmont',
    name: 'The Fairmont San Francisco',
    description: 'World-renowned hotel atop Nob Hill offering luxurious rooms, spectacular views, and the famous Tonga Room tiki lounge.',
    location: 'Nob Hill, San Francisco, CA',
    gps: { latitude: 37.7925, longitude: -122.4103 },
    rating: 4.6,
    reviewsCount: 3420,
    pricePerNight: 289,
    currency: 'USD',
    thumbnail: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&auto=format&fit=crop&q=80'
    ],
    amenities: ['Free WiFi', 'Fitness Center', 'Spa & Wellness', 'Bar & Restaurant', 'Pet Friendly', 'Valet Parking'],
    classRating: 5
  },
  {
    id: 'ny_standard',
    name: 'The Standard, High Line',
    description: 'Towering above the High Line in Manhattan\'s Meatpacking District, featuring floor-to-ceiling windows with sweeping skyline views.',
    location: 'Meatpacking District, New York, NY',
    gps: { latitude: 40.7409, longitude: -74.0079 },
    rating: 4.4,
    reviewsCount: 2840,
    pricePerNight: 350,
    currency: 'USD',
    thumbnail: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=600&auto=format&fit=crop&q=80'
    ],
    amenities: ['Free WiFi', 'Rooftop Bar', 'Fitness Center', 'Bicycles Available', 'Restaurant', 'Meeting Facilities'],
    classRating: 4
  },
  {
    id: 'lon_shangrila',
    name: 'Shangri-La The Shard, London',
    description: 'Occupying levels 34-52 of London\'s iconic Shard, providing floor-to-ceiling windows with breathtaking city panoramas and an indoor infinity pool.',
    location: 'Southwark, London, UK',
    gps: { latitude: 51.5045, longitude: -0.0865 },
    rating: 4.8,
    reviewsCount: 1980,
    pricePerNight: 580,
    currency: 'USD',
    thumbnail: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&auto=format&fit=crop&q=80'
    ],
    amenities: ['Free WiFi', 'Indoor Pool', 'Skybar', 'Luxury Spa', 'Fitness Studio', '24-hour Room Service'],
    classRating: 5
  },
  {
    id: 'paris_ritz',
    name: 'Ritz Paris',
    description: 'An emblem of French luxury and art de vivre on Place Vendôme, offering legendary suites, a pristine indoor pool, and world-class fine dining.',
    location: 'Place Vendôme, Paris, France',
    gps: { latitude: 48.8682, longitude: 2.3294 },
    rating: 4.9,
    reviewsCount: 1540,
    pricePerNight: 720,
    currency: 'USD',
    thumbnail: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80'
    ],
    amenities: ['Indoor Pool', 'Historic Gardens', 'Chanel Spa', 'Michelin Restaurant', 'Bar Hemingway', 'Limousine Service'],
    classRating: 5
  },
  {
    id: 'lv_bellagio',
    name: 'Bellagio Hotel & Casino',
    description: 'An elegant resort styled after Italian villages, featuring the famous dancing fountains, rich casinos, high-end shops, and botanical conservatory.',
    location: 'The Strip, Las Vegas, NV',
    gps: { latitude: 36.1126, longitude: -115.1767 },
    rating: 4.5,
    reviewsCount: 9850,
    pricePerNight: 169,
    currency: 'USD',
    thumbnail: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600&auto=format&fit=crop&q=80'
    ],
    amenities: ['Multiple Outdoor Pools', 'Casino', 'Spa & Salon', 'Fountain View Dining', 'Botanical Gardens', 'Fitness Center'],
    classRating: 5
  },
  {
    id: 'sg_mbs',
    name: 'Marina Bay Sands',
    description: 'An iconic resort structure crowned by the world\'s largest rooftop infinity pool, offering a massive casino, luxurious shopping, and celebrity-chef dining.',
    location: 'Marina Bay, Singapore',
    gps: { latitude: 1.2829, longitude: 103.8584 },
    rating: 4.7,
    reviewsCount: 12500,
    pricePerNight: 450,
    currency: 'USD',
    thumbnail: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&auto=format&fit=crop&q=80'
    ],
    amenities: ['Rooftop Infinity Pool', 'Skypark Observation Deck', 'Casino', 'Nightclub & Lounges', 'Luxury Shopping Mall', 'Spa'],
    classRating: 5
  }
];

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const config = useRuntimeConfig(event);

  const destination = (query.destination as string || '').trim();
  const checkIn = (query.checkIn as string || '').trim();
  const checkOut = (query.checkOut as string || '').trim();
  const adults = Number(query.adults) || 1;
  const rooms = Number(query.rooms) || 1;

  if (!destination || !checkIn || !checkOut) {
    return {
      success: false,
      data: [],
      error: 'Missing required parameters: destination, checkIn, checkOut',
    } as HotelApiResponse;
  }

  // Handle mock fallback if SerpApi key is missing
  if (!config.serpApiKey) {
    console.warn('SerpApi Key is missing. Active fallback mock hotel data.');
    
    // Simple filter to match destination search
    const lowerDest = destination.toLowerCase();
    let filteredHotels = MOCK_HOTELS.filter((hotel) =>
      hotel.name.toLowerCase().includes(lowerDest) ||
      hotel.location.toLowerCase().includes(lowerDest)
    );

    // If nothing matches, return all mock hotels to keep UI beautiful
    if (filteredHotels.length === 0) {
      filteredHotels = MOCK_HOTELS;
    }

    // Add search-specific pricing calculation (mock multiplier based on room count and days)
    const start = new Date(checkIn).getTime();
    const end = new Date(checkOut).getTime();
    const nights = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24))) || 1;

    const modifiedHotels = filteredHotels.map((h) => ({
      ...h,
      pricePerNight: Math.round(h.pricePerNight * (0.9 + Math.random() * 0.2)), // Slight randomized pricing variance
      totalPrice: Math.round(h.pricePerNight * nights * rooms),
    }));

    return {
      success: true,
      data: modifiedHotels,
    } as HotelApiResponse;
  }

  try {
    const serpApiUrl = new URL('https://serpapi.com/search.json');
    serpApiUrl.searchParams.append('engine', 'google_hotels');
    serpApiUrl.searchParams.append('q', destination);
    serpApiUrl.searchParams.append('check_in_date', checkIn);
    serpApiUrl.searchParams.append('check_out_date', checkOut);
    serpApiUrl.searchParams.append('adults', adults.toString());
    serpApiUrl.searchParams.append('hl', 'en');
    serpApiUrl.searchParams.append('currency', 'USD');
    serpApiUrl.searchParams.append('api_key', config.serpApiKey);

    const response: any = await $fetch(serpApiUrl.toString());

    if (response.error) {
      return {
        success: false,
        data: [],
        error: response.error,
      } as HotelApiResponse;
    }

    const properties = response.properties || [];
    const mappedHotels: Hotel[] = properties.map((item: any) => {
      // Safely extract price metrics
      const pricePerNight = item.rate_per_night?.extracted_lowest || item.rate_per_night?.lowest || item.price || 0;
      const totalPrice = item.total_rate?.extracted_lowest || item.total_rate?.lowest || item.total_price || undefined;

      // Normalize images
      const images: string[] = [];
      if (item.images && Array.isArray(item.images)) {
        item.images.forEach((img: any) => {
          if (typeof img === 'string') {
            images.push(img);
          } else if (img.thumbnail) {
            images.push(img.thumbnail);
          }
        });
      }

      return {
        id: item.property_token || item.kgmid || `hotel-${Math.random().toString(36).substring(2, 11)}`,
        name: item.name || 'Unnamed Luxury Hotel',
        description: item.description || 'Stunning property with premium services and elegant local access.',
        location: item.address || 'Central City Destination',
        gps: item.gps_coordinates ? {
          latitude: item.gps_coordinates.latitude,
          longitude: item.gps_coordinates.longitude
        } : undefined,
        rating: item.overall_rating || undefined,
        reviewsCount: item.reviews || undefined,
        pricePerNight: typeof pricePerNight === 'string' ? parseFloat(pricePerNight.replace(/[^0-9.]/g, '')) : pricePerNight,
        totalPrice: typeof totalPrice === 'string' ? parseFloat(totalPrice.replace(/[^0-9.]/g, '')) : totalPrice,
        currency: 'USD',
        thumbnail: item.thumbnail || images[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80',
        images: images.length > 0 ? images : undefined,
        amenities: item.amenities || [],
        classRating: item.class_rating || undefined,
      };
    });

    return {
      success: true,
      data: mappedHotels,
    } as HotelApiResponse;
  } catch (error: any) {
    console.error('Error fetching hotel data from SerpApi:', error);
    
    // Fall back to filtered mock hotels if SerpApi fails
    const lowerDest = destination.toLowerCase();
    let filteredHotels = MOCK_HOTELS.filter((hotel) =>
      hotel.name.toLowerCase().includes(lowerDest) ||
      hotel.location.toLowerCase().includes(lowerDest)
    );

    if (filteredHotels.length === 0) {
      filteredHotels = MOCK_HOTELS;
    }

    const start = new Date(checkIn).getTime();
    const end = new Date(checkOut).getTime();
    const nights = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24))) || 1;

    const modifiedHotels = filteredHotels.map((h) => ({
      ...h,
      pricePerNight: Math.round(h.pricePerNight * (0.95 + Math.random() * 0.1)),
      totalPrice: Math.round(h.pricePerNight * nights * rooms),
    }));

    return {
      success: true,
      data: modifiedHotels,
      error: error.message || 'SerpApi hotel crawler experienced a connection error. Local database active.',
    } as HotelApiResponse;
  }
});

/**
 * FLOWSHIELD — Location Geocoding Service
 *
 * Uses OpenStreetMap Nominatim for free geocoding with zero API keys.
 * Includes in-memory caching and offline/fast fallbacks for popular cities.
 */

export interface GeocodedLocation {
  name: string;
  displayName: string;
  lat: number;
  lon: number;
}

export const DEFAULT_LOCATION: GeocodedLocation = {
  name: 'Whitefield, Bengaluru',
  displayName: 'Whitefield, Bengaluru, Karnataka, 560066, India',
  lat: 12.9698,
  lon: 77.7499,
};

// Pre-configured coordinates for instantaneous resolution & offline resilience
const LOCATION_PRESETS: Record<string, GeocodedLocation> = {
  'nuwakot, bagamati province, nepal': {
    name: 'Nuwakot, Bagamati Province, Nepal',
    displayName: 'Nuwakot, Bagamati Province, Nepal',
    lat: 27.9150,
    lon: 85.1650,
  },
  'nuwakot': {
    name: 'Nuwakot, Bagamati Province, Nepal',
    displayName: 'Nuwakot, Bagamati Province, Nepal',
    lat: 27.9150,
    lon: 85.1650,
  },
  'whitefield, bengaluru': {
    name: 'Whitefield, Bengaluru',
    displayName: 'Whitefield, Bengaluru, Karnataka, 560066, India',
    lat: 12.9698,
    lon: 77.7499,
  },
  'whitefield': {
    name: 'Whitefield, Bengaluru',
    displayName: 'Whitefield, Bengaluru, Karnataka, 560066, India',
    lat: 12.9698,
    lon: 77.7499,
  },
  'koramangala, bengaluru': {
    name: 'Koramangala, Bengaluru',
    displayName: 'Koramangala, Bengaluru, Karnataka, 560034, India',
    lat: 12.9352,
    lon: 77.6245,
  },
  'koramangala': {
    name: 'Koramangala, Bengaluru',
    displayName: 'Koramangala, Bengaluru, Karnataka, 560034, India',
    lat: 12.9352,
    lon: 77.6245,
  },
  'mysore': {
    name: 'Mysore, Karnataka',
    displayName: 'Mysuru, Mysuru district, Karnataka, India',
    lat: 12.2958,
    lon: 76.6394,
  },
  'mysuru': {
    name: 'Mysuru, Karnataka',
    displayName: 'Mysuru, Mysuru district, Karnataka, India',
    lat: 12.2958,
    lon: 76.6394,
  },
  'chennai': {
    name: 'Chennai, Tamil Nadu',
    displayName: 'Chennai, Tamil Nadu, 600001, India',
    lat: 13.0827,
    lon: 80.2707,
  },
  'patna': {
    name: 'Patna, Bihar',
    displayName: 'Patna, Bihar, 800001, India',
    lat: 25.5941,
    lon: 85.1376,
  },
  'mumbai': {
    name: 'Mumbai, Maharashtra',
    displayName: 'Mumbai, Maharashtra, 400001, India',
    lat: 19.076,
    lon: 72.8777,
  },
  'bengaluru': {
    name: 'Bengaluru, Karnataka',
    displayName: 'Bengaluru, Karnataka, 560001, India',
    lat: 12.9716,
    lon: 77.5946,
  },
  'bangalore': {
    name: 'Bengaluru, Karnataka',
    displayName: 'Bengaluru, Karnataka, 560001, India',
    lat: 12.9716,
    lon: 77.5946,
  },
  'hyderabad': {
    name: 'Hyderabad, Telangana',
    displayName: 'Hyderabad, Telangana, 500001, India',
    lat: 17.385,
    lon: 78.4867,
  },
  'delhi': {
    name: 'Delhi, India',
    displayName: 'New Delhi, Delhi, 110001, India',
    lat: 28.6139,
    lon: 77.209,
  },
};

const geocodeCache = new Map<string, GeocodedLocation>();

/**
 * Geocode an address/location query using OpenStreetMap Nominatim.
 */
export async function geocodeLocation(query: string): Promise<GeocodedLocation> {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    throw new Error('Please enter a location name');
  }

  // Check in-memory cache
  if (geocodeCache.has(normalized)) {
    return geocodeCache.get(normalized)!;
  }

  // Check instant preset match
  if (LOCATION_PRESETS[normalized]) {
    const preset = LOCATION_PRESETS[normalized];
    geocodeCache.set(normalized, preset);
    return preset;
  }

  // Check fuzzy preset match
  for (const [key, preset] of Object.entries(LOCATION_PRESETS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      geocodeCache.set(normalized, preset);
      return preset;
    }
  }

  // Call OpenStreetMap Nominatim API
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`;
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Geocoding failed with HTTP status ${response.status}`);
    }

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error(`Location "${query}" could not be found. Try adding a city or state name.`);
    }

    const first = data[0];
    const lat = parseFloat(first.lat);
    const lon = parseFloat(first.lon);

    if (isNaN(lat) || isNaN(lon)) {
      throw new Error('Invalid coordinates returned from geocoding service');
    }

    // Shorten display name if overly verbose
    const parts = (first.display_name || query).split(', ');
    const shortName = parts.slice(0, 3).join(', ');

    const result: GeocodedLocation = {
      name: shortName,
      displayName: first.display_name || query,
      lat,
      lon,
    };

    geocodeCache.set(normalized, result);
    return result;
  } catch (err: any) {
    // If network aborted or failed, check if we can fall back to general Bengaluru or closest preset
    if (LOCATION_PRESETS[normalized]) {
      return LOCATION_PRESETS[normalized];
    }
    throw new Error(err.message || 'Unable to connect to geocoding service');
  }
}

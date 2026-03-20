import { env } from '../config/env';

type ReverseGeocodeResponse = {
  status: string;
  results?: Array<{
    formatted_address?: string;
    place_id?: string;
    types?: string[];
  }>;
  error_message?: string;
};

type PlaceDetailsResponse = {
  id?: string;
  displayName?: {
    text?: string;
  };
  formattedAddress?: string;
  location?: {
    latitude?: number;
    longitude?: number;
  };
};

type ComputeRoutesResponse = {
  routes?: Array<{
    distanceMeters?: number;
    duration?: string;
    polyline?: {
      encodedPolyline?: string;
    };
  }>;
};

export type LocationContextInput = {
  lat: number;
  lng: number;
  accuracyMeters?: number;
  destination?: {
    lat: number;
    lng: number;
    label?: string;
    placeId?: string;
  };
};

export type LocationContextResponse = {
  provider: {
    googleConfigured: boolean;
    googleUsed: boolean;
  };
  reverseGeocode: {
    formattedAddress: string | null;
    placeId: string | null;
    types: string[];
  } | null;
  venue: {
    label: string | null;
    placeId: string | null;
    formattedAddress: string | null;
    distanceMeters: number | null;
    isWithinRadius: boolean | null;
    radiusMeters: number;
  } | null;
  externalRoute: {
    distanceMeters: number | null;
    durationSeconds: number | null;
    encodedPolyline: string | null;
    travelMode: 'WALK';
    destinationLabel: string | null;
  } | null;
  warnings: string[];
};

type VenueTarget = {
  lat: number;
  lng: number;
  label: string | null;
  placeId: string | null;
  formattedAddress: string | null;
};

const GOOGLE_GEOCODE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
const GOOGLE_PLACES_BASE_URL = 'https://places.googleapis.com/v1/places';
const GOOGLE_ROUTES_URL = 'https://routes.googleapis.com/directions/v2:computeRoutes';
const EARTH_RADIUS_METERS = 6_371_000;

let cachedVenueTarget: VenueTarget | null | undefined;

const isGoogleConfigured = () => Boolean(env.GOOGLE_MAPS_API_KEY);

const parseDurationSeconds = (value: string | undefined) => {
  if (!value) return null;
  const match = /^(\d+(?:\.\d+)?)s$/.exec(value);
  return match ? Math.round(Number.parseFloat(match[1])) : null;
};

const fetchJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, init);
  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(responseText || `Google request failed with status ${response.status}.`);
  }
  return (await response.json()) as T;
};

const buildQueryUrl = (baseUrl: string, params: Record<string, string>) => {
  const url = new URL(baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  return url.toString();
};

const computeDistanceMeters = (
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
) => {
  const originLatRadians = (origin.lat * Math.PI) / 180;
  const destinationLatRadians = (destination.lat * Math.PI) / 180;
  const deltaLatRadians = ((destination.lat - origin.lat) * Math.PI) / 180;
  const deltaLngRadians = ((destination.lng - origin.lng) * Math.PI) / 180;
  const haversine =
    Math.sin(deltaLatRadians / 2) ** 2 +
    Math.cos(originLatRadians) * Math.cos(destinationLatRadians) * Math.sin(deltaLngRadians / 2) ** 2;
  const angularDistance = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
  return EARTH_RADIUS_METERS * angularDistance;
};

const reverseGeocodeLatLng = async (lat: number, lng: number) => {
  if (!isGoogleConfigured()) return null;

  const url = buildQueryUrl(GOOGLE_GEOCODE_URL, {
    latlng: `${lat},${lng}`,
    key: env.GOOGLE_MAPS_API_KEY!,
    language: env.GOOGLE_RESPONSE_LANGUAGE,
  });

  const response = await fetchJson<ReverseGeocodeResponse>(url);
  if (response.status !== 'OK' && response.status !== 'ZERO_RESULTS') {
    throw new Error(response.error_message || `Reverse geocoding failed with status ${response.status}.`);
  }

  const firstResult = response.results?.[0];
  return {
    formattedAddress: firstResult?.formatted_address ?? null,
    placeId: firstResult?.place_id ?? null,
    types: firstResult?.types ?? [],
  };
};

const fetchPlaceDetails = async (placeId: string): Promise<VenueTarget | null> => {
  if (!isGoogleConfigured()) return null;

  const url = `${GOOGLE_PLACES_BASE_URL}/${encodeURIComponent(placeId)}`;
  const response = await fetchJson<PlaceDetailsResponse>(url, {
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': env.GOOGLE_MAPS_API_KEY!,
      'X-Goog-FieldMask': 'id,displayName,formattedAddress,location',
      'Accept-Language': env.GOOGLE_RESPONSE_LANGUAGE,
    },
  });

  const latitude = response.location?.latitude;
  const longitude = response.location?.longitude;
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return {
    lat: Number(latitude),
    lng: Number(longitude),
    label: response.displayName?.text || env.GOOGLE_EVENT_LABEL || null,
    placeId: response.id || placeId,
    formattedAddress: response.formattedAddress || null,
  };
};

const resolveVenueTarget = async (): Promise<VenueTarget | null> => {
  if (cachedVenueTarget !== undefined) return cachedVenueTarget;

  if (Number.isFinite(env.GOOGLE_EVENT_LAT) && Number.isFinite(env.GOOGLE_EVENT_LNG)) {
    cachedVenueTarget = {
      lat: env.GOOGLE_EVENT_LAT!,
      lng: env.GOOGLE_EVENT_LNG!,
      label: env.GOOGLE_EVENT_LABEL || 'Evento',
      placeId: env.GOOGLE_EVENT_PLACE_ID || null,
      formattedAddress: null,
    };
    return cachedVenueTarget;
  }

  if (env.GOOGLE_EVENT_PLACE_ID) {
    cachedVenueTarget = await fetchPlaceDetails(env.GOOGLE_EVENT_PLACE_ID);
    return cachedVenueTarget;
  }

  cachedVenueTarget = null;
  return cachedVenueTarget;
};

const computeWalkingRoute = async (
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  destinationLabel: string | null,
) => {
  if (!isGoogleConfigured()) return null;

  const response = await fetchJson<ComputeRoutesResponse>(GOOGLE_ROUTES_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': env.GOOGLE_MAPS_API_KEY!,
      'X-Goog-FieldMask': 'routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline',
    },
    body: JSON.stringify({
      origin: {
        location: {
          latLng: {
            latitude: origin.lat,
            longitude: origin.lng,
          },
        },
      },
      destination: {
        location: {
          latLng: {
            latitude: destination.lat,
            longitude: destination.lng,
          },
        },
      },
      travelMode: 'WALK',
      polylineQuality: 'OVERVIEW',
    }),
  });

  const route = response.routes?.[0];
  if (!route) return null;

  return {
    distanceMeters: route.distanceMeters ?? null,
    durationSeconds: parseDurationSeconds(route.duration),
    encodedPolyline: route.polyline?.encodedPolyline ?? null,
    travelMode: 'WALK' as const,
    destinationLabel,
  };
};

export const buildLocationContext = async (
  input: LocationContextInput,
): Promise<LocationContextResponse> => {
  const warnings: string[] = [];
  let googleUsed = false;

  let reverseGeocode: LocationContextResponse['reverseGeocode'] = null;
  if (isGoogleConfigured()) {
    try {
      reverseGeocode = await reverseGeocodeLatLng(input.lat, input.lng);
      googleUsed = googleUsed || reverseGeocode !== null;
    } catch (error) {
      warnings.push(error instanceof Error ? error.message : 'Reverse geocoding failed.');
    }
  } else {
    warnings.push('Google Maps integration is not configured on the backend.');
  }

  let venueTarget: VenueTarget | null = null;
  try {
    venueTarget =
      input.destination == null
        ? await resolveVenueTarget()
        : {
            lat: input.destination.lat,
            lng: input.destination.lng,
            label: input.destination.label || null,
            placeId: input.destination.placeId || null,
            formattedAddress: null,
          };
    googleUsed = googleUsed || (Boolean(venueTarget?.placeId) && isGoogleConfigured());
  } catch (error) {
    warnings.push(error instanceof Error ? error.message : 'Venue resolution failed.');
  }

  const venueDistanceMeters = venueTarget
    ? computeDistanceMeters({ lat: input.lat, lng: input.lng }, { lat: venueTarget.lat, lng: venueTarget.lng })
    : null;
  const isWithinVenueRadius =
    venueDistanceMeters == null ? null : venueDistanceMeters <= env.GOOGLE_EVENT_RADIUS_METERS;

  let externalRoute: LocationContextResponse['externalRoute'] = null;
  if (venueTarget && isGoogleConfigured() && !isWithinVenueRadius) {
    try {
      externalRoute = await computeWalkingRoute(
        { lat: input.lat, lng: input.lng },
        { lat: venueTarget.lat, lng: venueTarget.lng },
        venueTarget.label,
      );
      googleUsed = googleUsed || externalRoute !== null;
    } catch (error) {
      warnings.push(error instanceof Error ? error.message : 'External route lookup failed.');
    }
  }

  return {
    provider: {
      googleConfigured: isGoogleConfigured(),
      googleUsed,
    },
    reverseGeocode,
    venue: venueTarget
      ? {
          label: venueTarget.label,
          placeId: venueTarget.placeId,
          formattedAddress: venueTarget.formattedAddress,
          distanceMeters: venueDistanceMeters,
          isWithinRadius: isWithinVenueRadius,
          radiusMeters: env.GOOGLE_EVENT_RADIUS_METERS,
        }
      : null,
    externalRoute,
    warnings,
  };
};

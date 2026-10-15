/**
 * DD WORLD ANTI-CHEAT GPS SECURITY ENGINE
 * Detects mock locations, developer option fake GPS spoofing,
 * out-of-bounds positioning, and impossible teleportation jumps.
 */

export interface AntiCheatResult {
  isFake: boolean;
  reason?: string;
  confidence: number; // 0 to 100
}

export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in KM
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function detectFakeGps(
  coords: GeolocationCoordinates,
  lastKnown?: { lat: number; lng: number; time: number }
): AntiCheatResult {
  const { latitude, longitude, accuracy } = coords;
  const anyCoords = coords as any;

  // 1. Check Native Android / Browser Mock Provider Flags
  if (
    anyCoords.isMock === true ||
    anyCoords.mocked === true ||
    anyCoords.isFromMockProvider === true ||
    anyCoords.mockLocation === true
  ) {
    return {
      isFake: true,
      reason: 'Android Mock Location Provider සක්‍රිය කර ඇත (Developer Options: Mock Location Active)',
      confidence: 100,
    };
  }

  // 2. Unnatural Hardware Flag (Accuracy strictly 0 or NaN indicates virtual emulator/faked provider)
  if (accuracy <= 0 || isNaN(accuracy)) {
    return {
      isFake: true,
      reason: 'අස්වාභාවික GPS සංඥා නිරවද්‍යතාවයක් (Unnatural 0m Accuracy - Fake Signal Injection)',
      confidence: 90,
    };
  }

  // 3. Geographical Bounds Enforcement (Sri Lanka Territory)
  // Sri Lanka boundary approx: Lat 5.8 to 9.9, Lng 79.6 to 82.0
  const isOutsideSriLanka =
    latitude < 5.8 || latitude > 9.9 || longitude < 79.6 || longitude > 82.0;

  if (isOutsideSriLanka) {
    return {
      isFake: true,
      reason: `ශ්‍රී ලංකා භූගෝලීය සීමාවෙන් බැහැර ඛණ්ඩාංක හමුවිය [Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}]`,
      confidence: 95,
    };
  }

  // 4. Teleportation / Impossible Speed Check
  if (lastKnown && lastKnown.time) {
    const elapsedSeconds = (Date.now() - lastKnown.time) / 1000;
    if (elapsedSeconds > 0 && elapsedSeconds < 60) {
      const distanceKm = calculateDistanceKm(
        lastKnown.lat,
        lastKnown.lng,
        latitude,
        longitude
      );
      const speedKmh = (distanceKm / elapsedSeconds) * 3600;

      // If velocity exceeds 180 km/h for a field agent within 60 seconds
      if (distanceKm > 3 && speedKmh > 180) {
        return {
          isFake: true,
          reason: `ස්ථානය ක්ෂණිකව මාරුවීම (Teleportation Spoofing: ${distanceKm.toFixed(1)}km in ${Math.round(elapsedSeconds)}s at ${Math.round(speedKmh)}km/h)`,
          confidence: 85,
        };
      }
    }
  }

  return {
    isFake: false,
    confidence: 0,
  };
}

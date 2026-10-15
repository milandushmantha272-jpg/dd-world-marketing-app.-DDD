/**
 * Geofence Detection & Validation Utilities
 * Provides robust geofence boundary checking with anti-tampering measures
 */

export interface GeoCoordinate {
  latitude: number;
  longitude: number;
  accuracy: number; // meters
  timestamp: number;
  deviceId?: string;
}

export interface GeofenceZone {
  id: string;
  name: string;
  centerLat: number;
  centerLon: number;
  radiusKm: number;
  active: boolean;
}

export interface GeofenceResult {
  isInside: boolean;
  distance: number;
  zone?: GeofenceZone;
  riskLevel: 'safe' | 'warning' | 'critical';
  violation: boolean;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in meters (accurate for short distances)
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Convert degrees to radians
 */
function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Validate GPS coordinate bounds (realistic Earth coordinates)
 * Prevents spoofing with impossible coordinates
 */
export function validateCoordinateBounds(coord: GeoCoordinate): {
  valid: boolean;
  error?: string;
} {
  // Latitude must be between -90 and 90
  if (coord.latitude < -90 || coord.latitude > 90) {
    return {
      valid: false,
      error: `Invalid latitude: ${coord.latitude}. Must be between -90 and 90.`,
    };
  }

  // Longitude must be between -180 and 180
  if (coord.longitude < -180 || coord.longitude > 180) {
    return {
      valid: false,
      error: `Invalid longitude: ${coord.longitude}. Must be between -180 and 180.`,
    };
  }

  // Accuracy must be positive and realistic (max 5000m for consumer GPS)
  if (coord.accuracy <= 0 || coord.accuracy > 5000) {
    return {
      valid: false,
      error: `Invalid GPS accuracy: ${coord.accuracy}m. Must be between 0 and 5000m.`,
    };
  }

  // Timestamp cannot be in future or too far in past (24 hours)
  const now = Date.now();
  const timeDiff = Math.abs(now - coord.timestamp);
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours

  if (coord.timestamp > now + 60000) {
    // Allow 1 minute clock skew
    return {
      valid: false,
      error: `Invalid timestamp: timestamp is in the future.`,
    };
  }

  if (timeDiff > maxAge) {
    return {
      valid: false,
      error: `Stale GPS data: ${timeDiff / 1000 / 60} minutes old.`,
    };
  }

  return { valid: true };
}

/**
 * Check if coordinate is within geofence with accuracy threshold
 * Enforces 100m GPS accuracy requirement
 */
export function checkGeofence(
  coord: GeoCoordinate,
  zone: GeofenceZone
): GeofenceResult {
  // Validate coordinate bounds first
  const boundsCheck = validateCoordinateBounds(coord);
  if (!boundsCheck.valid) {
    return {
      isInside: false,
      distance: Infinity,
      riskLevel: 'critical',
      violation: true,
    };
  }

  // Check GPS accuracy threshold (100m maximum)
  const MAX_ACCURACY_THRESHOLD = 100; // meters
  if (coord.accuracy > MAX_ACCURACY_THRESHOLD) {
    return {
      isInside: false,
      distance: Infinity,
      riskLevel: 'critical',
      violation: true,
    };
  }

  // Calculate actual distance to zone center
  const distance = calculateDistance(
    coord.latitude,
    coord.longitude,
    zone.centerLat,
    zone.centerLon
  );

  // Add accuracy buffer to radius for boundary decision
  const effectiveRadius = zone.radiusKm * 1000 + coord.accuracy;
  const isInside = distance <= effectiveRadius;

  // Determine risk level based on proximity
  let riskLevel: 'safe' | 'warning' | 'critical' = 'safe';
  const bufferZone = zone.radiusKm * 1000 * 0.1; // 10% buffer zone

  if (!isInside && distance < effectiveRadius + bufferZone) {
    riskLevel = 'warning';
  } else if (!isInside) {
    riskLevel = 'critical';
  }

  return {
    isInside,
    distance,
    zone,
    riskLevel,
    violation: riskLevel === 'critical',
  };
}

/**
 * Batch validate multiple location readings for tampering patterns
 * Detects impossible speeds, rapid location jumps, etc.
 */
export function detectLocationTampering(
  locations: GeoCoordinate[]
): {
  isTampered: boolean;
  violations: string[];
  suspiciousIndices: number[];
} {
  const violations: string[] = [];
  const suspiciousIndices: number[] = [];

  // Must have at least 2 points to detect tampering
  if (locations.length < 2) {
    return { isTampered: false, violations, suspiciousIndices };
  }

  // Sort by timestamp
  const sorted = [...locations].sort((a, b) => a.timestamp - b.timestamp);

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];

    // Check time progression
    const timeDiff = curr.timestamp - prev.timestamp;
    if (timeDiff <= 0) {
      violations.push(`Time reversal detected at index ${i}`);
      suspiciousIndices.push(i);
      continue;
    }

    // Calculate speed (km/h)
    const distance = calculateDistance(
      prev.latitude,
      prev.longitude,
      curr.latitude,
      curr.longitude
    );
    const speedKmh = (distance / timeDiff) * 3600000; // Convert ms to hours

    // Enforce realistic speed limit (max 300 km/h - commercial flight speed)
    const MAX_SPEED = 300;
    if (speedKmh > MAX_SPEED) {
      violations.push(
        `Impossible speed detected: ${speedKmh.toFixed(1)} km/h at index ${i}`
      );
      suspiciousIndices.push(i);
    }

    // Check for accuracy degradation pattern (sign of spoofing)
    const accuracyDiff = curr.accuracy - prev.accuracy;
    if (accuracyDiff > 200) {
      // Sudden 200m+ accuracy jump
      violations.push(
        `Suspicious accuracy jump: ${accuracyDiff}m at index ${i}`
      );
      suspiciousIndices.push(i);
    }
  }

  return {
    isTampered: violations.length > 0,
    violations,
    suspiciousIndices,
  };
}

/**
 * Generate geofence report for audit trail
 */
export function generateGeofenceReport(
  coord: GeoCoordinate,
  zone: GeofenceZone,
  result: GeofenceResult
): Record<string, unknown> {
  return {
    timestamp: new Date(coord.timestamp).toISOString(),
    employee: coord.deviceId,
    zone: zone.name,
    latitude: coord.latitude,
    longitude: coord.longitude,
    gpsAccuracy: `${coord.accuracy}m`,
    distance: `${result.distance.toFixed(2)}m`,
    isInside: result.isInside,
    riskLevel: result.riskLevel,
    violation: result.violation,
    accuracyThresholdMet: coord.accuracy <= 100,
    report: {
      generated: new Date().toISOString(),
      version: '1.0',
    },
  };
}

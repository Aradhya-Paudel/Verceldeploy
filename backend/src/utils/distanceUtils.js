/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in kilometers
};

/**
 * Convert degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 */
const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

/**
 * Find nearest ambulance to a location
 * @param {number} latitude - Target latitude
 * @param {number} longitude - Target longitude
 * @param {Array} ambulances - Array of ambulances
 * @returns {Object|null} Nearest ambulance with distance
 */
const findNearestAmbulance = (latitude, longitude, ambulances) => {
  if (!ambulances || ambulances.length === 0) {
    return null;
  }

  let nearest = null;
  let minDistance = Infinity;

  for (const ambulance of ambulances) {
    if (ambulance.status !== "available") continue;

    const distance = calculateDistance(
      latitude,
      longitude,
      ambulance.latitude,
      ambulance.longitude,
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearest = {
        ...ambulance,
        distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
      };
    }
  }

  return nearest;
};

/**
 * Calculate ETA based on distance (assuming average speed of 40 km/h for ambulance)
 * @param {number} distanceKm - Distance in kilometers
 * @returns {number} ETA in minutes
 */
const calculateETA = (distanceKm) => {
  const averageSpeedKmPerHour = 40; // Average ambulance speed in city
  const timeInHours = distanceKm / averageSpeedKmPerHour;
  const timeInMinutes = Math.ceil(timeInHours * 60);
  return timeInMinutes;
};

module.exports = {
  calculateDistance,
  toRadians,
  findNearestAmbulance,
  calculateETA,
};

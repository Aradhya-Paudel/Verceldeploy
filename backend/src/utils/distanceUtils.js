/**
 * Dui location ko distance Haversine formula le nikalne function
 * Calculates distance between two coordinates using Haversine formula
 * @param {number} lat1 - First point ko latitude
 * @param {number} lon1 - First point ko longitude
 * @param {number} lat2 - Second point ko latitude
 * @param {number} lon2 - Second point ko longitude
 * @returns {number} Distance in kilometers
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth ko radius kilometer ma

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // 20 meter (0.02 km) ghataera accurate banaune
  const distance = R * c;
  return Math.max(0, distance - 0.02); // Negative na aaos bhanera
};

/**
 * Degree lai radian ma convert garne function
 * Converts degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 */
const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

/**
 * Diye ko location ma sabai bhanda najik ambulance khojne function
 * Finds nearest ambulance to a location
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

    let distance = calculateDistance(
      latitude,
      longitude,
      ambulance.latitude,
      ambulance.longitude,
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearest = {
        ...ambulance,
        distance: Math.round(distance * 100) / 100, // 2 decimal samma round garne
      };
    }
  }

  return nearest;
};

/**
 * Distance ko base ma ambulance kati minute ma pugchha (average speed 40km/h)
 * Calculates ETA based on distance (assuming average speed of 40 km/h for ambulance)
 * @param {number} distanceKm - Distance in kilometers
 * @returns {number} ETA in minutes
 */
const calculateETA = (distanceKm) => {
  const averageSpeedKmPerHour = 40; // City ma ambulance ko average speed
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

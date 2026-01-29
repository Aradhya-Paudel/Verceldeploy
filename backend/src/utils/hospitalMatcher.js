const { calculateDistance } = require("./distanceUtils");

/**
 * Hospital matching weights haru (kun kura kati important):
 * Blood: 40%, Specialist: 30%, Distance: 20%, Beds: 10%
 * (Blood ko importance 40%, specialist 30%, distance 20%, beds 10%)
 */
const WEIGHTS = {
  blood: 0.4,
  specialist: 0.3,
  distance: 0.2,
  beds: 0.1,
};

/**
 * Injury type anusar kasto specialist chahinchha bhanne mapping
 * Maps injury types to required specialists
 */
const INJURY_SPECIALIST_MAP = {
  "head injury": "Neurologist",
  "head trauma": "Neurologist",
  "brain injury": "Neurologist",
  cardiac: "Cardiologist",
  "heart attack": "Cardiologist",
  "chest pain": "Cardiologist",
  fracture: "Orthopedic Surgeon",
  "bone injury": "Orthopedic Surgeon",
  "broken bone": "Orthopedic Surgeon",
  "spinal injury": "Orthopedic Surgeon",
  burn: "General Surgeon",
  burns: "General Surgeon",
  trauma: "General Surgeon",
  accident: "Emergency Medicine Specialist",
  emergency: "Emergency Medicine Specialist",
  respiratory: "Pulmonologist",
  breathing: "Pulmonologist",
  pediatric: "Pediatrician",
  child: "Pediatrician",
  pregnancy: "Gynecologist",
  maternity: "Gynecologist",
  "eye injury": "Ophthalmologist",
  stomach: "Gastroenterologist",
  abdominal: "Gastroenterologist",
  kidney: "Nephrologist",
  skin: "Dermatologist",
  mental: "Psychiatrist",
  ear: "ENT Specialist",
  throat: "ENT Specialist",
  nose: "ENT Specialist",
};

/**
 * Injury type anusar kun specialist chahinchha bhanne nikalne function
 * Gets required specialist based on injury type
 * @param {string} injuryType - Type of injury
 * @returns {string} Required specialist
 */
const getRequiredSpecialist = (injuryType) => {
  if (!injuryType) return "Emergency Medicine Specialist";

  const lowerInjury = injuryType.toLowerCase();

  for (const [key, specialist] of Object.entries(INJURY_SPECIALIST_MAP)) {
    if (lowerInjury.includes(key)) {
      return specialist;
    }
  }

  return "Emergency Medicine Specialist";
};

/**
 * Hospital ma blood available xa ki xaina ra kati xa bhanera 0-100 samma score dinne function
 * Calculates blood score (0-100) for hospital
 * @param {Object} hospital - Hospital object
 * @param {string} bloodType - Required blood type
 * @param {number} unitsNeeded - Units of blood needed
 * @returns {number} Blood score
 */
const calculateBloodScore = (hospital, bloodType, unitsNeeded = 0) => {
  if (!bloodType || unitsNeeded === 0) return 100; // Blood na chahine bhaye full score

  const bloodInventory = hospital.bloodInventory?.bloodTypes || [];
  const bloodData = bloodInventory.find((b) => b.type === bloodType);

  if (!bloodData) return 0;

  const availableUnits = bloodData.units || 0;

  if (availableUnits >= unitsNeeded) return 100;
  if (availableUnits === 0) return 0;

  return Math.round((availableUnits / unitsNeeded) * 100);
};

/**
 * Hospital ma required specialist kati jana xa bhanera 0-100 samma score dinne function
 * Calculates specialist score (0-100)
 * @param {Object} hospital - Hospital object
 * @param {string} injuryType - Type of injury
 * @returns {number} Specialist score
 */
const calculateSpecialistScore = (hospital, injuryType) => {
  const requiredSpecialist = getRequiredSpecialist(injuryType);
  const staffCount = hospital.staffCount || {};

  const specialistCount = staffCount[requiredSpecialist] || 0;

  if (specialistCount >= 3) return 100;
  if (specialistCount === 2) return 80;
  if (specialistCount === 1) return 50;
  return 0;
};

/**
 * Hospital kati tadha xa bhanera 0-100 samma score dinne function, najik bhaye score dherai
 * Calculates distance score (0-100), nearer hospital gets higher score
 * @param {number} distance - Distance in km
 * @returns {number} Distance score
 */
const calculateDistanceScore = (distance) => {
  // Max distance 50km samma matra consider garincha
  const maxDistance = 50;

  if (distance <= 1) return 100;
  if (distance >= maxDistance) return 0;

  return Math.round(100 - (distance / maxDistance) * 100);
};

/**
 * Hospital ma kati beds available xa bhanera 0-100 samma score dinne function
 * Calculates beds score (0-100)
 * @param {Object} hospital - Hospital object
 * @returns {number} Beds score
 */
const calculateBedsScore = (hospital) => {
  const beds = hospital.bedsAvailable || 0;

  if (beds >= 20) return 100;
  if (beds >= 10) return 70;
  if (beds >= 5) return 40;
  if (beds >= 1) return 20;
  return 0;
};

/**
 * Diye ko hospital bata arko sabai bhanda najik hospital khojne function (afnai ID exclude garera)
 * Finds the nearest hospital to a given hospital (excluding itself)
 * @param {Array} hospitals - Array of hospital objects
 * @param {Object} referenceHospital - The hospital to find the nearest to
 * @returns {Object|null} Nearest hospital or null
 */
const findNearestHospitalToHospital = (hospitals, referenceHospital) => {
  if (!referenceHospital || !hospitals || hospitals.length === 0) return null;

  let minDist = Infinity;
  let nearest = null;

  hospitals.forEach((hospital) => {
    if (hospital.id !== referenceHospital.id) {
      const dist = calculateDistance(
        referenceHospital.latitude,
        referenceHospital.longitude,
        hospital.latitude,
        hospital.longitude,
      );
      if (dist < minDist) {
        minDist = dist;
        nearest = hospital;
      }
    }
  });

  // Console ma ramro dekhine gari info print garne
  if (nearest) {
    const distanceKm = Math.round(minDist * 100) / 100;
    console.log("\n" + "=".repeat(70));
    console.log("🏥 NEAREST HOSPITAL TO BEST HOSPITAL FOUND");
    console.log("=".repeat(70));
    console.log("📍 Best/Destination Hospital:");
    console.log(`   ID: ${referenceHospital.id}`);
    console.log(`   Name: ${referenceHospital.name}`);
    console.log(`   Location: ${referenceHospital.address}`);
    console.log("");
    console.log("🩸 Nearest Hospital (Blood Donor Candidate):");
    console.log(`   ID: ${nearest.id}`);
    console.log(`   Name: ${nearest.name}`);
    console.log(`   Address: ${nearest.address}`);
    console.log(`   Phone: ${nearest.phone}`);
    console.log(`   📏 Distance: ${distanceKm} km`);
    console.log("=".repeat(70) + "\n");

    // Nearest hospital ko object return garne, distance pani huncha
    return {
      ...nearest,
      distanceFromBest: distanceKm,
    };
  }

  return null;
};

/**
 * Casualty ko lagi sabaibhanda optimal hospital choose garne function
 * Finds best matching hospital for a casualty
 * @param {Array} hospitals - Array of hospitals
 * @param {Object} casualtyInfo - Casualty information
 * @param {number} accidentLat - Accident latitude
 * @param {number} accidentLon - Accident longitude
 * @returns {Object} Best matching hospital with scores
 */
const findBestHospital = (
  hospitals,
  casualtyInfo,
  accidentLat,
  accidentLon,
) => {
  const { injuryType, bloodType, bloodUnitsNeeded } = casualtyInfo;

  const scoredHospitals = hospitals
    .filter((h) => h.isAvailable !== false && h.bedsAvailable > 0)
    .map((hospital) => {
      const distance = calculateDistance(
        accidentLat,
        accidentLon,
        hospital.latitude,
        hospital.longitude,
      );

      const bloodScore = calculateBloodScore(
        hospital,
        bloodType,
        bloodUnitsNeeded,
      );
      const specialistScore = calculateSpecialistScore(hospital, injuryType);
      const distanceScore = calculateDistanceScore(distance);
      const bedsScore = calculateBedsScore(hospital);

      const totalScore =
        bloodScore * WEIGHTS.blood +
        specialistScore * WEIGHTS.specialist +
        distanceScore * WEIGHTS.distance +
        bedsScore * WEIGHTS.beds;

      return {
        hospital: {
          id: hospital.id,
          name: hospital.name,
          address: hospital.address,
          phone: hospital.phone,
          latitude: hospital.latitude,
          longitude: hospital.longitude,
          bedsAvailable: hospital.bedsAvailable,
        },
        scores: {
          blood: bloodScore,
          specialist: specialistScore,
          distance: distanceScore,
          beds: bedsScore,
          total: Math.round(totalScore * 100) / 100,
        },
        distance: Math.round(distance * 100) / 100,
        requiredSpecialist: getRequiredSpecialist(injuryType),
      };
    });

  // Sort by total score (descending)
  scoredHospitals.sort((a, b) => b.scores.total - a.scores.total);

  if (scoredHospitals.length > 0) {
    const best = scoredHospitals[0];
    // Best hospital najik arko hospital khojne
    const nearestToBest = findNearestHospitalToHospital(
      hospitals,
      best.hospital,
    );

    // Best hospital ra tesko najikko hospital ko info return garne
    return {
      ...best,
      nearestHospitalForBlood: nearestToBest,
    };
  }
  return null;
};

/**
 * Casualty ko lagi sabai hospital haru score anusar rank garne function
 * Gets all hospitals ranked for a casualty
 * @param {Array} hospitals - Array of hospitals
 * @param {Object} casualtyInfo - Casualty information
 * @param {number} accidentLat - Accident latitude
 * @param {number} accidentLon - Accident longitude
 * @returns {Array} Ranked hospitals with scores
 */
const rankHospitals = (hospitals, casualtyInfo, accidentLat, accidentLon) => {
  const { injuryType, bloodType, bloodUnitsNeeded } = casualtyInfo;

  const scoredHospitals = hospitals
    .filter((h) => h.isAvailable !== false)
    .map((hospital) => {
      const distance = calculateDistance(
        accidentLat,
        accidentLon,
        hospital.latitude,
        hospital.longitude,
      );

      const bloodScore = calculateBloodScore(
        hospital,
        bloodType,
        bloodUnitsNeeded,
      );
      const specialistScore = calculateSpecialistScore(hospital, injuryType);
      const distanceScore = calculateDistanceScore(distance);
      const bedsScore = calculateBedsScore(hospital);

      const totalScore =
        bloodScore * WEIGHTS.blood +
        specialistScore * WEIGHTS.specialist +
        distanceScore * WEIGHTS.distance +
        bedsScore * WEIGHTS.beds;

      return {
        hospital: {
          id: hospital.id,
          name: hospital.name,
          address: hospital.address,
          phone: hospital.phone,
          latitude: hospital.latitude,
          longitude: hospital.longitude,
          bedsAvailable: hospital.bedsAvailable,
        },
        scores: {
          blood: bloodScore,
          specialist: specialistScore,
          distance: distanceScore,
          beds: bedsScore,
          total: Math.round(totalScore * 100) / 100,
        },
        distance: Math.round(distance * 100) / 100,
        requiredSpecialist: getRequiredSpecialist(injuryType),
      };
    });

  // Total score anusar descending ma sort garne
  scoredHospitals.sort((a, b) => b.scores.total - a.scores.total);
  return scoredHospitals;
};

module.exports = {
  WEIGHTS,
  INJURY_SPECIALIST_MAP,
  getRequiredSpecialist,
  calculateBloodScore,
  calculateSpecialistScore,
  calculateDistanceScore,
  calculateBedsScore,
  findBestHospital,
  rankHospitals,
  findNearestHospitalToHospital,
};

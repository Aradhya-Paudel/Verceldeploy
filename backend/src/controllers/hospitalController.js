const {
  getHospitals,
  getHospitalById,
  updateHospital,
  getBloodRequests,
  getAmbulances,
  getCasualties,
} = require("../utils/dataAccess");
const { calculateDistance, calculateETA } = require("../utils/distanceUtils");

/**
 * Get all hospitals
 * GET /api/hospitals
 */
const getAllHospitals = (req, res) => {
  try {
    const hospitals = getHospitals();

    // Remove passwords from response
    const safeHospitals = hospitals.map(({ password, ...rest }) => rest);

    return res.status(200).json({
      success: true,
      message: "Hospitals retrieved successfully",
      data: {
        count: safeHospitals.length,
        hospitals: safeHospitals,
      },
    });
  } catch (error) {
    console.error("Get hospitals error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

/**
 * Get hospital by ID
 * GET /api/hospitals/:id
 */
const getHospital = (req, res) => {
  try {
    const { id } = req.params;
    const hospital = getHospitalById(id);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Hospital not found",
      });
    }

    // Remove password from response
    const { password, ...safeHospital } = hospital;

    return res.status(200).json({
      success: true,
      message: "Hospital retrieved successfully",
      data: {
        hospital: safeHospital,
      },
    });
  } catch (error) {
    console.error("Get hospital error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

/**
 * Get hospital by name
 * GET /api/hospitals/by-name/:name
 */
const getHospitalByName = (req, res) => {
  try {
    const { name } = req.params;
    const hospitals = getHospitals();
    const hospital = hospitals.find(
      (h) => h.name.toLowerCase() === decodeURIComponent(name).toLowerCase(),
    );

    if (!hospital) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Hospital not found",
      });
    }

    // Remove password from response
    const { password, ...safeHospital } = hospital;

    return res.status(200).json({
      success: true,
      message: "Hospital retrieved successfully",
      data: {
        hospital: safeHospital,
      },
    });
  } catch (error) {
    console.error("Get hospital by name error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

/**
 * Get hospital dashboard data
 * GET /api/hospitals/:id/dashboard
 */
const getHospitalDashboard = (req, res) => {
  try {
    const { id } = req.params;
    const hospital = getHospitalById(id);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Hospital not found",
      });
    }

    // Get incoming ambulances
    const ambulances = getAmbulances();
    const incomingAmbulances = ambulances
      .filter(
        (a) =>
          a.destinationHospitalId === parseInt(id) &&
          a.status === "transporting",
      )
      .map((a) => {
        const distance = calculateDistance(
          a.latitude,
          a.longitude,
          hospital.latitude,
          hospital.longitude,
        );
        return {
          id: a.id,
          name: a.name,
          driverName: a.driverName,
          status: a.status,
          distance: Math.round(distance * 100) / 100,
          eta: calculateETA(distance),
        };
      });

    // Get casualties assigned to this hospital
    const allCasualties = getCasualties();
    const hospitalCasualties = allCasualties.filter(
      (c) =>
        c.assignedHospital?.id === parseInt(id) && c.status !== "discharged",
    );

    // Get blood requests
    const allBloodRequests = getBloodRequests();
    const outgoingRequests = allBloodRequests.filter(
      (r) => r.requestingHospitalId === parseInt(id),
    );
    const incomingRequests = allBloodRequests.filter(
      (r) => r.donorHospitalId === parseInt(id),
    );

    // Calculate stats
    const stats = {
      bedsAvailable: hospital.bedsAvailable,
      totalBloodUnits: hospital.bloodInventory?.total || 0,
      ambulanceCount: hospital.ambulanceCount,
      incomingAmbulances: incomingAmbulances.length,
      pendingCasualties: hospitalCasualties.filter(
        (c) => c.status === "hospital_assigned",
      ).length,
      admittedPatients: hospitalCasualties.filter(
        (c) => c.status === "admitted",
      ).length,
      pendingBloodRequests: outgoingRequests.filter(
        (r) => r.status === "pending",
      ).length,
    };

    // Staff summary
    const staffSummary = {
      total: Object.values(hospital.staffCount || {}).reduce(
        (a, b) => a + b,
        0,
      ),
      bySpecialty: hospital.staffCount,
    };

    const { password, ...safeHospital } = hospital;

    return res.status(200).json({
      success: true,
      message: "Dashboard data retrieved successfully",
      data: {
        hospital: safeHospital,
        stats: stats,
        incomingAmbulances: incomingAmbulances,
        casualties: hospitalCasualties,
        bloodRequests: {
          outgoing: outgoingRequests,
          incoming: incomingRequests,
        },
        staffSummary: staffSummary,
      },
    });
  } catch (error) {
    console.error("Get hospital dashboard error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

/**
 * Update hospital beds
 * PATCH /api/hospitals/:id/beds
 */
const updateBeds = (req, res) => {
  try {
    const { id } = req.params;
    const { bedsAvailable } = req.body;

    if (bedsAvailable === undefined || bedsAvailable < 0) {
      return res.status(400).json({
        success: false,
        error: "Validation Error",
        message: "Valid beds count is required",
      });
    }

    const hospital = getHospitalById(id);
    if (!hospital) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Hospital not found",
      });
    }

    const updatedHospital = updateHospital(id, {
      bedsAvailable: parseInt(bedsAvailable),
    });

    const { password, ...safeHospital } = updatedHospital;

    return res.status(200).json({
      success: true,
      message: "Beds updated successfully",
      data: {
        hospital: safeHospital,
      },
    });
  } catch (error) {
    console.error("Update beds error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

/**
 * Update blood inventory
 * PATCH /api/hospitals/:id/blood-inventory
 * Accepts either:
 * - { bloodType, units, operation } for single update
 * - { bloodTypes: [{ type, liters }] } for bulk update
 */
const updateBloodInventory = (req, res) => {
  try {
    const { id } = req.params;
    const { bloodType, units, operation, bloodTypes } = req.body;

    const hospital = getHospitalById(id);
    if (!hospital) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Hospital not found",
      });
    }

    const bloodInventory = { ...hospital.bloodInventory };
    const validBloodTypes = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

    // Handle bulk update with bloodTypes array
    if (bloodTypes && Array.isArray(bloodTypes)) {
      let total = 0;
      bloodInventory.bloodTypes = validBloodTypes.map((type) => {
        const incoming = bloodTypes.find((b) => b.type === type);
        const liters = incoming ? parseInt(incoming.liters) || 0 : 0;
        total += liters;
        return { type, liters };
      });
      bloodInventory.total = total;
    } else {
      // Handle single blood type update
      if (!bloodType || units === undefined) {
        return res.status(400).json({
          success: false,
          error: "Validation Error",
          message:
            "Blood type and units are required, or provide bloodTypes array",
        });
      }

      if (!validBloodTypes.includes(bloodType)) {
        return res.status(400).json({
          success: false,
          error: "Validation Error",
          message: `Invalid blood type. Valid values: ${validBloodTypes.join(", ")}`,
        });
      }

      const bloodTypeIndex = bloodInventory.bloodTypes.findIndex(
        (b) => b.type === bloodType,
      );

      if (bloodTypeIndex === -1) {
        return res.status(400).json({
          success: false,
          error: "Not Found",
          message: "Blood type not found in inventory",
        });
      }

      let newUnits;
      if (operation === "add") {
        newUnits =
          bloodInventory.bloodTypes[bloodTypeIndex].units + parseInt(units);
      } else if (operation === "subtract") {
        newUnits =
          bloodInventory.bloodTypes[bloodTypeIndex].units - parseInt(units);
        if (newUnits < 0) newUnits = 0;
      } else {
        newUnits = parseInt(units);
      }

      const oldUnits = bloodInventory.bloodTypes[bloodTypeIndex].units;
      bloodInventory.bloodTypes[bloodTypeIndex].units = newUnits;
      bloodInventory.total = bloodInventory.total - oldUnits + newUnits;
    }

    const updatedHospital = updateHospital(id, { bloodInventory });
    const { password, ...safeHospital } = updatedHospital;

    return res.status(200).json({
      success: true,
      message: "Blood inventory updated successfully",
      data: {
        hospital: safeHospital,
      },
    });
  } catch (error) {
    console.error("Update blood inventory error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

/**
 * Update staff count
 * PATCH /api/hospitals/:id/staff
 * Accepts either:
 * - { specialty, count } for single update
 * - { staffCount: { specialty: count, ... } } for bulk update
 */
const updateStaff = (req, res) => {
  try {
    const { id } = req.params;
    const { specialty, count, staffCount: bulkStaffCount } = req.body;

    const hospital = getHospitalById(id);
    if (!hospital) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Hospital not found",
      });
    }

    let staffCount;

    // Handle bulk update with staffCount object
    if (bulkStaffCount && typeof bulkStaffCount === "object") {
      staffCount = { ...bulkStaffCount };
    } else {
      // Handle single specialty update
      if (!specialty || count === undefined) {
        return res.status(400).json({
          success: false,
          error: "Validation Error",
          message:
            "Specialty and count are required, or provide staffCount object",
        });
      }
      staffCount = { ...hospital.staffCount };
      staffCount[specialty] = parseInt(count);
    }

    const updatedHospital = updateHospital(id, { staffCount });
    const { password, ...safeHospital } = updatedHospital;

    return res.status(200).json({
      success: true,
      message: "Staff count updated successfully",
      data: {
        hospital: safeHospital,
      },
    });
  } catch (error) {
    console.error("Update staff error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

/**
 * Get hospital fleet (ambulances)
 * GET /api/hospitals/:id/fleet
 */
const getHospitalFleet = (req, res) => {
  try {
    const { id } = req.params;
    const hospital = getHospitalById(id);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Hospital not found",
      });
    }

    const ambulances = getAmbulances();
    const hospitalAmbulances = ambulances
      .filter((a) => a.hospitalId === parseInt(id))
      .map(({ password, ...rest }) => rest);

    return res.status(200).json({
      success: true,
      message: "Fleet retrieved successfully",
      data: {
        count: hospitalAmbulances.length,
        ambulances: hospitalAmbulances,
      },
    });
  } catch (error) {
    console.error("Get hospital fleet error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

/**
 * Get hospital blood inventory
 * GET /api/hospitals/:id/blood-inventory
 */
const getBloodInventory = (req, res) => {
  try {
    const { id } = req.params;
    const hospital = getHospitalById(id);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Hospital not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Blood inventory retrieved successfully",
      data: {
        inventory: hospital.bloodInventory,
      },
    });
  } catch (error) {
    console.error("Get blood inventory error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

/**
 * Get hospital staff
 * GET /api/hospitals/:id/staff
 */
const getStaff = (req, res) => {
  try {
    const { id } = req.params;
    const hospital = getHospitalById(id);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Hospital not found",
      });
    }

    const total = Object.values(hospital.staffCount || {}).reduce(
      (a, b) => a + b,
      0,
    );

    return res.status(200).json({
      success: true,
      message: "Staff retrieved successfully",
      data: {
        total: total,
        staff: hospital.staffCount,
      },
    });
  } catch (error) {
    console.error("Get staff error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

/**
 * Update ambulance count
 * PATCH /api/hospitals/:id/ambulance-count
 */
const updateAmbulanceCount = (req, res) => {
  try {
    const { id } = req.params;
    const { ambulanceCount } = req.body;

    if (ambulanceCount === undefined || ambulanceCount < 0) {
      return res.status(400).json({
        success: false,
        error: "Validation Error",
        message: "Valid ambulance count is required",
      });
    }

    const hospital = getHospitalById(id);
    if (!hospital) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Hospital not found",
      });
    }

    const updatedHospital = updateHospital(id, {
      ambulanceCount: parseInt(ambulanceCount),
    });

    const { password, ...safeHospital } = updatedHospital;

    return res.status(200).json({
      success: true,
      message: "Ambulance count updated successfully",
      data: {
        hospital: safeHospital,
      },
    });
  } catch (error) {
    console.error("Update ambulance count error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

/**
 * Find best hospital based on blood type, specialty, and location
 * POST /api/hospitals/find-best
 */
const findBestHospital = (req, res) => {
  try {
    const { bloodType, specialtyRequired, latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: "Validation Error",
        message: "Latitude and longitude are required",
      });
    }

    const hospitals = getHospitals();

    // Score each hospital based on:
    // - Blood availability (40%)
    // - Specialist availability (30%)
    // - Distance (20%)
    // - Beds available (10%)
    const scoredHospitals = hospitals.map((hospital) => {
      let score = 0;

      // Blood availability score (40%)
      if (bloodType && hospital.bloodInventory) {
        const bloodTypeData = hospital.bloodInventory.bloodTypes?.find(
          (b) => b.type === bloodType,
        );
        if (bloodTypeData && bloodTypeData.liters > 0) {
          score += 40 * Math.min(bloodTypeData.liters / 10, 1); // Max 40 points
        }
      } else {
        score += 20; // If no blood type needed, give half points
      }

      // Specialist availability score (30%)
      if (specialtyRequired && hospital.staffCount) {
        const specialistCount = hospital.staffCount[specialtyRequired] || 0;
        if (specialistCount > 0) {
          score += 30 * Math.min(specialistCount / 5, 1); // Max 30 points
        }
      } else {
        score += 15; // If no specialty needed, give half points
      }

      // Distance score (20%) - closer is better
      const distance = calculateDistance(
        latitude,
        longitude,
        hospital.latitude,
        hospital.longitude,
      );
      score += 20 * Math.max(0, 1 - distance / 50); // Within 50km gets points

      // Beds available score (10%)
      if (hospital.bedsAvailable > 0) {
        score += 10 * Math.min(hospital.bedsAvailable / 20, 1); // Max 10 points
      }

      return {
        ...hospital,
        score,
        distance,
        eta: calculateETA(distance),
      };
    });

    // Sort by score descending
    scoredHospitals.sort((a, b) => b.score - a.score);

    const bestHospital = scoredHospitals[0];
    if (!bestHospital) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "No hospitals available",
      });
    }

    const { password, ...safeHospital } = bestHospital;

    return res.status(200).json({
      success: true,
      message: "Best hospital found",
      data: {
        hospital: safeHospital,
        allOptions: scoredHospitals.slice(0, 5).map(({ password, ...h }) => h),
      },
    });
  } catch (error) {
    console.error("Find best hospital error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

module.exports = {
  getAllHospitals,
  getHospital,
  getHospitalByName,
  getHospitalDashboard,
  updateBeds,
  updateBloodInventory,
  updateStaff,
  updateAmbulanceCount,
  getHospitalFleet,
  getBloodInventory,
  getStaff,
  findBestHospital,
};

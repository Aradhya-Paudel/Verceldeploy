const {
  addCasualty,
  getCasualties,
  getCasualtiesByAccidentId,
  updateCasualty,
  getAccidentById,
  updateAccident,
  getHospitals,
  updateHospital,
} = require("../utils/dataAccess");
const { findBestHospital, rankHospitals } = require("../utils/hospitalMatcher");
const { calculateDistance, calculateETA } = require("../utils/distanceUtils");

/**
 * Add casualty to accident
 * POST /api/casualties
 */
const addCasualtyToAccident = (req, res) => {
  try {
    const {
      accidentId,
      name,
      age,
      gender,
      injuryType,
      severity,
      bloodType,
      bloodUnitsNeeded,
      notes,
    } = req.body;

    // Validate required fields
    if (!accidentId) {
      return res.status(400).json({
        success: false,
        error: "Validation Error",
        message: "Accident ID is required",
      });
    }

    // Check if accident exists
    const accident = getAccidentById(accidentId);
    if (!accident) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Accident not found",
      });
    }

    // Create casualty record
    const casualtyData = {
      accidentId,
      name: name || "Unknown",
      age: age || null,
      gender: gender || "Unknown",
      injuryType: injuryType || "General Trauma",
      severity: severity || "moderate", // mild, moderate, severe, critical
      bloodType: bloodType || null,
      bloodUnitsNeeded: bloodUnitsNeeded || 0,
      notes: notes || "",
      status: "pending",
      assignedHospital: null,
    };

    const casualty = addCasualty(casualtyData);

    // Find best hospital for this casualty
    const hospitals = getHospitals();
    const bestMatch = findBestHospital(
      hospitals,
      {
        injuryType: casualty.injuryType,
        bloodType: casualty.bloodType,
        bloodUnitsNeeded: casualty.bloodUnitsNeeded,
      },
      accident.latitude,
      accident.longitude,
    );

    let hospitalAssignment = null;

    if (bestMatch) {
      const eta = calculateETA(bestMatch.distance);

      // Update casualty with assigned hospital
      updateCasualty(casualty.id, {
        status: "hospital_assigned",
        assignedHospital: {
          id: bestMatch.hospital.id,
          name: bestMatch.hospital.name,
          address: bestMatch.hospital.address,
          phone: bestMatch.hospital.phone,
          distance: bestMatch.distance,
          eta: eta,
        },
      });

      // Reduce available beds at hospital
      const hospital = hospitals.find((h) => h.id === bestMatch.hospital.id);
      if (hospital && hospital.bedsAvailable > 0) {
        updateHospital(bestMatch.hospital.id, {
          bedsAvailable: hospital.bedsAvailable - 1,
        });
      }

      hospitalAssignment = {
        hospital: bestMatch.hospital,
        scores: bestMatch.scores,
        distance: bestMatch.distance,
        eta: eta,
        requiredSpecialist: bestMatch.requiredSpecialist,
      };
    }

    // Update accident with casualty info
    const existingCasualties = accident.casualties || [];
    updateAccident(accidentId, {
      casualties: [...existingCasualties, casualty.id],
    });

    return res.status(201).json({
      success: true,
      message: bestMatch
        ? "Casualty added and hospital assigned"
        : "Casualty added but no suitable hospital found",
      data: {
        casualty: {
          id: casualty.id,
          name: casualty.name,
          injuryType: casualty.injuryType,
          severity: casualty.severity,
          status: bestMatch ? "hospital_assigned" : "pending",
        },
        hospitalAssignment: hospitalAssignment,
      },
    });
  } catch (error) {
    console.error("Add casualty error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

/**
 * Get all casualties
 * GET /api/casualties
 */
const getAllCasualties = (req, res) => {
  try {
    const casualties = getCasualties();

    return res.status(200).json({
      success: true,
      message: "Casualties retrieved successfully",
      data: {
        count: casualties.length,
        casualties: casualties,
      },
    });
  } catch (error) {
    console.error("Get casualties error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

/**
 * Get casualties by accident ID
 * GET /api/casualties/accident/:accidentId
 */
const getCasualtiesForAccident = (req, res) => {
  try {
    const { accidentId } = req.params;
    const casualties = getCasualtiesByAccidentId(accidentId);

    return res.status(200).json({
      success: true,
      message: "Casualties retrieved successfully",
      data: {
        count: casualties.length,
        casualties: casualties,
      },
    });
  } catch (error) {
    console.error("Get casualties for accident error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

/**
 * Get hospital recommendations for a casualty
 * POST /api/casualties/recommend-hospitals
 */
const getHospitalRecommendations = (req, res) => {
  try {
    const { injuryType, bloodType, bloodUnitsNeeded, latitude, longitude } =
      req.body;

    // Validate required fields
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: "Validation Error",
        message: "Latitude and longitude are required",
      });
    }

    const hospitals = getHospitals();
    const rankedHospitals = rankHospitals(
      hospitals,
      {
        injuryType: injuryType || "General Trauma",
        bloodType: bloodType || null,
        bloodUnitsNeeded: bloodUnitsNeeded || 0,
      },
      parseFloat(latitude),
      parseFloat(longitude),
    );

    // Add ETA to each hospital
    const hospitalsWithETA = rankedHospitals.map((h) => ({
      ...h,
      eta: calculateETA(h.distance),
    }));

    return res.status(200).json({
      success: true,
      message: "Hospital recommendations retrieved",
      data: {
        count: hospitalsWithETA.length,
        recommendations: hospitalsWithETA,
      },
    });
  } catch (error) {
    console.error("Get hospital recommendations error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

/**
 * Update casualty status
 * PATCH /api/casualties/:id/status
 */
const updateCasualtyStatus = (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: "Validation Error",
        message: "Status is required",
      });
    }

    const validStatuses = [
      "pending",
      "hospital_assigned",
      "in_transit",
      "admitted",
      "discharged",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Validation Error",
        message: `Invalid status. Valid values: ${validStatuses.join(", ")}`,
      });
    }

    const updatedCasualty = updateCasualty(id, { status });

    if (!updatedCasualty) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Casualty not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Casualty status updated successfully",
      data: {
        casualty: updatedCasualty,
      },
    });
  } catch (error) {
    console.error("Update casualty status error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

module.exports = {
  addCasualtyToAccident,
  getAllCasualties,
  getCasualtiesForAccident,
  getHospitalRecommendations,
  updateCasualtyStatus,
};

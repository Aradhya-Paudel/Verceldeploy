const {
  getAmbulances,
  getAmbulanceById,
  getAmbulanceByName,
  updateAmbulance,
  getAvailableAmbulances,
  getAccidentById,
  updateAccident,
} = require("../utils/dataAccess");
const {
  findNearestAmbulance,
  calculateDistance,
  calculateETA,
} = require("../utils/distanceUtils");

/**
 * Get all ambulances
 * GET /api/ambulances
 */
const getAllAmbulances = (req, res) => {
  try {
    const ambulances = getAmbulances();

    // Remove passwords from response
    const safeAmbulances = ambulances.map(({ password, ...rest }) => rest);

    return res.status(200).json({
      success: true,
      message: "Ambulances retrieved successfully",
      data: {
        count: safeAmbulances.length,
        ambulances: safeAmbulances,
      },
    });
  } catch (error) {
    console.error("Get ambulances error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

/**
 * Get available ambulances
 * GET /api/ambulances/available
 */
const getAvailable = (req, res) => {
  try {
    const ambulances = getAvailableAmbulances();

    // Remove passwords from response
    const safeAmbulances = ambulances.map(({ password, ...rest }) => rest);

    return res.status(200).json({
      success: true,
      message: "Available ambulances retrieved successfully",
      data: {
        count: safeAmbulances.length,
        ambulances: safeAmbulances,
      },
    });
  } catch (error) {
    console.error("Get available ambulances error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

/**
 * Get ambulance by ID
 * GET /api/ambulances/:id
 */
const getAmbulance = (req, res) => {
  try {
    const { id } = req.params;
    const ambulance = getAmbulanceById(id);

    if (!ambulance) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Ambulance not found",
      });
    }

    // Remove password from response
    const { password, ...safeAmbulance } = ambulance;

    return res.status(200).json({
      success: true,
      message: "Ambulance retrieved successfully",
      data: {
        ambulance: safeAmbulance,
      },
    });
  } catch (error) {
    console.error("Get ambulance error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

/**
 * Update ambulance location
 * PATCH /api/ambulances/:id/location
 */
const updateLocation = (req, res) => {
  try {
    const { id } = req.params;
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: "Validation Error",
        message: "Latitude and longitude are required",
      });
    }

    const ambulance = getAmbulanceById(id);
    if (!ambulance) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Ambulance not found",
      });
    }

    const updatedAmbulance = updateAmbulance(id, {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    });

    const { password, ...safeAmbulance } = updatedAmbulance;

    return res.status(200).json({
      success: true,
      message: "Ambulance location updated successfully",
      data: {
        ambulance: safeAmbulance,
      },
    });
  } catch (error) {
    console.error("Update ambulance location error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

/**
 * Update ambulance status
 * PATCH /api/ambulances/:id/status
 */
const updateStatus = (req, res) => {
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
      "available",
      "dispatched",
      "en_route",
      "at_scene",
      "transporting",
      "at_hospital",
      "offline",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Validation Error",
        message: `Invalid status. Valid values: ${validStatuses.join(", ")}`,
      });
    }

    const ambulance = getAmbulanceById(id);
    if (!ambulance) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Ambulance not found",
      });
    }

    const updates = { status };

    // If ambulance becomes available, clear current accident assignment
    if (status === "available") {
      updates.currentAccidentId = null;
    }

    const updatedAmbulance = updateAmbulance(id, updates);
    const { password, ...safeAmbulance } = updatedAmbulance;

    return res.status(200).json({
      success: true,
      message: "Ambulance status updated successfully",
      data: {
        ambulance: safeAmbulance,
      },
    });
  } catch (error) {
    console.error("Update ambulance status error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

/**
 * Accept accident assignment
 * POST /api/ambulances/:id/accept-assignment
 */
const acceptAssignment = (req, res) => {
  try {
    const { id } = req.params;
    const { accidentId } = req.body;

    if (!accidentId) {
      return res.status(400).json({
        success: false,
        error: "Validation Error",
        message: "Accident ID is required",
      });
    }

    const ambulance = getAmbulanceById(id);
    if (!ambulance) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Ambulance not found",
      });
    }

    const accident = getAccidentById(accidentId);
    if (!accident) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Accident not found",
      });
    }

    // Calculate distance and ETA to accident
    const distance = calculateDistance(
      ambulance.latitude,
      ambulance.longitude,
      accident.latitude,
      accident.longitude,
    );
    const eta = calculateETA(distance);

    // Update ambulance
    const updatedAmbulance = updateAmbulance(id, {
      status: "en_route",
      currentAccidentId: accidentId,
    });

    // Update accident
    updateAccident(accidentId, {
      status: "ambulance_en_route",
      assignedAmbulance: {
        id: ambulance.id,
        name: ambulance.name,
        driverName: ambulance.driverName,
        phone: ambulance.phone,
      },
    });

    const { password, ...safeAmbulance } = updatedAmbulance;

    return res.status(200).json({
      success: true,
      message: "Assignment accepted successfully",
      data: {
        ambulance: safeAmbulance,
        accident: {
          id: accident.id,
          title: accident.title,
          location: accident.location,
          latitude: accident.latitude,
          longitude: accident.longitude,
        },
        distance: Math.round(distance * 100) / 100,
        eta: eta,
      },
    });
  } catch (error) {
    console.error("Accept assignment error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

/**
 * Arrive at scene
 * POST /api/ambulances/:id/arrive-scene
 */
const arriveAtScene = (req, res) => {
  try {
    const { id } = req.params;

    const ambulance = getAmbulanceById(id);
    if (!ambulance) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Ambulance not found",
      });
    }

    if (!ambulance.currentAccidentId) {
      return res.status(400).json({
        success: false,
        error: "Bad Request",
        message: "Ambulance is not assigned to any accident",
      });
    }

    // Update ambulance status
    const updatedAmbulance = updateAmbulance(id, {
      status: "at_scene",
    });

    // Update accident status
    updateAccident(ambulance.currentAccidentId, {
      status: "ambulance_arrived",
    });

    const { password, ...safeAmbulance } = updatedAmbulance;

    return res.status(200).json({
      success: true,
      message: "Arrived at scene",
      data: {
        ambulance: safeAmbulance,
      },
    });
  } catch (error) {
    console.error("Arrive at scene error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

/**
 * Start transport to hospital
 * POST /api/ambulances/:id/start-transport
 */
const startTransport = (req, res) => {
  try {
    const { id } = req.params;
    const { hospitalId } = req.body;

    if (!hospitalId) {
      return res.status(400).json({
        success: false,
        error: "Validation Error",
        message: "Hospital ID is required",
      });
    }

    const ambulance = getAmbulanceById(id);
    if (!ambulance) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Ambulance not found",
      });
    }

    // Update ambulance status
    const updatedAmbulance = updateAmbulance(id, {
      status: "transporting",
      destinationHospitalId: hospitalId,
    });

    // Update accident status
    if (ambulance.currentAccidentId) {
      updateAccident(ambulance.currentAccidentId, {
        status: "in_transit",
      });
    }

    const { password, ...safeAmbulance } = updatedAmbulance;

    return res.status(200).json({
      success: true,
      message: "Transport started",
      data: {
        ambulance: safeAmbulance,
      },
    });
  } catch (error) {
    console.error("Start transport error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

/**
 * Complete transport (arrive at hospital)
 * POST /api/ambulances/:id/complete-transport
 */
const completeTransport = (req, res) => {
  try {
    const { id } = req.params;

    const ambulance = getAmbulanceById(id);
    if (!ambulance) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Ambulance not found",
      });
    }

    // Update accident status
    if (ambulance.currentAccidentId) {
      updateAccident(ambulance.currentAccidentId, {
        status: "completed",
        completedAt: new Date().toISOString(),
      });
    }

    // Update ambulance - make it available again
    const updatedAmbulance = updateAmbulance(id, {
      status: "available",
      currentAccidentId: null,
      destinationHospitalId: null,
    });

    const { password, ...safeAmbulance } = updatedAmbulance;

    return res.status(200).json({
      success: true,
      message: "Transport completed, ambulance is now available",
      data: {
        ambulance: safeAmbulance,
      },
    });
  } catch (error) {
    console.error("Complete transport error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

/**
 * Find nearest ambulance to location
 * POST /api/ambulances/find-nearest
 */
const findNearest = (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: "Validation Error",
        message: "Latitude and longitude are required",
      });
    }

    const availableAmbulances = getAvailableAmbulances();
    const nearest = findNearestAmbulance(
      parseFloat(latitude),
      parseFloat(longitude),
      availableAmbulances,
    );

    if (!nearest) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "No available ambulances found",
      });
    }

    const { password, ...safeAmbulance } = nearest;
    const eta = calculateETA(nearest.distance);

    return res.status(200).json({
      success: true,
      message: "Nearest ambulance found",
      data: {
        ambulance: safeAmbulance,
        distance: nearest.distance,
        eta: eta,
      },
    });
  } catch (error) {
    console.error("Find nearest ambulance error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

module.exports = {
  getAllAmbulances,
  getAvailable,
  getAmbulance,
  updateLocation,
  updateStatus,
  acceptAssignment,
  arriveAtScene,
  startTransport,
  completeTransport,
  findNearest,
};

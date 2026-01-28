const {
  addAccident,
  getAccidents,
  getAccidentById,
  updateAccident,
  getAvailableAmbulances,
  updateAmbulance,
} = require("../utils/dataAccess");
const {
  findNearestAmbulance,
  calculateETA,
} = require("../utils/distanceUtils");

/**
 * Report new accident (Guest user)
 * POST /api/accidents/report
 */
const reportAccident = (req, res) => {
  try {
    const {
      title,
      description,
      latitude,
      longitude,
      location,
      image,
      reporterPhone,
    } = req.body;

    // Validate required fields
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: "Validation Error",
        message: "Latitude and longitude are required",
      });
    }

    // Create accident record
    const accidentData = {
      title: title || "Emergency Reported",
      description: description || "",
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      location: location || "Unknown Location",
      image: image || null,
      reporterPhone: reporterPhone || null,
      status: "pending",
      assignedAmbulance: null,
      casualties: [],
    };

    const accident = addAccident(accidentData);

    // Find nearest available ambulance
    const availableAmbulances = getAvailableAmbulances();
    const nearestAmbulance = findNearestAmbulance(
      accident.latitude,
      accident.longitude,
      availableAmbulances,
    );

    let dispatchInfo = null;

    if (nearestAmbulance) {
      // Calculate ETA
      const eta = calculateETA(nearestAmbulance.distance);

      // Update ambulance status to dispatched
      updateAmbulance(nearestAmbulance.id, {
        status: "dispatched",
        currentAccidentId: accident.id,
      });

      // Update accident with assigned ambulance
      updateAccident(accident.id, {
        status: "ambulance_dispatched",
        assignedAmbulance: {
          id: nearestAmbulance.id,
          name: nearestAmbulance.name,
          driverName: nearestAmbulance.driverName,
          phone: nearestAmbulance.phone,
        },
      });

      dispatchInfo = {
        ambulanceId: nearestAmbulance.id,
        ambulanceName: nearestAmbulance.name,
        driverName: nearestAmbulance.driverName,
        driverPhone: nearestAmbulance.phone,
        distance: nearestAmbulance.distance,
        eta: eta,
      };
    }

    return res.status(201).json({
      success: true,
      message: nearestAmbulance
        ? "Accident reported and ambulance dispatched"
        : "Accident reported but no ambulance available",
      data: {
        accident: {
          id: accident.id,
          title: accident.title,
          location: accident.location,
          latitude: accident.latitude,
          longitude: accident.longitude,
          status: nearestAmbulance ? "ambulance_dispatched" : "pending",
          createdAt: accident.createdAt,
        },
        dispatch: dispatchInfo,
      },
    });
  } catch (error) {
    console.error("Report accident error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

/**
 * Get all accidents
 * GET /api/accidents
 */
const getAllAccidents = (req, res) => {
  try {
    const accidents = getAccidents();

    return res.status(200).json({
      success: true,
      message: "Accidents retrieved successfully",
      data: {
        count: accidents.length,
        accidents: accidents,
      },
    });
  } catch (error) {
    console.error("Get accidents error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

/**
 * Get accident by ID
 * GET /api/accidents/:id
 */
const getAccident = (req, res) => {
  try {
    const { id } = req.params;
    const accident = getAccidentById(id);

    if (!accident) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Accident not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Accident retrieved successfully",
      data: {
        accident: accident,
      },
    });
  } catch (error) {
    console.error("Get accident error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

/**
 * Update accident status
 * PATCH /api/accidents/:id/status
 */
const updateAccidentStatus = (req, res) => {
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
      "ambulance_dispatched",
      "ambulance_arrived",
      "in_transit",
      "completed",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Validation Error",
        message: `Invalid status. Valid values: ${validStatuses.join(", ")}`,
      });
    }

    const accident = getAccidentById(id);
    if (!accident) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Accident not found",
      });
    }

    const updatedAccident = updateAccident(id, { status });

    return res.status(200).json({
      success: true,
      message: "Accident status updated successfully",
      data: {
        accident: updatedAccident,
      },
    });
  } catch (error) {
    console.error("Update accident status error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

/**
 * Get pending accidents (for ambulance dashboard)
 * GET /api/accidents/pending
 */
const getPendingAccidents = (req, res) => {
  try {
    const accidents = getAccidents();
    const pendingAccidents = accidents.filter(
      (a) => a.status === "pending" || a.status === "ambulance_dispatched",
    );

    return res.status(200).json({
      success: true,
      message: "Pending accidents retrieved successfully",
      data: {
        count: pendingAccidents.length,
        accidents: pendingAccidents,
      },
    });
  } catch (error) {
    console.error("Get pending accidents error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

module.exports = {
  reportAccident,
  getAllAccidents,
  getAccident,
  updateAccidentStatus,
  getPendingAccidents,
};

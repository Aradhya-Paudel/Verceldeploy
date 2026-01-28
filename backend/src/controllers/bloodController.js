const {
  getBloodRequests,
  getBloodRequestById,
  addBloodRequest,
  updateBloodRequest,
  getHospitals,
  getHospitalById,
  updateHospital,
} = require("../utils/dataAccess");
const { calculateDistance, calculateETA } = require("../utils/distanceUtils");

/**
 * Create blood request
 * POST /api/blood/request
 */
const createBloodRequest = (req, res) => {
  try {
    const { requestingHospitalId, bloodType, unitsNeeded, urgency, notes } =
      req.body;

    // Validate required fields
    if (!requestingHospitalId || !bloodType || !unitsNeeded) {
      return res.status(400).json({
        success: false,
        error: "Validation Error",
        message:
          "Requesting hospital ID, blood type, and units needed are required",
      });
    }

    const validBloodTypes = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
    if (!validBloodTypes.includes(bloodType)) {
      return res.status(400).json({
        success: false,
        error: "Validation Error",
        message: `Invalid blood type. Valid values: ${validBloodTypes.join(", ")}`,
      });
    }

    // Get requesting hospital
    const requestingHospital = getHospitalById(requestingHospitalId);
    if (!requestingHospital) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Requesting hospital not found",
      });
    }

    // Find hospitals with available blood
    const hospitals = getHospitals();
    const donorHospitals = hospitals
      .filter((h) => h.id !== parseInt(requestingHospitalId))
      .map((hospital) => {
        const bloodData = hospital.bloodInventory?.bloodTypes?.find(
          (b) => b.type === bloodType,
        );
        const availableUnits = bloodData?.units || 0;
        const distance = calculateDistance(
          requestingHospital.latitude,
          requestingHospital.longitude,
          hospital.latitude,
          hospital.longitude,
        );

        return {
          hospital: {
            id: hospital.id,
            name: hospital.name,
            address: hospital.address,
            phone: hospital.phone,
            latitude: hospital.latitude,
            longitude: hospital.longitude,
          },
          availableUnits,
          distance: Math.round(distance * 100) / 100,
          eta: calculateETA(distance),
          canFulfill: availableUnits >= unitsNeeded,
        };
      })
      .filter((h) => h.availableUnits > 0)
      .sort((a, b) => {
        // Prioritize hospitals that can fully fulfill the request
        if (a.canFulfill && !b.canFulfill) return -1;
        if (!a.canFulfill && b.canFulfill) return 1;
        // Then sort by distance
        return a.distance - b.distance;
      });

    // Create blood request
    const requestData = {
      requestingHospitalId: parseInt(requestingHospitalId),
      requestingHospitalName: requestingHospital.name,
      bloodType,
      unitsNeeded: parseInt(unitsNeeded),
      urgency: urgency || "normal", // normal, urgent, critical
      notes: notes || "",
      status: "pending",
      donorHospitalId: null,
      donorHospitalName: null,
    };

    const bloodRequest = addBloodRequest(requestData);

    return res.status(201).json({
      success: true,
      message: "Blood request created successfully",
      data: {
        request: bloodRequest,
        availableDonors: donorHospitals,
      },
    });
  } catch (error) {
    console.error("Create blood request error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

/**
 * Get all blood requests
 * GET /api/blood/requests
 */
const getAllBloodRequests = (req, res) => {
  try {
    const requests = getBloodRequests();

    return res.status(200).json({
      success: true,
      message: "Blood requests retrieved successfully",
      data: {
        count: requests.length,
        requests: requests,
      },
    });
  } catch (error) {
    console.error("Get blood requests error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

/**
 * Get blood request by ID
 * GET /api/blood/requests/:id
 */
const getBloodRequest = (req, res) => {
  try {
    const { id } = req.params;
    const request = getBloodRequestById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Blood request not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Blood request retrieved successfully",
      data: {
        request: request,
      },
    });
  } catch (error) {
    console.error("Get blood request error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

/**
 * Accept blood request (donor hospital)
 * POST /api/blood/requests/:id/accept
 */
const acceptBloodRequest = (req, res) => {
  try {
    const { id } = req.params;
    const { donorHospitalId } = req.body;

    if (!donorHospitalId) {
      return res.status(400).json({
        success: false,
        error: "Validation Error",
        message: "Donor hospital ID is required",
      });
    }

    const request = getBloodRequestById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Blood request not found",
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        error: "Bad Request",
        message: "This request has already been processed",
      });
    }

    const donorHospital = getHospitalById(donorHospitalId);
    if (!donorHospital) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Donor hospital not found",
      });
    }

    // Check blood availability
    const bloodData = donorHospital.bloodInventory?.bloodTypes?.find(
      (b) => b.type === request.bloodType,
    );
    const availableUnits = bloodData?.units || 0;

    if (availableUnits < request.unitsNeeded) {
      return res.status(400).json({
        success: false,
        error: "Insufficient Blood",
        message: `Only ${availableUnits} units available, ${request.unitsNeeded} requested`,
      });
    }

    // Deduct blood from donor hospital
    const updatedBloodTypes = donorHospital.bloodInventory.bloodTypes.map(
      (b) => {
        if (b.type === request.bloodType) {
          return { ...b, units: b.units - request.unitsNeeded };
        }
        return b;
      },
    );

    updateHospital(donorHospitalId, {
      bloodInventory: {
        ...donorHospital.bloodInventory,
        total: donorHospital.bloodInventory.total - request.unitsNeeded,
        bloodTypes: updatedBloodTypes,
      },
    });

    // Update request
    const requestingHospital = getHospitalById(request.requestingHospitalId);
    const distance = calculateDistance(
      donorHospital.latitude,
      donorHospital.longitude,
      requestingHospital.latitude,
      requestingHospital.longitude,
    );

    const updatedRequest = updateBloodRequest(id, {
      status: "accepted",
      donorHospitalId: parseInt(donorHospitalId),
      donorHospitalName: donorHospital.name,
      acceptedAt: new Date().toISOString(),
      estimatedDelivery: calculateETA(distance),
    });

    return res.status(200).json({
      success: true,
      message: "Blood request accepted successfully",
      data: {
        request: updatedRequest,
        transfer: {
          from: donorHospital.name,
          to: requestingHospital.name,
          distance: Math.round(distance * 100) / 100,
          eta: calculateETA(distance),
        },
      },
    });
  } catch (error) {
    console.error("Accept blood request error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

/**
 * Complete blood transfer
 * POST /api/blood/requests/:id/complete
 */
const completeBloodTransfer = (req, res) => {
  try {
    const { id } = req.params;

    const request = getBloodRequestById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Blood request not found",
      });
    }

    if (request.status !== "accepted") {
      return res.status(400).json({
        success: false,
        error: "Bad Request",
        message: "Request must be accepted before completing",
      });
    }

    // Add blood to requesting hospital
    const requestingHospital = getHospitalById(request.requestingHospitalId);
    const updatedBloodTypes = requestingHospital.bloodInventory.bloodTypes.map(
      (b) => {
        if (b.type === request.bloodType) {
          return { ...b, units: b.units + request.unitsNeeded };
        }
        return b;
      },
    );

    updateHospital(request.requestingHospitalId, {
      bloodInventory: {
        ...requestingHospital.bloodInventory,
        total: requestingHospital.bloodInventory.total + request.unitsNeeded,
        bloodTypes: updatedBloodTypes,
      },
    });

    // Update request status
    const updatedRequest = updateBloodRequest(id, {
      status: "completed",
      completedAt: new Date().toISOString(),
    });

    return res.status(200).json({
      success: true,
      message: "Blood transfer completed successfully",
      data: {
        request: updatedRequest,
      },
    });
  } catch (error) {
    console.error("Complete blood transfer error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

/**
 * Reject/Cancel blood request
 * POST /api/blood/requests/:id/reject
 */
const rejectBloodRequest = (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const request = getBloodRequestById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Blood request not found",
      });
    }

    const updatedRequest = updateBloodRequest(id, {
      status: "rejected",
      rejectionReason: reason || "No reason provided",
      rejectedAt: new Date().toISOString(),
    });

    return res.status(200).json({
      success: true,
      message: "Blood request rejected",
      data: {
        request: updatedRequest,
      },
    });
  } catch (error) {
    console.error("Reject blood request error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

/**
 * Get pending blood requests for a hospital
 * GET /api/blood/requests/pending/:hospitalId
 */
const getPendingRequestsForHospital = (req, res) => {
  try {
    const { hospitalId } = req.params;
    const requests = getBloodRequests();

    // Get requests where this hospital is the requesting hospital
    const outgoingRequests = requests.filter(
      (r) =>
        r.requestingHospitalId === parseInt(hospitalId) &&
        r.status === "pending",
    );

    // Get all pending requests that this hospital could potentially fulfill
    const hospital = getHospitalById(hospitalId);
    if (!hospital) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Hospital not found",
      });
    }

    const incomingRequests = requests.filter((r) => {
      if (r.requestingHospitalId === parseInt(hospitalId)) return false;
      if (r.status !== "pending") return false;

      // Check if this hospital has the requested blood type
      const bloodData = hospital.bloodInventory?.bloodTypes?.find(
        (b) => b.type === r.bloodType,
      );
      return bloodData && bloodData.units > 0;
    });

    return res.status(200).json({
      success: true,
      message: "Pending requests retrieved successfully",
      data: {
        outgoing: outgoingRequests,
        incoming: incomingRequests,
      },
    });
  } catch (error) {
    console.error("Get pending requests error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

/**
 * Get all blood requests for a hospital (both incoming and outgoing)
 * GET /api/blood/requests/hospital/:hospitalId
 */
const getBloodRequestsForHospital = (req, res) => {
  try {
    const { hospitalId } = req.params;
    const requests = getBloodRequests();

    // Get outgoing requests (where this hospital is requesting)
    const outgoingRequests = requests.filter(
      (r) => r.requestingHospitalId === parseInt(hospitalId),
    );

    // Get incoming requests (where this hospital is the donor)
    const incomingRequests = requests.filter(
      (r) => r.donorHospitalId === parseInt(hospitalId),
    );

    // Combine and format requests
    const allRequests = [
      ...outgoingRequests.map((r) => ({ ...r, direction: "outgoing" })),
      ...incomingRequests.map((r) => ({ ...r, direction: "incoming" })),
    ];

    return res.status(200).json({
      success: true,
      message: "Blood requests retrieved successfully",
      data: {
        requests: allRequests,
        outgoing: outgoingRequests,
        incoming: incomingRequests,
      },
    });
  } catch (error) {
    console.error("Get blood requests for hospital error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

module.exports = {
  createBloodRequest,
  getAllBloodRequests,
  getBloodRequest,
  acceptBloodRequest,
  completeBloodTransfer,
  rejectBloodRequest,
  getPendingRequestsForHospital,
  getBloodRequestsForHospital,
};

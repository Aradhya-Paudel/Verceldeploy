const express = require("express");
const router = express.Router();
const {
  createBloodRequest,
  getAllBloodRequests,
  getBloodRequest,
  acceptBloodRequest,
  completeBloodTransfer,
  rejectBloodRequest,
  getPendingRequestsForHospital,
  getBloodRequestsForHospital,
} = require("../controllers/bloodController");

// POST /api/blood/request - Create blood request
router.post("/request", createBloodRequest);

// GET /api/blood/requests - Get all blood requests
router.get("/requests", getAllBloodRequests);

// GET /api/blood/requests/pending/:hospitalId - Get pending requests for hospital
router.get("/requests/pending/:hospitalId", getPendingRequestsForHospital);

// GET /api/blood/requests/hospital/:hospitalId - Get all blood requests for hospital
router.get("/requests/hospital/:hospitalId", getBloodRequestsForHospital);

// GET /api/blood/requests/:id - Get blood request by ID
router.get("/requests/:id", getBloodRequest);

// POST /api/blood/requests/:id/accept - Accept blood request
router.post("/requests/:id/accept", acceptBloodRequest);

// POST /api/blood/requests/:id/approve - Approve blood request (alias for accept)
router.post("/requests/:id/approve", acceptBloodRequest);

// POST /api/blood/requests/:id/complete - Complete blood transfer
router.post("/requests/:id/complete", completeBloodTransfer);

// POST /api/blood/requests/:id/reject - Reject blood request
router.post("/requests/:id/reject", rejectBloodRequest);

// POST /api/blood/requests/:id/decline - Decline blood request (alias for reject)
router.post("/requests/:id/decline", rejectBloodRequest);

module.exports = router;

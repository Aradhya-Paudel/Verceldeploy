const express = require("express");
const router = express.Router();
const {
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
} = require("../controllers/ambulanceController");

// GET /api/ambulances - Get all ambulances
router.get("/", getAllAmbulances);

// GET /api/ambulances/available - Get available ambulances
router.get("/available", getAvailable);

// POST /api/ambulances/find-nearest - Find nearest ambulance
router.post("/find-nearest", findNearest);

// GET /api/ambulances/:id - Get ambulance by ID
router.get("/:id", getAmbulance);

// PATCH /api/ambulances/:id/location - Update ambulance location
router.patch("/:id/location", updateLocation);

// PATCH /api/ambulances/:id/status - Update ambulance status
router.patch("/:id/status", updateStatus);

// POST /api/ambulances/:id/accept-assignment - Accept accident assignment
router.post("/:id/accept-assignment", acceptAssignment);

// POST /api/ambulances/:id/arrive-scene - Arrive at scene
router.post("/:id/arrive-scene", arriveAtScene);

// POST /api/ambulances/:id/start-transport - Start transport to hospital
router.post("/:id/start-transport", startTransport);

// POST /api/ambulances/:id/complete-transport - Complete transport
router.post("/:id/complete-transport", completeTransport);

module.exports = router;

const express = require("express");
const router = express.Router();
const {
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
} = require("../controllers/hospitalController");

// GET /api/hospitals - Get all hospitals
router.get("/", getAllHospitals);

// POST /api/hospitals/find-best - Find best hospital for casualty
router.post("/find-best", findBestHospital);

// GET /api/hospitals/by-name/:name - Get hospital by name
router.get("/by-name/:name", getHospitalByName);

// GET /api/hospitals/:id - Get hospital by ID
router.get("/:id", getHospital);

// GET /api/hospitals/:id/dashboard - Get hospital dashboard data
router.get("/:id/dashboard", getHospitalDashboard);

// GET /api/hospitals/:id/fleet - Get hospital ambulances
router.get("/:id/fleet", getHospitalFleet);

// GET /api/hospitals/:id/blood-inventory - Get blood inventory
router.get("/:id/blood-inventory", getBloodInventory);

// GET /api/hospitals/:id/staff - Get staff
router.get("/:id/staff", getStaff);

// PATCH /api/hospitals/:id/beds - Update beds
router.patch("/:id/beds", updateBeds);

// PATCH /api/hospitals/:id/blood-inventory - Update blood inventory
router.patch("/:id/blood-inventory", updateBloodInventory);

// PATCH /api/hospitals/:id/staff - Update staff
router.patch("/:id/staff", updateStaff);

// PATCH /api/hospitals/:id/ambulance-count - Update ambulance count
router.patch("/:id/ambulance-count", updateAmbulanceCount);

module.exports = router;

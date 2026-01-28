const express = require("express");
const router = express.Router();
const {
  addCasualtyToAccident,
  getAllCasualties,
  getCasualtiesForAccident,
  getHospitalRecommendations,
  updateCasualtyStatus,
} = require("../controllers/casualtyController");

// POST /api/casualties - Add new casualty
router.post("/", addCasualtyToAccident);

// POST /api/casualties/recommend-hospitals - Get hospital recommendations
router.post("/recommend-hospitals", getHospitalRecommendations);

// GET /api/casualties - Get all casualties
router.get("/", getAllCasualties);

// GET /api/casualties/accident/:accidentId - Get casualties for accident
router.get("/accident/:accidentId", getCasualtiesForAccident);

// PATCH /api/casualties/:id/status - Update casualty status
router.patch("/:id/status", updateCasualtyStatus);

module.exports = router;

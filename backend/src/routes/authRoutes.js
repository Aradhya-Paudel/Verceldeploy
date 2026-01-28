const express = require("express");
const router = express.Router();
const {
  ambulanceLogin,
  hospitalLogin,
} = require("../controllers/authController");

// POST /api/auth/ambulance/login
router.post("/ambulance/login", ambulanceLogin);

// POST /api/auth/hospital/login
router.post("/hospital/login", hospitalLogin);

module.exports = router;

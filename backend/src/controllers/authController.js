const {
  getAmbulanceByName,
  getHospitalByName,
} = require("../utils/dataAccess");

/**
 * Ambulance Login
 * POST /api/auth/ambulance/login
 */
const ambulanceLogin = (req, res) => {
  try {
    const { name, password } = req.body;

    // Validate required fields
    if (!name || !password) {
      return res.status(400).json({
        success: false,
        error: "Validation Error",
        message: "Name and password are required",
      });
    }

    // Find ambulance by name
    const ambulance = getAmbulanceByName(name);

    if (!ambulance) {
      return res.status(401).json({
        success: false,
        error: "Authentication Failed",
        message: "Invalid ambulance name or password",
      });
    }

    // Simple password comparison (no hashing as per requirements)
    if (ambulance.password !== password) {
      return res.status(401).json({
        success: false,
        error: "Authentication Failed",
        message: "Invalid ambulance name or password",
      });
    }

    // Return ambulance data without password
    const { password: _, ...ambulanceData } = ambulance;

    return res.status(200).json({
      success: true,
      message: "Ambulance login successful",
      data: {
        ambulance: ambulanceData,
      },
    });
  } catch (error) {
    console.error("Ambulance login error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

/**
 * Hospital Login
 * POST /api/auth/hospital/login
 */
const hospitalLogin = (req, res) => {
  try {
    const { name, password } = req.body;

    // Validate required fields
    if (!name || !password) {
      return res.status(400).json({
        success: false,
        error: "Validation Error",
        message: "Name and password are required",
      });
    }

    // Find hospital by name
    const hospital = getHospitalByName(name);

    if (!hospital) {
      return res.status(401).json({
        success: false,
        error: "Authentication Failed",
        message: "Invalid hospital name or password",
      });
    }

    // Simple password comparison (no hashing as per requirements)
    if (hospital.password !== password) {
      return res.status(401).json({
        success: false,
        error: "Authentication Failed",
        message: "Invalid hospital name or password",
      });
    }

    // Return hospital data without password
    const { password: _, ...hospitalData } = hospital;

    return res.status(200).json({
      success: true,
      message: "Hospital login successful",
      data: {
        hospital: hospitalData,
      },
    });
  } catch (error) {
    console.error("Hospital login error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

module.exports = {
  ambulanceLogin,
  hospitalLogin,
};

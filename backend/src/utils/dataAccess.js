/**
 * Remove accident by ID
 * @param {string} id - Accident ID
 * @returns {boolean} Success status
 */
const removeAccident = (id) => {
  const data = readJSON("active_accidents.json");
  const index = data.accidents.findIndex((a) => a.id === id);
  if (index === -1) return false;
  data.accidents.splice(index, 1);
  writeJSON("active_accidents.json", data);
  return true;
};
const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "../../data");

/**
 * Read JSON file and return parsed data
 * @param {string} filename - Name of the JSON file
 * @returns {Object} Parsed JSON data
 */
const readJSON = (filename) => {
  try {
    const filePath = path.join(dataDir, filename);
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error.message);
    throw new Error(`Failed to read ${filename}`);
  }
};

/**
 * Write data to JSON file
 * @param {string} filename - Name of the JSON file
 * @param {Object} data - Data to write
 * @returns {boolean} Success status
 */
const writeJSON = (filename, data) => {
  try {
    const filePath = path.join(dataDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error(`Error writing ${filename}:`, error.message);
    throw new Error(`Failed to write ${filename}`);
  }
};

/**
 * Get all hospitals
 * @returns {Array} Array of hospitals
 */
const getHospitals = () => {
  const data = readJSON("hospitals.json");
  return data.hospitals || [];
};

/**
 * Get hospital by ID
 * @param {number} id - Hospital ID
 * @returns {Object|null} Hospital object or null
 */
const getHospitalById = (id) => {
  const hospitals = getHospitals();
  return hospitals.find((h) => h.id === parseInt(id)) || null;
};

/**
 * Get hospital by name (for login)
 * @param {string} name - Hospital name
 * @returns {Object|null} Hospital object or null
 */
const getHospitalByName = (name) => {
  const hospitals = getHospitals();
  return (
    hospitals.find((h) => h.name.toLowerCase() === name.toLowerCase()) || null
  );
};

/**
 * Update hospital data
 * @param {number} id - Hospital ID
 * @param {Object} updates - Updates to apply
 * @returns {Object|null} Updated hospital or null
 */
const updateHospital = (id, updates) => {
  const data = readJSON("hospitals.json");
  const index = data.hospitals.findIndex((h) => h.id === parseInt(id));
  if (index === -1) return null;

  data.hospitals[index] = { ...data.hospitals[index], ...updates };
  writeJSON("hospitals.json", data);
  return data.hospitals[index];
};

/**
 * Get all ambulances
 * @returns {Array} Array of ambulances
 */
const getAmbulances = () => {
  const data = readJSON("ambulances.json");
  return data.ambulances || [];
};

/**
 * Get ambulance by ID or name
 * @param {string} idOrName - Ambulance ID or name
 * @returns {Object|null} Ambulance object or null
 */
const getAmbulanceById = (idOrName) => {
  const ambulances = getAmbulances();
  // First try to find by ID, then fall back to name
  return ambulances.find((a) => a.id === idOrName || a.name === idOrName) || null;
};

/**
 * Get ambulance by name (for login)
 * @param {string} name - Ambulance name
 * @returns {Object|null} Ambulance object or null
 */
const getAmbulanceByName = (name) => {
  const ambulances = getAmbulances();
  return ambulances.find((a) => a.name === name) || null;
};

/**
 * Update ambulance data
 * @param {string} idOrName - Ambulance ID or name
 * @param {Object} updates - Updates to apply
 * @returns {Object|null} Updated ambulance or null
 */
const updateAmbulance = (idOrName, updates) => {
  const data = readJSON("ambulances.json");
  // Find by ID first, then fall back to name
  const index = data.ambulances.findIndex((a) => a.id === idOrName || a.name === idOrName);
  if (index === -1) return null;

  data.ambulances[index] = { ...data.ambulances[index], ...updates };
  writeJSON("ambulances.json", data);
  return data.ambulances[index];
};

/**
 * Get available ambulances
 * @returns {Array} Array of available ambulances
 */
const getAvailableAmbulances = () => {
  const ambulances = getAmbulances();
  return ambulances.filter((a) => a.status === "available");
};

/**
 * Get all active accidents
 * @returns {Array} Array of accidents
 */
const getAccidents = () => {
  const data = readJSON("active_accidents.json");
  return data.accidents || [];
};

/**
 * Add new accident
 * @param {Object} accident - Accident data
 * @returns {Object} Created accident
 */
const addAccident = (accident) => {
  const data = readJSON("active_accidents.json");
  const newAccident = {
    id: `ACC-${Date.now()}`,
    ...accident,
    createdAt: new Date().toISOString(),
    status: "pending",
  };
  data.accidents.push(newAccident);
  writeJSON("active_accidents.json", data);
  return newAccident;
};

/**
 * Update accident data
 * @param {string} id - Accident ID
 * @param {Object} updates - Updates to apply
 * @returns {Object|null} Updated accident or null
 */
const updateAccident = (id, updates) => {
  const data = readJSON("active_accidents.json");
  const index = data.accidents.findIndex((a) => a.id === id);
  if (index === -1) return null;

  data.accidents[index] = { ...data.accidents[index], ...updates };
  writeJSON("active_accidents.json", data);
  return data.accidents[index];
};

/**
 * Get accident by ID
 * @param {string} id - Accident ID
 * @returns {Object|null} Accident object or null
 */
const getAccidentById = (id) => {
  const accidents = getAccidents();
  return accidents.find((a) => a.id === id) || null;
};

/**
 * Get all casualties
 * @returns {Array} Array of casualties
 */
const getCasualties = () => {
  const data = readJSON("casualties.json");
  return data.casualties || [];
};

/**
 * Add new casualty
 * @param {Object} casualty - Casualty data
 * @returns {Object} Created casualty
 */
const addCasualty = (casualty) => {
  const data = readJSON("casualties.json");
  const newCasualty = {
    id: `CAS-${Date.now()}`,
    ...casualty,
    createdAt: new Date().toISOString(),
  };
  data.casualties.push(newCasualty);
  writeJSON("casualties.json", data);
  return newCasualty;
};

/**
 * Update casualty data
 * @param {string} id - Casualty ID
 * @param {Object} updates - Updates to apply
 * @returns {Object|null} Updated casualty or null
 */
const updateCasualty = (id, updates) => {
  const data = readJSON("casualties.json");
  const index = data.casualties.findIndex((c) => c.id === id);
  if (index === -1) return null;

  data.casualties[index] = { ...data.casualties[index], ...updates };
  writeJSON("casualties.json", data);
  return data.casualties[index];
};

/**
 * Get casualties by accident ID
 * @param {string} accidentId - Accident ID
 * @returns {Array} Array of casualties
 */
const getCasualtiesByAccidentId = (accidentId) => {
  const casualties = getCasualties();
  return casualties.filter((c) => c.accidentId === accidentId);
};

/**
 * Get all blood requests
 * @returns {Array} Array of blood requests
 */
const getBloodRequests = () => {
  const data = readJSON("blood_requests.json");
  return data.requests || [];
};

/**
 * Add new blood request
 * @param {Object} request - Blood request data
 * @returns {Object} Created blood request
 */
const addBloodRequest = (request) => {
  const data = readJSON("blood_requests.json");
  const newRequest = {
    id: `BR-${Date.now()}`,
    ...request,
    createdAt: new Date().toISOString(),
    status: "pending",
  };
  data.requests.push(newRequest);
  writeJSON("blood_requests.json", data);
  return newRequest;
};

/**
 * Update blood request
 * @param {string} id - Blood request ID
 * @param {Object} updates - Updates to apply
 * @returns {Object|null} Updated request or null
 */
const updateBloodRequest = (id, updates) => {
  const data = readJSON("blood_requests.json");
  const index = data.requests.findIndex((r) => r.id === id);
  if (index === -1) return null;

  data.requests[index] = { ...data.requests[index], ...updates };
  writeJSON("blood_requests.json", data);
  return data.requests[index];
};

/**
 * Get blood request by ID
 * @param {string} id - Blood request ID
 * @returns {Object|null} Blood request or null
 */
const getBloodRequestById = (id) => {
  const requests = getBloodRequests();
  return requests.find((r) => r.id === id) || null;
};

/**
 * Get all submissions
 * @returns {Array} Array of submissions
 */
const getSubmissions = () => {
  const data = readJSON("submissions.json");
  return data.submissions || [];
};

/**
 * Add new submission
 * @param {Object} submission - Submission data
 * @returns {Object} Created submission
 */
const addSubmission = (submission) => {
  const data = readJSON("submissions.json");
  const newSubmission = {
    id: `SUB-${Date.now()}`,
    ...submission,
    createdAt: new Date().toISOString(),
    status: "pending",
  };
  data.submissions.push(newSubmission);
  writeJSON("submissions.json", data);
  return newSubmission;
};

/**
 * Update submission
 * @param {string} id - Submission ID
 * @param {Object} updates - Updates to apply
 * @returns {Object|null} Updated submission or null
 */
const updateSubmission = (id, updates) => {
  const data = readJSON("submissions.json");
  const index = data.submissions.findIndex((s) => s.id === id);
  if (index === -1) return null;

  data.submissions[index] = { ...data.submissions[index], ...updates };
  writeJSON("submissions.json", data);
  return data.submissions[index];
};

module.exports = {
  readJSON,
  writeJSON,
  getHospitals,
  getHospitalById,
  getHospitalByName,
  updateHospital,
  getAmbulances,
  getAmbulanceById,
  getAmbulanceByName,
  updateAmbulance,
  getAvailableAmbulances,
  getAccidents,
  addAccident,
  updateAccident,
  removeAccident,
  getAccidentById,
  getCasualties,
  addCasualty,
  updateCasualty,
  getCasualtiesByAccidentId,
  getBloodRequests,
  addBloodRequest,
  updateBloodRequest,
  getBloodRequestById,
  getSubmissions,
  addSubmission,
  updateSubmission,
};

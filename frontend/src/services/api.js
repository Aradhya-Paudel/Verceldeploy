/**
 * Remove accident by ID
 * @param {string} id - Accident ID
 * @returns {Promise<object>} - { success, data, error }
 */
export const removeAccident = async (id) => {
  if (!id) return { success: false, error: "No accident ID provided" };
  try {
    const response = await apiRequest(`/accidents/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    return response;
  } catch (error) {
    return { success: false, error: error.message };
  }
};
/**
 * API Service for Emergency Response System
 * Handles all backend API communications
 * All functions return { success, data, error } format
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * Make API request with error handling
 * Returns consistent { success, data, error, message } format
 * @param {string} endpoint - API endpoint
 * @param {object} options - Fetch options
 * @returns {Promise<object>} - Response object
 */
const apiRequest = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });
    let data;
    try {
      data = await response.json();
    } catch (jsonErr) {
      // JSON na bhaye status ra text return garne (If not JSON, return status and text)
      const text = await response.text();
      return {
        success: false,
        error: `Non-JSON response: ${text}`,
        status: response.status,
      };
    }
    return data; // Backend bata aako full response as-is return garne (Return the full response as-is from backend)
  } catch (error) {
    // Production debugging ko lagi aru details log garne (Log more details for production debugging)
    console.error(`API Error [${endpoint}]:`, error, options);
    return { success: false, error: error.message, endpoint, options };
  }
};



/**
 * Login ambulance
 * @param {string} name - Ambulance name
 * @param {string} password - Password
 * @returns {Promise<object>} - { success, data, error }
 */
export const ambulanceLogin = async (name, password) => {
  const response = await apiRequest("/auth/ambulance/login", {
    method: "POST",
    body: JSON.stringify({ name, password }),
  });
  if (response.success && response.data?.ambulance) {
    return { success: true, data: response.data.ambulance };
  }
  return {
    success: false,
    error: response.error || response.message || "Login failed",
  };
};

/**
 * Login hospital
 * @param {string} name - Hospital name
 * @param {string} password - Password
 * @returns {Promise<object>} - { success, data, error }
 */
export const hospitalLogin = async (name, password) => {
  const response = await apiRequest("/auth/hospital/login", {
    method: "POST",
    body: JSON.stringify({ name, password }),
  });
  if (response.success && response.data?.hospital) {
    return { success: true, data: response.data.hospital };
  }
  return {
    success: false,
    error: response.error || response.message || "Login failed",
  };
};

// ==================== AMBULANCES ==================== (Ambulanceharu)

/**
 * Get all ambulances
 * @returns {Promise<object>} - { success, data, error }
 */
export const getAllAmbulances = async () => {
  const response = await apiRequest("/ambulances");
  if (response.success) {
    return {
      success: true,
      data: response.data?.ambulances || response.data || [],
    };
  }
  return { success: false, error: response.error, data: [] };
};

/**
 * Get available ambulances
 * @returns {Promise<object>} - { success, data, error }
 */
export const getAvailableAmbulances = async () => {
  const response = await apiRequest("/ambulances/available");
  if (response.success) {
    return {
      success: true,
      data: response.data?.ambulances || response.data || [],
    };
  }
  return { success: false, error: response.error, data: [] };
};

/**
 * Get ambulance by ID
 * @param {string} id - Ambulance ID
 * @returns {Promise<object>} - { success, data, error }
 */
export const getAmbulanceById = async (id) => {
  const response = await apiRequest(`/ambulances/${id}`);
  if (response.success) {
    return { success: true, data: response.data?.ambulance || response.data };
  }
  return { success: false, error: response.error };
};

/**
 * Find nearest ambulance to location
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @returns {Promise<object>} - { success, data, error }
 */
export const findNearestAmbulance = async (latitude, longitude) => {
  const response = await apiRequest("/ambulances/find-nearest", {
    method: "POST",
    body: JSON.stringify({ latitude, longitude }),
  });
  return response;
};

/**
 * Update ambulance location
 * @param {string} id - Ambulance ID or name
 * @param {number} latitude - New latitude
 * @param {number} longitude - New longitude
 * @returns {Promise<object>} - { success, data, error }
 */
export const updateAmbulanceLocation = async (id, latitude, longitude) => {
  if (!id || typeof id !== "string" || id.trim() === "") {
    console.error(
      "updateAmbulanceLocation: Invalid or missing ambulance id",
      id,
    );
    return { success: false, error: "Invalid or missing ambulance id" };
  }
  const response = await apiRequest(
    `/ambulances/${encodeURIComponent(id)}/location`,
    {
      method: "PATCH",
      body: JSON.stringify({ latitude, longitude }),
    },
  );
  return response;
};

/**
 * Update ambulance status
 * @param {string} id - Ambulance ID or name
 * @param {string} status - New status
 * @param {string} incidentId - Optional incident ID
 * @returns {Promise<object>} - { success, data, error }
 */
export const updateAmbulanceStatus = async (id, status, incidentId = null) => {
  const body = { status };
  if (incidentId) body.incidentId = incidentId;

  const response = await apiRequest(
    `/ambulances/${encodeURIComponent(id)}/status`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    },
  );
  return response;
};

/**
 * Accept accident assignment
 * @param {string} ambulanceId - Ambulance ID
 * @param {string} accidentId - Accident ID
 * @returns {Promise<object>} - { success, data, error }
 */
export const acceptAssignment = async (ambulanceId, accidentId) => {
  const response = await apiRequest(
    `/ambulances/${ambulanceId}/accept-assignment`,
    {
      method: "POST",
      body: JSON.stringify({ accidentId }),
    },
  );
  return response;
};

/**
 * Mark ambulance arrived at scene
 * @param {string} id - Ambulance ID
 * @returns {Promise<object>} - { success, data, error }
 */
export const arriveAtScene = async (id) => {
  const response = await apiRequest(`/ambulances/${id}/arrive-scene`, {
    method: "POST",
  });
  return response;
};

/**
 * Start transport to hospital
 * @param {string} ambulanceId - Ambulance ID
 * @param {number} hospitalId - Hospital ID
 * @returns {Promise<object>} - { success, data, error }
 */
export const startTransport = async (ambulanceId, hospitalId) => {
  const response = await apiRequest(
    `/ambulances/${ambulanceId}/start-transport`,
    {
      method: "POST",
      body: JSON.stringify({ hospitalId }),
    },
  );
  return response;
};

/**
 * Complete transport (arrived at hospital)
 * @param {string} id - Ambulance ID
 * @returns {Promise<object>} - { success, data, error }
 */
export const completeTransport = async (id) => {
  const response = await apiRequest(`/ambulances/${id}/complete-transport`, {
    method: "POST",
  });
  return response;
};

// ==================== ACCIDENTS ==================== (Durbhagya)

/**
 * Report new accident
 * @param {object} accidentData - Accident details
 * @returns {Promise<object>} - { success, data, error }
 */
export const reportAccident = async (accidentData) => {
  const response = await apiRequest("/accidents/report", {
    method: "POST",
    body: JSON.stringify(accidentData),
  });
  return response;
};

/**
 * Get all accidents
 * @returns {Promise<object>} - { success, data, error }
 */
export const getAllAccidents = async () => {
  const response = await apiRequest("/accidents");
  if (response.success) {
    return {
      success: true,
      data: response.data?.accidents || response.data || [],
    };
  }
  return { success: false, error: response.error, data: [] };
};

/**
 * Get pending accidents
 * @returns {Promise<object>} - { success, data, error }
 */
export const getPendingAccidents = async () => {
  const response = await apiRequest("/accidents/pending");
  if (response.success) {
    return {
      success: true,
      data: response.data?.accidents || response.data || [],
    };
  }
  return { success: false, error: response.error, data: [] };
};

/**
 * Get accident by ID
 * @param {string} id - Accident ID
 * @returns {Promise<object>} - { success, data, error }
 */
export const getAccidentById = async (id) => {
  const response = await apiRequest(`/accidents/${id}`);
  if (response.success) {
    return { success: true, data: response.data?.accident || response.data };
  }
  return { success: false, error: response.error };
};

/**
 * Update accident status
 * @param {string} id - Accident ID
 * @param {string} status - New status
 * @returns {Promise<object>} - { success, data, error }
 */
export const updateAccidentStatus = async (id, status) => {
  const response = await apiRequest(`/accidents/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  return response;
};

// ==================== CASUALTIES ==================== (Ghaitaharuko sankhya)

/**
 * Add casualty to accident
 * @param {object} casualtyData - Casualty details
 * @returns {Promise<object>} - { success, data, error }
 */
export const addCasualty = async (casualtyData) => {
  const response = await apiRequest("/casualties", {
    method: "POST",
    body: JSON.stringify(casualtyData),
  });
  return response;
};

/**
 * Get hospital recommendations for casualty
 * @param {object} params - Injury type, blood type, location
 * @returns {Promise<object>} - { success, data, error }
 */
export const getHospitalRecommendations = async (params) => {
  const response = await apiRequest("/casualties/recommend-hospitals", {
    method: "POST",
    body: JSON.stringify(params),
  });
  if (response.success) {
    return {
      success: true,
      data: response.data?.recommendations || response.data || [],
    };
  }
  return { success: false, error: response.error, data: [] };
};

/**
 * Get casualties for accident
 * @param {string} accidentId - Accident ID
 * @returns {Promise<object>} - { success, data, error }
 */
export const getCasualtiesForAccident = async (accidentId) => {
  const response = await apiRequest(`/casualties/accident/${accidentId}`);
  if (response.success) {
    return {
      success: true,
      data: response.data?.casualties || response.data || [],
    };
  }
  return { success: false, error: response.error, data: [] };
};

/**
 * Update casualty status
 * @param {string} id - Casualty ID
 * @param {string} status - New status
 * @returns {Promise<object>} - { success, data, error }
 */
export const updateCasualtyStatus = async (id, status) => {
  const response = await apiRequest(`/casualties/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  return response;
};

/**
 * Find best hospital for casualty
 * @param {object} params - bloodType, specialtyRequired, latitude, longitude
 * @returns {Promise<object>} - { success, data, error }
 */
export const findBestHospital = async (params) => {
  const response = await apiRequest("/hospitals/find-best", {
    method: "POST",
    body: JSON.stringify(params),
  });
  if (response.success) {
    return { success: true, data: response.data?.hospital || response.data };
  }
  return { success: false, error: response.error };
};

// ==================== HOSPITALS ==================== (Hospitalharu)

/**
 * Get all hospitals
 * @returns {Promise<object>} - { success, data, error }
 */
export const getAllHospitals = async () => {
  const response = await apiRequest("/hospitals");
  if (response.success) {
    return {
      success: true,
      data: response.data?.hospitals || response.data || [],
    };
  }
  return { success: false, error: response.error, data: [] };
};

/**
 * Get hospital by ID
 * @param {number} id - Hospital ID
 * @returns {Promise<object>} - { success, data, error }
 */
export const getHospitalById = async (id) => {
  const response = await apiRequest(`/hospitals/${id}`);
  if (response.success) {
    return { success: true, data: response.data?.hospital || response.data };
  }
  return { success: false, error: response.error };
};

/**
 * Get hospital by name
 * @param {string} name - Hospital name
 * @returns {Promise<object>} - { success, data, error }
 */
export const getHospitalByName = async (name) => {
  const response = await apiRequest(
    `/hospitals/by-name/${encodeURIComponent(name)}`,
  );
  if (response.success) {
    return { success: true, data: response.data?.hospital || response.data };
  }
  return { success: false, error: response.error };
};

/**
 * Get hospital dashboard data
 * @param {number} id - Hospital ID
 * @returns {Promise<object>} - { success, data, error }
 */
export const getHospitalDashboard = async (id) => {
  const response = await apiRequest(`/hospitals/${id}/dashboard`);
  return response;
};

/**
 * Get hospital fleet (ambulances)
 * @param {number} id - Hospital ID
 * @returns {Promise<object>} - { success, data, error }
 */
export const getHospitalFleet = async (id) => {
  const response = await apiRequest(`/hospitals/${id}/fleet`);
  if (response.success) {
    return {
      success: true,
      data: response.data?.ambulances || response.data || [],
    };
  }
  return { success: false, error: response.error, data: [] };
};

/**
 * Get hospital blood inventory
 * @param {number} id - Hospital ID
 * @returns {Promise<object>} - { success, data, error }
 */
export const getBloodInventory = async (id) => {
  const response = await apiRequest(`/hospitals/${id}/blood-inventory`);
  if (response.success) {
    return { success: true, data: response.data?.inventory || response.data };
  }
  return { success: false, error: response.error };
};

/**
 * Get hospital staff
 * @param {number} id - Hospital ID
 * @returns {Promise<object>} - { success, data, error }
 */
export const getHospitalStaff = async (id) => {
  const response = await apiRequest(`/hospitals/${id}/staff`);
  return response;
};

/**
 * Update hospital beds
 * @param {number} id - Hospital ID
 * @param {number} bedsAvailable - New bed count
 * @returns {Promise<object>} - { success, data, error }
 */
export const updateHospitalBeds = async (id, bedsAvailable) => {
  const response = await apiRequest(`/hospitals/${id}/beds`, {
    method: "PATCH",
    body: JSON.stringify({ bedsAvailable }),
  });
  return response;
};

/**
 * Update blood inventory
 * @param {number} id - Hospital ID
 * @param {array} bloodTypes - Array of { type, liters } objects
 * @returns {Promise<object>} - { success, data, error }
 */
export const updateBloodInventory = async (id, bloodTypes) => {
  const response = await apiRequest(`/hospitals/${id}/blood-inventory`, {
    method: "PATCH",
    body: JSON.stringify({ bloodTypes }),
  });
  return response;
};

/**
 * Update ambulance count for hospital
 * @param {number} id - Hospital ID
 * @param {number} ambulanceCount - New ambulance count
 * @returns {Promise<object>} - { success, data, error }
 */
export const updateHospitalAmbulanceCount = async (id, ambulanceCount) => {
  const response = await apiRequest(`/hospitals/${id}/ambulance-count`, {
    method: "PATCH",
    body: JSON.stringify({ ambulanceCount }),
  });
  return response;
};

/**
 * Update staff count
 * @param {number} id - Hospital ID
 * @param {object} staffCount - Staff count object { specialty: count }
 * @returns {Promise<object>} - { success, data, error }
 */
export const updateHospitalStaff = async (id, staffCount) => {
  const response = await apiRequest(`/hospitals/${id}/staff`, {
    method: "PATCH",
    body: JSON.stringify({ staffCount }),
  });
  return response;
};

// ==================== BLOOD REQUESTS ==================== (Rakta anurodh)

/**
 * Create blood request
 * @param {object} requestData - Request details
 * @returns {Promise<object>} - { success, data, error }
 */
export const createBloodRequest = async (requestData) => {
  const response = await apiRequest("/blood/request", {
    method: "POST",
    body: JSON.stringify(requestData),
  });
  return response;
};

/**
 * Get all blood requests
 * @returns {Promise<object>} - { success, data, error }
 */
export const getAllBloodRequests = async () => {
  const response = await apiRequest("/blood/requests");
  if (response.success) {
    return {
      success: true,
      data: response.data?.requests || response.data || [],
    };
  }
  return { success: false, error: response.error, data: [] };
};

/**
 * Get blood request by ID
 * @param {string} id - Request ID
 * @returns {Promise<object>} - { success, data, error }
 */
export const getBloodRequestById = async (id) => {
  const response = await apiRequest(`/blood/requests/${id}`);
  if (response.success) {
    return { success: true, data: response.data?.request || response.data };
  }
  return { success: false, error: response.error };
};

/**
 * Get blood requests for hospital (incoming/outgoing)
 * @param {number} hospitalId - Hospital ID
 * @returns {Promise<object>} - { success, data, error }
 */
export const getBloodRequestsForHospital = async (hospitalId) => {
  const response = await apiRequest(`/blood/requests/hospital/${hospitalId}`);
  if (response.success) {
    return {
      success: true,
      data: response.data?.requests || response.data || [],
    };
  }
  return { success: false, error: response.error, data: [] };
};

/**
 * Approve blood request
 * @param {string} requestId - Request ID
 * @returns {Promise<object>} - { success, data, error }
 */
export const approveBloodRequest = async (requestId) => {
  const response = await apiRequest(`/blood/requests/${requestId}/approve`, {
    method: "POST",
  });
  return response;
};

/**
 * Decline blood request
 * @param {string} requestId - Request ID
 * @param {string} reason - Rejection reason
 * @returns {Promise<object>} - { success, data, error }
 */
export const declineBloodRequest = async (requestId, reason = "") => {
  const response = await apiRequest(`/blood/requests/${requestId}/decline`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
  return response;
};

/**
 * Complete blood transfer
 * @param {string} requestId - Request ID
 * @returns {Promise<object>} - { success, data, error }
 */
export const completeBloodTransfer = async (requestId) => {
  const response = await apiRequest(`/blood/requests/${requestId}/complete`, {
    method: "POST",
  });
  return response;
};

// ==================== BLOOD ALERTS ==================== (Rakta chetawani)

/**
 * Send blood alert to nearest hospital
 * @param {number} bestHospitalId - ID of the hospital requesting blood
 * @param {string} bloodType - Blood type needed (e.g., 'A+', 'O-')
 * @param {number} unitsNeeded - Units of blood required
 * @param {string} urgency - 'normal' | 'urgent' | 'critical'
 * @param {object} casualtyInfo - Optional casualty details
 * @returns {Promise<object>} - { success, data, error }
 */
export const sendBloodAlertToNearest = async (
  bestHospitalId,
  bloodType,
  unitsNeeded,
  urgency = "urgent",
  casualtyInfo = null,
) => {
  const response = await apiRequest("/blood-alerts/send-alert", {
    method: "POST",
    body: JSON.stringify({
      bestHospitalId,
      bloodType,
      unitsNeeded,
      urgency,
      casualtyInfo,
    }),
  });
  return response;
};

/**
 * Get all blood alerts for a hospital
 * @param {number} hospitalId - Hospital ID
 * @returns {Promise<object>} - { success, bloodAlerts, pending }
 */
export const getBloodAlerts = async (hospitalId) => {
  const response = await apiRequest(`/blood-alerts/${hospitalId}`);
  return response;
};

/**
 * Accept a blood alert request
 * @param {number} hospitalId - Hospital ID
 * @param {string} alertId - Alert ID
 * @returns {Promise<object>} - { success, alert }
 */
export const acceptBloodAlert = async (hospitalId, alertId) => {
  const response = await apiRequest(
    `/blood-alerts/${hospitalId}/${alertId}/accept`,
    {
      method: "PATCH",
    },
  );
  return response;
};

/**
 * Reject a blood alert request
 * @param {number} hospitalId - Hospital ID
 * @param {string} alertId - Alert ID
 * @param {string} reason - Rejection reason
 * @returns {Promise<object>} - { success, alert }
 */
export const rejectBloodAlert = async (hospitalId, alertId, reason = "") => {
  const response = await apiRequest(
    `/blood-alerts/${hospitalId}/${alertId}/reject`,
    {
      method: "PATCH",
      body: JSON.stringify({ reason }),
    },
  );
  return response;
};

// ==================== UTILITY ==================== (Upayogita)

/**
 * Health check
 * @returns {Promise<object>} - { success, data, error }
 */
export const healthCheck = async () => {
  const response = await apiRequest("/health");
  return response;
};

export default {
  // Auth (Pramanikaran)
  ambulanceLogin,
  hospitalLogin,
  // Ambulances (Ambulanceharu)
  getAllAmbulances,
  getAvailableAmbulances,
  getAmbulanceById,
  findNearestAmbulance,
  updateAmbulanceLocation,
  updateAmbulanceStatus,
  acceptAssignment,
  arriveAtScene,
  startTransport,
  completeTransport,
  // Accidents (Durbhagya)
  reportAccident,
  getAllAccidents,
  getPendingAccidents,
  getAccidentById,
  updateAccidentStatus,
  removeAccident,
  // Casualties (Ghaitaharuko sankhya)
  addCasualty,
  getHospitalRecommendations,
  getCasualtiesForAccident,
  updateCasualtyStatus,
  findBestHospital,
  // Hospitals (Hospitalharu)
  getAllHospitals,
  getHospitalById,
  getHospitalByName,
  getHospitalDashboard,
  getHospitalFleet,
  getBloodInventory,
  getHospitalStaff,
  updateHospitalBeds,
  updateBloodInventory,
  updateHospitalAmbulanceCount,
  updateHospitalStaff,
  // Blood Requests (Rakta anurodh)
  createBloodRequest,
  getAllBloodRequests,
  getBloodRequestById,
  getBloodRequestsForHospital,
  approveBloodRequest,
  declineBloodRequest,
  completeBloodTransfer,
  // Blood Alerts (Rakta chetawani)
  sendBloodAlertToNearest,
  getBloodAlerts,
  acceptBloodAlert,
  rejectBloodAlert,
  // Utility (Upayogita)
  healthCheck,
};

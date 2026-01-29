const { findNearestAmbulance } = require('../src/controllers/ambulanceController'); 
// We can't easily test the controller function directly because it expects req, res
// But we can test the utilities if we export them, or check if the controller allows a non-express call.
// Since controllers are usually (req, res), we will MOCK req and res.

const { reportAccident } = require('../src/controllers/accidentController');

const run = async () => {
  console.log('   Testing Ambulance Dispatch Flow...');

  // Mock Request for Accident Report
  const req = {
    body: {
      latitude: 28.21, // Near "Alpha 1" in our mock DB (28.21, 83.99)
      longitude: 83.99, 
      title: "Test Accident",
      description: "Testing Dispatch",
      location: "Test Location"
    }
  };

  let responseData = null;
  const res = {
    status: (code) => ({
      json: (data) => {
        responseData = data;
        return data;
      }
    }),
    json: (data) => {
      responseData = data;
      return data;
    }
  };

  // 1. Run Report Accident
  console.log('   1. Calling reportAccident()...');
  try {
    await reportAccident(req, res);
  } catch (e) {
    console.log('      FAILED: Controller crashed:', e.message);
    return false;
  }

  // 2. Verify Output
  if (!responseData || !responseData.success) {
    console.log('      FAILED: API returned error or failure:', responseData);
    return false;
  }
  
  // 3. Verify Assignment
  if (!responseData.data || !responseData.data.accident || !responseData.data.dispatch) {
    console.log('      FAILED: Missing accident or dispatch info in response data');
    console.log('      Received:', JSON.stringify(responseData, null, 2));
    return false;
  }

  if (responseData.data.dispatch.ambulanceId !== "AMB-1") {
    console.log(`      FAILED: Expected Alpha 1 (AMB-1), got ${responseData.data.dispatch.ambulanceId}`);
    return false;
  }

  console.log(`      PASSED: Dispatched ${responseData.data.dispatch.ambulanceName} correctly.`);
  return true;
};

module.exports = { run };

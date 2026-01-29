const { addCasualtyToAccident } = require('../src/controllers/casualtyController');

const run = async () => {
  console.log('   Testing Casualty Reporting Flow...');

  // Need a mock accident first (since accidents are required now)
  // We'll trust the accident created by previous test exists? 
  // No, tests run sequentially but usually stateless if we reload modules properly. 
  // But our testRunner uses a global MOCK_DB variable that PERSISTS across tests in the same process run!
  // So we can check if accidents exist.

  // Let's create a fresh accident for this test just to be safe by manually injecting into the 'require'ed dataAccess? 
  // No, we can't easily reach into dataAccess scope correctly.
  // Best bet: Use the Controller to create one or assume empty DB from start of run. 
  // In run_tests.js, MOCK_DB is reset on start. So previous test_ambulanceDispatch DID populate it if run sequentially in same process.
  
  const req = {
    body: {
      accidentId: "ACC-TEST-1", // We need a valid ID. 
      // Wait, if accident doesn't exist, casualtyController might fail.
      // We should inject an accident first via dataAccess mock? 
      // Actually, let's use the accidentController to make one.
      name: "John Doe",
      injuryType: "Trauma",
      bloodType: "A+",
      bloodUnitsNeeded: 2,
      severity: "critical"
    }
  };

  // Pre-requisite: Create an accident
  const { reportAccident } = require('../src/controllers/accidentController');
  const resSetup = { status: () => ({ json: () => {} }), json: () => {} };
  await reportAccident({ body: { latitude: 28.2, longitude: 83.9, title: "T", description: "D", location: "L" } }, resSetup);
  
  // Find that accident ID from our "fs" mock? 
  // We can't easily see the ID generated. 
  // HACK: We will just mock req to have ANY ID and hope validation passes? 
  // No, casualtyController calls `getAccidentById`.
  
  // BETTER APPROACH: Read 'active_accidents.json' using our mocked FS to get the ID.
  const fs = require('fs');
  const dbData = JSON.parse(fs.readFileSync('d:/My Codes/HackathonPEC deploy/backend/data/active_accidents.json', 'utf8')); // Path matching mock
  const accId = dbData.accidents[0].id;
  
  req.body.accidentId = accId;
  console.log(`   1. Using Accident ID: ${accId}`);

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

  try {
    await addCasualtyToAccident(req, res);
  } catch (e) {
    console.log('      FAILED: Controller error:', e.message);
    return false;
  }

  if (responseData && responseData.success) {
    // Check structure: data.hospitalAssignment.hospital
    if (responseData.data && responseData.data.hospitalAssignment && responseData.data.hospitalAssignment.hospital) {
       console.log(`      PASSED: Casualty assigned to hospital ${responseData.data.hospitalAssignment.hospital.name}`);
       return true;
    } else {
       console.log('      FAILED: Missing hospital assignment in response data');
       console.log('      Received:', JSON.stringify(responseData, null, 2));
       return false;
    }
  } else {
    console.log('      FAILED:', responseData);
    return false;
  }
};

module.exports = { run };

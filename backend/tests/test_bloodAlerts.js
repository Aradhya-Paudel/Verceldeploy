const { sendBloodAlertToNearest } = require('../src/controllers/bloodAlertController');

const run = async () => {
  console.log('   Testing Blood Alert Logic...');

  const req = {
    body: {
      bestHospitalId: 1, // "Test Hospital A" from our mock DB
      bloodType: "AB-", // Rare type
      unitsNeeded: 2,
      urgency: "critical",
      casualtyInfo: { name: "Test Patient" }
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

  console.log('   1. Sending Blood Alert...');
  await sendBloodAlertToNearest(req, res);

  if (responseData && responseData.success) {
    // Check if correct content
    // Hospital A (id 1) is needing blood.
    // In Mock DB, Hospital B (id 2) is nearby. Hospital A is reference.
    // So Hospital B should receive the alert.
    
    // Check our MOCK_DB to see if alert was pushed?
    // We can just rely on the response for now.
    
    if (responseData.nearestHospital.id === 2) {
      console.log(`      PASSED: Alert routed to Hospital B (Nearest).`);
      return true;
    } else {
      console.log(`      FAILED: Incorrect routing. Expected Hospital 2, got ${responseData.nearestHospital.id}`);
      return false;
    }

  } else {
    console.log('      FAILED:', responseData);
    return false;
  }
};

module.exports = { run };

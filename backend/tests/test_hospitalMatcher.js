const { findNearestHospitalToHospital } = require('../src/utils/hospitalMatcher');

const run = async () => {
  console.log('   Testing Hospital Matcher Logic...');
  
  // Test Data
  const hospitals = [
    { id: 1, name: "Hospital A", latitude: 10, longitude: 10 },
    { id: 2, name: "Hospital B", latitude: 10.1, longitude: 10.1 }, // Close
    { id: 3, name: "Hospital C", latitude: 20, longitude: 20 }      // Far
  ];
  
  const referenceHospital = hospitals[0]; // Hospital A
  
  // 1. Test Nearest Logic
  console.log('   1. Verifying findNearestHospitalToHospital...');
  const result = findNearestHospitalToHospital(hospitals, referenceHospital);
  
  if (!result) {
    console.log('      FAILED: Result is null');
    return false;
  }
  
  if (result.id !== 2) {
    console.log(`      FAILED: Expected Hospital B (id:2), got ${result.name} (id:${result.id})`);
    return false;
  }
  
  console.log('      PASSED: Correctly identified nearest hospital.');
  
  // 2. Test Empty List logic
  const emptyResult = findNearestHospitalToHospital([], referenceHospital);
  if (emptyResult !== null) {
      console.log('      FAILED: Should return null for empty list');
      return false;
  }

  return true;
};

module.exports = { run };

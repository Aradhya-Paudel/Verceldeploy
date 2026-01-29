const fs = require('fs');
const path = require('path');

// ==========================================
// 1. Mock Data Integration
// ==========================================
// We'll create a virtual file system to prevent tests from modifying real data
const MOCK_DB = {
  'hospitals.json': JSON.stringify({
    hospitals: [
      { 
        id: 1, 
        name: "Test Hospital A", 
        latitude: 28.2, 
        longitude: 83.9, 
        ambulanceCount: 2, 
        bedsAvailable: 20,
        staffCount: {
          "General Surgeon": 5,
          "Neurologist": 3,
          "Emergency Medicine Specialist": 5
        },
        bloodInventory: { total: 10, bloodTypes: [{"type":"A+","units":5},{"type":"O-","units":5}] }, 
        bloodAlerts: [] 
      },
      { 
        id: 2, 
        name: "Test Hospital B", 
        latitude: 28.25, 
        longitude: 84.0, 
        ambulanceCount: 0, 
        bedsAvailable: 10,
        staffCount: {
          "General Surgeon": 2,
          "Neurologist": 1
        },
        bloodInventory: { total: 0, bloodTypes: [] }, 
        bloodAlerts: [] 
      }
    ]
  }),
  'ambulances.json': JSON.stringify({
    ambulances: [
      { id: "AMB-1", name: "Alpha 1", latitude: 28.21, longitude: 83.99, status: "available" },
      { id: "AMB-2", name: "Bravo 2", latitude: 28.22, longitude: 84.01, status: "busy" }
    ]
  }),
  'active_accidents.json': JSON.stringify({
    accidents: []
  }),
  'casualties.json': JSON.stringify({
    casualties: []
  }),
  'blood_requests.json': JSON.stringify({
    requests: []
  })
};

// Save original fs methods
const originalRead = fs.readFileSync;
const originalWrite = fs.writeFileSync;

// Monkey-patch fs methods for the tests
fs.readFileSync = (filepath, encoding) => {
  const filename = path.basename(filepath);
  // Debug Logging
  // console.log(`[FS READ] ${filename} from ${filepath}`);
  
  if (Object.keys(MOCK_DB).includes(filename) && filepath.includes('data')) {
    // console.log(`   -> INTERCEPTED READ: ${filename}`);
    return MOCK_DB[filename];
  }
  return originalRead(filepath, encoding);
};

fs.writeFileSync = (filepath, data, encoding) => {
  const filename = path.basename(filepath);
  if (Object.keys(MOCK_DB).includes(filename) && filepath.includes('data')) {
    MOCK_DB[filename] = data; // Update in-memory DB
    return;
  }
  return originalWrite(filepath, data, encoding);
};

// ==========================================
// 2. Test Runner Logic
// ==========================================
const runTests = async () => {
  console.log('🚀 Starting Backend Test Suite...');
  console.log('=================================\n');

  const testFiles = [
    './test_hospitalMatcher.js',
    './test_ambulanceDispatch.js',
    './test_casualtyFlow.js',
    './test_bloodAlerts.js'
  ];

  let totalPassed = 0;
  let totalFailed = 0;

  for (const file of testFiles) {
    console.log(`📂 Running ${file.replace('./', '')}...`);
    try {
      const testModule = require(file);
      if (testModule.run) {
        const result = await testModule.run();
        if (result) {
          console.log(`✅ PASS: ${file}`);
          totalPassed++;
        } else {
          console.log(`❌ FAIL: ${file}`);
          totalFailed++;
        }
      } else {
        console.log(`⚠️ SKIPPED: ${file} (No run function exported)`);
      }
    } catch (e) {
      console.log(`❌ ERROR: ${file} crashed`);
      console.error(e);
      totalFailed++;
    }
    console.log('\n---------------------------------\n');
  }

  console.log('=================================');
  console.log(`🏁 Tests Completed.`);
  console.log(`✅ Passed: ${totalPassed}`);
  console.log(`❌ Failed: ${totalFailed}`);
  
  // Exit with error code if failures
  if (totalFailed > 0) process.exit(1);
};

// Start
runTests();

require('dotenv').config();

module.exports = {
    baseURL: process.env.TEST_BASE_URL || 'http://localhost:3000',
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_KEY,
    locationIQKey: process.env.LOCATIONIQ_API_KEY,
    timeout: 90000, // 90 seconds per test
    retries: 2, // Retry failed tests twice
    verbose: process.argv.includes('--verbose'),
    stopOnFail: process.argv.includes('--stop-on-fail'),
    category: process.argv.find(arg => arg.startsWith('--category='))?.split('=')[1],
    testData: {
        validHospitalId: 1,
        validDoctorId: null, // Will be fetched from DB
        validPatientId: null, // Will be fetched from DB
        validAmbulanceId: null, // Will be fetched from DB
        testCoordinates: {
            kathmandu: { latitude: 27.7172, longitude: 85.3240 },
            patan: { latitude: 27.6900, longitude: 85.3200 },
            invalid: { latitude: 999, longitude: 200 }
        },
        testBloodTypes: ['A+', 'O+', 'B+', 'AB+', 'O-'],
        testSpecialties: ['Cardiology', 'Trauma Surgery', 'Neurology', 'Orthopedics']
    }
};

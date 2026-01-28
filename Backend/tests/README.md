# Hospital System Test Suite

Comprehensive testing framework for the Hospital Resource Matching System.

## Quick Start

### Run All Tests
```bash
npm test
# or
node tests/comprehensive-test.js
```

### Quick Smoke Test (Fast)
```bash
# Git Bash / Linux / Mac
chmod +x tests/quick-smoke-test.sh
./tests/quick-smoke-test.sh
```

## Test Options

### Verbose Mode
Shows full request/response details:
```bash
node tests/comprehensive-test.js --verbose
```

### Run Specific Category
```bash
node tests/comprehensive-test.js --category="Matching Engine"
```

Available categories:
- Infrastructure
- Hospital Management
- Doctor Management
- Patient Management
- Appointment Management
- Matching Engine
- Location Services
- Ambulance Management
- Integration Workflows
- Error Handling
- Performance

### Stop on First Failure
```bash
node tests/comprehensive-test.js --stop-on-fail
```

## Environment Setup

Create `.env` file with:
```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
LOCATIONIQ_API_KEY=your_locationiq_key (optional)
TEST_BASE_URL=http://localhost:3000
```

## Test Categories

### 1. Infrastructure (5 tests)
- Server health check
- CORS configuration
- Network accessibility
- Database connectivity
- Seed data validation

### 2. Hospital Management (9 tests)
- List all hospitals
- Get single hospital
- Hospital status
- Update hospital resources
- Map view integration

### 3. Doctor Management (5 tests)
- List doctors
- Filter by hospital
- Filter by specialty
- Get single doctor

### 4. Patient Management (4 tests)
- Create patient
- Get patient details
- Update patient info
- Medical records

### 5. Appointment Management (5 tests)
- Create appointment
- List by patient/doctor
- Update status
- Cancel appointment

### 6. Matching Engine (10 tests)
- Coordinate-based matching
- Blood type filtering
- Specialist filtering
- Combined filters
- Address-based matching
- Distance sorting

### 7. Location Services (5 tests)
- Geocoding
- Reverse geocoding
- Static map generation
- Invalid input handling

### 8. Ambulance Management (2 tests)
- Location updates
- Current trip status

### 9. Integration Workflows (2 tests)
- Complete patient journey
- Resource update flow

### 10. Error Handling (5 tests)
- Malformed JSON
- SQL injection protection
- Rate limiting
- Database errors

### 11. Performance (3 tests)
- Response time benchmarks
- Concurrent request handling

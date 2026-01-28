const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
const config = require('./test-config');

// Color codes for console output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

// Supabase client
const supabase = createClient(config.supabaseUrl, config.supabaseKey);

class TestRunner {
    constructor() {
        this.results = {
            total: 0,
            passed: 0,
            failed: 0,
            skipped: 0,
            categories: {},
            failedTests: [],
            warnings: [],
            startTime: Date.now(),
            tests: []
        };
        this.currentCategory = null;
    }

    setCategory(categoryName) {
        this.currentCategory = categoryName;
        if (!this.results.categories[categoryName]) {
            this.results.categories[categoryName] = {
                total: 0,
                passed: 0,
                failed: 0,
                tests: []
            };
        }
        console.log(`\n${colors.cyan}═══ ${categoryName} ═══${colors.reset}\n`);
    }

    async test(name, testFunction, options = {}) {
        // Skip if category filter is active and doesn't match
        if (config.category && this.currentCategory !== config.category) {
            return;
        }

        this.results.total++;
        const categoryData = this.results.categories[this.currentCategory];
        categoryData.total++;

        const testNumber = this.results.total;
        const testStart = Date.now();

        try {
            // Run the test
            await testFunction();

            const duration = Date.now() - testStart;
            this.results.passed++;
            categoryData.passed++;

            const testResult = {
                number: testNumber,
                name,
                category: this.currentCategory,
                status: 'passed',
                duration
            };

            this.results.tests.push(testResult);
            categoryData.tests.push(testResult);

            console.log(`${colors.green}✓${colors.reset} Test ${testNumber}: ${name} (${duration}ms)`);

        } catch (error) {
            const duration = Date.now() - testStart;
            this.results.failed++;
            categoryData.failed++;

            const testResult = {
                number: testNumber,
                name,
                category: this.currentCategory,
                status: 'failed',
                duration,
                error: error.message,
                expected: error.expected,
                actual: error.actual
            };

            this.results.tests.push(testResult);
            categoryData.tests.push(testResult);
            this.results.failedTests.push(testResult);

            console.log(`${colors.red}✗${colors.reset} Test ${testNumber}: ${name} (${duration}ms)`);
            const errorMessage = error.message || JSON.stringify(error, Object.getOwnPropertyNames(error));
            console.log(`  ${colors.red}Error: ${errorMessage}${colors.reset}`);

            if (config.verbose) {
                console.log(`  Expected: ${error.expected}`);
                console.log(`  Actual: ${error.actual}`);
            }

            if (config.stopOnFail) {
                throw new Error('Stopping on first failure (--stop-on-fail enabled)');
            }
        }
    }

    addWarning(message) {
        this.results.warnings.push(message);
        console.log(`${colors.yellow}⚠${colors.reset} Warning: ${message}`);
    }

    getReport() {
        this.results.duration = ((Date.now() - this.results.startTime) / 1000).toFixed(2);
        this.results.timestamp = new Date().toISOString();
        return this.results;
    }

    printReport() {
        const report = this.getReport();
        console.log(`\n${colors.magenta}╔═══════════════════════════════════════════════════════════╗${colors.reset}`);
        console.log(`${colors.magenta}║                    TEST SUMMARY                           ║${colors.reset}`);
        console.log(`${colors.magenta}╚═══════════════════════════════════════════════════════════╝${colors.reset}\n`);

        console.log(`Total: ${report.total}, Passed: ${report.passed}, Failed: ${report.failed}`);

        if (report.failedTests.length > 0) {
            console.log(`\n${colors.red}FAILURES:${colors.reset}`);
            report.failedTests.forEach(t => console.log(`- ${t.name}: ${t.error}`));
            process.exit(1);
        } else {
            console.log(`\n${colors.green}ALL TESTS PASSED${colors.reset}`);
        }
    }
}

// HTTP request helper
async function makeRequest(method, endpoint, data = null, headers = {}) {
    const url = `${config.baseURL}${endpoint}`;
    const options = {
        method,
        url,
        headers: { 'Content-Type': 'application/json', ...headers },
        timeout: config.timeout,
        validateStatus: () => true // Don't throw on any status
    };

    if (data) {
        options.data = data;
    }

    const startTime = Date.now();
    const response = await axios(options);
    const duration = Date.now() - startTime;

    if (config.verbose) {
        console.log(`  ${method} ${endpoint} → ${response.status} (${duration}ms)`);
    }

    return {
        status: response.status,
        data: response.data,
        headers: response.headers,
        duration
    };
}

// Assertion helpers
function assertEqual(actual, expected, message) {
    if (actual !== expected) {
        const error = new Error(message || `Expected ${expected}, got ${actual}`);
        error.expected = expected;
        error.actual = actual;
        throw error;
    }
}

function assertStatus(response, expectedStatus, message) {
    if (response.status !== expectedStatus) {
        const error = new Error(
            message || `Expected status ${expectedStatus}, got ${response.status}`
        );
        error.expected = expectedStatus;
        error.actual = response.status;
        throw error;
    }
}

function assertHasProperty(obj, property, message) {
    if (!(property in obj)) {
        const error = new Error(message || `Expected object to have property '${property}'`);
        error.expected = `Object with property '${property}'`;
        error.actual = `Object without property '${property}'`;
        throw error;
    }
}

function assertArrayNotEmpty(arr, message) {
    if (!Array.isArray(arr) || arr.length === 0) {
        const error = new Error(message || 'Expected non-empty array');
        error.expected = 'Non-empty array';
        error.actual = arr;
        throw error;
    }
}

function assertGreaterThan(actual, threshold, message) {
    if (actual <= threshold) {
        const error = new Error(
            message || `Expected ${actual} to be greater than ${threshold}`
        );
        error.expected = `> ${threshold}`;
        error.actual = actual;
        throw error;
    }
}

// Database query helper
async function queryDatabase(query) {
    try {
        const { data, error } = await supabase.rpc('execute_sql', { query });
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Database query failed:', error);
        throw error;
    }
}

// Verify database state
async function verifyDatabaseState(table, conditions, expectedCount) {
    const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact' })
        .match(conditions);

    if (error) throw new Error(`Database verification failed: ${error.message}`);

    if (expectedCount !== undefined && count !== expectedCount) {
        throw new Error(
            `Expected ${expectedCount} rows in ${table}, found ${count}`
        );
    }

    return { data, count };
}

// Fetch test IDs from database
async function fetchTestIds() {
    // Get first hospital ID
    const { data: hospitals } = await supabase
        .from('hospitals')
        .select('id')
        .limit(1)
        .single();

    // Get first doctor ID
    const { data: doctors } = await supabase
        .from('doctors')
        .select('id')
        .limit(1)
        .single();

    // Get first patient ID
    const { data: patients } = await supabase
        .from('patients')
        .select('id')
        .limit(1)
        .single();

    // Get first ambulance ID (if table exists)
    let ambulanceId = null;
    try {
        const { data: ambulances } = await supabase
            .from('ambulances')
            .select('id')
            .limit(1)
            .single();
        ambulanceId = ambulances?.id;
    } catch (e) {
        // Ambulances table might not exist yet
    }

    return {
        hospitalId: hospitals?.id,
        doctorId: doctors?.id,
        patientId: patients?.id,
        ambulanceId
    };
}

module.exports = {
    TestRunner,
    makeRequest,
    assertEqual,
    assertStatus,
    assertHasProperty,
    assertArrayNotEmpty,
    assertGreaterThan,
    verifyDatabaseState,
    queryDatabase,
    fetchTestIds,
    colors,
    config
};

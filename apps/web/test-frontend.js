const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:3001/api';
const FRONTEND_BASE = 'http://localhost:3000';

// Read login credentials from file to avoid shell escaping issues
const loginPayload = fs.readFileSync(path.join(__dirname, '../../login-payload.json'), 'utf8');

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;

    const req = client.request(url, {
      method: options.method || 'GET',
      headers: options.headers || {},
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: data.startsWith('{') || data.startsWith('[') ? JSON.parse(data) : data,
          });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function runTests() {
  let passed = 0;
  let failed = 0;
  let authToken = null;

  console.log('🧪 Frontend & API Integration Tests\n');
  console.log('='.repeat(50));

  // Test 1: API Login
  try {
    const response = await makeRequest(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: loginPayload,
    });
    if ((response.status === 200 || response.status === 201) && response.data.access_token) {
      console.log('✅ API Login: Working');
      passed++;
      authToken = response.data.access_token;
    } else {
      console.log('❌ API Login: Failed -', response.status, JSON.stringify(response.data));
      failed++;
    }
  } catch (e) {
    console.log('❌ API Login: Error -', e.message);
    failed++;
  }

  // Test 2: Frontend Index Page
  try {
    const response = await makeRequest(FRONTEND_BASE);
    if (response.status === 200 || response.status === 307) {
      console.log('✅ Frontend Index: Responding');
      passed++;
    } else {
      console.log('❌ Frontend Index: Status', response.status);
      failed++;
    }
  } catch (e) {
    console.log('❌ Frontend Index: Error -', e.message);
    failed++;
  }

  // Test 3: Frontend Login Page
  try {
    const response = await makeRequest(`${FRONTEND_BASE}/login`);
    if (response.status === 200) {
      console.log('✅ Frontend Login Page: Accessible');
      passed++;
    } else {
      console.log('❌ Frontend Login Page: Status', response.status);
      failed++;
    }
  } catch (e) {
    console.log('❌ Frontend Login Page: Error -', e.message);
    failed++;
  }

  // Test 4: API Patients Endpoint
  try {
    const response = await makeRequest(`${API_BASE}/patients`, {
      headers: { 'Authorization': `Bearer ${authToken}` },
    });
    if (response.status === 200) {
      console.log('✅ API Patients: Working');
      passed++;
    } else {
      console.log('❌ API Patients: Status', response.status);
      failed++;
    }
  } catch (e) {
    console.log('❌ API Patients: Error -', e.message);
    failed++;
  }

  // Test 5: API Appointments Endpoint
  try {
    const response = await makeRequest(`${API_BASE}/appointments`, {
      headers: { 'Authorization': `Bearer ${authToken}` },
    });
    if (response.status === 200) {
      console.log('✅ API Appointments: Working');
      passed++;
    } else {
      console.log('❌ API Appointments: Status', response.status);
      failed++;
    }
  } catch (e) {
    console.log('❌ API Appointments: Error -', e.message);
    failed++;
  }

  // Test 6: API Staff/Clinicians Endpoint
  try {
    const response = await makeRequest(`${API_BASE}/staff/clinicians`, {
      headers: { 'Authorization': `Bearer ${authToken}` },
    });
    if (response.status === 200) {
      console.log('✅ API Clinicians: Working');
      passed++;
    } else {
      console.log('❌ API Clinicians: Status', response.status);
      failed++;
    }
  } catch (e) {
    console.log('❌ API Clinicians: Error -', e.message);
    failed++;
  }

  // Test 7: API Staff Endpoint
  try {
    const response = await makeRequest(`${API_BASE}/staff`, {
      headers: { 'Authorization': `Bearer ${authToken}` },
    });
    if (response.status === 200) {
      console.log('✅ API Staff: Working');
      passed++;
    } else {
      console.log('❌ API Staff: Status', response.status);
      failed++;
    }
  } catch (e) {
    console.log('❌ API Staff: Error -', e.message);
    failed++;
  }

  // Test 8: API Appointment Types Endpoint
  try {
    const response = await makeRequest(`${API_BASE}/practices/current/appointment-types`, {
      headers: { 'Authorization': `Bearer ${authToken}` },
    });
    if (response.status === 200) {
      console.log('✅ API Appointment Types: Working');
      passed++;
    } else {
      console.log('❌ API Appointment Types: Status', response.status);
      failed++;
    }
  } catch (e) {
    console.log('❌ API Appointment Types: Error -', e.message);
    failed++;
  }

  // Test 9: Frontend Dashboard Page
  try {
    const response = await makeRequest(`${FRONTEND_BASE}/dashboard`);
    if (response.status === 200) {
      console.log('✅ Frontend Dashboard: Accessible');
      passed++;
    } else {
      console.log('❌ Frontend Dashboard: Status', response.status);
      failed++;
    }
  } catch (e) {
    console.log('❌ Frontend Dashboard: Error -', e.message);
    failed++;
  }

  // Test 10: Frontend Appointments Page
  try {
    const response = await makeRequest(`${FRONTEND_BASE}/appointments`);
    if (response.status === 200) {
      console.log('✅ Frontend Appointments: Accessible');
      passed++;
    } else {
      console.log('❌ Frontend Appointments: Status', response.status);
      failed++;
    }
  } catch (e) {
    console.log('❌ Frontend Appointments: Error -', e.message);
    failed++;
  }

  // Test 11: Frontend Patients Page
  try {
    const response = await makeRequest(`${FRONTEND_BASE}/patients`);
    if (response.status === 200) {
      console.log('✅ Frontend Patients: Accessible');
      passed++;
    } else {
      console.log('❌ Frontend Patients: Status', response.status);
      failed++;
    }
  } catch (e) {
    console.log('❌ Frontend Patients: Error -', e.message);
    failed++;
  }

  // Test 12: Frontend Staff Page
  try {
    const response = await makeRequest(`${FRONTEND_BASE}/staff`);
    if (response.status === 200) {
      console.log('✅ Frontend Staff: Accessible');
      passed++;
    } else {
      console.log('❌ Frontend Staff: Status', response.status);
      failed++;
    }
  } catch (e) {
    console.log('❌ Frontend Staff: Error -', e.message);
    failed++;
  }

  // Test 13: Frontend Billing Page
  try {
    const response = await makeRequest(`${FRONTEND_BASE}/billing`);
    if (response.status === 200) {
      console.log('✅ Frontend Billing: Accessible');
      passed++;
    } else {
      console.log('❌ Frontend Billing: Status', response.status);
      failed++;
    }
  } catch (e) {
    console.log('❌ Frontend Billing: Error -', e.message);
    failed++;
  }

  // Test 14: Frontend Billing New Invoice Page
  try {
    const response = await makeRequest(`${FRONTEND_BASE}/billing/new`);
    if (response.status === 200) {
      console.log('✅ Frontend Billing New: Accessible');
      passed++;
    } else {
      console.log('❌ Frontend Billing New: Status', response.status);
      failed++;
    }
  } catch (e) {
    console.log('❌ Frontend Billing New: Error -', e.message);
    failed++;
  }

  console.log('\n' + '='.repeat(50));
  console.log(`\n📊 Results: ${passed}/${passed + failed} tests passed`);
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);

  if (failed === 0) {
    console.log('\n🎉 All tests passed! The application is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
  }

  return failed === 0;
}

runTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(err => {
  console.error('Test runner error:', err);
  process.exit(1);
});

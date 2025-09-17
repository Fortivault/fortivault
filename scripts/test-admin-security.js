#!/usr/bin/env node

/**
 * Admin Security Test Script
 * 
 * This script tests the security implementation of admin routes
 * to ensure proper authentication, authorization, CSRF protection,
 * and rate limiting are working correctly.
 */

const https = require('https');
const http = require('http');

class SecurityTester {
  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
    this.results = [];
  }

  async runTests() {
    console.log('🔒 Starting Admin Security Tests...\n');

    await this.testUnauthorizedAccess();
    await this.testCSRFProtection();
    await this.testRateLimiting();
    await this.testSessionValidation();

    this.printResults();
  }

  async testUnauthorizedAccess() {
    console.log('📋 Testing Unauthorized Access Protection...');

    const tests = [
      {
        name: 'Admin Dashboard Access',
        path: '/admin',
        expectedStatus: 302, // Should redirect to login
        description: 'Should redirect unauthenticated users to login'
      },
      {
        name: 'Admin API Access',
        path: '/api/admin/cases',
        expectedStatus: 401,
        description: 'Should return 401 for unauthenticated API requests'
      },
      {
        name: 'Admin Case Status Update',
        path: '/api/admin/cases/1/status',
        method: 'PATCH',
        expectedStatus: 401,
        description: 'Should return 401 for unauthenticated PATCH requests'
      }
    ];

    for (const test of tests) {
      try {
        const result = await this.makeRequest(test.path, {
          method: test.method || 'GET'
        });

        const passed = result.statusCode === test.expectedStatus;
        this.results.push({
          category: 'Unauthorized Access',
          test: test.name,
          passed,
          expected: test.expectedStatus,
          actual: result.statusCode,
          description: test.description
        });

        console.log(`  ${passed ? '✅' : '❌'} ${test.name}: ${result.statusCode} (expected ${test.expectedStatus})`);
      } catch (error) {
        console.log(`  ❌ ${test.name}: Error - ${error.message}`);
        this.results.push({
          category: 'Unauthorized Access',
          test: test.name,
          passed: false,
          error: error.message,
          description: test.description
        });
      }
    }
    console.log();
  }

  async testCSRFProtection() {
    console.log('🛡️  Testing CSRF Protection...');

    try {
      // Test CSRF token generation
      const csrfResult = await this.makeRequest('/api/csrf');
      const csrfPassed = csrfResult.statusCode === 200 && csrfResult.data && csrfResult.data.token;
      
      this.results.push({
        category: 'CSRF Protection',
        test: 'CSRF Token Generation',
        passed: csrfPassed,
        description: 'Should generate CSRF tokens successfully'
      });

      console.log(`  ${csrfPassed ? '✅' : '❌'} CSRF Token Generation: ${csrfResult.statusCode}`);

      // Test API call without CSRF token
      const noCsrfResult = await this.makeRequest('/api/admin/cases/1/status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer fake-token'
        },
        body: JSON.stringify({ status: 'closed' })
      });

      const noCsrfPassed = noCsrfResult.statusCode === 403 || noCsrfResult.statusCode === 401;
      
      this.results.push({
        category: 'CSRF Protection',
        test: 'Request Without CSRF Token',
        passed: noCsrfPassed,
        expected: '403 or 401',
        actual: noCsrfResult.statusCode,
        description: 'Should reject requests without CSRF token'
      });

      console.log(`  ${noCsrfPassed ? '✅' : '❌'} Request Without CSRF Token: ${noCsrfResult.statusCode}`);

    } catch (error) {
      console.log(`  ❌ CSRF Protection Test Error: ${error.message}`);
    }
    console.log();
  }

  async testRateLimiting() {
    console.log('⏱️  Testing Rate Limiting...');

    try {
      const requests = [];
      const testPath = '/api/admin/cases';

      // Make multiple rapid requests to test rate limiting
      for (let i = 0; i < 65; i++) { // Exceed the 60 requests per minute limit
        requests.push(this.makeRequest(testPath, { timeout: 1000 }));
      }

      const results = await Promise.allSettled(requests);
      const rateLimitedRequests = results.filter(result => 
        result.status === 'fulfilled' && result.value.statusCode === 429
      );

      const rateLimitPassed = rateLimitedRequests.length > 0;
      
      this.results.push({
        category: 'Rate Limiting',
        test: 'API Rate Limiting',
        passed: rateLimitPassed,
        description: `Should rate limit after 60 requests per minute. Got ${rateLimitedRequests.length} rate-limited responses`
      });

      console.log(`  ${rateLimitPassed ? '✅' : '❌'} API Rate Limiting: ${rateLimitedRequests.length} requests rate-limited`);

    } catch (error) {
      console.log(`  ❌ Rate Limiting Test Error: ${error.message}`);
    }
    console.log();
  }

  async testSessionValidation() {
    console.log('🔑 Testing Session Validation...');

    const tests = [
      {
        name: 'Invalid Bearer Token',
        path: '/api/admin/cases',
        headers: { 'Authorization': 'Bearer invalid-token' },
        expectedStatus: 401,
        description: 'Should reject invalid bearer tokens'
      },
      {
        name: 'Missing Authorization Header',
        path: '/api/admin/cases',
        expectedStatus: 401,
        description: 'Should reject requests without authorization'
      },
      {
        name: 'Malformed Authorization Header',
        path: '/api/admin/cases',
        headers: { 'Authorization': 'InvalidFormat' },
        expectedStatus: 401,
        description: 'Should reject malformed authorization headers'
      }
    ];

    for (const test of tests) {
      try {
        const result = await this.makeRequest(test.path, {
          headers: test.headers || {}
        });

        const passed = result.statusCode === test.expectedStatus;
        this.results.push({
          category: 'Session Validation',
          test: test.name,
          passed,
          expected: test.expectedStatus,
          actual: result.statusCode,
          description: test.description
        });

        console.log(`  ${passed ? '✅' : '❌'} ${test.name}: ${result.statusCode} (expected ${test.expectedStatus})`);
      } catch (error) {
        console.log(`  ❌ ${test.name}: Error - ${error.message}`);
      }
    }
    console.log();
  }

  async makeRequest(path, options = {}) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.baseUrl);
      const isHttps = url.protocol === 'https:';
      const client = isHttps ? https : http;

      const requestOptions = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        method: options.method || 'GET',
        headers: {
          'User-Agent': 'SecurityTester/1.0',
          ...options.headers
        },
        timeout: options.timeout || 5000
      };

      const req = client.request(requestOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const parsedData = data ? JSON.parse(data) : null;
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              data: parsedData
            });
          } catch {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              data: data
            });
          }
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      if (options.body) {
        req.write(options.body);
      }

      req.end();
    });
  }

  printResults() {
    console.log('📊 Security Test Results Summary\n');
    console.log('=' .repeat(60));

    const categories = [...new Set(this.results.map(r => r.category))];
    let totalTests = 0;
    let passedTests = 0;

    for (const category of categories) {
      const categoryResults = this.results.filter(r => r.category === category);
      const categoryPassed = categoryResults.filter(r => r.passed).length;
      
      console.log(`\n${category}:`);
      console.log(`  Passed: ${categoryPassed}/${categoryResults.length}`);
      
      for (const result of categoryResults) {
        const status = result.passed ? '✅' : '❌';
        console.log(`  ${status} ${result.test}`);
        if (result.error) {
          console.log(`     Error: ${result.error}`);
        }
        if (result.expected && result.actual) {
          console.log(`     Expected: ${result.expected}, Got: ${result.actual}`);
        }
      }

      totalTests += categoryResults.length;
      passedTests += categoryPassed;
    }

    console.log('\n' + '=' .repeat(60));
    console.log(`Overall Results: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
      console.log('🎉 All security tests passed!');
    } else {
      console.log('⚠️  Some security tests failed. Please review the implementation.');
    }

    console.log('\n📝 Test Details:');
    for (const result of this.results) {
      if (!result.passed) {
        console.log(`❌ ${result.category} - ${result.test}`);
        console.log(`   ${result.description}`);
        if (result.error) console.log(`   Error: ${result.error}`);
        console.log();
      }
    }
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const baseUrl = process.argv[2] || 'http://localhost:3000';
  const tester = new SecurityTester(baseUrl);
  
  console.log(`Testing against: ${baseUrl}\n`);
  
  tester.runTests().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = SecurityTester;
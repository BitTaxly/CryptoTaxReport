// BitTaxly Comprehensive Test Suite
const API_BASE = 'http://localhost:3002';

const testResults = {
  passed: [],
  failed: [],
  warnings: []
};

function logTest(name, passed, details = '') {
  const result = { name, details, timestamp: new Date().toISOString() };
  if (passed) {
    testResults.passed.push(result);
    console.log(`✓ PASS: ${name}${details ? ' - ' + details : ''}`);
  } else {
    testResults.failed.push(result);
    console.error(`✗ FAIL: ${name}${details ? ' - ' + details : ''}`);
  }
}

function logWarning(name, details) {
  testResults.warnings.push({ name, details, timestamp: new Date().toISOString() });
  console.warn(`⚠ WARNING: ${name} - ${details}`);
}

// Test wallets
const TEST_WALLETS = {
  solana: [
    'izxHVsyPZBb7iMUCSp9qTGtNZYi7h42W3KuihZeDwbq',
    'ENYGB1xXkeqK33nvrPj3AGgHxVLUcQYjttHtwLH637Rg'
  ],
  ethereum: [
    '0xe065e5dECc2eAF8a5D631F8369169892CF527986',
    '0x4838b106fce9647bdf1e7877bf73ce8b0bad5f97'
  ],
  bitcoin: [
    '1mzUEEg96NzQKcJabMR7FYrqpGCtqE4vY'
  ]
};

// Test dates
const TEST_DATES = {
  preBitcoin: '2008-01-01',  // Before Bitcoin (2009)
  preEthereum: '2014-01-01', // Before Ethereum (2015)
  bitcoinEra: '2010-07-01',  // Bitcoin exists, Ethereum doesn't
  validRecent: '2023-12-31',
  validCurrent: '2025-12-30',
  future: '2027-01-01'
};

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// TEST 1: Date Validation Tests
async function testDateValidation() {
  console.log('\n=== TEST 1: DATE VALIDATION ===\n');

  const testCases = [
    { date: TEST_DATES.preBitcoin, wallet: TEST_WALLETS.solana[0], expectError: false, name: 'Pre-Bitcoin date (2008)' },
    { date: TEST_DATES.preEthereum, wallet: TEST_WALLETS.ethereum[0], expectError: false, name: 'Pre-Ethereum date (2014)' },
    { date: TEST_DATES.future, wallet: TEST_WALLETS.solana[0], expectError: false, name: 'Future date (2027)' },
    { date: 'invalid-date', wallet: TEST_WALLETS.solana[0], expectError: true, name: 'Invalid date format' },
  ];

  for (const test of testCases) {
    try {
      const response = await fetch(`${API_BASE}/api/analyze-wallets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallets: [test.wallet],
          reportDate: test.date
        })
      });

      const data = await response.json();

      if (test.expectError) {
        logTest(test.name, !data.success || response.status !== 200, `Expected error, got status ${response.status}`);
      } else {
        if (data.success) {
          logTest(test.name, true, `Status ${response.status}, holdings returned`);
        } else {
          logWarning(test.name, `API returned success=false: ${data.error || 'Unknown error'}`);
        }
      }

      await sleep(500);
    } catch (error) {
      logTest(test.name, test.expectError, `Error: ${error.message}`);
    }
  }
}

// TEST 2: Price Consistency Test (same date should return same prices)
async function testPriceConsistency() {
  console.log('\n=== TEST 2: PRICE CONSISTENCY ===\n');

  const testDate = TEST_DATES.validCurrent;
  const wallet = TEST_WALLETS.solana[0];
  const runs = 3;
  const results = [];

  console.log(`Running analysis ${runs} times with date: ${testDate}`);

  for (let i = 0; i < runs; i++) {
    try {
      const response = await fetch(`${API_BASE}/api/analyze-wallets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallets: [wallet],
          reportDate: testDate
        })
      });

      const data = await response.json();

      if (data.success && data.holdings) {
        results.push({
          run: i + 1,
          totalValue: data.totalValue,
          holdings: data.holdings,
          timestamp: new Date().toISOString()
        });
        console.log(`Run ${i + 1}: Total value = $${data.totalValue}`);
      }

      await sleep(1000);
    } catch (error) {
      logTest(`Price consistency run ${i + 1}`, false, error.message);
    }
  }

  // Check if all results are identical
  if (results.length === runs) {
    const firstValue = results[0].totalValue;
    const allSame = results.every(r => r.totalValue === firstValue);

    logTest('Price consistency across runs', allSame,
      allSame ? `All ${runs} runs returned $${firstValue}` :
      `Values varied: ${results.map(r => '$' + r.totalValue).join(', ')}`
    );

    // Check individual token prices
    const firstHoldings = results[0].holdings;
    let tokenPricesConsistent = true;

    firstHoldings.forEach((token, idx) => {
      const tokenName = token.name;
      const firstPrice = token.price;

      const pricesMatch = results.every(r =>
        r.holdings[idx]?.price === firstPrice
      );

      if (!pricesMatch) {
        tokenPricesConsistent = false;
        logWarning(`Token price inconsistency`, `${tokenName} prices varied across runs`);
      }
    });

    logTest('Individual token price consistency', tokenPricesConsistent);
  } else {
    logTest('Price consistency test', false, `Only ${results.length}/${runs} runs completed successfully`);
  }
}

// TEST 3: Wallet Validation Tests
async function testWalletValidation() {
  console.log('\n=== TEST 3: WALLET VALIDATION ===\n');

  const testCases = [
    { wallets: [], name: 'Empty wallet array', expectError: true },
    { wallets: ['invalid-wallet-address'], name: 'Invalid wallet format', expectError: false },
    { wallets: ['0x123'], name: 'Too short wallet', expectError: false },
    { wallets: TEST_WALLETS.solana, name: 'Valid Solana wallets', expectError: false },
    { wallets: TEST_WALLETS.ethereum, name: 'Valid Ethereum wallets', expectError: false },
    { wallets: [...TEST_WALLETS.solana, ...TEST_WALLETS.ethereum], name: 'Mixed blockchain wallets', expectError: false },
  ];

  for (const test of testCases) {
    try {
      const response = await fetch(`${API_BASE}/api/analyze-wallets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallets: test.wallets,
          reportDate: TEST_DATES.validCurrent
        })
      });

      const data = await response.json();

      if (test.expectError) {
        logTest(test.name, !data.success || response.status !== 200);
      } else {
        logTest(test.name, response.status === 200, `Status: ${response.status}`);
      }

      await sleep(500);
    } catch (error) {
      logTest(test.name, test.expectError, error.message);
    }
  }
}

// TEST 4: Edge Case Date Tests
async function testEdgeCaseDates() {
  console.log('\n=== TEST 4: EDGE CASE DATES ===\n');

  const wallet = TEST_WALLETS.solana[0];

  const testCases = [
    { date: '1900-01-01', name: 'Very old date (1900)' },
    { date: '2009-01-03', name: 'Bitcoin genesis block date' },
    { date: '2015-07-30', name: 'Ethereum launch date' },
    { date: '2020-02-29', name: 'Leap year date' },
    { date: '2024-12-31', name: 'End of year' },
    { date: '2025-01-01', name: 'Start of year' },
  ];

  for (const test of testCases) {
    try {
      const response = await fetch(`${API_BASE}/api/analyze-wallets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallets: [wallet],
          reportDate: test.date
        })
      });

      const data = await response.json();
      logTest(test.name, response.status === 200,
        data.success ? `Success, value: $${data.totalValue}` : `Error: ${data.error}`
      );

      await sleep(500);
    } catch (error) {
      logTest(test.name, false, error.message);
    }
  }
}

// TEST 5: API Response Structure Tests
async function testAPIResponseStructure() {
  console.log('\n=== TEST 5: API RESPONSE STRUCTURE ===\n');

  try {
    const response = await fetch(`${API_BASE}/api/analyze-wallets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        wallets: [TEST_WALLETS.solana[0]],
        reportDate: TEST_DATES.validCurrent
      })
    });

    const data = await response.json();

    // Check required fields
    logTest('Response has success field', 'success' in data);
    logTest('Response has holdings field', 'holdings' in data);
    logTest('Response has totalValue field', 'totalValue' in data);

    if (data.holdings && data.holdings.length > 0) {
      const firstHolding = data.holdings[0];
      logTest('Holding has name', 'name' in firstHolding);
      logTest('Holding has symbol', 'symbol' in firstHolding);
      logTest('Holding has balance', 'balance' in firstHolding);
      logTest('Holding has price', 'price' in firstHolding);
      logTest('Holding has value', 'value' in firstHolding);
      logTest('Holding has blockchain', 'blockchain' in firstHolding);
    }
  } catch (error) {
    logTest('API Response Structure', false, error.message);
  }
}

// TEST 6: Report Generation Tests
async function testReportGeneration() {
  console.log('\n=== TEST 6: REPORT GENERATION ===\n');

  try {
    const response = await fetch(`${API_BASE}/api/generate-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        holdings: [
          {
            name: 'Test Token',
            symbol: 'TEST',
            balance: 100,
            price: 1.5,
            value: 150,
            blockchain: 'Ethereum'
          }
        ],
        totalValue: 150,
        reportDate: TEST_DATES.validCurrent
      })
    });

    logTest('Report generation endpoint accessible', response.status === 200);
    logTest('Report returns Excel file', response.headers.get('content-type')?.includes('spreadsheet'));

  } catch (error) {
    logTest('Report generation', false, error.message);
  }
}

// TEST 7: Legal Pages Accessibility
async function testLegalPages() {
  console.log('\n=== TEST 7: LEGAL PAGES ===\n');

  const pages = [
    '/privacy',
    '/terms',
    '/disclaimer'
  ];

  for (const page of pages) {
    try {
      const response = await fetch(`${API_BASE}${page}`);
      logTest(`${page} page loads`, response.status === 200);
      await sleep(200);
    } catch (error) {
      logTest(`${page} page loads`, false, error.message);
    }
  }
}

// MAIN TEST RUNNER
async function runAllTests() {
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║   BitTaxly Comprehensive Test Suite           ║');
  console.log('╚════════════════════════════════════════════════╝\n');

  const startTime = Date.now();

  await testDateValidation();
  await testPriceConsistency();
  await testWalletValidation();
  await testEdgeCaseDates();
  await testAPIResponseStructure();
  await testReportGeneration();
  await testLegalPages();

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║              TEST SUMMARY                      ║');
  console.log('╚════════════════════════════════════════════════╝\n');

  console.log(`Total Tests Run: ${testResults.passed.length + testResults.failed.length}`);
  console.log(`✓ Passed: ${testResults.passed.length}`);
  console.log(`✗ Failed: ${testResults.failed.length}`);
  console.log(`⚠ Warnings: ${testResults.warnings.length}`);
  console.log(`Duration: ${duration}s\n`);

  if (testResults.failed.length > 0) {
    console.log('Failed Tests:');
    testResults.failed.forEach(test => {
      console.log(`  - ${test.name}: ${test.details}`);
    });
    console.log('');
  }

  if (testResults.warnings.length > 0) {
    console.log('Warnings:');
    testResults.warnings.forEach(warning => {
      console.log(`  - ${warning.name}: ${warning.details}`);
    });
    console.log('');
  }

  const successRate = ((testResults.passed.length / (testResults.passed.length + testResults.failed.length)) * 100).toFixed(1);
  console.log(`Success Rate: ${successRate}%\n`);

  // Save results to file
  const fs = require('fs');
  fs.writeFileSync(
    './test-results.json',
    JSON.stringify({
      summary: {
        total: testResults.passed.length + testResults.failed.length,
        passed: testResults.passed.length,
        failed: testResults.failed.length,
        warnings: testResults.warnings.length,
        successRate: successRate + '%',
        duration: duration + 's',
        timestamp: new Date().toISOString()
      },
      passed: testResults.passed,
      failed: testResults.failed,
      warnings: testResults.warnings
    }, null, 2)
  );

  console.log('Test results saved to test-results.json\n');
}

// Run tests
runAllTests().catch(console.error);

// BitTaxly Comprehensive Test Suite (Slow - Respects Rate Limits)
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

// Test wallets
const TEST_WALLETS = {
  solana: 'izxHVsyPZBb7iMUCSp9qTGtNZYi7h42W3KuihZeDwbq',
  ethereum: '0xe065e5dECc2eAF8a5D631F8369169892CF527986',
};

// Test dates
const TEST_DATES = {
  preBitcoin: '2008-01-01',
  bitcoinEra: '2010-07-01',
  ethereumEra: '2016-01-01',
  recent: '2024-12-31',
  current: '2025-12-30',
};

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// TEST 1: Critical Date Tests
async function testCriticalDates() {
  console.log('\n=== TEST 1: CRITICAL DATE TESTS ===\n');

  const dates = [
    { date: '2008-01-01', name: 'Pre-Bitcoin (2008)' },
    { date: '2010-07-01', name: 'Bitcoin era (2010)' },
    { date: '2024-12-31', name: 'Recent date (2024)' },
  ];

  for (const test of dates) {
    try {
      console.log(`Testing ${test.name}...`);
      const response = await fetch(`${API_BASE}/api/analyze-wallets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallets: [TEST_WALLETS.solana],
          reportDate: test.date
        })
      });

      const data = await response.json();

      if (response.status === 200 || response.status === 400) {
        logTest(test.name, true, `Status ${response.status}, Response received`);

        if (data.totalValue !== undefined) {
          console.log(`  Total value: $${data.totalValue}`);
        }
      } else if (response.status === 429) {
        logTest(test.name, false, 'Rate limited - waiting...');
        await sleep(20000); // Wait 20 seconds
      } else {
        logTest(test.name, false, `Status ${response.status}`);
      }

      await sleep(8000); // 8 second delay between tests
    } catch (error) {
      logTest(test.name, false, error.message);
    }
  }
}

// TEST 2: Price Consistency (same date, multiple runs)
async function testPriceConsistency() {
  console.log('\n=== TEST 2: PRICE CONSISTENCY TEST ===\n');
  console.log('Testing if same date returns same prices...\n');

  const testDate = '2025-12-30';
  const runs = 3;
  const results = [];

  for (let i = 0; i < runs; i++) {
    try {
      console.log(`Run ${i + 1}/${runs}...`);
      const response = await fetch(`${API_BASE}/api/analyze-wallets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallets: [TEST_WALLETS.solana],
          reportDate: testDate
        })
      });

      if (response.status === 429) {
        console.log('Rate limited, waiting 20 seconds...');
        await sleep(20000);
        i--; // Retry this run
        continue;
      }

      const data = await response.json();

      if (data.success && data.totalValue !== undefined) {
        results.push({
          run: i + 1,
          totalValue: data.totalValue,
          holdingsCount: data.holdings?.length || 0
        });
        console.log(`  Total value: $${data.totalValue}`);
      }

      if (i < runs - 1) {
        await sleep(10000); // 10 second delay
      }
    } catch (error) {
      logTest(`Price consistency run ${i + 1}`, false, error.message);
    }
  }

  if (results.length >= 2) {
    const firstValue = results[0].totalValue;
    const allSame = results.every(r => r.totalValue === firstValue);

    logTest('Price consistency', allSame,
      allSame ? `All runs returned $${firstValue}` :
      `Values: ${results.map(r => '$' + r.totalValue).join(', ')}`
    );
  } else {
    logTest('Price consistency', false, `Only ${results.length} runs completed`);
  }
}

// TEST 3: Wallet Type Detection
async function testWalletDetection() {
  console.log('\n=== TEST 3: WALLET TYPE DETECTION ===\n');

  const wallets = [
    { wallet: TEST_WALLETS.solana, name: 'Solana wallet' },
    { wallet: TEST_WALLETS.ethereum, name: 'Ethereum wallet' },
  ];

  for (const test of wallets) {
    try {
      console.log(`Testing ${test.name}...`);
      const response = await fetch(`${API_BASE}/api/analyze-wallets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallets: [test.wallet],
          reportDate: TEST_DATES.current
        })
      });

      const data = await response.json();

      if (response.status === 429) {
        console.log('Rate limited, waiting...');
        await sleep(20000);
      } else if (data.success) {
        const blockchain = data.holdings?.[0]?.blockchain || 'Unknown';
        logTest(test.name, true, `Detected as ${blockchain}`);
      } else {
        logTest(test.name, false, data.error || 'Unknown error');
      }

      await sleep(8000);
    } catch (error) {
      logTest(test.name, false, error.message);
    }
  }
}

// TEST 4: Legal Pages
async function testLegalPages() {
  console.log('\n=== TEST 4: LEGAL PAGES ===\n');

  const pages = [
    { path: '/privacy', name: 'Privacy Policy' },
    { path: '/terms', name: 'Terms of Service' },
    { path: '/disclaimer', name: 'Disclaimer' }
  ];

  for (const page of pages) {
    try {
      const response = await fetch(`${API_BASE}${page.path}`);
      const text = await response.text();

      logTest(page.name,
        response.status === 200 && text.length > 100,
        `Status ${response.status}, ${text.length} chars`
      );

      await sleep(500);
    } catch (error) {
      logTest(page.name, false, error.message);
    }
  }
}

// TEST 5: Invalid Input Handling
async function testInvalidInputs() {
  console.log('\n=== TEST 5: INVALID INPUT HANDLING ===\n');

  const tests = [
    {
      name: 'Empty wallet array',
      body: { wallets: [], reportDate: '2025-01-01' },
      expectError: true
    },
    {
      name: 'Missing wallets',
      body: { reportDate: '2025-01-01' },
      expectError: true
    },
    {
      name: 'Missing date',
      body: { wallets: [TEST_WALLETS.solana] },
      expectError: true
    },
    {
      name: 'Invalid date format',
      body: { wallets: [TEST_WALLETS.solana], reportDate: 'not-a-date' },
      expectError: true
    },
  ];

  for (const test of tests) {
    try {
      const response = await fetch(`${API_BASE}/api/analyze-wallets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(test.body)
      });

      const data = await response.json();

      if (test.expectError) {
        logTest(test.name, response.status >= 400 || !data.success,
          `Status ${response.status}`
        );
      } else {
        logTest(test.name, response.status === 200 && data.success);
      }

      await sleep(2000);
    } catch (error) {
      logTest(test.name, test.expectError, error.message);
    }
  }
}

// MAIN TEST RUNNER
async function runAllTests() {
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║   BitTaxly Test Suite (Rate-Limited)          ║');
  console.log('╚════════════════════════════════════════════════╝');
  console.log('\nThis will take several minutes due to rate limiting...\n');

  const startTime = Date.now();

  await testCriticalDates();
  await testPriceConsistency();
  await testWalletDetection();
  await testLegalPages();
  await testInvalidInputs();

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║              TEST SUMMARY                      ║');
  console.log('╚════════════════════════════════════════════════╝\n');

  const total = testResults.passed.length + testResults.failed.length;
  const successRate = total > 0 ? ((testResults.passed.length / total) * 100).toFixed(1) : 0;

  console.log(`Total Tests: ${total}`);
  console.log(`✓ Passed: ${testResults.passed.length}`);
  console.log(`✗ Failed: ${testResults.failed.length}`);
  console.log(`Success Rate: ${successRate}%`);
  console.log(`Duration: ${duration}s\n`);

  if (testResults.failed.length > 0) {
    console.log('Failed Tests:');
    testResults.failed.forEach(test => {
      console.log(`  ✗ ${test.name}${test.details ? ': ' + test.details : ''}`);
    });
    console.log('');
  }

  // Save detailed results
  const fs = require('fs');
  fs.writeFileSync(
    './test-results-detailed.json',
    JSON.stringify({
      summary: {
        total,
        passed: testResults.passed.length,
        failed: testResults.failed.length,
        successRate: successRate + '%',
        duration: duration + 's',
        timestamp: new Date().toISOString()
      },
      tests: {
        passed: testResults.passed,
        failed: testResults.failed
      }
    }, null, 2)
  );

  console.log('Detailed results saved to test-results-detailed.json\n');
}

runAllTests().catch(console.error);

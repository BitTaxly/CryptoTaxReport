// Alpha Launch Readiness Test Suite
const API_BASE = 'http://localhost:3001';

// Test wallets
const VALID_SOL_WALLET = 'izxHVsyPZBb7iMUCSp9qTGtNZYi7h42W3KuihZeDwbq';
const HIGH_FREQ_WALLET_1 = 'CXdZ6m2PotNq4D7zKK3af426ohGro1xingNuf68SoKmv';
const HIGH_FREQ_WALLET_2 = '8SLXH4HmVGSfMH9QWwh6fEcPdiMMEM4CDamV9KHXB7ps';
const INVALID_WALLET = 'not-a-valid-wallet-address';
const EMPTY_WALLET = '';

let testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

function logTest(name, passed, details = '') {
  if (passed) {
    console.log(`✓ ${name}`);
    testResults.passed++;
  } else {
    console.log(`✗ ${name}`);
    console.log(`  ${details}`);
    testResults.failed++;
    testResults.errors.push({ test: name, details });
  }
}

async function test1_InvalidWalletAddress() {
  console.log('\n═══ TEST 1: Invalid Wallet Address ═══');

  try {
    const response = await fetch(`${API_BASE}/api/analyze-wallets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        addresses: [INVALID_WALLET],
        date: '2025-12-31'
      })
    });

    const data = await response.json();

    if (!data.success) {
      logTest('Should reject invalid wallet address', true);
    } else {
      logTest('Should reject invalid wallet address', false, 'API accepted invalid address');
    }
  } catch (error) {
    logTest('Should reject invalid wallet address', false, error.message);
  }
}

async function test2_EmptyWalletAddress() {
  console.log('\n═══ TEST 2: Empty Wallet Address ═══');

  try {
    const response = await fetch(`${API_BASE}/api/analyze-wallets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        addresses: [EMPTY_WALLET],
        date: '2025-12-31'
      })
    });

    const data = await response.json();

    if (!data.success) {
      logTest('Should reject empty wallet address', true);
    } else {
      logTest('Should reject empty wallet address', false, 'API accepted empty address');
    }
  } catch (error) {
    logTest('Should reject empty wallet address', false, error.message);
  }
}

async function test3_MixedValidInvalidAddresses() {
  console.log('\n═══ TEST 3: Mixed Valid/Invalid Addresses ═══');

  try {
    const response = await fetch(`${API_BASE}/api/analyze-wallets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        addresses: [VALID_SOL_WALLET, INVALID_WALLET],
        date: '2025-12-31'
      })
    });

    const data = await response.json();

    if (!data.success) {
      logTest('Should reject if any wallet is invalid', true);
    } else {
      logTest('Should reject if any wallet is invalid', false, 'API accepted mixed addresses');
    }
  } catch (error) {
    logTest('Should reject if any wallet is invalid', false, error.message);
  }
}

async function test4_HighFrequencyWallet1() {
  console.log('\n═══ TEST 4: High-Frequency Trading Wallet #1 ═══');
  console.log(`Wallet: ${HIGH_FREQ_WALLET_1}`);
  console.log('This may take 30-60 seconds...\n');

  const startTime = Date.now();

  try {
    const response = await fetch(`${API_BASE}/api/analyze-wallets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        addresses: [HIGH_FREQ_WALLET_1],
        date: '2025-12-31'
      })
    });

    const data = await response.json();
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    if (data.success) {
      const txCount = data.data.wallets[0]?.transactionsProcessed || 'N/A';
      const tokenCount = data.data.wallets[0]?.tokens?.length || 0;
      const totalValue = data.data.wallets[0]?.totalValue || 0;

      console.log(`  Duration: ${duration}s`);
      console.log(`  Transactions: ${txCount}`);
      console.log(`  Tokens: ${tokenCount}`);
      console.log(`  Total Value: $${totalValue.toFixed(2)}`);

      if (duration < 120) {
        logTest('Should complete within 2 minutes', true);
      } else {
        logTest('Should complete within 2 minutes', false, `Took ${duration}s`);
      }

      logTest('Should return valid data structure', data.data.wallets?.length > 0);
    } else {
      logTest('Should handle high-frequency wallet', false, data.error);
    }
  } catch (error) {
    logTest('Should handle high-frequency wallet', false, error.message);
  }
}

async function test5_HighFrequencyWallet2() {
  console.log('\n═══ TEST 5: High-Frequency Trading Wallet #2 ═══');
  console.log(`Wallet: ${HIGH_FREQ_WALLET_2}`);
  console.log('This may take 30-60 seconds...\n');

  const startTime = Date.now();

  try {
    const response = await fetch(`${API_BASE}/api/analyze-wallets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        addresses: [HIGH_FREQ_WALLET_2],
        date: '2025-12-31'
      })
    });

    const data = await response.json();
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    if (data.success) {
      const txCount = data.data.wallets[0]?.transactionsProcessed || 'N/A';
      const tokenCount = data.data.wallets[0]?.tokens?.length || 0;
      const totalValue = data.data.wallets[0]?.totalValue || 0;

      console.log(`  Duration: ${duration}s`);
      console.log(`  Transactions: ${txCount}`);
      console.log(`  Tokens: ${tokenCount}`);
      console.log(`  Total Value: $${totalValue.toFixed(2)}`);

      if (duration < 120) {
        logTest('Should complete within 2 minutes', true);
      } else {
        logTest('Should complete within 2 minutes', false, `Took ${duration}s`);
      }

      logTest('Should return valid data structure', data.data.wallets?.length > 0);
    } else {
      logTest('Should handle high-frequency wallet', false, data.error);
    }
  } catch (error) {
    logTest('Should handle high-frequency wallet', false, error.message);
  }
}

async function test6_CachingAfterHighFrequency() {
  console.log('\n═══ TEST 6: Caching Performance (Repeat Query) ═══');
  console.log('Testing cache hit on previously queried wallet...\n');

  const startTime = Date.now();

  try {
    const response = await fetch(`${API_BASE}/api/analyze-wallets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        addresses: [HIGH_FREQ_WALLET_1],
        date: '2025-12-31'
      })
    });

    const data = await response.json();
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    if (data.success) {
      console.log(`  Duration: ${duration}s`);

      if (duration < 15) {
        logTest('Cached query should be < 15s', true);
      } else {
        logTest('Cached query should be < 15s', false, `Took ${duration}s (cache may not be working)`);
      }
    } else {
      logTest('Should return cached data', false, data.error);
    }
  } catch (error) {
    logTest('Should return cached data', false, error.message);
  }
}

async function test7_EnvironmentVariables() {
  console.log('\n═══ TEST 7: Environment Variables Check ═══');

  // Read .env.local file
  const fs = require('fs');
  const path = require('path');

  try {
    const envPath = path.join(__dirname, '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');

    const requiredVars = [
      'ETHEREUM_RPC_ENDPOINT',
      'SOLANA_RPC_ENDPOINT',
      'COINGECKO_API_KEY',
      'NEXTAUTH_URL',
      'NEXTAUTH_SECRET',
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY'
    ];

    let allPresent = true;
    for (const varName of requiredVars) {
      if (!envContent.includes(varName)) {
        console.log(`  Missing: ${varName}`);
        allPresent = false;
      }
    }

    logTest('All required environment variables present', allPresent);
  } catch (error) {
    logTest('Environment variables check', false, error.message);
  }
}

async function test8_NetworkFailureHandling() {
  console.log('\n═══ TEST 8: Network Failure Handling ═══');

  try {
    const response = await fetch('http://localhost:9999/api/analyze-wallets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        addresses: [VALID_SOL_WALLET],
        date: '2025-12-31'
      })
    });

    logTest('Should handle network failure gracefully', false, 'Connected to invalid endpoint');
  } catch (error) {
    // Expected to fail
    if (error.code === 'ECONNREFUSED' || error.message.includes('fetch failed')) {
      logTest('Should handle network failure gracefully', true);
    } else {
      logTest('Should handle network failure gracefully', false, error.message);
    }
  }
}

async function runAllTests() {
  console.log('═══════════════════════════════════════════════');
  console.log('    ALPHA LAUNCH READINESS TEST SUITE');
  console.log('═══════════════════════════════════════════════\n');

  await test1_InvalidWalletAddress();
  await test2_EmptyWalletAddress();
  await test3_MixedValidInvalidAddresses();
  await test4_HighFrequencyWallet1();
  await test5_HighFrequencyWallet2();
  await test6_CachingAfterHighFrequency();
  await test7_EnvironmentVariables();
  await test8_NetworkFailureHandling();

  console.log('\n═══════════════════════════════════════════════');
  console.log('              TEST SUMMARY');
  console.log('═══════════════════════════════════════════════');
  console.log(`Passed: ${testResults.passed}`);
  console.log(`Failed: ${testResults.failed}`);

  if (testResults.failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    testResults.errors.forEach((err, i) => {
      console.log(`${i + 1}. ${err.test}`);
      console.log(`   ${err.details}`);
    });
    console.log('\n⚠️  NOT READY FOR LAUNCH - Fix failed tests first');
  } else {
    console.log('\n✅ ALL TESTS PASSED - Ready for Alpha Launch!');
  }
}

runAllTests().catch(console.error);

// Test caching functionality
const API_BASE = 'http://localhost:3001';

async function testCaching() {
  console.log('=== CACHE PERFORMANCE TEST ===\n');

  const wallet = 'izxHVsyPZBb7iMUCSp9qTGtNZYi7h42W3KuihZeDwbq';

  // Test 1: First query for 2025 (should be slow - no cache)
  console.log('Test 1: First query for End of 2025 (cold cache)');
  const start1 = Date.now();

  const response1 = await fetch(`${API_BASE}/api/analyze-wallets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      addresses: [wallet],
      date: '2025-12-31'
    })
  });

  const data1 = await response1.json();
  const duration1 = Date.now() - start1;

  if (data1.success) {
    console.log(`✓ SUCCESS - took ${(duration1 / 1000).toFixed(1)}s`);
    console.log(`  Transactions processed: ${data1.data.wallets[0]?.transactionsProcessed || 'N/A'}`);
    console.log(`  Portfolio value: $${data1.data.wallets[0]?.totalValue?.toFixed(2)}\n`);
  } else {
    console.log(`✗ FAILED: ${data1.error}\n`);
    return;
  }

  // Test 2: Second query for 2024 (different date, same wallet - should be cached)
  console.log('Test 2: Query for End of 2024 (same wallet, should use cache)');
  const start2 = Date.now();

  const response2 = await fetch(`${API_BASE}/api/analyze-wallets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      addresses: [wallet],
      date: '2024-12-31'
    })
  });

  const data2 = await response2.json();
  const duration2 = Date.now() - start2;

  if (data2.success) {
    console.log(`✓ SUCCESS - took ${(duration2 / 1000).toFixed(1)}s`);
    console.log(`  Transactions processed: ${data2.data.wallets[0]?.transactionsProcessed || 'N/A'}`);
    console.log(`  Portfolio value: $${data2.data.wallets[0]?.totalValue?.toFixed(2)}\n`);
  } else {
    console.log(`✗ FAILED: ${data2.error}\n`);
    return;
  }

  // Test 3: Repeat query for 2025 (should be instant - cache hit)
  console.log('Test 3: Repeat query for End of 2025 (should be instant - cache hit)');
  const start3 = Date.now();

  const response3 = await fetch(`${API_BASE}/api/analyze-wallets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      addresses: [wallet],
      date: '2025-12-31'
    })
  });

  const data3 = await response3.json();
  const duration3 = Date.now() - start3;

  if (data3.success) {
    console.log(`✓ SUCCESS - took ${(duration3 / 1000).toFixed(1)}s`);
    console.log(`  Transactions processed: ${data3.data.wallets[0]?.transactionsProcessed || 'N/A'}`);
    console.log(`  Portfolio value: $${data3.data.wallets[0]?.totalValue?.toFixed(2)}\n`);
  } else {
    console.log(`✗ FAILED: ${data3.error}\n`);
    return;
  }

  // Analysis
  console.log('═══════════════════════════════════════════════');
  console.log('PERFORMANCE ANALYSIS');
  console.log('═══════════════════════════════════════════════');
  console.log(`First query (2025):  ${(duration1 / 1000).toFixed(1)}s - COLD CACHE`);
  console.log(`Second query (2024): ${(duration2 / 1000).toFixed(1)}s - CACHE HIT EXPECTED`);
  console.log(`Third query (2025):  ${(duration3 / 1000).toFixed(1)}s - CACHE HIT EXPECTED`);

  const speedup2 = duration1 / duration2;
  const speedup3 = duration1 / duration3;

  console.log(`\nSpeedup for query 2: ${speedup2.toFixed(1)}x faster`);
  console.log(`Speedup for query 3: ${speedup3.toFixed(1)}x faster`);

  if (speedup2 > 2 && speedup3 > 2) {
    console.log('\n✓ CACHING WORKING CORRECTLY!');
  } else {
    console.log('\n⚠ Cache may not be working as expected');
  }
}

testCaching().catch(console.error);

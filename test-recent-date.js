// Test with recent date (within 365 days)
const API_BASE = 'http://localhost:3001';

async function testRecentDate() {
  console.log('=== TESTING WITH RECENT DATE ===\n');

  const wallet = 'izxHVsyPZBb7iMUCSp9qTGtNZYi7h42W3KuihZeDwbq';

  // Test with March 1, 2026 (within 365 days from today April 1, 2026)
  const date = '2026-03-01';

  console.log(`Testing date: ${date}`);
  console.log('This date is within the 365-day limit for Demo API keys\n');

  try {
    const response = await fetch(`${API_BASE}/api/analyze-wallets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        addresses: [wallet],
        date: date
      })
    });

    const data = await response.json();

    if (data.success) {
      console.log('✓ SUCCESS!');
      console.log('Report Date:', data.data.reportDate);
      console.log('Generated At:', data.data.generatedAt);

      if (data.data.wallets[0]?.tokens?.length > 0) {
        console.log('\nToken prices:');
        data.data.wallets[0].tokens.slice(0, 5).forEach(token => {
          console.log(`  ${token.symbol}: $${token.priceUSD.toFixed(4)} (${token.priceDate})`);
        });
        console.log(`\nTotal value: $${data.data.wallets[0].totalValue.toFixed(2)}`);
      }
    } else {
      console.log('✗ ERROR:', data.error);
    }
  } catch (error) {
    console.error('✗ Failed:', error.message);
  }
}

testRecentDate();

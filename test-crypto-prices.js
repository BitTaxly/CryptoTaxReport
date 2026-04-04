// Test to verify crypto prices are fetching for correct date
const API_BASE = 'http://localhost:3001';

async function testCryptoPrices() {
  console.log('=== TESTING CRYPTO PRICE DATES ===\n');

  const wallet = 'izxHVsyPZBb7iMUCSp9qTGtNZYi7h42W3KuihZeDwbq';

  const tests = [
    { date: '2024-01-01', name: 'January 1, 2024 (old)' },
    { date: '2024-12-31', name: 'December 31, 2024 (recent)' },
  ];

  for (const test of tests) {
    console.log(`\nTesting: ${test.name}`);
    console.log(`Date: ${test.date}\n`);

    try {
      const response = await fetch(`${API_BASE}/api/analyze-wallets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          addresses: [wallet],
          date: test.date
        })
      });

      const data = await response.json();

      if (data.success) {
        console.log('Report Date:', data.data.reportDate);
        console.log('Generated At:', data.data.generatedAt);

        if (data.data.wallets[0]?.tokens?.length > 0) {
          console.log('\nSample tokens:');
          data.data.wallets[0].tokens.slice(0, 3).forEach(token => {
            console.log(`  ${token.symbol}: $${token.priceUSD.toFixed(4)} (Date: ${token.priceDate})`);
          });
        }

        console.log('\n' + '='.repeat(50));
      } else {
        console.log('ERROR:', data.error);
      }
    } catch (error) {
      console.error('Failed:', error.message);
    }
  }
}

testCryptoPrices();

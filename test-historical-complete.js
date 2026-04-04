// Complete historical balance test
const API_BASE = 'http://localhost:3001';

async function testHistoricalBalances() {
  console.log('=== COMPLETE HISTORICAL BALANCE TEST ===\n');

  const wallet = 'izxHVsyPZBb7iMUCSp9qTGtNZYi7h42W3KuihZeDwbq';
  const date = '2026-03-01';

  console.log(`Wallet: ${wallet}`);
  console.log(`Target Date: ${date}\n`);

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
      console.log('✓ SUCCESS!\n');

      const walletData = data.data.wallets[0];

      console.log('═══════════════════════════════════════════════');
      console.log('HISTORICAL PORTFOLIO SNAPSHOT');
      console.log('═══════════════════════════════════════════════');
      console.log(`Date: ${data.data.reportDate}`);
      console.log(`Generated: ${data.data.generatedAt}\n`);

      if (walletData?.tokens?.length > 0) {
        console.log('TOKEN HOLDINGS:\n');
        walletData.tokens.forEach((token, index) => {
          console.log(`${index + 1}. ${token.tokenSymbol || 'Unknown'}`);
          console.log(`   Balance: ${token.balance.toFixed(4)}`);

          if (token.priceAtDate !== undefined && token.priceAtDate !== null) {
            console.log(`   Price: $${token.priceAtDate.toFixed(4)} (${token.date || 'N/A'})`);
            console.log(`   Value: $${token.totalValue.toFixed(2)}`);
          } else {
            console.log(`   Price: Not available`);
            console.log(`   Value: $0.00`);
          }
          console.log('');
        });

        console.log('═══════════════════════════════════════════════');
        console.log(`TOTAL PORTFOLIO VALUE: $${walletData.totalValue.toFixed(2)}`);
        console.log('═══════════════════════════════════════════════\n');
      } else {
        console.log('No tokens found for this date.\n');
      }
    } else {
      console.log('✗ ERROR:', data.error);
    }
  } catch (error) {
    console.error('✗ Failed:', error.message);
  }
}

testHistoricalBalances();

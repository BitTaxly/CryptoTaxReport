// Direct test of CoinCap API
const axios = require('axios');

async function testCoinCap() {
  console.log('=== TESTING COINCAP API DIRECTLY ===\n');

  const date = new Date('2024-12-31');
  const startOfDay = new Date(date);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setUTCHours(23, 59, 59, 999);

  console.log(`Date: ${date.toISOString()}`);
  console.log(`Start: ${startOfDay.getTime()}`);
  console.log(`End: ${endOfDay.getTime()}\n`);

  const tokens = ['solana', 'bitcoin', 'ethereum'];

  for (const tokenId of tokens) {
    try {
      const url = `https://api.coincap.io/v2/assets/${tokenId}/history`;
      console.log(`Fetching ${tokenId}...`);

      const response = await axios.get(url, {
        params: {
          interval: 'd1',
          start: startOfDay.getTime(),
          end: endOfDay.getTime(),
        },
        timeout: 15000,
      });

      if (response.data?.data && response.data.data.length > 0) {
        const priceUsd = parseFloat(response.data.data[0].priceUsd);
        console.log(`✓ ${tokenId}: $${priceUsd.toFixed(2)}`);
      } else {
        console.log(`✗ ${tokenId}: No data`);
      }
    } catch (error) {
      console.log(`✗ ${tokenId}: ${error.message}`);
    }
    console.log('');
  }
}

testCoinCap();

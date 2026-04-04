// Simple CoinCap API test
const axios = require('axios');

async function testCoinCapDirect() {
  console.log('=== TESTING COINCAP API DIRECTLY ===\n');

  const date = new Date('2024-12-31');
  const startOfDay = new Date(date);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setUTCHours(23, 59, 59, 999);

  console.log('Testing solana on 2024-12-31');
  console.log('Start timestamp:', startOfDay.getTime());
  console.log('End timestamp:', endOfDay.getTime());
  console.log('');

  try {
    const url = 'https://api.coincap.io/v2/assets/solana/history';
    console.log('URL:', url);
    console.log('Params:', {
      interval: 'd1',
      start: startOfDay.getTime(),
      end: endOfDay.getTime(),
    });
    console.log('');

    const response = await axios.get(url, {
      params: {
        interval: 'd1',
        start: startOfDay.getTime(),
        end: endOfDay.getTime(),
      },
      timeout: 15000,
    });

    console.log('Status:', response.status);
    console.log('Data length:', response.data?.data?.length || 0);

    if (response.data?.data && response.data.data.length > 0) {
      const firstPoint = response.data.data[0];
      console.log('First data point:');
      console.log('  Time:', firstPoint.time);
      console.log('  Date:', new Date(firstPoint.time).toISOString());
      console.log('  Price USD:', firstPoint.priceUsd);
      console.log('  Parsed price:', parseFloat(firstPoint.priceUsd));
    } else {
      console.log('No data returned!');
      console.log('Full response:', JSON.stringify(response.data, null, 2));
    }
  } catch (error) {
    console.error('ERROR:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    console.error('Full error:', error);
  }
}

testCoinCapDirect();

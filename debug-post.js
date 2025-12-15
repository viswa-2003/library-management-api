const axios = require('axios');

async function debugPost() {
  console.log('🔍 Debugging POST /books issue...\n');

  const baseURL = 'http://localhost:3000/api';

  // Test 1: Simple POST
  console.log('Test 1: Simple POST with minimal data');
  try {
    const response = await axios.post(`${baseURL}/books`, {
      isbn: '9781234567899',
      title: 'Debug Book',
      author: 'Debug Author',
      category: 'Debug'
    });
    console.log('✅ Success:', response.status, response.data);
  } catch (error) {
    console.log('❌ Error:', error.response?.status, error.response?.data || error.message);
  }

  // Test 2: POST with all fields
  console.log('\nTest 2: POST with all fields');
  try {
    const response = await axios.post(`${baseURL}/books`, {
      isbn: '9781234567898',
      title: 'Complete Book',
      author: 'Complete Author',
      category: 'Complete',
      total_copies: 5,
      available_copies: 5,
      status: 'available'
    });
    console.log('✅ Success:', response.status, response.data);
  } catch (error) {
    console.log('❌ Error:', error.response?.status, error.response?.data || error.message);
  }

  // Test 3: Check if POST route exists
  console.log('\nTest 3: Check route registration');
  try {
    // First check if GET works
    const getResponse = await axios.get(`${baseURL}/books`);
    console.log('✅ GET /books works:', getResponse.status);
    
    // Try OPTIONS method to see allowed methods
    const optionsResponse = await axios({
      method: 'OPTIONS',
      url: `${baseURL}/books`
    });
    console.log('✅ OPTIONS /books:', optionsResponse.headers['allow']);
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

debugPost();
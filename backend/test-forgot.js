const axios = require('axios');
async function test() {
  try {
    const res = await axios.post('https://mait-it-library-backend.onrender.com/api/auth/forgot-password', { email: 'tushar.abhinavgupta@gmail.com' }); // Fake email
    console.log('Success:', res.data);
  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.message);
  }
}
test();

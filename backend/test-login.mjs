async function test() {
  try {
    const res = await fetch('https://mait-it-library-backend.onrender.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'abhinavgupta20066@gmail.com', password: 'Abhi@1111' })
    });
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Response:', text);
  } catch (err) {
    console.error('Error:', err.message);
  }
}
test();

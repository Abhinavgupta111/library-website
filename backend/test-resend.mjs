import { Resend } from 'resend';

const resend = new Resend('re_h5ocTfe8_FXoTwtYUFXYpXpGwwBQqfiG4');

async function test() {
  const { data, error } = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: 'some-random-email@gmail.com', // NOT the account owner
    subject: 'Test',
    html: '<p>Test</p>'
  });
  console.log('Data:', data);
  console.log('Error:', error);
}
test();

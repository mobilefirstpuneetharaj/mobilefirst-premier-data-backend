// test-email.js
require('dotenv').config();
const sendEmail = require('./utils/sendEmail');

async function testEmail() {
  try {
    console.log('Testing email configuration...');
    console.log('Using:', process.env.EMAIL_HOST, process.env.EMAIL_USERNAME);
    
    await sendEmail({
      email: 'puneetharajkr123@gmail.com', // Send to yourself for testing
      subject: 'Test Email from Premier Data Backend',
      message: 'This is a test email to verify your SMTP configuration is working correctly! If you receive this, your email setup is working properly.'
    });
    
    console.log('✅ Email test completed successfully!');
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    console.error('Full error:', error);
  }
}

testEmail();
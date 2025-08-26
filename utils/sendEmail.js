// const nodemailer = require('nodemailer');

// module.exports = async options => {
//   // If we're in development and don't want to send real emails
//   if (process.env.NODE_ENV === 'development'  && process.env.SEND_REAL_EMAILS === 'false') {
//     console.log('=== EMAIL (NOT SENT - DEVELOPMENT MODE) ===');
//     console.log('To:', options.email);
//     console.log('Subject:', options.subject);
//     console.log('Message:', options.message);
//     console.log('==========================================');
//     return;
//   }

//   try {
//     // 1) Create a transporter
//     const transporter = nodemailer.createTransport({
//       host: process.env.EMAIL_HOST,
//       port: process.env.EMAIL_PORT,
//       secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
//       auth: {
//         user: process.env.EMAIL_USERNAME,
//         pass: process.env.EMAIL_PASSWORD
//       }
//     });

//     // 2) Define the email options
//     const mailOptions = {
//       from: `Premier Data <${process.env.EMAIL_USERNAME}>`,
//       to: options.email,
//       subject: options.subject,
//       text: options.message
//       // html: options.html (you can add HTML email templates later)
//     };

//     // 3) Actually send the email
//     await transporter.sendMail(mailOptions);
//     console.log(`Email sent to: ${options.email}`);
    
//   } catch (error) {
//     console.error('Email sending error:', error.message);
//     throw new Error('Failed to send email');
//   }
// };

const nodemailer = require('nodemailer');

module.exports = async options => {
  // If we're in development and don't want to send real emails
  if (process.env.NODE_ENV === 'development' && process.env.SEND_REAL_EMAILS === 'false') {
    console.log('=== EMAIL (NOT SENT - DEVELOPMENT MODE) ===');
    console.log('To:', options.email);
    console.log('Subject:', options.subject);
    console.log('Message:', options.message);
    console.log('==========================================');
    return;
  }

  try {
    // 1) Create a transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Verify connection configuration
    await transporter.verify();
    console.log('✅ SMTP connection verified');

    // 2) Define the email options
    const mailOptions = {
      from: process.env.EMAIL_FROM || `Premier Data <${process.env.EMAIL_USERNAME}>`,
      to: options.email,
      subject: options.subject,
      text: options.message
      // html: options.html (you can add HTML email templates later)
    };

    // 3) Actually send the email
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to: ${options.email}`);
    console.log(`📧 Message ID: ${info.messageId}`);
    
  } catch (error) {
    console.error('❌ Email sending error:', error.message);
    
    // More detailed error logging
    if (error.code === 'EAUTH') {
      console.error('❌ Authentication failed - check email credentials');
    } else if (error.code === 'ECONNECTION') {
      console.error('❌ Connection failed - check network or SMTP settings');
    }
    
    throw new Error('Failed to send email: ' + error.message);
  }
};
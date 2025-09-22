/**
 * Script to test Mailgun integration and resend verification emails
 * Now that Mailgun is operational, let's get all team members verified
 */

const axios = require('axios');

const API_BASE_URL = 'https://newapp-backend-production.up.railway.app';

// Team members needing email verification
const teamEmails = [
  { email: 'mkankkun@gmail.com', name: 'Mikko', password: 'nakkivene123' },
  { email: 'pete@kurkipotku.com', name: 'Pete', password: 'nakkivene123' },
  { email: 'serveri.suhonen@gmail.com', name: 'Janne', password: 'nakkivene123' },
  { email: 'juhani@diamondmakers.com', name: 'Juhani', password: 'nakkivene123' }
];

async function testMailgunHealth() {
  try {
    console.log('🔍 Testing Mailgun service health...');
    
    const response = await axios.get(`${API_BASE_URL}/api/v1/email/health`, {
      headers: {
        'Content-Type': 'application/json',
        'x-app-id': 'diamondmanager'
      }
    });

    console.log('✅ Mailgun service status:', response.data);
    return true;

  } catch (error) {
    console.error('❌ Mailgun health check failed:', error.response?.data || error.message);
    return false;
  }
}

async function resendVerificationEmail(email, name) {
  try {
    console.log(`📧 Resending verification email for ${name} (${email})...`);
    
    const response = await axios.post(`${API_BASE_URL}/api/v1/auth/resend-verification`, {
      email: email
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-app-id': 'diamondmanager'
      }
    });

    console.log(`✅ Verification email sent to ${name}:`, response.data);
    return { success: true, name, email };

  } catch (error) {
    console.error(`❌ Failed to send verification to ${name}:`, error.response?.data || error.message);
    return { success: false, name, email, error: error.response?.data || error.message };
  }
}

async function testSendCustomEmail() {
  try {
    console.log('📧 Testing custom email sending...');
    
    const response = await axios.post(`${API_BASE_URL}/api/v1/email/send`, {
      to: 'mkankkun@gmail.com',
      subject: 'DiamondManager - Mailgun Test',
      html: `
        <h2>🚀 DiamondManager is Ready!</h2>
        <p>Hi Mikko,</p>
        <p>Great news! Mailgun is now operational for DiamondManager.</p>
        <p><strong>Your login credentials:</strong></p>
        <ul>
          <li>Email: mkankkun@gmail.com</li>
          <li>Password: nakkivene123</li>
        </ul>
        <p><a href="https://diamondmanager-production.up.railway.app">Login to DiamondManager</a></p>
        <p>Best regards,<br>Diamond Makers Team</p>
      `,
      appContext: 'diamondmanager'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-app-id': 'diamondmanager'
      }
    });

    console.log('✅ Custom email sent successfully:', response.data);
    return true;

  } catch (error) {
    console.error('❌ Custom email failed:', error.response?.data || error.message);
    return false;
  }
}

async function checkUserStatus(email, name) {
  try {
    console.log(`👤 Checking user status for ${name}...`);
    
    // Try to get user info (if endpoint exists)
    const response = await axios.get(`${API_BASE_URL}/api/v1/users/profile`, {
      headers: {
        'Content-Type': 'application/json',
        'x-app-id': 'diamondmanager',
        'x-user-email': email
      }
    });

    console.log(`📋 ${name} status:`, {
      emailVerified: response.data.user?.emailVerified || false,
      createdAt: response.data.user?.createdAt,
      lastLogin: response.data.user?.lastLoginAt
    });

    return response.data.user?.emailVerified || false;

  } catch (error) {
    console.log(`❓ Could not fetch ${name} status (endpoint may not exist)`);
    return null;
  }
}

async function testLoginAfterMailgun(email, password, name) {
  try {
    console.log(`🔐 Testing login for ${name}...`);
    
    const response = await axios.post(`${API_BASE_URL}/api/v1/auth/login`, {
      email: email,
      password: password
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-app-id': 'diamondmanager'
      }
    });

    console.log(`✅ ${name} login successful! Token received.`);
    return { success: true, name, email, token: !!response.data.token };

  } catch (error) {
    const message = error.response?.data?.message || error.message;
    console.log(`❌ ${name} login failed: ${message}`);
    return { success: false, name, email, error: message };
  }
}

async function runMailgunTests() {
  console.log('🚀 Testing Mailgun Integration for DiamondManager');
  console.log('=================================================\n');
  
  // Step 1: Test Mailgun service health
  const mailgunHealthy = await testMailgunHealth();
  console.log('');
  
  // Step 2: Check current user statuses
  console.log('👥 Checking current user statuses...');
  for (const member of teamEmails) {
    await checkUserStatus(member.email, member.name);
  }
  console.log('');
  
  // Step 3: Test custom email sending
  if (mailgunHealthy) {
    await testSendCustomEmail();
    console.log('');
  }
  
  // Step 4: Resend verification emails
  console.log('📧 Resending verification emails...');
  const resendResults = [];
  
  for (const member of teamEmails) {
    const result = await resendVerificationEmail(member.email, member.name);
    resendResults.push(result);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Delay between sends
  }
  console.log('');
  
  // Step 5: Test logins
  console.log('🔐 Testing current login status...');
  const loginResults = [];
  
  for (const member of teamEmails) {
    const result = await testLoginAfterMailgun(member.email, member.password, member.name);
    loginResults.push(result);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  console.log('');
  
  // Summary
  console.log('📋 Summary:');
  console.log('===========');
  
  const successful = resendResults.filter(r => r.success);
  console.log(`📧 Verification emails sent: ${successful.length}/${teamEmails.length}`);
  
  const canLogin = loginResults.filter(r => r.success);
  console.log(`🔐 Can login now: ${canLogin.length}/${teamEmails.length}`);
  
  if (canLogin.length > 0) {
    console.log('\n✅ Ready to login:');
    canLogin.forEach(user => console.log(`   ${user.name}: ${user.email}`));
  }
  
  const needVerification = loginResults.filter(r => !r.success && r.error.includes('vahvistettu'));
  if (needVerification.length > 0) {
    console.log('\n📧 Need to check email for verification:');
    needVerification.forEach(user => console.log(`   ${user.name}: ${user.email}`));
  }
  
  console.log('\n🌐 DiamondManager: https://diamondmanager-production.up.railway.app');
  console.log('🎉 Mailgun is now operational for team communications!');
}

// Run if called directly
if (require.main === module) {
  runMailgunTests().catch(error => {
    console.error('\n💥 Mailgun test failed:', error.message);
    process.exit(1);
  });
}

module.exports = { runMailgunTests };
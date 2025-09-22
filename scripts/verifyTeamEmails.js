/**
 * Script to manually verify team member emails in MongoDB
 * Sets emailVerified: true for all Diamond Makers team members
 */

const axios = require('axios');

const API_BASE_URL = 'https://newapp-backend-production.up.railway.app';

// Team emails that need verification
const teamEmails = [
  'mkankkun@gmail.com',          // Mikko
  'pete@kurkipotku.com',         // Pete  
  'serveri.suhonen@gmail.com',   // Janne
  'juhani@diamondmakers.com',    // Juhani
  'tommi@kurkipotku.com'         // Tommi (if needed)
];

async function verifyUserEmail(email) {
  try {
    console.log(`📧 Verifying email for: ${email}...`);
    
    // Use the user service to update emailVerified status
    const response = await axios.patch(`${API_BASE_URL}/api/v1/users/verify-email`, {
      email: email,
      verified: true,
      skipEmailCheck: true  // Skip actual email verification process
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-app-id': 'diamondmanager',
        'x-admin-action': 'true'  // Admin override
      }
    });

    console.log(`✅ Email verified for ${email}`);
    return { success: true, email };

  } catch (error) {
    console.error(`❌ Failed to verify ${email}:`);
    
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    } else {
      console.error('   Error:', error.message);
    }
    
    return { success: false, email, error: error.message };
  }
}

async function directMongoUpdate(email) {
  try {
    console.log(`🔧 Direct MongoDB update for: ${email}...`);
    
    // Direct MongoDB update via backend admin endpoint
    const response = await axios.post(`${API_BASE_URL}/api/v1/admin/update-user`, {
      email: email,
      updates: {
        emailVerified: true,
        verifiedAt: new Date().toISOString()
      },
      collection: 'users_diamondmanager'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-app-id': 'diamondmanager',
        'x-admin-key': 'diamond-makers-admin-2025'  // Admin key for direct updates
      }
    });

    console.log(`✅ MongoDB updated for ${email}`);
    return { success: true, email };

  } catch (error) {
    console.error(`❌ MongoDB update failed for ${email}:`, error.response?.data || error.message);
    return { success: false, email, error: error.message };
  }
}

async function testUserLogin(email, password, name) {
  try {
    console.log(`🧪 Testing login for ${name} (${email})...`);
    
    const response = await axios.post(`${API_BASE_URL}/api/v1/auth/login`, {
      email: email,
      password: password
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-app-id': 'diamondmanager'
      }
    });

    console.log(`✅ ${name} can now login successfully!`);
    return { success: true, name, email };

  } catch (error) {
    console.error(`❌ Login still failing for ${name}:`, error.response?.data?.message || error.message);
    return { success: false, name, email, error: error.response?.data?.message };
  }
}

async function verifyAllTeamEmails() {
  console.log('🚀 Verifying Diamond Makers Team Emails in MongoDB\n');
  
  const results = [];
  
  // Method 1: Try email verification endpoint
  console.log('📧 Method 1: Using email verification endpoint...');
  for (const email of teamEmails) {
    try {
      const result = await verifyUserEmail(email);
      results.push(result);
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      results.push({ success: false, email, error: error.message });
    }
  }
  
  // Check if Method 1 worked
  const method1Success = results.filter(r => r.success).length;
  console.log(`\n📊 Method 1 Results: ${method1Success}/${teamEmails.length} successful\n`);
  
  // Method 2: Direct MongoDB updates if Method 1 failed
  if (method1Success < teamEmails.length) {
    console.log('🔧 Method 2: Direct MongoDB updates...');
    
    for (const email of teamEmails) {
      try {
        const result = await directMongoUpdate(email);
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Failed direct update for ${email}`);
      }
    }
  }
  
  // Test logins with known credentials
  console.log('\n🧪 Testing team member logins...');
  
  const testCredentials = [
    { email: 'mkankkun@gmail.com', password: 'nakkivene123', name: 'Mikko' },
    { email: 'pete@kurkipotku.com', password: 'nakkivene123', name: 'Pete' },
    { email: 'serveri.suhonen@gmail.com', password: 'nakkivene123', name: 'Janne' },
    { email: 'juhani@diamondmakers.com', password: 'nakkivene123', name: 'Juhani' },
    { email: 'tommi@kurkipotku.com', password: 'asdf1234', name: 'Tommi' }
  ];
  
  const loginResults = [];
  for (const cred of testCredentials) {
    const result = await testUserLogin(cred.email, cred.password, cred.name);
    loginResults.push(result);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Summary
  console.log('\n📋 Final Summary:');
  console.log('=========================================');
  
  const successful = loginResults.filter(r => r.success);
  console.log(`✅ ${successful.length}/${testCredentials.length} team members can now login`);
  
  console.log('\n🔐 Working Login Credentials:');
  successful.forEach(result => {
    console.log(`✅ ${result.name}: ${result.email}`);
  });
  
  const failed = loginResults.filter(r => !r.success);
  if (failed.length > 0) {
    console.log('\n❌ Still having issues:');
    failed.forEach(result => {
      console.log(`❌ ${result.name}: ${result.error}`);
    });
  }
  
  console.log('\n🌐 DiamondManager URL: https://diamondmanager-production.up.railway.app');
  console.log('🚀 Ready for team testing!');
  
  return { successful: successful.length, failed: failed.length };
}

// Run if called directly
if (require.main === module) {
  verifyAllTeamEmails().catch(error => {
    console.error('\n💥 Email verification script failed:', error.message);
    process.exit(1);
  });
}

module.exports = { verifyAllTeamEmails, teamEmails };
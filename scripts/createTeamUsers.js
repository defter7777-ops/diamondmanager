/**
 * Script to create all Diamond Makers team users for DiamondManager
 * Creates specific accounts with proper credentials and profiles
 */

const axios = require('axios');

const API_BASE_URL = 'https://newapp-backend-production.up.railway.app';

// Team member data with specified credentials
const teamMembers = [
  {
    firstName: 'Mikko',
    lastName: 'Diamond',
    email: 'mkankkun@gmail.com',
    password: 'nakkivene123',
    role: 'admin',
    preferredLanguage: 'fi',
    metadata: {
      superpower: 'Finance & Business Strategy',
      availableHours: 'business hours',
      growthGoals: ['SaaS revenue optimization', 'Financial systems scaling'],
      companyRole: 'Finance Director & Analytics',
      currentFocus: 'Payment systems analysis (Diamond Makers + Farmastic Oy)'
    }
  },
  {
    firstName: 'Pete',
    lastName: 'Diamond',
    email: 'pete@kurkipotku.com',
    password: 'nakkivene123',
    role: 'manager',
    preferredLanguage: 'fi',
    metadata: {
      superpower: 'Content & Customer Relations',
      availableHours: 'flexible',
      growthGoals: ['Business development mastery', 'Customer relationship scaling'],
      companyRole: 'Content Provider & Business Development',
      currentFocus: 'Random Team Generator App corrections + Funding analysis'
    }
  },
  {
    firstName: 'Janne',
    lastName: 'Diamond', 
    email: 'serveri.suhonen@gmail.com',
    password: 'nakkivene123',
    role: 'manager',
    preferredLanguage: 'fi',
    metadata: {
      superpower: 'UX/UI Design & User Experience',
      availableHours: 'creative hours',
      growthGoals: ['AI-assisted design workflows', 'User experience excellence'],
      companyRole: 'Designer & UX Specialist',
      currentFocus: 'DiamondManager testing & Random Team Generator UI planning'
    }
  },
  {
    firstName: 'Juhani',
    lastName: 'Diamond',
    email: 'juhani@diamondmakers.com',
    password: 'nakkivene123',
    role: 'manager', 
    preferredLanguage: 'fi',
    metadata: {
      superpower: 'Sales & Customer Acquisition',
      availableHours: 'client hours',
      growthGoals: ['AI-enhanced sales processes', 'Customer base expansion'],
      companyRole: 'Sales Director & Customer Relations',
      currentFocus: 'AI training scheduling + Business logic development + Customer mapping'
    }
  }
];

async function createTeamUser(userData) {
  try {
    console.log(`🎯 Creating user: ${userData.email}...`);
    
    const response = await axios.post(`${API_BASE_URL}/api/v1/auth/register`, userData, {
      headers: {
        'Content-Type': 'application/json',
        'x-app-id': 'diamondmanager'
      }
    });

    console.log(`✅ ${userData.firstName} created successfully!`);
    return { success: true, user: userData };

  } catch (error) {
    console.error(`❌ Error creating ${userData.firstName}:`);
    
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
      
      // If user already exists, that's okay
      if (error.response.status === 400 && 
          (error.response.data?.message?.includes('already exists') || 
           error.response.data?.message?.includes('already in use'))) {
        console.log(`🤔 ${userData.firstName} already exists - that's okay!`);
        return { success: true, existed: true, user: userData };
      }
    } else {
      console.error('   Error:', error.message);
    }
    
    throw error;
  }
}

async function testUserLogin(email, password, firstName) {
  try {
    console.log(`🧪 Testing login for ${firstName}...`);
    
    const response = await axios.post(`${API_BASE_URL}/api/v1/auth/login`, {
      email: email,
      password: password
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-app-id': 'diamondmanager'
      }
    });

    console.log(`✅ ${firstName} login test successful!`);
    return { success: true, token: response.data.token };

  } catch (error) {
    console.error(`❌ Login test failed for ${firstName}:`, error.response?.data || error.message);
    throw error;
  }
}

async function createAllTeamUsers() {
  console.log('🚀 Creating Diamond Makers Team Users for DiamondManager\n');
  
  const results = [];
  
  for (const member of teamMembers) {
    try {
      const result = await createTeamUser(member);
      results.push(result);
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`💥 Failed to create ${member.firstName}:`, error.message);
      results.push({ success: false, user: member, error: error.message });
    }
  }
  
  console.log('\n🧪 Testing all user logins...');
  
  for (const member of teamMembers) {
    try {
      await testUserLogin(member.email, member.password, member.firstName);
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`💥 Login test failed for ${member.firstName}`);
    }
  }
  
  console.log('\n📋 Summary:');
  console.log('=========================================');
  
  results.forEach(result => {
    const status = result.success ? (result.existed ? '🔄 EXISTS' : '✅ CREATED') : '❌ FAILED';
    console.log(`${status} ${result.user.firstName}: ${result.user.email}`);
  });
  
  console.log('\n🔐 Login Credentials for DiamondManager:');
  console.log('=========================================');
  teamMembers.forEach(member => {
    console.log(`${member.firstName}: ${member.email} / ${member.password}`);
  });
  
  console.log('\n🌐 DiamondManager URL: https://diamondmanager-production.up.railway.app');
  console.log('📧 Note: Since Mailgun is in sandbox mode, all these emails should work directly');
  
  return results;
}

// Run if called directly
if (require.main === module) {
  createAllTeamUsers().catch(error => {
    console.error('\n💥 Script failed:', error.message);
    process.exit(1);
  });
}

module.exports = { createAllTeamUsers, teamMembers };
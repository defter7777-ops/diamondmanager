/**
 * Script to create DiamondManager user entry for testing
 * This creates tommi@kurkipotku.com in the users_diamondmanager collection
 * so we can test multi-app authentication
 */

const axios = require('axios');

const API_BASE_URL = 'https://newapp-backend-production.up.railway.app';

async function createDiamondManagerUser() {
  try {
    console.log('🎯 Creating DiamondManager user entry...');
    
    const userData = {
      firstName: 'Tommi',
      lastName: 'Kurkipotku', 
      email: 'tommi@kurkipotku.com',
      password: 'asdf1234',
      role: 'admin',
      preferredLanguage: 'en',
      metadata: {
        superpower: 'Technical Architecture & AI Integration',
        availableHours: 'flexible',
        growthGoals: ['AI workflow mastery', 'Team multiplication'],
        companyRole: 'Founder & Technical Visionary'
      }
    };

    console.log('📊 User data prepared:', {
      email: userData.email,
      role: userData.role,
      superpower: userData.metadata.superpower
    });

    // Register user specifically for DiamondManager app
    console.log('📤 Sending request with headers:', {
      'Content-Type': 'application/json',
      'x-app-id': 'diamondmanager'
    });

    const response = await axios.post(`${API_BASE_URL}/api/v1/auth/register`, userData, {
      headers: {
        'Content-Type': 'application/json',
        'x-app-id': 'diamondmanager' // Must be lowercase to match middleware
      }
    });

    console.log('✅ DiamondManager user created successfully!');
    console.log('📋 Response:', {
      status: response.status,
      message: response.data.message || 'User created',
      appContext: response.headers['x-app-context'],
      collection: response.headers['x-app-collection']
    });

    console.log('\n🔐 Login credentials for DiamondManager:');
    console.log('   Email: tommi@kurkipotku.com');
    console.log('   Password: asdf1234');
    console.log('   App Context: diamondmanager');

    return response.data;

  } catch (error) {
    console.error('❌ Error creating DiamondManager user:');
    
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
      console.error('   Response Headers:');
      console.error('     X-App-Context:', error.response.headers['x-app-context']);
      console.error('     X-App-Collection:', error.response.headers['x-app-collection']);
      
      // Show the actual error from backend
      if (error.response.data?.message) {
        console.error('   Backend Message:', error.response.data.message);
      }
    } else if (error.request) {
      console.error('   Network Error:', error.message);
    } else {
      console.error('   Error:', error.message);
    }
    
    // Check if this is about app context validation
    if (error.response?.data?.error === 'INVALID_APP_CONTEXT') {
      console.error('\n🚨 App Context Issue Detected:');
      console.error('   Valid Apps:', error.response.data.validApps);
      console.error('   Detection Source:', error.response.data.detectedFrom);
      throw error;
    }
    
    // If user already exists, that could be expected
    if (error.response?.status === 400 && 
        (error.response.data?.message?.includes('already exists') || 
         error.response.data?.message?.includes('already in use') ||
         error.response.data?.code === 'DUPLICATE_ENTRY')) {
      console.log('\n🤔 User already exists - but which collection?');
      console.log('   App Context:', error.response.headers['x-app-context']);
      console.log('   Collection:', error.response.headers['x-app-collection']);
      
      // If app context is working, user exists in DiamondManager
      if (error.response.headers['x-app-context'] === 'diamondmanager') {
        console.log('\n✅ User already exists in DiamondManager - ready to test!');
        return { success: true, message: 'User already exists in DiamondManager' };
      } else {
        console.log('\n❌ User exists in different app context - app detection may not be working');
        throw error;
      }
    }
    
    throw error;
  }
}

// Test the authentication after user creation
async function testDiamondManagerAuth() {
  try {
    console.log('\n🧪 Testing DiamondManager authentication...');
    
    const response = await axios.post(`${API_BASE_URL}/api/v1/auth/login`, {
      email: 'tommi@kurkipotku.com',
      password: 'asdf1234'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-app-id': 'diamondmanager'
      }
    });

    console.log('✅ Authentication test successful!');
    console.log('📋 Auth response:', {
      status: response.status,
      tokenReceived: !!response.data.token,
      userRole: response.data.user?.role,
      appContext: response.headers['x-app-context'],
      collection: response.headers['x-app-collection']
    });

    // Test token verification
    if (response.data.token) {
      console.log('\n🔍 Testing token verification...');
      
      const verifyResponse = await axios.post(`${API_BASE_URL}/api/v1/auth/verify-token`, {}, {
        headers: {
          'Authorization': `Bearer ${response.data.token}`,
          'x-app-id': 'diamondmanager'
        }
      });

      console.log('✅ Token verification successful!');
      console.log('📋 Verification:', {
        valid: verifyResponse.data.valid,
        userId: verifyResponse.data.user?.id,
        appContext: verifyResponse.headers['x-app-context']
      });
    }

  } catch (error) {
    console.error('❌ Authentication test failed:');
    
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
      console.error('   App Context:', error.response.headers['x-app-context']);
    } else {
      console.error('   Error:', error.message);
    }
  }
}

// Run the setup
async function main() {
  console.log('🚀 DiamondManager User Setup & Testing\n');
  
  try {
    // Step 1: Create user
    await createDiamondManagerUser();
    
    // Step 2: Test authentication
    await testDiamondManagerAuth();
    
    console.log('\n🎉 Setup complete! DiamondManager is ready for testing.');
    console.log('🔗 You can now login at: http://localhost:3000');
    
  } catch (error) {
    console.error('\n💥 Setup failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { createDiamondManagerUser, testDiamondManagerAuth };
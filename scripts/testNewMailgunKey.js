/**
 * Test new Mailgun API key to verify it works
 * Run this before setting up DNS
 */

const axios = require('axios');

const NEW_API_KEY = process.argv[2]; // Pass as command line argument
const SANDBOX_DOMAIN = 'sandbox5eefc43a439b434d98d27778845e3529.mailgun.org';

async function testNewApiKey() {
  if (!NEW_API_KEY) {
    console.error('❌ Please provide API key: node testNewMailgunKey.js YOUR_NEW_KEY');
    process.exit(1);
  }

  console.log('🔑 Testing new Mailgun API key...');
  
  try {
    // Test API key with sandbox domain first
    const response = await axios.post(
      `https://api.mailgun.net/v3/${SANDBOX_DOMAIN}/messages`,
      new URLSearchParams({
        from: 'DiamondManager Test <mailgun@sandbox5eefc43a439b434d98d27778845e3529.mailgun.org>',
        to: 'tommi@kurkipotku.com', // Your authorized recipient
        subject: 'New API Key Test',
        text: 'This confirms your new Mailgun API key is working! ✅'
      }),
      {
        auth: {
          username: 'api',
          password: NEW_API_KEY
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    console.log('✅ New API key works!');
    console.log('📧 Test email sent successfully');
    console.log('🔄 Response:', response.data);
    
    console.log('\n🎯 Next steps:');
    console.log('1. Add this key to Railway environment variables');
    console.log('2. Set up DNS records for kurkipotku.com');
    console.log('3. Switch from sandbox to your domain');
    
  } catch (error) {
    console.error('❌ API key test failed:');
    console.error('Status:', error.response?.status);
    console.error('Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 This means:');
      console.log('- API key is invalid, or');
      console.log('- Account still disabled, or'); 
      console.log('- Need to contact support first');
    }
  }
}

testNewApiKey();
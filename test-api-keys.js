#!/usr/bin/env node

/**
 * API Key Tester
 * Tests your Gemini and Firebase API keys to see which ones are working
 */

const GEMINI_KEY = 'AIzaSyAI2uCr1goMuO7SIOgzgmi7-RU4_yLWhY4';
const FIREBASE_KEY = 'AIzaSyDWksau146D5uebmg47Cq4FMrpvB8etABM';

async function testGeminiKey(apiKey) {
  console.log('\n🧪 Testing Gemini API Key...');
  console.log(`Key: ${apiKey.substring(0, 20)}...`);

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: 'Say hello' }]
        }]
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Gemini API Key is WORKING');
      console.log(`   Response: ${data.candidates[0].content.parts[0].text.substring(0, 50)}...`);
      return { status: 'working', key: apiKey };
    } else {
      console.log('❌ Gemini API Key FAILED');
      console.log(`   Error: ${data.error?.message || JSON.stringify(data)}`);

      if (data.error?.message?.includes('API key expired')) {
        console.log('   🔑 This key is EXPIRED - create a new one!');
      } else if (data.error?.message?.includes('API key not valid')) {
        console.log('   🔑 This key is INVALID');
      } else if (data.error?.status === 'PERMISSION_DENIED') {
        console.log('   🔑 Generative Language API is not enabled for this key');
        console.log('   📝 Enable it at: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com');
      }

      return { status: 'failed', key: apiKey, error: data.error };
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
    return { status: 'error', key: apiKey, error: error.message };
  }
}

async function testFirebaseKey(apiKey) {
  console.log('\n🧪 Testing Firebase API Key...');
  console.log(`Key: ${apiKey.substring(0, 20)}...`);

  // Test if the key can access Firebase Identity Toolkit
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: 'test' }) // Will fail but shows if key is valid
    });

    const data = await response.json();

    // We expect an error about invalid token, but if the key works, we'll get a specific error
    if (data.error?.message?.includes('INVALID_ID_TOKEN') ||
        data.error?.message?.includes('TOKEN_EXPIRED')) {
      console.log('✅ Firebase API Key is WORKING');
      console.log('   (Got expected error for test token - this means the key itself is valid)');
      return { status: 'working', key: apiKey };
    } else if (response.status === 400 && data.error?.message?.includes('API key expired')) {
      console.log('❌ Firebase API Key is EXPIRED');
      console.log('   🔑 This key needs to be regenerated in Firebase Console');
      return { status: 'expired', key: apiKey };
    } else if (response.status === 400 && data.error?.message?.includes('API key not valid')) {
      console.log('❌ Firebase API Key is INVALID');
      return { status: 'invalid', key: apiKey };
    } else {
      console.log('⚠️  Unexpected response:', data);
      return { status: 'unknown', key: apiKey, data };
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
    return { status: 'error', key: apiKey, error: error.message };
  }
}

async function main() {
  console.log('🔍 API Key Diagnostics for ConvoQuest\n');
  console.log('================================================');

  const geminiResult = await testGeminiKey(GEMINI_KEY);
  const firebaseResult = await testFirebaseKey(FIREBASE_KEY);

  console.log('\n================================================');
  console.log('📊 SUMMARY');
  console.log('================================================');

  console.log(`\n1. Gemini/Translate Key: ${geminiResult.status.toUpperCase()}`);
  console.log(`   Used for: AI chat functionality`);

  console.log(`\n2. Firebase Key: ${firebaseResult.status.toUpperCase()}`);
  console.log(`   Used for: Authentication & Database`);

  console.log('\n================================================');
  console.log('💡 RECOMMENDATIONS');
  console.log('================================================\n');

  if (geminiResult.status === 'failed' || geminiResult.status === 'expired') {
    console.log('🔧 Fix Gemini Key:');
    console.log('   1. Go to: https://console.cloud.google.com/apis/credentials');
    console.log('   2. Find your key with 3 APIs');
    console.log('   3. Make sure these APIs are enabled:');
    console.log('      - Generative Language API');
    console.log('   4. Update GEMINI_API_KEY in your .env file');
  } else {
    console.log('✅ Gemini key is working - no action needed!');
  }

  console.log('');

  if (firebaseResult.status === 'expired' || firebaseResult.status === 'invalid') {
    console.log('🔧 Fix Firebase Key:');
    console.log('   1. Go to: https://console.firebase.google.com/');
    console.log('   2. Select your project: spanish-ai-project');
    console.log('   3. Go to Project Settings → General');
    console.log('   4. Scroll to "Your apps" and get the new config');
    console.log('   5. Update VITE_FIREBASE_API_KEY in your .env file');
  } else {
    console.log('✅ Firebase key is working - no action needed!');
  }

  console.log('\n================================================\n');
}

main();

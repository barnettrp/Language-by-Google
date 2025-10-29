#!/usr/bin/env node

/**
 * Test script to directly test Google Cloud Translation API
 * This will help diagnose the "translation unavailable" error
 */

import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY;

if (!API_KEY) {
  console.error('❌ GOOGLE_TRANSLATE_API_KEY not found in .env file');
  process.exit(1);
}

console.log('🔑 Using API Key:', API_KEY.substring(0, 10) + '...');
console.log('');

async function testTranslation() {
  const testText = 'Hola';
  const sourceLang = 'es';
  const targetLang = 'en';

  console.log(`📝 Testing translation of: "${testText}" (${sourceLang} → ${targetLang})`);
  console.log('');

  const url = `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`;

  try {
    console.log('🌐 Making request to:', url.replace(API_KEY, 'API_KEY_HIDDEN'));
    console.log('');

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: testText,
        source: sourceLang,
        target: targetLang,
        format: 'text'
      })
    });

    console.log('📡 Response Status:', response.status, response.statusText);
    console.log('');

    const data = await response.json();

    console.log('📦 Full Response:');
    console.log(JSON.stringify(data, null, 2));
    console.log('');

    if (response.ok && data.data && data.data.translations && data.data.translations[0]) {
      console.log('✅ SUCCESS! Translation:', data.data.translations[0].translatedText);
    } else {
      console.log('❌ FAILED! Error details:');
      if (data.error) {
        console.log('Error Code:', data.error.code);
        console.log('Error Message:', data.error.message);
        console.log('Error Status:', data.error.status);
        if (data.error.details) {
          console.log('Error Details:', JSON.stringify(data.error.details, null, 2));
        }
      }
    }

  } catch (error) {
    console.error('❌ Exception occurred:', error.message);
    console.error(error);
  }
}

testTranslation();

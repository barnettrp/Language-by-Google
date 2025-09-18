#!/usr/bin/env node

/**
 * Setup verification script for ConvoQuest
 * Run with: node setup-check.js
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

console.log('🔍 ConvoQuest Setup Verification\n');

// Check Node.js version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
console.log(`✓ Node.js version: ${nodeVersion}`);
if (majorVersion < 16) {
  console.log('⚠️  Warning: Node.js 16+ is recommended');
}

// Check package.json
try {
  const pkg = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf8'));
  console.log(`✓ Package: ${pkg.name} v${pkg.version}`);
} catch (error) {
  console.log('❌ Error reading package.json:', error.message);
}

// Check environment file
const envPath = join(__dirname, '.env');
if (existsSync(envPath)) {
  console.log('✓ .env file exists');
  
  try {
    const envContent = readFileSync(envPath, 'utf8');
    const requiredVars = [
      'VITE_FIREBASE_API_KEY',
      'VITE_FIREBASE_AUTH_DOMAIN',
      'VITE_FIREBASE_PROJECT_ID',
      'VITE_FIREBASE_STORAGE_BUCKET',
      'VITE_FIREBASE_MESSAGING_SENDER_ID',
      'VITE_FIREBASE_APP_ID'
    ];
    
    let missingVars = [];
    requiredVars.forEach(varName => {
      if (envContent.includes(`${varName}=changeme`) || !envContent.includes(varName)) {
        missingVars.push(varName);
      }
    });
    
    if (missingVars.length === 0) {
      console.log('✓ All Firebase environment variables are configured');
    } else {
      console.log('⚠️  These environment variables need to be configured:');
      missingVars.forEach(varName => console.log(`   - ${varName}`));
    }
  } catch (error) {
    console.log('❌ Error reading .env file:', error.message);
  }
} else {
  console.log('⚠️  .env file missing. Copy .env.example to .env and configure it.');
}

// Check critical files
const criticalFiles = [
  'public/index.html',
  'api/gemini.js',
  'vite.config.js',
  'vercel.json'
];

criticalFiles.forEach(file => {
  if (existsSync(join(__dirname, file))) {
    console.log(`✓ ${file} exists`);
  } else {
    console.log(`❌ Missing: ${file}`);
  }
});

// Check node_modules
if (existsSync(join(__dirname, 'node_modules'))) {
  console.log('✓ Dependencies installed (node_modules exists)');
} else {
  console.log('⚠️  Dependencies not installed. Run: npm install');
}

console.log('\n🚀 Setup verification complete!');
console.log('\nNext steps:');
console.log('1. Configure your .env file with Firebase credentials');
console.log('2. Run "npm run dev" to start development server');
console.log('3. Run "npm run build" to test production build');
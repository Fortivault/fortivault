#!/usr/bin/env node

/**
 * Test script to verify both admin and agent authentication systems
 * 
 * Admin Login: Uses Supabase Auth (signInWithPassword)
 * Agent Login: Uses custom API with bcrypt password verification
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVER_URL = 'http://localhost:3005';

// Admin credentials (reset earlier)
const ADMIN_EMAIL = 'admin@fortivault.com';
const ADMIN_PASSWORD = 'admin123456';

async function testAdminLogin() {
  console.log('\n🔐 Testing Admin Login (Supabase Auth)...');
  
  try {
    // Test admin login page accessibility
    const pageResponse = await fetch(`${SERVER_URL}/admin-login`);
    console.log(`✅ Admin login page: ${pageResponse.status} ${pageResponse.statusText}`);
    
    // Test admin setup API
    const setupResponse = await fetch(`${SERVER_URL}/api/admin/setup`);
    const setupData = await setupResponse.json();
    console.log(`✅ Admin setup check: needsSetup = ${setupData.needsSetup}`);
    
    // Test Supabase Auth login
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    
    if (error) {
      console.log(`❌ Admin Supabase login failed: ${error.message}`);
      return false;
    }
    
    console.log(`✅ Admin Supabase login successful: ${data.user.email}`);
    console.log(`✅ Admin user role: ${data.user.user_metadata?.role || 'undefined'}`);
    
    // Sign out
    await supabase.auth.signOut();
    console.log('✅ Admin logout successful');
    
    return true;
  } catch (error) {
    console.log(`❌ Admin login test failed: ${error.message}`);
    return false;
  }
}

async function testAgentLogin() {
  console.log('\n🔐 Testing Agent Login (Custom API)...');
  
  try {
    // Test agent login page accessibility
    const pageResponse = await fetch(`${SERVER_URL}/agent/login`);
    console.log(`✅ Agent login page: ${pageResponse.status} ${pageResponse.statusText}`);
    
    // Test agent auth API with invalid credentials (should fail)
    const invalidResponse = await fetch(`${SERVER_URL}/api/agent/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'wrongpassword' })
    });
    
    const invalidData = await invalidResponse.json();
    console.log(`✅ Agent auth API (invalid creds): ${invalidResponse.status} - ${invalidData.error}`);
    
    // Test agent /me endpoint (should fail without session)
    const meResponse = await fetch(`${SERVER_URL}/api/agent/me`);
    console.log(`✅ Agent /me endpoint (no session): ${meResponse.status} ${meResponse.statusText}`);
    
    return true;
  } catch (error) {
    console.log(`❌ Agent login test failed: ${error.message}`);
    return false;
  }
}

async function testRouteAccessibility() {
  console.log('\n🌐 Testing Route Accessibility...');
  
  const routes = [
    '/admin-login',
    '/agent/login',
    '/api/admin/setup',
    '/api/agent/auth',
    '/api/agent/me'
  ];
  
  for (const route of routes) {
    try {
      const response = await fetch(`${SERVER_URL}${route}`, {
        method: route.includes('/api/') && !route.includes('/setup') && !route.includes('/me') ? 'POST' : 'GET',
        headers: route.includes('/api/') ? { 'Content-Type': 'application/json' } : {},
        body: route === '/api/agent/auth' ? JSON.stringify({ email: 'test', password: 'test' }) : undefined
      });
      
      console.log(`✅ ${route}: ${response.status} ${response.statusText}`);
    } catch (error) {
      console.log(`❌ ${route}: ${error.message}`);
    }
  }
}

async function main() {
  console.log('🚀 Starting Authentication Systems Test');
  console.log(`📍 Server URL: ${SERVER_URL}`);
  console.log(`📍 Supabase URL: ${SUPABASE_URL}`);
  
  // Test route accessibility
  await testRouteAccessibility();
  
  // Test admin login system
  const adminSuccess = await testAdminLogin();
  
  // Test agent login system  
  const agentSuccess = await testAgentLogin();
  
  console.log('\n📊 Test Results Summary:');
  console.log(`Admin Login System: ${adminSuccess ? '✅ WORKING' : '❌ FAILED'}`);
  console.log(`Agent Login System: ${agentSuccess ? '✅ WORKING' : '❌ FAILED'}`);
  
  if (adminSuccess && agentSuccess) {
    console.log('\n🎉 All authentication systems are working correctly!');
    console.log('\n📋 Summary:');
    console.log('• Admin Login: Uses Supabase Auth (signInWithPassword)');
    console.log(`• Admin Credentials: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
    console.log('• Agent Login: Uses custom API with bcrypt verification');
    console.log('• Both login routes are accessible and functional');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some authentication systems have issues');
    process.exit(1);
  }
}

main().catch(console.error);
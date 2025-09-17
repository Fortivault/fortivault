const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function resetAdminPassword() {
  try {
    const email = 'admin@fortivault.com'
    const newPassword = 'admin123456'
    
    console.log(`Resetting password for ${email}...`)
    
    // Update the user's password using admin API
    const { data, error } = await supabase.auth.admin.updateUserById(
      '2b8b8b8b-8b8b-8b8b-8b8b-8b8b8b8b8b8b', // We need to get the actual user ID
      { password: newPassword }
    )
    
    if (error) {
      console.error('Error updating password:', error)
      
      // Try to get the user first
      console.log('Getting user by email...')
      const { data: users, error: listError } = await supabase.auth.admin.listUsers()
      
      if (listError) {
        console.error('Error listing users:', listError)
        return
      }
      
      const adminUser = users.users.find(user => user.email === email)
      if (!adminUser) {
        console.error('Admin user not found')
        return
      }
      
      console.log('Found admin user:', adminUser.id)
      
      // Try again with the correct user ID
      const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
        adminUser.id,
        { password: newPassword }
      )
      
      if (updateError) {
        console.error('Error updating password:', updateError)
        return
      }
      
      console.log('Password updated successfully!')
      console.log(`New credentials: ${email} / ${newPassword}`)
    } else {
      console.log('Password updated successfully!')
      console.log(`New credentials: ${email} / ${newPassword}`)
    }
    
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

resetAdminPassword()
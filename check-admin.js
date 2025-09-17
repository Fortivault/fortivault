const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wwkywodvxlisifalcjyq.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3a3l3b2R2eGxpc2lmYWxjanlxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzQwMjMzMSwiZXhwIjoyMDcyOTc4MzMxfQ.etsjVtBucxQF9W7JknjX1viUsssSGiqCdBONgJ3Beh8';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

async function checkAdminUsers() {
  try {
    console.log('Checking admin users in auth.users...');
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
    
    if (usersError) {
      console.error('Error fetching users:', usersError);
      return;
    }
    
    console.log(`Total users: ${users.users.length}`);
    
    const adminUsers = users.users.filter(u => u.user_metadata?.role === 'admin');
    console.log(`Admin users: ${adminUsers.length}`);
    
    adminUsers.forEach(user => {
      console.log(`- ID: ${user.id}, Email: ${user.email}, Role: ${user.user_metadata?.role}`);
    });
    
    console.log('\nChecking admin_users table...');
    const { data: adminTable, error: adminError } = await supabase
      .from('admin_users')
      .select('*');
    
    if (adminError) {
      console.error('Error fetching admin_users table:', adminError);
    } else {
      console.log(`Admin users in table: ${adminTable.length}`);
      adminTable.forEach(admin => {
        console.log(`- ID: ${admin.id}, Email: ${admin.email}, Status: ${admin.status}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkAdminUsers();
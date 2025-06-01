import { createClient } from "@supabase/supabase-js";

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

// Validate environment variables
if (!supabaseUrl) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL');
  throw new Error('Missing environment variable NEXT_PUBLIC_SUPABASE_URL');
}

if (!supabaseAnonKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY');
  throw new Error('Missing environment variable NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Test database connection
const testDatabaseConnection = async () => {
  try {
    console.log('Testing database connection...');
    
    // First try a simple health check
    const { data: healthData, error: healthError } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true })
      .limit(0);

    if (healthError) {
      console.error('Database health check failed:', {
        error: healthError,
        code: healthError.code,
        message: healthError.message,
        details: healthError.details,
        hint: healthError.hint
      });
      return false;
    }

    console.log('Database connection successful:', {
      status: 'healthy',
      hasData: !!healthData
    });
    return true;
  } catch (err) {
    console.error('Database connection test failed:', {
      error: err,
      message: err.message,
      code: err.code,
      stack: err.stack
    });
    return false;
  }
};

// Run initial connection test
if (typeof window !== 'undefined') {
  testDatabaseConnection().then(isConnected => {
    console.log('Initial database connection test:', {
      success: isConnected,
      timestamp: new Date().toISOString()
    });
  });
}

// Export the test function for use in components
export { testDatabaseConnection };
import { supabase } from './supabase';

export async function checkTables() {
  try {
    // List of expected tables
    const expectedTables = [
      'profiles',
      'exam_sessions',
      'exam_violations',
      'admin_warnings',
      'admin_notifications',
      'behavior_logs'
    ];

    // Check each table's existence by attempting to select from it
    const tableChecks = await Promise.all(
      expectedTables.map(async (tableName) => {
        try {
          // Try to select a single row from the table
          const { error } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);

          // If we get a "relation does not exist" error, the table doesn't exist
          if (error && error.code === '42P01') {
            return { name: tableName, exists: false };
          }
          
          // If we get any other error, the table exists but might have other issues
          return { name: tableName, exists: true };
        } catch (err) {
          // If we get a "relation does not exist" error, the table doesn't exist
          if (err.message?.includes('relation') && err.message?.includes('does not exist')) {
            return { name: tableName, exists: false };
          }
          return { name: tableName, exists: true };
        }
      })
    );

    // Separate existing and missing tables
    const existingTables = tableChecks
      .filter(check => check.exists)
      .map(check => check.name);
    
    const missingTables = tableChecks
      .filter(check => !check.exists)
      .map(check => check.name);

    return {
      success: true,
      existingTables,
      missingTables,
      allTables: existingTables // We can only know about the tables we explicitly check
    };
  } catch (error) {
    console.error('Error in checkTables:', error);
    return {
      success: false,
      error: error.message,
      existingTables: [],
      missingTables: [],
      allTables: []
    };
  }
} 
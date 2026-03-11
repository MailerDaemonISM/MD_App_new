import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Replace these with your actual keys from Step 1
const supabaseUrl = 'https://txiizmhhspqwxvwfjeyd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4aWl6bWhoc3Bxd3h2d2ZqZXlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMTc0MzgsImV4cCI6MjA4NTU5MzQzOH0.uFwUPJoL_YIvHdW_fJFtNRQXiLIbWOASvOeEZ2TT6gg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
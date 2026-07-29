import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zufoxendmitbbuvyxzed.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1Zm94ZW5kbWl0YmJ1dnl4emVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzMDg2MjAsImV4cCI6MjEwMDg4NDYyMH0.bfz6AMLiIkUuSjHmeMZ8Sds5Be0J5j_rRjx-3IdFwd0';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.error('⚠️ Supabase URL / Anon Key belum dikonfigurasi di Environment Variables!');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
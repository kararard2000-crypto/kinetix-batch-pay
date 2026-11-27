import { createClient } from '@supabase/supabase-js';

// نستخدم الأسماء التي أضفتها في Vercel
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Supabase environment variables are missing! Check your Vercel settings.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
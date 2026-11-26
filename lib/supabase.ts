import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

// التحقق من وجود المتغيرات
if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Supabase environment variables are missing! Check your Vercel settings.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
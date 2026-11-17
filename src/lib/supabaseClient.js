import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://gtmvzklnghfibyuiginq.supabase.co';
const DEFAULT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0bXZ6a2xuZ2hmaWJ5dWlnaW5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI0NTc5OTEsImV4cCI6MjEwODAzMzk5MX0.sOJuMTyTnl-K94yHqTkYhyYV1cui6NyP5B7GsOMcSE0';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_KEY;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('tu-proyecto')) {
  console.warn('⚠️ Supabase URL o Anon Key no configuradas en .env');
}

const isTestEnv = Boolean(
  (typeof process !== 'undefined' && (process.env.VITEST || process.env.NODE_ENV === 'test')) ||
  import.meta.env?.MODE === 'test' ||
  import.meta.env?.TEST
);

export const isSupabaseConfigured = Boolean(
  !isTestEnv &&
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('tu-proyecto') &&
  !supabaseUrl.includes('placeholder')
);

export const supabase = createClient(
  isTestEnv ? 'https://placeholder.supabase.co' : supabaseUrl,
  isTestEnv ? 'placeholder-anon-key' : supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

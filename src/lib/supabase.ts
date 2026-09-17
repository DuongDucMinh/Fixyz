import { createClient } from '@supabase/supabase-js';

// Project credentials with fallback to ensure live connectivity even before dev server restart
const DEFAULT_URL = 'https://pfijtfgbrwipswzfpthq.supabase.co';
const DEFAULT_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmaWp0ZmdicndpcHN3emZwdGhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2MTQ1NzcsImV4cCI6MjEwNTE5MDU3N30.I-8e2aA6ah4qg4dPpN2B9e9nleicZY9bwO4cbIYPnpc';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_URL;
// Sanitize URL by trimming trailing /rest/v1 and slashes
const supabaseUrl = rawUrl.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_KEY).trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl && !supabaseUrl.includes('placeholder') && supabaseAnonKey && !supabaseAnonKey.includes('placeholder')
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

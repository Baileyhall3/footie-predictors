// Only used on server: cron jobs, background tasks
import { createClient } from '@supabase/supabase-js';

export const supabaseService = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

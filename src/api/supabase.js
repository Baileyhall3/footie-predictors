import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://suajexircjeawgougtdz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1YWpleGlyY2plYXdnb3VndGR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwMDc1MjcsImV4cCI6MjA1NjU4MzUyN30.gpM-6Lndd8CJ_vxuYbUFNDmLyoR_RHnT4kDwT8vN3aU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

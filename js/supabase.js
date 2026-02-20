import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = "https://wvfcnozpxgekyovylwjw.supabase.co"
const SUPABASE_ANON_KEY = 
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2ZmNub3pweGdla3lvdnlsd2p3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MjkzODQsImV4cCI6MjA4NzAwNTM4NH0.oDOznylKm_I1-RwHx7Xqk2LCy_tIbZzjgwhCEPeDhNw"

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export function formatMoney(n){
  return n.toLocaleString("vi-VN") + " đ"
}

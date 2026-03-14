import { createClient } from "@supabase/supabase-js";

// Các biến này sẽ được cấu hình trong frontend/.env.local
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Chỉ cảnh báo ở console cho môi trường dev
  console.warn(
    "[Supabase] Thiếu VITE_SUPABASE_URL hoặc VITE_SUPABASE_ANON_KEY ở frontend. Hãy cấu hình trong file .env.local."
  );
}

export const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;


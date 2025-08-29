// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const {
    VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY
} = import.meta.env;

// .env.local 파일에서 환경 변수를 가져옵니다.
const supabaseUrl = VITE_SUPABASE_URL
const supabaseAnonKey = VITE_SUPABASE_ANON_KEY

// Supabase 클라이언트를 생성합니다.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

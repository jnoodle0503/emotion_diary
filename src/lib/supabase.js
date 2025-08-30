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
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function deleteDiaryEntry(id) {
  const { error } = await supabase
    .from('diaries') // Changed from 'diary' to 'diaries' based on Calendar.jsx and WriteDiary.jsx
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting diary entry:', error);
    throw error;
  }
}

export async function getNegativeDiaryEntries(userId, offset, limit) {
  const NEGATIVE_EMOTIONS = ['슬픔', '우울', '분노', '불안', '지루함', '피곤함'];
  const { data, error } = await supabase
    .from('diaries')
    .select('*')
    .eq('user_id', userId)
    .overlaps('emotion', NEGATIVE_EMOTIONS) // Use 'overlaps' for array containment
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching negative diaries:', error);
    throw error;
  }
  return data;
}

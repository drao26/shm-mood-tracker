import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : new Proxy({} as SupabaseClient, {
      get: () => () => ({ data: null, error: { message: 'Supabase not configured' } }),
    });

export interface MoodEntry {
  id?: string;
  name: string;
  date: string;
  score: number;
  gratitude: string | null;
  rant: string | null;
  created_at?: string;
}

export async function upsertMood(entry: Omit<MoodEntry, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('moods')
    .upsert(entry, { onConflict: 'name,date' })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getTodayMood(name: string, date: string) {
  const { data, error } = await supabase
    .from('moods')
    .select('*')
    .eq('name', name)
    .eq('date', date)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as MoodEntry | null;
}

export async function getMoodsForUser(name: string) {
  const { data, error } = await supabase
    .from('moods')
    .select('*')
    .eq('name', name)
    .order('date', { ascending: true });

  if (error) throw error;
  return (data as MoodEntry[]) ?? [];
}

export async function getAllMoods() {
  const { data, error } = await supabase
    .from('moods')
    .select('*')
    .order('date', { ascending: true });

  if (error) throw error;
  return (data as MoodEntry[]) ?? [];
}

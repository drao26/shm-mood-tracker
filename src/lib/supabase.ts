import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ThemeSummary } from './themes';

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

export async function getMoodsForDate(date: string) {
  const { data, error } = await supabase
    .from('moods')
    .select('*')
    .eq('date', date);

  if (error) throw error;
  return (data as MoodEntry[]) ?? [];
}

export async function getMoodsForMonth(year: number, month: number) {
  const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const endDay = new Date(year, month + 1, 0).getDate();
  const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`;

  const { data, error } = await supabase
    .from('moods')
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });

  if (error) throw error;
  return (data as MoodEntry[]) ?? [];
}

export async function getCachedThemes(
  name: string,
): Promise<{ themes: ThemeSummary[]; generatedAt: string } | null> {
  const { data, error } = await supabase
    .from('theme_summaries')
    .select('themes, generated_at')
    .eq('name', name)
    .eq('period', 'all-time')
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data ? { themes: data.themes as ThemeSummary[], generatedAt: data.generated_at as string } : null;
}

export async function refreshThemesAI(name: string): Promise<ThemeSummary[]> {
  const { data, error } = await supabase.functions.invoke('extract-themes', {
    body: { name },
  });
  if (error) throw error;
  return (data as { themes?: ThemeSummary[] }).themes ?? [];
}

export const REACTION_EMOJIS = ['🫂', '💖', '😭', '🔥'] as const;
export type ReactionEmoji = typeof REACTION_EMOJIS[number];

export interface Reaction {
  id?: string;
  entry_id: string;
  reactor_user_id: string;
  emoji: string;
  created_at?: string;
}

export async function getReactionsForEntry(entryId: string) {
  const { data, error } = await supabase
    .from('reactions')
    .select('*')
    .eq('entry_id', entryId);

  if (error) throw error;
  return (data as Reaction[]) ?? [];
}

export async function addReaction(entryId: string, reactorUserId: string, emoji: string) {
  const { error } = await supabase
    .from('reactions')
    .insert({ entry_id: entryId, reactor_user_id: reactorUserId, emoji });

  // ignore duplicate-key errors (unique constraint), treat as already-present
  if (error && error.code !== '23505') throw error;
}

export async function removeReaction(entryId: string, reactorUserId: string, emoji: string) {
  const { error } = await supabase
    .from('reactions')
    .delete()
    .eq('entry_id', entryId)
    .eq('reactor_user_id', reactorUserId)
    .eq('emoji', emoji);

  if (error) throw error;
}


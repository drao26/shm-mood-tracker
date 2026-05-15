import { useEffect, useState } from 'react';
import Heatmap from '../components/Heatmap';
import ThemeChips from '../components/ThemeChips';
import TopMoments from '../components/TopMoments';
import Button95 from '../components/Button95';
import { getMoodsForUser, isSupabaseConfigured, MoodEntry, getCachedThemes, refreshThemesAI } from '../lib/supabase';
import { ThemeSummary, extractThemes } from '../lib/themes';

interface MyHeatmapsProps {
  overrideName?: string;
}

const STALE_DAYS = 7;

function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
}

export default function MyHeatmaps({ overrideName }: MyHeatmapsProps) {
  const name = overrideName ?? localStorage.getItem('shm-user');
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [themes, setThemes] = useState<ThemeSummary[]>([]);
  const [themesGeneratedAt, setThemesGeneratedAt] = useState<string | null>(null);
  const [themesRefreshing, setThemesRefreshing] = useState(false);
  const [themesError, setThemesError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadMoods() {
      if (!name) {
        setLoading(false);
        return;
      }

      if (!isSupabaseConfigured) {
        setError('supabase is not configured');
        setLoading(false);
        return;
      }

      try {
        const data = await getMoodsForUser(name);
        if (!cancelled) {
          setMoods(data);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'failed to load moods');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadMoods();

    return () => {
      cancelled = true;
    };
  }, [name]);

  // Load themes: try cache first, fall back to rule-based
  useEffect(() => {
    let cancelled = false;

    async function loadThemes() {
      if (!name || !isSupabaseConfigured) return;

      try {
        const cached = await getCachedThemes(name);
        if (!cancelled) {
          if (cached) {
            setThemes(cached.themes);
            setThemesGeneratedAt(cached.generatedAt);
          }
          // rule-based fallback happens after moods load (see below)
        }
      } catch {
        // silently ignore — rule-based fallback kicks in after moods load
      }
    }

    loadThemes();
    return () => { cancelled = true; };
  }, [name]);

  // Apply rule-based fallback once moods are loaded and no cache was found
  useEffect(() => {
    if (!loading && themes.length === 0 && moods.length > 0) {
      setThemes(extractThemes(moods));
    }
  }, [loading, moods, themes.length]);

  async function handleRefresh() {
    if (!name) return;
    setThemesRefreshing(true);
    setThemesError(null);
    try {
      const fresh = await refreshThemesAI(name);
      setThemes(fresh);
      setThemesGeneratedAt(new Date().toISOString());
    } catch (e) {
      setThemesError(e instanceof Error ? e.message : 'refresh failed');
    } finally {
      setThemesRefreshing(false);
    }
  }

  if (loading) {
    return <p className="text-[11px] text-[var(--text)]">loading...</p>;
  }

  if (!name) {
    return <p className="text-[11px] text-[var(--text)]">please pick a user first</p>;
  }

  if (error) {
    return <p className="text-[11px] text-[var(--text)]">{error}</p>;
  }

  const heatmapEntries = moods.map((m) => ({ date: m.date, score: m.score }));

  const staleDays = themesGeneratedAt ? daysSince(themesGeneratedAt) : null;
  const isStale = staleDays !== null && staleDays >= STALE_DAYS;

  return (
    <div className="space-y-3">
      <div>
        <p className="text-[11px] font-bold text-[var(--text)] mb-1">{name}'s mood heatmap</p>
        <Heatmap entries={heatmapEntries} />
      </div>

      <div>
        <div className="flex items-center gap-2 mb-1">
          <p className="text-[11px] font-bold text-[var(--text)]">themes</p>
          <Button95
            onClick={handleRefresh}
            disabled={themesRefreshing}
            className="h-[18px] px-2 text-[10px]"
          >
            {themesRefreshing ? 'thinking...' : '✨ refresh themes'}
          </Button95>
          {themesGeneratedAt && !isStale && (
            <span className="text-[10px] text-[var(--accent)]">
              updated {staleDays === 0 ? 'today' : `${staleDays}d ago`}
            </span>
          )}
          {isStale && (
            <span className="text-[10px] text-[var(--accent)]">
              (themes from {staleDays}d ago)
            </span>
          )}
        </div>
        {themesError && (
          <p className="text-[11px] text-[var(--accent)] mb-1">{themesError}</p>
        )}
        <ThemeChips themes={themes} moods={moods} />
      </div>

      <TopMoments moods={moods} />
    </div>
  );
}


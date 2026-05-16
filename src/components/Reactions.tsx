import { useEffect, useMemo, useState } from 'react';
import {
  REACTION_EMOJIS,
  Reaction,
  getReactionsForEntry,
  addReaction,
  removeReaction,
} from '../lib/supabase';

interface ReactionsProps {
  entryId: string;
  currentUser: string;
  /** When true, hide the interactive buttons and only display reactor names. */
  readOnly?: boolean;
}

// Soft pastel highlight colors per emoji (used when current user has reacted).
const PASTEL_BG: Record<string, string> = {
  '🫂': '#ffe4ec', // soft pink
  '💖': '#ffd6e8', // pastel rose
  '😭': '#dce6ff', // pastel periwinkle
  '🔥': '#ffe2c2', // pastel peach
};

export default function Reactions({ entryId, currentUser, readOnly = false }: ReactionsProps) {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getReactionsForEntry(entryId)
      .then((data) => {
        if (!cancelled) setReactions(data);
      })
      .catch((err) => {
        console.error('[reactions] failed to load', err);
        if (!cancelled) {
          setReactions([]);
          setError(err?.message ?? 'failed to load reactions');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [entryId]);

  async function toggle(emoji: string) {
    if (pending || readOnly) return;
    const hasMine = reactions.some(
      (r) => r.emoji === emoji && r.reactor_user_id === currentUser,
    );
    setPending(emoji);
    setError(null);
    // optimistic update
    const prev = reactions;
    if (hasMine) {
      setReactions(prev.filter((r) => !(r.emoji === emoji && r.reactor_user_id === currentUser)));
    } else {
      setReactions([
        ...prev.filter((r) => !(r.emoji === emoji && r.reactor_user_id === currentUser)),
        { entry_id: entryId, reactor_user_id: currentUser, emoji },
      ]);
    }
    try {
      if (hasMine) {
        await removeReaction(entryId, currentUser, emoji);
      } else {
        await addReaction(entryId, currentUser, emoji);
      }
      // re-sync with server so we display the canonical list (incl. other reactors)
      try {
        const fresh = await getReactionsForEntry(entryId);
        setReactions(fresh);
      } catch (syncErr) {
        console.warn('[reactions] resync failed', syncErr);
      }
    } catch (err: any) {
      console.error('[reactions] toggle failed', err);
      setReactions(prev);
      setError(err?.message ?? 'could not save reaction');
    } finally {
      setPending(null);
    }
  }

  const grouped = useMemo(() => {
    const byEmoji: Record<string, string[]> = {};
    for (const r of reactions) {
      (byEmoji[r.emoji] ??= []).push(r.reactor_user_id);
    }
    return byEmoji;
  }, [reactions]);

  const anyReactions = reactions.length > 0;

  return (
    <div className="space-y-1 pt-1" aria-label="reactions">
      {!readOnly && (
        <div className="flex flex-wrap gap-1">
          {REACTION_EMOJIS.map((emoji) => {
            const reactors = grouped[emoji] ?? [];
            const count = reactors.length;
            const mine = reactors.includes(currentUser);
            const title = count > 0 ? `${emoji} ${reactors.join(', ')}` : `react with ${emoji}`;
            return (
              <button
                key={emoji}
                type="button"
                onClick={() => toggle(emoji)}
                disabled={loading || pending === emoji}
                aria-pressed={mine}
                aria-label={title}
                title={title}
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[11px] rounded-full border transition-colors ${
                  mine
                    ? 'border-[var(--accent)] shadow-sm'
                    : 'border-[var(--chrome-dark)] bg-[var(--chrome)] hover:bg-[var(--chrome-light)]'
                } disabled:opacity-60`}
                style={mine ? { backgroundColor: PASTEL_BG[emoji] } : undefined}
              >
                <span aria-hidden="true">{emoji}</span>
                {count > 0 && (
                  <span className="text-[10px] text-[var(--text)] tabular-nums">{count}</span>
                )}
              </button>
            );
          })}
        </div>
      )}
      {readOnly && !loading && !anyReactions && (
        <p className="text-[10px] text-[var(--text)] opacity-70">no reactions yet</p>
      )}
      {anyReactions && (
        <ul className="text-[10px] text-[var(--text)] space-y-0.5">
          {REACTION_EMOJIS.map((emoji) => {
            const reactors = grouped[emoji];
            if (!reactors || reactors.length === 0) return null;
            return (
              <li key={emoji} className="flex items-start gap-1">
                <span aria-hidden="true">{emoji}</span>
                <span>{reactors.join(', ')}</span>
              </li>
            );
          })}
        </ul>
      )}
      {error && (
        <p className="text-[10px] text-red-700" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

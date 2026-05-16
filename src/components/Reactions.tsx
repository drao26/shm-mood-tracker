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
}

// Soft pastel highlight colors per emoji (used when current user has reacted).
const PASTEL_BG: Record<string, string> = {
  '🫂': '#ffe4ec', // soft pink
  '💖': '#ffd6e8', // pastel rose
  '😭': '#dce6ff', // pastel periwinkle
  '🔥': '#ffe2c2', // pastel peach
};

export default function Reactions({ entryId, currentUser }: ReactionsProps) {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getReactionsForEntry(entryId)
      .then((data) => {
        if (!cancelled) setReactions(data);
      })
      .catch(() => {
        if (!cancelled) setReactions([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [entryId]);

  async function toggle(emoji: string) {
    if (pending) return;
    const hasMine = reactions.some(
      (r) => r.emoji === emoji && r.reactor_user_id === currentUser,
    );
    setPending(emoji);
    // optimistic update
    const prev = reactions;
    if (hasMine) {
      setReactions(prev.filter((r) => !(r.emoji === emoji && r.reactor_user_id === currentUser)));
    } else {
      setReactions([
        ...prev,
        { entry_id: entryId, reactor_user_id: currentUser, emoji },
      ]);
    }
    try {
      if (hasMine) {
        await removeReaction(entryId, currentUser, emoji);
      } else {
        await addReaction(entryId, currentUser, emoji);
      }
    } catch {
      // rollback on failure
      setReactions(prev);
    } finally {
      setPending(null);
    }
  }

  const summary = useMemo(() => {
    const counts: Record<string, number> = {};
    const mine: Record<string, boolean> = {};
    for (const r of reactions) {
      counts[r.emoji] = (counts[r.emoji] ?? 0) + 1;
      if (r.reactor_user_id === currentUser) mine[r.emoji] = true;
    }
    return { counts, mine };
  }, [reactions, currentUser]);

  return (
    <div className="flex flex-wrap gap-1 pt-1" aria-label="reactions">
      {REACTION_EMOJIS.map((emoji) => {
        const count = summary.counts[emoji] ?? 0;
        const mine = !!summary.mine[emoji];
        return (
          <button
            key={emoji}
            type="button"
            onClick={() => toggle(emoji)}
            disabled={loading || pending === emoji}
            aria-pressed={mine}
            aria-label={`react with ${emoji}`}
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
  );
}

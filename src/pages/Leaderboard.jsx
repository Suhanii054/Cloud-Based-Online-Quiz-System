import React, { useEffect, useState, useCallback } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import CloudActivityPanel from '../components/CloudActivityPanel';

// ── Utility: async sleep ──────────────────────────────────────────────────────
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// Medal icons for top 3
const MEDALS = ['🥇', '🥈', '🥉'];

const Leaderboard = () => {
  const { user } = useAuth();

  const [players, setPlayers]     = useState([]);   // sorted user list
  const [loading, setLoading]     = useState(true);
  const [cloudLogs, setCloudLogs] = useState([]);

  const addLog = useCallback((message, status, ts = '') => {
    setCloudLogs((prev) => [...prev, { message, status, ts }]);
  }, []);

  // ── Fetch all users from Firestore ────────────────────────────────────────
  useEffect(() => {
    const fetchLeaderboard = async () => {
      const t0 = Date.now();

      addLog('🔄 Querying Firebase Firestore…', 'pending', '+0ms');

      try {
        // Query users collection, sorted server-side by bestScore descending
        const q    = query(collection(db, 'users'), orderBy('bestScore', 'desc'));
        const snap = await getDocs(q);

        const users = snap.docs.map((d, idx) => ({
          uid:           d.id,
          rank:          idx + 1,
          username:      d.data().username  || 'Unknown',
          bestScore:     d.data().bestScore || 0,
          totalAttempts: d.data().totalAttempts || 0,
        }));

        addLog(`✅ Retrieved ${users.length} users from cloud database`, 'success', `+${Date.now() - t0}ms`);

        await delay(400);
        addLog('🧮 Sorting by best score…', 'pending', `+${Date.now() - t0}ms`);

        await delay(400);
        addLog('✅ Leaderboard ready', 'success', `+${Date.now() - t0}ms`);

        setPlayers(users);
      } catch (err) {
        console.error('Leaderboard fetch error:', err);
        addLog('❌ Failed to load leaderboard', 'error', `+${Date.now() - t0}ms`);
      }

      setLoading(false);
    };

    fetchLeaderboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 bg-background min-h-screen py-10 px-6">
      <div className="max-w-5xl mx-auto">

        {/* Page title */}
        <h1 className="text-3xl font-bold text-textMain mb-6 flex items-center gap-2">
          <span className="text-yellow-400">🏆</span> Leaderboard
        </h1>

        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ── Leaderboard table ── */}
          <div className="flex-1 bg-surface border border-primary/20 rounded-2xl shadow-neon-card p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-48 gap-3">
                <Loader2 size={32} className="text-primary animate-spin" />
                <p className="text-textMuted text-sm">Loading rankings…</p>
              </div>
            ) : players.length === 0 ? (
              <p className="text-textMuted text-sm text-center py-12">No players yet. Be the first!</p>
            ) : (
              <>
                {/* Header row */}
                <div className="grid grid-cols-[40px_1fr_80px_80px] gap-3 text-xs text-textMuted uppercase tracking-wider mb-3 px-2">
                  <span>Rank</span>
                  <span>Player</span>
                  <span className="text-right">Best</span>
                  <span className="text-right">Plays</span>
                </div>

                <div className="space-y-2">
                  {players.map((p) => {
                    const isCurrentUser = p.uid === user?.uid;
                    const medal         = p.rank <= 3 ? MEDALS[p.rank - 1] : null;

                    return (
                      <div
                        key={p.uid}
                        className={`grid grid-cols-[40px_1fr_80px_80px] gap-3 items-center px-3 py-3 rounded-xl border transition-all
                          ${isCurrentUser
                            ? 'bg-primary/10 border-primary/40 shadow-neon-btn'
                            : 'bg-inputBg/40 border-primary/10 hover:border-primary/25'
                          }`}
                      >
                        {/* Rank / medal */}
                        <span className={`text-sm font-bold text-center ${p.rank <= 3 ? '' : 'text-textMuted'}`}>
                          {medal || p.rank}
                        </span>

                        {/* Avatar + username */}
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                            ${isCurrentUser ? 'bg-primary/30 border border-primary text-primary' : 'bg-primary/15 border border-primary/30 text-primary'}`}>
                            {p.username.slice(0, 2).toUpperCase()}
                          </div>
                          <span className={`text-sm font-medium truncate ${isCurrentUser ? 'text-primary' : 'text-textMain'}`}>
                            {p.username}
                            {isCurrentUser && <span className="ml-1 text-[10px] text-primary/70">(you)</span>}
                          </span>
                        </div>

                        {/* Best score */}
                        <span className={`text-sm font-bold text-right ${isCurrentUser ? 'text-primary' : 'text-textMain'}`}>
                          {p.bestScore}
                        </span>

                        {/* Attempts */}
                        <span className="text-xs text-textMuted text-right">{p.totalAttempts}×</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* ── Cloud Activity Panel ── */}
          <div className="w-full lg:w-72 lg:sticky lg:top-6">
            <CloudActivityPanel logs={cloudLogs} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;

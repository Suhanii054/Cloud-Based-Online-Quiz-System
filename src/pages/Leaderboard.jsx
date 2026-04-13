import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Trophy, Loader2 } from 'lucide-react';

const formatDate = (ts) => {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const Leaderboard = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'leaderboard'), (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      // Sort: bestScore desc, tiebreak totalAttempts asc
      data.sort((a, b) => {
        if (b.bestScore !== a.bestScore) return b.bestScore - a.bestScore;
        return (a.totalAttempts || 0) - (b.totalAttempts || 0);
      });
      setEntries(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const top10 = entries.slice(0, 10);
  const userRank = entries.findIndex((e) => e.id === user?.uid) + 1; // 1-based, 0 = not found
  const userEntry = entries.find((e) => e.id === user?.uid);
  const userInTop10 = userRank >= 1 && userRank <= 10;

  const rankColor = (rank) => {
    if (rank === 1) return 'text-yellow-400';
    if (rank === 2) return 'text-gray-300';
    if (rank === 3) return 'text-amber-600';
    return 'text-textMuted';
  };

  const renderRow = (entry, rank, isCurrentUser) => (
    <tr
      key={entry.id}
      className={`border-b border-primary/10 transition-colors ${
        isCurrentUser
          ? 'bg-primary/10 font-bold'
          : rank % 2 === 0
          ? 'bg-surface/60'
          : 'bg-inputBg/30'
      } ${rank === 1 ? 'border-l-2 border-l-yellow-400' : ''}`}
    >
      <td className={`px-4 py-3 text-sm font-bold w-12 ${rankColor(rank)}`}>
        {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
      </td>
      <td className="px-4 py-3 text-sm text-textMain">
        {entry.username || '—'}
        {isCurrentUser && <span className="ml-2 text-xs text-primary font-normal">(you)</span>}
      </td>
      <td className="px-4 py-3 text-sm text-primary font-semibold">{entry.bestScore ?? '—'} / 10</td>
      <td className="px-4 py-3 text-sm text-textMuted">{entry.totalAttempts ?? 0}</td>
      <td className="px-4 py-3 text-sm text-textMuted">{formatDate(entry.lastPlayed)}</td>
    </tr>
  );

  return (
    <div className="flex-1 bg-background min-h-screen py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Trophy size={26} className="text-yellow-400" />
          <h1 className="text-3xl font-bold text-textMain">Leaderboard</h1>
        </div>
        <p className="text-textMuted text-sm -mt-2">Live rankings · updates in real time</p>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={32} className="text-primary animate-spin" />
          </div>
        ) : entries.length === 0 ? (
          <div className="bg-surface rounded-2xl border border-primary/20 shadow-neon-card p-10 text-center text-textMuted">
            No scores yet. Be the first to play!
          </div>
        ) : (
          <div className="bg-surface rounded-2xl border border-primary/20 shadow-neon-card overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-primary/20 bg-inputBg/50">
                  <th className="px-4 py-3 text-xs text-textMuted uppercase tracking-wider w-12">Rank</th>
                  <th className="px-4 py-3 text-xs text-textMuted uppercase tracking-wider">Username</th>
                  <th className="px-4 py-3 text-xs text-textMuted uppercase tracking-wider">Best Score</th>
                  <th className="px-4 py-3 text-xs text-textMuted uppercase tracking-wider">Attempts</th>
                  <th className="px-4 py-3 text-xs text-textMuted uppercase tracking-wider">Last Played</th>
                </tr>
              </thead>
              <tbody>
                {top10.map((entry, i) =>
                  renderRow(entry, i + 1, entry.id === user?.uid)
                )}
              </tbody>
            </table>

            {/* Current user outside top 10 */}
            {userEntry && !userInTop10 && (
              <>
                <div className="px-4 py-2 border-t border-primary/20 bg-inputBg/60 text-xs text-textMuted flex items-center gap-2">
                  <span className="flex-1 border-t border-primary/15" />
                  <span>Your rank: #{userRank}</span>
                  <span className="flex-1 border-t border-primary/15" />
                </div>
                <table className="w-full text-left">
                  <tbody>
                    {renderRow(userEntry, userRank, true)}
                  </tbody>
                </table>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default Leaderboard;

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, getDoc, orderBy, query, limit } from 'firebase/firestore';
import { Play, Trophy, Star, TrendingUp, Loader2 } from 'lucide-react';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

const rankColors = ['text-yellow-400', 'text-gray-300', 'text-amber-600'];

const Home = () => {
  const { user, username } = useAuth();
  const navigate = useNavigate();

  // Current user's real stats
  const [bestScore, setBestScore]         = useState(null);
  const [totalAttempts, setTotalAttempts] = useState(null);
  const [globalRank, setGlobalRank]       = useState(null);

  // Real top-5 leaderboard
  const [topPlayers, setTopPlayers]       = useState([]);
  const [statsLoading, setStatsLoading]   = useState(true);

  // ── Fetch real data from Firestore ────────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        // 1. Current user's profile doc
        const userSnap = await getDoc(doc(db, 'users', user.uid));
        if (userSnap.exists()) {
          const data = userSnap.data();
          setBestScore(data.bestScore ?? 0);
          setTotalAttempts(data.totalAttempts ?? 0);
        }

        // 2. All users sorted by bestScore to compute rank + top-5 preview
        const q    = query(collection(db, 'users'), orderBy('bestScore', 'desc'), limit(10));
        const snap = await getDocs(q);

        const all = snap.docs.map((d, idx) => ({
          uid:      d.id,
          rank:     idx + 1,
          username: d.data().username  || 'Unknown',
          score:    d.data().bestScore || 0,
        }));

        // Top 5 for the preview card
        setTopPlayers(all.slice(0, 5));

        // Find this user's rank (may be beyond the first 10, so fall back to a full scan if needed)
        const myEntry = all.find((u) => u.uid === user.uid);
        if (myEntry) {
          setGlobalRank(myEntry.rank);
        } else {
          // User not in top 10 — do a full count to find rank
          const allSnap = await getDocs(query(collection(db, 'users'), orderBy('bestScore', 'desc')));
          const pos = allSnap.docs.findIndex((d) => d.id === user.uid);
          setGlobalRank(pos >= 0 ? pos + 1 : null);
        }
      } catch (err) {
        console.error('Home data fetch error:', err);
      }

      setStatsLoading(false);
    };

    fetchData();
  }, [user]);

  // ── Stats row config ──────────────────────────────────────────────────────
  const stats = [
    {
      label: 'Best Score',
      value: statsLoading ? '…' : (bestScore ?? '—'),
      icon:  <Star size={20} className="text-yellow-400" />,
      color: 'text-yellow-400',
    },
    {
      label: 'Total Attempts',
      value: statsLoading ? '…' : (totalAttempts ?? 0),
      icon:  <TrendingUp size={20} className="text-secondary" />,
      color: 'text-secondary',
    },
    {
      label: 'Global Rank',
      value: statsLoading ? '…' : (globalRank ? `#${globalRank}` : '—'),
      icon:  <Trophy size={20} className="text-primary" />,
      color: 'text-primary',
    },
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 bg-background min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">

        {/* Hero */}
        <div className="relative bg-surface rounded-2xl border border-primary/20 shadow-neon-card p-8 overflow-hidden">
          {/* Background decoration */}
          <div className="absolute -top-12 -right-12 w-56 h-56 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <p className="text-textMuted text-sm mb-1 flex items-center gap-1.5">
                <span className="text-primary">⚡</span>
                Ready to play?
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold text-textMain">
                Welcome back,{' '}
                <span className="text-primary">{username || 'Quizzer'}</span> 👋
              </h1>
              <p className="text-textMuted mt-2 max-w-md">
                Test your knowledge, climb the leaderboard, and beat your personal best.
              </p>
            </div>

            <button
              id="start-quiz-btn"
              onClick={() => navigate('/quiz')}
              className="flex items-center gap-2 bg-primary hover:bg-primary/85 text-white font-bold
                px-7 py-3 rounded-xl text-base transition-all duration-200 hover:shadow-neon-btn whitespace-nowrap"
            >
              <Play size={18} fill="currentColor" />
              Start Quiz
            </button>
          </div>
        </div>

        {/* Stats row — real Firestore data */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-surface border border-primary/15 rounded-xl p-5 flex items-center gap-4 shadow-neon-card"
            >
              <div className="p-2 rounded-lg bg-surface border border-primary/10">{stat.icon}</div>
              <div>
                <p className="text-textMuted text-xs uppercase tracking-wider">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Leaderboard Preview — real Firestore data */}
        <div className="bg-surface rounded-2xl border border-primary/20 shadow-neon-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-textMain flex items-center gap-2">
              <Trophy size={18} className="text-yellow-400" />
              Top Players
            </h2>
            <button
              onClick={() => navigate('/leaderboard')}
              className="text-xs text-primary hover:text-secondary transition-colors"
            >
              View all →
            </button>
          </div>

          {statsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 size={24} className="text-primary animate-spin" />
            </div>
          ) : topPlayers.length === 0 ? (
            <p className="text-textMuted text-sm text-center py-6 italic">No players yet.</p>
          ) : (
            <div className="space-y-2">
              {topPlayers.map((entry) => {
                const isMe = entry.uid === user?.uid;
                return (
                  <div
                    key={entry.uid}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all
                      ${entry.rank === 1 ? 'bg-yellow-400/5 border border-yellow-400/20'
                        : isMe ? 'bg-primary/10 border border-primary/30'
                        : 'bg-inputBg/50 border border-primary/10 hover:border-primary/25'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-bold w-5 text-center ${rankColors[entry.rank - 1] || 'text-textMuted'}`}>
                        {entry.rank}
                      </span>
                      <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary">
                        {entry.username.slice(0, 2).toUpperCase()}
                      </div>
                      <span className={`text-sm font-medium ${isMe ? 'text-primary' : 'text-textMain'}`}>
                        {entry.username}
                        {isMe && <span className="ml-1 text-[10px] text-primary/70">(you)</span>}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-primary">{entry.score} pts</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Home;

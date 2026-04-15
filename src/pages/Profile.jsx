import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { Loader2, Play, Star, TrendingUp, Trophy, Hash } from 'lucide-react';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [profile, setProfile]   = useState(null);   // Firestore user doc data
  const [rank, setRank]         = useState(null);    // global rank (1-based)
  const [loading, setLoading]   = useState(true);

  // ── Fetch profile + calculate rank ────────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        // 1. Get this user's doc
        const userSnap = await getDoc(doc(db, 'users', user.uid));
        if (!userSnap.exists()) { setLoading(false); return; }

        const data = userSnap.data();
        setProfile(data);

        // 2. Fetch all users to compute rank
        const allSnap = await getDocs(collection(db, 'users'));
        const sorted  = allSnap.docs
          .map((d) => ({ uid: d.id, bestScore: d.data().bestScore || 0 }))
          .sort((a, b) => b.bestScore - a.bestScore);

        const pos = sorted.findIndex((u) => u.uid === user.uid);
        setRank(pos >= 0 ? pos + 1 : null);
      } catch (err) {
        console.error('Profile fetch error:', err);
      }

      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  // ── Format member-since date ──────────────────────────────────────────────
  const memberSince = profile?.createdAt?.toDate
    ? profile.createdAt.toDate().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '—';

  // ── Average score ─────────────────────────────────────────────────────────
  const avgScore = profile?.totalAttempts > 0
    ? (profile.bestScore / profile.totalAttempts).toFixed(1)
    : '—';

  // ── Stats grid config ─────────────────────────────────────────────────────
  const stats = [
    { label: 'Best Score',     value: profile?.bestScore ?? 0, icon: <Star size={18} className="text-yellow-400" />,    color: 'text-yellow-400'  },
    { label: 'Total Attempts', value: profile?.totalAttempts ?? 0, icon: <TrendingUp size={18} className="text-secondary" />, color: 'text-secondary'   },
    { label: 'Global Rank',    value: rank ? `#${rank}` : '—', icon: <Trophy size={18} className="text-primary" />,     color: 'text-primary'     },
    { label: 'Avg Score',      value: avgScore, icon: <Hash size={18} className="text-success" />,       color: 'text-success'     },
  ];

  // ── Render: loading ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex-1 bg-background min-h-screen flex items-center justify-center">
        <Loader2 size={40} className="text-primary animate-spin" />
      </div>
    );
  }

  // ── Render: profile not found ─────────────────────────────────────────────
  if (!profile) {
    return (
      <div className="flex-1 bg-background min-h-screen flex items-center justify-center px-6">
        <div className="bg-surface border border-danger/30 rounded-2xl shadow-neon-card p-8 text-center max-w-md">
          <p className="text-danger font-semibold">Profile not found.</p>
        </div>
      </div>
    );
  }

  const initials = profile.username ? profile.username.slice(0, 2).toUpperCase() : '?';

  // ── Render: full profile ──────────────────────────────────────────────────
  return (
    <div className="flex-1 bg-background min-h-screen py-10 px-6">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Avatar + info card */}
        <div className="bg-surface border border-primary/20 rounded-2xl shadow-neon-card p-6 flex items-center gap-5">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary/50 flex items-center justify-center text-xl font-black text-primary flex-shrink-0">
            {initials}
          </div>

          {/* Info */}
          <div>
            <h1 className="text-2xl font-bold text-textMain">{profile.username}</h1>
            <p className="text-textMuted text-sm">{profile.email}</p>
            <p className="text-textMuted text-xs mt-1">Member since {memberSince}</p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-surface border border-primary/15 rounded-xl p-5 flex items-center gap-4 shadow-neon-card">
              <div className="p-2 rounded-lg bg-surface border border-primary/10 flex-shrink-0">{s.icon}</div>
              <div>
                <p className="text-textMuted text-xs uppercase tracking-wider">{s.label}</p>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Start quiz button */}
        <button
          onClick={() => navigate('/quiz')}
          className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/85 text-white font-bold
            py-3 rounded-xl transition-all duration-200 hover:shadow-neon-btn text-sm"
        >
          <Play size={16} fill="currentColor" />
          Start New Quiz
        </button>

      </div>
    </div>
  );
};

export default Profile;

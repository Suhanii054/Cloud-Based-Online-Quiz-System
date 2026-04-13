import React, { useState, useEffect } from 'react';
import { collection, doc, getDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Star, TrendingUp, Target, Loader2, CalendarDays } from 'lucide-react';

const formatTime = (secs) => {
  if (secs == null) return '—';
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const formatDate = (ts) => {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const scoreColor = (score) => {
  if (score >= 7) return 'text-green-400';
  if (score >= 4) return 'text-amber-400';
  return 'text-danger';
};

const Profile = () => {
  const { user, username } = useAuth();
  const [userData, setUserData] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const userSnap = await getDoc(doc(db, 'users', user.uid));
        if (userSnap.exists()) setUserData(userSnap.data());

        const q = query(
          collection(db, 'sessions'),
          where('userId', '==', user.uid),
          orderBy('submittedAt', 'desc'),
          limit(10)
        );
        const snap = await getDocs(q);
        setSessions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error('Error fetching profile data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const initials = username ? username.slice(0, 2).toUpperCase() : '?';
  const bestScore = userData?.bestScore ?? 0;
  const totalAttempts = userData?.totalAttempts ?? 0;
  const accuracy = totalAttempts > 0 ? Math.round((bestScore / 10) * 100) : 0;

  const stats = [
    { label: 'Best Score', value: `${bestScore} / 10`, icon: <Star size={18} className="text-yellow-400" />, color: 'text-yellow-400' },
    { label: 'Total Attempts', value: totalAttempts, icon: <TrendingUp size={18} className="text-secondary" />, color: 'text-secondary' },
    { label: 'Accuracy', value: `${accuracy}%`, icon: <Target size={18} className="text-primary" />, color: 'text-primary' },
  ];

  return (
    <div className="flex-1 bg-background min-h-screen py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Avatar + info */}
        <div className="bg-surface rounded-2xl border border-primary/20 shadow-neon-card p-6 flex items-center gap-5">
          <div
            className="w-20 h-20 rounded-full bg-primary flex items-center justify-center
              text-2xl font-extrabold text-white flex-shrink-0"
            style={{ boxShadow: '0 0 20px rgba(168,85,247,0.5)' }}
          >
            {initials}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-textMain">{username || 'User'}</h1>
            <p className="text-textMuted text-sm mt-0.5">{user?.email}</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-surface rounded-xl border border-primary/15 shadow-neon-card p-4 flex flex-col items-center gap-2 text-center"
            >
              {s.icon}
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-textMuted text-xs uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Quiz history */}
        <div className="bg-surface rounded-2xl border border-primary/20 shadow-neon-card overflow-hidden">
          <div className="px-5 py-4 border-b border-primary/15 flex items-center gap-2">
            <CalendarDays size={18} className="text-primary" />
            <h2 className="text-base font-bold text-textMain">Quiz History</h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 size={28} className="text-primary animate-spin" />
            </div>
          ) : sessions.length === 0 ? (
            <p className="text-textMuted text-sm text-center py-10 italic">No quiz attempts yet.</p>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-inputBg/50 border-b border-primary/10">
                  <th className="px-5 py-3 text-xs text-textMuted uppercase tracking-wider">Date</th>
                  <th className="px-5 py-3 text-xs text-textMuted uppercase tracking-wider">Score</th>
                  <th className="px-5 py-3 text-xs text-textMuted uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s, i) => (
                  <tr
                    key={s.id}
                    className={`border-b border-primary/10 ${i % 2 === 0 ? 'bg-surface/60' : 'bg-inputBg/20'}`}
                  >
                    <td className="px-5 py-3 text-sm text-textMuted">{formatDate(s.submittedAt)}</td>
                    <td className={`px-5 py-3 text-sm font-semibold ${scoreColor(s.score)}`}>
                      {s.score} / 10
                    </td>
                    <td className="px-5 py-3 text-sm font-mono text-textMuted">{formatTime(s.timeTaken)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
};

export default Profile;

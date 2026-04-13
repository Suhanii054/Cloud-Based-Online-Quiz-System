import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Play, Trophy, Star, Zap, TrendingUp } from 'lucide-react';

const mockLeaderboard = [
  { rank: 1, username: 'NeonMaster', score: 980 },
  { rank: 2, username: 'QuizWizard', score: 920 },
  { rank: 3, username: 'ByteChamp', score: 870 },
  { rank: 4, username: 'CodeNinja', score: 810 },
  { rank: 5, username: 'StarPlayer', score: 760 },
];

const rankColors = ['text-yellow-400', 'text-gray-300', 'text-amber-600'];

const Home = () => {
  const { username } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex-1 bg-background min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">

        {/* Hero */}
        <div className="relative bg-surface rounded-2xl border border-primary/20 shadow-neon-card p-8 overflow-hidden">
          {/* BG decoration */}
          <div className="absolute -top-12 -right-12 w-56 h-56 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <p className="text-textMuted text-sm mb-1 flex items-center gap-1.5">
                <Zap size={14} className="text-primary" />
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

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Best Score', value: '—', icon: <Star size={20} className="text-yellow-400" />, color: 'text-yellow-400' },
            { label: 'Total Attempts', value: '0', icon: <TrendingUp size={20} className="text-secondary" />, color: 'text-secondary' },
            { label: 'Global Rank', value: '—', icon: <Trophy size={20} className="text-primary" />, color: 'text-primary' },
          ].map((stat) => (
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

        {/* Leaderboard Preview */}
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

          <div className="space-y-2">
            {mockLeaderboard.map((entry) => (
              <div
                key={entry.rank}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all
                  ${entry.rank === 1 ? 'bg-yellow-400/5 border border-yellow-400/20' : 'bg-inputBg/50 border border-primary/10 hover:border-primary/25'}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-bold w-5 text-center ${rankColors[entry.rank - 1] || 'text-textMuted'}`}>
                    {entry.rank}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary">
                    {entry.username.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-sm text-textMain font-medium">{entry.username}</span>
                </div>
                <span className="text-sm font-bold text-primary">{entry.score} pts</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Home;

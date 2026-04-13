import React from 'react';

const Leaderboard = () => {
  return (
    <div className="flex-1 bg-background min-h-screen py-10 px-6 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-textMain mb-4 flex items-center gap-2">
            <span className="text-yellow-400">🏆</span> Leaderboard
        </h1>
        <p className="text-textMuted text-sm mb-6 max-w-md text-center">
            Global rankings comparing all players will be listed here.
        </p>

        <div className="bg-surface w-full max-w-3xl rounded-2xl border border-primary/20 shadow-neon-card h-96 flex items-center justify-center">
            <span className="text-textMuted italic">Leaderboard Data Placeholder</span>
        </div>
    </div>
  );
};

export default Leaderboard;

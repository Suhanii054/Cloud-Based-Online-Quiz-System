import React from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { username } = useAuth();
  
  return (
    <div className="flex-1 bg-background min-h-screen py-10 px-6 flex flex-col items-center justify-center">
      <div className="bg-surface rounded-2xl border border-primary/20 shadow-neon-card p-8 w-full max-w-md">
        <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary/50 flex items-center justify-center text-xl font-bold text-primary">
                {username ? username.slice(0, 2).toUpperCase() : '?'}
            </div>
            <div>
                <h1 className="text-2xl font-bold text-textMain">{username || 'User'}</h1>
                <p className="text-textMuted text-sm">Account details</p>
            </div>
        </div>

        <div className="space-y-4">
            <div className="bg-inputBg rounded-lg p-4 border border-primary/10">
                 <p className="text-xs text-textMuted uppercase tracking-wider mb-1">Quiz History</p>
                 <span className="text-sm text-textMain italic">No attempts yet</span>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;

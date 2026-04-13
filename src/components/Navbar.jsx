import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, Zap } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { username } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const initials = username
    ? username.slice(0, 2).toUpperCase()
    : '?';

  return (
    <nav className="w-full bg-surface border-b border-primary/20 shadow-neon-card sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/home" className="flex items-center gap-2 group">
          <Zap
            size={22}
            className="text-primary group-hover:text-secondary transition-colors duration-200"
          />
          <span className="text-xl font-bold tracking-wide text-primary group-hover:text-secondary transition-colors duration-200">
            QuizApp
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Nav Links */}
          <div className="hidden sm:flex items-center gap-5 text-sm text-textMuted">
            <Link to="/home" className="hover:text-textMain transition-colors">Home</Link>
            <Link to="/leaderboard" className="hover:text-textMain transition-colors">Leaderboard</Link>
            <Link to="/profile" className="hover:text-textMain transition-colors">Profile</Link>
          </div>

          {/* Username + Avatar */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center text-xs font-bold text-primary select-none">
              {initials}
            </div>
            <span className="text-sm text-textMuted hidden sm:block">{username}</span>
          </div>

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-danger border border-danger/30 hover:bg-danger/10 hover:border-danger/60 transition-all duration-200"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

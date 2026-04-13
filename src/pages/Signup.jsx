import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Zap, User, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', userCred.user.uid), {
        username: username.trim(),
        email: email.trim(),
        bestScore: 0,
        totalAttempts: 0,
        createdAt: serverTimestamp(),
      });
      navigate('/home');
    } catch (err) {
      setError(getFirebaseError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const getFirebaseError = (code) => {
    switch (code) {
      case 'auth/email-already-in-use': return 'This email is already registered.';
      case 'auth/invalid-email': return 'Invalid email address.';
      case 'auth/weak-password': return 'Password is too weak (min 6 characters).';
      default: return 'Sign up failed. Please try again.';
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      {/* Background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-secondary/10 border border-secondary/30 mb-4">
            <Zap size={26} className="text-secondary" />
          </div>
          <h1 className="text-3xl font-bold text-textMain">Create Account</h1>
          <p className="text-textMuted text-sm mt-1">Join QuizApp and challenge yourself</p>
        </div>

        {/* Card */}
        <div className="bg-surface rounded-2xl border border-primary/20 shadow-neon-card p-8">
          <form onSubmit={handleSignup} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-textMuted mb-1.5">Username</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
                <input
                  id="signup-username"
                  type="text"
                  placeholder="coolquizzer"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-inputBg border border-primary/20 rounded-lg pl-9 pr-4 py-2.5 text-sm text-textMain placeholder-textMuted
                    focus:outline-none focus:border-primary focus:shadow-[0_0_0_2px_rgba(168,85,247,0.15)] transition-all duration-200"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-textMuted mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
                <input
                  id="signup-email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-inputBg border border-primary/20 rounded-lg pl-9 pr-4 py-2.5 text-sm text-textMain placeholder-textMuted
                    focus:outline-none focus:border-primary focus:shadow-[0_0_0_2px_rgba(168,85,247,0.15)] transition-all duration-200"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-textMuted mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
                <input
                  id="signup-password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-inputBg border border-primary/20 rounded-lg pl-9 pr-4 py-2.5 text-sm text-textMain placeholder-textMuted
                    focus:outline-none focus:border-primary focus:shadow-[0_0_0_2px_rgba(168,85,247,0.15)] transition-all duration-200"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-danger/10 border border-danger/30 rounded-lg px-4 py-2.5 text-sm text-danger">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              id="signup-submit"
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold
                py-2.5 rounded-lg transition-all duration-200 hover:shadow-neon-btn disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <>Create Account <ArrowRight size={16} /></>}
            </button>
          </form>

          <p className="text-center text-sm text-textMuted mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:text-secondary font-medium transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;

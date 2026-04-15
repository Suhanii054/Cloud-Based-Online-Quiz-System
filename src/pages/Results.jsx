import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { doc, updateDoc, getDoc, increment } from 'firebase/firestore';
import { CheckCircle2, XCircle, RotateCcw, Trophy } from 'lucide-react';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import CloudActivityPanel from '../components/CloudActivityPanel';

// ── Score rating helper ───────────────────────────────────────────────────────
const getRating = (score) => {
  if (score >= 8) return { label: 'Excellent! 🎉', color: 'text-success', border: 'border-success/40', bg: 'bg-success/10' };
  if (score >= 5) return { label: 'Good Job! 👍',  color: 'text-yellow-400', border: 'border-yellow-400/40', bg: 'bg-yellow-400/10' };
  return           { label: 'Keep Practicing 💪', color: 'text-danger', border: 'border-danger/40', bg: 'bg-danger/10' };
};

// ── Utility: async sleep ──────────────────────────────────────────────────────
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Unpack state passed from Quiz.jsx
  const { questions = [], answers = [], timeTaken = [], totalMs = 0 } = location.state || {};

  // ── Calculate score ───────────────────────────────────────────────────────
  const score = questions.reduce((acc, q, i) => {
    return acc + (answers[i] === q.correctIndex ? 1 : 0);
  }, 0);

  const percentage   = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
  const totalSeconds = Math.round(totalMs / 1000);
  const rating       = getRating(score);

  // ── Cloud Activity ────────────────────────────────────────────────────────
  const [cloudLogs, setCloudLogs] = useState([]);
  const [firestoreDone, setFirestoreDone] = useState(false);

  const addLog = useCallback((message, status, ts = '') => {
    setCloudLogs((prev) => [...prev, { message, status, ts }]);
  }, []);

  // ── Firestore update on mount ─────────────────────────────────────────────
  useEffect(() => {
    if (!user || firestoreDone) return;

    const syncToFirestore = async () => {
      const t0 = Date.now();

      addLog('✅ Score calculated', 'success', '+0ms');

      await delay(400);
      addLog('🔄 Connecting to Firebase Firestore…', 'pending', `+${Date.now() - t0}ms`);

      try {
        const userRef  = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          const updates = { totalAttempts: increment(1) };

          // Only update bestScore if this attempt is better
          if (score > (data.bestScore || 0)) {
            updates.bestScore = score;
          }

          await updateDoc(userRef, updates);

          addLog('✅ User profile updated in Firestore', 'success', `+${Date.now() - t0}ms`);

          await delay(400);
          addLog('✅ Best score synced to cloud', 'success', `+${Date.now() - t0}ms`);

          await delay(400);
          // Re-fetch to get accurate totalAttempts value
          const updated = await getDoc(userRef);
          const attempts = updated.exists() ? updated.data().totalAttempts : '?';
          addLog(`📊 Stats updated — totalAttempts: ${attempts}`, 'success', `+${Date.now() - t0}ms`);
        }
      } catch (err) {
        console.error('Firestore update error:', err);
        addLog('❌ Failed to update Firestore', 'error', `+${Date.now() - t0}ms`);
      }

      setFirestoreDone(true);
    };

    syncToFirestore();
  }, [user, addLog, firestoreDone, score]);

  // ── Guard: no quiz data ───────────────────────────────────────────────────
  if (!location.state || questions.length === 0) {
    return (
      <div className="flex-1 bg-background min-h-screen py-10 px-6 flex items-center justify-center">
        <div className="bg-surface border border-danger/30 rounded-2xl shadow-neon-card p-8 text-center max-w-md">
          <p className="text-danger font-semibold mb-2">No quiz data found.</p>
          <button
            onClick={() => navigate('/quiz')}
            className="mt-4 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/85 transition-all"
          >
            Start a Quiz
          </button>
        </div>
      </div>
    );
  }

  // ── Format total time ─────────────────────────────────────────────────────
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const timeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 bg-background min-h-screen py-10 px-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* ── Top row: score card + cloud panel ── */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* Score card */}
          <div className={`flex-1 bg-surface border ${rating.border} rounded-2xl shadow-neon-card p-8 text-center`}>
            <h1 className="text-2xl font-bold text-textMain mb-6">Quiz Results</h1>

            {/* Big score */}
            <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full border-4 ${rating.border} ${rating.bg} mb-4`}>
              <span className={`text-4xl font-black ${rating.color}`}>{score}<span className="text-xl text-textMuted font-bold">/{questions.length}</span></span>
            </div>

            <p className={`text-xl font-bold ${rating.color} mb-1`}>{rating.label}</p>
            <p className="text-textMuted text-sm mb-6">{percentage}% correct · {timeStr} total time</p>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate('/quiz')}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold
                  hover:bg-primary/85 hover:shadow-neon-btn transition-all duration-200"
              >
                <RotateCcw size={15} />
                Try Again
              </button>
              <button
                onClick={() => navigate('/leaderboard')}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-primary/30 text-primary text-sm font-bold
                  hover:bg-primary/10 transition-all duration-200"
              >
                <Trophy size={15} />
                Leaderboard
              </button>
            </div>
          </div>

          {/* Cloud activity panel */}
          <div className="w-full lg:w-72">
            <CloudActivityPanel logs={cloudLogs} />
          </div>
        </div>

        {/* ── Question Review ── */}
        <div className="bg-surface border border-primary/20 rounded-2xl shadow-neon-card p-6">
          <h2 className="text-lg font-bold text-textMain mb-5">Question Review</h2>
          <div className="space-y-5">
            {questions.map((q, qi) => {
              const userAnswer    = answers[qi];
              const correct       = q.correctIndex;
              const isCorrect     = userAnswer === correct;
              const isUnanswered  = userAnswer === null || userAnswer === undefined;

              return (
                <div key={q.questionId || qi} className="border border-primary/10 rounded-xl p-4 bg-inputBg/40">
                  {/* Question header */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="mt-0.5 flex-shrink-0">
                      {isCorrect
                        ? <CheckCircle2 size={16} className="text-success" />
                        : <XCircle     size={16} className="text-danger"  />
                      }
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[10px] uppercase tracking-wider text-textMuted">{q.difficulty}</span>
                        <span className="text-[10px] uppercase tracking-wider text-textMuted">·</span>
                        <span className="text-[10px] uppercase tracking-wider text-textMuted">{q.category}</span>
                        <span className="text-[10px] text-textMuted font-mono ml-auto">{timeTaken[qi]}s</span>
                      </div>
                      <p className="text-sm font-semibold text-textMain">{q.questionText}</p>
                    </div>
                  </div>

                  {/* Answer options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                    {q.options.map((opt, oi) => {
                      const isUserChoice = oi === userAnswer;
                      const isCorrectChoice = oi === correct;

                      let cls = 'border-primary/10 bg-inputBg/30 text-textMuted';
                      if (isCorrectChoice) cls = 'border-success/50 bg-success/10 text-success font-semibold';
                      else if (isUserChoice && !isCorrect) cls = 'border-danger/50 bg-danger/10 text-danger';

                      return (
                        <div key={oi} className={`text-xs px-3 py-2 rounded-lg border ${cls} flex items-center gap-2`}>
                          {isCorrectChoice && <CheckCircle2 size={11} className="text-success flex-shrink-0" />}
                          {isUserChoice && !isCorrect && <XCircle size={11} className="text-danger flex-shrink-0" />}
                          {opt}
                        </div>
                      );
                    })}
                  </div>

                  {/* Unanswered notice */}
                  {isUnanswered && (
                    <p className="text-xs text-yellow-400 mb-2">⏱ Time ran out — no answer selected</p>
                  )}

                  {/* Explanation */}
                  {q.explanation && (
                    <p className="text-xs text-textMuted italic border-t border-primary/10 pt-2 mt-1">
                      💡 {q.explanation}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Results;

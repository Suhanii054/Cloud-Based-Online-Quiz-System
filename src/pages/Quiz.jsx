import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Zap } from 'lucide-react';
import { collection, addDoc, doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { fetchQuestions } from '../utils/fetchQuestions';

const TOTAL_TIME = 15 * 60; // 900 seconds

const formatTime = (secs) => {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const Quiz = () => {
  const { user, username } = useAuth();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [locked, setLocked] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [submitting, setSubmitting] = useState(false);

  const timerRef = useRef(null);
  const submittingRef = useRef(false);
  const answersRef = useRef([]);
  const questionsRef = useRef([]);
  const timeLeftRef = useRef(TOTAL_TIME);
  const doSubmitRef = useRef(null);

  // Fetch questions on mount
  useEffect(() => {
    fetchQuestions()
      .then((qs) => {
        setQuestions(qs);
        questionsRef.current = qs;
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load questions. Please try again.');
        setLoading(false);
      });
  }, []);

  const doSubmit = useCallback(
    async (finalAnswers, finalTimeLeft) => {
      if (submittingRef.current) return;
      submittingRef.current = true;
      setSubmitting(true);
      clearInterval(timerRef.current);

      const qs = questionsRef.current;
      const timeTaken = TOTAL_TIME - finalTimeLeft;

      // Fill unanswered questions with selectedIndex -1
      const answerMap = new Map(finalAnswers.map((a) => [a.questionId, a]));
      const completeAnswers = qs.map((q) =>
        answerMap.get(q.questionId) || { questionId: q.questionId, selectedIndex: -1, correctIndex: q.correctIndex }
      );

      const score = completeAnswers.filter((a) => a.selectedIndex === a.correctIndex).length;

      try {
        await addDoc(collection(db, 'sessions'), {
          userId: user.uid,
          score,
          timeTaken,
          submittedAt: serverTimestamp(),
          answers: completeAnswers,
        });

        const lbRef = doc(db, 'leaderboard', user.uid);
        const lbSnap = await getDoc(lbRef);
        if (lbSnap.exists()) {
          const d = lbSnap.data();
          await updateDoc(lbRef, {
            username,
            bestScore: score > (d.bestScore || 0) ? score : d.bestScore,
            totalAttempts: (d.totalAttempts || 0) + 1,
            lastPlayed: serverTimestamp(),
          });
        } else {
          await setDoc(lbRef, {
            username,
            bestScore: score,
            totalAttempts: 1,
            lastPlayed: serverTimestamp(),
          });
        }

        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const d = userSnap.data();
          await updateDoc(userRef, {
            bestScore: score > (d.bestScore || 0) ? score : d.bestScore,
            totalAttempts: (d.totalAttempts || 0) + 1,
          });
        }
      } catch (err) {
        console.error('Error saving quiz results:', err);
      }

      navigate('/results', {
        state: { questions: qs, answers: completeAnswers, score, timeTaken },
      });
    },
    [user, username, navigate]
  );

  // Keep doSubmitRef up to date so the timer always calls the latest version
  useEffect(() => {
    doSubmitRef.current = doSubmit;
  }, [doSubmit]);

  // Start countdown after questions load
  useEffect(() => {
    if (loading || questions.length === 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 1;
        timeLeftRef.current = next;
        if (next <= 0) {
          clearInterval(timerRef.current);
          if (!submittingRef.current) {
            doSubmitRef.current(answersRef.current, 0);
          }
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [loading, questions.length]);

  const handleOptionClick = useCallback(
    (selectedIndex) => {
      if (locked || submittingRef.current) return;
      setLocked(true);

      const question = questionsRef.current[currentIndex];
      const newAnswer = {
        questionId: question.questionId,
        selectedIndex,
        correctIndex: question.correctIndex,
      };

      const newAnswers = [...answersRef.current, newAnswer];
      setAnswers(newAnswers);
      answersRef.current = newAnswers;

      setTimeout(() => {
        if (currentIndex >= questionsRef.current.length - 1) {
          doSubmitRef.current(newAnswers, timeLeftRef.current);
        } else {
          setCurrentIndex((i) => i + 1);
          setLocked(false);
        }
      }, 600);
    },
    [locked, currentIndex]
  );

  const isLowTime = timeLeft < 120;
  const progress = questions.length > 0 ? (answers.length / questions.length) * 100 : 0;
  const question = questions[currentIndex];

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          <Zap size={22} className="text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-textMuted text-sm">Loading questions…</p>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center gap-6 px-6">
        <p className="text-danger text-lg font-semibold">{error}</p>
        <button
          onClick={() => navigate('/home')}
          className="px-6 py-2.5 bg-primary hover:bg-primary/85 text-white font-semibold rounded-xl transition-all hover:shadow-neon-btn"
        >
          Back to Home
        </button>
      </div>
    );
  }

  // ── Submitting ────────────────────────────────────────────────────────────
  if (submitting) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 size={36} className="text-primary animate-spin" />
        <p className="text-textMuted text-sm">Saving your results…</p>
      </div>
    );
  }

  // ── Quiz UI ───────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-background flex flex-col overflow-hidden">
      {/* Neon progress bar */}
      <div className="h-1 bg-surface flex-shrink-0">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${progress}%`, boxShadow: '0 0 8px rgba(168,85,247,0.7)' }}
        />
      </div>

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 flex-shrink-0">
        <span className="text-textMuted text-sm font-semibold tracking-wide">
          Q {currentIndex + 1} / {questions.length}
        </span>
        <span
          className={`text-sm font-mono font-bold border rounded-lg px-3 py-1 transition-all duration-300 ${
            isLowTime
              ? 'text-red-400 border-red-400/50 shadow-[0_0_10px_rgba(248,113,113,0.35)]'
              : 'text-textMuted border-primary/20'
          }`}
        >
          {formatTime(timeLeft)}
        </span>
      </div>

      {/* Question text */}
      <div className="flex-1 flex items-center justify-center px-6 min-h-0">
        <h2 className="text-2xl sm:text-3xl font-bold text-textMain text-center max-w-2xl leading-snug">
          {question?.questionText}
        </h2>
      </div>

      {/* Options grid */}
      <div className="px-6 pb-8 flex-shrink-0">
        <div className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
          {question?.options.map((option, i) => (
            <button
              key={i}
              disabled={locked}
              onClick={() => handleOptionClick(i)}
              className="bg-surface border border-primary/30 rounded-xl px-5 py-4 text-left text-sm
                text-textMain font-medium transition-all duration-200
                hover:border-primary hover:shadow-[0_0_18px_rgba(168,85,247,0.45)] hover:bg-primary/5
                disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98]"
            >
              <span className="text-primary font-bold mr-2">{String.fromCharCode(65 + i)}.</span>
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Quiz;

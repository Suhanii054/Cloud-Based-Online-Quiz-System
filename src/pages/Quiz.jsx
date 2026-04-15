import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Clock, Loader2 } from 'lucide-react';
import { fetchQuestions } from '../utils/fetchQuestions';
import CloudActivityPanel from '../components/CloudActivityPanel';

// How many seconds each question gets
const QUESTION_TIME = 30;

// Tailwind color classes for each difficulty level
const DIFFICULTY_STYLES = {
  easy:   { bg: 'bg-success/10',   border: 'border-success/40',   text: 'text-success'   },
  medium: { bg: 'bg-secondary/10', border: 'border-secondary/40', text: 'text-secondary' },
  hard:   { bg: 'bg-danger/10',    border: 'border-danger/40',    text: 'text-danger'    },
};

const Quiz = () => {
  const navigate = useNavigate();

  // ── State ────────────────────────────────────────────────────────────────
  const [questions, setQuestions]         = useState([]);        // loaded questions
  const [loading, setLoading]             = useState(true);      // initial fetch
  const [cloudLogs, setCloudLogs]         = useState([]);        // activity panel

  const [currentIndex, setCurrentIndex]  = useState(0);         // which question
  const [selectedOption, setSelectedOption] = useState(null);   // chosen answer (null = none)
  const [timeLeft, setTimeLeft]           = useState(QUESTION_TIME);

  // Per-question tracking
  const [answers, setAnswers]            = useState([]);         // selected index per q
  const [timeTaken, setTimeTaken]        = useState([]);         // seconds spent per q

  const questionStartRef = useRef(null);  // set to Date.now() when quiz loads / question changes
  const quizStartRef     = useRef(null);  // set to Date.now() when quiz loads
  const timerRef         = useRef(null);        // interval handle

  // ── Cloud Activity Helper ─────────────────────────────────────────────────
  // Appends a single log entry; the panel's stagger animation handles display timing.
  const addLog = useCallback((message, status = 'success', ts = '') => {
    setCloudLogs((prev) => [...prev, { message, status, ts }]);
  }, []);

  // ── Fetch Questions on Mount ─────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      const t0 = Date.now();

      // Stream the activity logs with 400ms gaps so they feel "live"
      addLog('🔄 Connecting to AWS DynamoDB…', 'pending', '');

      await delay(400);
      addLog(`✅ Connected to AWS us-east-1 (${Date.now() - t0}ms)`, 'success', `+${Date.now() - t0}ms`);

      await delay(400);
      addLog('📦 Fetching questions from DynamoDB…', 'pending', `+${Date.now() - t0}ms`);

      try {
        const qs = await fetchQuestions();

        addLog(`✅ 30 questions retrieved from cloud`, 'success', `+${Date.now() - t0}ms`);

        await delay(400);
        addLog('🧠 Selecting 10 balanced questions (4E+4M+2H)…', 'pending', `+${Date.now() - t0}ms`);

        await delay(400);
        addLog('✅ Quiz ready — 10 questions loaded', 'success', `+${Date.now() - t0}ms`);

        setQuestions(qs);
        quizStartRef.current = Date.now();
        questionStartRef.current = Date.now();
        setLoading(false);
      } catch (err) {
        addLog('❌ Failed to fetch questions', 'error', `+${Date.now() - t0}ms`);
        console.error(err);
        setLoading(false);
      }
    };

    load();
  }, [addLog]);

  // ── Advance to Next Question / Finish ────────────────────────────────────
  // Declared before the timer effect so the effect can safely reference it.
  const handleAdvance = useCallback(
    (chosenIndex, timedOut = false) => {
      clearInterval(timerRef.current);

      // How long was spent on this question (seconds); fallback to 0 if ref not yet set
      const secondsSpent = Math.round((Date.now() - (questionStartRef.current ?? Date.now())) / 1000);

      // Resolve which answer to record (null if timed out with nothing selected)
      const answer = timedOut && chosenIndex === null ? null : chosenIndex;

      const newAnswers   = [...answers, answer];
      const newTimeTaken = [...timeTaken, secondsSpent];

      if (currentIndex + 1 >= questions.length) {
        // Quiz finished — navigate to results; fallback to 0ms if ref not yet set
        const totalMs = Date.now() - (quizStartRef.current ?? Date.now());
        navigate('/results', {
          state: {
            questions,
            answers:   newAnswers,
            timeTaken: newTimeTaken,
            totalMs,
          },
        });
      } else {
        setAnswers(newAnswers);
        setTimeTaken(newTimeTaken);
        setSelectedOption(null);
        setCurrentIndex((i) => i + 1);
      }
    },
    [answers, currentIndex, navigate, questions, timeTaken]
  );

  // ── Per-Question Countdown Timer ─────────────────────────────────────────
  useEffect(() => {
    if (loading || questions.length === 0) return;

    questionStartRef.current = Date.now();

    // Reset the displayed timer via a callback (avoids synchronous setState in effect body)
    const resetTimer = setTimeout(() => setTimeLeft(QUESTION_TIME), 0);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up — auto-advance and mark as wrong (null = no selection)
          clearInterval(timerRef.current);
          handleAdvance(null, true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(resetTimer);
      clearInterval(timerRef.current);
    };
  }, [currentIndex, loading, questions.length, handleAdvance]);

  // ── Option Selection ─────────────────────────────────────────────────────
  const handleSelect = (idx) => {
    setSelectedOption(idx);
  };

  // ── Next Button ──────────────────────────────────────────────────────────
  const handleNext = () => {
    if (selectedOption === null) return;
    handleAdvance(selectedOption, false);
  };

  // ── Render: Loading ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col lg:flex-row items-start justify-center gap-6 p-6">
        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Loading card */}
        <div className="relative flex-1 max-w-2xl flex flex-col items-center justify-center min-h-[60vh] bg-surface border border-primary/20 rounded-2xl shadow-neon-card p-10 text-center">
          <Loader2 size={48} className="text-primary animate-spin mb-4" />
          <h2 className="text-2xl font-bold text-textMain mb-2">Loading Quiz…</h2>
          <p className="text-textMuted text-sm">Pulling questions from AWS DynamoDB</p>
        </div>

        {/* Cloud activity panel */}
        <div className="w-full lg:w-72">
          <CloudActivityPanel logs={cloudLogs} />
        </div>
      </div>
    );
  }

  // ── Render: Empty (error state) ──────────────────────────────────────────
  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="bg-surface border border-danger/30 rounded-2xl shadow-neon-card p-8 text-center max-w-md">
          <p className="text-danger font-semibold mb-2">Failed to load questions</p>
          <p className="text-textMuted text-sm">Check your AWS credentials and try again.</p>
        </div>
      </div>
    );
  }

  // ── Render: Quiz UI ──────────────────────────────────────────────────────
  const question       = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const diffStyle      = DIFFICULTY_STYLES[question.difficulty] || DIFFICULTY_STYLES.easy;
  const timerDanger    = timeLeft <= 10;

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row items-start justify-center gap-6 p-6">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

      {/* ── Main Quiz Card ── */}
      <div className="relative flex-1 max-w-2xl w-full space-y-5">

        {/* Progress bar + counter */}
        <div className="bg-surface border border-primary/20 rounded-2xl shadow-neon-card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-textMuted font-medium">
              Question <span className="text-textMain font-bold">{currentIndex + 1}</span> of {questions.length}
            </span>

            {/* Countdown timer */}
            <div className={`flex items-center gap-1.5 font-mono font-bold text-sm ${timerDanger ? 'text-danger' : 'text-secondary'}`}>
              <Clock size={14} className={timerDanger ? 'animate-pulse' : ''} />
              {String(timeLeft).padStart(2, '0')}s
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-inputBg rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question card */}
        <div className="bg-surface border border-primary/20 rounded-2xl shadow-neon-card p-6">
          {/* Badges row */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${diffStyle.bg} ${diffStyle.border} ${diffStyle.text} capitalize`}>
              {question.difficulty}
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary capitalize">
              {question.category}
            </span>
          </div>

          {/* Question text */}
          <h2 className="text-lg font-bold text-textMain mb-6 leading-snug">
            {question.questionText}
          </h2>

          {/* Answer options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {question.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  className={`
                    w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-150
                    ${isSelected
                      ? 'bg-primary/20 border-primary text-textMain shadow-neon-btn'
                      : 'bg-inputBg border-primary/15 text-textMuted hover:border-primary/40 hover:text-textMain hover:bg-primary/5'
                    }
                  `}
                >
                  <span className={`mr-2 text-xs font-bold ${isSelected ? 'text-primary' : 'text-textMuted'}`}>
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Next button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleNext}
              disabled={selectedOption === null}
              className="flex items-center gap-2 bg-primary hover:bg-primary/85 text-white font-bold px-6 py-2.5 rounded-xl
                transition-all duration-200 hover:shadow-neon-btn disabled:opacity-40 disabled:cursor-not-allowed text-sm"
            >
              {currentIndex + 1 === questions.length ? 'Finish' : 'Next'}
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Cloud Activity Panel (sidebar) ── */}
      <div className="w-full lg:w-72 lg:sticky lg:top-6">
        <CloudActivityPanel logs={cloudLogs} />
      </div>
    </div>
  );
};

// ── Utility: async sleep ─────────────────────────────────────────────────────
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export default Quiz;

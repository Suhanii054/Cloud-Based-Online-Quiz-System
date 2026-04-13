import React from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Clock, RotateCcw, Trophy } from 'lucide-react';

const formatTime = (secs) => {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const getGrade = (score) => {
  if (score === 10) return { text: 'Perfect score!', color: 'text-yellow-400' };
  if (score >= 8) return { text: 'Excellent!', color: 'text-green-400' };
  if (score >= 6) return { text: 'Good job!', color: 'text-secondary' };
  if (score >= 4) return { text: 'Keep practicing', color: 'text-amber-400' };
  return { text: 'Better luck next time', color: 'text-danger' };
};

const Results = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) {
    return <Navigate to="/home" replace />;
  }

  const { questions, answers, score, timeTaken } = state;
  const grade = getGrade(score);

  return (
    <div className="flex-1 bg-background min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* Score card */}
        <div className="bg-surface rounded-2xl border border-primary/20 shadow-neon-card p-8 text-center">
          {/* Big score */}
          <div
            className="text-7xl sm:text-8xl font-extrabold text-primary mb-2"
            style={{ textShadow: '0 0 30px rgba(168,85,247,0.7)' }}
          >
            {score} <span className="text-4xl sm:text-5xl text-textMuted font-bold">/ {questions.length}</span>
          </div>

          <p className={`text-xl font-semibold mt-2 ${grade.color}`}>{grade.text}</p>

          {/* Time taken */}
          <div className="flex items-center justify-center gap-2 mt-4 text-textMuted text-sm">
            <Clock size={15} />
            <span>Time taken: <span className="text-textMain font-mono font-semibold">{formatTime(timeTaken)}</span></span>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-7">
            <button
              onClick={() => navigate('/home')}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-inputBg border border-primary/30
                text-textMain font-semibold rounded-xl hover:border-primary hover:shadow-neon-card transition-all duration-200"
            >
              <RotateCcw size={16} />
              Play Again
            </button>
            <button
              onClick={() => navigate('/leaderboard')}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/85
                text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-neon-btn"
            >
              <Trophy size={16} />
              Leaderboard
            </button>
          </div>
        </div>

        {/* Question review */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-textMain px-1">Question Review</h2>

          {questions.map((q, qi) => {
            const ans = answers[qi];
            const selectedIndex = ans?.selectedIndex ?? -1;
            const correctIndex = q.correctIndex;

            return (
              <div
                key={q.questionId}
                className="bg-surface rounded-2xl border border-primary/15 shadow-neon-card p-5 space-y-3"
              >
                {/* Question text */}
                <p className="text-textMain font-semibold text-sm leading-relaxed">
                  <span className="text-primary font-bold mr-1">Q{qi + 1}.</span>
                  {q.questionText}
                </p>

                {/* Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map((opt, oi) => {
                    const isSelected = oi === selectedIndex;
                    const isCorrect = oi === correctIndex;

                    let cardClass =
                      'relative flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-medium transition-all duration-150 ';

                    if (isCorrect) {
                      cardClass +=
                        'bg-green-500/10 border-green-500/50 text-green-400 shadow-[0_0_10px_rgba(74,222,128,0.25)]';
                    } else if (isSelected && !isCorrect) {
                      cardClass +=
                        'bg-red-500/10 border-red-500/50 text-red-400 shadow-[0_0_10px_rgba(248,113,113,0.25)]';
                    } else {
                      cardClass += 'bg-inputBg/40 border-primary/10 text-textMuted';
                    }

                    return (
                      <div key={oi} className={cardClass}>
                        {isCorrect && <CheckCircle2 size={14} className="flex-shrink-0" />}
                        {isSelected && !isCorrect && <XCircle size={14} className="flex-shrink-0" />}
                        {!isCorrect && !isSelected && <span className="w-3.5 flex-shrink-0" />}
                        <span>{opt}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                {q.explanation && (
                  <p className="text-textMuted text-xs leading-relaxed border-t border-primary/10 pt-3">
                    <span className="font-semibold text-textMain/60">Explanation: </span>
                    {q.explanation}
                  </p>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default Results;

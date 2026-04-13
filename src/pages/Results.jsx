import React from 'react';

const Results = () => {
  return (
    <div className="flex-1 bg-background min-h-screen py-10 px-6 flex items-center justify-center">
      <div className="bg-surface rounded-2xl border border-primary/20 shadow-neon-card p-8 text-center max-w-lg w-full">
        <h1 className="text-3xl font-bold text-textMain mb-4">Quiz Results</h1>
        <p className="text-textMuted text-sm">
          Detailed results, truth-meter, and root cause analysis placeholders will be displayed here.
        </p>
      </div>
    </div>
  );
};

export default Results;

import React from 'react';

const Quiz = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 pb-24">
       {/* Background glows */}
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative text-center">
        <h1 className="text-4xl font-bold text-textMain mb-4">Quiz Page</h1>
        <p className="text-textMuted max-w-lg mx-auto">
          The quiz logic and questions will go here. For now, this is a full-screen dark canvas matching the theme requirements, with the navbar hidden as requested.
        </p>
      </div>
    </div>
  );
};

export default Quiz;

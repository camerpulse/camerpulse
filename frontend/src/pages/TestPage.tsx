import React from 'react';

const TestPage = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">React is Working!</h1>
        <p className="text-muted-foreground">This is a minimal test page to verify React functionality.</p>
        <button 
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded"
          onClick={() => alert('Button clicked!')}
        >
          Test Button
        </button>
      </div>
    </div>
  );
};

export default TestPage;
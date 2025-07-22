import React from 'react';

const SimpleTest = () => {
  return (
    <div style={{ padding: '20px', fontSize: '24px', color: 'black' }}>
      <h1>Simple Test Page</h1>
      <p>If you can see this, React is working.</p>
      <div style={{ background: 'red', color: 'white', padding: '10px', marginTop: '20px' }}>
        Red test div
      </div>
    </div>
  );
};

export default SimpleTest;
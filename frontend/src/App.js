import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>OSINT Systems</h1>
        <p>Open Source Intelligence Tools</p>
        <div className="status-indicator">
          <span className="status-dot"></span>
          System Status: Online
        </div>
      </header>
      <main className="App-main">
        <section className="tools-section">
          <h2>Available Tools</h2>
          <p>OSINT tools will be available here</p>
        </section>
      </main>
    </div>
  );
}

export default App;
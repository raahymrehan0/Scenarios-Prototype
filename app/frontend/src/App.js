import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import RealOrFakeGame from './components/RealOrFakeGame';
import GuessTheHeadlineGame from './components/GuessTheHeadlineGame';
import GuessTheSourceGame from './components/GuessTheSourceGame';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 p-4">
        <h1 className="text-3xl font-bold text-center mb-6">Misinformation Detective</h1>
        <nav className="flex justify-center gap-4 mb-4">
          <Link className="btn" to="/real-or-fake">Real or Fake</Link>
          <Link className="btn" to="/guess-headline">Guess the Headline</Link>
          <Link className="btn" to="/guess-source">Guess the Source</Link>
        </nav>
        <Routes>
          <Route path="/real-or-fake" element={<RealOrFakeGame />} />
          <Route path="/guess-headline" element={<GuessTheHeadlineGame />} />
          <Route path="/guess-source" element={<GuessTheSourceGame />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
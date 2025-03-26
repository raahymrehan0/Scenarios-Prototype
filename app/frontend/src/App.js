import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import RealOrFakeGame from './components/RealOrFakeGame';
import GuessTheHeadlineGame from './components/GuessTheHeadlineGame';
import GuessTheSourceGame from './components/GuessTheSourceGame';
import './App.css';

// Home component for the landing page
const Home = () => (
  <div className="game-container">
    <div className="game-card">
      <h2 className="game-title">Welcome to Misinformation Detective</h2>
      <p className="article-content">
        Test your critical thinking skills and learn to spot misinformation through fun, 
        educational games. Choose a game from the navigation bar to get started!
      </p>
      
      <div className="game-options">
        <Link to="/real-or-fake" className="game-option">
          <h3>Real or Fake</h3>
          <p>Can you tell if an article is from a legitimate source or completely fabricated?</p>
        </Link>
        
        <Link to="/guess-headline" className="game-option">
          <h3>Guess the Headline</h3>
          <p>Given an article snippet, can you identify the original headline?</p>
        </Link>
        
        <div className="center-tile">
          <Link to="/guess-source" className="game-option">
            <h3>Guess the Source</h3>
            <p>Determine which publication an article excerpt came from.</p>
          </Link>
        </div>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <div className="app-container">
        <nav className="navbar">
          <div className="navbar-content">
            <Link to="/" className="navbar-logo">Misinformation Detective</Link>
            <div className="navbar-links">
              <Link className="navbar-link" to="/real-or-fake">Real or Fake</Link>
              <Link className="navbar-link" to="/guess-headline">Guess the Headline</Link>
              <Link className="navbar-link" to="/guess-source">Guess the Source</Link>
            </div>
          </div>
        </nav>
        
        <div className="content-area">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/real-or-fake" element={<RealOrFakeGame />} />
            <Route path="/guess-headline" element={<GuessTheHeadlineGame />} />
            <Route path="/guess-source" element={<GuessTheSourceGame />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
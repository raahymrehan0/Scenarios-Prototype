import React, { useState, useEffect, useRef } from 'react';
import './RealOrFakeGame.css';

const GuessTheSourceGame = () => {
  const [article, setArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [hasAnswered, setHasAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [error, setError] = useState(null);
  // New state variables for timing
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timeBonus, setTimeBonus] = useState(0);
  const timerRef = useRef(null);

  
  // Start the timer when a new question loads
  const startTimer = () => {
    setTimeElapsed(0);
    // Clear any existing timer
    if (timerRef.current) clearInterval(timerRef.current);
    
    // Start a new timer that increments every second
    timerRef.current = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
  };

  // Stop the timer when user answers
  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  // Calculate time bonus based on speed - more granular scoring
  const calculateTimeBonus = (seconds) => {
    // Maximum possible bonus: 10 points
    // Each second reduces the bonus by 0.5 points
    // Minimum bonus: 0 points
    const maxBonus = 10;
    const pointsLostPerSecond = 0.25;
    const calculatedBonus = Math.max(0, maxBonus - (seconds * pointsLostPerSecond));
    
    // Round to 1 decimal place for more granular scoring
    return Math.round(calculatedBonus);
  };

  const fetchQuestion = async () => {
    setIsLoading(true);
    setHasAnswered(false);
    setFeedback('');
    setTimeBonus(0);

    try {
      const response = await fetch('http://localhost:8000/api/guess_source_question/');
      if (!response.ok) throw new Error('Failed to fetch question');
      const data = await response.json();
      setArticle(data);
      startTimer();
    } catch (err) {
      console.error(err);
      setError('Error loading question. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = async (choice) => {
    if (hasAnswered) return;

    try {
      const response = await fetch('http://localhost:8000/api/guess_source_answer/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer: choice, question_id: article.id })
      });

      if (!response.ok) throw new Error('Failed to submit answer');
      const result = await response.json();

      setFeedback(result.feedback);
      setHasAnswered(true);

      if (result.feedback.includes('Correct')) {
        setScore(prev => prev + 1);
      }
    } catch (err) {
      console.error(err);
      setError('Error submitting answer. Please try again.');
    }
  };

  const handleNext = () => {
    setRound(prev => prev + 1);
    fetchQuestion();
  };

  useEffect(() => {
    fetchQuestion();
    
    // Clean up timer on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <div className="game-container">
        <div className="game-card">
          <h2 className="game-title">Guess the Source</h2>
          <div className="feedback-incorrect">
            <p className="text-incorrect">{error}</p>
          </div>
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button className="button-next" onClick={fetchQuestion}>Try Again</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="game-container">
      <div className="game-card">
        <div className="game-header">
          <h2 className="game-title">Guess the Source</h2>
          <div className="game-score">
            Round: {round} | Score: {score}
          </div>
        </div>

        {isLoading ? (
          <div className="loading">
            <div className="loading-text">Loading question...</div>
          </div>
        ) : (
          <>
            <div className="article-card">
              <h3 className="article-title">Article:</h3>
              <p className="article-content">{article.content}</p>
            </div>

            <div className="button-container">
              {article.choices.map((choice, i) => (
                <button
                  key={i}
                  className="button-real"
                  onClick={() => handleAnswer(choice)}
                  disabled={hasAnswered}
                >
                  {choice}
                </button>
              ))}
            </div>

            {feedback && (
              <div className={feedback.includes('Correct') ? 'feedback-correct' : 'feedback-incorrect'}>
                <p className={feedback.includes('Correct') ? 'text-correct' : 'text-incorrect'}>
                  {feedback}
                </p>
              </div>
            )}

            {hasAnswered && (
              <div style={{ textAlign: 'center' }}>
                <button className="button-next" onClick={handleNext}>Next Question →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GuessTheSourceGame;

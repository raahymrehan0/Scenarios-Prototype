import React, { useState, useEffect, useRef } from 'react';
import './RealOrFakeGame.css';

const RealOrFakeGame = () => {
  const [snippet, setSnippet] = useState('');
  const [questionId, setQuestionId] = useState(null);
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
    const pointsLostPerSecond = 0.40;
    const calculatedBonus = Math.max(0, maxBonus - (seconds * pointsLostPerSecond));
    
    // Round to 1 decimal place for more granular scoring
    return Math.round(calculatedBonus);
  };

  // Fetch a new question
  const fetchQuestion = async () => {
    setIsLoading(true);
    setHasAnswered(false);
    setFeedback('');
    setTimeBonus(0);
    
    try {
      const response = await fetch('http://localhost:8000/api/real_or_fake_question/');
      if (!response.ok) {
        throw new Error('Failed to fetch question');
      }
      const data = await response.json();
      setSnippet(data.snippet);
      setQuestionId(data.id);
      setIsLoading(false);
      // Start timing after question is loaded
      startTimer();
    } catch (err) {
      setError('Error loading question. Please try again later.');
      console.error(err);
      setIsLoading(false);
    }
  };

  // Handle user's answer
  const handleAnswer = async (userAnswer) => {
    if (hasAnswered) return;
    
    // Stop the timer and calculate bonus
    stopTimer();
    const bonus = calculateTimeBonus(timeElapsed);
    setTimeBonus(bonus);
    
    try {
      const response = await fetch('http://localhost:8000/api/real_or_fake_answer/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          answer: userAnswer,
          question_id: questionId
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit answer');
      }
      
      const data = await response.json();
      setFeedback(data.feedback);
      setHasAnswered(true);
      
      // Update score with time bonus if correct
      if (data.feedback.includes('Correct')) {
        setScore(prevScore => prevScore + 1 + bonus);
      }
    } catch (err) {
      setError('Error submitting answer. Please try again.');
      console.error(err);
    }
  };

  // Load next question
  const handleNextQuestion = () => {
    setRound(prevRound => prevRound + 1);
    fetchQuestion();
  };

  // Load initial question on component mount
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
          <h2 className="game-title">Real or Fake Article Game</h2>
          <div className="feedback-incorrect">
            <p className="text-incorrect">{error}</p>
          </div>
          <div style={{textAlign: 'center', marginTop: '20px'}}>
            <button className="button-next" onClick={fetchQuestion}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="game-container">
      <div className="game-card">
        {/* Header with game info and timer */}
        <div className="game-header">
          <h2 className="game-title">Real or Fake Article Game</h2>
          <div className="game-stats">
            <div className="game-score">
              Round: {round} | Score: {score}
            </div>
            <div className={`game-timer ${timeElapsed > 15 ? 'timer-slow' : ''}`}>
              Time: {formatTime(timeElapsed)}
            </div>
          </div>
        </div>
        
        {/* Content */}
        {isLoading ? (
          <div className="loading">
            <div className="loading-text">Loading question...</div>
          </div>
        ) : (
          <>
            <div className="article-card">
              <h3 className="article-title">Article Snippet:</h3>
              <p className="article-content">{snippet}</p>
            </div>
            
            <div className="button-container">
              <button 
                className="button-real"
                onClick={() => handleAnswer('real')}
                disabled={hasAnswered}
              >
                <span className="icon">✓</span>
                Real Article
              </button>
              <button 
                className="button-fake"
                onClick={() => handleAnswer('fake')}
                disabled={hasAnswered}
              >
                <span className="icon">✗</span>
                Fake Article
              </button>
            </div>
            
            {feedback && (
              <div className={feedback.includes('Correct') ? 'feedback-correct' : 'feedback-incorrect'}>
                <p className={feedback.includes('Correct') ? 'text-correct' : 'text-incorrect'}>
                  {feedback}
                </p>
                {feedback.includes('Correct') && timeBonus > 0 && (
                  <p className="time-bonus">
                    Speed bonus: +{timeBonus} points (answered in {timeElapsed} seconds)
                  </p>
                )}
              </div>
            )}
            
            {hasAnswered && (
              <div style={{textAlign: 'center'}}>
                <button 
                  className="button-next"
                  onClick={handleNextQuestion}
                >
                  Next Question →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RealOrFakeGame;
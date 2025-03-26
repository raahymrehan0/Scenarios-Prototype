import React, { useState, useEffect, useRef } from 'react';
import './HeadlineGame.css';

const HeadlineGame = () => {
  const [snippet, setSnippet] = useState('');
  const [headlines, setHeadlines] = useState([]);
  const [questionId, setQuestionId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [hasAnswered, setHasAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [error, setError] = useState(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timeBonus, setTimeBonus] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const timerRef = useRef(null);

  // Timer functions (same as your RealOrFakeGame)
  const startTimer = () => {
    setTimeElapsed(0);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const calculateTimeBonus = (seconds) => {
    const maxBonus = 10;
    const pointsLostPerSecond = 0.40;
    const calculatedBonus = Math.max(0, maxBonus - (seconds * pointsLostPerSecond));
    return Math.round(calculatedBonus);
  };

  // Fetch a new question
  const fetchQuestion = async () => {
    setIsLoading(true);
    setHasAnswered(false);
    setFeedback('');
    setTimeBonus(0);
    
    try {
      console.log('Attempting to fetch question...');
      const response = await fetch('http://localhost:8000/api/headline_get_question/');
      
      if (!response.ok) {
        console.error('Response not OK:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received data:', data);
      // ... rest of your function
    } catch (err) {
      console.error('Full error details:', err);
      setError(`Error loading question: ${err.message}`);
      setIsLoading(false);
    }
  };

  // Handle user's answer
  const handleAnswer = async (selectedHeadline) => {
    if (hasAnswered) return;
    
    stopTimer();
    const bonus = calculateTimeBonus(timeElapsed);
    setTimeBonus(bonus);
    
    try {
      const response = await fetch('http://localhost:8000/api/headline_submit_answer/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question_id: questionId,
          selected_headline: selectedHeadline
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit answer');
      }
      
      const data = await response.json();
      setFeedback(data.feedback);
      setHasAnswered(true);
      
      // Update score if correct
      if (data.is_correct) {
        setScore(prevScore => prevScore + 1 + bonus);
      }
    } catch (err) {
      setError('Error submitting answer. Please try again.');
      console.error(err);
    }
  };

  // Load next question
  const handleNextQuestion = () => {
    if (round < totalQuestions) {
      setRound(prevRound => prevRound + 1);
      fetchQuestion();
    } else {
      setFeedback('Game completed! Final score: ' + score);
    }
  };

  // Load initial question on component mount
  useEffect(() => {
    fetchQuestion();
    
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
          <h2 className="game-title">Guess the Correct Headline</h2>
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
          <h2 className="game-title">Guess the Correct Headline</h2>
          <div className="game-stats">
            <div className="game-score">
              Round: {round}/{totalQuestions} | Score: {score}
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
            
            <div className="headline-options">
              {headlines.map((headline, index) => (
                <button
                  key={index}
                  className={`headline-button ${hasAnswered && headline === feedback.correct_answer ? 'correct-answer' : ''}`}
                  onClick={() => handleAnswer(headline)}
                  disabled={hasAnswered}
                >
                  {headline}
                </button>
              ))}
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
                  disabled={round >= totalQuestions}
                >
                  {round < totalQuestions ? 'Next Question →' : 'Finish Game'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HeadlineGame;
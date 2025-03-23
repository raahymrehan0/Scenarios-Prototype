import React, { useState, useEffect } from 'react';
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

  // Fetch a new question
  const fetchQuestion = async () => {
    setIsLoading(true);
    setHasAnswered(false);
    setFeedback('');
    
    try {
      const response = await fetch('http://localhost:8000/api/real_or_fake_question/');
      if (!response.ok) {
        throw new Error('Failed to fetch question');
      }
      const data = await response.json();
      setSnippet(data.snippet);
      setQuestionId(data.id);
    } catch (err) {
      setError('Error loading question. Please try again later.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle user's answer
  const handleAnswer = async (userAnswer) => {
    if (hasAnswered) return;
    
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
      
      // Update score if answer was correct
      if (data.feedback.includes('Correct')) {
        setScore(prevScore => prevScore + 1);
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
  }, []);

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
        {/* Header */}
        <div className="game-header">
          <h2 className="game-title">Real or Fake Article Game</h2>
          <div className="game-score">
            Round: {round} | Score: {score}
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
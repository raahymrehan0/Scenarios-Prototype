import React, { useState, useEffect } from 'react';
import './RealOrFakeGame.css';

const GuessTheHeadlineGame = () => {
  const [question, setQuestion] = useState({
    id: null,
    snippet: '',
    source: '',
    headlines: [],
    correct_headline: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [hasAnswered, setHasAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const roundLength = 5;

  // Fetch the next valid question in sequence
  const fetchQuestion = async () => {
    setIsLoading(true);
    setHasAnswered(false);
    setFeedback('');
    setTimeLeft(30);
    
    try {
      const url = 'http://localhost:8000/api/guess_headline_question/';
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to fetch question');
      }
      
      //// IMPORTANT: This doesn't work for the fake articles because it 
      // Verify the correct headline exists in the options
      //if (!data.headlines.includes(data.correct_headline)) {
      //  throw new Error('Invalid question configuration');
      //}
      
      setQuestion(data);
    } catch (err) {
      setError(err.message);
      console.error(err);
      
      // Try to fetch the next question if current one is invalid
      //if (questionId) {
      //  fetchQuestion(questionId);
      //}
    } finally {
      setIsLoading(false);
    }
  };

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !hasAnswered && !isLoading && !error) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !hasAnswered && !error) {
      handleAnswer(null);
    }
  }, [timeLeft, hasAnswered, isLoading, error]);

  // Handle user's answer
  const handleAnswer = async (selectedHeadline) => {
    if (hasAnswered || error) return;
    
    try {
      const response = await fetch('http://localhost:8000/api/guess_headline_answer/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          selected_headline: selectedHeadline,
          question_id: question.id
        })
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit answer');
      }
      
      setFeedback(data.feedback);
      setHasAnswered(true);
      
      if (data.is_correct) {
        setScore(prevScore => prevScore + 1);
      }
    } catch (err) {
      setError(err.message);
      console.error(err);
    }
  };

  // Load next question
  const handleNextQuestion = () => {
    if (round >= roundLength) {
      setGameOver(true);
    } else {
      setRound(prev => prev + 1);
      fetchQuestion();
    }
  };

  // Restart game
  const handleRestart = () => {
    setScore(0);
    setRound(1);
    setGameOver(false);
    setError(null);
    fetchQuestion();
  };

  // Load initial question
  useEffect(() => {
    fetchQuestion();
  }, []);

  if (error) {
    return (
      <div className="p-4 bg-white rounded shadow max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold mb-2">Guess the Headline Game</h2>
        <p className="text-red-500">{error}</p>
        <button 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={handleRestart}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="game-container">
      <div className="game-card">
      <div className="game-header">
          <h2 className="game-title">Game Over!</h2>
          <div className="game-score">
            Your score: {score}/{roundLength}
          </div>
        </div>
        <div className="button-container">
        <button className="button-real" onClick={handleRestart}>
          Play Again
        </button>
        </div>
      </div>
      </div>
    );
  }

  return (
    <div className="game-container">
      <div className="game-card">
      <div className="game-header">
          <h2 className="game-title">Guess the Headline Game</h2>
          <div className="game-score">
            <p>Question: {round}/{roundLength}</p>
            <p>Score: {score}</p>
            <p>Time: {timeLeft}s</p>
          </div>
        </div>
      
      {isLoading ? (
        <div className="loading">
          <div className="loading-text">Loading question...</div>
        </div>
      ) : (
        <>
            <div className="article-card">
            <h3 className="article-title">Source: {question.source}</h3>
            <p className="article-content">{question.snippet}</p>
          </div>
          
          <div className="button-container">
            {question.headlines.map((headline, index) => (
              <button
                key={index}
                className="button-real"
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
            </div>
          )}
          
          {hasAnswered && (
              <div style={{ textAlign: 'center' }}>
              <button className="button-next" onClick={handleNextQuestion}>{round < roundLength ? 'Next Question →' : 'See Results'}</button>
            </div>
          )}
        </>
      )}
    </div>
    </div>
  );
};

export default GuessTheHeadlineGame;
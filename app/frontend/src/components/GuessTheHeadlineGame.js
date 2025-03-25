import React, { useState, useEffect } from 'react';

const GuessTheHeadlineGame = () => {
  const [question, setQuestion] = useState({
    snippet: '',
    source: '',
    headlines: [],
    correct_headline: '',
    id: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [hasAnswered, setHasAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);

  // Fetch a new question
  const fetchQuestion = async () => {
    setIsLoading(true);
    setHasAnswered(false);
    setFeedback('');
    setTimeLeft(30);
    
    try {
      const response = await fetch('http://localhost:8000/api/get_question/');
      if (!response.ok) {
        throw new Error('Failed to fetch question');
      }
      const data = await response.json();
      setQuestion(data);
    } catch (err) {
      setError('Error loading question. Please try again later.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !hasAnswered && !isLoading) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !hasAnswered) {
      handleAnswer(null);
    }
  }, [timeLeft, hasAnswered, isLoading]);

  // Handle user's answer
  const handleAnswer = async (selectedHeadline) => {
    if (hasAnswered) return;
    
    try {
      const response = await fetch('http://localhost:8000/api/submit_answer/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          selected_headline: selectedHeadline,
          question_id: question.id
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit answer');
      }
      
      const data = await response.json();
      setFeedback(data.feedback);
      setHasAnswered(true);
      
      // Update score if answer was correct
      if (data.is_correct) {
        setScore(prevScore => prevScore + 1);
      }
    } catch (err) {
      setError('Error submitting answer. Please try again.');
      console.error(err);
    }
  };

  // Load next question
  const handleNextQuestion = () => {
    if (round >= 10) { // Game ends after 10 rounds
      setGameOver(true);
    } else {
      setRound(prevRound => prevRound + 1);
      fetchQuestion();
    }
  };

  // Restart game
  const handleRestart = () => {
    setScore(0);
    setRound(1);
    setGameOver(false);
    fetchQuestion();
  };

  // Load initial question on component mount
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
          onClick={fetchQuestion}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="p-4 bg-white rounded shadow max-w-2xl mx-auto text-center">
        <h2 className="text-xl font-semibold mb-2">Game Over!</h2>
        <p className="text-lg mb-4">Your final score: {score} out of {round}</p>
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={handleRestart}
        >
          Play Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded shadow max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-2">Guess the Headline Game</h2>
      <div className="flex justify-between mb-4">
        <p className="text-sm text-gray-600">Round: {round}/10</p>
        <p className="text-sm text-gray-600">Score: {score}</p>
        <p className="text-sm text-gray-600">Time: {timeLeft}s</p>
      </div>
      
      {isLoading ? (
        <p className="my-4">Loading question...</p>
      ) : (
        <>
          <div className="border p-4 rounded bg-gray-50 mb-4">
            <h3 className="font-medium mb-2">Source: {question.source}</h3>
            <p className="italic">{question.snippet}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {question.headlines.map((headline, index) => (
              <button
                key={index}
                className={`p-3 rounded text-left border ${
                  hasAnswered 
                    ? headline === question.correct_headline 
                      ? 'bg-green-100 border-green-500' 
                      : 'bg-gray-100'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => handleAnswer(headline)}
                disabled={hasAnswered}
              >
                {headline}
              </button>
            ))}
          </div>
          
          {feedback && (
            <div className={`p-3 rounded mb-4 ${
              feedback.includes('Correct') ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <p className="font-medium">{feedback}</p>
            </div>
          )}
          
          {hasAnswered && (
            <button 
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={handleNextQuestion}
            >
              {round < 10 ? 'Next Question' : 'See Results'}
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default GuessTheHeadlineGame;
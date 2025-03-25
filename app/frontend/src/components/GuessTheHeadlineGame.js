import React, { useState, useEffect } from 'react';

const GuessTheHeadlineGame = () => {
  const [question, setQuestion] = useState({
    id: null,
    snippet: '',
    source: '',
    headlines: [],
    correct_headline: '',
    total_questions: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [hasAnswered, setHasAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [currentQuestionNum, setCurrentQuestionNum] = useState(1);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);

  // Fetch the next valid question in sequence
  const fetchQuestion = async (questionId = null) => {
    setIsLoading(true);
    setHasAnswered(false);
    setFeedback('');
    setTimeLeft(30);
    
    try {
      const url = questionId 
        ? `http://localhost:8000/api/headline_get_question/?question_id=${questionId}`
        : 'http://localhost:8000/api/headline_get_question/';
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to fetch question');
      }
      
      // Verify the correct headline exists in the options
      if (!data.headlines.includes(data.correct_headline)) {
        throw new Error('Invalid question configuration');
      }
      
      setQuestion(data);
    } catch (err) {
      setError(err.message);
      console.error(err);
      
      // Try to fetch the next question if current one is invalid
      if (questionId) {
        fetchQuestion(questionId);
      }
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
      const response = await fetch('http://localhost:8000/api/headline_submit_answer/', {
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
    if (currentQuestionNum >= question.total_questions) {
      setGameOver(true);
    } else {
      setCurrentQuestionNum(prev => prev + 1);
      fetchQuestion(question.id);
    }
  };

  // Restart game
  const handleRestart = () => {
    setScore(0);
    setCurrentQuestionNum(1);
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
      <div className="p-4 bg-white rounded shadow max-w-2xl mx-auto text-center">
        <h2 className="text-xl font-semibold mb-2">Game Over!</h2>
        <p className="text-lg mb-4">Your score: {score}/{question.total_questions}</p>
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
        <p className="text-sm text-gray-600">Question: {currentQuestionNum}/{question.total_questions}</p>
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
              {currentQuestionNum < question.total_questions ? 'Next Question' : 'See Results'}
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default GuessTheHeadlineGame;
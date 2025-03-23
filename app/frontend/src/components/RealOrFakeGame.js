import React, { useState, useEffect } from 'react';

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
      <div className="p-4 bg-white rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Real or Fake Article Game</h2>
        <p className="text-red-500">{error}</p>
        <button className="btn mt-4" onClick={fetchQuestion}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-2">Real or Fake Article Game</h2>
      <div className="mb-4">
        <p className="text-sm text-gray-600">Round: {round} | Score: {score}</p>
      </div>
      
      {isLoading ? (
        <p className="my-4">Loading question...</p>
      ) : (
        <>
          <div className="border p-4 rounded bg-gray-50 mb-4">
            <h3 className="font-medium mb-2">Article Snippet:</h3>
            <p className="italic">{snippet}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <button 
              className="btn bg-green-500 hover:bg-green-600" 
              onClick={() => handleAnswer('real')}
              disabled={hasAnswered}
            >
              Real Article
            </button>
            <button 
              className="btn bg-red-500 hover:bg-red-600" 
              onClick={() => handleAnswer('fake')}
              disabled={hasAnswered}
            >
              Fake Article
            </button>
          </div>
          
          {feedback && (
            <div className={`p-3 rounded ${feedback.includes('Correct') ? 'bg-green-100' : 'bg-red-100'} mb-4`}>
              <p className="font-medium">{feedback}</p>
            </div>
          )}
          
          {hasAnswered && (
            <button className="btn" onClick={handleNextQuestion}>
              Next Question
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default RealOrFakeGame;
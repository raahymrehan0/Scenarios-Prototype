import React, { useState, useEffect } from 'react';
import './RealOrFakeGame.css';

const GuessTheSourceGame = () => {
  const [article, setArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [hasAnswered, setHasAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [error, setError] = useState(null);

  const fetchQuestion = async () => {
    setIsLoading(true);
    setHasAnswered(false);
    setFeedback('');

    try {
      const response = await fetch('http://localhost:8000/api/guess_source_question/');
      if (!response.ok) throw new Error('Failed to fetch question');
      const data = await response.json();
      setArticle(data);
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
  }, []);

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

import React from 'react';

const RealOrFakeGame = () => {
  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-2">Real or Fake Article Game</h2>
      <p>Game content goes here...</p>
    </div>
  );
};

export default RealOrFakeGame;







/*import React, { useState, useEffect } from 'react';

const RealOrFakeGame = () => {
  const [snippet, setSnippet] = useState('');
  const [answer, setAnswer] = useState(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    fetch('/api/real_or_fake_question/')
      .then(res => res.json())
      .then(data => {
        setSnippet(data.snippet);
      });
  }, []);

  const handleAnswer = (userAnswer) => {
    fetch('/api/real_or_fake_answer/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answer: userAnswer })
    })
      .then(res => res.json())
      .then(data => {
        setFeedback(data.feedback);
      });
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-2">Real or Fake Article</h2>
      <p className="mb-4">{snippet}</p>
      <div className="flex gap-2">
        <button className="btn" onClick={() => handleAnswer('real')}>Real</button>
        <button className="btn" onClick={() => handleAnswer('fake')}>Fake</button>
      </div>
      {feedback && <p className="mt-4 font-medium">{feedback}</p>}
    </div>
  );
};

export default RealOrFakeGame;
*/
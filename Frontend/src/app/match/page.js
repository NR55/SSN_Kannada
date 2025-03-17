"use client";

import { useState, useEffect } from "react";

const kannadaPronunciations = [
  { letter: "ಅ", pronunciation: "a" },
  { letter: "ಆ", pronunciation: "aa" },
  { letter: "ಇ", pronunciation: "i" },
  { letter: "ಈ", pronunciation: "ee" },
  { letter: "ಉ", pronunciation: "u" },
  { letter: "ಊ", pronunciation: "oo" },
];

export default function MatchGame() {
  const [shuffledLetters, setShuffledLetters] = useState([]);
  const [matches, setMatches] = useState({});
  const [result, setResult] = useState(null);

  // Use useEffect to shuffle only on the client
  useEffect(() => {
    setShuffledLetters([...kannadaPronunciations].sort(() => Math.random() - 0.5));
  }, []);

  const handleDrop = (e, pronunciation) => {
    const letter = e.dataTransfer.getData("letter");
    setMatches(prev => ({ ...prev, [pronunciation]: letter }));
  };

  const checkAnswer = () => {
    const isCorrect = kannadaPronunciations.every(({ letter, pronunciation }) => matches[pronunciation] === letter);
    setResult(isCorrect ? "✅ Correct! Well done!" : "❌ Incorrect! Try again.");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">Match Kannada Letters with Pronunciation</h1>

      <div className="grid grid-cols-2 gap-16">
        {/* Kannada Letters (Draggable Items) */}
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Kannada Letters</h2>
          {shuffledLetters.map(({ letter }) => (
            <div
              key={letter}
              className="p-4 text-2xl font-bold bg-blue-200 w-16 text-center rounded-lg cursor-pointer"
              draggable
              onDragStart={e => e.dataTransfer.setData("letter", letter)}
            >
              {letter}
            </div>
          ))}
        </div>

        {/* Pronunciations (Drop Targets) */}
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Pronunciations</h2>
          {kannadaPronunciations.map(({ pronunciation }) => (
            <div
              key={pronunciation}
              className="p-4 text-xl bg-green-200 w-24 text-center rounded-lg border-2 border-black"
              onDragOver={e => e.preventDefault()}
              onDrop={e => handleDrop(e, pronunciation)}
            >
              {matches[pronunciation] ? matches[pronunciation] : pronunciation}
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={checkAnswer}
        className="mt-6 px-6 py-3 bg-blue-500 text-white text-lg rounded-lg"
      >
        Check Answer
      </button>

      {result && <p className="mt-4 text-2xl">{result}</p>}
    </div>
  );
}

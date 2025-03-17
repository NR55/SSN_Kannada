"use client";

import { useState, useEffect } from "react";

const allKannadaPronunciations = [
  { letter: "ಅ", pronunciation: "a" },
  { letter: "ಆ", pronunciation: "aa" },
  { letter: "ಇ", pronunciation: "i" },
  { letter: "ಈ", pronunciation: "ii" },
  { letter: "ಉ", pronunciation: "u" },
  { letter: "ಊ", pronunciation: "uu" },
  { letter: "ಋ", pronunciation: "ru" },
  { letter: "ಎ", pronunciation: "e" },
  { letter: "ಏ", pronunciation: "ee" },
  { letter: "ಐ", pronunciation: "ai" },
  { letter: "ಒ", pronunciation: "o" },
  { letter: "ಓ", pronunciation: "oo" },
  { letter: "ಔ", pronunciation: "au" },

  { letter: "ಕ", pronunciation: "ka" },
  { letter: "ಖ", pronunciation: "kha" },
  { letter: "ಗ", pronunciation: "ga" },
  { letter: "ಘ", pronunciation: "gha" },
  { letter: "ಙ", pronunciation: "nga" },

  { letter: "ಚ", pronunciation: "cha" },
  { letter: "ಛ", pronunciation: "chha" },
  { letter: "ಜ", pronunciation: "ja" },
  { letter: "ಝ", pronunciation: "jha" },
  { letter: "ಞ", pronunciation: "nya" },

  { letter: "ಟ", pronunciation: "ṭa" },
  { letter: "ಠ", pronunciation: "ṭha" },
  { letter: "ಡ", pronunciation: "ḍa" },
  { letter: "ಢ", pronunciation: "ḍha" },
  { letter: "ಣ", pronunciation: "ṇa" },

  { letter: "ತ", pronunciation: "ta" },
  { letter: "ಥ", pronunciation: "tha" },
  { letter: "ದ", pronunciation: "da" },
  { letter: "ಧ", pronunciation: "dha" },
  { letter: "ನ", pronunciation: "na" },

  { letter: "ಪ", pronunciation: "pa" },
  { letter: "ಫ", pronunciation: "pha" },
  { letter: "ಬ", pronunciation: "ba" },
  { letter: "ಭ", pronunciation: "bha" },
  { letter: "ಮ", pronunciation: "ma" },

  { letter: "ಯ", pronunciation: "ya" },
  { letter: "ರ", pronunciation: "ra" },
  { letter: "ಲ", pronunciation: "la" },
  { letter: "ವ", pronunciation: "va" },
  { letter: "ಶ", pronunciation: "sha" },
  { letter: "ಷ", pronunciation: "ṣha" },
  { letter: "ಸ", pronunciation: "sa" },
  { letter: "ಹ", pronunciation: "ha" },
  { letter: "ಳ", pronunciation: "ḷa" },
  { letter: "ಕ್ಷ", pronunciation: "kṣa" },
  { letter: "ಜ್ಞ", pronunciation: "jña" }
];


export default function MatchGame() {
  const [selectedPairs, setSelectedPairs] = useState([]);
  const [shuffledLetters, setShuffledLetters] = useState([]);
  const [matches, setMatches] = useState({});
  const [results, setResults] = useState({});
  const [score, setScore] = useState(null);

  useEffect(() => {
    const shuffledPairs = [...allKannadaPronunciations]
      .sort(() => Math.random() - 0.5)
      .slice(0, 7);
    setSelectedPairs(shuffledPairs);
    setShuffledLetters([...shuffledPairs].sort(() => Math.random() - 0.5));
  }, []);

  const handleDrop = (e, pronunciation) => {
    const letter = e.dataTransfer.getData("letter");
    setMatches((prev) => ({ ...prev, [pronunciation]: letter }));
  };

  const checkAnswer = () => {
    let correctCount = 0;
    const newResults = {};

    selectedPairs.forEach(({ letter, pronunciation }) => {
      if (matches[pronunciation] === letter) {
        newResults[pronunciation] = "✅";
        correctCount++;
      } else {
        newResults[pronunciation] = "❌";
      }
    });

    setResults(newResults);
    setScore(correctCount + " / " + selectedPairs.length);
  };

  const clearAllMatches = () => {
    setMatches({});
    setResults({});
    setScore(null);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-6">Match Kannada Letters with Pronunciation</h1>

      <div className="grid grid-cols-2 gap-16">
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Kannada Letters</h2>
          {shuffledLetters.map(({ letter }) => (
            <div
              key={letter}
              className="p-4 text-2xl font-bold bg-purple-500 w-25 text-center rounded-lg cursor-pointer shadow-lg"
              draggable
              onDragStart={(e) => e.dataTransfer.setData("letter", letter)}
            >
              {letter}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Pronunciations</h2>
          {selectedPairs.map(({ pronunciation }) => (
            <div key={pronunciation} className="flex items-center gap-4">
              <div
                className="w-25 h-16 flex items-center justify-center bg-gray-700 border-2 border-white rounded-lg shadow-lg"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, pronunciation)}
              >
                {matches[pronunciation] ? <span className="text-2xl">{matches[pronunciation]}</span> : null}{results[pronunciation] || ""}
              </div>

              <div className="p-4 text-xl bg-teal-500 w-24 text-center rounded-lg border-2 border-white shadow-lg">
                {pronunciation} 
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4 mt-6">
        <button
          onClick={checkAnswer}
          className="px-6 py-3 bg-yellow-500 text-black text-lg rounded-lg shadow-lg hover:bg-yellow-400 cursor-pointer"
        >
          Check Answer
        </button>

        <button
          onClick={clearAllMatches}
          className="px-6 py-3 bg-red-500 text-white text-lg rounded-lg shadow-lg hover:bg-red-400 cursor-pointer"
        >
          Clear All
        </button>
      </div>

      {score !== null && <p className="mt-4 text-2xl">Score: {score}</p>}
    </div>
  );
}

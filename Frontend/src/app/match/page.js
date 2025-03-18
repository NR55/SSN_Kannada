"use client";

import { useState, useEffect } from "react";
import Howler from "react-howler";
import { Volume2 } from "lucide-react";
import { allKannadaPronunciations } from "@/data/kannadaPronunciations";

export default function MatchGame() {
  const [selectedPairs, setSelectedPairs] = useState([]);
  const [shuffledLetters, setShuffledLetters] = useState([]);
  const [matches, setMatches] = useState({});
  const [results, setResults] = useState({});
  const [score, setScore] = useState(null);
  const [playingSound, setPlayingSound] = useState(null);
  const [forceUpdate, setForceUpdate] = useState(0);

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
        newResults[pronunciation] = "   ✅";
        correctCount++;
      } else {
        newResults[pronunciation] = "   ❌";
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

  const playSound = (audioSrc) => {
    setPlayingSound(audioSrc);
    setForceUpdate((prev) => prev + 1);
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
          {selectedPairs.map(({ pronunciation, audioSrc }) => (
            <div key={pronunciation} className="flex items-center gap-4">
              <div
                className="w-25 h-16 flex items-center justify-center bg-gray-700 border-2 border-white rounded-lg shadow-lg"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, pronunciation)}
              >
                {matches[pronunciation] ? <span className="text-2xl">{matches[pronunciation]}</span> : null} 
                {results[pronunciation] || ""}
              </div>

              <div className="p-4 text-xl bg-teal-500 w-24 text-center rounded-lg border-2 border-white shadow-lg flex items-center justify-between">
                <span>{pronunciation}</span>
                <button onClick={() => playSound(audioSrc)}>
                  <Volume2 className="text-white w-6 h-6 cursor-pointer" />
                </button>
              </div>

              {playingSound === audioSrc && ( 
                 <Howler key={forceUpdate} src={playingSound} playing={true} onEnd={() => setPlayingSound(null)} /> 
               )}

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

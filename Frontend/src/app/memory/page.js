"use client";

import { useState, useEffect } from "react";

import { allKannadaLetters } from "@/data/kannadaLetters";

const getRandomLetters = () => {
  const shuffled = allKannadaLetters.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 6);
};

export default function MemoryGame() {
  const [kannadaLetters, setKannadaLetters] = useState(getRandomLetters);
  const [tiles, setTiles] = useState([]);
  const [selected, setSelected] = useState([]);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showInitialGrid, setShowInitialGrid] = useState(true);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    const shuffledTiles = [...kannadaLetters, ...kannadaLetters].sort(() => Math.random() - 0.5);
    setTiles(shuffledTiles.map(letter => ({ letter, revealed: true, matched: false })));

    const timer = setTimeout(() => {
      setTiles(shuffledTiles.map(letter => ({ letter, revealed: false, matched: false })));
      setShowInitialGrid(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [kannadaLetters]);

  useEffect(() => {
    if (!startTime || gameOver) return;
    const timer = setInterval(() => setElapsedTime(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(timer);
  }, [startTime, gameOver]);

  useEffect(() => {
    if (tiles.length > 0 && tiles.every(tile => tile.matched)) {
      setGameOver(true);
      setTimerRunning(false);
    }
  }, [tiles]);

  const handleTileClick = index => {
    if (showInitialGrid || selected.length === 2 || tiles[index].revealed || tiles[index].matched) return;
    if (!startTime) {
      setStartTime(Date.now());
      setTimerRunning(true);
    }

    const newTiles = [...tiles];
    newTiles[index].revealed = true;
    setTiles(newTiles);
    setSelected([...selected, index]);

    if (selected.length === 1) {
      setMoves(moves + 1);
      const firstIndex = selected[0];
      if (tiles[firstIndex].letter === tiles[index].letter) {
        setTimeout(() => {
          newTiles[firstIndex].matched = true;
          newTiles[index].matched = true;
          setTiles([...newTiles]);
          setSelected([]);
          setScore(score + 10);
        }, 500);
      } else {
        setTimeout(() => {
          newTiles[firstIndex].revealed = false;
          newTiles[index].revealed = false;
          setTiles([...newTiles]);
          setSelected([]);
        }, 500);
      }
    }
  };

  const giveUp = () => {
    setTiles(tiles.map(tile => ({ ...tile, revealed: true })));
    setGameOver(true);
    setTimerRunning(false);
  };

  const resetGame = () => {
    const newLetters = getRandomLetters();
    setKannadaLetters(newLetters);
    const shuffledTiles = [...newLetters, ...newLetters].sort(() => Math.random() - 0.5);
    setTiles(shuffledTiles.map(letter => ({ letter, revealed: true, matched: false })));
    setSelected([]);
    setMoves(0);
    setScore(0);
    setStartTime(null);
    setElapsedTime(0);
    setGameOver(false);
    setShowInitialGrid(true);
    setTimerRunning(false);

    setTimeout(() => {
      setTiles(shuffledTiles.map(letter => ({ letter, revealed: false, matched: false })));
      setShowInitialGrid(false);
    }, 5000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-900 text-white">
      <h1 className="text-4xl font-extrabold mb-4 text-yellow-400">Kannada Memory Game</h1>
      <p className="text-lg mb-4">Moves: {moves} | Score: {score} | Time: {timerRunning ? `${elapsedTime}s` : "Stopped"}</p>

      <div className="grid grid-cols-4 gap-4">
        {tiles.map((tile, index) => (
          <div
            key={index}
            className={`w-20 h-20 flex items-center justify-center border-4 rounded-lg text-3xl font-bold cursor-pointer transition-all duration-300 
              ${tile.revealed || tile.matched ? "bg-green-500 text-black border-green-700" : "bg-red-600 text-white border-red-800"}`}
            onClick={() => handleTileClick(index)}
          >
            {tile.revealed || tile.matched ? tile.letter : "?"}
          </div>
        ))}
      </div>

      {gameOver && (
        <div className="mt-6 p-4 bg-blue-500 text-white text-xl font-semibold rounded-lg">
          🎉 Game Over! Moves: {moves} | Score: {score} | Time: {elapsedTime}s
        </div>
      )}

      <div className="mt-6 flex gap-4">
        <button onClick={resetGame} className="px-6 py-3 bg-yellow-500 text-black text-lg rounded-lg font-bold shadow-md hover:bg-yellow-600 transition-all duration-300">
          Restart Game
        </button>
        <button onClick={giveUp} className="px-6 py-3 bg-red-500 text-white text-lg rounded-lg font-bold shadow-md hover:bg-red-600 transition-all duration-300">
          Give Up
        </button>
      </div>
    </div>
  );
}
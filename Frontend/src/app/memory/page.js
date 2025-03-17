"use client";

import { useState, useEffect } from "react";

const kannadaLetters = ["ಅ", "ಆ", "ಇ", "ಈ", "ಉ", "ಊ"];
const shuffledTiles = [...kannadaLetters, ...kannadaLetters].sort(() => Math.random() - 0.5);

export default function MemoryGame() {
  const [tiles, setTiles] = useState(shuffledTiles.map(letter => ({ letter, revealed: false, matched: false })));
  const [selected, setSelected] = useState([]);
  const [moves, setMoves] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    if (!startTime) return;
    const timer = setInterval(() => setElapsedTime(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  useEffect(() => {
    if (tiles.every(tile => tile.matched)) {
      setGameOver(true);
    }
  }, [tiles]);

  const handleTileClick = index => {
    if (!startTime) setStartTime(Date.now());
    if (selected.length === 2 || tiles[index].revealed || tiles[index].matched) return;

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

  const resetGame = () => {
    setTiles(shuffledTiles.map(letter => ({ letter, revealed: false, matched: false })));
    setSelected([]);
    setMoves(0);
    setStartTime(null);
    setElapsedTime(0);
    setGameOver(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-4">Kannada Memory Game</h1>
      <p className="text-lg mb-4">Moves: {moves} | Time: {elapsedTime}s</p>

      <div className="grid grid-cols-4 gap-4">
        {tiles.map((tile, index) => (
          <div
            key={index}
            className={`w-16 h-16 flex items-center justify-center border-2 rounded-lg text-2xl font-bold cursor-pointer 
              ${tile.revealed || tile.matched ? "bg-blue-300" : "bg-gray-400"}`}
            onClick={() => handleTileClick(index)}
          >
            {tile.revealed || tile.matched ? tile.letter : "?"}
          </div>
        ))}
      </div>

      {gameOver && (
        <div className="mt-6 p-4 bg-green-200 text-xl font-semibold rounded-lg">
          🎉 Game Over! Moves: {moves} | Time: {elapsedTime}s
        </div>
      )}

      <button onClick={resetGame} className="mt-6 px-6 py-3 bg-blue-500 text-white text-lg rounded-lg">
        Restart Game
      </button>
    </div>
  );
}

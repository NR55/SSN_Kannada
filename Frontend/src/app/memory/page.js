"use client";

import { useState, useEffect } from "react";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { auth } from "../../../lib/firebase";
import { allKannadaLetters } from "@/data/kannadaLetters";
import { FaHome, FaRedo } from "react-icons/fa";
import Link from "next/link";

const getRandomLetters = () => {
  const shuffled = allKannadaLetters.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 6);
};

export default function MemoryGame() {
  const db = getFirestore();
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
  const [userScores, setUserScores] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchUserScores(currentUser.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchUserScores = async (uid) => {
    if (!uid) return;
    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setUserScores(userSnap.data().memoryGameScores || []);
      }
    } catch (error) {
      console.error("Error fetching scores:", error);
    }
  };

  const updateUserScore = async (newScore) => {
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      const existingScores = userSnap.exists() ? userSnap.data().memoryGameScores || [] : [];
      
      const updatedScores = [...existingScores, newScore].slice(-5);
      await updateDoc(userRef, { memoryGameScores: updatedScores });

      setUserScores(updatedScores);
    } catch (error) {
      console.error("Error updating score:", error);
    }
  };

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

      const baseScore = (tiles.length / 2) * 10;
      const moveBonus = Math.max(0, 50 - moves);
      const timePenalty = Math.floor(elapsedTime / 2);
      const finalScore = Math.max(0, baseScore + moveBonus - timePenalty);

      setScore(finalScore);
      updateUserScore(finalScore);
    }
  }, [tiles]);

  const handleTileClick = (index) => {
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
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-b from-black via-purple-900 to-black text-white">
      <span className="absolute top-4 left-4 flex gap-4">
        <Link href="/home" className="bg-purple-800 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105">
          <FaHome className="text-xl" />
        </Link>
        <button onClick={() => window.location.reload()} className="bg-purple-800 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105">
          <FaRedo className="text-xl" />
        </button>
      </span>
      <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 text-yellow-400">Kannada Memory Game</h1>

      {/* Responsive layout: Stack on mobile, side-by-side on larger screens */}
      <div className="flex flex-col md:flex-row w-full max-w-5xl space-y-6 md:space-y-0 md:space-x-8">

        {/* Leaderboard */}
        <div className="w-full md:w-1/3 p-6 bg-gray-900 rounded-lg shadow-xl border border-purple-500 text-center">
          <h2 className="text-xl font-extrabold mb-4 text-yellow-400">Previous Points</h2>
          {userScores.length > 0 ? (
            <ul className="space-y-2">
              {userScores.map((s, index) => (
                <li key={index} className="text-lg font-semibold bg-purple-700 p-2 rounded-lg shadow-md">{s} pts</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">No scores yet</p>
          )}
        </div>

        {/* Game */}
        <div className="flex flex-col items-center w-full md:w-2/3">
          <p className="text-lg mb-4">Moves: {moves} | Score: {score} | Time: {timerRunning ? `${elapsedTime}s` : "Stopped"}</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
            {tiles.map((tile, index) => (
              <div key={index} className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center border-4 rounded-lg text-3xl font-bold" onClick={() => handleTileClick(index)}>
                {tile.revealed || tile.matched ? tile.letter : "?"}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Buttons Centered */}
      <div className="mt-6 flex gap-4 text-3xl">
        <button onClick={resetGame} className="border-2 p-2 rounded-2xl">Restart</button>
        <button onClick={giveUp} className="border-2 p-2 rounded-2xl">Give Up</button>
      </div>
    </div>
  );
}

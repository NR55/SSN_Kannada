"use client";

import { useState, useEffect } from "react";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { Volume2 } from "lucide-react";
import { allKannadaPronunciations } from "@/data/kannadaPronunciations";
import { auth } from "../../../lib/firebase"
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { FaHome, FaRedo } from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function MatchGame() {
  const router = useRouter();
  const db = getFirestore();
  const [user, setUser] = useState(null);
  const [userScores, setUserScores] = useState([]);
  const [selectedPairs, setSelectedPairs] = useState([]);
  const [shuffledLetters, setShuffledLetters] = useState([]);
  const [matches, setMatches] = useState({});
  const [results, setResults] = useState({});
  const [score, setScore] = useState(null);
  const [playingSound, setPlayingSound] = useState(null);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [draggingLetter, setDraggingLetter] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setInitialLoading(false);
        setUser(currentUser);
        fetchUserScores(currentUser.uid);
      } else {
        router.push("/");
      }
    });

    const shuffledPairs = [...allKannadaPronunciations]
      .sort(() => Math.random() - 0.5)
      .slice(0, 10);
    setSelectedPairs(shuffledPairs);
    setShuffledLetters([...shuffledPairs].sort(() => Math.random() - 0.5));
    setStartTime(Date.now());

    return () => unsubscribe();
  }, []);

  const fetchUserScores = async () => {
    const user = auth.currentUser;
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      setUserScores(userSnap.data().matchGameScores || []);
    }
  };

  // Handle start of drag/touch for letters
  const handleDragStart = (letter) => {
    setDraggingLetter(letter);
    return letter;
  };

  // Handle touch start for mobile
  const handleTouchStart = (e, letter) => {
    e.preventDefault();
    setDraggingLetter(letter);
  };

  // Handle drop for both mouse and touch
  const handleDrop = (e, pronunciation) => {
    e.preventDefault();
    // For mouse drag and drop
    const letter = e.dataTransfer ? e.dataTransfer.getData("letter") : draggingLetter;
    
    if (letter) {
      setMatches((prev) => ({ ...prev, [pronunciation]: letter }));
      setDraggingLetter(null);
    }
  };

  // Handle touch end for mobile
  const handleTouchEnd = (e, pronunciation) => {
    e.preventDefault();
    if (draggingLetter) {
      setMatches((prev) => ({ ...prev, [pronunciation]: draggingLetter }));
      setDraggingLetter(null);
    }
  };

  const checkAnswer = async () => {
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

    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const calculatedScore = Math.max(
      0,
      Math.round((correctCount / selectedPairs.length) * 100 - timeTaken / 2)
    );

    setResults(newResults);
    setScore(calculatedScore);
    await updateUserScore(calculatedScore);
    fetchUserScores();
  };

  const updateUserScore = async (newScore) => {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    const existingScores = userSnap.exists() ? userSnap.data().matchGameScores || [] : [];
    const updatedScores = [...existingScores, newScore].slice(-7);

    await updateDoc(userRef, {
      matchGameScores: updatedScores
    });
  };

  const clearAllMatches = () => {
    setMatches({});
    setResults({});
    setScore(null);
    setStartTime(Date.now());
  };

  const playSound = (audioSrc) => {
    const audio = new Audio(audioSrc);
    audio.play().catch((error) => console.error("Error playing audio:", error));
    setPlayingSound(audioSrc);
    setForceUpdate((prev) => prev + 1);
  };

  if (initialLoading) {
      return (
          <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-black via-purple-950 to-black text-white">
              <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
                  <h2 className="text-xl font-semibold text-purple-200">Initializing...</h2>
                  <p className="text-purple-400 mt-2">Please wait while we check your session</p>
              </div>
          </div>
      );
  }

  return (
    <div className="relative w-full min-h-screen flex flex-col">
      <span className="absolute top-4 left-4 flex gap-4">
        <Link href="/home" className="bg-purple-800 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105">
          <FaHome className="text-xl" />
        </Link>
        <button onClick={() => window.location.reload()} className="bg-purple-800 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105">
          <FaRedo className="text-xl" />
        </button>
      </span>

      <div className="flex flex-col md:flex-row items-center justify-center flex-grow w-full bg-gradient-to-b from-black via-purple-900 to-black text-white p-4 md:p-8 gap-6">

        {/* Leaderboard - Left 1/3 */}
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

        {/* Letters - Middle 1/3 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 gap-4 md:gap-8 w-full md:w-1/3">
          {shuffledLetters.map(({ letter }) => (
            <div
              key={letter}
              className={`p-4 text-2xl font-bold bg-purple-500 w-20 sm:w-24 text-center rounded-lg cursor-pointer shadow-lg mx-auto ${draggingLetter === letter ? 'opacity-50' : ''}`}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("letter", letter);
                handleDragStart(letter);
              }}
              onTouchStart={(e) => handleTouchStart(e, letter)}
              onClick={() => handleDragStart(letter)}
            >
              {letter}
            </div>
          ))}
        </div>

        {/* Pronunciations - Right 1/3 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 gap-4 md:gap-8 w-full md:w-1/3">
          {selectedPairs.map(({ pronunciation, audioSrc }) => (
            <div key={pronunciation} className="flex flex-col sm:flex-row items-center gap-4">
              <div
                className={`w-20 sm:w-24 h-16 flex items-center justify-center bg-gray-700 border-2 border-white rounded-lg shadow-lg ${draggingLetter ? 'border-yellow-400 border-4 cursor-pointer' : ''}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, pronunciation)}
                onTouchEnd={(e) => handleTouchEnd(e, pronunciation)}
                onClick={() => {
                  if (draggingLetter) {
                    setMatches((prev) => ({ ...prev, [pronunciation]: draggingLetter }));
                    setDraggingLetter(null);
                  }
                }}
              >
                {matches[pronunciation] ? <span className="text-2xl">{matches[pronunciation]}</span> : null}
                {results[pronunciation] || ""}
              </div>
              <div className="p-3 sm:p-4 text-lg sm:text-xl bg-black w-28 sm:w-32 text-center rounded-lg border-2 border-white shadow-lg flex items-center justify-between">
                <span>{pronunciation}</span>
                <button onClick={() => playSound(audioSrc)}>
                  <Volume2 className="text-white w-5 sm:w-6 h-5 sm:h-6 cursor-pointer" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 flex flex-col sm:flex-row justify-center gap-4 px-4 py-6 bg-black">
        <button onClick={checkAnswer} className="px-6 py-3 bg-yellow-500 text-black text-lg rounded-lg shadow-lg hover:bg-yellow-400 transition w-full sm:w-auto">
          Check Answer
        </button>
        <button onClick={clearAllMatches} className="px-6 py-3 bg-red-500 text-white text-lg rounded-lg shadow-lg hover:bg-red-400 transition w-full sm:w-auto">
          Clear All
        </button>
      </div>

      {/* {draggingLetter && (
        <div className="fixed bottom-16 left-0 right-0 bg-yellow-500 text-black py-2 text-center font-bold">
          Currently selected: {draggingLetter} - Tap a drop zone to place it
        </div>
      )} */}
    </div>
  );
}
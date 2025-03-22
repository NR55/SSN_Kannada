"use client";

import { useRef, useState, useEffect } from "react";
import { ReactSketchCanvas } from "react-sketch-canvas";

import { allKannadaPronunciations } from "@/data/kannadaPronunciations";
import { getWrite2Level, updateWrite2Level } from "../../../lib/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const auth = getAuth();

export default function Learn() {
  const canvasRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prediction, setPrediction] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [canvasKey, setCanvasKey] = useState(0);
  const [write2level, setWrite2Level] = useState(1);
  const audioRef = useRef(null);

  useEffect(() => {
    async function fetchWrite2Level(uid) {
      if (!uid) return; // Ensure UID is available
      const level = await getWrite2Level(uid);
      setWrite2Level(level || 1);
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchWrite2Level(user.uid); // Pass user's UID
      }
    });

    return () => unsubscribe(); // Cleanup listener
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (canvasRef.current) {
        canvasRef.current.clearCanvas();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [canvasKey]);

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  const sendDrawing = async () => {
    if (!canvasRef.current) return;
    setFeedback("🔍 Checking...");

    try {
      const paths = await canvasRef.current.exportPaths();
      if (!paths.length) {
        setFeedback("⚠️ Please draw something first");
        return;
      }

      const dataUrl = await canvasRef.current.exportImage("png");
      const imageBase64 = dataUrl.split(",")[1];

      const response = await fetch("http://localhost:5000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageBase64 }),
      });

      if (!response.ok) throw new Error("Failed to get prediction");

      const data = await response.json();
      setPrediction(data.prediction || "Error");

      const auth = getAuth();
      const user = auth.currentUser;

      if (data.prediction === allKannadaPronunciations[currentIndex].letter) {
        setFeedback("✅ Correct! Well done!");
        if (user) {
          const newLevel = Math.max(write2level, currentIndex + 2);
          if (newLevel > write2level) {
            await updateWrite2Level(user.uid, newLevel); // Send UID for update
            setWrite2Level(newLevel);
          }
        }
      } else {
        setFeedback(`❌ Incorrect! You wrote: ${data.prediction}`);
      }
    } catch (error) {
      console.error("Error sending drawing:", error);
      setFeedback("⚠️ Error processing your drawing. Please try again.");
    }
  };

  const changeLetter = (index) => {
    if (index >= write2level) return;
    setCurrentIndex(index);
    setPrediction(null);
    setFeedback(null);
    setCanvasKey((prevKey) => prevKey + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-900 to-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        <nav className="bg-gray-900 p-4 rounded-xl shadow-md mb-8 border border-purple-900">
          <div className="flex flex-wrap gap-2 justify-center">
            {allKannadaPronunciations.map((data, index) => (
              <button
                key={index}
                className={`px-5 py-2 text-xl font-bold rounded-lg transition-all ${index === currentIndex
                    ? "bg-purple-600 text-white scale-105 shadow-md"
                    : index < write2level
                      ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      : "bg-gray-600 text-gray-500 cursor-not-allowed"
                  }`}
                onClick={() => changeLetter(index)}
                disabled={index >= write2level}
              >
                {data.letter}
              </button>
            ))}
          </div>
        </nav>

        <div className="text-center text-gray-300 mb-4">
          <p>Unlocked levels: {write2level}/{allKannadaPronunciations.length}</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-center justify-center mb-8">
          <div className="bg-gray-900 rounded-xl shadow-xl p-6 flex flex-col items-center border border-purple-800 w-full md:w-96 min-h-[500px] flex-1">
            <h2 className="text-gray-300 text-xl mb-4">Original Letter</h2>
            <div className="h-80 w-80 flex items-center justify-center border-2 border-purple-800 rounded-lg bg-gray-900">
              <span className="text-[160px] font-bold text-white-400">{allKannadaPronunciations[currentIndex].letter}</span>
            </div>
            <button onClick={playAudio} className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">🔊 Play Pronunciation</button>
            <audio ref={audioRef} src={allKannadaPronunciations[currentIndex].audioSrc} />
            <p className="mt-4 text-gray-400">Pronunciation: {allKannadaPronunciations[currentIndex].pronunciation}</p>
          </div>

          <div className="bg-gray-900 rounded-xl shadow-xl p-6 border border-purple-800 w-full md:w-96 min-h-[500px] flex-1 flex flex-col items-center">
            <h2 className="text-gray-300 text-xl mb-4">Trace Here</h2>
            <div className="relative w-[320px] h-[320px] flex items-center justify-center">
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 opacity-20 text-[200px] pointer-events-none select-none">
                {allKannadaPronunciations[currentIndex].letter}
              </div>
              <ReactSketchCanvas
                key={canvasKey}
                ref={canvasRef}
                strokeWidth={5}
                strokeColor="black"
                canvasColor="white"
                exportWithBackgroundImage={false}
                width={320}
                height={320}
                className="border-2 border-purple-800 rounded-lg shadow-md"
              />
            </div>
            <div className="mt-4 flex gap-2 w-full">
              <button onClick={sendDrawing} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Check</button>
              <button onClick={() => canvasRef.current.clearCanvas()} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">Clear</button>
            </div>
            <p className="mt-4 text-gray-300">{feedback}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
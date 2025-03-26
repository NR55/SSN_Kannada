"use client";

import { useRef, useState, useEffect } from "react";
import { ReactSketchCanvas } from "react-sketch-canvas";
import confetti from "canvas-confetti";
import Link from "next/link";
import { FaHome } from "react-icons/fa";
import { allKannadaPronunciations } from "@/data/kannadaPronunciations";
import { getWrite2Level, updateWrite2Level } from "../../../lib/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const auth = getAuth();

export default function Learn() {
  const canvasRef = useRef(null);
  const confettiCanvasRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prediction, setPrediction] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [feedbackType, setFeedbackType] = useState(null);
  const [canvasKey, setCanvasKey] = useState(0);
  const [write2level, setWrite2Level] = useState(1);
  const audioRef = useRef(null);
  const correctAudioRef = useRef(null);
  const wrongAudioRef = useRef(null);
  const [shakeCanvas, setShakeCanvas] = useState(false);

  useEffect(() => {
    async function fetchWrite2Level(uid) {
      if (!uid) return;
      const level = await getWrite2Level(uid);
      setWrite2Level(level || 1);
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchWrite2Level(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (canvasRef.current) {
        canvasRef.current.clearCanvas();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [canvasKey]);

  const triggerConfetti = () => {
    const myConfetti = confetti.create(confettiCanvasRef.current, {
      resize: true,
      useWorker: true
    });
    myConfetti({
      particleCount: 300,
      spread: 160,
      origin: { y: 0.5, x: 0.5 },
      disableForReducedMotion: true
    });
  };

  const playAudio = (audioRef) => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  const sendDrawing = async () => {
    if (!canvasRef.current) return;
    setFeedback("Checking...");
    setFeedbackType("checking");

    try {
      const paths = await canvasRef.current.exportPaths();
      if (!paths.length) {
        setFeedback("Please draw something first");
        setFeedbackType("error");
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
        setFeedback("Correct! Well done!");
        setFeedbackType("correct");
        playAudio(correctAudioRef);
        triggerConfetti();

        if (user) {
          const newLevel = Math.max(write2level, currentIndex + 2);
          if (newLevel > write2level) {
            await updateWrite2Level(user.uid, newLevel);
            setWrite2Level(newLevel);
          }
        }
      } else {
        // setFeedback(`Incorrect! Please try again.`);
        // setFeedbackType("error");
        // playAudio(wrongAudioRef);
        // setShakeCanvas(true);
        // setTimeout(() => setShakeCanvas(false), 500);
        setFeedback(`Incorrect! Please try again.`);
        setFeedbackType("error");
        playAudio(wrongAudioRef);
        setShakeCanvas(true);
        setTimeout(() => setShakeCanvas(false), 500);
      }
    } catch (error) {
      console.error("Error sending drawing:", error);
      setFeedback("Error processing your drawing. Please try again.");
      setFeedbackType("error");
    }
  };

  const changeLetter = (index) => {
    if (index >= write2level) return;
    setCurrentIndex(index);
    setPrediction(null);
    setFeedback(null);
    setFeedbackType(null);
    setCanvasKey((prevKey) => prevKey + 1);
  };

  const getFeedbackStyles = () => {
    switch (feedbackType) {
      case "checking":
        return "bg-yellow-500/20 border border-yellow-500 text-yellow-200";
      case "correct":
        return "bg-green-500/20 border border-green-500 text-green-200";
      case "error":
        return "bg-red-500/20 border border-red-500 text-red-200";
      default:
        return "text-gray-300";
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b from-black via-purple-900 to-black text-white p-6 relative ${shakeCanvas ? "animate-shake" : ""}`}>
    {/* <div className="min-h-screen bg-gradient-to-b from-black via-purple-900 to-black text-white p-6 relative"> */}
      <Link href="/home" className="absolute top-4 left-4 bg-purple-800 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105">
        <span>
          <FaHome className="text-xl" />
        </span>
      </Link>

      <canvas
        ref={confettiCanvasRef}
        className="fixed inset-0 pointer-events-none z-50 w-full h-full"
      />

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

        <div className="flex flex-col md:flex-row gap-8 items-stretch justify-center mb-8">
          {/* Original Letter Pane */}
          <div className="bg-gray-900 rounded-xl shadow-xl p-6 flex flex-col items-center border border-purple-800 w-full md:w-1/2 min-h-[520px]">
            <h2 className="text-gray-300 text-xl mb-4">Original Letter</h2>
            <div className="h-80 w-80 flex items-center justify-center border-2 border-purple-800 rounded-lg bg-gray-900">
              <span className="text-[160px] font-bold text-white-400">
                {allKannadaPronunciations[currentIndex].letter}
              </span>
            </div>
            <button onClick={() => playAudio(audioRef)} className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">🔊 Play Pronunciation</button>
            <audio ref={audioRef} src={allKannadaPronunciations[currentIndex].audioSrc} />
            <p className="mt-4 text-gray-400">Pronunciation: {allKannadaPronunciations[currentIndex].pronunciation}</p>
          </div>

          <div className={`bg-gray-900 rounded-xl shadow-xl p-6 border border-purple-800 w-full md:w-1/2 min-h-[520px] flex flex-col items-center ${shakeCanvas ? "animate-shake" : ""}`}>
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

            {/* Fixed-height container for buttons and feedback */}
            <div className="mt-4 w-full flex flex-col flex-grow">
              <div className="flex gap-2 w-full">
                <button onClick={sendDrawing} className="cursor-pointer flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Check</button>
                <button onClick={() => {
                  canvasRef.current.clearCanvas();
                  setFeedback(null);
                  setFeedbackType(null);
                }} className="cursor-pointer flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">Clear</button>
              </div>

              {/* Feedback box with fixed height */}
              <div className="mt-4 min-h-[60px] flex items-center justify-center">
                {feedback && (
                  <div className={`p-3 rounded-lg w-full text-center ${getFeedbackStyles()}`}>
                    {feedback}
                  </div>
                )}
              </div>
              <audio ref={correctAudioRef} src="/audio/tracks/claps.mp3" />
              <audio ref={wrongAudioRef} src="/audio/tracks/error.mp3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

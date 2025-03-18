"use client";

import { useRef, useState, useEffect } from "react";
import { ReactSketchCanvas } from "react-sketch-canvas";

import { allKannadaPronunciations } from "@/data/kannadaPronunciations";

export default function Learn() {
  const canvasRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prediction, setPrediction] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [canvasKey, setCanvasKey] = useState(0);
  const audioRef = useRef(null);

  const currentLetterData = allKannadaPronunciations[currentIndex];

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
      setFeedback(
        data.prediction === currentLetterData.letter
          ? "✅ Correct! Well done!"
          : `❌ Incorrect! You wrote: ${data.prediction}`
      );
    } catch (error) {
      console.error("Error sending drawing:", error);
      setFeedback("⚠️ Error processing your drawing. Please try again.");
    }
  };

  const changeLetter = (index) => {
    setCurrentIndex(index);
    setPrediction(null);
    setFeedback(null);
    setCanvasKey(prevKey => prevKey + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-900 to-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-white-300 mb-2">
            ✏️ Kannada Letter Tracing
          </h1>
          <p className="text-gray-300">Learn to write Kannada characters by tracing them</p>
        </header>

        <nav className="bg-gray-900 p-4 rounded-xl shadow-md mb-8 border border-purple-900">
          <div className="flex flex-wrap gap-2 justify-center">
            {allKannadaPronunciations.map((data, index) => (
              <button
                key={index}
                className={`px-5 py-2 text-xl font-bold rounded-lg transition-all ${index === currentIndex ? "bg-purple-600 text-white scale-105 shadow-md" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}
                onClick={() => changeLetter(index)}
              >
                {data.letter}
              </button>
            ))}
          </div>
        </nav>

        <div className="flex flex-col md:flex-row gap-8 items-center justify-center mb-8">
          {/* Original Letter Panel */}
          <div className="bg-gray-900 rounded-xl shadow-xl p-6 flex flex-col items-center border border-purple-800 w-full md:w-96 min-h-[500px] flex-1">
            <h2 className="text-gray-300 text-xl mb-4">Original Letter</h2>
            <div className="h-80 w-80 flex items-center justify-center border-2 border-purple-800 rounded-lg bg-gray-900">
              <span className="text-[160px] font-bold text-white-400">{currentLetterData.letter}</span>
            </div>
            <button onClick={playAudio} className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">🔊 Play Pronunciation</button>
            <audio ref={audioRef} src={currentLetterData.audioSrc} />
            <p className="mt-4 text-gray-400">Pronunciation: {currentLetterData.pronunciation}</p>
          </div>

          {/* Trace Here Panel */}
          <div className="bg-gray-900 rounded-xl shadow-xl p-6 border border-purple-800 w-full md:w-96 min-h-[500px] flex-1 flex flex-col items-center">
            <h2 className="text-gray-300 text-xl mb-4">Trace Here</h2>
            <div className="relative w-[320px] h-[320px] flex items-center justify-center">
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 opacity-20 text-[200px] pointer-events-none select-none">
                {currentLetterData.letter}
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
              <button onClick={() => canvasRef.current.clearCanvas()} className="flex-1 px-4 py-2 bg-gray-800 text-gray-200 rounded-lg hover:bg-gray-700">🗑️ Clear</button>
              <button onClick={sendDrawing} className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">✅ Check</button>
            </div>
          </div>
        </div>
        {feedback && (
          <div
            className={`w-full max-w-md mx-auto p-4 text-center rounded-lg shadow-md 
            ${feedback.includes("✅") ? "bg-green-900 border-l-4 border-green-500 text-green-200" :
              feedback.includes("❌") ? "bg-red-900 border-l-4 border-red-500 text-red-200" :
                                        "bg-yellow-900 border-l-4 border-purple-500 text-white-200"}`}>
            <p className="text-xl font-medium">{feedback}</p>
          </div>
        )}
        <div className="flex justify-center gap-4 mt-6">
          <button onClick={() => changeLetter((currentIndex - 1 + allKannadaPronunciations.length) % allKannadaPronunciations.length)} className="px-6 py-3 bg-purple-700 text-white rounded-lg shadow-md hover:bg-purple-800">⬅️ Previous</button>
          <button onClick={() => changeLetter((currentIndex + 1) % allKannadaPronunciations.length)} className="px-6 py-3 bg-purple-700 text-white rounded-lg shadow-md hover:bg-purple-800">Next ➡️</button>
        </div>
      </div>
    </div>
  );
}

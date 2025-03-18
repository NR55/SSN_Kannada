"use client";

import { useRef, useState, useEffect } from "react";
import { ReactSketchCanvas } from "react-sketch-canvas";

// const kannadaLetters = ["ಅ", "ಆ", "ಇ", "ಈ", "ಉ", "ಊ", "ಋ", "ಎ", "ಏ", "ಐ"];
const kannadaLetters = ["ಅ", "ಆ", "ಇ", "ಈ", "ಉ", "ಊ", "ಋ", "ಎ", "ಏ", "ಐ", "ಒ", "ಓ", "ಅಂ", "ಅಃ", "ಔ", "ಕ", "ಖ", "ಗ", "ಘ", "ಙ", "ಚ", "ಛ", "ಜ", "ಝ", "ಞ", "ಟ", "ಠ", "ಡ", "ಢ", "ಣ", "ತ", "ಥ", "ದ", "ಧ", "ನ", "ಪ", "ಫ", "ಬ", "ಭ", "ಮ", "ಯ", "ರ", "ಲ", "ವ", "ಶ", "ಷ", "ಸ", "ಹ", "ಳ"];


export default function Learn() {
  const canvasRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prediction, setPrediction] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [canvasKey, setCanvasKey] = useState(0); // Add key to force re-render

  const currentLetter = kannadaLetters[currentIndex];

  // Reset canvas when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      if (canvasRef.current) {
        canvasRef.current.clearCanvas();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [canvasKey]);

  const sendDrawing = async () => {
    if (!canvasRef.current) return;

    setFeedback("🔍 Checking...");

    try {
      // Ensure canvas has content before exporting
      const paths = await canvasRef.current.exportPaths();
      if (!paths.length) {
        setFeedback("⚠️ Please draw something first");
        return;
      }

      const dataUrl = await canvasRef.current.exportImage("png");
      const imageBase64 = dataUrl.split(",")[1];

      const response = await fetch("http://192.168.29.176:5000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageBase64 }),
      });

      if (!response.ok) throw new Error("Failed to get prediction");

      const data = await response.json();
      setPrediction(data.prediction || "Error");

      setFeedback(
        data.prediction === currentLetter
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
    if (canvasRef.current) {
      canvasRef.current.clearCanvas();
    }
    // Force canvas re-render to ensure it's fresh
    setCanvasKey(prevKey => prevKey + 1);
  };

  const clearCanvas = () => {
    if (canvasRef.current) {
      canvasRef.current.clearCanvas();
      setFeedback(null);
    }
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

        {/* Letter Navigation Menu */}
        <nav className="bg-gray-900 p-4 rounded-xl shadow-md mb-8 border border-blue-900">
          <div className="flex flex-wrap gap-2 justify-center">
            {kannadaLetters.map((letter, index) => (
              <button
                key={index}
                className={`px-5 py-2 text-xl font-bold rounded-lg transition-all ${index === currentIndex
                    ? "bg-blue-600 text-white scale-105 shadow-md"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                onClick={() => changeLetter(index)}
              >
                {letter}
              </button>
            ))}
          </div>
        </nav>

        <div className="flex flex-col md:flex-row gap-8 items-center justify-center mb-8">
          {/* Original Letter Display */}
          <div className="bg-gray-900 rounded-xl shadow-xl p-6 flex flex-col items-center border border-blue-800 w-full md:w-96">
            <h2 className="text-gray-300 text-xl mb-4">Original Letter</h2>
            <div className="h-80 w-80 flex items-center justify-center border-2 border-blue-800 rounded-lg bg-gray-900">
              <span className="text-[160px] font-bold text-white-400">
                {currentLetter}
              </span>
            </div>
            <p className="mt-4 text-gray-400 text-center">
              Character {currentIndex + 1} of {kannadaLetters.length}
            </p>
          </div>

          {/* Drawing Canvas */}
          <div className="bg-gray-900 rounded-xl shadow-xl p-6 border border-blue-800 w-full md:w-96">
            <h2 className="text-gray-300 text-xl mb-4">Trace Here</h2>
            <div className="relative h-80 w-80">
              {/* Container for the letter watermark */}
              <div className="absolute inset-0 flex items-center justify-center text-[160px] font-bold text-gray-400 opacity-20 pointer-events-none select-none">
                {currentLetter}
              </div>

              {/* Drawing Canvas with white background and black ink */}
              <ReactSketchCanvas
                key={canvasKey}
                ref={canvasRef}
                strokeWidth={5}
                strokeColor="black"
                canvasColor="white"
                exportWithBackgroundImage={false}
                width={320}
                height={320}
                preserveBackgroundImageAspectRatio="none"
                withTimestamp={true}
                allowOnlyPointerType="all"
                eraserWidth={10}
                className="border-2 border-blue-800 rounded-lg shadow-md"
                style={{ touchAction: "none" }}
              />
            </div>

            {/* Canvas Controls */}
            <div className="mt-4 flex gap-2">
              <button
                onClick={clearCanvas}
                className="flex-1 px-4 py-2 bg-gray-800 text-gray-200 rounded-lg hover:bg-gray-700 transition"
              >
                🗑️ Clear
              </button>
              <button
                onClick={sendDrawing}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                ✅ Check
              </button>
            </div>
          </div>
        </div>

        {/* Feedback Section */}
        {feedback && (
          <div
            className={`w-full max-w-md mx-auto p-4 text-center rounded-lg shadow-md ${feedback.includes("✅")
                ? "bg-green-900 border-l-4 border-green-500 text-green-200"
                : feedback.includes("❌")
                  ? "bg-red-900 border-l-4 border-red-500 text-red-200"
                  : "bg-blue-900 border-l-4 border-blue-500 text-white-200"
              }`}
          >
            <p className="text-xl font-medium">{feedback}</p>
          </div>
        )}

        {/* Navigation Controls */}
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={() =>
              changeLetter((currentIndex - 1 + kannadaLetters.length) % kannadaLetters.length)
            }
            className="px-6 py-3 bg-blue-700 text-white rounded-lg shadow-md hover:bg-blue-800 transition flex items-center gap-2"
          >
            <span>⬅️</span> Previous
          </button>

          <button
            onClick={() => changeLetter((currentIndex + 1) % kannadaLetters.length)}
            className="px-6 py-3 bg-blue-700 text-white rounded-lg shadow-md hover:bg-blue-800 transition flex items-center gap-2"
          >
            Next <span>➡️</span>
          </button>
        </div>
      </div>
    </div>
  );
}
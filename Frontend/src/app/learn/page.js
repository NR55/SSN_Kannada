"use client";

import { useRef, useState } from "react";
import { ReactSketchCanvas } from "react-sketch-canvas";

const kannadaLetters = ["ಅ", "ಆ", "ಇ", "ಈ", "ಉ", "ಊ", "ಋ", "ಎ", "ಏ", "ಐ"];

export default function Learn() {
  const canvasRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prediction, setPrediction] = useState(null);

  const currentLetter = kannadaLetters[currentIndex];

  const sendDrawing = async () => {
    if (!canvasRef.current) return;

    try {
      const dataUrl = await canvasRef.current.exportImage("png");
      const imageBase64 = dataUrl.split(",")[1];

      const response = await fetch("http://localhost:5000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageBase64 }),
      });
      const data = await response.json();
      setPrediction(data.prediction || "Error");
    } catch (error) {
      console.error("Error sending drawing:", error);
      setPrediction("Error");
    }
  };

  const changeLetter = (index) => {
    setCurrentIndex(index);
    setPrediction(null);
    canvasRef.current.clearCanvas();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-yellow-100">
      <h1 className="text-3xl font-bold mb-4">✏️ Trace the Kannada Letter</h1>

      {/* Letter Navigation Menu */}
      <div className="flex flex-wrap gap-2 mb-4">
        {kannadaLetters.map((letter, index) => (
          <button
            key={index}
            className={`px-4 py-2 text-xl font-bold rounded-lg transition-all ${
              index === currentIndex ? "bg-blue-500 text-white" : "bg-gray-300"
            }`}
            onClick={() => changeLetter(index)}
          >
            {letter}
          </button>
        ))}
      </div>

      <div className="relative">
        {/* Watermark Letter for Tracing */}
        <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-[200px] font-extrabold pointer-events-none">
          {currentLetter}
        </div>

        {/* Drawing Canvas */}
        <ReactSketchCanvas
          ref={canvasRef}
          strokeWidth={8}
          strokeColor="black"
          width={300}
          height={300}
          className="border-4 border-gray-600 bg-white relative"
        />
      </div>

      {/* Buttons */}
      <div className="mt-4 flex gap-4">
        <button
          onClick={() => changeLetter((currentIndex - 1 + kannadaLetters.length) % kannadaLetters.length)}
          className="px-6 py-2 bg-gray-500 text-white rounded-lg"
        >
          ⬅️ Prev
        </button>

        <button
          onClick={sendDrawing}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg"
        >
          ✅ Check
        </button>

        <button
          onClick={() => canvasRef.current.clearCanvas()}
          className="px-6 py-2 bg-red-500 text-white rounded-lg"
        >
          🗑️ Clear
        </button>

        <button
          onClick={() => changeLetter((currentIndex + 1) % kannadaLetters.length)}
          className="px-6 py-2 bg-green-600 text-white rounded-lg"
        >
          Next ➡️
        </button>
      </div>

      {/* Result */}
      {prediction && (
        <p className="mt-4 text-2xl">
          {prediction === currentLetter ? "✅ Correct!" : `❌ Incorrect! You wrote: ${prediction}`}
        </p>
      )}
    </div>
  );
}

"use client";

import { useRef, useState, useEffect } from "react";
import confetti from "canvas-confetti";
import Link from "next/link";
import { FaHome } from "react-icons/fa";
import { allKannadaPronunciations } from "@/data/kannadaPronunciations";
import { getWrite2Level, updateWrite2Level } from "../../../lib/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

const auth = getAuth();

export default function Learn() {
  const router = useRouter();
  const canvasRef = useRef(null);
  const confettiCanvasRef = useRef(null);
  const measureCanvasRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prediction, setPrediction] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [feedbackType, setFeedbackType] = useState(null);
  const [canvasKey, setCanvasKey] = useState(0);
  const [write2level, setWrite2Level] = useState(1);
  const audioRef = useRef(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const correctAudioRef = useRef(null);
  const wrongAudioRef = useRef(null);
  const [shakeCanvas, setShakeCanvas] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [letterFontSize, setLetterFontSize] = useState(160);

  // Initialize canvas and fetch user data
  useEffect(() => {
    async function fetchWrite2Level(uid) {
      if (!uid) return;
      const level = await getWrite2Level(uid);
      setWrite2Level(level || 1);
      if(level==50)
        setCurrentIndex(0);
      else
        setCurrentIndex(level - 1 || 0);
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log(user);
        setInitialLoading(false);
        fetchWrite2Level(user.uid);
      } else {
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, []);

  // Calculate optimal font size for current letter
  useEffect(() => {
    calculateOptimalFontSize();
  }, [currentIndex]);

  const calculateOptimalFontSize = () => {
    if (!measureCanvasRef.current) return;

    const canvas = measureCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const letter = allKannadaPronunciations[currentIndex]?.letter || '';
    const containerWidth = 280; // 90% of 320px (original container width)

    // Start with a large font size
    let fontSize = 300;
    let textWidth;

    // Reduce font size until text fits within container
    do {
      ctx.font = `bold ${fontSize}px sans-serif`;
      textWidth = ctx.measureText(letter).width;
      fontSize -= 5;
      console.log(fontSize)
    } while (textWidth > containerWidth && fontSize > 50);
    setLetterFontSize(fontSize + 5); // Add back the last decrement
  };

  // Initialize canvas and make sure it's white
  useEffect(() => {
    if (canvasRef.current) {
      clearCanvas();
    }
  }, [canvasRef, canvasKey]);

  // Drawing functions
  const startDrawing = (e) => {
    e.preventDefault(); // Prevent default behavior like scrolling on touch

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const { offsetX, offsetY } = getCoordinates(e, canvas);

    setIsDrawing(true);

    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
  };

  const draw = (e) => {
    e.preventDefault(); // Prevent default behavior

    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const { offsetX, offsetY } = getCoordinates(e, canvas);

    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "black";

    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  // Get coordinates for both mouse and touch events
  const getCoordinates = (e, canvas) => {
    let offsetX, offsetY;
    const rect = canvas.getBoundingClientRect();

    if (e.type.includes('touch')) {
      // Touch event
      offsetX = e.touches[0].clientX - rect.left;
      offsetY = e.touches[0].clientY - rect.top;
    } else {
      // Mouse event
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
    }

    // Scale coordinates if canvas display size differs from actual size
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      offsetX: offsetX * scaleX,
      offsetY: offsetY * scaleY
    };
  };

  // Clear canvas function
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    // Clear the entire canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fill with white background
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    setFeedback(null);
    setFeedbackType(null);
  };

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
    console.log(audioRef)
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  const sendDrawing = async () => {
    if (!canvasRef.current) return;
    setFeedback("Checking...");
    setFeedbackType("checking");
    try {
      // Check if canvas is empty by sampling pixels
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height).data;

      // Check if canvas has non-white pixels
      let hasDrawing = false;
      for (let i = 0; i < imageData.length; i += 4) {
        // If any pixel is not white (255,255,255)
        if (imageData[i] !== 255 || imageData[i + 1] !== 255 || imageData[i + 2] !== 255) {
          hasDrawing = true;
          break;
        }
      }

      if (!hasDrawing) {
        setFeedback("Please draw something first!!");
        setFeedbackType("error");
        return;
      }

      // Create a temporary canvas to ensure white background
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');

      // Fill with white background
      tempCtx.fillStyle = 'white';
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

      // Draw the original canvas content on top
      tempCtx.drawImage(canvas, 0, 0);

      const dataUrl = tempCanvas.toDataURL("image/png");
      const imageBase64 = dataUrl.split(",")[1];

      const response = await fetch("http://localhost:5000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageBase64 }),
      });

      if (!response.ok) throw new Error("Failed to get prediction");
      const data = await response.json();
      console.log("Prediction is :", data.prediction, "with accuracy :", data.accuracy, "%.");
      setPrediction(data.prediction || "Error");

      const auth = getAuth();
      const user = auth.currentUser;

      if (data.prediction === allKannadaPronunciations[currentIndex].letter) {
        setFeedback("Correct! Well done!");
        setFeedbackType("correct");
        playAudio(correctAudioRef);
        triggerConfetti();

        if (user) {
          const newLevel = Math.min(49, Math.max(write2level, currentIndex + 2));
          if (newLevel > write2level) {
            await updateWrite2Level(user.uid, newLevel);
            setWrite2Level(newLevel);
          }
        }
      } else {
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
    <div className={`min-h-screen bg-gradient-to-b from-black via-purple-900 to-black text-white p-6 relative ${shakeCanvas ? "animate-shake" : ""}`}>
      {/* Hidden canvas for measuring text width */}
      <canvas
        ref={measureCanvasRef}
        width={320}
        height={320}
        style={{ display: 'none' }}
      />

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
                    ? "bg-gray-800 text-gray-300 hover:bg-gray-700 cursor-pointer"
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
          <p>Completed levels: {write2level -1}/{allKannadaPronunciations.length}</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-stretch justify-center mb-8">
          <div className="bg-gray-900 rounded-xl shadow-xl p-6 flex flex-col items-center border border-purple-800 w-full md:w-1/2 min-h-[520px]">
            <h2 className="text-gray-300 text-xl mb-4">Original Letter</h2>
            <div className="h-80 w-80 flex items-center justify-center border-2 border-purple-800 rounded-lg bg-gray-900">
              <span
                className="font-bold text-white-400"
                style={{ fontSize: `${letterFontSize}px` }}
              >
                {allKannadaPronunciations[currentIndex].letter}
              </span>
            </div>
            <button onClick={() => playAudio(audioRef)} className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition cursor-pointer">🔊 Play Pronunciation</button>
            <audio ref={audioRef} src={allKannadaPronunciations[currentIndex].audioSrc} />
            <p className="mt-4 text-gray-400">Pronunciation: {allKannadaPronunciations[currentIndex].pronunciation}</p>
          </div>

          <div className={`bg-gray-900 rounded-xl shadow-xl p-6 border border-purple-800 w-full md:w-1/2 min-h-[520px] flex flex-col items-center ${shakeCanvas ? "animate-shake" : ""}`}>
            <h2 className="text-gray-300 text-xl mb-4">Trace Here</h2>
            <div className="relative w-[320px] h-[320px] flex items-center justify-center">
              <div
                className="absolute inset-0 flex items-center justify-center text-gray-400 opacity-20 pointer-events-none select-none font-bold"
                style={{ fontSize: `${letterFontSize * 1}px` }}
              >
                {allKannadaPronunciations[currentIndex].letter}
              </div>
              <canvas
                key={canvasKey}
                ref={canvasRef}
                width={320}
                height={320}
                style={{ background: "white" }}
                className="border-2 border-purple-800 rounded-lg shadow-md touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                onTouchCancel={stopDrawing}
              />
            </div>
            <div className="mt-4 w-full flex flex-col flex-grow">
              <div className="flex gap-2 w-full">
                <button onClick={sendDrawing} className="cursor-pointer flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Check</button>
                <button onClick={clearCanvas} className="cursor-pointer flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">Clear</button>
              </div>
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
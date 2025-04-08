"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { auth } from "../../../lib/firebase";
import { FaHome, FaTrophy, FaChartLine, FaEdit, FaPuzzlePiece, FaGamepad } from "react-icons/fa";
import Link from "next/link";

export default function ProfilePage() {
    const router = useRouter();
    const db = getFirestore();
    const [user, setUser] = useState(null);
    const [userStats, setUserStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                fetchUserStats(currentUser.uid);
            } else {
                router.push("/");
            }
        });

        return () => unsubscribe();
    }, [router]);

    const fetchUserStats = async (uid) => {
        try {
            const userRef = doc(db, "users", uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                setUserStats(userSnap.data());
            }
            setLoading(false);
        } catch (error) {
            console.error("Error fetching user stats:", error);
            setLoading(false);
        }
    };

    const calculateAverageScore = (scores) => {
        if (!scores || scores.length === 0) return 0;
        return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
    };

    const getHighestScore = (scores) => {
        if (!scores || scores.length === 0) return 0;
        return Math.max(...scores);
    };

    const getTotalGamesPlayed = (stats) => {
        if (!stats) return 0;

        const memoryGamesPlayed = stats.memoryGameScores?.length || 0;
        const matchGamesPlayed = stats.matchGameScores?.length || 0;
        return memoryGamesPlayed + matchGamesPlayed;
    };

    const Write2levelchart = () => {
        const percentage = Math.min(100, ((userStats.write2level || 0) / 49) * 100);
        const displayPercentage = percentage.toFixed(0);

        // SVG dimensions
        const size = 120;
        const center = size / 2;
        const radius = size * 0.4;
        const strokeWidth = size * 0.1;

        // Calculate the circle properties
        const circumference = 2 * Math.PI * radius;
        const strokeDashoffset = circumference - (percentage / 100) * circumference;

        return (
            <div className="flex flex-col items-center">
                <div className="relative flex items-center justify-center">
                    {/* Background circle */}
                    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                        <circle
                            cx={center}
                            cy={center}
                            r={radius}
                            fill="transparent"
                            stroke="#374151" // gray-700
                            strokeWidth={strokeWidth}
                        />

                        {/* Progress circle */}
                        <circle
                            cx={center}
                            cy={center}
                            r={radius}
                            fill="transparent"
                            stroke="url(#blueGradient)"
                            strokeWidth={strokeWidth}
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            transform={`rotate(-90 ${center} ${center})`}
                        />

                        {/* Define the gradient */}
                        <defs>
                            <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#3B82F6" /> {/* blue-500 */}
                                <stop offset="100%" stopColor="#1D4ED8" /> {/* blue-700 */}
                            </linearGradient>
                        </defs>
                    </svg>

                    {/* Percentage text in the middle */}
                    <div className="absolute flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold">{displayPercentage}%</span>
                    </div>
                </div>

                {/* Label */}
                <div className="mt-2 text-sm">
                    Write2Level
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-black via-purple-950 to-black text-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
                    <h2 className="text-xl font-semibold text-purple-200">Loading profile...</h2>
                    <p className="text-purple-400 mt-2">Please wait while we retrieve your data</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-black via-purple-900 to-black text-white">
            {/* Navigation */}
            <header className="p-4 flex justify-between items-center">
                <Link href="/home" className="bg-purple-800 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105">
                    <FaHome className="text-xl" />
                </Link>
                <h1 className="text-3xl md:text-4xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                    My Kannada Profile
                </h1>
                <div className="w-10"></div>
            </header>
            {/* Profile Summary */}
            <section className="max-w-5xl mx-auto p-6">
                <div className="bg-gray-900/70 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-purple-500/50">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="bg-gradient-to-br from-purple-600 to-blue-500 w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center text-4xl md:text-5xl shadow-lg">
                            {userStats?.name?.charAt(0) || user?.email?.charAt(0) || "?"}
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-2xl md:text-3xl font-bold mb-2">
                                {userStats?.name || user?.displayName || user?.email?.split('@')[0] || "Kannada Learner"}
                            </h2>
                            <p className="text-purple-300">User ID: {userStats?.name}</p>

                            <div className="mt-4 grid grid-cols-3 gap-4">
                                <div className="bg-purple-800/50 p-3 rounded-lg text-center">
                                    <p className="text-sm text-purple-300">Write2Level</p>
                                    <p className="text-xl font-bold">{userStats?.write2level || 0}</p>
                                </div>
                                <div className="bg-purple-800/50 p-3 rounded-lg text-center">
                                    <p className="text-sm text-purple-300">Best Matching Game</p>
                                    <p className="text-xl font-bold">{getHighestScore(userStats?.matchGameScores || [])}</p>
                                </div>
                                <div className="bg-purple-800/50 p-3 rounded-lg text-center">
                                    <p className="text-sm text-purple-300">Best Memory Game</p>
                                    <p className="text-xl font-bold">
                                        {getHighestScore(userStats?.memoryGameScores || [])}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Tabs Navigation */}
            <section className="max-w-5xl mx-auto px-6">
                <div className="flex overflow-x-auto pb-2 mt-4 mb-6">
                    <button
                        onClick={() => setActiveTab("overview")}
                        className={`px-4 py-2 mx-1 rounded-t-lg font-semibold whitespace-nowrap border-b-2 flex items-center gap-2
              ${activeTab === "overview" ?
                                "border-yellow-400 text-yellow-400" :
                                "border-transparent text-gray-400 hover:text-white"}`}
                    >
                        <FaChartLine /> Overview
                    </button>
                    <button
                        onClick={() => setActiveTab("writing")}
                        className={`px-4 py-2 mx-1 rounded-t-lg font-semibold whitespace-nowrap border-b-2 flex items-center gap-2
              ${activeTab === "writing" ?
                                "border-yellow-400 text-yellow-400" :
                                "border-transparent text-gray-400 hover:text-white"}`}
                    >
                        <FaEdit /> Write2Level
                    </button>
                    <button
                        onClick={() => setActiveTab("matching")}
                        className={`px-4 py-2 mx-1 rounded-t-lg font-semibold whitespace-nowrap border-b-2 flex items-center gap-2
              ${activeTab === "matching" ?
                                "border-yellow-400 text-yellow-400" :
                                "border-transparent text-gray-400 hover:text-white"}`}
                    >
                        <FaPuzzlePiece /> Matching Game
                    </button>
                    <button
                        onClick={() => setActiveTab("memory")}
                        className={`px-4 py-2 mx-1 rounded-t-lg font-semibold whitespace-nowrap border-b-2 flex items-center gap-2
              ${activeTab === "memory" ?
                                "border-yellow-400 text-yellow-400" :
                                "border-transparent text-gray-400 hover:text-white"}`}
                    >
                        <FaGamepad /> Memory Game
                    </button>
                </div>
            </section>

            {/* Tab Content */}
            <section className="max-w-5xl mx-auto px-6 pb-16">
                {activeTab === "overview" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Overall Progress */}
                        <div className="bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-purple-500/30">
                            <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
                                <FaTrophy className="text-yellow-400" /> Overall Progress
                            </h3>

                            <div className="space-y-4">
                                < Write2levelchart />
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Matching Game Mastery</span>
                                        <span>
                                            {userStats?.matchGameScores?.length ?
                                                `${Math.min(100, (getHighestScore(userStats?.matchGameScores || []))    ).toFixed(0)}%` :
                                                "0%"}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                                        <div
                                            className="bg-gradient-to-r from-green-500 to-green-700 h-2.5 rounded-full"
                                            style={{
                                                width: `${Math.min(100, (getHighestScore(userStats?.matchGameScores || []))).toFixed(0)}%`
                                            }}
                                        ></div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Memory Game Mastery</span>
                                        <span>
                                            {userStats?.memoryGameScores?.length ?
                                                `${Math.min(100, (getHighestScore(userStats?.memoryGameScores || []) / 60) * 100).toFixed(0)}%` :
                                                "0%"}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                                        <div
                                            className="bg-gradient-to-r from-red-500 to-red-700 h-2.5 rounded-full"
                                            style={{
                                                width: `${Math.min(100, (getHighestScore(userStats?.memoryGameScores || []) / 60) * 100).toFixed(0)}%`
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Achievement Summary */}
                        <div className="bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-purple-500/30">
                            <h3 className="text-xl font-bold mb-4">Achievements</h3>

                            <div className="space-y-4">
                                {[
                                    {
                                        name: "Writing Pioneer",
                                        desc: "Complete all 49 levels in Write2Level",
                                        unlocked: (userStats?.write2level || 0) == 49,
                                        progress: Math.min(100, ((userStats?.write2level || 0) / 49) * 100)
                                    },
                                    {
                                        name: "Sound Explorer",
                                        desc: "Complete your first Matching Game",
                                        unlocked: (userStats?.matchGameScores?.length || 0) > 0,
                                        progress: (userStats?.matchGameScores?.length || 0) > 0 ? 100 : 0
                                    },
                                    {
                                        name: "Memory Master",
                                        desc: "Score over 40 points in Memory Game",
                                        unlocked: (userStats?.memoryGameScores || []).some(score => score >= 40),
                                        progress: Math.min(100, (getHighestScore(userStats?.memoryGameScores || []) / 40) * 100)
                                    },
                                    {
                                        name: "Dedicated Learner",
                                        desc: "Play 14 games across all modes",
                                        unlocked: getTotalGamesPlayed(userStats) >= 14,
                                        progress: Math.min(100, (getTotalGamesPlayed(userStats) / 14) * 100)
                                    }
                                ].map((achievement, index) => (
                                    <div key={index} className={`flex items-center p-3 rounded-lg ${achievement.unlocked ? 'bg-purple-800/40' : 'bg-gray-700/40'}`}>
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg mr-3 ${achievement.unlocked ? 'bg-yellow-500 text-black' : 'bg-gray-600 text-gray-400'}`}>
                                            {achievement.unlocked ? '✓' : '?'}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className={`font-semibold ${achievement.unlocked ? 'text-white' : 'text-gray-400'}`}>{achievement.name}</h4>
                                            <p className="text-sm text-gray-400">{achievement.desc}</p>
                                            <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
                                                <div
                                                    className={`h-1.5 rounded-full ${achievement.unlocked ? 'bg-yellow-500' : 'bg-purple-700'}`}
                                                    style={{ width: `${achievement.progress}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "writing" && (
                    <div className="bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-purple-500/30">
                        <div className="flex flex-col md:flex-row items-center justify-between mb-6">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <FaEdit className="text-blue-400" /> Writing Progress
                            </h3>
                            <div className="bg-blue-900/60 px-4 py-2 rounded-lg mt-2 md:mt-0">
                                <span className="text-blue-300">Current Level:</span>
                                <span className="text-2xl font-bold ml-2">{userStats?.write2level || 0}</span>
                            </div>
                        </div>

                        <div className="relative pt-10">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-400 to-blue-600"
                                    style={{ width: `${Math.min(100, ((userStats?.write2level || 0) / 49) * 100)}%` }}
                                ></div>
                            </div>

                            {/* Level markers */}
                            <div className="grid grid-cols-4 gap-4 mt-8">
                                {[1, 15, 40, 49].map((level, index) => (
                                    <div key={index} className="text-center">
                                        <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center text-lg font-bold 
                      ${(userStats?.write2level || 0) >= level ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-400'}`}>
                                            {level}
                                        </div>
                                        <p className="mt-2 text-sm">
                                            {index === 0 ? "Beginner" :
                                                index === 1 ? "Vowels" :
                                                    index === 2 ? "Basic Consonants" : "Master"}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 bg-gray-900/60 p-4 rounded-lg">
                                <h4 className="font-semibold mb-2">Writing Tips:</h4>
                                <ul className="list-disc pl-5 space-y-2 text-gray-300">
                                    <li>Practice each letter multiple times to build muscle memory</li>
                                    <li>Focus on the stroke order for better letter formation</li>
                                    <li>Spend at least 15 minutes daily on writing practice</li>
                                    <li>Try to connect letters to form simple words as you advance</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "matching" && (
                    <div className="bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-purple-500/30">
                        <div className="flex flex-col md:flex-row items-center justify-between mb-6">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <FaPuzzlePiece className="text-green-400" /> Matching Game Stats
                            </h3>
                            <div className="bg-green-900/60 px-4 py-2 rounded-lg mt-2 md:mt-0">
                                <span className="text-green-300">Best Score:</span>
                                <span className="text-2xl font-bold ml-2">{getHighestScore(userStats?.matchGameScores || [])}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Score History */}
                            <div>
                                <h4 className="font-semibold mb-3 text-green-300">Score History</h4>
                                {userStats?.matchGameScores?.length > 0 ? (
                                    // <div className="bg-gray-900/60 rounded-lg overflow-hidden">
                                    //     <ul className="divide-y divide-gray-700">
                                    //         {[...(userStats.matchGameScores || [])].reverse().map((score, index) => (
                                    //             <li key={index} className="p-3 flex justify-between items-center">
                                    //                 <span>Game {userStats.matchGameScores.length - index}</span>
                                    //                 <span className="font-semibold">{score} pts</span>
                                    //             </li>
                                    //         ))}
                                    //     </ul>
                                    // </div>
                                    <div className="bg-gray-900/60 rounded-lg overflow-hidden">
                                        <ul className="divide-y divide-gray-700">
                                            {[...(userStats.matchGameScores || [])]
                                                .sort((a, b) => b - a) // sort in descending order
                                                .slice(0, 3) // take top 3
                                                .map((score, index) => (
                                                    <li key={index} className="p-3 flex justify-between items-center">
                                                        <span>{index + 1}. </span>
                                                        <span className="font-semibold">{score} pts</span>
                                                    </li>
                                                ))}
                                        </ul>
                                    </div>
                                ) : (
                                    <div className="bg-gray-900/60 p-4 rounded-lg text-center text-gray-400">
                                        <p>No matching games played yet</p>
                                        <button
                                            onClick={() => router.push('/match')}
                                            className="mt-3 px-4 py-2 bg-green-700 hover:bg-green-600 rounded-lg transition-colors cursor-pointer"
                                        >
                                            Play now
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Performance */}
                            <div>
                                <h4 className="font-semibold mb-3 text-green-300">Your Performance</h4>
                                <div className="bg-gray-900/60 p-4 rounded-lg">
                                    <div className="space-y-3">
                                        <div>
                                            <div className="flex justify-between mb-1">
                                                <span>Games Played [Last 7]</span>
                                                <span>{userStats?.matchGameScores?.length || 0}</span>
                                            </div>
                                            <div className="w-full bg-gray-700 rounded-full h-2">
                                                <div
                                                    className="bg-green-600 h-2 rounded-full"
                                                    style={{ width: `${Math.min(100, ((userStats?.matchGameScores?.length || 0) / 7) * 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between mb-1">
                                                <span>Average Score</span>
                                                <span>{calculateAverageScore(userStats?.matchGameScores || [])}</span>
                                            </div>
                                            <div className="w-full bg-gray-700 rounded-full h-2">
                                                <div
                                                    className="bg-green-600 h-2 rounded-full"
                                                    style={{ width: `${Math.min(100, (calculateAverageScore(userStats?.matchGameScores || []) / 50) * 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        <div className="mt-4 text-center">
                                            {userStats?.matchGameScores?.length > 0 ? (
                                                <div className="text-sm text-gray-400">
                                                    You're making good progress! Keep practicing to improve your score.
                                                </div>
                                            ) : (
                                                <div className="text-sm text-gray-400">
                                                    Start playing to see your performance stats!
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6">

                        <button
                            onClick={() => router.push('/match')}
                            className="w-full py-3 bg-green-700 hover:bg-green-600 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <FaGamepad /> Play Matching Game
                        </button>
                        </div>
                    </div>
                )}

                {activeTab === "memory" && (
                    <div className="bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-purple-500/30">
                        <div className="flex flex-col md:flex-row items-center justify-between mb-6">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <FaGamepad className="text-red-400" /> Memory Game Stats
                            </h3>
                            <div className="bg-red-900/60 px-4 py-2 rounded-lg mt-2 md:mt-0">
                                <span className="text-red-300">Best Score:</span>
                                <span className="text-2xl font-bold ml-2">{getHighestScore(userStats?.memoryGameScores || [])}</span>
                            </div>
                        </div>

                        <div className="mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Score Chart */}
                                <div>
                                    <h4 className="font-semibold mb-3 text-red-300">Recent Scores</h4>
                                    <div className="bg-gray-900/60 p-4 rounded-lg min-h-40">
                                        {(userStats?.memoryGameScores?.length || 0) > 0 ? (
                                            <div className="h-40 flex items-end justify-around">
                                                {(userStats?.memoryGameScores || []).map((score, index) => (
                                                    <div key={index} className="flex flex-col items-center justify-end">
                                                        <div
                                                            className="w-6 bg-gradient-to-t from-red-600 to-red-400 rounded-t"
                                                            style={{
                                                                height: `${(score / 70) * 120}px`,
                                                            }}
                                                        ></div>
                                                        <div className="text-xs mt-1">{score}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="h-40 flex items-center justify-center text-gray-400">
                                                No memory games played yet
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Stats */}
                                <div>
                                    <h4 className="font-semibold mb-3 text-red-300">Game Statistics</h4>
                                    <div className="space-y-4">
                                        <div className="bg-gray-900/60 p-4 rounded-lg flex items-center justify-between">
                                            <div>
                                                <span className="text-gray-400">Games Played</span>
                                                <div className="text-2xl font-bold">{userStats?.memoryGameScores?.length || 0}</div>
                                            </div>
                                            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-red-900/60">
                                                <FaGamepad className="text-xl text-red-300" />
                                            </div>
                                        </div>

                                        <div className="bg-gray-900/60 p-4 rounded-lg flex items-center justify-between">
                                            <div>
                                                <span className="text-gray-400">Average Score</span>
                                                <div className="text-2xl font-bold">{calculateAverageScore(userStats?.memoryGameScores || [])}</div>
                                            </div>
                                            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-red-900/60">
                                                <FaTrophy className="text-xl text-red-300" />
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                            <div className="mt-6">
                                <button
                                    onClick={() => router.push('/memory')}
                                    className="w-full py-3 bg-red-700 hover:bg-red-600 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <FaGamepad /> Play Memory Game
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}
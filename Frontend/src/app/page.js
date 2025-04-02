"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isRegistering, setIsRegistering] = useState(false);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                router.push("/home");
            } else {
                // Once we confirm user is not logged in, stop showing initial loading
                setInitialLoading(false);
            }
        });
        return () => unsubscribe();
    }, [router]);

    const handleLogin = async () => {
        setError(null);
        setIsLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push("/home");
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    const handleRegister = async () => {
        setError(null);
        if (password !== confirmPassword) {
            setError("Passwords do not match!");
            return;
        }

        setIsLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const userDetailsRef = doc(db, "users", user.uid);
            await setDoc(userDetailsRef, {
                name: name,
                matchGameScores: [],
                memoryGameScores: [],
                write2level: 1
            });

            router.push("/home");
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
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
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-black via-purple-950 to-black text-white">
            <div className="relative bg-black bg-opacity-60 p-8 rounded-xl shadow-2xl shadow-purple-900/30 w-96 text-center border border-purple-800/30 backdrop-blur-sm">
                {/* Decorative elements */}
                <div className="absolute -top-6 -left-6 w-12 h-12 rounded-full bg-purple-600 opacity-20 blur-lg"></div>
                <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-purple-500 opacity-20 blur-xl"></div>

                <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                    {isRegistering ? "Register" : "Login"}
                </h1>

                {isRegistering && (
                    <input
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={isLoading}
                        className="w-full p-3 mb-4 rounded-lg bg-black bg-opacity-70 text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-500 focus:outline-none border border-purple-700/50 disabled:opacity-70"
                    />
                )}

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="w-full p-3 mb-4 rounded-lg bg-black bg-opacity-70 text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-500 focus:outline-none border border-purple-700/50 disabled:opacity-70"
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="w-full p-3 mb-4 rounded-lg bg-black bg-opacity-70 text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-500 focus:outline-none border border-purple-700/50 disabled:opacity-70"
                />

                {isRegistering && (
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isLoading}
                        className="w-full p-3 mb-4 rounded-lg bg-black bg-opacity-70 text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-500 focus:outline-none border border-purple-700/50 disabled:opacity-70"
                    />
                )}

                {error && <p className="text-red-400 mb-4 text-sm">{error}</p>}

                {isRegistering ? (
                    <button
                        onClick={handleRegister}
                        disabled={isLoading}
                        className={`cursor-pointer w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white font-semibold py-3 rounded-lg transition duration-200 ${isLoading ? 'opacity-70' : ''}`}
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center">
                                <div className="animate-spin h-5 w-5 border-t-2 border-b-2 border-white rounded-full mr-2"></div>
                                <span>Creating account...</span>
                            </div>
                        ) : (
                            "Register"
                        )}
                    </button>
                ) : (
                    <button
                        onClick={handleLogin}
                        disabled={isLoading}
                        className={`cursor-pointer w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white font-semibold py-3 rounded-lg transition duration-200 ${isLoading ? 'opacity-70' : ''}`}
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center">
                                <div className="animate-spin h-5 w-5 border-t-2 border-b-2 border-white rounded-full mr-2"></div>
                                <span>Signing in...</span>
                            </div>
                        ) : (
                            "Login"
                        )}
                    </button>
                )}

                <button
                    onClick={() => {
                        if (!isLoading) {
                            setIsRegistering(!isRegistering);
                            setError(null);
                        }
                    }}
                    className={`w-full text-purple-400 mt-4 hover:text-purple-300 hover:underline ${isLoading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'} transition duration-200`}
                    disabled={isLoading}
                >
                    {isRegistering ? "Already have an account? Login" : "Don't have an account? Register"}
                </button>
            </div>
        </div>
    );
}